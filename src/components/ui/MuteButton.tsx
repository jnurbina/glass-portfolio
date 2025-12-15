"use client";

import React, { useState, useEffect, forwardRef } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { audioEngine } from '@/lib/audio/audio';

export const MuteButton = forwardRef<HTMLButtonElement, { onFocus?: () => void, onBlur?: () => void }>((props, ref) => {
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        setIsMuted(audioEngine.getIsMuted());
    }, []);

    const handleToggleMute = () => {
        audioEngine.toggleMute();
        setIsMuted(audioEngine.getIsMuted());
    };

    return (
        <button
            ref={ref}
            onClick={handleToggleMute}
            onFocus={props.onFocus}
            onBlur={props.onBlur}
            className="fixed bottom-8 right-8 text-white/50 hover:text-white transition-colors"
        >
            {isMuted ? <VolumeX /> : <Volume2 />}
        </button>
    );
});

MuteButton.displayName = 'MuteButton';
