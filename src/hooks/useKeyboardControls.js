import { useEffect } from 'react';

export const useKeyboardControls = ({
    isGuideOpen,
    setIsGuideOpen,
    isManagerOpen,
    setIsManagerOpen,
    guideSelectedIndex,
    setGuideSelectedIndex,
    channels,
    currentChannelIndex,
    actions: { nextChannel, prevChannel, jumpToChannel, toggleMute, toggleFullScreen, showOSD }
}) => {
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Priority: Manager Open (Limited Interactivity)
            if (isManagerOpen) {
                if (e.key === 'Escape') {
                    setIsManagerOpen(false);
                }
                return;
            }

            // Priority: Guide Open (Navigation Mode)
            if (isGuideOpen) {
                switch (e.key) {
                    case 'ArrowUp':
                        setGuideSelectedIndex(prev => {
                            const next = prev - 1;
                            return next < 0 ? channels.length - 1 : next;
                        });
                        break;
                    case 'ArrowDown':
                        setGuideSelectedIndex(prev => {
                            const next = prev + 1;
                            return next >= channels.length ? 0 : next;
                        });
                        break;
                    case 'Enter':
                    case ' ':
                        jumpToChannel(guideSelectedIndex);
                        setIsGuideOpen(false);
                        break;
                    case 'Escape':
                    case 'ArrowLeft':
                        setIsGuideOpen(false);
                        break;
                    case 'g':
                    case 'G':
                        setIsGuideOpen(false); // Toggle off
                        break;
                    default:
                        break;
                }
                showOSD(); // Keep OSD awake
                return;
            }

            // Priority: Normal Viewing Mode

            // Numeric Keys 1-9
            if (e.key >= '1' && e.key <= '9') {
                const targetIndex = parseInt(e.key, 10) - 1;
                jumpToChannel(targetIndex);
                showOSD();
                return;
            }

            // General Keys
            switch (e.key) {
                case 'ArrowUp':
                case 'ArrowLeft':
                    prevChannel();
                    showOSD();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                    nextChannel();
                    showOSD();
                    break;
                case 'm':
                case 'M':
                    toggleMute();
                    showOSD();
                    break;
                case 'Enter':
                case ' ':
                    showOSD();
                    break;
                case 'f':
                case 'F':
                    toggleFullScreen();
                    showOSD();
                    break;
                case 'g':
                case 'G':
                    setGuideSelectedIndex(currentChannelIndex); // Sync guide cursor to played channel
                    setIsGuideOpen(true);
                    showOSD();
                    break;
                case 's': // Secret helper for Settings
                case 'S':
                    setIsManagerOpen(true);
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [
        isGuideOpen,
        setIsGuideOpen,
        isManagerOpen,
        setIsManagerOpen,
        guideSelectedIndex,
        setGuideSelectedIndex,
        channels.length,
        currentChannelIndex,
        nextChannel,
        prevChannel,
        jumpToChannel,
        toggleMute,
        toggleFullScreen,
        showOSD
    ]);
};
