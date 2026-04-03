'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sprite, Avatar } from './SpriteEngine';
import { audioEngine } from '@/lib/audio/audio';

// Sprites from public/, audio from Vercel Blob
const ASSET_BASE = '/lornscroll';
const BLOB_BASE = 'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/lornscroll';

const ASSET_SOURCES = {
  backgroundSkyline: `${ASSET_BASE}/environment/skyline-a.png`,
  backgroundBuildingsFar: `${ASSET_BASE}/environment/buildings-bg.png`,
  backgroundBuildingsNear: `${ASSET_BASE}/environment/near-buildings-bg.png`,
  foregroundTexture: `${ASSET_BASE}/environment/bg3.png`,
  avatarIdle: `${ASSET_BASE}/merchant/idle.png`,
  avatarWalk: `${ASSET_BASE}/merchant/walk.png`,
  npc1Idle: `${ASSET_BASE}/toasterbot/idle.png`,
  npc1Run: `${ASSET_BASE}/toasterbot/run.png`,
  walkAudio: `${BLOB_BASE}/audio/walking.wav`,
  jumpAudio: `${BLOB_BASE}/audio/jump.wav`,
  bgMusic: `${BLOB_BASE}/audio/bgmusic.wav`,
} as const;

type AssetKey = keyof typeof ASSET_SOURCES;
type LoadedAssets = Record<AssetKey, HTMLImageElement | HTMLAudioElement>;

const CANVAS_W = 800;
const CANVAS_H = 600;
const GROUND_Y = 520; // Y position where characters stand on the "street"

interface LornScrollProps {
  onClose: () => void;
}

export default function LornScroll({ onClose }: LornScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const animFrameRef = useRef<number>(0);

  const [loading, setLoading] = useState(true);
  const [loadingPct, setLoadingPct] = useState(0);
  const [loadingText, setLoadingText] = useState('Loading...');
  const [started, setStarted] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogText, setDialogText] = useState('');
  const dialogFullText = 'It was a zipadeedoodah kind of day...';

  // Suspend portfolio audio on mount, resume on unmount
  useEffect(() => {
    audioEngine.suspend();
    return () => {
      audioEngine.resume();
    };
  }, []);

  // Load assets
  useEffect(() => {
    const entries = Object.entries(ASSET_SOURCES);
    const total = entries.length;
    let loaded = 0;
    const assets: Partial<LoadedAssets> = {};

    const promises = entries.map(
      ([key, src]) =>
        new Promise<void>((resolve, reject) => {
          if (src.endsWith('.wav')) {
            const audio = new Audio();
            audio.oncanplaythrough = () => {
              assets[key as AssetKey] = audio;
              loaded++;
              setLoadingPct((loaded / total) * 100);
              resolve();
            };
            audio.onerror = () => reject(new Error(`Failed to load ${src}`));
            audio.src = src;
          } else {
            const img = new window.Image();
            img.onload = () => {
              assets[key as AssetKey] = img;
              loaded++;
              setLoadingPct((loaded / total) * 100);
              resolve();
            };
            img.onerror = () => reject(new Error(`Failed to load ${src}`));
            img.src = src;
          }
        })
    );

    Promise.all(promises)
      .then(() => {
        setLoadingText('Click to Begin');
        setLoading(false);
        if (containerRef.current) {
          (containerRef.current as any).__assets = assets;
        }
      })
      .catch((err) => {
        console.error('Asset load error:', err);
        setLoadingText('Asset load failed — check console');
      });
  }, []);

  // Start game on click
  const handleStart = useCallback(() => {
    if (!loading) setStarted(true);
  }, [loading]);

  // Dialog typewriter effect
  useEffect(() => {
    if (!started) return;
    const timer = setTimeout(() => setShowDialog(true), 1000);
    return () => clearTimeout(timer);
  }, [started]);

  useEffect(() => {
    if (!showDialog) return;
    if (dialogText.length >= dialogFullText.length) {
      const hide = setTimeout(() => setShowDialog(false), 2000);
      return () => clearTimeout(hide);
    }
    const t = setTimeout(
      () => setDialogText(dialogFullText.slice(0, dialogText.length + 1)),
      44
    );
    return () => clearTimeout(t);
  }, [showDialog, dialogText]);

  // Game loop
  useEffect(() => {
    if (!started || !canvasRef.current || !containerRef.current) return;
    const assets = (containerRef.current as any).__assets as LoadedAssets;
    if (!assets) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    // Backgrounds
    const bgSkyline = new Sprite({
      context: ctx,
      image: assets.backgroundSkyline as HTMLImageElement,
      position: { x: 0, y: -135 },
      scale: 3,
      noRepeat: false,
    });
    const bgFar = new Sprite({
      context: ctx,
      image: assets.backgroundBuildingsFar as HTMLImageElement,
      position: { x: 0, y: 65 },
      scale: 4,
      noRepeat: false,
    });
    const bgNear = new Sprite({
      context: ctx,
      image: assets.backgroundBuildingsNear as HTMLImageElement,
      position: { x: 0, y: -250 },
      scale: 4,
      noRepeat: false,
    });
    const fgTexture = new Sprite({
      context: ctx,
      image: assets.foregroundTexture as HTMLImageElement,
      position: { x: 0, y: -300 },
      scale: 5,
      noRepeat: false,
    });

    // Audio — adjusted volumes
    const bgMusic = assets.bgMusic as HTMLAudioElement;
    const walkSound = assets.walkAudio as HTMLAudioElement;
    const jumpSound = assets.jumpAudio as HTMLAudioElement;
    walkSound.volume = 0.3;
    jumpSound.volume = 0.35;
    bgMusic.volume = 0.08; // much quieter BGM
    bgMusic.loop = true;
    walkSound.loop = true;
    bgMusic.play().catch(() => {});

    // Player avatar — positioned on the street
    const avatar = new Avatar({
      context: ctx,
      image: assets.avatarIdle as HTMLImageElement,
      position: { x: 100, y: GROUND_Y - 64 * 3 + 80 }, // offset to stand on ground
      velocity: { x: 0, y: 0 },
      framesMax: 4,
      scale: 3,
      offset: { x: 28, y: 80 },
      sprites: {
        idle: { img: assets.avatarIdle as HTMLImageElement, framesMax: 4 },
        walk: { img: assets.avatarWalk as HTMLImageElement, framesMax: 5 },
      },
    });

    // NPC 1 — Toaster Bot (idle, patrolling right side)
    const npc1 = new Sprite({
      context: ctx,
      image: assets.npc1Idle as HTMLImageElement,
      position: { x: 500, y: GROUND_Y - 22 * 3 + 17 }, // scaled 3x, offset to ground
      scale: 3,
      framesMax: 5,
      noRepeat: true,
    });
    npc1.framesHold = 14; // slightly slower animation

    // NPC 2 — second Toaster Bot further out
    const npc2 = new Sprite({
      context: ctx,
      image: assets.npc1Run as HTMLImageElement,
      position: { x: 650, y: GROUND_Y - 22 * 3 + 17 },
      scale: 3,
      framesMax: 8,
      noRepeat: true,
    });
    npc2.framesHold = 10;

    // NPC patrol state
    let npc1Dir = 1;
    let npc2Dir = -1;
    const NPC_SPEED = 0.5;

    const backgrounds = [bgSkyline, bgFar, bgNear, fgTexture];
    const speeds = [0.1, 0.25, 0.5, 0.75];

    const animate = () => {
      animFrameRef.current = requestAnimationFrame(animate);

      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Parallax
      backgrounds.forEach((bg, i) => {
        const mult =
          avatar.position.x <= 32 || avatar.position.x >= CANVAS_W - 160
            ? speeds[i]
            : speeds[i] * 0.5;
        bg.position.x -= avatar.velocity.x * mult;

        const frameW = (bg.width / bg.framesMax) * bg.scale;
        const repeatX = Math.ceil(CANVAS_W / frameW);
        const totalW = frameW * repeatX;
        if (bg.position.x < -totalW) bg.position.x += totalW;
      });

      avatar.position.x = Math.max(
        32,
        Math.min(avatar.position.x, CANVAS_W - 160)
      );

      bgSkyline.update();
      bgFar.update();
      bgNear.update();
      fgTexture.update();

      ctx.fillStyle = 'rgba(255, 255, 255, .10)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Draw NPCs
      npc1.update();
      npc2.update();

      // NPC patrol movement
      npc1.position.x += NPC_SPEED * npc1Dir;
      if (npc1.position.x > 600 || npc1.position.x < 400) npc1Dir *= -1;
      npc1.direction = npc1Dir > 0 ? 'right' : 'left';

      npc2.position.x += NPC_SPEED * npc2Dir;
      if (npc2.position.x > 700 || npc2.position.x < 500) npc2Dir *= -1;
      npc2.direction = npc2Dir > 0 ? 'right' : 'left';

      // Draw avatar
      avatar.update();
      avatar.velocity.x = 0;
      avatar.switchSprite('idle');

      // Jump
      if (keysRef.current[' '] || keysRef.current['ArrowUp'] || keysRef.current['w']) {
        // Only jump if on the ground
        const groundCheck = CANVAS_H - 80;
        if (avatar.position.y + avatar.height >= groundCheck) {
          avatar.velocity.y = -16;
          if (!jumpSound.paused) {
            jumpSound.pause();
            jumpSound.currentTime = 0;
          }
          jumpSound.play().catch(() => {});
        }
      }
      // Fast fall
      if (keysRef.current['ArrowDown'] || keysRef.current['s']) {
        if (avatar.position.y + avatar.height < CANVAS_H - avatar.height) {
          avatar.velocity.y += 1.4;
        }
      }
      // Move left
      if (keysRef.current['ArrowLeft'] || keysRef.current['a']) {
        avatar.direction = 'left';
        avatar.switchSprite('walk');
        avatar.velocity.x -= 3;
        walkSound.play().catch(() => {});
      }
      // Move right
      else if (keysRef.current['ArrowRight'] || keysRef.current['d']) {
        avatar.direction = 'right';
        avatar.switchSprite('walk');
        avatar.velocity.x += 3;
        walkSound.play().catch(() => {});
      } else {
        avatar.switchSprite('idle');
        walkSound.pause();
        walkSound.currentTime = 0;
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      bgMusic.pause();
      bgMusic.currentTime = 0;
      walkSound.pause();
    };
  }, [started]);

  // Keyboard — isolated to this component
  useEffect(() => {
    if (!started) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      const gameKeys = [
        'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
        'w', 'a', 's', 'd', ' ',
      ];
      if (gameKeys.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        keysRef.current[e.key] = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current[e.key] = false;
    };

    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [started, onClose]);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      style={{ touchAction: 'none' }}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold transition-colors"
        title="Exit LornScroll (Esc)"
      >
        ✕
      </button>

      {/* Loading screen */}
      {!started && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center z-40 cursor-pointer"
          onClick={handleStart}
        >
          <h1 className="text-white text-2xl font-bold mb-4 font-mono">
            {loadingText}
          </h1>
          <div className="w-1/2 h-8 border-4 border-white/90 rounded-lg overflow-hidden">
            <div
              className="h-full bg-red-500 transition-all duration-500"
              style={{ width: `${loadingPct}%` }}
            />
          </div>
        </div>
      )}

      {/* Game canvas — scales to fit viewport while maintaining aspect ratio */}
      <canvas
        ref={canvasRef}
        className={`${started ? 'block' : 'hidden'}`}
        style={{
          width: '100%',
          maxWidth: `${CANVAS_W}px`,
          height: 'auto',
          maxHeight: '100vh',
          aspectRatio: `${CANVAS_W}/${CANVAS_H}`,
          imageRendering: 'pixelated',
        }}
      />

      {/* Dialog box — positioned INSIDE the game canvas area, relative to canvas */}
      {started && showDialog && (
        <div
          className="absolute bg-black/50 backdrop-blur-sm border-4 border-white/50 rounded-lg p-3 text-white z-40 pointer-events-none"
          style={{
            /* Position relative to the canvas — sits above the avatar area */
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 'min(90%, 720px)',
            maxWidth: `${CANVAS_W}px`,
            marginTop: '-220px', /* push up to be above the character on the street */
          }}
        >
          <h3 className="text-red-500 font-bold text-lg">Dosc</h3>
          <span className="font-light">{dialogText}</span>
        </div>
      )}
    </div>
  );
}
