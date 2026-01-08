import { channels as defaultChannels } from './channels';

const STORAGE_KEY = 'open-yt-deck-channels';

export const channelStore = {
    // Get channels from local storage or fall back to default
    getChannels: () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                let channels = JSON.parse(stored);
                let needsSave = false;

                // SYNC STRATEGY: 
                // The 'channels.js' file (defaultChannels) is treated as the source of truth for 
                // technical details like 'videoId' and 'logo', which might be updated by the CLI script.
                // We preserve user customizations (order, names) but update the stream connections.

                channels = channels.map(storedChannel => {
                    const fileChannel = defaultChannels.find(dc => dc.id === storedChannel.id);
                    if (fileChannel) {
                        let changed = false;

                        // Sync Video ID if file is different (assumes file is newer/more correct)
                        if (storedChannel.videoId !== fileChannel.videoId) {
                            storedChannel.videoId = fileChannel.videoId;
                            changed = true;
                        }

                        // Sync Logo if file is different
                        if (storedChannel.logo !== fileChannel.logo) {
                            storedChannel.logo = fileChannel.logo;
                            changed = true;
                        }

                        // Sync Channel URL if file is different
                        if (storedChannel.channelUrl !== fileChannel.channelUrl) {
                            storedChannel.channelUrl = fileChannel.channelUrl;
                            changed = true;
                        }

                        if (changed) needsSave = true;
                    }
                    return storedChannel;
                });

                if (needsSave) {
                    console.log('🔄 Synced channels with updated filesystem data');
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
                }

                return channels;
            }
        } catch (e) {
            console.error("Failed to load channels from localStorage", e);
        }
        return [...defaultChannels];
    },

    // Save channels to local storage
    saveChannels: (channels) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(channels));
            // Dispatch a custom event so other components can listen for updates
            window.dispatchEvent(new Event('channel-update'));
        } catch (e) {
            console.error("Failed to save channels to localStorage", e);
        }
    },

    // Reset to default channels
    resetChannels: () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
            window.dispatchEvent(new Event('channel-update'));
        } catch (e) {
            console.error("Failed to reset channels", e);
        }
        return [...defaultChannels];
    }
};
