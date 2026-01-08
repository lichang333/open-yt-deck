import React, { useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';

const Player = ({ videoId, isMuted, onReady, onError, onBuffer, onBufferEnd, onDuration }) => {
    return (
        <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
            <div className="relative w-full h-full pointer-events-none"> {/* Scale to remove black bars/controls roughly */}
                <ReactPlayer
                    src={`https://www.youtube.com/watch?v=${videoId}`}
                    playing={true}
                    muted={isMuted}
                    width="100%"
                    height="100%"
                    controls={false}
                    onReady={onReady}
                    onError={onError}
                    onBuffer={onBuffer}
                    onBufferEnd={onBufferEnd}
                    onDuration={onDuration}
                    onPlay={onBufferEnd}
                    config={{
                        playerVars: {
                            modestbranding: 1,
                            rel: 0,
                            showinfo: 0,
                            iv_load_policy: 3,
                            fs: 0,
                            cc_load_policy: 0,
                            disablekb: 1,
                        }
                    }}
                />
            </div>

        </div>
    );
};

export default Player;
