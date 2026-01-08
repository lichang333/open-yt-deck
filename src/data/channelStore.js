import { channels as defaultChannels } from './channels';

const STORAGE_KEY = 'open-yt-deck-channels';

export const channelStore = {
    // Get channels from local storage or fall back to default
    getChannels: () => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                let channels = JSON.parse(stored);

                // HOTFIX: Fix CTV News (ID 12) Logo if it matches the old broken one
                const ctv = channels.find(c => c.id === 12);
                const brokenCtvLogo = "https://yt3.googleusercontent.com/F1QF1sUtJvIrLSb4VOuDBWxeizO_WupZOf_dV9LLn47rJDpNAl8irkfBwVOnHvnuLgLt-xjVGks=s900-c-k-c0x00ffffff-no-rj";

                // HOTFIX: Fix CNA (ID 11) Logo if it matches the old broken one
                const cna = channels.find(c => c.id === 11);
                const brokenCnaLogo = "https://yt3.googleusercontent.com/HajrUjhJTUZVTJhqsCkJxHocaB0R8TwxApCiOG6h_rgF6KyGwV6g2KMD6FTX_IMRGS8WPR4s=s900-c-k-c0x00ffffff-no-rj";

                let needsSave = false;

                if (ctv && ctv.logo === brokenCtvLogo) {
                    const defaultCtv = defaultChannels.find(c => c.id === 12);
                    if (defaultCtv) {
                        ctv.logo = defaultCtv.logo;
                        needsSave = true;
                    }
                }

                if (cna && cna.logo === brokenCnaLogo) {
                    const defaultCna = defaultChannels.find(c => c.id === 11);
                    if (defaultCna) {
                        cna.logo = defaultCna.logo;
                        needsSave = true;
                    }
                }

                if (needsSave) {
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
