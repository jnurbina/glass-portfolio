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
  const { style, distanceFactor, isMobile, isDesktop, tier } = useResponsivePane(900, 700);

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
         <div className={`w-full h-full bg-black/90 text-white relative rounded-xl border border-cyan-500/50 backdrop-blur-md flex flex-col ${isDesktop ? 'p-4' : 'p-4'}`}>

            {/* Header / Nav */}
            <div className={`flex justify-between items-center ${isDesktop ? 'mb-3 pb-2' : 'mb-3 pb-2'} border-b border-white/10 ${isMobile ? 'flex-col gap-3' : ''}`}>
                <div className={`flex ${isMobile ? 'gap-2' : 'gap-5'}`}>
                    <button
                        onClick={() => setActiveTab('resources')}
                        className={`${isDesktop ? 'text-sm' : 'text-sm'} font-bold tracking-widest transition-colors ${activeTab === 'resources' ? 'text-cyan-400' : 'text-white/40 hover:text-white'}`}
                    >
                        [ RESOURCES ]
                    </button>
                    <button
                         onClick={() => setActiveTab('achievements')}
                         className={`${isDesktop ? 'text-sm' : 'text-sm'} font-bold tracking-widest transition-colors ${activeTab === 'achievements' ? 'text-cyan-400' : 'text-white/40 hover:text-white'}`}
                    >
                        [ ACHIEVEMENTS ]
                    </button>
                </div>
                <button onClick={onClose} aria-label="Close Pane" className={`text-cyan-500 hover:text-white ${isDesktop ? 'text-sm' : 'text-lg'} font-bold ${isMobile ? 'absolute top-4 right-4' : ''}`}>[ X ]</button>
            </div>

            <div className="flex-1 min-h-0 overflow-hidden">
                {activeTab === 'resources' ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <p className={`${isDesktop ? 'text-sm mb-4' : 'text-sm mb-4'} text-white/80 max-w-sm`}>
                            Grab a copy of my resume or check back for more goodies.
                        </p>

                        <div className={`flex flex-col ${isDesktop ? 'gap-3' : 'gap-3'} w-full ${isDesktop ? 'max-w-[320px]' : 'max-w-sm'}`}>
                            {forYouCategory?.links.map((link) => (
                                <a
                                    key={link.url}
                                    href={link.url}
                                    download
                                    className={`flex items-center ${isDesktop ? 'gap-4 px-5 py-4' : 'gap-3 px-4 py-3'} bg-cyan-500/20 hover:bg-cyan-500/40 border border-cyan-500/50 rounded-lg transition-all hover:scale-105 group`}
                                >
                                    <FaFilePdf className={`${isDesktop ? 'text-2xl' : 'text-2xl'} text-cyan-400 group-hover:text-white`} />
                                    <div className="text-left">
                                        <div className={`${isDesktop ? 'text-base' : 'text-base'} font-bold group-hover:text-cyan-300`}>{link.title}</div>
                                        <div className={`${isDesktop ? 'text-xs' : 'text-[10px]'} text-cyan-200/60 uppercase tracking-widest flex items-center gap-1`}>
                                            Download <FaDownload size={isDesktop ? 12 : 10} />
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className={`${isDesktop ? 'flex flex-wrap gap-3 content-center justify-center items-center h-full' : 'grid grid-cols-1 gap-2'}`}>
                        {achievements.map((achievement) => {
                            const isUnlocked = unlockedAchievements.includes(achievement.id);
                            return (
                                <div key={achievement.id} title={achievement.description}
                                    className={`${isDesktop ? 'px-4 py-2 inline-flex' : 'p-2 flex'} rounded-lg items-center gap-2.5 ${
                                        isUnlocked ? 'bg-cyan-900/30 border border-cyan-500/50' : 'bg-white/5 border border-white/5 opacity-40'
                                    }`}>
                                    {isUnlocked ? <FaTrophy size={isDesktop ? 14 : 12} className="text-cyan-400" /> : <FaLock size={isDesktop ? 14 : 12} className="text-white/30" />}
                                    <span className={`font-mono ${isDesktop ? 'text-xs' : 'text-[11px]'} ${isUnlocked ? 'text-cyan-300' : 'text-white/50'}`}>{achievement.title}</span>
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
