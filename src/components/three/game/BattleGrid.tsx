import React, { useState } from 'react';
import * as THREE from 'three';

interface BattleGridProps {
  onCellClick: (x: number, y: number) => void;
  onHover?: (x: number, y: number) => void;
  shipPosition: { x: number, y: number } | null;
  opponentHits?: { x: number, y: number }[];
  position?: [number, number, number];
}

const BattleGrid = ({ onCellClick, onHover, shipPosition, opponentHits = [], position = [0, -10, 0] }: BattleGridProps) => {
  const [hoveredCell, setHoveredCell] = useState<{ x: number, y: number } | null>(null);

  const gridSize = 10;
  const cellSize = 2; // Larger cubes
  const offset = (gridSize * cellSize) / 2 - cellSize / 2;

  return (
    <group position={new THREE.Vector3(...position)}>
      {/* Grid Base Layer */}
      <gridHelper 
        args={[gridSize * cellSize, gridSize, 0x00ffff, 0x111111]} 
        position={[0, 0.1, 0]}
      />

      {/* Interactive Cells */}
      {Array.from({ length: gridSize }).map((_, x) =>
        Array.from({ length: gridSize }).map((_, y) => {
          const posX = x * cellSize - offset;
          const posZ = y * cellSize - offset;
          const isHovered = hoveredCell?.x === x && hoveredCell?.y === y;
          const isShip = shipPosition?.x === x && shipPosition?.y === y;

          return (
            <group key={`${x}-${y}`} position={[posX, 0, posZ]}>
                {/* Hit Box / Sensor */}
                <mesh
                    position={[0, 0.1, 0]}
                    visible={false} // Invisible raycast target
                    onPointerOver={(e) => {
                        e.stopPropagation();
                        setHoveredCell({ x, y });
                        if (onHover) onHover(x, y);
                    }}
                    onPointerOut={() => {
                        setHoveredCell(null);
                        if (onHover) onHover(-1, -1);
                    }}
                    onClick={(e) => {
                        e.stopPropagation();
                        onCellClick(x, y);
                    }}
                >
                    <boxGeometry args={[cellSize, 0.5, cellSize]} />
                    <meshBasicMaterial />
                </mesh>

                {/* Selection Highlight Cursor (Holographic Square) */}
                {isHovered && !isShip && (
                    <mesh position={[0, 0.2, 0]} rotation={[-Math.PI/2, 0, 0]}>
                        <planeGeometry args={[cellSize * 0.9, cellSize * 0.9]} />
                        <meshBasicMaterial color="#00ffff" transparent opacity={0.3} side={THREE.DoubleSide} />
                    </mesh>
                )}

                {/* 3D Cube Piece */}
                {isShip && (
                    <mesh position={[0, cellSize / 2, 0]}>
                        <boxGeometry args={[cellSize * 0.8, cellSize * 0.8, cellSize * 0.8]} />
                        <meshStandardMaterial 
                            color="#00ffff" 
                            emissive="#0088ff"
                            emissiveIntensity={0.5}
                            metalness={0.8}
                            roughness={0.2}
                        />
                    </mesh>
                )}
            </group>
          );
        })
      )}
    </group>
  );
};

export default BattleGrid;
