import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ProgramGuide = ({ isOpen, channels, selectedIndex, playingIndex, onSelect, onClose }) => {
    const listRef = useRef(null);

    // Auto-scroll to selected item
    useEffect(() => {
        if (isOpen && listRef.current) {
            const selectedElement = listRef.current.children[selectedIndex];
            if (selectedElement) {
                selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    }, [selectedIndex, isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-sm flex justify-start">

                    {/* Guide Side Panel */}
                    <motion.div
                        initial={{ x: '-100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300, mass: 0.8 }}
                        className="w-[450px] h-full bg-black/80 backdrop-blur-2xl border-r border-white/10 flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden"
                    >
                        {/* Decorative Gradient Blob */}
                        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-blue-500/20 rounded-full blur-[80px] pointer-events-none" />
                        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-purple-500/10 rounded-full blur-[80px] pointer-events-none" />

                        {/* Header */}
                        <div className="p-8 border-b border-white/5 relative z-10">
                            <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-4 mb-2">
                                <span className="bg-white text-black text-sm font-black px-2 py-1 rounded">EPG</span>
                                <span className="opacity-90">Channel Guide</span>
                            </h2>
                            <p className="text-white/40 text-sm font-medium tracking-wide">
                                <span className="text-white/60">NAVIGATE</span> <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white mx-1 font-mono">↑↓</kbd>
                                <span className="ml-3 text-white/60">SELECT</span> <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white mx-1 font-mono">↵</kbd>
                            </p>
                        </div>

                        {/* Channel List */}
                        <div ref={listRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-1 scrollbar-hide">
                            {channels.map((channel, index) => {
                                const isSelected = index === selectedIndex;
                                const isPlaying = index === playingIndex;

                                return (
                                    <div
                                        key={channel.id}
                                        onClick={() => onSelect(index)}
                                        className={`
                                            group relative p-4 rounded-xl transition-all duration-200 cursor-pointer flex items-center gap-5 border
                                            ${isSelected
                                                ? 'bg-white/10 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.05)] translate-x-2'
                                                : 'border-transparent hover:bg-white/5 active:scale-[0.98]'
                                            }
                                        `}
                                    >
                                        {/* Selection Glow Indicator */}
                                        {isSelected && (
                                            <motion.div
                                                layoutId="activeGlow"
                                                className="absolute left-0 top-2 bottom-2 w-1 bg-gradient-to-b from-blue-400 to-purple-400 rounded-r-full shadow-[0_0_10px_purple]"
                                            />
                                        )}

                                        {/* Channel Number */}
                                        <div className={`font-mono text-xl font-bold w-8 text-right tracking-tighter ${isSelected ? 'text-white' : 'text-white/20'}`}>
                                            {(index + 1).toString().padStart(2, '0')}
                                        </div>

                                        {/* Logo Container */}
                                        <div className={`
                                            w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border bg-black/20 relative
                                            ${isSelected ? 'border-white/30 shadow-lg' : 'border-white/5 grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all'}
                                        `}>
                                            {channel.logo ? (
                                                <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-xs font-bold text-white/20">
                                                    N/A
                                                </div>
                                            )}
                                            {/* Playing Indicator Overlay */}
                                            {isPlaying && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[1px]">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0 flex flex-col justify-center h-full">
                                            <div className="flex items-center justify-between mb-0.5">
                                                <span className={`font-bold text-lg truncate transition-colors ${isSelected ? 'text-white' : 'text-white/60 group-hover:text-white/90'}`}>
                                                    {channel.name}
                                                </span>
                                                {isPlaying && (
                                                    <span className="text-[10px] font-bold bg-red-600/90 text-white px-1.5 py-0.5 rounded tracking-wider shadow-sm animate-pulse">
                                                        LIVE
                                                    </span>
                                                )}
                                            </div>
                                            <div className={`text-sm font-medium truncate flex items-center gap-2 ${isSelected ? 'text-white/60' : 'text-white/30'}`}>
                                                <span className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] uppercase tracking-wide border border-white/5">{channel.category}</span>
                                                {isSelected && <span className="opacity-50">• {channel.description}</span>}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>

                    {/* Click Backdrop to close */}
                    <div className="flex-1" onClick={onClose} />
                </div>
            )}
        </AnimatePresence>
    );
};

export default ProgramGuide;
