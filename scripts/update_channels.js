
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
    // Updated regex to handle comments or extra text between videoId and channelUrl
    // match[1] = videoId
    // match[2] = channelUrl
    // Updated regex to capture enough context to find the logo field later
    // Updated regex to capture enough context to find the logo field later
    // We use [\s\S]*? to match any character (including newlines and comments) between fields non-greedily.
    const regex = /videoId:\s*"([^"]+)",[\s\S]*?channelUrl:\s*"([^"]+)",[\s\S]*?category:\s*"([^"]+)",[\s\S]*?description:\s*"([^"]+)"/g;

    let match;
    let updates = 0;

    // Create a list of matches to process
    const matches = [];
    while ((match = regex.exec(fileContent)) !== null) {
        matches.push({
            fullMatch: match[0],
            currentVideoId: match[1],
            channelUrl: match[2],
            category: match[3],
            description: match[4],
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
        console.log(`\n🔍 Checking: ${item.channelUrl}`);

        try {
            console.log(`   ...Fetching metadata for ${item.channelUrl}`);

            // 1. Get Video ID (existing logic)
            // Wrap in try-catch so we don't skip icon fetching if this fails
            try {
                const { stdout: videoIdOut } = await execAsync(`yt-dlp --print id --flat-playlist "${item.channelUrl}"`);
                const newVideoId = videoIdOut.trim();

                if (!newVideoId) {
                    console.warn(`   ⚠️ Could not retrieve ID for ${item.channelUrl}`);
                } else if (newVideoId !== item.currentVideoId) {
                    console.log(`   🔄 Video ID update needed: ${item.currentVideoId} -> ${newVideoId}`);
                    // Replace videoId in file content
                    fileContent = fileContent.replace(
                        `videoId: "${item.currentVideoId}"`,
                        `videoId: "${newVideoId}"`
                    );
                    updates++;
                } else {
                    console.log(`   ✅ Video ID is current.`);
                }
            } catch (err) {
                console.warn(`   ⚠️ ID check failed for ${item.channelUrl} (channel might be offline). Continuing to icon check...`);
            }

            // 2. Get Channel Icon (New Logic)
            // Use ROOT channel URL (remove /live, /streams) for better metadata fetching
            const rootChannelUrl = item.channelUrl.replace(/\/live$/, '').replace(/\/streams$/, '');
            console.log(`   ...Fetching page content from ${rootChannelUrl}`);

            // Increase buffer to 10MB to handle large YouTube pages
            const { stdout: pageHtml } = await execAsync(`curl -s -L -A "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "${rootChannelUrl}"`, { maxBuffer: 10 * 1024 * 1024 });

            // Try to find the avatar URL. 
            let logoUrl = null;

            // Regex to find generic Avatar images
            // We look for patterns like:
            // src="https://yt3.ggpht.com/..."
            // src="https://yt3.googleusercontent.com/..."
            // content="https://yt3.googleusercontent.com/..." (og:image)

            // Priority 1: og:image on the main channel page is usually the high-res avatar
            const ogImageMatch = pageHtml.match(/<meta property="og:image" content="([^"]+)"/);

            // Priority 2: Direct src match for known avatar domains
            const avatarMatch = pageHtml.match(/src="(https:\/\/(?:yt3\.ggpht\.com|yt3\.googleusercontent\.com)\/[^"]+)"/);

            if (ogImageMatch && ogImageMatch[1] && !ogImageMatch[1].includes('i.ytimg.com')) {
                logoUrl = ogImageMatch[1];
                console.log(`   found avatar via og:image: ${logoUrl.substring(0, 30)}...`);
            } else if (avatarMatch && avatarMatch[1]) {
                logoUrl = avatarMatch[1];
                console.log(`   found avatar via src match: ${logoUrl.substring(0, 30)}...`);
            }
            // If we still have an i.ytimg.com from og:image, we ignore it or use as last resort (but user specifically wants avatar)

            // Clean up: unescape any HTML entities if necessary (simple unescape)
            if (logoUrl) {
                logoUrl = logoUrl.replace(/&amp;/g, '&');
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
