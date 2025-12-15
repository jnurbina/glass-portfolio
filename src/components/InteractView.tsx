"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { categories, Category } from '@/lib/interact-data';
import { useTypewriter } from '@/hooks/useTypewriter';

const InteractView = () => {
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleCategorySelect = (category: Category, index: number) => {
    setSelectedCategory(category);
    setSelectedIndex(index);
  };

  const { displayText: typedTitle } = useTypewriter(selectedCategory.title, true);

  return (
    <motion.div
      className="absolute top-0 right-0 h-full w-full lg:w-1/2 bg-black/50 backdrop-blur-lg p-8"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.5, ease: 'easeInOut' as any }}
    >
      <div className="flex h-full">
        <div className="w-1/3 border-r border-white/20 pr-8">
          <ul>
            {categories.map((category, index) => (
              <li
                key={category.title}
                className={`cursor-pointer text-lg mb-4 ${
                  selectedIndex === index ? 'text-cyan-400' : 'text-white'
                }`}
                onClick={() => handleCategorySelect(category, index)}
              >
                {category.title}
              </li>
            ))}
          </ul>
        </div>
        <div className="w-2/3 pl-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={selectedCategory.title}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <h2 className="text-2xl font-bold text-white mb-8 h-8">{typedTitle || <span>&nbsp;</span>}</h2>
              <div className="text-white whitespace-pre-wrap">
                {selectedCategory.links.map((link) => {
                  const Icon = link.icon;
                  return (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 block hover:text-cyan-400"
                      download={link.title === 'Resume (PDF)' ? 'Resume.pdf' : undefined}
                    >
                      {typeof Icon === 'string' ? <img src={Icon} alt={link.title} className="w-4 h-4" /> : <Icon />}
                      {link.title}
                    </a>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractView;
