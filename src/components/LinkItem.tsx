"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GlassPane } from './GlassPane';
import { useTypewriter } from '@/hooks/useTypewriter';

interface LinkItemProps {
  title: string;
  url: string;
  icon?: React.ReactNode;
  index: number;
  glowColor?: string;
}

export const LinkItem: React.FC<LinkItemProps> = ({
  title,
  url,
  icon,
  index,
  glowColor,
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const typewriting = useTypewriter(title, isHovered);
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 20 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        duration: 0.4, 
        delay: 0.1 * index,
        ease: [0.22, 1, 0.36, 1]
      }}
      className="w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={() => setIsHovered(false)}
    >
      <motion.a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="block w-full no-underline group"
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <GlassPane
          className="w-full transition-shadow duration-300 group-hover:shadow-xl"
          glowColor={glowColor}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {icon && <div className="text-white/90 text-xl">{icon}</div>}
              <h3 className="text-white/90 font-medium m-0 flex items-center min-h-[1.5rem]">
                {typewriting.displayText}
                 {/* Blinking cursor only when typing */}
                {typewriting.isTyping && (
                  <span
                  className="inline-block w-0.5 h-4 bg-white/90 ml-1"
                  style={{ animation: 'blink 1s step-end infinite' }}
                  ></span>
                )}
              </h3>
            </div>
            <div className="text-white/70 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M7 7l10 10M7 17V7h10" />
              </svg>
            </div>
          </div>
        </GlassPane>
      </motion.a>
    </motion.div>
  );
};
