"use client";

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { GlassPane } from './GlassPane';
import { useLensFlare } from '@/hooks/useLensFlare';

interface ProfileHeaderProps {
  name: string;
  title: string;
  avatarUrl: string;
  description?: string;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name,
  title,
  avatarUrl,
  description,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { LensFlareElement } = useLensFlare({
    elementRef: containerRef,
    intensity: 0.6,
    size: 120
  });

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="w-full mb-8 relative"
    >
      <LensFlareElement />
      <GlassPane 
        className="w-full text-center"
        glowColor="rgba(130, 200, 255, 0.8)"
      >
        <div className="flex flex-col items-center">
          {/* Avatar with glow effect */}
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-white/30 relative z-10">
              <Image 
                src={avatarUrl} 
                alt={name} 
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            {/* Avatar glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/50 to-purple-500/50 rounded-full blur-lg opacity-70 -z-10" />
          </div>
          
          {/* Name with text reflection effect */}
          <div className="relative">
            <h1 className="text-white text-2xl font-bold mb-1">{name}</h1>
            {/* Text reflection effect */}
            <div className="absolute -bottom-4 left-0 right-0 text-center">
              <h1 className="text-white/10 text-2xl font-bold mb-1 transform scale-y-[-0.3] blur-[1px]">{name}</h1>
            </div>
          </div>
          
          <h2 className="text-white/80 text-lg font-medium mt-4">{title}</h2>
          
          {description && (
            <p className="text-white/70 mt-4 max-w-md">{description}</p>
          )}
        </div>
      </GlassPane>
    </motion.div>
  );
};
