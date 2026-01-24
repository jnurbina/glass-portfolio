import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { categories } from '@/lib/interact-data';
import { FaSoundcloud, FaSpotify, FaInstagram, FaTiktok } from 'react-icons/fa';
import { useAchievementState } from '@/hooks/use-achievement-state';
import { useResponsivePane } from '@/hooks/use-responsive-pane';

interface PaneProps {
  onClose: () => void;
}

const AudioPane = ({ onClose }: PaneProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { unlockAchievement } = useAchievementState();
  const { style, distanceFactor, isMobile } = useResponsivePane(900, 600);

  useEffect(() => {
    unlockAchievement('dj');
  }, [unlockAchievement]);

  const audioCategory = categories.find(c => c.title === '[ Music Socials ]');
  
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
         <div className={`w-full h-full bg-black/90 text-white relative rounded-xl border border-cyan-500/50 backdrop-blur-md flex flex-col ${isMobile ? 'p-4' : 'p-8'}`}>
            <button onClick={onClose} aria-label="Close Pane" className="absolute top-4 right-4 text-cyan-500 hover:text-white text-xl font-bold z-50">[ X ]</button>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-10 text-cyan-400 tracking-widest text-center">[ AUDIO ]</h2>
            
            <div className="flex-1 flex flex-col justify-center items-center gap-4 md:gap-6 overflow-y-auto">
                <p className="text-white/70 mb-2 md:mb-4 text-center max-w-lg text-sm md:text-base">
                    Explore my musical identity as <strong className="text-cyan-300">DOSC</strong>. 
                    House, Techno, and experimental soundscapes.
                </p>

                <div className={`grid ${isMobile ? 'grid-cols-1 w-full' : 'grid-cols-1 md:grid-cols-2 w-full max-w-3xl'} gap-3 md:gap-4`}>
                    {audioCategory?.links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <a 
                                key={link.url}
                                href={link.url}
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 p-3 md:p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-cyan-500/50 hover:scale-105 transition-all group"
                            >
                                <span className="text-2xl md:text-3xl text-cyan-500 group-hover:text-cyan-300">
                                     {typeof Icon === 'string' ? <img src={Icon} alt="" className="w-8 h-8 opacity-80" /> : <Icon />}
                                </span>
                                <span className="text-base md:text-lg font-mono tracking-wide">{link.title}</span>
                            </a>
                        );
                    })}
                </div>
            </div>
         </div>
      </Html>
    </group>
  );
};
export default AudioPane;
