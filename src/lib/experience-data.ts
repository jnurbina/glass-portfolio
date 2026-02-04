export interface ExperienceItem {
  id: string;
  title: string;
  role: string;
  company: string;
  period: string;
  image?: string;
  highlights: string[];
}

export const experienceData: ExperienceItem[] = [
  {
    id: 'techinsf',
    title: 'IS Division Manager / Senior Software Engineer',
    role: 'IS Division Manager / Senior Software Engineer',
    company: 'Tech In SF',
    period: 'Jan 2023 - Present',
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
    highlights: [
      "Delivered interactive prototypes using Vue and React, bridging system architecture with UX goals.",
      "Collaborated across engineering and design to maintain experience integrity under real-world constraints.",
      "Conducted usability testing and refined components based on data-driven insight."
    ]
  },
  {
    id: 'kaiser',
    title: 'UI Developer',
    role: 'UI Developer',
    company: 'Kaiser Permanente',
    period: 'Jan 2020 - Jun 2020',
    highlights: [
      "Built and tested ADA-compliant React components (Hooks, Redux) for Self-Service initiatives.",
      "Delivered clean, version-controlled code in Git while collaborating in Agile teams."
    ]
  },
  {
    id: 'accenture',
    title: 'Senior Full-Stack Developer',
    role: 'Senior Full-Stack Developer',
    company: 'Accenture',
    period: 'Jul 2019 - Jan 2020',
    highlights: [
      "Delivered React-based solutions across multiple enterprise clients.",
      "Documented systems and mentored junior team members to maintain development cadence."
    ]
  },
  {
    id: 'williams-sonoma',
    title: 'Principal Front-End Developer',
    role: 'Principal Front-End Developer',
    company: 'Williams Sonoma',
    period: 'Dec 2018 - Jul 2019',
    highlights: [
      "Developed core components for Search UI using atomic principles and shared libraries.",
      "Helped set new standards for frontend and design collaboration."
    ]
  },
  {
    id: 'potato',
    title: 'Senior Full-Stack Developer',
    role: 'Senior Full-Stack Developer',
    company: 'Potato',
    period: 'Jun 2018 - Dec 2018',
    highlights: [
      "Built UI components in Vue; enforced accessibility standards under strict QA."
    ]
  },
  {
    id: 'gdit',
    title: 'Senior Front-End Developer',
    role: 'Senior Front-End Developer',
    company: 'GDIT',
    period: 'Oct 2017 - Jun 2018',
    highlights: [
      "Angular-based FAFSA mobile app; led validation, modals, and style refactors."
    ]
  },
  {
    id: 'moodys',
    title: 'Senior Front-End Developer',
    role: 'Senior Front-End Developer',
    company: "Moody's Analytics",
    period: 'Jun 2017 - Oct 2017',
    highlights: [
      "Angular CRA UI modules; ngRX state management and Material UI integration."
    ]
  },
  {
    id: 'nextaxiom',
    title: 'Senior Front-End Developer',
    role: 'Senior Front-End Developer',
    company: 'NextAxiom',
    period: 'Apr 2017 - Jun 2017',
    highlights: [
      "Built Admin modules; integrated SOAP services; upgraded ES5 to TypeScript."
    ]
  },
  {
    id: 'viscira',
    title: 'Senior Front-End Developer',
    role: 'Senior Front-End Developer',
    company: 'Viscira',
    period: 'Mar 2017 - Apr 2017',
    highlights: [
      "Angular-based iPad apps using Veeva CMS; handled state and templating logic."
    ]
  },
  {
    id: 'delta-dental',
    title: 'Lead Front-End Developer',
    role: 'Lead Front-End Developer',
    company: 'Delta Dental',
    period: 'Jun 2016 - Feb 2017',
    highlights: [
      "ADA rework of core systems; led GitFlow and front-end code reviews."
    ]
  },
  {
    id: 'freelance',
    title: 'Freelance Developer',
    role: 'Freelance Developer',
    company: 'Freelance (Fiverr, Camp Creative)',
    period: 'Jan 2016 - May 2016',
    highlights: [
      "Commission-based UI builds using Angular, HTML/CSS, and JS."
    ]
  },
  {
    id: 'apple',
    title: 'Publishing Developer',
    role: 'Publishing Developer',
    company: 'Apple',
    period: 'Jun 2015 - Dec 2015',
    highlights: [
      "Apple Store content updates; wrote reusable SASS mixins; supported localization."
    ]
  },
  {
    id: 'ericsson',
    title: 'Design Developer',
    role: 'Design Developer',
    company: 'Ericsson',
    period: 'Dec 2014 - Jun 2015',
    highlights: [
      "Built responsive components; set CSS/LESS partial standards."
    ]
  },
  {
    id: 'liberation',
    title: 'Front-End Developer',
    role: 'Front-End Developer',
    company: 'Liberation Technologies',
    period: 'Oct 2013 - Dec 2014',
    highlights: [
      "Built animated SPA using Angular and parallax UI patterns."
    ]
  },
  {
    id: 'junaroo',
    title: 'UI Engineer',
    role: 'UI Engineer',
    company: 'Junaroo',
    period: 'Nov 2012 - Sep 2013',
    highlights: [
      "Built mobile prototypes; maintained and documented LESS codebase."
    ]
  },
  {
    id: 'oneteam',
    title: 'Front-End Developer',
    role: 'Front-End Developer',
    company: 'One Team Technologies',
    period: 'Jun 2010 - Oct 2012',
    highlights: [
      "Delivered internal SPAs; created custom e-commerce modules using Angular."
    ]
  }
];