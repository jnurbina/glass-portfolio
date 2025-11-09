import { FaGithub, FaLinkedin, FaTwitter, FaEnvelope, FaCode, FaSoundcloud, FaSpotify, FaInstagram, FaTiktok, FaFilePdf } from 'react-icons/fa';

export const categories = [
  {
    title: '[ Code Socials ]',
    links: [
      {
        title: 'GitHub',
        url: 'https://github.com/jnurbina',
        icon: FaGithub,
      },
      {
        title: 'LinkedIn',
        url: 'https://linkedin.com/in/jason-urbina',
        icon: FaLinkedin,
      },
      {
        title: 'Twitter',
        url: 'https://twitter.com/doscmusic',
        icon: FaTwitter,
      },
    ],
  },
  {
    title: '[ Music Socials ]',
    links: [
      {
        title: 'SoundCloud',
        url: 'https://soundcloud.com/doscmusic',
        icon: FaSoundcloud,
      },
      {
        title: 'Spotify',
        url: 'https://open.spotify.com/artist/6zcnTrv3KaqJO1Mhdt95Sy?si=gXvD_NcrRxmM_H4dBhSGDw',
        icon: FaSpotify,
      },
      {
        title: 'Instagram',
        url: 'https://instagram.com/doscmusic',
        icon: FaInstagram,
      },
      {
        title: 'TikTok',
        url: 'https://tiktok.com/@doscmusic',
        icon: FaTiktok,
      },
      {
        title: 'Resident Advisor',
        url: 'https://ra.co/dj/dosc',
        icon: '/Fa_Resident_Advisor.png',
      },
    ],
  },
  {
    title: '[ Comms ]',
    links: [
      {
        title: 'Contact',
        url: 'mailto:doscmusic@gmail.com',
        icon: FaEnvelope,
      },
    ],
  },
  {
    title: '[ For You ]',
    links: [
      {
        title: 'Resume (PDF)',
        url: '/urbinaResume2025.pdf',
        icon: FaFilePdf,
      },
    ],
  },
];
