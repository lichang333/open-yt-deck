import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { channelStore } from '../data/channelStore';

const ChannelContext = createContext();

export const useChannelContext = () => {
    const context = useContext(ChannelContext);
    if (!context) {
        throw new Error('useChannelContext must be used within a ChannelProvider');
    }
    return context;
};

export const ChannelProvider = ({ children }) => {
    const [allChannels, setAllChannels] = useState(() => channelStore.getChannels());
    const [channelStatuses, setChannelStatuses] = useState({});

    // We navigate based on the filtered list
    // If a channel is 'checking' or 'online' (or undefined initially), show it.
    // Only hide if explicitly 'offline'.
    const activeChannels = allChannels.filter(c => channelStatuses[c.id] !== 'offline');

    const [currentChannelIndex, setCurrentChannelIndex] = useState(0);

    // Initial Auto-Scan
    useEffect(() => {
        // Debounce slightly to allow initial render
        const timer = setTimeout(() => {
            checkAllChannels();
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Ensure current index remains valid if channels disappear
    useEffect(() => {
        if (currentChannelIndex >= activeChannels.length && activeChannels.length > 0) {
            setCurrentChannelIndex(0);
        } else if (activeChannels.length === 0 && currentChannelIndex !== 0) {
            setCurrentChannelIndex(0); // If all channels disappear, reset to 0
        }
    }, [activeChannels.length, currentChannelIndex]);

    // Sync with external updates (e.g. from ChannelManager if independent)
    // Or simpler: ChannelManager uses this Context to update, removed event listeners.
    // For backward compatibility / safety, we can keep the listener or just expose sync methods.

    const refreshChannels = useCallback(() => {
        const newChannels = channelStore.getChannels();
        setAllChannels(newChannels);
        // Reset statuses on full refresh? Or keep them?
        // Let's keep them attached by ID, so no need to clear map.
    }, []);

    const saveChannels = useCallback((newChannels) => {
        channelStore.saveChannels(newChannels);
        refreshChannels();
    }, [refreshChannels]);

    const resetChannels = useCallback(() => {
        channelStore.resetChannels();
        refreshChannels();
        setChannelStatuses({}); // Reset status on full reset
    }, [refreshChannels]);

    const checkChannelHealth = useCallback(async (channel) => {
        // Don't check if already checking?
        setChannelStatuses(prev => ({ ...prev, [channel.id]: 'checking' }));
        try {
            const url = `https://www.youtube.com/watch?v=${channel.videoId}`;
            const res = await fetch(`https://noembed.com/embed?url=${encodeURIComponent(url)}`);
            const data = await res.json();

            if (data.error) {
                setChannelStatuses(prev => ({ ...prev, [channel.id]: 'offline' }));
            } else {
                setChannelStatuses(prev => ({ ...prev, [channel.id]: 'online' }));
            }
        } catch (e) {
            setChannelStatuses(prev => ({ ...prev, [channel.id]: 'offline' }));
        }
    }, []);

    const checkAllChannels = useCallback(() => {
        allChannels.forEach(channel => {
            checkChannelHealth(channel);
        });
    }, [allChannels, checkChannelHealth]);

    const checkIndex = useCallback((index, length) => {
        if (length === 0) return 0;
        if (index < 0) return length - 1;
        if (index >= length) return 0;
        return index;
    }, []);

    const nextChannel = useCallback(() => {
        setCurrentChannelIndex(prev => checkIndex(prev + 1, activeChannels.length));
    }, [activeChannels.length, checkIndex]);

    const prevChannel = useCallback(() => {
        setCurrentChannelIndex(prev => checkIndex(prev - 1, activeChannels.length));
    }, [activeChannels.length, checkIndex]);

    const jumpToChannel = useCallback((index) => {
        if (index >= 0 && index < activeChannels.length) {
            setCurrentChannelIndex(index);
        }
    }, [activeChannels.length]);

    const currentChannel = activeChannels[currentChannelIndex];

    const value = {
        allChannels,      // Explicitly for Manager
        activeChannels,   // Explicitly for Player/Guide
        channels: activeChannels, // Default alias for App backward compatibility
        currentChannelIndex,
        currentChannel,
        channelStatuses,
        nextChannel,
        prevChannel,
        jumpToChannel,
        saveChannels,
        resetChannels,
        refreshChannels,
        checkAllChannels
    };
    return (
        <ChannelContext.Provider value={value}>
            {children}
        </ChannelContext.Provider>
    );
};
