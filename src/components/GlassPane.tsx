"use client";

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassPaneProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  glowColor?: string;
}

export const GlassPane: React.FC<GlassPaneProps> = ({
  children,
  className = '',
  delay = 0,
  glowColor = 'rgba(255, 255, 255, 0.4)',
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: [0.22, 1, 0.36, 1] 
      }}
      className={`
        relative
        backdrop-blur-xl
        bg-white/5
        border border-white/10
        rounded-xl
        shadow-lg
        overflow-hidden
        ${className}
      `}
    >
      {/* Glass reflection effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
      
      {/* LED glow effect at bottom - more diffused */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px"
        style={{ 
          background: glowColor,
          boxShadow: `0 0 20px 5px ${glowColor}`,
        }} 
      />
      
      {/* Content container */}
      <div className="relative z-10 p-6">
        {children}
      </div>
      
      {/* Subtle lens flare effect */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-xl opacity-50 pointer-events-none" />
    </motion.div>
  );
};
