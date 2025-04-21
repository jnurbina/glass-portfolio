"use client";

import React from 'react';
import { motion, AnimationProps } from 'framer-motion';

interface BackgroundProps {
  children: React.ReactNode;
}

export const Background: React.FC<BackgroundProps> = ({ children }) => {
  // Animation variants for the floating orbs
  const floatingAnimation = {
    animate: {
      x: ['-10%', '10%', '-10%'],
      y: ['-10%', '10%', '-10%'],
      transition: {
        x: { repeat: Infinity, duration: 20, ease: "easeInOut" },
        y: { repeat: Infinity, duration: 25, ease: "easeInOut" }
      }
    }
  };

  // Animation for lens flare effect
  const lensFlareAnimation = {
    animate: {
      opacity: [0.3, 0.7, 0.3],
      scale: [1, 1.1, 1],
      x: ['-5%', '5%', '-5%'],
      y: ['-5%', '5%', '-5%'],
      transition: {
        opacity: { repeat: Infinity, duration: 8, ease: "easeInOut" },
        scale: { repeat: Infinity, duration: 10, ease: "easeInOut" },
        x: { repeat: Infinity, duration: 15, ease: "easeInOut" },
        y: { repeat: Infinity, duration: 12, ease: "easeInOut" }
      }
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#050a19] via-[#0a1428] to-[#0a1832] relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Floating orbs/light sources with subtle animations */}
        <motion.div
          className="absolute w-64 h-64 rounded-full bg-blue-900/10 blur-3xl"
          animate={floatingAnimation.animate}
          style={{ top: '10%', left: '15%' }}
        />
        
        <motion.div
          className="absolute w-96 h-96 rounded-full bg-indigo-900/10 blur-3xl"
          animate={{
            x: ['5%', '-5%', '5%'],
            y: ['5%', '-5%', '5%'],
            transition: {
              x: { repeat: Infinity, duration: 18, ease: "easeInOut" },
              y: { repeat: Infinity, duration: 22, ease: "easeInOut" }
            }
          }}
          style={{ bottom: '10%', right: '15%' }}
        />
        
        <motion.div
          className="absolute w-72 h-72 rounded-full bg-blue-800/10 blur-3xl"
          animate={{
            x: ['-5%', '5%', '-5%'],
            y: ['-8%', '8%', '-8%'],
            transition: {
              x: { repeat: Infinity, duration: 25, ease: "easeInOut" },
              y: { repeat: Infinity, duration: 19, ease: "easeInOut" }
            }
          }}
          style={{ top: '40%', right: '25%' }}
        />
        
        {/* Lens flare effects with subtle animations */}
        <motion.div
          className="absolute w-40 h-40 rounded-full bg-white/5 blur-xl"
          animate={lensFlareAnimation.animate}
          style={{ top: '20%', left: '30%' }}
        />
        
        <motion.div
          className="absolute w-32 h-32 rounded-full bg-white/5 blur-xl"
          animate={{
            opacity: [0.2, 0.5, 0.2],
            scale: [1, 1.2, 1],
            x: ['5%', '-5%', '5%'],
            y: ['5%', '-5%', '5%'],
            transition: {
              opacity: { repeat: Infinity, duration: 10, ease: "easeInOut" },
              scale: { repeat: Infinity, duration: 12, ease: "easeInOut" },
              x: { repeat: Infinity, duration: 18, ease: "easeInOut" },
              y: { repeat: Infinity, duration: 14, ease: "easeInOut" }
            }
          }}
          style={{ bottom: '30%', left: '20%' }}
        />
        
        {/* Window glare texture with subtle animation */}
        <motion.div
          className="absolute w-full h-full opacity-10"
          style={{ 
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 50%, rgba(255,255,255,0.05) 100%)' 
          }}
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%', '0% 0%'],
            transition: {
              backgroundPosition: { repeat: Infinity, duration: 30, ease: "linear" }
            }
          }}
        />
      </div>
      
      {/* Content container */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};
