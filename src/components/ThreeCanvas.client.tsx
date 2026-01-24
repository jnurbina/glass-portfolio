import React, { useRef, useEffect, useCallback, Suspense } from 'react';
import * as THREE from 'three';
import { Canvas, useThree } from '@react-three/fiber';
import { CubeCamera } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { audioEngine } from '@/lib/audio/audio';
import TiledWall from './three/TiledWall';
import Particles from './three/Particles';
import { Skybox, Rig, RoomEdges, Logo } from './three/Scene';
import SettingsPane from './three/SettingsPane';
import BioPane from './three/BioPane';
import ExperiencePane from './three/ExperiencePane';
import ExperimentsPane from './three/ExperimentsPane';
import AudioPane from './three/AudioPane';
import ForYouPane from './three/ForYouPane';
import AchievementWallPanel from './three/AchievementWallPanel';
import { useThreeCanvasState } from '@/hooks/use-three-canvas-state';

import { useAchievementState } from '@/hooks/use-achievement-state';
import { getWallConfig } from '@/lib/three/constants';
import { ViewMode } from '@/lib/view-types';

interface SceneContentProps {
    showLogo: boolean;
    activeView: ViewMode;
    onCloseView: () => void;
    subscribeToHit: (callback: (position: THREE.Vector3) => void) => () => void;
    onParticleHit: (position: THREE.Vector3) => void;
    particleCount: number;
    mouseRef: React.MutableRefObject<[number, number]>;
    motionRef: React.MutableRefObject<[number, number, number]>;
    reflectionQuality: number;
}

const SceneContent = ({ showLogo, activeView, onCloseView, subscribeToHit, onParticleHit, particleCount, mouseRef, motionRef, reflectionQuality }: SceneContentProps) => {
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
            <AchievementWallPanel />
            
            {activeView === 'settings' && <SettingsPane onClose={onCloseView} />}
            {activeView === 'bio' && <BioPane onClose={onCloseView} />}
            {activeView === 'experience' && <ExperiencePane onClose={onCloseView} />}
            {activeView === 'experiments' && <ExperimentsPane onClose={onCloseView} />}
            {activeView === 'audio' && <AudioPane onClose={onCloseView} />}
            {activeView === 'foryou' && <ForYouPane onClose={onCloseView} />}

            <EffectComposer>
                <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={150} intensity={0.8} />
            </EffectComposer>
        </Suspense>
    );
};

export default function ThreeCanvas({ onLoaded, showLogo, activeView, onCloseView }: { onLoaded: () => void, showLogo: boolean, activeView: ViewMode, onCloseView: () => void }) {
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

        const handleDeviceOrientation = (event: DeviceOrientationEvent) => {
            if (event.gamma === null || event.beta === null) return;
            const gamma = event.gamma;
            const beta = event.beta;
            const x = Math.min(Math.max(gamma, -45), 45) / 45;
            const y = Math.min(Math.max(beta - 45, -45), 45) / 45; 
            motionRef.current = [x, -y, 0];
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('deviceorientation', handleDeviceOrientation);
        
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('deviceorientation', handleDeviceOrientation);
        };
    }, []);

    useEffect(() => {
        const loadAssets = async () => {
             await audioEngine.load();
             onLoaded();
             audioEngine.play('background', true);
        };
        loadAssets();
        return () => {
          audioEngine.fadeOut('background');
        };
      }, [onLoaded]);
    
    const onParticleHit = useCallback((position: THREE.Vector3) => {
        hitListeners.forEach(listener => listener(position));
        audioEngine.playProceduralHit(); 
        hitCount.current += 1;
    }, [hitListeners]);

    useEffect(() => {
        const interval = setInterval(() => {
            if (hitCount.current > 20) {
                unlockAchievement('noisy-neighbor');
            }
            hitCount.current = 0;
        }, 5000);
        return () => clearInterval(interval);
    }, [unlockAchievement]);

    const subscribeToHit = useCallback((callback: (position: THREE.Vector3) => void) => {
        hitListeners.add(callback);
        return () => hitListeners.delete(callback);
    }, [hitListeners]);

    const {
        particleCount,
        reflectionQuality,
    } = useThreeCanvasState();

    return (
        <div style={{ 
            position: 'fixed', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            zIndex: activeView !== 'home' ? 10 : -1, 
            pointerEvents: 'none' 
        }}>
            <Canvas camera={{ position: [0, 0, 25], fov: 75 }} style={{ pointerEvents: 'auto' }}>
                <SceneContent 
                    showLogo={showLogo}
                    activeView={activeView}
                    onCloseView={onCloseView}
                    subscribeToHit={subscribeToHit}
                    onParticleHit={onParticleHit}
                    particleCount={particleCount}
                    mouseRef={mouseRef}
                    motionRef={motionRef}
                    reflectionQuality={reflectionQuality}
                />
            </Canvas>
        </div>
    );
}
ThreeCanvas.displayName = 'ThreeCanvas';
