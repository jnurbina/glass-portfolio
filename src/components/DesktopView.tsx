"use client";

import React, { useState, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import FF7Menu from './FF7Menu';
import InteractionOverlay from './ui/InteractionOverlay';
import { audioEngine } from '@/lib/audio/audio';
import AudioPlayer from './AudioPlayer';
import { ThreeCanvasProvider } from '@/hooks/use-three-canvas-state';

const ThreeCanvas = dynamic(() => import('./ThreeCanvas.client'), { ssr: false });

const menuItems = [
  { title: '[ Explore 1J1 ]' },
  { title: '[ Interact ]' },
];

export default function DesktopView() {
  const [isInteracted, setIsInteracted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showLogo, setShowLogo] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const handleInteraction = useCallback(() => {
    audioEngine.init(() => {
      setIsInteracted(true);
      audioEngine.play('background', true);
    });
  }, []);

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

  return (
    <div style={{ width: '100vw', height: '100vh' }} onMouseMove={handleMouseMove}>
      {!isInteracted && <InteractionOverlay onInteract={handleInteraction} />}
      
      <ThreeCanvasProvider>
        <ThreeCanvas 
          onLoaded={() => setIsLoaded(true)} 
          showLogo={showLogo} 
          mousePosition={mousePosition} 
        />
      </ThreeCanvasProvider>

      {isLoaded && showMenu && <FF7Menu menuItems={menuItems} />}
      <AudioPlayer />
    </div>
  );
}