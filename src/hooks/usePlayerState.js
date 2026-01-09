import { useState, useRef, useCallback, useEffect } from 'react';

export const usePlayerState = () => {
    const [isMuted, setIsMuted] = useState(true);
    const [isLiveStream, setIsLiveStream] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const loadingTimeoutRef = useRef(null);

    const resetPlayer = useCallback(() => {
        setError(null);
        setIsLoading(true);
        setIsLiveStream(true); // Optimistic Default

        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = setTimeout(() => {
            console.warn("Loading timed out - Forcing display");
            setIsLoading(false);
        }, 5000);
    }, []);

    const handlePlayerError = useCallback((e) => {
        console.error('Player Error', e);
        setError("Signal Lost / Stream Offline");
        setIsLoading(false);
    }, []);

    const handleBuffer = useCallback(() => {
        setIsLoading(true);
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = setTimeout(() => {
            console.warn("Buffering timed out - Forcing display");
            setIsLoading(false);
        }, 5000);
    }, []);

    const handleBufferEnd = useCallback(() => {
        setIsLoading(false);
        if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
    }, []);

    const handleDuration = useCallback((duration) => {
        setIsLiveStream(duration === Infinity);
    }, []);

    const toggleMute = useCallback(() => setIsMuted(prev => !prev), []);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (loadingTimeoutRef.current) clearTimeout(loadingTimeoutRef.current);
        };
    }, []);

    return {
        isMuted,
        isLiveStream,
        isLoading,
        error,
        resetPlayer,
        handlePlayerError,
        handleBuffer,
        handleBufferEnd,
        handleDuration,
        toggleMute,
        setIsLoading, // Explicit set if needed
        setError      // Explicit set if needed
    };
};
