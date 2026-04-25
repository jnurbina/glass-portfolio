import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { categories, Category } from '@/lib/interact-data';
import { useTypewriter } from '@/hooks/useTypewriter';
import * as THREE from 'three';

interface InteractPaneProps {
  onClose: () => void;
}

const InteractPane = ({ onClose }: InteractPaneProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const handleCategorySelect = (category: Category, index: number) => {
    setSelectedCategory(category);
    setSelectedIndex(index);
  };

  const { displayText: typedTitle } = useTypewriter(selectedCategory.title, true, 2.5);

  // Idle animation
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.getElapsedTime();
      // Gentle bobbing
      groupRef.current.position.y = Math.sin(time * 1.5) * 0.1;
      // Gentle rotation
      groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.02;
      groupRef.current.rotation.z = Math.sin(time * 0.3) * 0.01;
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 10]}> {/* Positioned in front of camera */}
      <Html
        transform
        occlude="blending"
        position={[0, 0, 0]}
        distanceFactor={15} // Adjust scale
        zIndexRange={[100, 0]}
        style={{
             width: '900px',
             height: '600px',
             userSelect: 'none',
             pointerEvents: 'auto', // Ensure clicks are captured
        }}
      >
        <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="w-full h-full relative perspective-1000"
        >
            {/* Infinite Mirror Layers - Background */}
            {[...Array(5)].map((_, i) => (
                <div
                    key={`bg-${i}`}
                    className="absolute inset-0 border border-cyan-500/30 rounded-2xl"
                    style={{
                        zIndex: -1 - i,
                        transform: `translateZ(-${(i + 1) * 40}px) scale(${1 - (i + 1) * 0.05})`,
                        opacity: 1 - (i + 1) * 0.15,
                        backgroundColor: i === 0 ? 'rgba(0,0,0,0.85)' : 'transparent', // Main background on first layer
                        backdropFilter: i === 0 ? 'blur(20px)' : 'none',
                        boxShadow: `0 0 ${20 + i * 10}px rgba(0, 255, 255, ${0.1 - i * 0.02})`,
                    }}
                />
            ))}

            {/* Main Container Content */}
            <div className="w-full h-full rounded-2xl p-8 overflow-hidden relative z-10">
                {/* Decorative corners */}
                <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-500 rounded-tl-xl" />
                <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-cyan-500 rounded-tr-xl" />
                <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-cyan-500 rounded-bl-xl" />
                <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-500 rounded-br-xl" />

                {/* Close button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="absolute top-6 right-6 text-cyan-500 hover:text-white transition-colors z-50 text-xl font-bold cursor-pointer"
                >
                    [ X ]
                </button>

                <div className="flex h-full mt-4">
                    {/* Sidebar */}
                    <div className="w-1/3 border-r border-white/10 pr-8 flex flex-col justify-center">
                    <ul className="space-y-6">
                        {categories.map((category, index) => (
                        <li
                            key={category.title}
                            className={`cursor-pointer text-xl font-mono transition-all duration-300 ${
                            selectedIndex === index 
                                ? 'text-cyan-400 translate-x-4 scale-105 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' 
                                : 'text-white/60 hover:text-white hover:translate-x-2'
                            }`}
                            onClick={(e) => { e.stopPropagation(); handleCategorySelect(category, index); }}
                        >
                            {/* Infinite Mirror Effect for Menu Items */}
                             <div className="relative">
                                {selectedIndex === index && [...Array(3)].map((_, i) => (
                                    <span
                                        key={`menu-mirror-${i}`}
                                        className="absolute top-0 left-0 text-cyan-500/20 pointer-events-none select-none"
                                        style={{
                                            transform: `translateX(${(i + 1) * 2}px) translateZ(-${(i + 1) * 5}px)`,
                                            filter: `blur(${(i + 1) * 1}px)`,
                                        }}
                                        aria-hidden="true"
                                    >
                                        {category.title}
                                    </span>
                                ))}
                                <span className="relative z-10">{category.title}</span>
                             </div>
                        </li>
                        ))}
                    </ul>
                    </div>

                    {/* Content Area */}
                    <div className="w-2/3 pl-12 flex flex-col justify-center perspective-500">
                    <AnimatePresence mode="wait">
                        <motion.div
                        key={selectedCategory.title}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.2 }}
                        className="h-full flex flex-col justify-center"
                        >
                        {/* Title with Infinite Mirror Effect */}
                        <h2 className="text-3xl font-bold text-white mb-10 h-12 font-mono tracking-widest border-b border-white/10 pb-4 inline-block relative">
                            {[...Array(3)].map((_, i) => (
                                <span
                                    key={`title-mirror-${i}`}
                                    className="absolute top-0 left-0 text-cyan-500/20 pointer-events-none select-none"
                                    style={{
                                         transform: `translateX(${(i + 1) * 2}px) translateY(${(i + 1) * 1}px)`,
                                         filter: `blur(${(i + 1) * 2}px)`,
                                    }}
                                >
                                    {typedTitle}
                                </span>
                            ))}
                            <span className="relative z-10">{typedTitle || <span className="opacity-0">Placeholder</span>}</span>
                        </h2>
                        
                        <div className="text-white grid grid-cols-1 gap-4">
                            {selectedCategory.links.map((link) => {
                            const Icon = link.icon;
                            return (
                                <a
                                key={link.url}
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-6 text-lg hover:text-cyan-400 transition-all group p-4 hover:bg-white/5 rounded-xl border border-transparent hover:border-white/10 cursor-pointer relative overflow-hidden"
                                onClick={(e) => e.stopPropagation()}
                                download={link.title === 'Resume (PDF)' ? '2026_resume_jason_urbina.pdf' : undefined}
                                >
                                    {/* Icon Mirror */}
                                    <span className="relative text-3xl text-cyan-500/80 group-hover:text-cyan-400 group-hover:scale-110 transition-transform">
                                        {[...Array(2)].map((_, i) => (
                                            <span
                                                key={`icon-mirror-${i}`}
                                                className="absolute inset-0 text-cyan-500/20 pointer-events-none"
                                                style={{
                                                     transform: `translate(${(i + 1) * 2}px, ${(i + 1) * 2}px)`,
                                                     filter: `blur(${(i + 1) * 2}px)`,
                                                }}
                                            >
                                                {typeof Icon === 'string' ? <img src={Icon} alt="" className="w-8 h-8 opacity-50" /> : <Icon />}
                                            </span>
                                        ))}
                                        <span className="relative z-10">
                                            {typeof Icon === 'string' ? <img src={Icon} alt={link.title} className="w-8 h-8" /> : <Icon />}
                                        </span>
                                    </span>
                                    
                                    {/* Text Mirror */}
                                    <span className="relative font-light tracking-wide">
                                         {[...Array(2)].map((_, i) => (
                                            <span
                                                key={`text-mirror-${i}`}
                                                className="absolute top-0 left-0 text-cyan-500/10 pointer-events-none w-full"
                                                style={{
                                                     transform: `translate(${(i + 1) * 1}px, 0)`,
                                                     filter: `blur(${(i + 1) * 1}px)`,
                                                }}
                                            >
                                                {link.title}
                                            </span>
                                        ))}
                                        <span className="relative z-10">{link.title}</span>
                                    </span>
                                </a>
                            );
                            })}
                        </div>
                        </motion.div>
                    </AnimatePresence>
                    </div>
                </div>
            </div>
        </motion.div>
      </Html>
    </group>
  );
};

export default InteractPane;
