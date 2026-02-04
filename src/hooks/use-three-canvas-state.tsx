"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

interface ThreeCanvasState {
  isPaused: boolean;
  volume: number;
  particleCount: number;
  reflectionQuality: number;
  setIsPaused: (isPaused: boolean) => void;
  setVolume: (volume: number) => void;
  setParticleCount: (particleCount: number) => void;
  setReflectionQuality: (reflectionQuality: number) => void;
}

const ThreeCanvasContext = createContext<ThreeCanvasState | undefined>(undefined);

export const ThreeCanvasProvider = ({ children }: { children: React.ReactNode }) => {
  const [isPaused, setIsPaused] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [particleCount, setParticleCount] = useState(8); // Default reduced for performance
  const [reflectionQuality, setReflectionQuality] = useState(1);

  useEffect(() => {
    // optimize for mobile
    if (window.innerWidth < 768) {
      setParticleCount(32);
    }
  }, []);

  const value = {
    isPaused,
    volume,
    particleCount,
    reflectionQuality,
    setIsPaused,
    setVolume,
    setParticleCount,
    setReflectionQuality,
  };

  return (
    <ThreeCanvasContext.Provider value={value}>
      {children}
    </ThreeCanvasContext.Provider>
  );
};

export const useThreeCanvasState = () => {
  const context = useContext(ThreeCanvasContext);
  if (context === undefined) {
    throw new Error('useThreeCanvasState must be used within a ThreeCanvasProvider');
  }
  return context;
};
