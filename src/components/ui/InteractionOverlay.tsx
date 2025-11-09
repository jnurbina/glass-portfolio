"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface InteractionOverlayProps {
  onInteract: () => void;
}

const InteractionOverlay = ({ onInteract }: InteractionOverlayProps) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    onInteract();
  };

  return (
    <motion.div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 1)',
        zIndex: 100,
        cursor: 'pointer',
      }}
      initial={{ opacity: 1 }}
      animate={{ opacity: isClicked ? 0 : 1 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      onAnimationComplete={() => {
        if (isClicked) {
          // Optional: set display to none after fade out
          // This element will be removed from the tree anyway in DesktopView
        }
      }}
      onClick={handleClick}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
        style={{
          color: '#00ffff',
          fontFamily: 'monospace',
          fontSize: '1.5rem',
          textShadow: '0 0 8px #00ffff',
        }}
      >
        [ Click to Enable ]
      </motion.div>
    </motion.div>
  );
};

export default InteractionOverlay;
