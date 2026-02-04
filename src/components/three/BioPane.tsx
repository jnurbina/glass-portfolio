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
  const { style, distanceFactor, isMobile } = useResponsivePane(1000, 600);

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
         <div className={`w-full h-full bg-black/90 text-white relative rounded-xl border border-cyan-500/50 backdrop-blur-md flex flex-col md:flex-row gap-8 ${isMobile ? 'p-4' : 'p-8'}`}>
            <button onClick={onClose} aria-label="Close Pane" className="absolute top-4 right-4 text-cyan-500 hover:text-white text-xl font-bold z-50">[ X ]</button>
            
            {/* Left Column: Image/Avatar (Placeholder) */}
            <div className="w-full md:w-1/3 flex flex-col items-center justify-start pt-4 md:pt-8">
                <div className={`${isMobile ? 'w-32 h-32' : 'w-48 h-48'} rounded-full border-4 border-cyan-500/30 overflow-hidden mb-6 shadow-[0_0_20px_rgba(6,182,212,0.5)]`}>
                    <img src="/profile.png" alt="Profile" className="w-full h-full object-cover" onError={(e) => e.currentTarget.src = 'https://github.com/jnurbina.png'} />
                </div>
                <h2 className="text-2xl font-bold text-cyan-400 mb-2 text-center">Jason Urbina</h2>
                <h3 className="text-lg text-white/60 font-mono mb-2 md:mb-6 text-center">Creative Technologist</h3>
            </div>

            {/* Right Column: Content */}
            <div className="w-full md:w-2/3 flex flex-col overflow-y-auto custom-scrollbar pr-2">
                 <h2 className="text-3xl md:text-4xl font-bold mb-4 md:mb-6 text-cyan-400 tracking-widest text-center md:text-left">[ BIO ]</h2>
                 
                 <div className="space-y-4 text-white/80 leading-relaxed text-base md:text-lg mb-8">
                    <p>
                        I am a software engineer with a passion for creative coding, audio synthesis, and interactive 3D experiences.
                    </p>
                    <p>
                        Bridging the gap between artistic expression and technical implementation, I build immersive web applications that push the boundaries of the browser.
                    </p>
                 </div>

                 <div className="space-y-6">
                    <div>
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center justify-center md:justify-start gap-2">
                            <FaCode className="text-cyan-500" /> Connect
                        </h3>
                        <div className="flex flex-wrap justify-center md:justify-start gap-4">
                            {[...(codeSocials?.links || []), ...(comms?.links || [])].map((link) => {
                                 const Icon = link.icon;
                                 return (
                                    <a 
                                        key={link.url} 
                                        href={link.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-500/50 rounded-lg transition-all group"
                                    >
                                        <span className="text-cyan-500 group-hover:text-cyan-300">
                                            {typeof Icon === 'string' ? <img src={Icon} alt="" className="w-5 h-5" /> : <Icon />}
                                        </span>
                                        <span>{link.title}</span>
                                    </a>
                                 );
                            })}
                        </div>
                    </div>
                 </div>
            </div>
         </div>
      </Html>
    </group>
  );
};
export default BioPane;
