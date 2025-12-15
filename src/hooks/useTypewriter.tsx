"use client";

import { useState, useEffect, useRef } from 'react';

interface UseTypewriterResult {
  displayText: string;
  isTyping: boolean;
}

const PAUSE_DURATION = 1200; // Milliseconds to pause after typing
const CLEAR_PAUSE = 600; // Short pause before clearing/restarting

export const useTypewriter = (text: string, isActive: boolean): UseTypewriterResult => {
  const [displayText, setDisplayText] = useState(text); // Initial state is the full text
  const [isTyping, setIsTyping] = useState(false);
  const currentIndexRef = useRef(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameRef = useRef<number | null>(null); // Using requestAnimationFrame for timing
  const loopStateRef = useRef<'idle' | 'typing' | 'pausing' | 'clearing'>('idle');

  const clearTimers = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  useEffect(() => {
    // Cleanup function on unmount
    return () => {
      clearTimers();
    };
  }, []);

  useEffect(() => {
    clearTimers(); // Clear any existing timers when isActive or text changes

    if (!text) { // Handle case where text might be empty or undefined initially
        setDisplayText('');
        setIsTyping(false);
        loopStateRef.current = 'idle';
        return;
    }

    const TYPE_SPEED = Math.max(10, 1000 / text.length);

    if (isActive) {
      // --- Start the loop ---
      loopStateRef.current = 'clearing';
      currentIndexRef.current = 0; // Reset index
      setDisplayText(''); // Clear display immediately
      setIsTyping(true);

      const loop = () => {
        clearTimers(); // Clear previous timers

        switch (loopStateRef.current) {
          case 'typing':
            if (currentIndexRef.current < text.length) {
              const charToAdd = text[currentIndexRef.current];
              setDisplayText(prev => prev + charToAdd);
              currentIndexRef.current++;
              animationFrameRef.current = requestAnimationFrame(() => {
                timeoutRef.current = setTimeout(loop, TYPE_SPEED);
              });
            } else {
              // Finished typing, switch to pausing
              loopStateRef.current = 'pausing';
              setIsTyping(false); // Pause cursor blink
              timeoutRef.current = setTimeout(loop, PAUSE_DURATION);
            }
            break;

          case 'pausing':
            // Finished pausing, switch to clearing
            loopStateRef.current = 'clearing';
             // Set isTyping=true if you want the cursor visible during the clear pause
            setIsTyping(true); // Keep cursor hidden during clear pause
            timeoutRef.current = setTimeout(loop, CLEAR_PAUSE);
            break;

          case 'clearing':
            // Finished clearing pause, reset and start typing
            setDisplayText('');
            currentIndexRef.current = 0;
            loopStateRef.current = 'typing';
            setIsTyping(true); // Start cursor blink
            // Use timeout for the very first character to ensure state updates propagate
            timeoutRef.current = setTimeout(loop, TYPE_SPEED);
            break;

          case 'idle':
          default:
            // Should not happen while active, but reset if it does
             loopStateRef.current = 'clearing';
             timeoutRef.current = setTimeout(loop, TYPE_SPEED);
            break;
        }
      };

      // Initial call after a short delay to ensure state is ready
       timeoutRef.current = setTimeout(loop, TYPE_SPEED);

    } else {
      // --- Reset when not active ---
      setDisplayText(text);
      setIsTyping(false);
      currentIndexRef.current = 0;
      loopStateRef.current = 'idle';
    }

    // Cleanup specific to this effect run
    return () => {
      clearTimers();
    };
  }, [isActive, text]);

  return { displayText, isTyping };
};