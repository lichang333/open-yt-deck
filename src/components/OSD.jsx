import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, VolumeX, Volume2, Music, Globe, Rocket, Gamepad2, GraduationCap } from 'lucide-react';

const OSD = ({ channel, isVisible, isMuted, isLive, channelNumber, totalChannels }) => {
    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-16 text-white overflow-hidden">
            {/* Top Bar - Channel Number & Status */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -40 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -40 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 100 }}
                        className="flex justify-between items-start w-full"
                    >
                        {/* Channel Badge */}
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center justify-center bg-zinc-900/90 backdrop-blur-xl border border-white/10 px-5 py-3 rounded-2xl shadow-2xl">
                                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold mb-0.5">Channel</span>
                                <span className="text-4xl font-black tracking-tighter text-white font-mono leading-none">
                                    {channelNumber.toString().padStart(2, '0')}
                                </span>
                            </div>
                        </div>

                        {/* Status Icons */}
                        <div className="flex gap-3">
                            {isMuted && (
                                <div className="bg-red-500/90 text-white px-4 py-2 rounded-full backdrop-blur-md shadow-lg flex items-center gap-2 font-bold text-sm tracking-wide uppercase animate-pulse">
                                    <VolumeX size={18} /> Muted
                                </div>
                            )}
                            <div className="bg-zinc-900/80 text-zinc-400 px-4 py-2 rounded-full backdrop-blur-md border border-white/5 shadow-xl flex items-center gap-2 font-mono text-sm">
                                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                                SIGNAL OK
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Bar - Channel Info */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 60 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 60 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 120, delay: 0.1 }}
                        className="relative z-10 pl-6 pb-6 max-w-5xl"
                    >
                        {/* Cinematic Gradient Background for Text Readability */}
                        <div className="absolute -left-20 -bottom-20 w-[180%] h-[500px] bg-gradient-to-t from-black via-black/80 to-transparent -z-10 blur-2xl" />

                        <div className="flex items-end gap-10">
                            {/* Large Channel Logo - Floating Card Style */}
                            <div className="w-32 h-32 bg-white rounded-3xl flex items-center justify-center shadow-[0_20px_60px_-10px_rgba(0,0,0,0.8)] overflow-hidden shrink-0 border-4 border-white/10 relative z-20 group">
                                {channel.logo ? (
                                    <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105" />
                                ) : (
                                    <div className="text-black/20">
                                        {
                                            {
                                                'Music': <Music size={48} />,
                                                'Science': <Rocket size={48} />,
                                                'News': <Globe size={48} />,
                                                'Gaming': <Gamepad2 size={48} />,
                                                'Education': <GraduationCap size={48} />
                                            }[channel.category] || <Tv size={48} />
                                        }
                                    </div>
                                )}
                            </div>

                            {/* Text Info */}
                            <div className="pb-2">
                                <div className="flex items-center gap-3 mb-3">
                                    {isLive ? (
                                        <span className="bg-red-600/90 text-white text-[11px] font-black px-2 py-0.5 rounded shadow-[0_0_15px_rgba(220,38,38,0.6)] tracking-widest uppercase flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span> LIVE
                                        </span>
                                    ) : (
                                        <span className="bg-blue-600/90 text-white text-[11px] font-black px-2 py-0.5 rounded shadow-[0_0_15px_rgba(37,99,235,0.6)] tracking-widest uppercase">
                                            VOD
                                        </span>
                                    )}
                                    <span className="text-white/60 font-medium tracking-wide uppercase text-sm flex items-center gap-2">
                                        {channel.category} <span className="w-1 h-1 bg-white/40 rounded-full"></span> HD
                                    </span>
                                </div>
                                <h1 className="text-7xl font-black text-white tracking-tight leading-none drop-shadow-2xl mb-2 font-sans">
                                    {channel.name}
                                </h1>
                                <p className="text-xl text-white/80 font-medium max-w-3xl line-clamp-1 drop-shadow-lg">
                                    {channel.description}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OSD;
