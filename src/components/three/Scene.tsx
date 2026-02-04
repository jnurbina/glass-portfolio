import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture, Text3D, Line } from '@react-three/drei';
import { FontLoader, Font } from 'three/examples/jsm/loaders/FontLoader.js';

function Skybox() {
    const texture = useTexture('/starmap4k.jpg');
    return (
        <mesh>
            <sphereGeometry args={[500, 60, 40]} />
            <meshBasicMaterial map={texture} side={THREE.BackSide} />
        </mesh>
    );
}
Skybox.displayName = 'Skybox';

function Rig({ mouse, motion }: { mouse: React.MutableRefObject<[number, number]>, motion: React.MutableRefObject<[number, number, number]> }) {
    const { camera } = useThree();
    const vec = new THREE.Vector3();
    
    useFrame(() => {
        const [x, y] = mouse.current;
        const [ax, ay, az] = motion.current;

        if (ax !== 0 || ay !== 0 || az !== 0) {
            camera.position.lerp(vec.set(ax * 4, ay * 4, camera.position.z), 0.02);
        } else {
            camera.position.lerp(vec.set(x * 2, y * 2, camera.position.z), 0.02);
        }
        camera.lookAt(0, 0, 0);
    });

    return null;
}
Rig.displayName = 'Rig';

import { getWallConfig, WallConfigType } from '@/lib/three/constants';

function RoomEdges({ wallConfig }: { wallConfig: WallConfigType }) {
    return (
        <group>
            {Object.values(wallConfig).map((config, i) => (
                <Line
                    key={i}
                    points={[
                        [-config.size[0]/2, -config.size[1]/2, 0],
                        [config.size[0]/2, -config.size[1]/2, 0],
                        [config.size[0]/2, config.size[1]/2, 0],
                        [-config.size[0]/2, config.size[1]/2, 0],
                        [-config.size[0]/2, -config.size[1]/2, 0],
                    ]}
                    position={new THREE.Vector3(...config.position)}
                    rotation={new THREE.Euler(...config.rotation)}
                    color="#00ffff"
                    lineWidth={1}
                >
                    <meshBasicMaterial 
                        color="#00ffff" 
                        toneMapped={false} // Make it immune to tone mapping, so it glows
                    />
                </Line>
            ))}
        </group>
    );
}
RoomEdges.displayName = 'RoomEdges';

function Logo() {
    const ref = useRef<THREE.Mesh>(null!);
    const materialRef = useRef<THREE.MeshStandardMaterial>(null!);
    const { viewport } = useThree();
    const isMobile = viewport.width < viewport.height;

    useEffect(() => {
        // This component now fades in based on the parent's `showLogo` prop.
        // We can add a fade-in animation here if needed, but for now, we'll rely on the parent.
        // The opacity is handled by the material.
    }, []);

    useFrame(() => {
        if (materialRef.current && materialRef.current.opacity < 1) {
            materialRef.current.opacity += 0.01;
        }
    });

    const mobileSize = viewport.width / 5;
    const desktopSize = viewport.width / 10;
    const size = isMobile ? mobileSize : desktopSize;

    const mobilePos: [number, number, number] = [-viewport.width / 2 + 1, viewport.height / 3, -10];
    const desktopPos: [number, number, number] = [-viewport.width / 2.5, viewport.height / 3, -14];
    const position = isMobile ? mobilePos : desktopPos;

    // Force re-render of Text3D when viewport changes to ensure size updates
    return (
        <group position={position}>
            <Text3D
                key={Math.round(viewport.width)} // Force re-mount on significant viewport change
                ref={ref}
                font={'/helvetiker_regular.typeface.json'}
                size={size}
            >
                1J1
                <meshStandardMaterial
                    ref={materialRef}
                    attach="material"
                    transparent
                    opacity={0}
                    color="#00ffff"
                    emissive="#00ffff"
                    emissiveIntensity={2}
                />
            </Text3D>
        </group>
    );
}
Logo.displayName = 'Logo';

export { Skybox, Rig, RoomEdges, Logo };
