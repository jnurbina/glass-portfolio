"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Background } from '@/components/Background';
import { ProfileHeader } from '@/components/ProfileHeader';
import { LinkItem } from '@/components/LinkItem';
import { LlmWidget } from '@/components/LlmWidget';
import LaughingMan from '@/components/LaughingMan';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaCode, FaSoundcloud, FaSpotify, FaInstagram, FaTiktok, FaFilePdf, FaCubes } from 'react-icons/fa';


export default function Home() {
  const [loading, setLoading] = useState(true);

  const profile = {
    name: "Jason [Dosc] Urbina",
    title: "Audio Engineer | Software Engineer | Creative Coder ",
    avatarUrl: "/profile.png",
    description: "Greetings. I write code, I make music, and I combine the two make magic."
  };

  const links = [
    { 
      title: "SoundCloud", 
      url: "https://soundcloud.com/doscmusic", 
      icon: <FaSoundcloud />,
      glowColor: "rgba(255, 255, 255, 0.4)"
    },
    { 
      title: "Spotify", 
      url: "https://open.spotify.com/artist/6zcnTrv3KaqJO1Mhdt95Sy?si=gXvD_NcrRxmM_H4dBhSGDw", 
      icon: <FaSpotify />,
      glowColor: "rgba(255, 255, 255, 0.4)"
    },
    { 
      title: "Instagram", 
      url: "https://instagram.com/doscmusic", 
      icon: <FaInstagram />,
      glowColor: "rgba(255, 255, 255, 0.4)"
    },
    { 
      title: "TikTok", 
      url: "https://tiktok.com/@doscmusic", 
      icon: <FaTiktok />,
      glowColor: "rgba(255, 255, 255, 0.4)"
    },
    { 
      title: "Resident Advisor",
      url: "https://ra.co/dj/dosc",
      // Wrap Image in a div with fixed size (w-6 h-6 => 24px) and flex centering
      icon: (
        <div className="w-6 h-6 flex items-center justify-center">
          <Image src="/Fa_Resident_Advisor.png" alt="Resident Advisor Icon" width={24} height={24} className="invert" />
        </div>
      ),
      glowColor: "rgba(255, 255, 255, 0.4)"
    },
    { 
      title: "LinkedIn", 
      url: "https://linkedin.com/in/jason-urbina", 
      icon: <FaLinkedin />,
      glowColor: "rgba(255, 255, 255, 0.4)"
    },
    { 
      title: "GitHub", 
      url: "https://github.com/jnurbina", 
      icon: <FaGithub />,
      glowColor: "rgba(255, 255, 255, 0.4)"
    },
    { 
      title: "Twitter", 
      url: "https://twitter.com/doscmusic", 
      icon: <FaTwitter />,
      glowColor: "rgba(255, 255, 255, 0.4)"
    },
    { 
      title: "Portfolio", 
      url: "https://jurb.dev", 
      icon: <FaCode />,
      glowColor: "rgba(255, 255, 255, 0.4)"
    },
    // {
    //   title: "Projects",
    //   url: "https://johndeveloper.com/projects",
    //   icon: <FaBriefcase />,
    //   glowColor: "rgba(255, 255, 255, 0.4)"
    // },
    {
      title: "Resume (PDF)",
      url: "/urbinaResume2025.pdf", // Link to the PDF in public folder
      icon: <FaFilePdf />,
      glowColor: "rgba(255, 255, 255, 0.4)"
    },
    {
      title: "Urbiniac Table (3D Exp)",
      url: "#", // Placeholder URL for external Babylon.js project
      // TODO: Replace '#' with actual URL when deployed: e.g., https://urbiniac-table.jurb.dev
      icon: <FaCubes />,
      glowColor: "rgba(255, 255, 255, 0.4)"
    },
    {
      title: "Contact",
      url: "mailto:doscmusic@gmail.com",
      icon: <FaEnvelope />,
      glowColor: "rgba(255, 255, 255, 0.4)"
    },
  ];

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
                    <LinkItem 
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
