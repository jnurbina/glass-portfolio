"use client";

import React, { useState, useEffect, useCallback } from 'react';
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

const ThreeCanvas = dynamic(() => import('./ThreeCanvas.client'), { ssr: false });

const menuItems = [
  { title: '[ Explore 1J1 ]', action: 'explore' },
  { title: '[ Interact ]', action: 'interact' },
  { title: '[ MOVING SALE ]', action: 'movingsale' },
];

export default function DesktopView() {
  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const [isInteracted, setIsInteracted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInteractView, setIsInteractView] = useState(false);
  const { unlockAchievement } = useAchievementState();
  const router = useRouter();

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

  const handleBack = () => {
    setIsInteractView(false);
    unlockAchievement('drawer-puller');
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

  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const { clientX, clientY, currentTarget } = event;
    const { width, height } = currentTarget.getBoundingClientRect();
    // Normalize mouse position from -1 to 1
    const x = (clientX / width) * 2 - 1;
    const y = -(clientY / height) * 2 + 1;
    setMousePosition({ x, y });
  };

  if (!preloaderComplete) {
    return <LaughingMan onLoadComplete={() => setPreloaderComplete(true)} />;
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }} onMouseMove={handleMouseMove}>
      {!isInteracted && <InteractionOverlay onInteract={handleInteraction} />}
      
      <ThreeCanvasProvider>
        <ThreeCanvas 
          onLoaded={() => setIsLoaded(true)} 
          showLogo={showLogo && !isInteractView} 
          mousePosition={mousePosition} 
        />
      </ThreeCanvasProvider>

      <AnimatePresence>
        {isLoaded && showMenu && !isInteractView && <FF7Menu menuItems={menuItems} onSelect={handleMenuSelect} />}
      </AnimatePresence>

      <AnimatePresence>
        {isInteractView && <InteractView />}
      </AnimatePresence>

      {isInteractView && (
        <button
          className="absolute top-8 right-8 text-white text-2xl"
          onClick={handleBack}
        >
          [ Back ]
        </button>
      )}
    </div>
  );
}