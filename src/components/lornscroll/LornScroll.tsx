'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Sprite, Avatar } from './SpriteEngine';
import { audioEngine } from '@/lib/audio/audio';

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
const GROUND_Y = 520;
const AVATAR_SPEED = 5;
const DEBUG = true;
const NPC_INTERACT_RANGE = 80;

// Dialog scene data
interface DialogLine {
  speaker: string;
  text: string;
  color: string;
}

const NPC1_DIALOG: DialogLine[] = [
  { speaker: 'Dosc', text: 'Sup', color: '#ff4444' },
  { speaker: 'ToasterBot', text: "Sup i already know you're testing if i reply, so yup here i am", color: '#ffaa00' },
  { speaker: 'Dosc', text: '...fair enough', color: '#ff4444' },
];

const NOTHING_DIALOG: DialogLine[] = [
  { speaker: 'Dosc', text: "Nothing's here...", color: '#ff4444' },
];

interface LornScrollProps {
  onClose: () => void;
}

export default function LornScroll({ onClose }: LornScrollProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keysRef = useRef<Record<string, boolean>>({});
  const keyJustPressedRef = useRef<Record<string, boolean>>({});
  const animFrameRef = useRef<number>(0);

  const [loading, setLoading] = useState(true);
  const [loadingPct, setLoadingPct] = useState(0);
  const [loadingText, setLoadingText] = useState('Loading...');
  const [started, setStarted] = useState(false);

  // Dialog state — managed in game loop via refs for performance
  const dialogStateRef = useRef({
    active: false,
    lines: [] as DialogLine[],
    lineIndex: 0,
    charIndex: 0,
    charTimer: 0,
    charSpeed: 30, // ms per character
    waitingForAdvance: false,
    dismissTimer: 0,
  });

  // Input lock during dialog
  const inputLockedRef = useRef(false);

  useEffect(() => {
    audioEngine.suspend();
    return () => { audioEngine.resume(); };
  }, []);

  // Load assets
  useEffect(() => {
    const entries = Object.entries(ASSET_SOURCES);
    const total = entries.length;
    let loaded = 0;
    const assets: Partial<LoadedAssets> = {};
    const promises = entries.map(([key, src]) =>
      new Promise<void>((resolve, reject) => {
        if (src.endsWith('.wav')) {
          const audio = new Audio();
          audio.oncanplaythrough = () => { assets[key as AssetKey] = audio; loaded++; setLoadingPct((loaded / total) * 100); resolve(); };
          audio.onerror = () => reject(new Error(`Failed: ${src}`));
          audio.src = src;
        } else {
          const img = new window.Image();
          img.onload = () => { assets[key as AssetKey] = img; loaded++; setLoadingPct((loaded / total) * 100); resolve(); };
          img.onerror = () => reject(new Error(`Failed: ${src}`));
          img.src = src;
        }
      })
    );
    Promise.all(promises).then(() => {
      setLoadingText('Click to Begin');
      setLoading(false);
      if (containerRef.current) (containerRef.current as any).__assets = assets;
    }).catch((err) => { console.error('Asset load error:', err); setLoadingText('Load failed'); });
  }, []);

  const handleStart = useCallback(() => { if (!loading) setStarted(true); }, [loading]);

  // === GAME LOOP ===
  useEffect(() => {
    if (!started || !canvasRef.current || !containerRef.current) return;
    const assets = (containerRef.current as any).__assets as LoadedAssets;
    if (!assets) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = CANVAS_W;
    canvas.height = CANVAS_H;

    // Backgrounds
    const bgSkyline = new Sprite({ context: ctx, image: assets.backgroundSkyline as HTMLImageElement, position: { x: 0, y: -135 }, scale: 3, noRepeat: false });
    const bgFar = new Sprite({ context: ctx, image: assets.backgroundBuildingsFar as HTMLImageElement, position: { x: 0, y: 65 }, scale: 4, noRepeat: false });
    const bgNear = new Sprite({ context: ctx, image: assets.backgroundBuildingsNear as HTMLImageElement, position: { x: 0, y: -250 }, scale: 4, noRepeat: false });
    const fgTexture = new Sprite({ context: ctx, image: assets.foregroundTexture as HTMLImageElement, position: { x: 0, y: -300 }, scale: 5, noRepeat: false });

    // Audio
    const bgMusic = assets.bgMusic as HTMLAudioElement;
    const walkSound = assets.walkAudio as HTMLAudioElement;
    const jumpSound = assets.jumpAudio as HTMLAudioElement;
    walkSound.volume = 0.3; jumpSound.volume = 0.35; bgMusic.volume = 0.08;
    bgMusic.loop = true; walkSound.loop = true;
    bgMusic.play().catch(() => {});

    // Player
    const avatar = new Avatar({
      context: ctx, image: assets.avatarIdle as HTMLImageElement,
      position: { x: 100, y: GROUND_Y - 64 * 3 + 80 },
      velocity: { x: 0, y: 0 }, framesMax: 4, scale: 3,
      offset: { x: 28, y: 80 },
      sprites: {
        idle: { img: assets.avatarIdle as HTMLImageElement, framesMax: 4 },
        walk: { img: assets.avatarWalk as HTMLImageElement, framesMax: 5 },
      },
    });

    // NPCs
    const npc1 = new Sprite({ context: ctx, image: assets.npc1Run as HTMLImageElement, position: { x: 0, y: GROUND_Y - 22 * 3 + 17 }, scale: 3, framesMax: 8 });
    npc1.framesHold = 4;
    const npc2 = new Sprite({ context: ctx, image: assets.npc1Run as HTMLImageElement, position: { x: 0, y: GROUND_Y - 22 * 3 + 17 }, scale: 3, framesMax: 8 });
    npc2.framesHold = 4;

    let npc1WorldX = 600, npc2WorldX = 1200;
    let npc1Dir = 1, npc2Dir = -1;
    const NPC_SPEED = 0.8;
    let cameraWorldX = 0;
    let lastTime = performance.now();

    // FTU dialog
    let ftuShown = false;
    let ftuTimer = 0;

    const backgrounds = [bgSkyline, bgFar, bgNear, fgTexture];
    const speeds = [0.15, 0.35, 0.65, 1.0];

    // Helper: start a dialog scene
    const startDialog = (lines: DialogLine[]) => {
      const ds = dialogStateRef.current;
      ds.active = true;
      ds.lines = lines;
      ds.lineIndex = 0;
      ds.charIndex = 0;
      ds.charTimer = 0;
      ds.waitingForAdvance = false;
      ds.dismissTimer = 0;
      inputLockedRef.current = true;
    };

    // Helper: get avatar world X
    const getAvatarWorldX = () => avatar.position.x + cameraWorldX;

    const animate = (now: number) => {
      animFrameRef.current = requestAnimationFrame(animate);
      const dt = Math.min(now - lastTime, 33); // cap at ~30fps worth of delta
      lastTime = now;

      const ds = dialogStateRef.current;
      const keys = keysRef.current;
      const justPressed = keyJustPressedRef.current;

      // === 1. INPUT ===
      avatar.velocity.x = 0;
      let isMoving = false;

      if (!inputLockedRef.current) {
        // Movement
        if (keys['ArrowLeft'] || keys['a']) {
          avatar.direction = 'left';
          avatar.velocity.x = -AVATAR_SPEED;
          isMoving = true;
        } else if (keys['ArrowRight'] || keys['d']) {
          avatar.direction = 'right';
          avatar.velocity.x = AVATAR_SPEED;
          isMoving = true;
        }

        // Jump
        if (keys[' '] || keys['ArrowUp'] || keys['w']) {
          const groundCheck = CANVAS_H - 80;
          if (avatar.position.y + avatar.height >= groundCheck) {
            avatar.velocity.y = -16;
            if (!jumpSound.paused) { jumpSound.pause(); jumpSound.currentTime = 0; }
            jumpSound.play().catch(() => {});
          }
        }

        // Fast fall
        if (keys['ArrowDown'] || keys['s']) {
          if (avatar.position.y + avatar.height < CANVAS_H - avatar.height) {
            avatar.velocity.y += 1.4;
          }
        }

        // CHECK button (Enter)
        if (justPressed['Enter']) {
          justPressed['Enter'] = false;
          // Check proximity to NPC1
          const avatarWX = getAvatarWorldX();
          if (Math.abs(avatarWX - npc1WorldX) < NPC_INTERACT_RANGE) {
            startDialog(NPC1_DIALOG);
          } else {
            startDialog(NOTHING_DIALOG);
          }
        }

        // Set sprite
        if (isMoving) {
          avatar.switchSprite('walk');
          walkSound.play().catch(() => {});
        } else {
          avatar.switchSprite('idle');
          walkSound.pause(); walkSound.currentTime = 0;
        }
      } else {
        // During dialog, Enter advances
        avatar.switchSprite('idle');
        walkSound.pause(); walkSound.currentTime = 0;
      }

      // === 2. DIALOG UPDATE ===
      if (ds.active) {
        const line = ds.lines[ds.lineIndex];
        if (!ds.waitingForAdvance) {
          ds.charTimer += dt;
          // Button mashing Enter speeds up text
          const speed = keys['Enter'] ? ds.charSpeed * 0.3 : ds.charSpeed;
          while (ds.charTimer >= speed && ds.charIndex < line.text.length) {
            ds.charIndex++;
            ds.charTimer -= speed;
          }
          if (ds.charIndex >= line.text.length) {
            ds.waitingForAdvance = true;
            ds.dismissTimer = 0;
          }
        } else {
          // Waiting for Enter to advance
          if (justPressed['Enter']) {
            justPressed['Enter'] = false;
            ds.lineIndex++;
            if (ds.lineIndex >= ds.lines.length) {
              // Dialog complete
              ds.active = false;
              inputLockedRef.current = false;
            } else {
              ds.charIndex = 0;
              ds.charTimer = 0;
              ds.waitingForAdvance = false;
            }
          }
        }
      }

      // FTU dialog
      if (!ftuShown) {
        ftuTimer += dt;
        if (ftuTimer > 1000) {
          ftuShown = true;
          startDialog([{ speaker: 'Dosc', text: 'It was a zipadeedoodah kind of day...', color: '#ff4444' }]);
        }
      }

      // === 3. PHYSICS / WORLD ===
      const atEdge = avatar.position.x <= 32 || avatar.position.x >= CANVAS_W - 160;
      const scrollAmount = atEdge ? avatar.velocity.x : 0;

      backgrounds.forEach((bg, i) => {
        bg.position.x -= scrollAmount * speeds[i];
        const frameW = (bg.width / bg.framesMax) * bg.scale;
        const repeatX = Math.ceil(CANVAS_W / frameW);
        const totalW = frameW * repeatX;
        if (bg.position.x < -totalW) bg.position.x += totalW;
      });

      cameraWorldX += scrollAmount * speeds[3];

      avatar.position.x = Math.max(32, Math.min(avatar.position.x, CANVAS_W - 160));

      // NPC patrol
      npc1WorldX += NPC_SPEED * npc1Dir;
      if (npc1WorldX >= 720) npc1Dir = -1;
      else if (npc1WorldX <= 480) npc1Dir = 1;

      npc2WorldX += NPC_SPEED * npc2Dir;
      if (npc2WorldX >= 1350) npc2Dir = -1;
      else if (npc2WorldX <= 1050) npc2Dir = 1;

      // World-to-screen
      npc1.position.x = npc1WorldX - cameraWorldX;
      npc2.position.x = npc2WorldX - cameraWorldX;
      // Don't flip NPCs — avoids teleport on asymmetric sprites
      // npc1.direction = npc1Dir > 0 ? 'right' : 'left';
      // npc2.direction = npc2Dir > 0 ? 'right' : 'left';

      // === 4. RENDER ===
      ctx.fillStyle = 'rgba(0, 0, 0, 1)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      bgSkyline.update(); bgFar.update(); bgNear.update(); fgTexture.update();

      ctx.fillStyle = 'rgba(255, 255, 255, .10)';
      ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

      // Draw NPCs
      if (npc1.position.x > -100 && npc1.position.x < CANVAS_W + 100) npc1.update();
      if (npc2.position.x > -100 && npc2.position.x < CANVAS_W + 100) npc2.update();

      // Draw avatar
      avatar.update();

      // === 5. DIALOG RENDER ===
      if (ds.active) {
        const line = ds.lines[ds.lineIndex];
        const boxW = 600, boxH = 90;
        const boxX = (CANVAS_W - boxW) / 2;
        const boxY = 30;

        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(boxX, boxY, boxW, boxH, 8);
        ctx.fill(); ctx.stroke();

        // Speaker name
        ctx.font = 'bold 16px monospace';
        ctx.fillStyle = line.color;
        ctx.fillText(line.speaker, boxX + 16, boxY + 28);

        // Text
        ctx.font = '14px monospace';
        ctx.fillStyle = '#ffffff';
        const displayText = line.text.substring(0, ds.charIndex);
        // Word wrap
        const maxLineW = boxW - 32;
        const words = displayText.split(' ');
        let textLine = '';
        let ty = boxY + 52;
        for (const word of words) {
          const test = textLine + (textLine ? ' ' : '') + word;
          if (ctx.measureText(test).width > maxLineW) {
            ctx.fillText(textLine, boxX + 16, ty);
            textLine = word;
            ty += 18;
          } else {
            textLine = test;
          }
        }
        ctx.fillText(textLine, boxX + 16, ty);

        // Advance indicator
        if (ds.waitingForAdvance) {
          ctx.fillStyle = 'rgba(255,255,255,0.6)';
          ctx.font = '12px monospace';
          ctx.fillText('▼ ENTER', boxX + boxW - 90, boxY + boxH - 12);
        }
        ctx.restore();
      }

      // === 6. CONTROLS HUD ===
      ctx.save();
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(CANVAS_W - 170, CANVAS_H - 75, 160, 65);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#888';
      ctx.fillText('WASD / Arrows  Move', CANVAS_W - 162, CANVAS_H - 58);
      ctx.fillText('SPACE          Jump', CANVAS_W - 162, CANVAS_H - 44);
      ctx.fillText('ENTER          Check', CANVAS_W - 162, CANVAS_H - 30);
      ctx.fillText('ESC            Exit', CANVAS_W - 162, CANVAS_H - 16);
      ctx.restore();

      // === 7. DEBUG HUD ===
      if (DEBUG) {
        const avatarWX = getAvatarWorldX();
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(0, 0, 310, 110);
        ctx.font = '11px monospace';
        ctx.fillStyle = '#0f0';
        ctx.fillText(`avatar scr: (${avatar.position.x.toFixed(0)}, ${avatar.position.y.toFixed(0)})  world: ${avatarWX.toFixed(0)}  vel: ${avatar.velocity.x.toFixed(1)}`, 8, 16);
        ctx.fillText(`camera: ${cameraWorldX.toFixed(1)}  scrolling: ${atEdge && avatar.velocity.x !== 0 ? 'YES' : 'no'}`, 8, 32);
        ctx.fillStyle = '#ff0';
        ctx.fillText(`npc1 W:${npc1WorldX.toFixed(0)} S:${npc1.position.x.toFixed(0)} dist:${Math.abs(avatarWX - npc1WorldX).toFixed(0)}`, 8, 52);
        ctx.fillText(`npc2 W:${npc2WorldX.toFixed(0)} S:${npc2.position.x.toFixed(0)}`, 8, 68);
        ctx.fillStyle = '#0ff';
        ctx.fillText(`fg.x: ${fgTexture.position.x.toFixed(1)}  speeds: [${speeds.join(',')}]`, 8, 88);
        ctx.fillText(`dialog: ${ds.active ? `line ${ds.lineIndex}/${ds.lines.length}` : 'off'}  inputLock: ${inputLockedRef.current}`, 8, 104);
        ctx.restore();
      }

      // Clear justPressed
      for (const k in justPressed) justPressed[k] = false;
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      bgMusic.pause(); bgMusic.currentTime = 0; walkSound.pause();
    };
  }, [started]);

  // Keyboard — isolated
  useEffect(() => {
    if (!started) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', ' ', 'Enter'];
      if (gameKeys.includes(e.key)) {
        e.preventDefault(); e.stopPropagation();
        if (!keysRef.current[e.key]) {
          keyJustPressedRef.current[e.key] = true;
        }
        keysRef.current[e.key] = true;
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      window.removeEventListener('keyup', handleKeyUp, true);
    };
  }, [started, onClose]);

  return (
    <div ref={containerRef} className="fixed inset-0 z-50 bg-black flex items-center justify-center" style={{ touchAction: 'none' }}>
      <button onClick={onClose} className="absolute top-4 right-4 z-50 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-full w-10 h-10 flex items-center justify-center text-xl font-bold transition-colors" title="Exit (Esc)">✕</button>
      {!started && (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-40 cursor-pointer" onClick={handleStart}>
          <h1 className="text-white text-2xl font-bold mb-4 font-mono">{loadingText}</h1>
          <div className="w-1/2 h-8 border-4 border-white/90 rounded-lg overflow-hidden">
            <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${loadingPct}%` }} />
          </div>
        </div>
      )}
      <canvas ref={canvasRef} className={`${started ? 'block' : 'hidden'}`} style={{ width: '100%', maxWidth: `${CANVAS_W}px`, height: 'auto', maxHeight: '100vh', aspectRatio: `${CANVAS_W}/${CANVAS_H}`, imageRendering: 'pixelated' }} />
    </div>
  );
}
