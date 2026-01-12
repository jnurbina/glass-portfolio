"use client";

import { useRef, useMemo, useEffect, useCallback, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { CubeCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { audioEngine } from '@/lib/audio/audio';
// import { wallConfig } from '@/lib/three/constants'; // REMOVED: This does not exist and is unused
import TiledWall from './three/TiledWall';
import Particles from './three/Particles';
import { Skybox, Rig, RoomEdges, Logo } from './three/Scene';
import PauseModal from './three/PauseModal';
import { useThreeCanvasState } from '@/hooks/use-three-canvas-state';
import { useAchievementState } from '@/hooks/use-achievement-state';
import { getWallConfig } from '@/lib/three/constants';
import { useThree } from '@react-three/fiber';

interface SceneContentProps {
    showLogo: boolean;
    subscribeToHit: (callback: (position: THREE.Vector3) => void) => () => void;
    onParticleHit: (position: THREE.Vector3) => void;
    particleCount: number;
    mouseRef: React.MutableRefObject<[number, number]>;
    motionRef: React.MutableRefObject<[number, number, number]>;
    reflectionQuality: number;
}

const SceneContent = ({ showLogo, subscribeToHit, onParticleHit, particleCount, mouseRef, motionRef, reflectionQuality }: SceneContentProps) => {
    const { viewport } = useThree();
    const wallConfig = getWallConfig(viewport.width, viewport.height);

    return (
        <Suspense fallback={null}>
            <ambientLight intensity={0.1} />
            <hemisphereLight intensity={0.2} groundColor="black" />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} castShadow />
            
            <CubeCamera resolution={128} frames={reflectionQuality} near={0.1} far={1000}>
                {(texture) => (
                    <>
                        {Object.entries(wallConfig).map(([key, config]) => (
                            <TiledWall key={key} config={config} onHit={subscribeToHit} envMap={texture} />
                        ))}
                    </>
                )}
            </CubeCamera>
            
            <Particles onHit={onParticleHit} count={particleCount} mouse={mouseRef} />
            <Skybox />
            <Rig mouse={mouseRef} motion={motionRef} />
            <RoomEdges wallConfig={wallConfig} />
            {showLogo && <Logo />}

            <EffectComposer>
                <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={150} intensity={0.8} />
            </EffectComposer>
        </Suspense>
    );
};

export default function ThreeCanvas({ onLoaded, showLogo }: { onLoaded: () => void, showLogo: boolean }) {
    const hitListeners = useRef(new Set<(position: THREE.Vector3) => void>()).current;
    const mouseRef = useRef<[number, number]>([0, 0]);
    const motionRef = useRef<[number, number, number]>([0, 0, 0]);
    const hitCount = useRef(0);
    const { unlockAchievement } = useAchievementState();

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            mouseRef.current = [
                (event.clientX / window.innerWidth) * 2 - 1,
                -(event.clientY / window.innerHeight) * 2 + 1,
            ];
        };

        const handleDeviceMotion = (event: DeviceMotionEvent) => {
            if (event.accelerationIncludingGravity) {
                motionRef.current = [
                    event.accelerationIncludingGravity.x || 0,
                    event.accelerationIncludingGravity.y || 0,
                    event.accelerationIncludingGravity.z || 0,
                ];
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('devicemotion', handleDeviceMotion);
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('devicemotion', handleDeviceMotion);
        };
    }, []);

    useEffect(() => {
        audioEngine.init(() => {
          audioEngine.play('background', true);
        });
    
        onLoaded();

        return () => {
          audioEngine.fadeOut('background');
        };
      }, [onLoaded]);
    
    const onParticleHit = useCallback((position: THREE.Vector3) => {
        hitListeners.forEach(listener => listener(position));
        audioEngine.playProceduralHit(); // Play sound on hit
        hitCount.current += 1;
    }, [hitListeners]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (hitCount.current > 20) {
                unlockAchievement('noisy-neighbor');
            }
            hitCount.current = 0;
        }, 5000);

        return () => {
            clearInterval(interval);
        };
    }, [unlockAchievement]);

    const subscribeToHit = useCallback((callback: (position: THREE.Vector3) => void) => {
        hitListeners.add(callback);
        return () => hitListeners.delete(callback);
    }, [hitListeners]);

    const {
        isPaused,
        particleCount,
        reflectionQuality,
        setIsPaused,
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
                    <SceneContent 
                        showLogo={showLogo}
                        subscribeToHit={subscribeToHit}
                        onParticleHit={onParticleHit}
                        particleCount={particleCount}
                        mouseRef={mouseRef}
                        motionRef={motionRef}
                        reflectionQuality={reflectionQuality}
                    />
                </Canvas>
            </div>
            <PauseModal />
        </>
    );
}
ThreeCanvas.displayName = 'ThreeCanvas';