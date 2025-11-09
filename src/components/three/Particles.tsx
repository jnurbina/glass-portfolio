import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { Points } from '@react-three/drei';
import { audioEngine } from '@/lib/audio/AudioEngine';
import { createGlowTexture } from '@/lib/three/utils';

interface Particle {
    position: THREE.Vector3;
    velocity: THREE.Vector3;
}

interface ParticlesProps {
    onHit: (position: THREE.Vector3) => void;
    count: number;
}

function Particles({ onHit, count }: ParticlesProps) {
    const { size, mouse } = useThree();
    const pointsRef = useRef<THREE.Points>(null);
    const glowTexture = useMemo(() => createGlowTexture(), []);
    const particles = useMemo<Particle[]>(() => {
        const temp: Particle[] = [];
        for (let i = 0; i < count; i++) {
            temp.push({
                position: new THREE.Vector3((Math.random() - 0.5) * 80, (Math.random() - 0.5) * 40, (Math.random() - 0.5) * 30),
                velocity: new THREE.Vector3((Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1, (Math.random() - 0.5) * 0.1),
            });
        }
        return temp;
    }, [count]);

    useFrame((_, delta) => {
        if (!pointsRef.current) return;
        const positions = (pointsRef.current.geometry.attributes.position as THREE.BufferAttribute).array as Float32Array;
        const mousePosition = new THREE.Vector3(mouse.x * size.width / 2, mouse.y * size.height / 2, 0);

        particles.forEach((p, i) => {
            const direction = new THREE.Vector3().subVectors(mousePosition, p.position).normalize();
            const distance = p.position.distanceTo(mousePosition);
            p.velocity.add(direction.multiplyScalar(1 / (distance * distance) * 0.1 * delta));
            p.position.add(p.velocity);

            const checkCollision = (axis: 'x' | 'y' | 'z', limit: number) => {
                if (Math.abs(p.position[axis]) > limit) {
                    p.velocity[axis] *= -1;
                    onHit(p.position);
                    audioEngine.playNote(Math.floor(Math.random() * 7), 0.4);
                }
            };

            checkCollision('x', 40);
            checkCollision('y', 20);
            checkCollision('z', 15);

            positions[i * 3] = p.position.x;
            positions[i * 3 + 1] = p.position.y;
            positions[i * 3 + 2] = p.position.z;
        });

        pointsRef.current.geometry.attributes.position.needsUpdate = true;
    });

    return (
        <Points ref={pointsRef} limit={count}>
            <pointsMaterial map={glowTexture} size={0.2} transparent opacity={0.8} blending={THREE.AdditiveBlending} />
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    array={new Float32Array(particles.flatMap(p => p.position.toArray()))}
                    count={particles.length}
                    itemSize={3}
                />
            </bufferGeometry>
        </Points>
    );
}
Particles.displayName = 'Particles';

export default Particles;
