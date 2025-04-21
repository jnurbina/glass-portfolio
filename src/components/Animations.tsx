"use client";

import React, { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLensFlare } from '@/hooks/useLensFlare';

interface PageTransitionProps {
  children: React.ReactNode;
}

export const PageTransition: React.FC<PageTransitionProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { LensFlareElement } = useLensFlare({ 
    elementRef: containerRef,
    intensity: 0.7,
    size: 150
  });

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <LensFlareElement />
      {children}
    </motion.div>
  );
};

export const fadeVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1]
    }
  }),
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const glassReveal = {
  hidden: { 
    opacity: 0, 
    scale: 0.9,
    filter: 'blur(10px)'
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    filter: 'blur(0px)',
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1]
    }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95,
    filter: 'blur(5px)',
    transition: {
      duration: 0.4
    }
  }
};

export const useGlassTransition = () => {
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  
  const triggerTransition = (callback: () => void, duration = 800) => {
    setIsTransitioning(true);
    
    setTimeout(() => {
      callback();
      
      setTimeout(() => {
        setIsTransitioning(false);
      }, duration);
    }, duration);
  };
  
  return {
    isTransitioning,
    triggerTransition,
    TransitionOverlay: () => (
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-md z-50 pointer-events-none"
          />
        )}
      </AnimatePresence>
    )
  };
};
