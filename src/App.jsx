import React, { useState, useEffect, useCallback, useRef } from 'react';
import { channels } from './data/channels';
import Player from './components/Player';
import OSD from './components/OSD';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';


function App() {
  const [currentChannelIndex, setCurrentChannelIndex] = useState(0);
  const [isOSDVisible, setIsOSDVisible] = useState(true);
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

  // Handle Keyboard Input
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch (e.key) {
        case 'ArrowUp':
        case 'ArrowRight':
          changeChannel(1);
          break;
        case 'ArrowDown':
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
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [changeChannel, showOSD]);

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
      />

      <OSD
        channel={currentChannel}
        isVisible={isOSDVisible || !!error} // Always show OSD if there is an error
        isMuted={isMuted}
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

      {/* Help Hint */}
      <div className={`absolute bottom-12 right-12 bg-black/90 backdrop-blur-2xl px-8 py-6 rounded-2xl border border-white/20 text-white shadow-2xl transition-all duration-500 ${isOSDVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'} flex flex-col items-center gap-6 ring-1 ring-white/10 z-50`}>

        {/* Top Section: Navigation */}
        <div className="flex items-center gap-8">
          <span className="text-[11px] font-bold tracking-wider text-white/50 uppercase drop-shadow-sm">Navigation</span>

          <div className="flex flex-col gap-1.5 items-center">
            {/* Row 1: Up Arrow */}
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-white shadow-[0_2px_0_#999] text-black hover:translate-y-[2px] hover:shadow-none transition-all duration-150"><ArrowUp size={20} strokeWidth={3} /></div>

            {/* Row 2: Left, Down, Right */}
            <div className="flex gap-1.5">
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-white shadow-[0_2px_0_#999] text-black hover:translate-y-[2px] hover:shadow-none transition-all duration-150"><ArrowLeft size={20} strokeWidth={3} /></div>
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-white shadow-[0_2px_0_#999] text-black hover:translate-y-[2px] hover:shadow-none transition-all duration-150"><ArrowDown size={20} strokeWidth={3} /></div>
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-white shadow-[0_2px_0_#999] text-black hover:translate-y-[2px] hover:shadow-none transition-all duration-150"><ArrowRight size={20} strokeWidth={3} /></div>
            </div>
          </div>
        </div>

        {/* Horizontal Divider */}
        <div className="w-full h-px bg-white/10"></div>

        {/* Bottom Section: Actions */}
        <div className="flex items-center gap-8 w-full justify-between">

          {/* Mute */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-white shadow-[0_2px_0_#999] font-extrabold text-sm text-black hover:translate-y-[2px] hover:shadow-none transition-all duration-150">M</div>
            <span className="text-[11px] font-bold tracking-wider text-white/70 uppercase">Mute</span>
          </div>

          {/* Fullscreen */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-white shadow-[0_2px_0_#999] font-extrabold text-sm text-black hover:translate-y-[2px] hover:shadow-none transition-all duration-150">F</div>
            <span className="text-[11px] font-bold tracking-wider text-white/70 uppercase">Full</span>
          </div>

          {/* Info */}
          <div className="flex items-center gap-3">
            <div className="h-8 rounded-md flex items-center justify-center bg-white shadow-[0_2px_0_#999] font-extrabold text-xs px-3 text-black hover:translate-y-[2px] hover:shadow-none transition-all duration-150">Space</div>
            <span className="text-[11px] font-bold tracking-wider text-white/70 uppercase">Info</span>
          </div>
        </div>

      </div>
    </div>
  );
}

// End of component
export default App;
