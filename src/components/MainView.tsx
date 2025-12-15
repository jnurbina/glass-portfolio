"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import FF7Menu from './FF7Menu';
import InteractionOverlay from './ui/InteractionOverlay';
import { audioEngine } from '@/lib/audio/audio';
import { ThreeCanvasProvider } from '@/hooks/use-three-canvas-state';
import InteractView from './InteractView';
import { AnimatePresence } from 'framer-motion';
import { useAchievementState } from '@/hooks/use-achievement-state';
import LaughingMan from './LaughingMan';
import { MuteButton } from './ui/MuteButton';

const ThreeCanvas = dynamic(() => import('./ThreeCanvas.client'), { ssr: false });

const menuItems = [
  { title: '[ Explore 1J1 ]', action: 'explore' },
  { title: '[ Interact ]', action: 'interact' },
  // { title: '[ MOVING SALE ]', action: 'movingsale' },
];

export default function MainView() {
  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const [isInteracted, setIsInteracted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isInteractView, setIsInteractView] = useState(false);
  const { unlockAchievement } = useAchievementState();
  const router = useRouter();
  const muteButtonRef = useRef<HTMLButtonElement>(null);
  const [isMuteButtonFocused, setIsMuteButtonFocused] = useState(false);
    
    useEffect(() => {
      // Cleanup audio on component unmount
      return () => {
        audioEngine.stop('background');
      };
    }, []);
  
    const handleInteraction = useCallback(() => {
      audioEngine.init(() => {
        setIsInteracted(true);
        audioEngine.play('background', true);
      });
    }, []);
  
    const handleMenuSelect = (action: string) => {
      if (action === 'interact') {
        setIsInteractView(true);
        unlockAchievement('intrigued-adventurist');
      } else if (action === 'movingsale') {
        router.push('/movingsale');
      }
    };
  
    useEffect(() => {
      // New animation sequence controlled by isLoaded and isInteracted
      if (isLoaded && isInteracted) {
        const timer1 = setTimeout(() => setShowLogo(true), 500); // 1. Fade in logo
        const timer2 = setTimeout(() => setShowMenu(true), 1500); // 2. Fade in menu
        return () => {
          clearTimeout(timer1);
          clearTimeout(timer2);
        };
      }
    }, [isLoaded, isInteracted]);
  
    useEffect(() => {
        let afkTimer: NodeJS.Timeout;
        const resetAfkTimer = () => {
          clearTimeout(afkTimer);
          afkTimer = setTimeout(() => {
            unlockAchievement('afk');
          }, 60000);
        };
    
        const konamiCode = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
        let konamiCodePosition = 0;
        const handleKeyDown = (e: KeyboardEvent) => {
          resetAfkTimer();
          if (e.key === konamiCode[konamiCodePosition]) {
            konamiCodePosition++;
            if (konamiCodePosition === konamiCode.length) {
              unlockAchievement('konami-code');
              konamiCodePosition = 0;
            }
          } else {
            konamiCodePosition = 0;
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
      }, [unlockAchievement]);  
    if (!preloaderComplete) {
      return <LaughingMan onLoadComplete={() => setPreloaderComplete(true)} />;
    }
  
    return (
      <div style={{ width: '100vw', height: '100vh' }}>
        {!isInteracted && <InteractionOverlay onInteract={handleInteraction} />}
        
        <ThreeCanvasProvider>
          <ThreeCanvas 
            onLoaded={() => setIsLoaded(true)} 
            showLogo={showLogo && !isInteractView} 
          />
        </ThreeCanvasProvider>
  
        <AnimatePresence>
          {isLoaded && showMenu && !isInteractView && <FF7Menu menuItems={menuItems} onSelect={handleMenuSelect} muteButtonRef={muteButtonRef} isMuteButtonFocused={isMuteButtonFocused} />}
        </AnimatePresence>
  
        <AnimatePresence>
          {isInteractView && <InteractView />}
        </AnimatePresence>
  
        {isInteractView && (
          <button
            className="absolute top-8 right-8 text-white text-2xl"
            onClick={() => setIsInteractView(false)}
          >
            [ Back ]
          </button>
        )}
        <MuteButton ref={muteButtonRef} onFocus={() => setIsMuteButtonFocused(true)} onBlur={() => setIsMuteButtonFocused(false)} />
      </div>
    );
  }
