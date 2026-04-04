export interface ExperimentItem {
  id: string;
  title: string;
  description: string;
  type: 'link' | 'action';
  url?: string;
  actionId?: string;
  image?: string; // Placeholder for visual
}

export const experimentsData: ExperimentItem[] = [
  {
    id: 'battleship-game',
    title: 'DimShift',
    description: 'A 3D isometric turn-based strategy game. Challenge the AI or a friend.',
    type: 'action',
    actionId: 'launch_game',
    image: '/starmap4k.jpg' 
  },
  {
    id: 'rubiks-cube',
    title: 'Cube Art',
    description: 'Interactive 3x3x3 Cube Art experiment. Relax and spin.',
    type: 'action',
    actionId: 'launch_rubiks',
    image: '/starmap4k.jpg'
  },
  {
    id: 'hinges-experiment',
    title: 'Hinges',
    description: 'Kinetic light sculpture. Tutting-style bar rotations with RGB light trails.',
    type: 'action',
    actionId: 'launch_hinges',
    image: '/starmap4k.jpg'
  },
  {
    id: 'lornscroll',
    title: 'LornScroll',
    description: 'Side-scrolling action game. Pixel art sprites, parallax city, and physics.',
    type: 'action',
    actionId: 'launch_lornscroll',
    image: '/starmap4k.jpg'
  },
  // {
  //   id: 'generative-art',
  //   title: 'Generative Waves',
  //   description: 'A collection of p5.js sketches exploring sine waves and noise functions.',
  //   type: 'link',
  //   url: 'https://github.com/jnurbina', // Placeholder
  //   image: '/starmap4k.jpg' 
  // },
  // {
  //   id: 'particle-storm',
  //   title: 'Particle Storm',
  //   description: 'Trigger a massive particle explosion in the current scene.',
  //   type: 'action',
  //   actionId: 'particle_explosion',
  //   image: '/starmap4k.jpg'
  // },
  // {
  //   id: 'audio-viz',
  //   title: 'Audio Visualizer',
  //   description: 'Real-time frequency analysis of the background music.',
  //   type: 'link',
  //   url: 'https://github.com/jnurbina'
  // },
  // {
  //   id: 'matrix-rain',
  //   title: 'Matrix Mode',
  //   description: 'Toggle the matrix digital rain effect on the walls.',
  //   type: 'action',
  //   actionId: 'matrix_mode'
  // }
];