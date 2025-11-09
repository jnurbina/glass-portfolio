"use client";

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

interface LinkItemProps {
  title: string;
  isSelected: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}

const LinkItem = forwardRef<HTMLDivElement, LinkItemProps>(({ title, isSelected, onMouseEnter, onClick }, ref) => {
  const glowColor = isSelected ? 'rgba(0, 255, 255, 0.8)' : 'rgba(0, 150, 255, 0.7)';

  return (
    <motion.div
      ref={ref}
      tabIndex={0} // Make it focusable
      className="text-2xl font-display text-white no-underline py-2 cursor-pointer transition-all duration-300 ease-out outline-none text-shadow-glow"
      style={{
        // @ts-ignore
        '--glow-color': glowColor,
      }}
      whileHover={{ scale: 1.1, transition: { duration: 0.2 } }}
      whileFocus={{
        scale: 1.1,
        '--glow-color': 'rgba(0, 255, 255, 0.9)',
        transition: { duration: 0.2 }
      }}
      animate={{ 
        scale: isSelected ? 1.1 : 1,
        '--glow-color': glowColor,
      }}
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      onKeyPress={(e) => e.key === 'Enter' && onClick()}
    >
      {title}
    </motion.div>
  );
});

LinkItem.displayName = 'LinkItem';

export { LinkItem };