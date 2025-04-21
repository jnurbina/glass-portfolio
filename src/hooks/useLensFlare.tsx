"use client";

import React, { useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';

interface UseLensFlareProps {
  elementRef: React.RefObject<HTMLElement>;
  intensity?: number;
  size?: number;
}

export const useLensFlare = ({ 
  elementRef, 
  intensity = 0.5, 
  size = 100 
}: UseLensFlareProps) => {
  const [{ x, y, opacity }, api] = useSpring(() => ({
    x: 0,
    y: 0,
    opacity: 0,
    config: { mass: 1, tension: 200, friction: 30 }
  }));

  useEffect(() => {
    if (!elementRef.current) return;
    
    const element = elementRef.current;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      
      // Calculate distance from center
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const distanceFromCenter = Math.sqrt(
        Math.pow(mouseX - centerX, 2) + Math.pow(mouseY - centerY, 2)
      );
      
      // Only show flare when mouse is near center
      const maxDistance = Math.min(rect.width, rect.height) * 0.4;
      const opacityValue = distanceFromCenter < maxDistance 
        ? (1 - distanceFromCenter / maxDistance) * intensity
        : 0;
      
      api.start({
        x: mouseX,
        y: mouseY,
        opacity: opacityValue,
        immediate: false
      });
    };
    
    const handleMouseLeave = () => {
      api.start({ opacity: 0 });
    };
    
    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);
    
    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [elementRef, api, intensity]);
  
  const LensFlareElement = () => (
    <animated.div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        opacity,
        transform: 'translate(-50%, -50%)',
        background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0) 70%)',
        pointerEvents: 'none',
        zIndex: 10,
        mixBlendMode: 'screen'
      }}
    />
  );
  
  return { LensFlareElement };
};
