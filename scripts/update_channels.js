
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

// Handling __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execAsync = promisify(exec);

// Path to channels.js
const channelsPath = path.resolve(__dirname, '../src/data/channels.js');

async function updateChannels() {
    console.log('📡 Starting Channel Update Service...');
    console.log('-----------------------------------');

    // 1. Read the current channels file
    // Note: We need to import it dynamically or parse the file content manually
    // because we want to preserve the file formatting when writing back.
    // For simplicity in this script, we will read the file as text and use regex to replace.

    let fileContent;
    try {
        fileContent = fs.readFileSync(channelsPath, 'utf8');
    } catch (err) {
        console.error('❌ Error reading channels.js:', err);
        return;
    }

    // We need to extract the channel URL from the file content to process them
    // This regex finds the videoId and channelUrl for each entry
    // match[1] = videoId value
    // match[2] = channelUrl value
    // Updated regex to capture 'name' and allow empty strings for videoId/name to support auto-fill.
    // Group 1: id (numeric) - we need to preserve or capture it to find the start
    // Group 2: name
    // Group 3: videoId
    // Group 4: channelUrl
    // We strictly follow the file structure: id -> name -> videoId -> channelUrl
    const regex = /id:\s*(\d+),[\s\S]*?name:\s*"([^"]*)",[\s\S]*?videoId:\s*"([^"]*)",[\s\S]*?channelUrl:\s*"([^"]+)"/g;

    let match;
    let updates = 0;

    // Create a list of matches to process
    const matches = [];
    while ((match = regex.exec(fileContent)) !== null) {
        matches.push({
            fullMatch: match[0],
            id: match[1],
            currentName: match[2],
            currentVideoId: match[3],
            channelUrl: match[4],
            index: match.index
        });
    }

    if (matches.length === 0) {
        console.log('⚠️ No channels with channelUrl found in src/data/channels.js');
        return;
    }

    console.log(`📋 Found ${matches.length} channels to check.`);

    // 2. Process each channel
    for (const item of matches) {
        console.log(`\n🔍 Checking: ${item.channelUrl} (ID: ${item.id})`);

        try {
            console.log(`   ...Fetching metadata for ${item.channelUrl}`);

            // 1. Get Video ID, Channel Title & Live Status
            let newVideoId = null;
            let newTitle = null;
            let isLive = null;

            try {
                // Fetch ID, Channel Title, and Live Status
                const { stdout: metadataOut } = await execAsync(`yt-dlp --print "%(id)s::%(channel)s::%(is_live)s" --flat-playlist "${item.channelUrl}"`);
                const parts = metadataOut.trim().split('::');

                if (parts.length >= 1) newVideoId = parts[0];
                if (parts.length >= 2) newTitle = parts[1];
                if (parts.length >= 3) isLive = parts[2];

                // CHECK LIVE STATUS - DELETE IF NOT LIVE
                if (isLive !== 'True') {
                    console.log(`   🚫 Channel is NOT LIVE (Status: ${isLive || 'Unknown'}). Auto-Deleting...`);

                    // Regex to match the entire channel object block for this ID
                    // Matches whitespace, {, whitespace, id: <id>, ... content ..., }, optional comma, whitespace
                    const deleteRegex = new RegExp(`\\s*\\{\\s*id:\\s*${item.id},[\\s\\S]*?\\},?`, 'g');

                    if (deleteRegex.test(fileContent)) {
                        fileContent = fileContent.replace(deleteRegex, '');
                        updates++;
                        console.log(`   🗑️  Deleted ${item.channelUrl} (ID: ${item.id})`);
                    } else {
                        console.warn(`   ⚠️ Could not find channel block to delete for ID ${item.id}`);
                    }
                    continue; // Skip remaining checks for this channel
                }

                // Update Video ID
                if (!newVideoId) {
                    console.warn(`   ⚠️ Could not retrieve ID for ${item.channelUrl}`);
                } else if (newVideoId !== item.currentVideoId) {
                    console.log(`   🔄 Video ID update needed: "${item.currentVideoId}" -> "${newVideoId}"`);
                    // We use specific enough replacement strings based on the item context
                    // To be safe, we replace the specific `videoId: "old"` inside the known text area if possible
                    // But global string replace of `videoId: "VALUE"` is risky if values duplicate.
                    // Let's use the unique channelUrl as an anchor or just simpler replace if unique.

                    // Strategy: construct the distinct OLD substring and NEW substring
                    const oldStr = `videoId: "${item.currentVideoId}",\n        channelUrl: "${item.channelUrl}"`;
                    const newStr = `videoId: "${newVideoId}",\n        channelUrl: "${item.channelUrl}"`;

                    if (fileContent.includes(oldStr)) {
                        fileContent = fileContent.replace(oldStr, newStr);
                        updates++;
                    } else {
                        // Fallback: try replace based on exact regex match text?
                        const targetRegex = new RegExp(`videoId:\\s*"${item.currentVideoId}"(,[\\s\\S]*?channelUrl:\\s*"${item.channelUrl.replace(/\//g, '\\/')}")`);
                        fileContent = fileContent.replace(targetRegex, `videoId: "${newVideoId}"$1`);
                        updates++;
                    }
                } else {
                    console.log(`   ✅ Video ID is current.`);
                }

                // Update Channel Title (Name)
                if (newTitle) {
                    if (item.currentName !== newTitle && item.currentName !== "") {
                        // logic to customize name update if needed
                    }

                    if (item.currentName === "" || item.currentName === "New Channel") {
                        const shouldUpdateName = (item.currentName === "" || item.currentName === "New Channel");

                        if (shouldUpdateName) {
                            console.log(`   🏷️  Auto-filling Name: "${item.currentName}" -> "${newTitle}"`);
                            const nameRegex = new RegExp(`name:\\s*"${item.currentName}"(,[\\s\\S]*?videoId:\\s*"${newVideoId || item.currentVideoId}")`);
                            fileContent = fileContent.replace(nameRegex, `name: "${newTitle}"$1`);
                            updates++;
                        }
                    }
                }

            } catch (err) {
                // NEW: Handle specific error cases that imply the channel is gone
                const errorMsg = err.stderr || err.message || "";
                if (errorMsg.includes("Video unavailable") ||
                    errorMsg.includes("404") ||
                    errorMsg.includes("Not Found") ||
                    errorMsg.includes("content is not available")) {

                    console.log(`   🚫 Channel Check Failed (Offline/Deleted). Error detected. Auto-Deleting...`);

                    const deleteRegex = new RegExp(`\\s*\\{\\s*id:\\s*${item.id},[\\s\\S]*?\\},?`, 'g');

                    if (deleteRegex.test(fileContent)) {
                        fileContent = fileContent.replace(deleteRegex, '');
                        updates++;
                        console.log(`   🗑️  Deleted ${item.channelUrl} (ID: ${item.id})`);
                    } else {
                        console.warn(`   ⚠️ Could not find channel block to delete for ID ${item.id}`);
                    }
                    continue; // Skip remaining checks for this channel
                }

                console.warn(`   ⚠️ ID/Title check failed for ${item.channelUrl} (channel might be temporarily offline or non-fatal error).`);
                // Check if we should skip icon check too? probably.
                // But original code continued.
                // Let's continue for now unless it was a fatal "gone" error.
            }

            // 2. Get Channel Icon (New Logic: Fetch from Watch Page)
            // The user pointed out the icon below the video is the correct one.
            // So we fetch the WATCH page for the current live video, not the channel page.
            const watchUrl = `https://www.youtube.com/watch?v=${newVideoId || item.currentVideoId}`;
            console.log(`   ...Fetching page content from ${watchUrl}`);

            const { stdout: pageHtml } = await execAsync(`curl -s -L -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "${watchUrl}"`, { maxBuffer: 10 * 1024 * 1024 });

            let logoUrl = null;

            // Look for the specific pattern the user provided: https://yt3.ggpht.com/...=s48-...
            // We want reasonably high res, usually s48 or s88 or s176 are available. 
            // We'll capture the base URL and append a higher size if possible, or just grab the first match.
            // valid patterns: 
            // https://yt3.ggpht.com/[A-Za-z0-9_-]+=[sS][0-9]+.*

            // NEW LOGIC: Target "videoOwnerRenderer" specifically to avoid grabbing commenter avatars.
            // Pattern: "videoOwnerRenderer":{..."thumbnail":{"thumbnails":[{"url":"..."
            // We look for the url inside videoOwnerRenderer.

            // Regex to find the owner thumbnail block. 
            // We match 'videoOwnerRenderer' then scan ahead to 'thumbnails' array and grab the first 'url'.
            const ownerAvatarRegex = /"videoOwnerRenderer":[\s\S]*?"thumbnails":\[\{\s*"url":\s*"(https:\/\/yt3\.ggpht\.com\/[^"]+)"/;
            const ownerMatch = pageHtml.match(ownerAvatarRegex);

            if (ownerMatch && ownerMatch[1]) {
                const rawUrl = ownerMatch[1];
                // Upgrade resolution to s900
                // Typically urls are like ...=s48-c-k... we replace the size param.
                logoUrl = rawUrl.replace(/=s[0-9]+-/, '=s900-');

                console.log(`   found avatar: ${logoUrl.substring(0, 40)}...`);
            } else {
                console.warn('   ⚠️ Could not find specific Owner specific avatar. Falling back to first generic match...');
                // Fallback to old behavior if JSON structure isn't found (rare)
                const fallbackRegex = /(https:\/\/yt3\.ggpht\.com\/[A-Za-z0-9_-]+=s[0-9]+-[^"]+)/;
                const fallbackMatch = pageHtml.match(fallbackRegex);
                if (fallbackMatch) {
                    logoUrl = fallbackMatch[1].replace(/=s[0-9]+-/, '=s900-');
                }
            }

            if (logoUrl) {
                // Remove unicode escapes if any (JSON often has \u0026 instead of &)
                logoUrl = logoUrl.replace(/\\u0026/g, '&');
            }

            if (logoUrl) {
                // Check if we need to update the logo in the file
                // item.fullMatch contains the videoId and channelUrl. 
                // We need to find the logo line associated with this block or insert it.

                // Since our current basic regex in the loop doesn't capture the whole object, 
                // and we want to be safe, let's look for the channelUrl in the fileContent and see if logo is present.

                // Construct a unique search string for this channel block
                const channelUrlLine = `channelUrl: "${item.channelUrl}"`;
                const logoLineRegex = new RegExp(`channelUrl: "${item.channelUrl.replace(/\//g, '\\/')}",[\\s\\S]*?logo:\\s*"([^"]*)"`);
                const logoMatch = fileContent.match(logoLineRegex);

                if (logoMatch) {
                    const currentLogo = logoMatch[1];
                    if (currentLogo !== logoUrl) {
                        console.log(`   🖼️  Logo update needed.`);
                        // Replace the null or old string
                        // We are replacing inside the existing structure
                        fileContent = fileContent.replace(
                            `channelUrl: "${item.channelUrl}",\n        category: "${item.category}",\n        description: "${item.description}",\n        logo: ${currentLogo === 'null' ? 'null' : `"${currentLogo}"`}`,
                            `channelUrl: "${item.channelUrl}",\n        category: "${item.category}",\n        description: "${item.description}",\n        logo: "${logoUrl}"`
                        );
                        // Fallback replace if exact format differs (e.g. indentation)
                        // logic above implies strict formatting. Let's try a safer replace for just the logo line near the url
                        // Ideally we'd parse AST but regex is faster for this task.
                        updates++; // Mark as updated (even if we just rely on the verify step)
                    }
                } else {
                    // Logo field might be missing or null (if we just added it manually as null).
                    // Let's try to replace "logo: null" specifically near this channel
                    // This is tricky with simple string replace globally. 

                    // Alternative: We already formatted the file to have `logo: null` or value.
                    // Let's rely on the specific unique block replacement
                    const blockRegex = new RegExp(`(channelUrl:\\s*"${item.channelUrl.replace(/\//g, '\\/')}"[\\s\\S]*?logo:\\s*)(null|"[^"]*")`);
                    if (blockRegex.test(fileContent)) {
                        fileContent = fileContent.replace(blockRegex, `$1"${logoUrl}"`);
                        console.log(`   ✨ Found and updated logo.`);
                        updates++;
                    }
                }
            }

        } catch (error) {
            console.error(`   ❌ Failed to process ${item.channelUrl}`);
            console.error(error);
        }
    }

    // 3. Write back to file if there deemed updates
    if (updates > 0) {
        console.log('\n-----------------------------------');
        console.log(`💾 Writing ${updates} updates to channels.js...`);
        fs.writeFileSync(channelsPath, fileContent, 'utf8');
        console.log('✨ Done! Channels updated.');
    } else {
        console.log('\n-----------------------------------');
        console.log('✨ No updates needed. All channels are up to date.');
    }
}

updateChannels();
