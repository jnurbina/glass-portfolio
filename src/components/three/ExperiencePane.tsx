import React, { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';
import * as THREE from 'three';
import { experienceData } from '@/lib/experience-data';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { useResponsivePane } from '@/hooks/use-responsive-pane';

interface PaneProps {
  onClose: () => void;
}

const ExperiencePane = ({ onClose }: PaneProps) => {
  const groupRef = useRef<THREE.Group>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const { style, distanceFactor, isMobile } = useResponsivePane(1000, 600);

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
         <div className={`w-full h-full bg-black/90 text-white relative rounded-xl border border-cyan-500/50 backdrop-blur-md overflow-hidden flex flex-col ${isMobile ? 'p-4' : 'p-8'}`}>
            <button onClick={onClose} aria-label="Close Pane" className="absolute top-4 right-4 text-cyan-500 hover:text-white text-xl font-bold z-50">[ X ]</button>
            <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6 text-cyan-400 tracking-widest text-center">[ EXPERIENCE ]</h2>
            
            <div className="flex-1 flex items-center justify-between px-0 md:px-4 relative overflow-hidden">
                {/* Navigation Buttons - Smaller and absolute on mobile to save space? Or just stick to sides */}
                <button onClick={handlePrev} className={`z-20 p-2 md:p-4 hover:text-cyan-400 transition-colors text-xl md:text-3xl bg-black/50 rounded-full hover:bg-white/10 ${isMobile ? 'absolute left-2' : ''}`}>
                    <FaChevronLeft />
                </button>

                <div className="flex-1 h-full mx-2 md:mx-8 relative flex items-center justify-center overflow-hidden">
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
                            className={`absolute w-full h-full flex gap-4 md:gap-8 items-center ${isMobile ? 'flex-col justify-start pt-2 overflow-y-auto pb-8' : 'flex-row'}`}
                        >
                            {/* Image Section */}
                            <div className={`${isMobile ? 'w-full h-40 shrink-0' : 'w-1/2 h-full'} relative rounded-lg overflow-hidden border border-white/10 group`}>
                                {currentItem.image ? (
                                    <img src={currentItem.image} alt={currentItem.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center text-gray-500">
                                        No Image
                                    </div>
                                )}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                <div className="absolute bottom-4 left-4">
                                     <h3 className="text-lg md:text-xl font-bold">{currentItem.company}</h3>
                                     <p className="text-xs md:text-sm text-cyan-300">{currentItem.period}</p>
                                </div>
                            </div>

                            {/* Text Section */}
                            <div className={`${isMobile ? 'w-full' : 'w-1/2'} flex flex-col justify-center h-full`}>
                                <h3 className="text-xl md:text-2xl font-bold mb-1 md:mb-2 text-cyan-400">{currentItem.title}</h3>
                                <h4 className="text-sm md:text-lg text-white/80 mb-4 md:mb-6 font-mono">{currentItem.role}</h4>
                                <ul className="space-y-2 md:space-y-4">
                                    {currentItem.highlights.map((highlight, idx) => (
                                        <li key={idx} className="flex items-start gap-2 md:gap-3 text-white/90 text-sm md:text-base">
                                            <span className="text-cyan-500 mt-1">▹</span>
                                            <span>{highlight}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>

                <button onClick={handleNext} className={`z-20 p-2 md:p-4 hover:text-cyan-400 transition-colors text-xl md:text-3xl bg-black/50 rounded-full hover:bg-white/10 ${isMobile ? 'absolute right-2' : ''}`}>
                    <FaChevronRight />
                </button>
            </div>
            
            {/* Pagination Indicators */}
            <div className="flex justify-center gap-2 mt-2 md:mt-4 pb-2 md:pb-0">
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
