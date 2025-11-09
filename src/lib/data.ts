import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaCode, FaSoundcloud, FaSpotify, FaInstagram, FaTiktok, FaFilePdf, FaCubes } from 'react-icons/fa';
import Image from 'next/image';
import { StaticImageData } from 'next/image';

export const profile = {
  name: "Jason [Dosc] Urbina",
  title: "Audio Engineer | Software Engineer | Creative Coder ",
  avatarUrl: "/profile.png",
  description: "Greetings. I write code, I make music, and I combine the two and result in magic."
};

export interface Link {
  title: string;
  url: string;
  icon: React.ComponentType | StaticImageData | string;
  glowColor: string;
}

export const links: Link[] = [
  { 
    title: "SoundCloud", 
    url: "https://soundcloud.com/doscmusic", 
    icon: FaSoundcloud,
    glowColor: "rgba(255, 255, 255, 0.4)"
  },
  { 
    title: "Spotify", 
    url: "https://open.spotify.com/artist/6zcnTrv3KaqJO1Mhdt95Sy?si=gXvD_NcrRxmM_H4dBhSGDw", 
    icon: FaSpotify,
    glowColor: "rgba(255, 255, 255, 0.4)"
  },
  { 
    title: "Instagram", 
    url: "https://instagram.com/doscmusic", 
    icon: FaInstagram,
    glowColor: "rgba(255, 255, 255, 0.4)"
  },
  { 
    title: "TikTok", 
    url: "https://tiktok.com/@doscmusic", 
    icon: FaTiktok,
    glowColor: "rgba(255, 255, 255, 0.4)"
  },
  { 
    title: "Resident Advisor",
    url: "https://ra.co/dj/dosc",
    icon: "/Fa_Resident_Advisor.png",
    glowColor: "rgba(255, 255, 255, 0.4)"
  },
  { 
    title: "LinkedIn", 
    url: "https://linkedin.com/in/jason-urbina", 
    icon: FaLinkedin,
    glowColor: "rgba(255, 255, 255, 0.4)"
  },
  { 
    title: "GitHub", 
    url: "https://github.com/jnurbina", 
    icon: FaGithub,
    glowColor: "rgba(255, 255, 255, 0.4)"
  },
  { 
    title: "Twitter", 
    url: "https://twitter.com/doscmusic", 
    icon: FaTwitter,
    glowColor: "rgba(255, 255, 255, 0.4)"
  },
  { 
    title: "Portfolio", 
    url: "https://jurb.dev", 
    icon: FaCode,
    glowColor: "rgba(255, 255, 255, 0.4)"
  },
  // {
  //   title: "Projects",
  //   url: "https://johndeveloper.com/projects",
  //   icon: FaBriefcase,
  //   glowColor: "rgba(255, 255, 255, 0.4)"
  // },
  {
    title: "Resume (PDF)",
    url: "/urbinaResume2025.pdf", // Link to the PDF in public folder
    icon: FaFilePdf,
    glowColor: "rgba(255, 255, 255, 0.4)"
  },
  // {
  //   title: "Urbiniac Table (3D Exp)",
  //   url: "#", // Placeholder URL for external Babylon.js project
  //   // TODO: Replace '#' with actual URL when deployed: e.g., https://urbiniac-table.jurb.dev
  //   icon: FaCubes,
  //   glowColor: "rgba(255, 255, 255, 0.4)"
  // },
  {
    title: "Contact",
    url: "mailto:doscmusic@gmail.com",
    icon: FaEnvelope,
    glowColor: "rgba(255, 255, 255, 0.4)"
  },
];
