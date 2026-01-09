import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const execAsync = promisify(exec);

const channelsPath = path.resolve(__dirname, '../src/data/channels.js');

const url = process.argv[2];

if (!url) {
    console.error('❌ Usage: npm run add-channel <youtube_url>');
    process.exit(1);
}

async function addChannel() {
    console.log(`🔍 Fetching metadata for: ${url}...`);

    try {
        // 1. Fetch Metadata
        const { stdout } = await execAsync(`yt-dlp --print "%(id)s::%(channel)s::%(is_live)s" --flat-playlist "${url}"`);
        const [videoId, channelName, isLive] = stdout.trim().split('::');

        if (!videoId) {
            console.error('❌ Could not extract Video ID.');
            return;
        }

        console.log(`   ✅ Found: ${channelName} (ID: ${videoId})`);

        if (isLive !== 'True') {
            console.warn('   ⚠️  Warning: This channel does not appear to be LIVE right now.');
            // We can still add it, but warn user.
        }

        // 2. Fetch Logo
        console.log('   ...Fetching logo...');
        const watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const { stdout: pageHtml } = await execAsync(`curl -s -L -A "Mozilla/5.0" "${watchUrl}"`, { maxBuffer: 10 * 1024 * 1024 });

        let logoUrl = "";
        const ownerAvatarRegex = /"videoOwnerRenderer":[\s\S]*?"thumbnails":\[\{\s*"url":\s*"(https:\/\/yt3\.ggpht\.com\/[^"]+)"/;
        const match = pageHtml.match(ownerAvatarRegex);

        if (match && match[1]) {
            logoUrl = match[1].replace(/=s[0-9]+-/, '=s900-').replace(/\\u0026/g, '&');
            console.log('   ✅ Found Logo');
        } else {
            console.warn('   ⚠️  Could not find logo. Using empty string.');
        }

        // 3. Read File and Calculate New ID
        let fileContent = fs.readFileSync(channelsPath, 'utf8');

        // Simple ID generation: Find max ID in file or start at 1
        let maxId = 0;
        const idRegex = /id:\s*(\d+)/g;
        let idMatch;
        while ((idMatch = idRegex.exec(fileContent)) !== null) {
            const id = parseInt(idMatch[1]);
            if (id > maxId) maxId = id;
        }
        const newId = maxId + 1;

        // 4. Construct New Channel Object
        const newChannel = {
            id: newId,
            name: channelName,
            videoId: videoId,
            channelUrl: url,
            category: "News", // Default
            description: `${channelName} Live`,
            logo: logoUrl
        };

        const newEntry = `
    {
        id: ${newChannel.id},
        name: "${newChannel.name}",
        videoId: "${newChannel.videoId}",
        channelUrl: "${newChannel.channelUrl}",
        category: "${newChannel.category}",
        description: "${newChannel.description}",
        logo: "${newChannel.logo}"
    }`;

        // 5. Insert into file
        // Find the closing bracket of the array `];`
        const lastBracketIndex = fileContent.lastIndexOf('];');
        if (lastBracketIndex === -1) {
            console.error('❌ Could not find closing bracket in channels.js');
            return;
        }

        // Check if there is a trailing comma before ];
        // If not, we need to add one to the previous item?
        // Let's just assume we insert a comma before our new item just in case, logic below:

        // Safest insert: Replace `];` with `,<newEntry>\n];`
        // But we need to check if the list was empty or ended cleanly.
        // Let's inspect the char before ];

        const insertPos = lastBracketIndex;
        // To be safe, add a comma to the previous element if we can, or just prepend comma to new entry
        // If list is empty `export const channels = [];`, we should just insert.
        // It's not empty, so prepending comma is safer.

        const contentToInsert = `,${newEntry}`;

        const newFileContent = fileContent.slice(0, insertPos) + contentToInsert + fileContent.slice(insertPos);

        fs.writeFileSync(channelsPath, newFileContent, 'utf8');
        console.log(`\n✨ Successfully added "${channelName}" (ID: ${newId}) to channels.js`);

    } catch (e) {
        console.error('❌ Error adding channel:', e);
    }
}

addChannel();
