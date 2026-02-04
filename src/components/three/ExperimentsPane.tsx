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
  const { style, distanceFactor, isMobile } = useResponsivePane(1000, 600);
  
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
         <div className={`w-full h-full bg-black/90 text-white relative rounded-xl border border-cyan-500/50 backdrop-blur-md flex flex-col ${isMobile ? 'p-4' : 'p-6 max-w-4xl mx-auto'}`}>
            <button onClick={onClose} aria-label="Close Pane" className="absolute top-4 right-4 text-cyan-500 hover:text-white text-xl font-bold z-50">[ X ]</button>
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-cyan-400 tracking-widest text-center">[ EXPERIMENTS ]</h2>
            
            <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-4 overflow-y-auto pr-2 custom-scrollbar`}>
                {experimentsData.map((item) => (
                    <div key={item.id} className="bg-white/5 border border-white/10 rounded-lg p-4 md:p-6 hover:bg-white/10 transition-all hover:border-cyan-500/50 group flex flex-col">
                        <div className="flex justify-between items-start mb-2 md:mb-4">
                            <h3 className="text-lg md:text-xl font-bold group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                            {item.type === 'link' ? <FaExternalLinkAlt className="text-white/50" /> : <FaPlay className="text-white/50" />}
                        </div>
                        <p className="text-white/70 mb-4 md:mb-6 flex-1 text-sm md:text-base">{item.description}</p>
                        
                        {item.type === 'link' ? (
                            <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 w-full py-2 md:py-3 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-300 rounded transition-colors font-mono uppercase text-xs md:text-sm border border-cyan-500/30"
                            >
                                Open Project <FaExternalLinkAlt size={12} />
                            </a>
                        ) : (
                            <button 
                                onClick={() => item.actionId && handleAction(item.actionId)}
                                className="inline-flex items-center justify-center gap-2 w-full py-2 md:py-3 bg-purple-500/20 hover:bg-purple-500/40 text-purple-300 rounded transition-colors font-mono uppercase text-xs md:text-sm border border-purple-500/30"
                            >
                                Run Simulation <FaPlay size={12} />
                            </button>
                        )}
                    </div>
                ))}
            </div>
         </div>
      </Html>
    </group>
  );
};
export default ExperimentsPane;
