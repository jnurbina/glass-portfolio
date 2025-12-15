"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Background } from '@/components/Background';
import { ProfileHeader } from '@/components/ProfileHeader';
import MobileLinkItem from '@/components/MobileLinkItem';
import { LlmWidget } from '@/components/LlmWidget';
import LaughingMan from '@/components/LaughingMan';
import { profile, links } from '@/lib/data';


export default function MobileView() {
  const [loading, setLoading] = useState(true);

  const handleLoadComplete = () => {
    setLoading(false);
  };

  return (
    <>
      <LaughingMan onLoadComplete={handleLoadComplete} />
      
      <Background>
        <div className="container mx-auto px-4 py-16 max-w-md">
          <AnimatePresence>
            {!loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
              >
                <ProfileHeader 
                  name={profile.name}
                  title={profile.title}
                  avatarUrl={profile.avatarUrl}
                  description={profile.description}
                />
                
                <div className="space-y-4">
                  {links.map((link, index) => (
                    <MobileLinkItem 
                      key={index}
                      title={link.title}
                      url={link.url}
                      icon={link.icon}
                      index={index}
                      glowColor={link.glowColor}
                    />
                  ))}
                </div>
                
                <LlmWidget placeholder="Ask me about my development services..." />
                
                <footer className="mt-12 text-center text-white/50 text-sm">
                  <p>© {new Date().getFullYear()} {profile.name}. All rights reserved.</p>
                </footer>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Background>
    </>
  );
}
