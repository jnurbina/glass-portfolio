"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image, { StaticImageData } from 'next/image';

interface MobileLinkItemProps {
  title: string;
  url: string;
  icon: React.ComponentType | StaticImageData | string;
  index: number;
  glowColor: string;
}

const MobileLinkItem = ({ title, url, icon, index, glowColor }: MobileLinkItemProps) => {
  const Icon = icon;

  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center space-x-4 p-4 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all duration-300"
      style={{
        // @ts-ignore
        '--glow-color': glowColor,
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="w-6 h-6">
        {typeof Icon === 'string' ? (
          <Image src={Icon} alt={`${title} Icon`} width={24} height={24} className="invert" />
        ) : (
          <Icon />
        )}
      </div>
      <span className="text-white font-semibold">{title}</span>
    </motion.a>
  );
};

export default MobileLinkItem;
