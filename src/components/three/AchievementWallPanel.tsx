import React, { useRef } from 'react';
import { Html } from '@react-three/drei';
import { useAchievementState } from '@/hooks/use-achievement-state';
import { useResponsivePane } from '@/hooks/use-responsive-pane';

const AchievementWallPanel = () => {
    const { achievementCount, totalAchievements } = useAchievementState();
    // We override the default hook logic a bit here because this panel is huge
    const { isMobile } = useResponsivePane(1500, 500);

    return (
        <group position={[0, 8, -14.8]}> {/* Lowered slightly, widened */}
            <Html
                transform
                occlude="blending"
                position={[0, 0, 0]}
                distanceFactor={10}
                zIndexRange={[0, 0]}
                style={{
                    width: isMobile ? '80vw' : '1500px',
                    height: isMobile ? '200px' : '500px',
                    userSelect: 'none',
                    pointerEvents: 'none',
                }}
            >
                <div className={`w-full h-full bg-black/80 border-2 md:border-4 border-cyan-500/50 rounded-xl md:rounded-3xl flex flex-col items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] backdrop-blur-sm relative overflow-hidden ${isMobile ? 'p-4' : ''}`}>
                    {/* Scanline effect */}
                    <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none z-10" />
                    
                    <h3 className={`text-cyan-400 font-mono ${isMobile ? 'text-2xl' : 'text-5xl'} tracking-widest uppercase mb-2 md:mb-4 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)] text-center`}>
                        System Status
                    </h3>
                    <div className="flex items-baseline gap-4 mb-2">
                         <span className={`text-white ${isMobile ? 'text-xs tracking-widest' : 'text-2xl tracking-[0.5em]'} uppercase opacity-70`}>Achievements Unlocked</span>
                    </div>
                    <div className={`${isMobile ? 'text-6xl' : 'text-[12rem]'} leading-none font-mono font-bold text-cyan-500 tracking-widest drop-shadow-[0_0_20px_rgba(34,211,238,1)]`}>
                        {achievementCount}/{totalAchievements}
                    </div>
                    
                    {/* Blinking indicator */}
                    <div className={`absolute ${isMobile ? 'top-4 right-4 w-3 h-3' : 'top-8 right-8 w-6 h-6'} rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_#22c55e]`} />
                </div>
            </Html>
        </group>
    );
};

export default AchievementWallPanel;
