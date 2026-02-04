import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, Html } from '@react-three/drei';
import { audioEngine } from '@/lib/audio/audio';

const CUBE_SIZE = 1;
const GAP = 0.05;
const TOTAL_SIZE = CUBE_SIZE + GAP;
const BASE_COLOR = 0x660099; // Lush Purple

interface CubeData {
    id: number;
    pos: THREE.Vector3;
    logical: [number, number, number];
}

// Reuse material to save memory
const baseMaterial = new THREE.MeshStandardMaterial({
    color: BASE_COLOR,
    roughness: 0.3,  // Less shiny so color shows
    metalness: 0.7,  // Metallic but colorful
    envMapIntensity: 1.5
});

export default function RubiksCube({ onClose }: { onClose: () => void }) {
    const groupRef = useRef<THREE.Group>(null);
    const pivotRef = useRef<THREE.Object3D>(new THREE.Object3D());
    const [cubes, setCubes] = useState<CubeData[]>([]);
    const meshRefs = useRef<{ [key: number]: THREE.Mesh }>({});
    const isRotating = useRef(false);
    const [cameraReady, setCameraReady] = useState(false);
    
    // UI State
    const [rotationSpeed, setRotationSpeed] = useState(700);
    const [rotationFrequency, setRotationFrequency] = useState(2.0); // Seconds
    const [cubeGap, setCubeGap] = useState(0.05);
    const [wholeCubeAngularVelocity, setWholeCubeAngularVelocity] = useState(0);

    const rotationSpeedRef = useRef(700);
    const cubesRef = useRef<CubeData[]>([]);
    
    // Animation State
    const animation = useRef({
        active: false,
        phase: 'none' as 'none' | 'prep' | 'rotate' | 'settle',
        axis: 'x' as 'x' | 'y' | 'z',
        direction: 1,
        startTime: 0,
        movingIds: [] as number[],
        startRotations: {} as Record<number, THREE.Quaternion>
    });

    useEffect(() => { rotationSpeedRef.current = rotationSpeed; }, [rotationSpeed]);

    // Camera Transition
    const { camera } = useThree();
    useFrame((state, delta) => {
        // Smoothly interpolate camera to target position [5, 5, 5]
        // Only if we are in "cube mode" active (which we are if this mounted)
        const targetPos = new THREE.Vector3(5, 5, 5);
        camera.position.lerp(targetPos, delta * 2);
        camera.lookAt(0, 0, 0);
    });
    
    // Reset camera on unmount
    useEffect(() => {
        return () => {
             camera.position.set(0, 0, 25);
             camera.lookAt(0, 0, 0);
        };
    }, [camera]);

    // Initialize cubes
    useEffect(() => {
        const newCubes = [];
        let id = 0;
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    newCubes.push({
                        id: id++,
                        pos: new THREE.Vector3(x * TOTAL_SIZE, y * TOTAL_SIZE, z * TOTAL_SIZE),
                        logical: [x, y, z] as [number, number, number]
                    });
                }
            }
        }
        setCubes(newCubes);
    }, []);

    useEffect(() => { cubesRef.current = cubes; }, [cubes]);

    // Apply Gap Updates
    useEffect(() => {
        // We only update positions when NOT rotating to avoid conflicts
        if (!isRotating.current) {
             const currentTotalSize = CUBE_SIZE + cubeGap;
             cubesRef.current.forEach(c => {
                 const mesh = meshRefs.current[c.id];
                 if (mesh) {
                     mesh.position.set(
                         c.logical[0] * currentTotalSize,
                         c.logical[1] * currentTotalSize,
                         c.logical[2] * currentTotalSize
                     );
                 }
             });
        }
    }, [cubeGap]);


    const startRotationSafe = (axis: 'x' | 'y' | 'z', layer: number, direction: number) => {
        if (isRotating.current || !groupRef.current) return;
        isRotating.current = true;

        const targetCubes = cubesRef.current.filter(c => c.logical[['x', 'y', 'z'].indexOf(axis)] === layer);
        const movingIds = targetCubes.map(c => c.id);

        if (movingIds.length === 0) {
            isRotating.current = false;
            return;
        }

        // Setup Pivot
        const pivot = pivotRef.current;
        pivot.rotation.set(0, 0, 0);
        pivot.position.set(0, 0, 0);
        groupRef.current.add(pivot);

        // Prep Animation
        animation.current = {
            active: true,
            phase: 'prep',
            axis,
            direction,
            startTime: performance.now(),
            movingIds,
            startRotations: {}
        };
        
        // Removed audio trigger per user request
    };

    const triggerRandomRotation = () => {
        if (isRotating.current) return;
        
        const axes = ['x', 'y', 'z'] as const;
        const axis = axes[Math.floor(Math.random() * 3)];
        const layer = Math.floor(Math.random() * 3) - 1;
        const direction = Math.random() < 0.5 ? 1 : -1;

        startRotationSafe(axis, layer, direction);
    };

    useEffect(() => {
        const interval = setInterval(() => {
            if (!isRotating.current && document.visibilityState === 'visible') {
                triggerRandomRotation();
            }
        }, rotationFrequency * 1000 + Math.random() * 500); // Frequency + Variance
        return () => clearInterval(interval);
    }, [rotationFrequency]); // Re-run when frequency changes

    const resetCube = () => {
        if (isRotating.current) return;
        
        // Reset Logic
        const newCubes = [];
        let id = 0;
        for (let x = -1; x <= 1; x++) {
            for (let y = -1; y <= 1; y++) {
                for (let z = -1; z <= 1; z++) {
                    newCubes.push({
                        id: id++,
                        pos: new THREE.Vector3(x * TOTAL_SIZE, y * TOTAL_SIZE, z * TOTAL_SIZE),
                        logical: [x, y, z] as [number, number, number]
                    });
                }
            }
        }
        setCubes(newCubes);
        cubesRef.current = newCubes;
        
        // Force update mesh positions
        newCubes.forEach(c => {
             const mesh = meshRefs.current[c.id];
             if (mesh) {
                 mesh.position.copy(c.pos);
                 mesh.rotation.set(0,0,0);
                 mesh.updateMatrixWorld();
                 (mesh.material as any).color.setHex(BASE_COLOR);
             }
        });
        
        if (groupRef.current) groupRef.current.rotation.y = 0;
        setWholeCubeAngularVelocity(0);
    };

    useFrame((state, delta) => {
        // Whole cube rotation (Nudge)
        if (groupRef.current && Math.abs(wholeCubeAngularVelocity) > 0.0001) {
            groupRef.current.rotation.y += wholeCubeAngularVelocity;
            setWholeCubeAngularVelocity(v => v * 0.95); // Damping
        }

        if (!animation.current.active) return;
        
        const now = performance.now();
        const pivot = pivotRef.current;
        const movingIds = animation.current.movingIds;
        const currentTotalSize = CUBE_SIZE + cubeGap;
        
        // --- Phase 1: Prep (Scale Up & Highlight) ---
        if (animation.current.phase === 'prep') {
            const prepDuration = rotationSpeedRef.current * 0.3; // 30% of time
            let progress = (now - animation.current.startTime) / prepDuration;
            if (progress > 1) progress = 1;
            
            // Easing
            const val = progress * (2 - progress); // EaseOutQuad

            movingIds.forEach(id => {
                const mesh = meshRefs.current[id];
                if (mesh) {
                    // Scale Up
                    const scale = 1 + (0.1 * val);
                    mesh.scale.set(scale, scale, scale);
                    
                    // Highlight (Switch to Gold)
                    if (progress > 0.1 && (mesh.material as any).color.getHex() === 0xC0C0C0) {
                        (mesh.material as any).color.setHex(0xFFD700); // Gold
                        (mesh.material as any).emissive.setHex(0xFFD700);
                        (mesh.material as any).emissiveIntensity = 1.0 * val;
                    }
                    
                    // Fade in Edge Helper
                    const line = mesh.children.find(c => c.type === 'LineSegments');
                    if (line) (line as any).material.opacity = val;
                }
            });

            if (progress === 1) {
                 animation.current.phase = 'rotate';
                 animation.current.startTime = now;
                 
                 // Attach to Pivot for rotation
                 movingIds.forEach(id => {
                    const mesh = meshRefs.current[id];
                    if (mesh) pivot.attach(mesh);
                });
            }
        }
        
        // --- Phase 2: Rotate ---
        else if (animation.current.phase === 'rotate') {
             const rotateDuration = rotationSpeedRef.current;
             let progress = (now - animation.current.startTime) / rotateDuration;
             if (progress > 1) progress = 1;

             // Elastic/Back Easing
             const c1 = 1.70158;
             const c2 = c1 * 1.525;
             // EaseInOutBack equivalent or similar
             const ease = progress < 0.5
              ? (Math.pow(2 * progress, 2) * ((c2 + 1) * 2 * progress - c2)) / 2
              : (Math.pow(2 * progress - 2, 2) * ((c2 + 1) * (progress * 2 - 2) + c2) + 2) / 2;
             
             // Simple Quintic for smoothness
             const val = progress < 0.5 ? 16 * progress * progress * progress * progress * progress : 1 - Math.pow(-2 * progress + 2, 5) / 2;

             const angle = (Math.PI / 2) * animation.current.direction * val;
             
             if (animation.current.axis === 'x') pivot.rotation.x = angle;
             else if (animation.current.axis === 'y') pivot.rotation.y = angle;
             else pivot.rotation.z = angle;
             
             if (progress === 1) {
                 animation.current.phase = 'settle';
                 animation.current.startTime = now;
                 
                 // Detach from pivot
                 movingIds.forEach(id => {
                     const mesh = meshRefs.current[id];
                     if (mesh && groupRef.current) {
                         groupRef.current.attach(mesh);
                         // Snap positions/rotations
                         mesh.position.x = Math.round(mesh.position.x / currentTotalSize) * currentTotalSize;
                         mesh.position.y = Math.round(mesh.position.y / currentTotalSize) * currentTotalSize;
                         mesh.position.z = Math.round(mesh.position.z / currentTotalSize) * currentTotalSize;
                         
                         const euler = new THREE.Euler().setFromQuaternion(mesh.quaternion);
                         euler.x = Math.round(euler.x / (Math.PI/2)) * (Math.PI/2);
                         euler.y = Math.round(euler.y / (Math.PI/2)) * (Math.PI/2);
                         euler.z = Math.round(euler.z / (Math.PI/2)) * (Math.PI/2);
                         mesh.quaternion.setFromEuler(euler);
                         
                         mesh.updateMatrixWorld();
                     }
                 });
                 groupRef.current?.remove(pivot);
                 pivot.rotation.set(0,0,0);
                 
                 // Update Logical State immediately
                 const updatedCubes = cubesRef.current.map(c => {
                    const mesh = meshRefs.current[c.id];
                    if (mesh) {
                        return {
                            ...c,
                            logical: [
                                Math.round(mesh.position.x / currentTotalSize),
                                Math.round(mesh.position.y / currentTotalSize),
                                Math.round(mesh.position.z / currentTotalSize)
                            ] as [number, number, number]
                        };
                    }
                    return c;
                 });
                 cubesRef.current = updatedCubes; // Update ref directly for next frame safety
                 setCubes(updatedCubes); // Trigger state update eventually
             }
        }
        
        // --- Phase 3: Settle (Scale Down) ---
        else if (animation.current.phase === 'settle') {
            const settleDuration = rotationSpeedRef.current * 0.3;
            let progress = (now - animation.current.startTime) / settleDuration;
            if (progress > 1) progress = 1;
            
            const val = 1 - progress; // Linear down

            movingIds.forEach(id => {
                const mesh = meshRefs.current[id];
                if (mesh) {
                    const scale = 1 + (0.1 * val);
                    mesh.scale.set(scale, scale, scale);
                    
                    // Reset opacity
                    const line = mesh.children.find(c => c.type === 'LineSegments');
                    if (line) (line as any).material.opacity = val;
                    
                    if (progress > 0.8) {
                         (mesh.material as any).color.setHex(0xffffff);
                         (mesh.material as any).emissiveIntensity = 0;
                    }
                }
            });
            
            if (progress === 1) {
                animation.current.phase = 'none';
                animation.current.active = false;
                isRotating.current = false;
            }
        }
    });

    return (
        <group ref={groupRef}>
             <OrbitControls enablePan={false} enableZoom={false} enabled={cameraReady} />
             {/* Lighting for the cube */}
             <directionalLight position={[10, 10, 20]} intensity={1.5} color="white" />
             <pointLight position={[-10, -10, -10]} intensity={0.5} color="#9900ff" />
             
             {cubes.map(c => (
                 <mesh 
                    key={c.id} 
                    ref={el => { if(el) meshRefs.current[c.id] = el; }}
                    position={c.pos}
                 >
                    <boxGeometry args={[CUBE_SIZE, CUBE_SIZE, CUBE_SIZE]} />
                    <meshStandardMaterial color={0x444444} roughness={0.1} metalness={0.9} envMapIntensity={2} />
                    <lineSegments>
                        <edgesGeometry args={[new THREE.BoxGeometry(CUBE_SIZE, CUBE_SIZE, CUBE_SIZE)]} />
                        <lineBasicMaterial color="#ffffff" transparent opacity={0} />
                    </lineSegments>
                 </mesh>
             ))}
             
             <Html position={[0, 0, 0]} fullscreen style={{ pointerEvents: 'none' }}>
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg w-64 pointer-events-auto text-gray-800 flex flex-col gap-4">
                     <h3 className="font-bold text-center border-b border-gray-300 pb-2">Cube Control</h3>
                     
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-600">Rotation Speed: {rotationSpeed}ms</label>
                        <input 
                            type="range" min="200" max="2000" step="50" 
                            value={rotationSpeed} 
                            onChange={(e) => setRotationSpeed(parseInt(e.target.value))}
                            className="w-full accent-red-500"
                        />
                     </div>
                     
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-600">Freq: {rotationFrequency}s</label>
                        <input 
                            type="range" min="0.5" max="5.0" step="0.1" 
                            value={rotationFrequency} 
                            onChange={(e) => setRotationFrequency(parseFloat(e.target.value))}
                            className="w-full accent-red-500"
                        />
                     </div>
                     
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-600">Gap: {cubeGap}</label>
                        <input 
                            type="range" min="0" max="0.5" step="0.01" 
                            value={cubeGap} 
                            onChange={(e) => setCubeGap(parseFloat(e.target.value))}
                            className="w-full accent-red-500"
                        />
                     </div>
                     
                     <div className="flex flex-col gap-1">
                        <label className="text-xs font-bold text-gray-600">Nudge Cube</label>
                        <div className="flex gap-2">
                            <button onClick={() => setWholeCubeAngularVelocity(v => v - 0.05)} className="flex-1 bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 font-bold">&lt;</button>
                            <button onClick={() => setWholeCubeAngularVelocity(v => v + 0.05)} className="flex-1 bg-gray-200 hover:bg-gray-300 rounded px-2 py-1 font-bold">&gt;</button>
                        </div>
                     </div>
                     
                     <button 
                        onClick={resetCube} 
                        className="w-full bg-red-500 text-white font-bold py-2 rounded shadow hover:bg-red-600 transition-colors mt-2"
                    >
                        Return to Stasis
                    </button>
                    
                    <button 
                        onClick={onClose} 
                        className="w-full bg-gray-700 text-white font-bold py-2 rounded shadow hover:bg-gray-600 transition-colors mt-2"
                    >
                        Return (Exit)
                    </button>
                </div>
             </Html>
        </group>
    );
}
