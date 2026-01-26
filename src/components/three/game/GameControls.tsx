import React, { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { MapControls } from '@react-three/drei';
import * as THREE from 'three';

interface GameControlsProps {
    onCameraUpdate?: (pos: THREE.Vector3) => void;
}

const GameControls = ({ onCameraUpdate }: GameControlsProps) => {
  const controlsRef = useRef<any>(null);
  const { camera } = useThree();
  const keys = useRef<{ [key: string]: boolean }>({});

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
    
    // Initial RTS position - Player 1 View
    camera.position.set(-12.1, 5.0, -11.0);
    camera.lookAt(0, 0, 0);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      
      // Reset camera for landing page
      camera.position.set(0, 0, 25);
      camera.lookAt(0, 0, 0);
    };
  }, [camera]);

  useFrame((state, delta) => {
    if (!controlsRef.current) return;

    if (onCameraUpdate) {
        onCameraUpdate(camera.position);
    }

    const speed = 15 * delta;
    const verticalSpeed = 10 * delta;
    const rotateSpeed = 2 * delta;
    const { KeyW, KeyA, KeyS, KeyD, KeyQ, KeyE, KeyR, KeyF } = keys.current;
    const target = controlsRef.current.target;
    const camPos = camera.position;

    // Rotation (Orbit around target)
    if (KeyQ) {
        const x = camPos.x - target.x;
        const z = camPos.z - target.z;
        camPos.x = x * Math.cos(rotateSpeed) - z * Math.sin(rotateSpeed) + target.x;
        camPos.z = x * Math.sin(rotateSpeed) + z * Math.cos(rotateSpeed) + target.z;
    }
    if (KeyE) {
        const x = camPos.x - target.x;
        const z = camPos.z - target.z;
        camPos.x = x * Math.cos(-rotateSpeed) - z * Math.sin(-rotateSpeed) + target.x;
        camPos.z = x * Math.sin(-rotateSpeed) + z * Math.cos(-rotateSpeed) + target.z;
    }

    // Vertical (Height)
    if (KeyR) {
        camPos.y += verticalSpeed;
    }
    if (KeyF) {
        camPos.y -= verticalSpeed;
    }

    // Forward/Back (Relative to camera direction)
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    const right = new THREE.Vector3();
    right.crossVectors(forward, new THREE.Vector3(0, 1, 0));

    if (KeyW) {
        target.addScaledVector(forward, speed);
        camPos.addScaledVector(forward, speed);
    }
    if (KeyS) {
        target.addScaledVector(forward, -speed);
        camPos.addScaledVector(forward, -speed);
    }
    if (KeyA) {
        target.addScaledVector(right, -speed);
        camPos.addScaledVector(right, -speed);
    }
    if (KeyD) {
        target.addScaledVector(right, speed);
        camPos.addScaledVector(right, speed);
    }

    // Constraints
    target.z = Math.max(-20, Math.min(target.z, 20)); // Loosened for exploration
    target.x = Math.max(-20, Math.min(target.x, 20));
    
    // Clamp height (relative to floor at -15)
    // We'll let it go as low as -10 (close to floor) up to 30
    camPos.y = Math.max(-10, Math.min(camPos.y, 30)); 

    controlsRef.current.update();
  });

  return (
    <MapControls 
        ref={controlsRef}
        enableDamping={true}
        dampingFactor={0.1}
        minDistance={10}
        maxDistance={30}
        maxPolarAngle={Math.PI / 3} 
        screenSpacePanning={false}
        enablePan={false} // We handle panning manually
    />
  );
};

export default GameControls;
