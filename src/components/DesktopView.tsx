"use client";

import { useState, useEffect, useRef } from 'react';
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
  { title: '[ Explore 1J1 ]', action: 'explore' },
  { title: '[ Interact ]', action: 'interact' },
  // { title: '[ MOVING SALE ]', action: 'movingsale' },
];

export default function DesktopView() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [assetsReady, setAssetsReady] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [activeView, setActiveView] = useState<ViewMode>('home');
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
      setActiveView('experiments');
      unlockAchievement('intrigued-adventurist');
    } else if (action === 'movingsale') {
      router.push('/movingsale');
    }
  };

  const handleCloseView = () => {
    setActiveView('home');
    unlockAchievement('drawer-puller');
  };

  const handleNavigate = (view: ViewMode) => {
    setActiveView(view);
  };

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <LaughingMan loading={!assetsReady} onLoadComplete={() => setIsLoaded(true)} />

      <ThreeCanvasProvider>
        <ThreeCanvas
          onLoaded={() => setAssetsReady(true)}
          showLogo={showLogo && activeView === 'home'}
          activeView={activeView}
          onCloseView={handleCloseView}
          onNavigate={handleNavigate}
        />
      </ThreeCanvasProvider>

      <AnimatePresence>
        {isLoaded && showMenu && activeView === 'home' && <FF7Menu menuItems={menuItems} onSelect={handleMenuSelect} muteButtonRef={muteButtonRef} isMuteButtonFocused={isMuteButtonFocused} />}
      </AnimatePresence>
      <MuteButton ref={muteButtonRef} onFocus={() => setIsMuteButtonFocused(true)} onBlur={() => setIsMuteButtonFocused(false)} />
    </div>
  );
}
