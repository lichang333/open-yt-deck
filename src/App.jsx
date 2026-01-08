import React, { useState, useEffect, useCallback, useRef } from 'react';
import { channelStore } from './data/channelStore';
import Player from './components/Player';
import OSD from './components/OSD';
import ChannelManager from './components/ChannelManager';
import ProgramGuide from './components/ProgramGuide';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Settings } from 'lucide-react';

function App() {
  const [channels, setChannels] = useState(() => channelStore.getChannels());
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const [isOSDVisible, setIsOSDVisible] = useState(true);
  const [isManagerOpen, setIsManagerOpen] = useState(false);
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [guideSelectedIndex, setGuideSelectedIndex] = useState(0);
  const [isLiveStream, setIsLiveStream] = useState(true); // Default to true, update on metadata
  const [isMuted, setIsMuted] = useState(true);
  const osdTimeoutRef = useRef(null);
  const loadingTimeoutRef = useRef(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentChannel = channels[currentChannelIndex];

  const showOSD = useCallback(() => {
    setIsOSDVisible(true);
    if (osdTimeoutRef.current) clearTimeout(osdTimeoutRef.current);
    osdTimeoutRef.current = setTimeout(() => {
      setIsOSDVisible(false);
    }, 4000); // Hide after 4 seconds
  }, []);

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, []);

  const changeChannel = useCallback((direction) => {
    setError(null); // Reset error on channel change
    setIsLoading(true); // Show loading indicator
    setIsLiveStream(true); // Default to true (Optimistic Live)

    // Clear existing loading timeout
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);

    // Set absolute timeout for loading state
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn("Loading timed out - Forcing display");
      setIsLoading(false);
    }, 5000);

    setCurrentChannelIndex((prev) => {
      let next = prev + direction;
      if (next < 0) next = channels.length - 1;
      if (next >= channels.length) next = 0;
      return next;
    });
    showOSD();
  }, [showOSD]);

  const jumpToChannel = useCallback((index) => {
    if (index < 0 || index >= channels.length || index === currentChannelIndex) return;

    setError(null);
    setIsLoading(true);
    setIsLiveStream(true); // Default to true (Optimistic Live)

    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn("Loading timed out - Forcing display");
      setIsLoading(false);
    }, 5000);

    setCurrentChannelIndex(index);
    showOSD();
  }, [currentChannelIndex, showOSD]);

  const handlePlayerError = (e) => {
    console.error('Player Error', e);
    setError("Signal Lost / Stream Offline");
    setIsLoading(false);
    showOSD();
  };

  const handleBuffer = () => {
    setIsLoading(true);
    // Clear existing loading timeout
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);

    // Set absolute timeout for loading state
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn("Buffering timed out - Forcing display");
      setIsLoading(false);
    }, 5000);
  };

  const handleBufferEnd = () => {
    setIsLoading(false);
    if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
  };

  const handleDuration = (duration) => {
    // If duration is Infinity, it's a live stream.
    setIsLiveStream(duration === Infinity);
  };

  // Handle Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e) => {
      // If Guide is Open, intercept navigation keys
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
            setIsGuideOpen(false);
            break;
          default:
            break;
        }
        showOSD(); // Keep OSD awake while browsing
        return; // Stop processing other keys
      }

      // Normal Mode Keys
      // Number keys 1-9
      if (e.key >= '1' && e.key <= '9') {
        const index = parseInt(e.key, 10) - 1;
        jumpToChannel(index);
        return;
      }

      switch (e.key) {
        case 'ArrowUp':
          changeChannel(-1); // Up = Previous
          break;
        case 'ArrowRight':
          changeChannel(1);
          break;
        case 'ArrowDown':
          changeChannel(1); // Down = Next
          break;
        case 'ArrowLeft':
          changeChannel(-1);
          break;
        case 'm':
        case 'M':
          setIsMuted(prev => !prev);
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
          setGuideSelectedIndex(currentChannelIndex); // Sync selection to current channel when opening
          setIsGuideOpen(true);
          showOSD();
          break;
        case 'Escape':
          setIsManagerOpen(false);
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeChannel, showOSD, jumpToChannel, isGuideOpen, guideSelectedIndex, channels, setIsGuideOpen, currentChannelIndex, toggleFullScreen]);

  // Listen for channel updates
  useEffect(() => {
    const handleChannelUpdate = () => {
      setChannels(channelStore.getChannels());
      // Ensure current index is still valid
      setCurrentChannelIndex(prev => {
        const newChannels = channelStore.getChannels();
        if (prev >= newChannels.length) return 0;
        return prev;
      });
    };

    window.addEventListener('channel-update', handleChannelUpdate);
    return () => window.removeEventListener('channel-update', handleChannelUpdate);
  }, []);

  // Show OSD on initial load
  useEffect(() => {
    showOSD();
    return () => {
      if (osdTimeoutRef.current) clearTimeout(osdTimeoutRef.current);
    };
  }, [showOSD]);

  return (
    <div
      className="w-screen h-screen bg-black overflow-hidden font-sans text-white select-none relative"
      onDoubleClick={toggleFullScreen}
      onClick={showOSD}
    >
      <Player
        // key removed to prevent unmounting and re-initializing the iframe
        videoId={currentChannel.videoId}
        isMuted={isMuted}
        onReady={() => console.log('Player Ready')}
        onError={handlePlayerError}
        onBuffer={handleBuffer}
        onBufferEnd={handleBufferEnd}
        onDuration={handleDuration}
      />

      <OSD
        channel={currentChannel}
        isVisible={isOSDVisible || !!error} // Always show OSD if there is an error
        isMuted={isMuted}
        isLive={isLiveStream}
        channelNumber={currentChannelIndex + 1}
        totalChannels={channels.length}
      />

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="bg-red-900/80 backdrop-blur-md px-8 py-6 rounded-2xl border border-red-500/30 flex flex-col items-center animate-pulse">
            <h3 className="text-3xl font-bold mb-2">⚠ CHECKSUM ERROR</h3>
            <p className="text-xl opacity-80">{error}</p>
            <p className="text-sm mt-4 opacity-60">Try switching channels</p>
          </div>
        </div>
      )}

      {/* Loading Indicator - Click to dismiss */}
      {isLoading && !error && (
        <div
          className="absolute inset-0 flex items-center justify-center z-10 cursor-pointer"
          onClick={() => setIsLoading(false)}
          title="Click to clear loading overlay"
        >
          <div className="flex flex-col items-center gap-4 pointer-events-none">
            <div className="w-12 h-12 border-4 border-white/20 border-t-white/90 rounded-full animate-spin"></div>
            <div className="text-white/80 font-mono tracking-widest text-sm animate-pulse">BUFFERING...</div>
          </div>
        </div>
      )}

      {/* Channel Manager Overlay */}
      {isManagerOpen && (
        <ChannelManager onClose={() => setIsManagerOpen(false)} />
      )}

      {/* Program Guide Overlay */}
      <ProgramGuide
        isOpen={isGuideOpen}
        channels={channels}
        selectedIndex={guideSelectedIndex} // Use local guide selection
        playingIndex={currentChannelIndex}
        onSelect={(index) => {
          jumpToChannel(index);
          setIsGuideOpen(false);
        }}
        onClose={() => setIsGuideOpen(false)}
      />

      {/* Help Hint - Compact Vertical HUD */}
      <div
        className={`
          absolute top-32 right-16 z-50 
          bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl rounded-xl p-4
          transform transition-all duration-500 origin-top-right
          ${isOSDVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}
        `}
      >
        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[10px] uppercase font-bold tracking-wider text-white/70">

          {/* Col 1: Navigation */}
          <div className="flex items-center gap-2 group">
            <div className="flex gap-0.5">
              <kbd className="bg-white/10 px-1.5 py-1 rounded text-white min-w-[20px] text-center border border-white/5">↑</kbd>
              <kbd className="bg-white/10 px-1.5 py-1 rounded text-white min-w-[20px] text-center border border-white/5">↓</kbd>
            </div>
            <span>Navigate</span>
          </div>

          {/* Col 2: Select */}
          <div className="flex items-center gap-2 group">
            <kbd className="bg-white/10 px-2 py-1 rounded text-white border border-white/5">↵</kbd>
            <span>Select</span>
          </div>

          {/* Col 1: Guide */}
          <div className="flex items-center gap-2 group">
            <kbd className="bg-white/10 px-2 py-1 rounded text-white min-w-[24px] text-center border border-white/5">G</kbd>
            <span>Guide</span>
          </div>

          {/* Col 2: Info */}
          <div className="flex items-center gap-2 group">
            <kbd className="bg-white/10 px-2 py-1 rounded text-white border border-white/5">SPC</kbd>
            <span>Info</span>
          </div>

          {/* Col 1: Volume */}
          <div className="flex items-center gap-2 group">
            <kbd className="bg-white/10 px-2 py-1 rounded text-white min-w-[24px] text-center border border-white/5">M</kbd>
            <span>Mute</span>
          </div>

          {/* Col 2: Fullscreen */}
          <div className="flex items-center gap-2 group">
            <kbd className="bg-white/10 px-2 py-1 rounded text-white min-w-[24px] text-center border border-white/5">F</kbd>
            <span>Full</span>
          </div>

        </div>

        {/* Hidden Settings Trigger (Accessible via mouse hover/click area if needed, but keeping visual noise low) */}
        <div
          className="absolute -top-2 -right-2 w-6 h-6 bg-white/5 hover:bg-white/20 rounded-full flex items-center justify-center cursor-pointer transition-colors"
          onClick={() => setIsManagerOpen(true)}
          title="Settings"
        >
          <Settings size={12} className="text-white/50" />
        </div>
      </div>
    </div>
  );
}

export default App;
