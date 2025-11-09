import React, { useRef, useMemo, useEffect, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { TILE_SIZE } from '@/lib/three/constants';
import { createTileTexture } from '@/lib/three/utils';

interface TileProps {
    position: [number, number, number];
    onHit: (callback: (hitPosition: THREE.Vector3) => void) => () => void;
    envMap: THREE.Texture | null;
}

const Tile = React.memo(({ position, onHit, envMap }: TileProps) => {
    const ref = useRef<THREE.Mesh>(null!);
    const [emissiveIntensity, setEmissiveIntensity] = useState(0);
    const tileTexture = useMemo(() => createTileTexture(), []);

    useFrame((_, delta) => {
        if (emissiveIntensity > 0) {
            setEmissiveIntensity(Math.max(0, emissiveIntensity - delta * 2));
        }
    });

    useEffect(() => {
        const unsubscribe = onHit((hitPosition: THREE.Vector3) => {
            if (ref.current && ref.current.geometry.boundingSphere) {
                const worldPosition = new THREE.Vector3();
                ref.current.getWorldPosition(worldPosition);
                const distance = worldPosition.distanceTo(hitPosition);
                if (distance < TILE_SIZE) {
                    setEmissiveIntensity(1);
                }
            }
        });
        return unsubscribe;
    }, [onHit]);

    return (
        <mesh ref={ref} position={position}>
            <planeGeometry args={[TILE_SIZE, TILE_SIZE]} />
            <meshStandardMaterial
                map={tileTexture}
                color="#ffffff"
                roughness={0.1}
                metalness={0.9}
                emissive="#00ffff" // Tron blue emissive
                emissiveIntensity={emissiveIntensity}
                envMap={envMap}
                envMapIntensity={1}
            />
        </mesh>
    );
});
Tile.displayName = 'Tile';

interface TiledWallProps {
    config: { size: [number, number]; position: [number, number, number]; rotation: [number, number, number] };
    onHit: (callback: (hitPosition: THREE.Vector3) => void) => () => void;
    envMap: THREE.Texture | null;
}

const TiledWall = ({ config, onHit, envMap }: TiledWallProps) => {
    const tiles = useMemo(() => {
        const [width, height] = config.size;
        const tilesArr: { x: number, y: number }[] = [];
        for (let x = -width / 2 + TILE_SIZE / 2; x < width / 2; x += TILE_SIZE) {
            for (let y = -height / 2 + TILE_SIZE / 2; y < height / 2; y += TILE_SIZE) {
                tilesArr.push({ x, y });
            }
        }
        return tilesArr;
    }, [config.size]);

    return (
        <group position={new THREE.Vector3(...config.position)} rotation={new THREE.Euler(...config.rotation)}>
            {tiles.map((tile, i) => (
                <Tile key={i} position={[tile.x, tile.y, 0]} onHit={onHit} envMap={envMap} />
            ))}
        </group>
    );
};
TiledWall.displayName = 'TiledWall';

export default TiledWall;
