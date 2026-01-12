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

export default function DesktopView() {
  const [preloaderComplete, setPreloaderComplete] = useState(false);
  const [isInteracted, setIsInteracted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isInteractView, setIsInteractView] = useState(false);
  const { unlockAchievement } = useAchievementState();
  const router = useRouter();

  // FIX: Added ref and state for MuteButton to satisfy FF7Menu props
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
        {isLoaded && showMenu && !isInteractView && (
          <FF7Menu 
            menuItems={menuItems} 
            onSelect={handleMenuSelect} 
            // FIX: Pass the required mute button props
            muteButtonRef={muteButtonRef}
            isMuteButtonFocused={isMuteButtonFocused}
          />
        )}
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

      {/* FIX: Render the MuteButton to attach the ref */}
      <MuteButton 
        ref={muteButtonRef} 
        onFocus={() => setIsMuteButtonFocused(true)} 
        onBlur={() => setIsMuteButtonFocused(false)} 
      />
    </div>
  );
}