import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, VolumeX, Volume2, Music, Globe, Rocket, Gamepad2, GraduationCap } from 'lucide-react';

const OSD = ({ channel, isVisible, isMuted, channelNumber, totalChannels }) => {
    return (
        <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-12 text-white">
            {/* Top Bar - Channel Number/Time maybe? */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-between items-start w-full"
                    >
                        <div className="font-mono text-4xl bg-black/50 px-4 py-2 rounded backdrop-blur-md border border-white/10 shadow-lg">
                            CH {channelNumber.toString().padStart(2, '0')}
                        </div>
                        <div className="bg-black/50 p-2 rounded-full backdrop-blur-md border border-white/10">
                            {isMuted ? <VolumeX className="w-6 h-6 text-red-400" /> : <Volume2 className="w-6 h-6 text-green-400" />}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bottom Bar - Channel Info */}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }} // Custom easing for premium feel
                        className="flex items-center gap-8 relative z-10 pl-4 pb-4"
                    >
                        {/* 
                            Premium Visibility Layer:
                            1. Global linear gradient from bottom for base readability
                            2. Local radial gradient behind text for extra pop
                        */}
                        <div className="absolute -left-20 -bottom-20 w-[150%] h-[300px] bg-gradient-to-t from-black/90 via-black/50 to-transparent -z-20 pointer-events-none" />
                        <div className="absolute -inset-10 bg-black/40 blur-3xl rounded-full -z-10 pointer-events-none" />

                        {/* Channel Logo with Glass Effect */}
                        <div className="w-24 h-24 bg-white/5 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden shrink-0 ring-1 ring-white/10 group">
                            {channel.logo ? (
                                <img src={channel.logo} alt={channel.name} className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                {
                                    'Music': <Music className="w-12 h-12 text-white/90 drop-shadow-lg" />,
                                    'Science': <Rocket className="w-12 h-12 text-white/90 drop-shadow-lg" />,
                                    'News': <Globe className="w-12 h-12 text-white/90 drop-shadow-lg" />,
                                    'Gaming': <Gamepad2 className="w-12 h-12 text-white/90 drop-shadow-lg" />,
                                    'Education': <GraduationCap className="w-12 h-12 text-white/90 drop-shadow-lg" />
                                }[channel.category] || <Tv className="w-12 h-12 text-white/90 drop-shadow-lg" />
                            )}
                        </div>

                        {/* Text Content with Multi-Layer Shadows for Maximum Readability */}
                        <div className="flex-1 flex flex-col justify-center">
                            <h2
                                className="text-5xl font-bold tracking-tight text-white mb-2 leading-none"
                                style={{ textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 4px 12px rgba(0,0,0,0.5)' }}
                            >
                                {channel.name}
                            </h2>
                            <div className="flex items-center gap-4 text-lg text-white font-medium">
                                <span className="px-2 py-0.5 bg-red-600 rounded text-xs font-bold uppercase tracking-wider shadow-lg border border-white/10">LIVE</span>
                                <span className="drop-shadow-md text-white/90">{channel.category}</span>
                                <span className="w-1.5 h-1.5 bg-white/60 rounded-full" />
                                <span className="truncate max-w-2xl text-white/80 drop-shadow-md">{channel.description}</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default OSD;
