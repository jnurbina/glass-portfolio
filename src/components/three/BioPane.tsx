import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { categories } from '@/lib/interact-data';
import { FaCode, FaEnvelope } from 'react-icons/fa';
import { useAchievementState } from '@/hooks/use-achievement-state';
import { useResponsivePane } from '@/hooks/use-responsive-pane';

interface PaneProps {
  onClose: () => void;
}

const BioPane = ({ onClose }: PaneProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { unlockAchievement } = useAchievementState();
  const { style, distanceFactor, isMobile, isDesktop, tier } = useResponsivePane(1000, 700);

  useEffect(() => {
    unlockAchievement('stalker');
  }, [unlockAchievement]);
  
  const codeSocials = categories.find(c => c.title === '[ Code Socials ]');
  const comms = categories.find(c => c.title === '[ Comms ]');

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
         <div className={`w-full h-full bg-black/90 text-white relative rounded-xl border border-cyan-500/50 backdrop-blur-md flex ${isDesktop ? 'flex-row gap-4 p-4' : isMobile ? 'flex-col gap-4 p-4' : 'flex-col lg:flex-row gap-6 p-6'} overflow-hidden`}>
            <button onClick={onClose} aria-label="Close Pane" className={`absolute ${isDesktop ? 'top-2 right-2 text-sm' : 'top-4 right-4 text-xl'} text-cyan-500 hover:text-white font-bold z-50`}>[ X ]</button>

            {/* Left Column: Image/Avatar */}
            <div className={`${isDesktop ? 'w-1/3' : isMobile ? 'w-full' : 'w-full lg:w-1/3'} flex flex-col items-center justify-center shrink-0`}>
                <div className={`${isDesktop ? 'w-16 h-16' : isMobile ? 'w-20 h-20' : 'w-28 h-28'} rounded-full border-2 border-cyan-500/30 overflow-hidden ${isDesktop ? 'mb-2' : 'mb-3'} shadow-[0_0_15px_rgba(6,182,212,0.4)]`}>
                    <img src="https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/profile.jfif" alt="Profile" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://github.com/jnurbina.png'} />
                </div>
                <h2 className={`${isDesktop ? 'text-sm' : isMobile ? 'text-lg' : 'text-xl'} font-bold text-cyan-400 text-center`}>Jason Urbina</h2>
                <h3 className={`${isDesktop ? 'text-xs' : isMobile ? 'text-xs' : 'text-sm'} text-white/60 font-mono text-center`}>Creative Technologist</h3>
            </div>

            {/* Right Column: Content */}
            <div className={`${isDesktop ? 'w-2/3' : 'w-full'} flex flex-col min-h-0 justify-center`}>
                 {!isDesktop && <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-2 text-cyan-400 tracking-widest text-center lg:text-left`}>[ BIO ]</h2>}

                 <div className={`${isDesktop ? 'text-xs space-y-2 mb-3' : isMobile ? 'text-sm space-y-2 mb-4' : 'text-base space-y-3 mb-4'} text-white/80 leading-relaxed`}>
                    <p>Software engineer passionate about creative coding, audio synthesis, and interactive 3D experiences.</p>
                    <p>Bridging artistic expression and technical implementation to build immersive web applications.</p>
                 </div>

                 <div>
                    {!isDesktop && <h3 className={`${isMobile ? 'text-base' : 'text-lg'} font-bold text-white mb-2 flex items-center justify-center lg:justify-start gap-2`}><FaCode className="text-cyan-500" /> Connect</h3>}
                    <div className={`flex flex-wrap ${isDesktop ? 'gap-2' : 'gap-2 justify-center lg:justify-start'}`}>
                            {[...(codeSocials?.links || []), ...(comms?.links || [])].map((link) => {
                                 const Icon = link.icon;
                                 return (
                                    <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                                        className={`flex items-center ${isDesktop ? 'gap-2 px-2.5 py-1.5 text-xs' : 'gap-2 px-3 py-1.5 text-sm'} bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 rounded transition-all group hover:scale-105`}>
                                        <span className={`text-cyan-500 group-hover:text-cyan-300 ${isDesktop ? 'text-sm' : 'text-sm'}`}>
                                            {typeof Icon === 'string' ? <img src={Icon} alt="" className={`${isDesktop ? 'w-4 h-4' : 'w-4 h-4'}`} /> : <Icon />}
                                        </span>
                                        <span>{link.title}</span>
                                    </a>
                                 );
                            })}
                        </div>
                    </div>
            </div>
         </div>
      </Html>
    </group>
  );
};
export default BioPane;
