"use client";

import React from 'react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaCode, FaSoundcloud, FaSpotify, FaInstagram, FaTiktok, FaFilePdf, FaCubes } from 'react-icons/fa';

const links = [
    { 
      title: "SoundCloud", 
      url: "https://soundcloud.com/doscmusic", 
      icon: <FaSoundcloud />,
    },
    { 
      title: "Spotify", 
      url: "https://open.spotify.com/artist/6zcnTrv3KaqJO1Mhdt95Sy?si=gXvD_NcrRxmM_H4dBhSGDw", 
      icon: <FaSpotify />,
    },
    { 
      title: "Instagram", 
      url: "https://instagram.com/doscmusic", 
      icon: <FaInstagram />,
    },
    { 
      title: "TikTok", 
      url: "https://tiktok.com/@doscmusic", 
      icon: <FaTiktok />,
    },
    { 
      title: "LinkedIn", 
      url: "https://linkedin.com/in/jason-urbina", 
      icon: <FaLinkedin />,
    },
    { 
      title: "GitHub", 
      url: "https://github.com/jnurbina", 
      icon: <FaGithub />,
    },
    { 
      title: "Twitter", 
      url: "https://twitter.com/doscmusic", 
      icon: <FaTwitter />,
    },
    { 
      title: "Portfolio", 
      url: "https://jurb.dev", 
      icon: <FaCode />,
    },
    {
      title: "Resume (PDF)",
      url: "/Resume.pdf",
      icon: <FaFilePdf />,
    },
    {
      title: "Contact",
      url: "mailto:doscmusic@gmail.com",
      icon: <FaEnvelope />,
    },
  ];

export default function WeaponSelect() {
    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className="text-white">Weapon Select</button>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
                <DropdownMenu.Content className="bg-black/50 text-white p-2 rounded-lg shadow-lg">
                    {links.map((link, index) => (
                        <DropdownMenu.Item key={index} asChild>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-2 hover:bg-white/10 rounded-md">
                                {link.icon}
                                <span>{link.title}</span>
                            </a>
                        </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    );
}
