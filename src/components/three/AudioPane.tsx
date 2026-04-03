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
  const { style, distanceFactor, isMobile, isDesktop, tier } = useResponsivePane(900, 700);

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
         <div className={`w-full h-full bg-black/90 text-white relative rounded-xl border border-cyan-500/50 backdrop-blur-md flex flex-col ${isDesktop ? 'p-4' : 'p-4'}`}>
            <button onClick={onClose} aria-label="Close Pane" className={`absolute top-2 right-2 text-cyan-500 hover:text-white ${isDesktop ? 'text-sm' : 'text-lg'} font-bold z-50`}>[ X ]</button>
            <h2 className={`${isDesktop ? 'text-sm mb-3' : isMobile ? 'text-xl mb-3' : 'text-base mb-3'} font-bold text-cyan-400 tracking-widest text-center`}>[ AUDIO ]</h2>

            <div className={`flex-1 flex flex-col justify-center items-center ${isDesktop ? 'gap-4' : 'gap-3'}`}>
                <p className={`text-white/70 ${isDesktop ? 'text-sm mb-2' : 'text-xs mb-2'} text-center max-w-sm`}>
                    Explore my musical identity as <strong className="text-cyan-300">DOSC</strong>.
                </p>

                <div className={`grid ${isDesktop ? 'grid-cols-2 gap-3' : isMobile ? 'grid-cols-1 gap-2' : 'grid-cols-2 gap-2'} w-full ${isDesktop ? 'max-w-[420px]' : 'max-w-md'}`}>
                    {audioCategory?.links.map((link) => {
                        const Icon = link.icon;
                        return (
                            <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                                className={`flex items-center ${isDesktop ? 'gap-3 p-3' : isMobile ? 'gap-2 p-3' : 'gap-2 p-2'} bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 hover:border-cyan-500/50 transition-all group hover:scale-105`}>
                                <span className={`${isDesktop ? 'text-xl' : isMobile ? 'text-xl' : 'text-lg'} text-cyan-500 group-hover:text-cyan-300`}>
                                     {typeof Icon === 'string' ? <img src={Icon} alt="" className={`${isDesktop ? 'w-6 h-6' : 'w-5 h-5'} opacity-80`} /> : <Icon />}
                                </span>
                                <span className={`${isDesktop ? 'text-sm' : isMobile ? 'text-sm' : 'text-xs'} font-mono tracking-wide`}>{link.title}</span>
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
