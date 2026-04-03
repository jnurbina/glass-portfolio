import React, { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import { categories, Category } from '@/lib/interact-data';
import { useTypewriter } from '@/hooks/useTypewriter';
import { useResponsivePane } from '@/hooks/use-responsive-pane';
import * as THREE from 'three';

interface InteractPaneProps {
  onClose: () => void;
}

const InteractPane = ({ onClose }: InteractPaneProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [selectedCategory, setSelectedCategory] = useState(categories[0]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { style, distanceFactor, isMobile, isDesktop, tier } = useResponsivePane(900, 700);

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
        distanceFactor={distanceFactor}
        zIndexRange={[100, 0]}
        style={{
             ...style,
             userSelect: 'none',
             pointerEvents: 'auto',
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
            <div className={`w-full h-full rounded-2xl ${isDesktop ? 'p-4' : 'p-4'} overflow-hidden relative z-10`}>
                {/* Decorative corners */}
                <div className={`absolute top-0 left-0 ${isDesktop ? 'w-6 h-6' : 'w-6 h-6'} border-t-2 border-l-2 border-cyan-500 rounded-tl-xl`} />
                <div className={`absolute top-0 right-0 ${isDesktop ? 'w-6 h-6' : 'w-6 h-6'} border-t-2 border-r-2 border-cyan-500 rounded-tr-xl`} />
                <div className={`absolute bottom-0 left-0 ${isDesktop ? 'w-6 h-6' : 'w-6 h-6'} border-b-2 border-l-2 border-cyan-500 rounded-bl-xl`} />
                <div className={`absolute bottom-0 right-0 ${isDesktop ? 'w-6 h-6' : 'w-6 h-6'} border-b-2 border-r-2 border-cyan-500 rounded-br-xl`} />

                {/* Close button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className={`absolute ${isDesktop ? 'top-2 right-2 text-sm' : 'top-3 right-3 text-lg'} text-cyan-500 hover:text-white transition-colors z-50 font-bold cursor-pointer`}
                >
                    [ X ]
                </button>

                <div className={`flex h-full ${isMobile ? 'flex-col mt-2' : ''}`}>
                    {/* Category Navigation - Horizontal on mobile, Sidebar on desktop */}
                    {isMobile ? (
                        <div className="shrink-0 mb-4 overflow-x-auto pb-2">
                            <div className="flex gap-2 min-w-max">
                                {categories.map((category, index) => (
                                    <button
                                        key={category.title}
                                        className={`px-3 py-2 text-xs font-mono whitespace-nowrap rounded-lg transition-all ${
                                            selectedIndex === index
                                                ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                                                : 'text-white/60 hover:text-white border border-white/10 hover:border-white/30'
                                        }`}
                                        onClick={(e) => { e.stopPropagation(); handleCategorySelect(category, index); }}
                                    >
                                        {category.title.replace(/[\[\]]/g, '')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className={`w-1/3 border-r border-white/10 ${isDesktop ? 'pr-5' : 'pr-4'} flex flex-col justify-center`}>
                            <ul className={`${isDesktop ? 'space-y-3' : 'space-y-3'}`}>
                                {categories.map((category, index) => (
                                <li
                                    key={category.title}
                                    className={`cursor-pointer ${isDesktop ? 'text-sm' : 'text-sm'} font-mono transition-all duration-300 ${
                                    selectedIndex === index
                                        ? 'text-cyan-400 translate-x-1 scale-105 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]'
                                        : 'text-white/60 hover:text-white hover:translate-x-0.5'
                                    }`}
                                    onClick={(e) => { e.stopPropagation(); handleCategorySelect(category, index); }}
                                >
                                    <span className="relative z-10">{category.title}</span>
                                </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Content Area */}
                    <div className={`${isMobile ? 'flex-1 min-h-0' : `w-2/3 ${isDesktop ? 'pl-5' : 'pl-6'}`} flex flex-col ${isMobile ? 'justify-start' : 'justify-center'}`}>
                    <AnimatePresence mode="wait">
                        <motion.div key={selectedCategory.title} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}
                        className={`flex flex-col ${isMobile ? 'justify-start' : 'justify-center'}`}>
                        {!isDesktop && <h2 className={`${isMobile ? 'text-xl mb-4 pb-2' : 'text-lg mb-4 pb-2'} font-bold text-white font-mono tracking-widest border-b border-white/10`}>{typedTitle}</h2>}
                        <div className={`text-white ${isDesktop ? 'space-y-2' : 'space-y-1'}`}>
                            {selectedCategory.links.map((link) => {
                            const Icon = link.icon;
                            return (
                                <a key={link.url} href={link.url} target="_blank" rel="noopener noreferrer"
                                className={`flex items-center ${isDesktop ? 'gap-3 text-sm py-2' : isMobile ? 'gap-3 text-sm p-3' : 'gap-3 text-sm p-2'} hover:text-cyan-400 transition-all group cursor-pointer`}
                                onClick={(e) => e.stopPropagation()} download={link.title === 'Resume (PDF)' ? 'urbinaResume2026.pdf' : undefined}>
                                    <span className={`${isDesktop ? 'text-lg' : 'text-lg'} text-cyan-500/80 group-hover:text-cyan-400`}>
                                        {typeof Icon === 'string' ? <img src={Icon} alt={link.title} className={`${isDesktop ? 'w-5 h-5' : 'w-5 h-5'}`} /> : <Icon />}
                                    </span>
                                    <span className="font-light">{link.title}</span>
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
