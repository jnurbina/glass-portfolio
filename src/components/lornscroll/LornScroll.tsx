'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sprite, Avatar } from './SpriteEngine';

// Sprites served from public/, audio from Vercel Blob (too large for git)
const ASSET_BASE = '/lornscroll';
const BLOB_BASE = 'https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/lornscroll';

const ASSET_SOURCES = {
  backgroundSkyline: `${ASSET_BASE}/environment/skyline-a.png`,
  backgroundBuildingsFar: `${ASSET_BASE}/environment/buildings-bg.png`,
  backgroundBuildingsNear: `${ASSET_BASE}/environment/near-buildings-bg.png`,
  foregroundTexture: `${ASSET_BASE}/environment/bg3.png`,
  avatarIdle: `${ASSET_BASE}/merchant/idle.png`,
  avatarWalk: `${ASSET_BASE}/merchant/walk.png`,
  walkAudio: `${BLOB_BASE}/audio/walking.wav`,
  jumpAudio: `${BLOB_BASE}/audio/jump.wav`,
  bgMusic: `${BLOB_BASE}/audio/bgmusic.wav`,
} as const;

type AssetKey = keyof typeof ASSET_SOURCES;
type LoadedAssets = Record<AssetKey, HTMLImageElement | HTMLAudioElement>;

const CANVAS_W = 800;
const CANVAS_H = 600;

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
        // Store assets on the container element for the game loop to access
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

    const bgMusic = assets.bgMusic as HTMLAudioElement;
    const walkSound = assets.walkAudio as HTMLAudioElement;
    const jumpSound = assets.jumpAudio as HTMLAudioElement;
    walkSound.volume = 0.7;
    jumpSound.volume = 0.65;
    bgMusic.volume = 0.25;
    bgMusic.loop = true;
    walkSound.loop = true;

    // Attempt to play — may be blocked by autoplay policy
    bgMusic.play().catch(() => {});

    const avatar = new Avatar({
      context: ctx,
      image: assets.avatarIdle as HTMLImageElement,
      position: { x: 0, y: 100 },
      velocity: { x: 0, y: 0 },
      framesMax: 4,
      scale: 3,
      offset: { x: 28, y: 80 },
      sprites: {
        idle: { img: assets.avatarIdle as HTMLImageElement, framesMax: 4 },
        walk: { img: assets.avatarWalk as HTMLImageElement, framesMax: 5 },
      },
    });

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

      // NOTE: hitbox debug squares removed

      avatar.update();
      avatar.velocity.x = 0;
      avatar.switchSprite('idle');

      if (keysRef.current[' ']) {
        if (avatar.position.y + avatar.height + 16 < CANVAS_H) return;
        avatar.switchSprite('idle');
        avatar.velocity.y = -16;
        if (!jumpSound.paused) {
          jumpSound.pause();
          jumpSound.currentTime = 0;
        }
        jumpSound.play().catch(() => {});
      }
      if (keysRef.current['ArrowDown'] || keysRef.current['s']) {
        if (avatar.position.y + avatar.height < CANVAS_H - avatar.height) {
          avatar.velocity.y += 1.4;
        }
      }
      if (
        keysRef.current['ArrowLeft'] ||
        keysRef.current['a']
      ) {
        avatar.direction = 'left';
        avatar.switchSprite('walk');
        avatar.velocity.x -= 3;
        walkSound.play().catch(() => {});
      } else if (
        keysRef.current['ArrowRight'] ||
        keysRef.current['d']
      ) {
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
      // Escape closes the game
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Game keys — stop propagation to prevent portfolio from receiving them
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

    // Use capture phase to intercept before other handlers
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

      {/* Game canvas — scales to fit viewport */}
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

      {/* Dialog box */}
      {started && showDialog && (
        <div className="absolute top-4 left-[5%] w-[90%] bg-black/50 backdrop-blur-sm border-4 border-white/50 rounded-lg p-3 text-white z-40 pointer-events-none">
          <h3 className="text-red-500 font-bold text-lg">Dosc</h3>
          <span className="font-light">{dialogText}</span>
        </div>
      )}
    </div>
  );
}
