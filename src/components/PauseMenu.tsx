"use client";

import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { audioEngine } from '@/lib/audio/AudioEngine';

export default function PauseMenu() {
    const handleVolumeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const volume = parseFloat(event.target.value);
        if (audioEngine) {
            audioEngine.setVolume(volume);
        }
    };

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button className="text-white">Pause</button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="bg-black/50 fixed inset-0" />
                <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/80 text-white p-8 rounded-lg shadow-lg">
                    <Dialog.Title className="text-2xl font-bold mb-4">Pause Menu</Dialog.Title>
                    <div>
                        <h2 className="text-xl font-bold mb-2">Contact</h2>
                        <p>Jason [Dosc] Urbina</p>
                        <p>doscmusic@gmail.com</p>
                    </div>
                    <div className="mt-4">
                        <h2 className="text-xl font-bold mb-2">Settings</h2>
                        <div>
                            <label htmlFor="volume">Volume</label>
                            <input 
                                type="range" 
                                id="volume" 
                                min="0" 
                                max="1" 
                                step="0.01" 
                                defaultValue="0.5"
                                onChange={handleVolumeChange} 
                            />
                        </div>
                    </div>
                    <Dialog.Close asChild>
                        <button className="absolute top-4 right-4 text-white">X</button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}
