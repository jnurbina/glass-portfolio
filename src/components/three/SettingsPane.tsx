import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Slider } from '../ui/slider';
import { Label } from '../ui/label';
import { useThreeCanvasState } from '@/hooks/use-three-canvas-state';
import { audioEngine } from '@/lib/audio/audio';
import { useAchievementState } from '@/hooks/use-achievement-state';
import { useResponsivePane } from '@/hooks/use-responsive-pane';
import * as THREE from 'three';

interface PaneProps {
  onClose: () => void;
}

const SettingsPane = ({ onClose }: PaneProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { style, distanceFactor, isMobile, isDesktop, tier } = useResponsivePane(600, 600);
  
  const { 
      particleCount, setParticleCount,
      reflectionQuality, setReflectionQuality
  } = useThreeCanvasState();
  
  const [bgmVol, setBgmVol] = useState(0.1875);
  const [sfxVol, setSfxVol] = useState(0.25);
  const { unlockAchievement } = useAchievementState();

  useEffect(() => {
      unlockAchievement('hacker');
  }, [unlockAchievement]);

  const handleParticleChange = (val: number[]) => {
      setParticleCount(val[0]);
      unlockAchievement('power-user');
  };

  const handleQualityChange = (val: number[]) => {
      setReflectionQuality(val[0]);
      unlockAchievement('power-user');
  };

  const handleBgmChange = (val: number[]) => {
      const v = val[0];
      setBgmVol(v);
      audioEngine.setBgmVolume(v);
      unlockAchievement('audiophile');
  };

  const handleSfxChange = (val: number[]) => {
      const v = val[0];
      setSfxVol(v);
      audioEngine.setSfxVolume(v);
      unlockAchievement('audiophile');
  };

  useFrame((state) => {
    if (groupRef.current) {
        const time = state.clock.getElapsedTime();
        groupRef.current.position.y = Math.sin(time * 1.5) * 0.1;
        groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.02;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 10]}>
      <Html transform position={[0, 0, 0]} distanceFactor={distanceFactor} zIndexRange={[100, 0]} style={style}>
         <div className={`w-full h-full bg-black/90 text-white relative rounded-xl border border-cyan-500/50 backdrop-blur-md shadow-[0_0_50px_rgba(6,182,212,0.2)] flex flex-col ${isDesktop ? 'p-4' : 'p-4'}`}>
            <div className={`flex justify-between items-center ${isDesktop ? 'mb-4 pb-2' : 'mb-3 pb-2'} border-b border-white/10`}>
                <h2 className={`${isDesktop ? 'text-sm' : 'text-sm'} font-bold font-mono text-cyan-400 uppercase tracking-widest`}>[ SYSTEM_CONFIG ]</h2>
                <button onClick={onClose} aria-label="Close Pane" className={`text-white/50 hover:text-white font-mono ${isDesktop ? 'text-sm' : 'text-lg'}`}>[ X ]</button>
            </div>

            <div className={`${isDesktop ? 'space-y-4 flex flex-col justify-center' : 'space-y-3'} flex-1 min-h-0`}>
                {isDesktop ? (
                    <>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                <div className="flex justify-between text-xs mb-2"><span className="text-white/50">BGM Volume</span><span className="text-cyan-500 font-mono">{Math.round(bgmVol * 100)}%</span></div>
                                <Slider value={[bgmVol]} max={1} step={0.01} onValueChange={handleBgmChange} />
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                <div className="flex justify-between text-xs mb-2"><span className="text-white/50">SFX Volume</span><span className="text-cyan-500 font-mono">{Math.round(sfxVol * 100)}%</span></div>
                                <Slider value={[sfxVol]} max={1} step={0.01} onValueChange={handleSfxChange} />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                <div className="flex justify-between text-xs mb-2"><span className="text-white/50">Particles</span><span className="text-cyan-500 font-mono">{particleCount}</span></div>
                                <Slider value={[particleCount]} min={0} max={200} step={1} onValueChange={handleParticleChange} />
                            </div>
                            <div className="bg-white/5 p-4 rounded-lg border border-white/5">
                                <div className="flex justify-between text-xs mb-2"><span className="text-white/50">Reflections</span><span className="text-cyan-500 font-mono">{reflectionQuality === 1 ? 'Low' : reflectionQuality === 2 ? 'Med' : 'Hi'}</span></div>
                                <Slider value={[reflectionQuality]} min={1} max={3} step={1} onValueChange={handleQualityChange} />
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-bold text-white/50 uppercase flex items-center gap-1"><span className="w-1 h-1 bg-cyan-500 rounded-full"></span> Audio</h3>
                            <div className="space-y-1 bg-white/5 p-2 rounded-lg border border-white/5">
                                <div className="flex justify-between text-xs"><Label>BGM</Label><span className="font-mono text-cyan-500">{Math.round(bgmVol * 100)}%</span></div>
                                <Slider value={[bgmVol]} max={1} step={0.01} onValueChange={handleBgmChange} />
                            </div>
                            <div className="space-y-1 bg-white/5 p-2 rounded-lg border border-white/5">
                                <div className="flex justify-between text-xs"><Label>SFX</Label><span className="font-mono text-cyan-500">{Math.round(sfxVol * 100)}%</span></div>
                                <Slider value={[sfxVol]} max={1} step={0.01} onValueChange={handleSfxChange} />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-[10px] font-bold text-white/50 uppercase flex items-center gap-1"><span className="w-1 h-1 bg-purple-500 rounded-full"></span> Visuals</h3>
                            <div className="space-y-1 bg-white/5 p-2 rounded-lg border border-white/5">
                                <div className="flex justify-between text-xs"><Label>Particles</Label><span className="font-mono text-cyan-500">{particleCount}</span></div>
                                <Slider value={[particleCount]} min={0} max={200} step={1} onValueChange={handleParticleChange} />
                            </div>
                            <div className="space-y-1 bg-white/5 p-2 rounded-lg border border-white/5">
                                <div className="flex justify-between text-xs"><Label>Reflections</Label><span className="font-mono text-cyan-500">{reflectionQuality === 1 ? 'Low' : reflectionQuality === 2 ? 'Med' : 'Hi'}</span></div>
                                <Slider value={[reflectionQuality]} min={1} max={3} step={1} onValueChange={handleQualityChange} />
                            </div>
                        </div>
                    </>
                )}
            </div>
         </div>
      </Html>
    </group>
  );
};
export default SettingsPane;
