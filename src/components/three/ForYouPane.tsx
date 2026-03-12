import React, { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { categories } from '@/lib/interact-data';
import { FaFilePdf, FaDownload, FaTrophy, FaLock } from 'react-icons/fa';
import { useAchievementState, achievements } from '@/hooks/use-achievement-state';
import { useResponsivePane } from '@/hooks/use-responsive-pane';

interface PaneProps {
  onClose: () => void;
}

const ForYouPane = ({ onClose }: PaneProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const { unlockAchievement, unlockedAchievements } = useAchievementState();
  const [activeTab, setActiveTab] = useState<'resources' | 'achievements'>('resources');
  const { style, distanceFactor, isMobile } = useResponsivePane(900, 600);

  useEffect(() => {
    unlockAchievement('resume-reader');
  }, [unlockAchievement]);

  const forYouCategory = categories.find(c => c.title === '[ For You ]');
  
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
            
            {/* Header / Nav */}
            <div className={`flex justify-between items-center mb-4 md:mb-8 border-b border-white/10 pb-4 ${isMobile ? 'flex-col gap-4' : ''}`}>
                <div className="flex gap-4">
                    <button 
                        onClick={() => setActiveTab('resources')}
                        className={`text-base md:text-xl font-bold tracking-widest transition-colors ${activeTab === 'resources' ? 'text-cyan-400' : 'text-white/40 hover:text-white'}`}
                    >
                        [ RESOURCES ]
                    </button>
                    <button 
                         onClick={() => setActiveTab('achievements')}
                         className={`text-base md:text-xl font-bold tracking-widest transition-colors ${activeTab === 'achievements' ? 'text-cyan-400' : 'text-white/40 hover:text-white'}`}
                    >
                        [ ACHIEVEMENTS ]
                    </button>
                </div>
                <button onClick={onClose} aria-label="Close Pane" className={`text-cyan-500 hover:text-white text-xl font-bold ${isMobile ? 'absolute top-4 right-4' : ''}`}>[ X ]</button>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                {activeTab === 'resources' ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className="text-base md:text-xl text-white/80 mb-6 md:mb-12 max-w-lg">
                            I&apos;ve prepared some resources for you. Grab a copy of my resume or check back later for more digital goodies.
                        </p>

                        <div className="flex flex-col gap-4 md:gap-6 w-full max-w-md">
                            {forYouCategory?.links.map((link) => (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    download
                                    className="flex items-center gap-4 md:gap-6 px-6 md:px-12 py-4 md:py-6 bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 rounded-2xl transition-all hover:scale-105 group"
                                >
                                    <FaFilePdf className="text-3xl md:text-4xl text-cyan-400 group-hover:text-white" />
                                    <div className="text-left">
                                        <div className="text-lg md:text-2xl font-bold group-hover:text-cyan-300">{link.title}</div>
                                        <div className="text-xs md:text-sm text-cyan-200/60 uppercase tracking-widest flex items-center gap-2">
                                            Download PDF <FaDownload />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={`grid ${isMobile ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'} gap-3 md:gap-4 pb-4`}>
                        {achievements.map((achievement) => {
                            const isUnlocked = unlockedAchievements.includes(achievement.id);
                            return (
                                <div 
                                    key={achievement.id}
                                    className={`p-3 md:p-4 rounded-xl border transition-all flex items-center gap-3 md:gap-4 ${
                                        isUnlocked 
                                            ? 'bg-cyan-900/20 border-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                                            : 'bg-white/5 border-white/5 opacity-50'
                                    }`}
                                >
                                    <div className={`p-2 md:p-3 rounded-full ${isUnlocked ? 'bg-cyan-500 text-black' : 'bg-white/10 text-white/30'}`}>
                                        {isUnlocked ? <FaTrophy size={16} /> : <FaLock size={16} />}
                                    </div>
                                    <div>
                                        <h3 className={`font-bold font-mono text-sm md:text-base ${isUnlocked ? 'text-cyan-300' : 'text-white/60'}`}>
                                            {achievement.title}
                                        </h3>
                                        <p className="text-xs md:text-sm text-white/70">
                                            {achievement.description}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
         </div>
      </Html>
    </group>
  );
};
export default ForYouPane;
