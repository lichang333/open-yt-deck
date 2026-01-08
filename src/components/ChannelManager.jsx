import React, { useState, useEffect } from 'react';
import { Reorder, useDragControls } from 'framer-motion';
import { channelStore } from '../data/channelStore';
import { X, GripVertical, Trash2, Plus, Save, RotateCcw, Download, BookOpen } from 'lucide-react';
import MaintenanceGuide from './MaintenanceGuide';

// DraggableItem MUST be defined OUTSIDE the parent component to prevent re-mounts on state change
const DraggableItem = ({ channel, index, editingId, setEditingId, updateChannel, handleSmartInput, handleDelete }) => {
    const dragControls = useDragControls();
    const isEditing = editingId === channel.id;

    return (
        <Reorder.Item
            value={channel}
            id={channel.id}
            dragListener={false}
            dragControls={dragControls}
            className="bg-zinc-900 border border-zinc-800 rounded-lg mb-2 overflow-hidden shadow-sm relative group"
        >
            <div className="flex items-center p-3 gap-3 pl-0">
                {/* Drag Handle - Larger Hit Area */}
                <div
                    className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-white h-full self-stretch flex items-center justify-center px-3 hover:bg-zinc-800/50 transition-colors border-r border-transparent hover:border-zinc-700"
                    onPointerDown={(e) => dragControls.start(e)}
                    title="Drag to reorder"
                >
                    <GripVertical size={24} />
                </div>

                {/* Index Indicator */}
                <div className="font-mono text-xs text-zinc-500 w-6 text-center shrink-0">
                    {index < 9 ? `#${index + 1}` : ''}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-1">
                    {isEditing ? (
                        <div className="grid grid-cols-2 gap-2 text-sm pr-2">
                            <input
                                type="text"
                                value={channel.name}
                                onChange={(e) => updateChannel(channel.id, 'name', e.target.value)}
                                placeholder="Channel Name"
                                className="bg-black border border-zinc-700 rounded px-2 py-1 text-white focus:border-blue-500 outline-none"
                            />
                            <input
                                type="text"
                                value={channel.videoId}
                                onChange={(e) => handleSmartInput(channel.id, e.target.value, 'videoId')}
                                placeholder="YouTube ID or URL"
                                className="bg-black border border-zinc-700 rounded px-2 py-1 text-white font-mono focus:border-blue-500 outline-none"
                            />
                            <input
                                type="text"
                                value={channel.logo || ''}
                                onChange={(e) => updateChannel(channel.id, 'logo', e.target.value)}
                                placeholder="Logo URL"
                                className="bg-black border border-zinc-700 rounded px-2 py-1 text-white col-span-2 text-xs focus:border-blue-500 outline-none"
                            />
                        </div>
                    ) : (
                        <div className="flex items-center gap-3">
                            {channel.logo ? (
                                <img src={channel.logo} alt="" className="w-10 h-10 rounded object-cover bg-zinc-800 shrink-0" />
                            ) : (
                                <div className="w-10 h-10 rounded bg-zinc-800 flex items-center justify-center text-zinc-600 shrink-0">
                                    <span className="text-xs">No img</span>
                                </div>
                            )}
                            <div className="flex flex-col min-w-0">
                                <span className="font-bold truncate text-white text-sm">{channel.name}</span>
                                <span className="text-xs text-zinc-500 font-mono truncate">{channel.videoId}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 pr-2">
                    <button
                        onClick={() => setEditingId(isEditing ? null : channel.id)}
                        className={`text-xs px-3 py-1.5 rounded transition font-medium ${isEditing ? 'bg-blue-600 text-white hover:bg-blue-500' : 'bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700'}`}
                    >
                        {isEditing ? 'Done' : 'Edit'}
                    </button>
                    <button
                        onClick={() => handleDelete(channel.id)}
                        className="p-2 hover:bg-red-900/30 text-zinc-500 hover:text-red-500 rounded transition"
                        title="Delete Channel"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>
        </Reorder.Item>
    );
};

const ChannelManager = ({ onClose }) => {
    const [channels, setChannels] = useState([]);
    const [isDirty, setIsDirty] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [showGuide, setShowGuide] = useState(false);

    useEffect(() => {
        setChannels(channelStore.getChannels());
    }, []);

    const handleReorder = (newOrder) => {
        setChannels(newOrder);
        setIsDirty(true);
    };

    const handleSave = () => {
        channelStore.saveChannels(channels);
        setIsDirty(false);
        // Optional: Close manager after save or give feedback
    };

    const handleReset = () => {
        if (confirm('Are you sure you want to reset to default channels? This cannot be undone.')) {
            setChannels(channelStore.resetChannels());
            setIsDirty(false);
        }
    };

    const handleExport = () => {
        const dataStr = "export const channels = " + JSON.stringify(channels, null, 4) + ";";
        navigator.clipboard.writeText(dataStr);
        alert('Channel configuration copied to clipboard! You can paste this into src/data/channels.js to make it permanent.');
    };

    const handleDelete = (id) => {
        if (confirm('Delete this channel?')) {
            const newChannels = channels.filter(c => c.id !== id);
            setChannels(newChannels);
            setIsDirty(true);
        }
    };

    const handleAdd = () => {
        const newId = Math.max(...channels.map(c => c.id), 0) + 1;
        const newChannel = {
            id: newId,
            name: "New Channel",
            videoId: "",
            channelUrl: "",
            category: "Uncategorized",
            description: "",
            logo: ""
        };
        setChannels([...channels, newChannel]);
        setEditingId(newId);
        setIsDirty(true);
    };

    const updateChannel = (id, field, value) => {
        setChannels(channels.map(c =>
            c.id === id ? { ...c, [field]: value } : c
        ));
        setIsDirty(true);
    };

    const extractVideoId = (url) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };

    const handleSmartInput = (id, value, field) => {
        // If pasting into ID field, check for URL
        if (field === 'videoId') {
            const extractedId = extractVideoId(value);
            if (extractedId) {
                // It's a URL, use the ID
                updateChannel(id, 'videoId', extractedId);

                // Auto-fill logo if empty
                // REMOVED: Bad UX to use video thumbnail as channel logo
                return;
            }
        }

        // Normal update
        updateChannel(id, field, value);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex flex-col text-white">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-black/50">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                        Broadcast Control
                    </h2>
                    <p className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Channel Management System</p>
                </div>

                <div className="flex items-center gap-3">
                    <button onClick={() => setShowGuide(true)} title="Maintenance Guide" className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition">
                        <BookOpen size={20} />
                    </button>
                    <div className="w-px h-6 bg-zinc-800 mx-1"></div>
                    <button onClick={handleReset} title="Reset to Defaults" className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition">
                        <RotateCcw size={20} />
                    </button>
                    <button onClick={handleExport} title="Copy Config" className="p-2 hover:bg-zinc-800 rounded-md text-zinc-400 hover:text-white transition">
                        <Download size={20} />
                    </button>
                    <div className="w-px h-6 bg-zinc-800 mx-2"></div>
                    <button
                        onClick={handleSave}
                        disabled={!isDirty}
                        className={`flex items-center gap-2 px-4 py-2 rounded-md font-bold transition ${isDirty ? 'bg-white text-black hover:scale-105' : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}`}
                    >
                        <Save size={18} />
                        Save Changes
                    </button>
                    <button onClick={onClose} className="p-2 ml-2 hover:bg-zinc-800 rounded-full transition">
                        <X size={24} />
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6 relative">
                {showGuide && <MaintenanceGuide onClose={() => setShowGuide(false)} />}
                <div className="max-w-3xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-zinc-400">Active Channels ({channels.length})</h3>
                        <button onClick={handleAdd} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-md text-sm font-bold transition">
                            <Plus size={18} /> Add Channel
                        </button>
                    </div>

                    <Reorder.Group axis="y" values={channels} onReorder={handleReorder}>
                        {channels.map((channel, index) => (
                            <DraggableItem
                                key={channel.id}
                                channel={channel}
                                index={index}
                                editingId={editingId}
                                setEditingId={setEditingId}
                                updateChannel={updateChannel}
                                handleSmartInput={handleSmartInput}
                                handleDelete={handleDelete}
                            />
                        ))}
                    </Reorder.Group>

                    <div className="mt-8 p-4 bg-zinc-900/50 rounded-lg border border-zinc-800/50 text-center text-zinc-500 text-sm">
                        Drag items to reorder using the handle. The first 9 channels are assigned to hotkeys 1-9.
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ChannelManager;
