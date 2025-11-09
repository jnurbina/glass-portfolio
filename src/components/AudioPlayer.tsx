"use client";

import { useState, useEffect, useRef } from 'react';

const AudioPlayer = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  const handleInteraction = () => {
    setHasInteracted(true);
    window.removeEventListener('click', handleInteraction);
    window.removeEventListener('keydown', handleInteraction);
  };

  useEffect(() => {
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, []);

  useEffect(() => {
    if (hasInteracted && audioRef.current) {
      audioRef.current.volume = 0.3;
      audioRef.current.play().catch(error => {
        console.error("Audio play failed:", error);
      });
    }
  }, [hasInteracted]);

  return <audio ref={audioRef} src="/landingPage.wav" loop />;
};

export default AudioPlayer;
