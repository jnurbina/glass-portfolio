import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { experimentsData } from '@/lib/experiments-data';
import { FaExternalLinkAlt, FaPlay } from 'react-icons/fa';
import { audioEngine } from '@/lib/audio/audio';
import { useAchievementState } from '@/hooks/use-achievement-state';
import { useResponsivePane } from '@/hooks/use-responsive-pane';
import { ViewMode } from '@/lib/view-types';

interface PaneProps {
  onClose: () => void;
  onNavigate?: (view: ViewMode) => void;
}

const ExperimentsPane = ({ onClose, onNavigate }: PaneProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { unlockAchievement } = useAchievementState();
  const { style, distanceFactor, isMobile, isDesktop, tier } = useResponsivePane(1000, 700);
  
  useFrame((state) => {
    if (groupRef.current) {
        const time = state.clock.getElapsedTime();
        groupRef.current.position.y = Math.sin(time * 1.5) * 0.1;
        groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.02;
    }
  });

  const handleAction = (actionId: string) => {
    console.log('Triggering action:', actionId);
    audioEngine.play('select');
    
    if (actionId === 'launch_game' && onNavigate) {
        onNavigate('game');
        return;
    }
    
    if (actionId === 'launch_rubiks' && onNavigate) {
        onNavigate('rubiks');
        return;
    }

    if (actionId === 'launch_hinges' && onNavigate) {
        onNavigate('hinges');
        return;
    }

    unlockAchievement('mad-scientist');
    // Here we would trigger the 3D effect. 
    // For now, let's just use a window alert or similar visual cue if we can't easily reach the scene state yet.
    // In a real implementation, we'd use a global store (Zustand) or Context to signal the Scene.
  };

  return (
    <group ref={groupRef} position={[0, 0, 10]}>
      <Html transform position={[0, 0, 0]} distanceFactor={distanceFactor} zIndexRange={[100, 0]} style={style}>
         <div className={`w-full h-full bg-black/90 text-white relative rounded-xl border border-cyan-500/50 backdrop-blur-md flex flex-col ${isDesktop ? 'p-4' : 'p-4'}`}>
            <button onClick={onClose} aria-label="Close Pane" className={`absolute top-2 right-2 text-cyan-500 hover:text-white ${isDesktop ? 'text-sm' : 'text-lg'} font-bold z-50`}>[ X ]</button>
            <h2 className={`${isDesktop ? 'text-sm mb-3' : isMobile ? 'text-lg mb-3' : 'text-base mb-3'} font-bold text-cyan-400 tracking-widest text-center`}>[ EXPERIMENTS ]</h2>

            <div className={`${isDesktop ? 'flex flex-wrap gap-3 content-center justify-center items-center' : 'grid grid-cols-1 gap-3'} flex-1 min-h-0 overflow-hidden`}>
                {experimentsData.map((item) => (
                    isDesktop ? (
                        item.type === 'link' ? (
                            <a key={item.id} href={item.url} target="_blank" rel="noopener noreferrer"
                                className="inline-flex items-center gap-2.5 px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded-lg text-sm font-mono border border-cyan-500/30 hover:scale-105 transition-transform">
                                {item.title} <FaExternalLinkAlt size={12} />
                            </a>
                        ) : (
                            <button key={item.id} onClick={() => item.actionId && handleAction(item.actionId)}
                                className="inline-flex items-center gap-2.5 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded-lg text-sm font-mono border border-purple-500/30 hover:scale-105 transition-transform">
                                {item.title} <FaPlay size={12} />
                            </button>
                        )
                    ) : (
                        <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-3 hover:bg-white/10 transition-all hover:border-cyan-500/50 group flex flex-col">
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="text-base font-bold group-hover:text-cyan-300">{item.title}</h3>
                                {item.type === 'link' ? <FaExternalLinkAlt className="text-white/50" size={10} /> : <FaPlay className="text-white/50" size={10} />}
                            </div>
                            <p className="text-white/70 mb-3 text-xs flex-1">{item.description}</p>
                            {item.type === 'link' ? (
                                <a href={item.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-1 w-full py-2 text-xs bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded font-mono uppercase border border-cyan-500/30">
                                    Open <FaExternalLinkAlt size={10} />
                                </a>
                            ) : (
                                <button onClick={() => item.actionId && handleAction(item.actionId)} className="inline-flex items-center justify-center gap-1 w-full py-2 text-xs bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded font-mono uppercase border border-purple-500/30">
                                    Run <FaPlay size={10} />
                                </button>
                            )}
                        </div>
                    )
                ))}
            </div>
         </div>
      </Html>
    </group>
  );
};
export default ExperimentsPane;
