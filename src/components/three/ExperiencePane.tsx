import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { experienceData } from '@/lib/experience-data';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useResponsivePane } from '@/hooks/use-responsive-pane';
import StackedImageDeck from './StackedImageDeck';

interface PaneProps {
  onClose: () => void;
}

const ExperiencePane = ({ onClose }: PaneProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const { style, distanceFactor, isMobile } = useResponsivePane(1000, 600);

  // Reset image index when switching experience cards
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [currentIndex]);

  // Get the current link and label based on the visible image
  const getCurrentLinkInfo = () => {
    const item = experienceData[currentIndex];
    if (item.imageLinkLabels && item.imageLinks) {
      return {
        url: item.imageLinks[currentImageIndex] || item.imageLinks[0],
        label: item.imageLinkLabels[currentImageIndex] || item.imageLinkLabels[0]
      };
    }
    return {
      url: item.link,
      label: item.linkLabel
    };
  };

  const linkInfo = getCurrentLinkInfo();

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % experienceData.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + experienceData.length) % experienceData.length);
  };
  
  useFrame((state) => {
    if (groupRef.current) {
        const time = state.clock.getElapsedTime();
        groupRef.current.position.y = Math.sin(time * 1.5) * 0.1;
        groupRef.current.rotation.x = Math.sin(time * 0.5) * 0.02;
    }
  });

  const currentItem = experienceData[currentIndex];

  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === 'ArrowLeft') {
              handlePrev();
          } else if (e.key === 'ArrowRight') {
              handleNext();
          }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 300 : -300,
      opacity: 0
    })
  };

  return (
    <group ref={groupRef} position={[0, 0, 10]}>
      <Html transform position={[0, 0, 0]} distanceFactor={distanceFactor} zIndexRange={[100, 0]} style={style}>
         <div className={`w-full h-full bg-black/90 text-white relative rounded-xl border border-cyan-500/50 backdrop-blur-md flex flex-col ${isMobile ? 'p-4' : 'p-6 max-w-4xl mx-auto'}`}>
            {/* Header */}
            <div className="shrink-0 relative">
                <button onClick={onClose} aria-label="Close Pane" className="absolute top-0 right-0 text-cyan-500 hover:text-white text-xl font-bold z-50 leading-none">[ X ]</button>
                <h2 className="text-xl md:text-2xl font-bold mb-2 md:mb-4 text-cyan-400 tracking-widest text-center">[ EXPERIENCE ]</h2>
            </div>
            
            {/* Main Content - Flex-1 to take remaining height, min-h-0 to allow nested scrolling */}
            <div className="flex-1 min-h-0 relative flex items-center">
                {/* Nav Buttons */}
                <button 
                    onClick={handlePrev} 
                    className={`absolute left-0 z-20 p-2 text-cyan-500 hover:text-white transition-colors bg-black/50 rounded-full hover:bg-cyan-900/30 ${isMobile ? '-ml-2' : ''}`}
                >
                    <FaChevronLeft size={isMobile ? 20 : 30} />
                </button>

                <div className="w-full h-full px-8 md:px-12 relative overflow-hidden">
                    <AnimatePresence initial={false} custom={direction} mode="wait">
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 }
                            }}
                            className="absolute inset-0 w-full h-full flex flex-col md:flex-row gap-4 md:gap-6 bg-white/5 rounded-lg border border-white/10 overflow-hidden"
                        >
                            {/* Image Section - Stacked image deck */}
                            <div className={`${isMobile ? 'h-1/3 w-full' : 'w-5/12 h-full'} relative shrink-0 overflow-hidden group border-b md:border-b-0 md:border-r border-white/10`}>
                                {/* Padding for stack overflow (images peek top-left) */}
                                <div className="absolute inset-0 p-4 md:p-6">
                                    <StackedImageDeck
                                        images={currentItem.images || []}
                                        interval={3500}
                                        link={currentItem.link}
                                        imageLinks={currentItem.imageLinks}
                                        onImageChange={setCurrentImageIndex}
                                    />
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent md:bg-gradient-to-t md:from-black/80 pointer-events-none" />
                                <div className="absolute bottom-2 left-3 md:bottom-4 md:left-4 z-10">
                                     <h3 className="text-sm md:text-xl font-bold shadow-black drop-shadow-md">{currentItem.company}</h3>
                                     <p className="text-xs md:text-sm text-cyan-300 shadow-black drop-shadow-md">{currentItem.period}</p>
                                </div>
                            </div>

                            {/* Text Section - Flex-1 with internal scroll */}
                            <div className="flex-1 flex flex-col min-h-0 p-3 md:p-6 overflow-y-auto custom-scrollbar">
                                <h3 className="text-lg md:text-2xl font-bold text-cyan-400 leading-tight">{currentItem.title}</h3>
                                <h4 className="text-xs md:text-sm text-white/70 mb-3 md:mb-4 font-mono">{currentItem.role}</h4>
                                <ul className="space-y-2">
                                    {currentItem.highlights.map((highlight, idx) => (
                                        <li key={idx} className="flex items-start gap-2 text-white/90 text-xs md:text-sm leading-relaxed">
                                            <span className="text-cyan-500 mt-1 shrink-0">▹</span>
                                            <span>{highlight}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Visit Link */}
                                {linkInfo.url && linkInfo.label && (
                                    <div className="mt-4 pt-3 border-t border-white/10">
                                        <AnimatePresence mode="wait">
                                            <motion.a
                                                key={linkInfo.label}
                                                href={linkInfo.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 transition-colors text-sm md:text-base font-medium"
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -10 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                            >
                                                <span>Visit {linkInfo.label}</span>
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                                </svg>
                                            </motion.a>
                                        </AnimatePresence>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <button 
                    onClick={handleNext} 
                    className={`absolute right-0 z-20 p-2 text-cyan-500 hover:text-white transition-colors bg-black/50 rounded-full hover:bg-cyan-900/30 ${isMobile ? '-mr-2' : ''}`}
                >
                    <FaChevronRight size={isMobile ? 20 : 30} />
                </button>
            </div>
            
            {/* Pagination Indicators */}
            <div className="shrink-0 flex justify-center gap-2 mt-3 h-4">
                {experienceData.map((_, idx) => (
                    <div 
                        key={idx} 
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-cyan-400 w-6' : 'bg-white/30'}`}
                    />
                ))}
            </div>
         </div>
      </Html>
    </group>
  );
};
export default ExperiencePane;
