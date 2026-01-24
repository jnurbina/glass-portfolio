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

const ThreeCanvas = dynamic(() => import('./ThreeCanvas.client'), { ssr: false });

const menuItems = [
  { title: '[ Explore 1J1 ]', action: 'explore' },
  { title: '[ Interact ]', action: 'interact' },
  // { title: '[ MOVING SALE ]', action: 'movingsale' },
];

export default function DesktopView() {
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

  const handleMenuSelect = (action: string) => {
    if (action === 'interact') {
      setIsInteractView(true);
      unlockAchievement('intrigued-adventurist');
    } else if (action === 'movingsale') {
      router.push('/movingsale');
    }
  };

  const handleBack = () => {
    setIsInteractView(false);
    unlockAchievement('drawer-puller');
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <LaughingMan loading={!isLoaded} />
      
      <ThreeCanvasProvider>
        <ThreeCanvas 
          onLoaded={() => setIsLoaded(true)} 
          showLogo={showLogo && !isInteractView}
          isInteractView={isInteractView}
          onCloseInteract={handleBack}
        />
      </ThreeCanvasProvider>

      <AnimatePresence>
        {isLoaded && showMenu && !isInteractView && <FF7Menu menuItems={menuItems} onSelect={handleMenuSelect} muteButtonRef={muteButtonRef} isMuteButtonFocused={isMuteButtonFocused} />}
      </AnimatePresence>
      <MuteButton ref={muteButtonRef} onFocus={() => setIsMuteButtonFocused(true)} onBlur={() => setIsMuteButtonFocused(false)} />
    </div>
  );
}