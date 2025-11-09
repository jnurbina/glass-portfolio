"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LinkItem } from './LinkItem';
import { audioEngine } from '@/lib/audio/audio';

interface MenuItem {
  title: string;
}

interface FF7MenuProps {
  menuItems: MenuItem[];
}

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
      ease: "easeOut",
      duration: 0.8
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const FF7Menu = ({ menuItems }: FF7MenuProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const playHoverSound = () => audioEngine.play('hover');
  const playSelectSound = () => audioEngine.play('select');

  useEffect(() => {
    itemRefs.current[selectedIndex]?.focus();
  }, [selectedIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        setSelectedIndex((prevIndex) => (prevIndex + 1) % menuItems.length);
        playHoverSound();
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex((prevIndex) => (prevIndex - 1 + menuItems.length) % menuItems.length);
        playHoverSound();
      } else if (e.key === 'Enter') {
        playSelectSound();
        // The navigation is disabled as per the user's request.
        // If it were enabled, it would be handled here.
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, menuItems.length]);

  return (
    <motion.div
      className="absolute bottom-[40vh] right-[15vw] pointer-events-none"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col items-start pointer-events-auto">
        {menuItems.map((item, index) => (
          <motion.div key={item.title} variants={itemVariants}>
            <LinkItem
              ref={(el) => (itemRefs.current[index] = el)}
              title={item.title}
              isSelected={selectedIndex === index}
              onMouseEnter={() => {
                setSelectedIndex(index);
                playHoverSound();
              }}
              onClick={playSelectSound}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FF7Menu;