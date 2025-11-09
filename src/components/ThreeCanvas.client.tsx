"use client";

import React, { useRef, useMemo, useEffect, useState, useCallback, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { CubeCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { audioEngine } from '@/lib/audio/audio';
import { wallConfig } from '@/lib/three/constants';
import TiledWall from './three/TiledWall';
import Particles from './three/Particles';
import { Skybox, Rig, RoomEdges, Logo } from './three/Scene';
import PauseModal from './three/PauseModal';
import { useThreeCanvasState } from '@/hooks/use-three-canvas-state';

export default function ThreeCanvas({ onLoaded, showLogo, mousePosition }: { onLoaded: () => void, showLogo: boolean, mousePosition: { x: number, y: number } }) {
    const hitListeners = useRef(new Set<(position: THREE.Vector3) => void>()).current;
    
    useEffect(() => {
        onLoaded();
    }, [onLoaded]);
    
    const onParticleHit = useCallback((position: THREE.Vector3) => {
        hitListeners.forEach(listener => listener(position));
        audioEngine.playProceduralHit(); // Play sound on hit
    }, [hitListeners]);

    const subscribeToHit = useCallback((callback: (position: THREE.Vector3) => void) => {
        hitListeners.add(callback);
        return () => hitListeners.delete(callback);
    }, [hitListeners]);

    const {
        isPaused,
        volume,
        particleCount,
        reflectionQuality,
        setIsPaused,
        setVolume,
        setParticleCount,
        setReflectionQuality,
    } = useThreeCanvasState();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsPaused(!isPaused);
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPaused, setIsPaused]);

    return (
        <>
            <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
                <Canvas camera={{ position: [0, 0, 25], fov: 75 }}>
                    <Suspense fallback={null}>
                        <ambientLight intensity={0.1} />
                        <hemisphereLight intensity={0.2} groundColor="black" />
                        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
                        
                        <CubeCamera resolution={256} frames={reflectionQuality} near={0.1} far={1000}>
                            {(texture) => (
                                <>
                                    {Object.entries(wallConfig).map(([key, config]) => (
                                        <TiledWall key={key} config={config} onHit={subscribeToHit} envMap={texture} />
                                    ))}
                                </>
                            )}
                        </CubeCamera>
                        
                        <Particles onHit={onParticleHit} count={particleCount} />
                        <Skybox />
                        <Rig mousePosition={mousePosition} />
                        <RoomEdges />
                        {showLogo && <Logo />}

                        <EffectComposer>
                            <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} intensity={0.8} />
                        </EffectComposer>
                    </Suspense>
                </Canvas>
            </div>
            <PauseModal />
        </>
    );
}
ThreeCanvas.displayName = 'ThreeCanvas';
