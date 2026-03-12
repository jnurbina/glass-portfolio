"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface StackedImageDeckProps {
  images: string[];
  interval?: number; // ms between shuffles
  className?: string;
}

const StackedImageDeck: React.FC<StackedImageDeckProps> = ({
  images,
  interval = 3500,
  className = ''
}) => {
  // Track the order of images by their indices
  const [order, setOrder] = useState<number[]>(() =>
    images.map((_, i) => i)
  );

  const shuffle = useCallback(() => {
    setOrder(prev => {
      // Move first item to end (top card goes to back)
      const [first, ...rest] = prev;
      return [...rest, first];
    });
  }, []);

  useEffect(() => {
    if (images.length <= 1) return;

    const timer = setInterval(shuffle, interval);
    return () => clearInterval(timer);
  }, [shuffle, interval, images.length]);

  // Reset order when images change
  useEffect(() => {
    setOrder(images.map((_, i) => i));
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className={`w-full h-full bg-gray-800 flex items-center justify-center text-gray-500 ${className}`}>
        No Images
      </div>
    );
  }

  const stackOffset = 8; // pixels offset for each card in stack
  const maxVisibleCards = Math.min(images.length, 4);

  return (
    <div className={`relative w-full h-full ${className}`}>
      <AnimatePresence mode="popLayout">
        {order.slice(0, maxVisibleCards).map((imageIndex, stackPosition) => {
          const isTop = stackPosition === 0;
          // Cards further back have higher offset (peek from top-left)
          const offset = (maxVisibleCards - 1 - stackPosition) * stackOffset;

          return (
            <motion.div
              key={imageIndex}
              className="absolute inset-0 rounded-lg overflow-hidden shadow-2xl"
              style={{
                zIndex: maxVisibleCards - stackPosition,
              }}
              initial={false}
              animate={{
                // Stack offset - cards behind peek from top-left
                x: offset,
                y: -offset,
                scale: 1 - (stackPosition * 0.03),
                opacity: 1 - (stackPosition * 0.15),
              }}
              exit={{
                // Animate to back of stack
                x: offset + stackOffset,
                y: -(offset + stackOffset),
                scale: 1 - (maxVisibleCards * 0.03),
                opacity: 0.5,
                transition: { duration: 0.5, ease: "easeInOut" }
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 25,
              }}
            >
              {/* Floaty drift animation for top card */}
              <motion.div
                className="w-full h-full"
                animate={isTop ? {
                  x: [0, 3, -2, 1, 0],
                  y: [0, -4, 2, -1, 0],
                  rotate: [0, 0.5, -0.3, 0.2, 0],
                } : {}}
                transition={isTop ? {
                  duration: interval / 1000,
                  ease: "easeInOut",
                  times: [0, 0.25, 0.5, 0.75, 1],
                } : {}}
              >
                <img
                  src={images[imageIndex]}
                  alt={`Work sample ${imageIndex + 1}`}
                  className="w-full h-full object-cover"
                  loading={stackPosition === 0 ? "eager" : "lazy"}
                />
                {/* Subtle vignette overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-black/20 pointer-events-none" />
              </motion.div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {/* Stack indicator dots */}
      {images.length > 1 && (
        <div className="absolute bottom-2 right-2 flex gap-1 z-10">
          {images.map((_, idx) => (
            <div
              key={idx}
              className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                order[0] === idx ? 'bg-cyan-400 scale-125' : 'bg-white/40'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StackedImageDeck;
