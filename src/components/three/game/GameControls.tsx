import React, { useRef, useEffect, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PointerLockControls } from '@react-three/drei';
import * as THREE from 'three';

interface GameControlsProps {
    onCameraUpdate?: (pos: THREE.Vector3) => void;
}

const GameControls = ({ onCameraUpdate }: GameControlsProps) => {
  const { camera, gl } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});
  const moveSpeed = 20.0;
  const isTransitioning = useRef(true);
  const controlsRef = useRef<any>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { 
        if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
        keys.current[e.code] = true; 
    };
    const handleKeyUp = (e: KeyboardEvent) => { 
        keys.current[e.code] = false; 
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Reset transition state on mount
    isTransitioning.current = true;
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      // Reset camera for landing page
      camera.position.set(0, 0, 25);
      camera.lookAt(0, 0, 0);
    };
  }, [camera]);

  useFrame((state, delta) => {
    // Camera Entry Transition
    if (isTransitioning.current) {
        const targetStartPos = new THREE.Vector3(-21.3, -8.2, -8.7);
        const lookAtPos = new THREE.Vector3(0, -15, 0);
        
        // Smooth exponential ease
        camera.position.lerp(targetStartPos, 0.05);
        camera.lookAt(lookAtPos);
        
        // Check if close enough to stop transition
        if (camera.position.distanceTo(targetStartPos) < 0.5) {
            isTransitioning.current = false;
            // Snap to final to prevent drift
            // camera.position.copy(targetStartPos);
            // camera.lookAt(lookAtPos);
        }
        
        // Allow early exit if user tries to move
        if (keys.current['KeyW'] || keys.current['KeyS'] || keys.current['KeyA'] || keys.current['KeyD']) {
             isTransitioning.current = false;
        }
    } else {
        // Normal Movement Logic
        const { KeyW, KeyS, KeyA, KeyD, KeyQ, KeyE, ShiftLeft, Space } = keys.current;
        
        // Only move if controls are locked (mouse captured)
        if (controlsRef.current?.isLocked) {
            const actualSpeed = ShiftLeft ? moveSpeed * 2 : moveSpeed;
            const distance = actualSpeed * delta;

            const forward = new THREE.Vector3();
            camera.getWorldDirection(forward);
            
            const right = new THREE.Vector3();
            right.crossVectors(forward, camera.up);

            if (KeyW) camera.position.addScaledVector(forward, distance);
            if (KeyS) camera.position.addScaledVector(forward, -distance);
            if (KeyA) camera.position.addScaledVector(right, -distance);
            if (KeyD) camera.position.addScaledVector(right, distance);
            if (Space) camera.position.y += distance;
            if (KeyQ) camera.position.y -= distance;
        }
    }
    
    if (onCameraUpdate) {
        onCameraUpdate(camera.position);
    }
  });

  return (
    <PointerLockControls 
        ref={controlsRef} 
        onLock={() => console.log("Pointer Locked")}
        onUnlock={() => console.log("Pointer Unlocked")}
    />
  );
};

export default GameControls;
