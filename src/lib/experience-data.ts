export interface ExperienceItem {
  id: string;
  title: string;
  role: string;
  company: string;
  period: string;
  images?: string[];
  link?: string;
  linkLabel?: string;
  imageLinks?: string[];
  imageLinkLabels?: string[];
  highlights: string[];
}

export const experienceData: ExperienceItem[] = [
  {
    id: 'techinsf',
    title: 'IS Division Manager / Senior Software Engineer',
    role: 'IS Division Manager / Senior Software Engineer',
    company: 'Tech In SF',
    period: 'Jan 2023 - Present',
    images: [
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/tnsf/tnsf-internal-tooling/Screenshot%202026-02-04%20173309.png',
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/tnsf/tnsf-internal-tooling/Screenshot%202026-02-04%20173328.png',
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/tnsf/tnsf-internal-tooling/Screenshot%202026-02-04%20173452.png',
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/tnsf/tnsf-internal-tooling/Screenshot%202026-01-27%20193608.png',
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/tnsf/tidewatercap/Screenshot%202026-02-04%20172203.png',
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/tnsf/tidewatercap/Screenshot%202026-02-04%20172224.png',
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/tnsf/atombeamtech/Screenshot%202026-02-04%20171449.png',
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/tnsf/arilaw/Screenshot%202026-02-04%20171535.png',
    ],
    imageLinks: [
      'https://techinsf.com',
      'https://techinsf.com',
      'https://techinsf.com',
      'https://techinsf.com',
      'https://www.tidewatercap.com/',
      'https://www.tidewatercap.com/',
      'https://www.atombeamtech.com/',
      'https://www.arilaw.com/',
    ],
    imageLinkLabels: [
      'Tech In SF',
      'Tech In SF',
      'Tech In SF',
      'Tech In SF',
      'Tidewater Capital',
      'Tidewater Capital',
      'Atombeam',
      'AriLaw',
    ],
    highlights: [
      "Built and led Tech In SF's first internal engineering team — designing, engineering, and QA.",
      "Integrated AI tools into dev workflows (prompt chaining, QA bots, internal copilots), cutting project time-to-delivery by 50%.",
      "Created standardized SOPs and tech stack selection processes aligned with project needs and best practices.",
      "Developed a Webflow-based design system and templating engine for rapid client site deployment."
    ]
  },
  {
    id: 'samsung',
    title: 'Prototyping Engineer',
    role: 'Prototyping Engineer',
    company: 'Samsung Research America',
    period: 'Jun 2020 - Jan 2023',
    images: [
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/samsung/Samsung-TV-Plus-details.jpg',
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/samsung/samsung-gaming-hub.avif',
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/samsung/Ambient-Mode-screen-brightness.webp',
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/samsung/TV_samsung_health_0.avif',
    ],
    link: 'https://news.samsung.com/global/is-your-television-smart',
    linkLabel: 'Samsung TV',
    highlights: [
      "Delivered interactive prototypes using Vue and React, bridging system architecture with UX goals.",
      "Collaborated across engineering and design to maintain experience integrity under real-world constraints.",
      "Conducted usability testing and refined components based on data-driven insight."
    ]
  },
  {
    id: 'williams-sonoma',
    title: 'Principal Front-End Developer',
    role: 'Principal Front-End Developer',
    company: 'Williams Sonoma',
    period: 'Dec 2018 - Jul 2019',
    images: [
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/williamssonoma/Screenshot%202026-02-04%20172412.png',
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/williamssonoma/Screenshot%202026-02-04%20172442.png',
    ],
    link: 'https://www.williams-sonoma.com/',
    linkLabel: 'Williams Sonoma',
    highlights: [
      "Developed core components for Search UI using atomic principles and shared libraries.",
      "Helped set new standards for frontend and design collaboration."
    ]
  },
  {
    id: 'apple',
    title: 'Publishing Developer',
    role: 'Publishing Developer',
    company: 'Apple',
    period: 'Jun 2015 - Dec 2015',
    images: [
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/apple/Screenshot%202026-02-04%20171248.png',
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/apple/Screenshot%202026-02-04%20171317.png',
      'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/apple/Screenshot%202026-02-04%20171400.png',
    ],
    link: 'https://www.apple.com/store',
    linkLabel: 'Apple Store',
    highlights: [
      "Apple Store content updates; wrote reusable SASS mixins; supported localization."
    ]
  },
];