"use client";

import React, { useState } from 'react';
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

  const { displayText: typedContent } = useTypewriter(
    selectedCategory.links.map((link) => `${link.title}: ${link.url}`).join('\n'),
    true
  );

  return (
    <motion.div
      className="absolute top-0 right-0 h-full w-full lg:w-1/2 bg-black/50 backdrop-blur-lg p-8"
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ duration: 0.5, ease: 'easeInOut' }}
    >
      <div className="flex h-full">
        <div className="w-1/3 border-r border-white/20 pr-8">
          <h2 className="text-2xl font-bold text-white mb-8">Categories</h2>
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
              <h2 className="text-2xl font-bold text-white mb-8">{selectedCategory.title}</h2>
              <pre className="text-white whitespace-pre-wrap">{typedContent}</pre>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default InteractView;
