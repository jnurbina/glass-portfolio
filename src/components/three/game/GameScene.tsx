import React, { useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useThreeCanvasState } from '@/hooks/use-three-canvas-state';
import { useGameStore } from '@/hooks/use-game-store';
import BattleGrid from './BattleGrid';
import GameControls from './GameControls';

interface GameSceneProps {
  onClose: () => void;
}

const GameScene = ({ onClose }: GameSceneProps) => {
  const { setParticleCount } = useThreeCanvasState();
  const { phase, user, shipPos, setShipPos, setDebugInfo } = useGameStore();

  // Initial setup
  useEffect(() => {
    setParticleCount(20);
    return () => setParticleCount(128);
  }, [setParticleCount]);

  const handleCellClick = (x: number, y: number) => {
    if (phase === 'placement') {
        setShipPos({ x, y });
    }
  };

  return (
    <group>
      <GameControls onCameraUpdate={(pos) => setDebugInfo({ cam: `${pos.x.toFixed(1)}, ${pos.y.toFixed(1)}, ${pos.z.toFixed(1)}` })} />
      
      {user && (
        <BattleGrid 
            onCellClick={handleCellClick} 
            onHover={(x, y) => setDebugInfo({ x, y })}
            shipPosition={shipPos} 
            position={[0, -15, 0]} // Align with floor
        />
      )}
    </group>
  );
};

export default GameScene;
