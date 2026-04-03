"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import FF7Menu from './FF7Menu';
import { audioEngine } from '@/lib/audio/audio';
import { ThreeCanvasProvider } from '@/hooks/use-three-canvas-state';
import { AnimatePresence } from 'framer-motion';
import { useAchievementState } from '@/hooks/use-achievement-state';
import LaughingMan from './LaughingMan';
import { MuteButton } from './ui/MuteButton';
import { ViewMode } from '@/lib/view-types';

const ThreeCanvas = dynamic(() => import('./ThreeCanvas.client'), { ssr: false });

const menuItems = [
  { title: '[ Bio ]', action: 'bio' },
  { title: '[ Experience ]', action: 'experience' },
  { title: '[ Experiments ]', action: 'experiments' },
  { title: '[ Audio ]', action: 'audio' },
  { title: '[ For You ]', action: 'foryou' },
];

export default function MainView() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('home');
  const { unlockAchievement } = useAchievementState();
  const router = useRouter();
  const muteButtonRef = useRef<HTMLButtonElement>(null);
  const [isMuteButtonFocused, setIsMuteButtonFocused] = useState(false);
  
  const konamiCodePositionRef = useRef(0);
    
    useEffect(() => {
      // Cleanup audio on component unmount
      return () => {
        audioEngine.stop('background');
      };
    }, []);
  
    // Auto-start animations when loaded
    useEffect(() => {
      if (isLoaded) {
        const timer1 = setTimeout(() => setShowLogo(true), 500); // 1. Fade in logo
        const timer2 = setTimeout(() => setShowMenu(true), 1500); // 2. Fade in menu
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    }, [isLoaded]);

    const handleAssetsReady = useCallback(() => {
      setAssetsReady(true);
    }, []);

    const handleEnterClick = useCallback(() => {
      setIsLoaded(true);
    }, []);

    const handleMenuSelect = (action: string) => {
      setActiveView(action as ViewMode);
      if (action !== 'home') {
          unlockAchievement('intrigued-adventurist');
      }
    };
  
    useEffect(() => {
        let afkTimer: NodeJS.Timeout;
        const resetAfkTimer = () => {
          clearTimeout(afkTimer);
          afkTimer = setTimeout(() => {
            unlockAchievement('afk');
          }, 60000);
        };
        
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];

        const handleKeyDown = (e: KeyboardEvent) => {
          resetAfkTimer();
          
          if (e.key === 'Backspace') {
             if (activeView === 'game') {
                 // Game handles its own inputs
                 return;
             }

             if (activeView === 'home') {
                 setActiveView('settings');
                 audioEngine.play('select');
             } else {
                 // Try to find a close button in the active pane
                 const closeBtn = document.querySelector('button[aria-label="Close Pane"]');
                 if (closeBtn instanceof HTMLElement) {
                     closeBtn.focus();
                     audioEngine.play('hover');
                 } else {
                     setActiveView('home'); // Fallback direct close
                     audioEngine.play('select');
                 }
             }
          }

          if (e.key === konamiCode[konamiCodePositionRef.current]) {
            konamiCodePositionRef.current++;
            if (konamiCodePositionRef.current === konamiCode.length) {
              unlockAchievement('konami-code');
              konamiCodePositionRef.current = 0;
            }
          } else {
            konamiCodePositionRef.current = 0;
          }
        };
    
        window.addEventListener('mousemove', resetAfkTimer);
        window.addEventListener('keydown', handleKeyDown);
        resetAfkTimer();
    
        return () => {
          clearTimeout(afkTimer);
          window.removeEventListener('mousemove', resetAfkTimer);
          window.removeEventListener('keydown', handleKeyDown);
        };
      }, [unlockAchievement, activeView]);  
  
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        <LaughingMan loading={!assetsReady} onLoadComplete={handleEnterClick} />
        
        <ThreeCanvasProvider>
          <ThreeCanvas
            onLoaded={handleAssetsReady}
            showLogo={showLogo && activeView === 'home'}
            activeView={activeView}
            onCloseView={() => setActiveView('home')}
            onNavigate={(view: ViewMode) => setActiveView(view)}
          />
        </ThreeCanvasProvider>
  
        <AnimatePresence>
          {isLoaded && showMenu && activeView === 'home' && <FF7Menu menuItems={menuItems} onSelect={handleMenuSelect} muteButtonRef={muteButtonRef} isMuteButtonFocused={isMuteButtonFocused} />}
        </AnimatePresence>
  
        <MuteButton ref={muteButtonRef} onFocus={() => setIsMuteButtonFocused(true)} onBlur={() => setIsMuteButtonFocused(false)} />
      </div>
    );
  }
