"use client";

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { LinkItem } from './LinkItem';
import { audioEngine } from '@/lib/audio/audio';

interface MenuItem {
  title: string;
  action: string;
}

interface FF7MenuProps {
  menuItems: MenuItem[];
  onSelect: (action: string) => void;
  muteButtonRef: React.RefObject<HTMLButtonElement>;
  isMuteButtonFocused: boolean;
}

const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.5, // Wait for panes to close
      staggerChildren: 0.2,
      delayChildren: 0.3,
      ease: "easeOut" as any,
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
      ease: "easeOut" as any,
    },
  },
};

const FF7Menu = ({ menuItems, onSelect, muteButtonRef, isMuteButtonFocused }: FF7MenuProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

  const playHoverSound = () => audioEngine.play('hover');
  const playSelectSound = () => audioEngine.play('select');

  const handleSelect = (index: number) => {
    playSelectSound();
    onSelect(menuItems[index].action);
  };

  useEffect(() => {
    if (!isMuteButtonFocused) {
      itemRefs.current[selectedIndex]?.focus();
    }
  }, [selectedIndex, isMuteButtonFocused]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        if (selectedIndex === menuItems.length - 1) {
          muteButtonRef.current?.focus();
        } else {
          setSelectedIndex((prevIndex) => Math.min(prevIndex + 1, menuItems.length - 1));
          playHoverSound();
        }
      } else if (e.key === 'ArrowUp') {
        setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
        playHoverSound();
      } else if (e.key === 'Enter') {
        handleSelect(selectedIndex);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIndex, menuItems.length, handleSelect, playHoverSound, muteButtonRef]);

  return (
    <motion.div
      className="absolute bottom-32 left-8 md:bottom-[40vh] md:left-auto md:right-[15vw] pointer-events-none z-20"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex flex-col items-start pointer-events-auto">
        {menuItems.map((item, index) => (
          <motion.div key={item.title} variants={itemVariants}>
            <LinkItem
              ref={(el) => { itemRefs.current[index] = el; }}
              title={item.title}
              isSelected={!isMuteButtonFocused && selectedIndex === index}
              onMouseEnter={() => {
                if (!isMuteButtonFocused) {
                  setSelectedIndex(index);
                  playHoverSound();
                }
              }}
              onClick={() => handleSelect(index)}
            />
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default FF7Menu;