import React from 'react';
import { X, Youtube, Terminal, Code } from 'lucide-react';

const MaintenanceGuide = ({ onClose }) => {
    return (
        <div className="absolute inset-0 z-50 bg-zinc-900/95 backdrop-blur-sm flex flex-col animate-in fade-in duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-black/40">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-yellow-500">🛠️</span>
                    Maintenance Guide
                </h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-zinc-800 rounded-full transition text-zinc-400 hover:text-white"
                >
                    <X size={24} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 text-zinc-300 space-y-8 max-w-3xl mx-auto w-full">

                {/* Intro */}
                <section>
                    <h3 className="text-lg font-bold text-white mb-2">Why do channels stop working?</h3>
                    <p className="text-sm leading-relaxed">
                        YouTube Live Stream IDs (the part after <code className="bg-zinc-800 px-1 py-0.5 rounded text-yellow-500">v=</code> in the URL) are often <strong className="text-white">not permanent</strong>.
                        News channels often restart their stream daily or weekly. When this happens, the old ID becomes an archived video, and a new ID is generated for the live broadcast.
                    </p>
                </section>

                <hr className="border-zinc-800" />

                <h3 className="text-lg font-bold text-white">How to Update Channels</h3>

                {/* Option 1 */}
                <section className="bg-zinc-950 p-6 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-red-900/20 rounded-lg text-red-500"><Youtube size={20} /></div>
                        <h4 className="font-bold text-white">Option 1: Manual Update (Easiest)</h4>
                    </div>
                    <ol className="list-decimal list-inside space-y-3 text-sm ml-2">
                        <li>Go to the YouTube Channel page (e.g., Sky News).</li>
                        <li>Click the <span className="text-white font-bold">Live</span> tab or verify the video says "LIVE NOW".</li>
                        <li>Click the video to watch it.</li>
                        <li>
                            Copy the ID from the URL:
                            <div className="mt-2 p-2 bg-black rounded border border-zinc-800 font-mono text-xs text-zinc-400">
                                youtube.com/watch?v=<span className="text-green-500 font-bold">VIDEO_ID</span>
                            </div>
                        </li>
                        <li>Paste this ID into the Channel Manager.</li>
                    </ol>
                </section>

                {/* Option 2 */}
                <section className="bg-zinc-950 p-6 rounded-xl border border-zinc-800/50">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-900/20 rounded-lg text-blue-500"><Terminal size={20} /></div>
                        <h4 className="font-bold text-white">Option 2: Command Line (Fastest)</h4>
                    </div>
                    <p className="text-sm mb-3">If you have <code className="text-white">yt-dlp</code> installed, you can instantly get the current ID:</p>
                    <div className="bg-black p-4 rounded-lg border border-zinc-800 font-mono text-xs text-green-400 overflow-x-auto">
                        yt-dlp --print id "https://www.youtube.com/@SkyNews/live"
                    </div>
                </section>

                {/* Option 3 */}
                <section className="bg-zinc-950 p-6 rounded-xl border border-zinc-800/50 opacity-75 hover:opacity-100 transition">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-purple-900/20 rounded-lg text-purple-500"><Code size={20} /></div>
                        <h4 className="font-bold text-white">Option 3: Automated API</h4>
                    </div>
                    <p className="text-sm">
                        You can use the YouTube Data API <code className="text-white">search.list</code> endpoint with
                        <code className="text-yellow-500 mx-1">eventType: live</code> to automatically fetch IDs programmatically.
                        (Requires API Key).
                    </p>
                </section>

            </div>
        </div>
    );
};

export default MaintenanceGuide;
