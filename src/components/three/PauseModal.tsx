import React from 'react';
import { useThreeCanvasState } from '@/hooks/use-three-canvas-state';

function PauseModal() {
    const {
        isPaused,
        volume,
        particleCount,
        reflectionQuality,
        setVolume,
        setParticleCount,
        setReflectionQuality,
    } = useThreeCanvasState();

    if (!isPaused) return null;
    return (
        <div style={{ position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', background: 'rgba(0,0,0,0.7)', color: 'white', padding: '20px', zIndex: 100 }}>
            <h2>Paused</h2>
            <label>
                Volume:
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                />
            </label>
            <br />
            <label>
                Particle Count:
                <input
                    type="range"
                    min="10"
                    max="200"
                    step="10"
                    value={particleCount}
                    onChange={(e) => setParticleCount(parseInt(e.target.value))}
                />
            </label>
            <br />
            <label>
                Reflection Quality:
                <select value={reflectionQuality} onChange={(e) => setReflectionQuality(parseInt(e.target.value))}>
                    <option value={1}>Low</option>
                    <option value={60}>Medium</option>
                    <option value={Infinity}>High</option>
                </select>
            </label>
        </div>
    );
}
PauseModal.displayName = 'PauseModal';

export default PauseModal;
