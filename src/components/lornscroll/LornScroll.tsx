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
  karlIdle: `${ASSET_BASE}/karl/idle.png`,
  karlWalk: `${ASSET_BASE}/karl/walk.png`,
  jathanIdle: `${ASSET_BASE}/jathan/idle.png`,
  jathanWalk: `${ASSET_BASE}/jathan/walk.png`,
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
const DEBUG_GRID = false;
const NPC_PATROL = true;
const NPC_INTERACT_RANGE = 80;

interface DialogLine { speaker: string; text: string; color: string; }
const NPC1_DIALOG: DialogLine[] = [
  { speaker: 'Dosc', text: 'Sup', color: '#ff4444' },
  { speaker: 'ToasterBot', text: "Sup i already know you're testing if i reply, so yup here i am", color: '#ffaa00' },
  { speaker: 'Dosc', text: '...fair enough', color: '#ff4444' },
];
const KARL_DIALOG: DialogLine[] = [
  { speaker: 'Dosc', text: 'You good bro?', color: '#ff4444' },
  { speaker: 'Karl', text: '*tumbles aggressively*', color: '#66ccff' },
  { speaker: 'Dosc', text: 'I\'ll take that as a yes', color: '#ff4444' },
];
const JATHAN_DIALOG: DialogLine[] = [
  { speaker: 'Dosc', text: 'Sick poi', color: '#ff4444' },
  { speaker: 'Jathan Names', text: 'Thanks, I\'ve been practicing since before time was invented', color: '#ff8844' },
  { speaker: 'Dosc', text: '...what', color: '#ff4444' },
];
const NOTHING_DIALOG: DialogLine[] = [{ speaker: 'Dosc', text: "Nothing's here...", color: '#ff4444' }];

// Debug component with NPC selector, X/Y nudge, scale, and patrol controls
interface NpcDebugRef {
  sprite: Sprite | null;
  worldX: number;
  dir: number;
  yOffset: number;
  scaleOverride: number | null;
  label: string;
}

const DebugControls = ({ npcsRef, setDebugLog, debugLog, patrolRef }: {
  npcsRef: React.MutableRefObject<Record<string, NpcDebugRef>>;
  setDebugLog: React.Dispatch<React.SetStateAction<string[]>>;
  debugLog: string[];
  patrolRef: React.MutableRefObject<boolean>;
}) => {
  const npcKeys = Object.keys(npcsRef.current);
  const [selected, setSelected] = useState(npcKeys[0] || '');
  const [nudgeX, setNudgeX] = useState(0);
  const [nudgeY, setNudgeY] = useState(0);
  const [scaleAdj, setScaleAdj] = useState(0);
  const [patrolOn, setPatrolOn] = useState(NPC_PATROL);

  const npc = npcsRef.current[selected];

  const handleSelect = (key: string) => {
    setSelected(key);
    setNudgeX(0);
    setNudgeY(0);
    setScaleAdj(0);
  };

  const handleNudgeX = (val: number) => {
    if (!npc) return;
    setNudgeX(n => n + val);
    npc.worldX += val;
  };
  const handleNudgeY = (val: number) => {
    if (!npc) return;
    setNudgeY(n => n + val);
    npc.yOffset += val;
    if (npc.sprite) npc.sprite.position.y += val;
  };
  const handleScale = (val: number) => {
    if (!npc || !npc.sprite) return;
    setScaleAdj(n => +(n + val).toFixed(2));
    const newScale = +(npc.sprite.scale + val).toFixed(4);
    npc.sprite.scale = newScale;
    npc.scaleOverride = newScale;
  };
  const handleFlip = () => { if (npc) npc.dir *= -1; };
  const handleLog = () => {
    if (!npc?.sprite) return;
    const s = npc.sprite;
    const log = `[${npc.label}] dir:${npc.dir > 0 ? 'R' : 'L'} scale:${s.scale.toFixed(3)} yOff:${npc.yOffset} nudgeX:${nudgeX} nudgeY:${nudgeY} worldX:${npc.worldX.toFixed(0)} posY:${s.position.y.toFixed(0)}`;
    setDebugLog((prev) => [log, ...prev.slice(0, 6)]);
  };
  const handleTogglePatrol = () => {
    const next = !patrolOn;
    setPatrolOn(next);
    patrolRef.current = next;
  };
  const handleReset = () => {
    if (!npc) return;
    npc.worldX = 600; npc.dir = 1; npc.yOffset = 0; npc.scaleOverride = null;
    setNudgeX(0); setNudgeY(0); setScaleAdj(0);
  };

  return (
    <div className="absolute bottom-4 left-4 z-50 p-2 bg-gray-900/90 text-white rounded font-mono text-xs flex flex-col gap-1.5 min-w-[240px]">
      <div className="font-bold text-cyan-400">NPC Debug</div>
      <select value={selected} onChange={e => handleSelect(e.target.value)} className="bg-gray-800 text-white px-1 py-0.5 rounded text-xs">
        {npcKeys.map(k => <option key={k} value={k}>{npcsRef.current[k].label}</option>)}
      </select>
      <div className="text-gray-400">X:{nudgeX} Y:{nudgeY} Scale:{scaleAdj >= 0 ? '+' : ''}{scaleAdj}</div>
      <div className="text-yellow-300 text-[10px]">X Nudge</div>
      <div className="flex gap-1">
        <button onClick={() => handleNudgeX(-10)} className="bg-red-700 px-2 py-0.5 rounded">-10</button>
        <button onClick={() => handleNudgeX(-1)} className="bg-red-600 px-2 py-0.5 rounded">-1</button>
        <button onClick={() => handleNudgeX(1)} className="bg-green-600 px-2 py-0.5 rounded">+1</button>
        <button onClick={() => handleNudgeX(10)} className="bg-green-700 px-2 py-0.5 rounded">+10</button>
      </div>
      <div className="text-yellow-300 text-[10px]">Y Nudge</div>
      <div className="flex gap-1">
        <button onClick={() => handleNudgeY(-10)} className="bg-red-700 px-2 py-0.5 rounded">-10</button>
        <button onClick={() => handleNudgeY(-1)} className="bg-red-600 px-2 py-0.5 rounded">-1</button>
        <button onClick={() => handleNudgeY(1)} className="bg-green-600 px-2 py-0.5 rounded">+1</button>
        <button onClick={() => handleNudgeY(10)} className="bg-green-700 px-2 py-0.5 rounded">+10</button>
      </div>
      <div className="text-yellow-300 text-[10px]">Scale</div>
      <div className="flex gap-1">
        <button onClick={() => handleScale(-0.05)} className="bg-red-700 px-2 py-0.5 rounded">-.05</button>
        <button onClick={() => handleScale(-0.01)} className="bg-red-600 px-2 py-0.5 rounded">-.01</button>
        <button onClick={() => handleScale(0.01)} className="bg-green-600 px-2 py-0.5 rounded">+.01</button>
        <button onClick={() => handleScale(0.05)} className="bg-green-700 px-2 py-0.5 rounded">+.05</button>
      </div>
      <div className="flex gap-1">
        <button onClick={handleFlip} className="bg-blue-600 px-2 py-0.5 rounded flex-1">Flip</button>
        <button onClick={handleLog} className="bg-purple-600 px-2 py-0.5 rounded flex-1">Log</button>
        <button onClick={handleReset} className="bg-yellow-700 px-2 py-0.5 rounded flex-1">Reset</button>
      </div>
      <div className="flex gap-1">
        <button onClick={handleTogglePatrol} className={`${patrolOn ? 'bg-green-600' : 'bg-gray-600'} px-2 py-0.5 rounded flex-1`}>{patrolOn ? 'Patrol ON' : 'Patrol OFF'}</button>
      </div>
      <textarea readOnly value={debugLog.join('\n')} className="bg-black/50 h-20 w-full text-[10px] rounded" />
    </div>
  );
};


interface LornScrollProps { onClose: () => void; }
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
  const [debugLog, setDebugLog] = useState<string[]>([]);
  const npc1Ref = useRef<{ sprite: Sprite | null; worldX: number; dir: number }>({ sprite: null, worldX: 600, dir: 1 });
  const npcsRef = useRef<Record<string, NpcDebugRef>>({});
  const patrolRef = useRef(NPC_PATROL);

  const dialogStateRef = useRef({ active: false, lines: [] as DialogLine[], lineIndex: 0, charIndex: 0, charTimer: 0, charSpeed: 30, waitingForAdvance: false, dismissTimer: 0 });
  const inputLockedRef = useRef(false);

  useEffect(() => { audioEngine.suspend(); return () => { audioEngine.resume(); }; }, []);
  useEffect(() => {
    const entries = Object.entries(ASSET_SOURCES);
    const total = entries.length;
    let loaded = 0;
    const assets: Partial<LoadedAssets> = {};
    const promises = entries.map(([key, src]) =>
      new Promise<void>((resolve, reject) => {
        if (src.endsWith('.wav')) {
          const audio = new Audio();
          audio.oncanplaythrough = () => { assets[key as AssetKey] = audio; loaded++; setLoadingPct((l) => (loaded / total) * 100); resolve(); };
          audio.onerror = () => reject(new Error(`Failed: ${src}`));
          audio.src = src;
        } else {
          const img = new window.Image();
          img.onload = () => { assets[key as AssetKey] = img; loaded++; setLoadingPct((l) => (loaded / total) * 100); resolve(); };
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

  useEffect(() => {
    if (!started || !canvasRef.current || !containerRef.current) return;
    const assets = (containerRef.current as any).__assets as LoadedAssets;
    if (!assets) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d')!;
    canvas.width = CANVAS_W; canvas.height = CANVAS_H;

    const bgSkyline = new Sprite({ context: ctx, image: assets.backgroundSkyline as HTMLImageElement, position: { x: 0, y: -135 }, scale: 3, noRepeat: false });
    const bgFar = new Sprite({ context: ctx, image: assets.backgroundBuildingsFar as HTMLImageElement, position: { x: 0, y: 65 }, scale: 4, noRepeat: false });
    const bgNear = new Sprite({ context: ctx, image: assets.backgroundBuildingsNear as HTMLImageElement, position: { x: 0, y: -250 }, scale: 4, noRepeat: false });
    const fgTexture = new Sprite({ context: ctx, image: assets.foregroundTexture as HTMLImageElement, position: { x: 0, y: -300 }, scale: 5, noRepeat: false });

    const bgMusic = assets.bgMusic as HTMLAudioElement, walkSound = assets.walkAudio as HTMLAudioElement, jumpSound = assets.jumpAudio as HTMLAudioElement;
    walkSound.volume = 0.3; jumpSound.volume = 0.35; bgMusic.volume = 0.08;
    bgMusic.loop = true; walkSound.loop = true;
    bgMusic.play().catch(() => {});

    const avatar = new Avatar({
      context: ctx, image: assets.avatarIdle as HTMLImageElement,
      position: { x: 0, y: 0 }, velocity: { x: 0, y: 0 },
      framesMax: 4, scale: 3, offset: { x: 28, y: 80 },
      sprites: { idle: { img: assets.avatarIdle as HTMLImageElement, framesMax: 4 }, walk: { img: assets.avatarWalk as HTMLImageElement, framesMax: 5 } },
    });

    const TOASTER_FLIP_OFFSET = 68; // final calibration: 71 - (8 nudge / 3 scale) ≈ 68
    const npc1 = new Sprite({ context: ctx, image: assets.npc1Run as HTMLImageElement, position: { x: 0, y: GROUND_Y - 22 * 3 + 17 }, scale: 3, framesMax: 8, flipOffsetX: TOASTER_FLIP_OFFSET });
    npc1.framesHold = 4;
    const npc2 = new Sprite({ context: ctx, image: assets.npc1Run as HTMLImageElement, position: { x: 0, y: GROUND_Y - 22 * 3 + 17 }, scale: 3, framesMax: 8, flipOffsetX: TOASTER_FLIP_OFFSET });
    npc2.framesHold = 4;
    npc1Ref.current.sprite = npc1;

    // Karl — tumbling walk + idle (both normalized to 597x585 per frame)
    const KARL_SCALE = 0.130;
    const karlFrameH = 585;
    const karlBaseY = GROUND_Y - karlFrameH * KARL_SCALE + 17 + 44;
    const karlSprite = new Sprite({ context: ctx, image: assets.karlIdle as HTMLImageElement, position: { x: 0, y: karlBaseY }, scale: KARL_SCALE, framesMax: 5 });
    karlSprite.framesHold = 10;
    let karlWorldX = 900, karlDir = -1;
    const karlSprites = {
      idle: { img: assets.karlIdle as HTMLImageElement, framesMax: 5, baseY: karlBaseY },
      walk: { img: assets.karlWalk as HTMLImageElement, framesMax: 9, baseY: karlBaseY },
    };
    let karlState: 'patrol' | 'idle' | 'turning' = 'patrol';
    let karlStateTimer = 0;
    let karlIdleDuration = 2000 + Math.random() * 3000;
    let karlPatrolDuration = 3000 + Math.random() * 4000;

    // Jathan Names — fire poi walk + idle
    const JATHAN_SCALE = 0.130;
    const jathanFrameH = 648; // walk is 648, idle is 647 — close enough
    const jathanBaseY = GROUND_Y - jathanFrameH * JATHAN_SCALE + 17 + 45;
    const jathanSprite = new Sprite({ context: ctx, image: assets.jathanIdle as HTMLImageElement, position: { x: 0, y: jathanBaseY }, scale: JATHAN_SCALE, framesMax: 5 });
    jathanSprite.framesHold = 12;
    let jathanWorldX = 1600, jathanDir = 1;
    const jathanSprites = {
      idle: { img: assets.jathanIdle as HTMLImageElement, framesMax: 5, baseY: jathanBaseY },
      walk: { img: assets.jathanWalk as HTMLImageElement, framesMax: 9, baseY: jathanBaseY },
    };
    let jathanState: 'patrol' | 'idle' | 'turning' = 'idle';
    let jathanStateTimer = 0;
    let jathanIdleDuration = 3000 + Math.random() * 2000;
    let jathanPatrolDuration = 4000 + Math.random() * 3000;

    let avatarWorldX = CANVAS_W / 2;
    let cameraX = 0;
    let lastTime = performance.now();
    let ftuShown = false, ftuTimer = 0;
    let npc2WorldX = 1200, npc2Dir = -1;

    // Register NPCs for debug panel
    npcsRef.current = {
      toasterbot1: { sprite: npc1, worldX: npc1Ref.current.worldX, dir: npc1Ref.current.dir, yOffset: 0, scaleOverride: null, label: 'ToasterBot 1' },
      toasterbot2: { sprite: npc2, worldX: npc2WorldX, dir: npc2Dir, yOffset: 0, scaleOverride: null, label: 'ToasterBot 2' },
      karl: { sprite: karlSprite, worldX: karlWorldX, dir: karlDir, yOffset: 0, scaleOverride: null, label: 'Karl' },
      jathan: { sprite: jathanSprite, worldX: jathanWorldX, dir: jathanDir, yOffset: 0, scaleOverride: null, label: 'Jathan Names' },
    };

    const backgrounds = [bgSkyline, bgFar, bgNear, fgTexture];
    const visualSpeeds = [0.15, 0.4, 0.7, 1.0];
    const bgScales = [3, 4, 4, 5];
    const speeds = visualSpeeds.map((s, i) => s / bgScales[i]);

    const startDialog = (lines: DialogLine[]) => {
      const ds = dialogStateRef.current;
      ds.active = true; ds.lines = lines; ds.lineIndex = 0; ds.charIndex = 0;
      ds.charTimer = 0; ds.waitingForAdvance = false; ds.dismissTimer = 0;
      inputLockedRef.current = true;
    };

    const animate = (now: number) => {
      animFrameRef.current = requestAnimationFrame(animate);
      const dt = Math.min(now - lastTime, 33);
      lastTime = now;
      const ds = dialogStateRef.current;
      const keys = keysRef.current;
      const justPressed = keyJustPressedRef.current;

      let isMoving = false;
      if (!inputLockedRef.current) {
        if (keys['ArrowLeft'] || keys['a']) { avatar.direction = 'left'; avatarWorldX -= AVATAR_SPEED; isMoving = true; }
        else if (keys['ArrowRight'] || keys['d']) { avatar.direction = 'right'; avatarWorldX += AVATAR_SPEED; isMoving = true; }
        avatarWorldX = Math.max(0, avatarWorldX);

        if (keys[' '] || keys['ArrowUp'] || keys['w']) {
          const groundCheck = CANVAS_H - 80;
          if (avatar.position.y + avatar.height >= groundCheck) {
            avatar.velocity.y = -8; // 50% lower jump
            if (!jumpSound.paused) { jumpSound.pause(); jumpSound.currentTime = 0; }
            jumpSound.play().catch(() => {});
          }
        }
        if (keys['ArrowDown'] || keys['s']) { if (avatar.position.y + avatar.height < CANVAS_H - avatar.height) avatar.velocity.y += 1.4; }
        if (justPressed['Enter']) {
          justPressed['Enter'] = false;
          const kd = npcsRef.current.karl;
          const jd = npcsRef.current.jathan;
          if (Math.abs(avatarWorldX - npc1Ref.current.worldX) < NPC_INTERACT_RANGE) startDialog(NPC1_DIALOG);
          else if (kd && Math.abs(avatarWorldX - kd.worldX) < NPC_INTERACT_RANGE) startDialog(KARL_DIALOG);
          else if (jd && Math.abs(avatarWorldX - jd.worldX) < NPC_INTERACT_RANGE) startDialog(JATHAN_DIALOG);
          else startDialog(NOTHING_DIALOG);
        }
        if (isMoving) { avatar.switchSprite('walk'); walkSound.play().catch(() => {}); }
        else { avatar.switchSprite('idle'); walkSound.pause(); walkSound.currentTime = 0; }
      } else { avatar.switchSprite('idle'); walkSound.pause(); walkSound.currentTime = 0; }

      if (ds.active) {
        const line = ds.lines[ds.lineIndex];
        if (!ds.waitingForAdvance) {
          ds.charTimer += dt;
          const speed = keys['Enter'] ? ds.charSpeed * 0.3 : ds.charSpeed;
          while (ds.charTimer >= speed && ds.charIndex < line.text.length) { ds.charIndex++; ds.charTimer -= speed; }
          if (ds.charIndex >= line.text.length) ds.waitingForAdvance = true;
        } else if (justPressed['Enter']) {
          justPressed['Enter'] = false; ds.lineIndex++;
          if (ds.lineIndex >= ds.lines.length) { ds.active = false; inputLockedRef.current = false; }
          else { ds.charIndex = 0; ds.charTimer = 0; ds.waitingForAdvance = false; }
        }
      }

      if (!ftuShown) { ftuTimer += dt; if (ftuTimer > 1000) { ftuShown = true; startDialog([{ speaker: 'Dosc', text: 'It was a zipadeedoodah kind of day...', color: '#ff4444' }]); } }

      const targetCameraX = avatarWorldX - CANVAS_W / 3;
      cameraX = Math.max(0, targetCameraX);
      avatar.position.x = avatarWorldX - cameraX;

      backgrounds.forEach((bg, i) => {
        bg.position.x = -(cameraX * speeds[i]);
        const frameW = (bg.width / bg.framesMax) * bg.scale; const repeatX = Math.ceil(CANVAS_W / frameW); const totalW = frameW * repeatX;
        if (totalW > 0) bg.position.x = ((bg.position.x % totalW) + totalW) % totalW - totalW;
      });

      const dbg = npc1Ref.current;
      if (!patrolRef.current && dbg.sprite) { dbg.sprite.direction = dbg.dir > 0 ? 'right' : 'left'; }
      else if (patrolRef.current) {
        dbg.worldX += 0.8 * dbg.dir;
        if (dbg.worldX >= 720) dbg.dir = -1; else if (dbg.worldX <= 480) dbg.dir = 1;
        dbg.sprite!.direction = dbg.dir > 0 ? 'right' : 'left';
      }
      npc2WorldX += 0.8 * npc2Dir;
      if (npc2WorldX >= 1350) npc2Dir = -1; else if (npc2WorldX <= 1050) npc2Dir = 1;

      // --- NPC state machine helper ---
      const switchNpcSprite = (sprite: Sprite, target: { img: HTMLImageElement; framesMax: number; baseY: number }) => {
        if (sprite.image !== target.img) {
          sprite.image = target.img;
          sprite.width = target.img.width;
          sprite.framesMax = target.framesMax;
          sprite.framesCurrent = 0;
          sprite.position.y = target.baseY;
        }
      };

      // Karl behavior
      const karlDbg = npcsRef.current.karl;
      if (karlDbg) {
        if (patrolRef.current) {
          karlStateTimer += dt;
          if (karlState === 'patrol') {
            karlDbg.worldX += 0.6 * karlDbg.dir;
            if (karlDbg.worldX >= 1050) { karlDbg.dir = -1; karlState = 'idle'; karlStateTimer = 0; karlIdleDuration = 1500 + Math.random() * 2000; }
            else if (karlDbg.worldX <= 800) { karlDbg.dir = 1; karlState = 'idle'; karlStateTimer = 0; karlIdleDuration = 1500 + Math.random() * 2000; }
            else if (karlStateTimer >= karlPatrolDuration) { karlState = 'idle'; karlStateTimer = 0; karlIdleDuration = 2000 + Math.random() * 3000; }
            switchNpcSprite(karlSprite, karlSprites.walk);
          } else if (karlState === 'idle') {
            switchNpcSprite(karlSprite, karlSprites.idle);
            if (karlStateTimer >= karlIdleDuration) {
              // Maybe change direction
              if (Math.random() < 0.4) karlDbg.dir *= -1;
              karlState = 'patrol'; karlStateTimer = 0; karlPatrolDuration = 3000 + Math.random() * 4000;
            }
          }
        }
        karlSprite.direction = karlDbg.dir > 0 ? 'right' : 'left';
        karlSprite.position.x = karlDbg.worldX - cameraX;
        if (karlDbg.scaleOverride !== null) karlSprite.scale = karlDbg.scaleOverride;
      }

      // Jathan behavior
      const jathanDbg = npcsRef.current.jathan;
      if (jathanDbg) {
        if (patrolRef.current) {
          jathanStateTimer += dt;
          if (jathanState === 'patrol') {
            jathanDbg.worldX += 0.5 * jathanDbg.dir;
            if (jathanDbg.worldX >= 1800) { jathanDbg.dir = -1; jathanState = 'idle'; jathanStateTimer = 0; jathanIdleDuration = 2000 + Math.random() * 2000; }
            else if (jathanDbg.worldX <= 1500) { jathanDbg.dir = 1; jathanState = 'idle'; jathanStateTimer = 0; jathanIdleDuration = 2000 + Math.random() * 2000; }
            else if (jathanStateTimer >= jathanPatrolDuration) { jathanState = 'idle'; jathanStateTimer = 0; jathanIdleDuration = 3000 + Math.random() * 2000; }
            switchNpcSprite(jathanSprite, jathanSprites.walk);
          } else if (jathanState === 'idle') {
            switchNpcSprite(jathanSprite, jathanSprites.idle);
            if (jathanStateTimer >= jathanIdleDuration) {
              if (Math.random() < 0.4) jathanDbg.dir *= -1;
              jathanState = 'patrol'; jathanStateTimer = 0; jathanPatrolDuration = 4000 + Math.random() * 3000;
            }
          }
        }
        jathanSprite.direction = jathanDbg.dir > 0 ? 'right' : 'left';
        jathanSprite.position.x = jathanDbg.worldX - cameraX;
        if (jathanDbg.scaleOverride !== null) jathanSprite.scale = jathanDbg.scaleOverride;
      }

      npc1.position.x = dbg.worldX - cameraX;
      npc2.position.x = npc2WorldX - cameraX;
      npc2.direction = npc2Dir > 0 ? 'right' : 'left';

      ctx.fillStyle = 'rgba(0,0,0,1)'; ctx.fillRect(0,0,CANVAS_W,CANVAS_H);
      bgSkyline.update(); bgFar.update(); bgNear.update(); fgTexture.update();
      ctx.fillStyle = 'rgba(255,255,255,.1)'; ctx.fillRect(0,0,CANVAS_W,CANVAS_H);
      if (npc1.position.x > -100 && npc1.position.x < CANVAS_W + 100) npc1.update();
      if (npc2.position.x > -100 && npc2.position.x < CANVAS_W + 100) npc2.update();
      if (karlSprite.position.x > -200 && karlSprite.position.x < CANVAS_W + 200) karlSprite.update();
      if (jathanSprite.position.x > -200 && jathanSprite.position.x < CANVAS_W + 200) jathanSprite.update();
      avatar.update();

      if (ds.active) {
        const line = ds.lines[ds.lineIndex], boxW = 600, boxH = 90, boxX = (CANVAS_W-boxW)/2, boxY = 30;
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.7)'; ctx.strokeStyle = 'rgba(255,255,255,0.5)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(boxX,boxY,boxW,boxH,8); ctx.fill(); ctx.stroke();
        ctx.font = 'bold 16px monospace'; ctx.fillStyle = line.color; ctx.fillText(line.speaker, boxX+16, boxY+28);
        ctx.font = '14px monospace'; ctx.fillStyle = '#fff';
        const displayText = line.text.substring(0, ds.charIndex);
        const words = displayText.split(' '), maxLineW = boxW - 32; let textLine = '', ty = boxY + 52;
        for (const word of words) { const test = textLine + (textLine ? ' ' : '') + word; if (ctx.measureText(test).width > maxLineW) { ctx.fillText(textLine, boxX+16, ty); textLine = word; ty += 18; } else { textLine = test; } }
        ctx.fillText(textLine, boxX+16, ty);
        if (ds.waitingForAdvance) { ctx.fillStyle = 'rgba(255,255,255,0.6)'; ctx.font = '12px monospace'; ctx.fillText('▼ ENTER', boxX+boxW-90, boxY+boxH-12); }
        ctx.restore();
      }

      if (DEBUG_GRID) {
        ctx.save();
        const startWorld = Math.floor(cameraX/100)*100, endWorld = cameraX+CANVAS_W+100;
        for (let wx = startWorld; wx <= endWorld; wx += 100) {
          const sx = wx - cameraX, isMajor = wx % 500 === 0;
          ctx.strokeStyle = isMajor ? 'rgba(255,255,0,0.7)' : 'rgba(255,255,255,0.3)'; ctx.lineWidth = isMajor ? 2 : 1;
          ctx.beginPath(); ctx.moveTo(sx, isMajor ? 0 : CANVAS_H - 50); ctx.lineTo(sx, CANVAS_H); ctx.stroke();
          ctx.fillStyle = isMajor ? '#ff0' : '#aaa'; ctx.font = isMajor ? 'bold 12px monospace' : '10px monospace'; ctx.fillText(`${wx}`, sx+3, CANVAS_H - 16);
        }
        const npc1sx = dbg.worldX - cameraX, npc2sx = npc2WorldX - cameraX, avsx = avatarWorldX - cameraX;
        ctx.strokeStyle = '#f00'; ctx.lineWidth = 2; ctx.setLineDash([4,4]); ctx.beginPath(); ctx.moveTo(npc1sx,0); ctx.lineTo(npc1sx,CANVAS_H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(npc2sx,0); ctx.lineTo(npc2sx,CANVAS_H); ctx.stroke();
        ctx.strokeStyle = '#0ff'; ctx.beginPath(); ctx.moveTo(avsx,0); ctx.lineTo(avsx,CANVAS_H); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = '#f00'; ctx.font = 'bold 11px monospace'; ctx.fillText(`NPC1 @${dbg.worldX.toFixed(0)}`, npc1sx+4, 140); ctx.fillText(`NPC2 @${npc2WorldX.toFixed(0)}`, npc2sx+4, 140);
        ctx.fillStyle = '#0ff'; ctx.fillText(`YOU @${avatarWorldX.toFixed(0)}`, avsx+4, 155);

        // Visual center marker — shows where the NPC character visually IS
        // When facing right: char starts ~6px from left of frame, char width ~25px → visual center at ~18px from left
        // Frame = 106px, scale = 3 → visual center screen offset from position.x = 18 * 3 = 54
        // When facing left with flipOffset 89: visual center shifts
        const frameW_src = 106; // source frame width
        const charLeftPad = 6; // px from left edge to char
        const charWidth = 25; // approx char pixel width
        const charCenterSrc = charLeftPad + charWidth / 2; // ~18.5
        const npcScale = 3;
        let visualCenterScreenX: number;
        if (dbg.dir > 0) {
          // Facing right: visual center = npc screen X + charCenter * scale
          visualCenterScreenX = npc1sx + charCenterSrc * npcScale;
        } else {
          // Facing left: flipped, so visual center = npc screen X + (frameW - charCenter - flipOffset adjustment) * scale
          // The flip draws at (dx + drawWidth - flipCompensation) then mirrors
          // Effective: visual center = npc screen X + (frameW_src - charCenterSrc) * npcScale - 89 * npcScale
          visualCenterScreenX = npc1sx + (frameW_src - charCenterSrc) * npcScale - 89 * npcScale;
        }
        ctx.strokeStyle = 'rgba(0,255,0,0.9)'; ctx.lineWidth = 2; ctx.setLineDash([2,2]);
        ctx.beginPath(); ctx.moveTo(visualCenterScreenX, 0); ctx.lineTo(visualCenterScreenX, CANVAS_H); ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillStyle = '#0f0'; ctx.fillText(`VIS CENTER`, visualCenterScreenX + 4, 170);
        ctx.restore();
      }
      if (DEBUG && !DEBUG_GRID) {
        ctx.save(); ctx.fillStyle = 'rgba(0,0,0,0.6)'; ctx.fillRect(0,0,320,110); ctx.font = '11px monospace'; ctx.fillStyle = '#0f0';
        ctx.fillText(`avatar world: ${avatarWorldX.toFixed(0)}  screen: ${avatar.position.x.toFixed(0)}`, 8,16); ctx.fillText(`camera: ${cameraX.toFixed(1)}`, 8,32);
        ctx.fillStyle = '#ff0'; ctx.fillText(`npc1 W:${dbg.worldX.toFixed(0)} S:${npc1.position.x.toFixed(0)} dist:${Math.abs(avatarWorldX-dbg.worldX).toFixed(0)}`, 8,52);
        ctx.fillText(`npc2 W:${npc2WorldX.toFixed(0)} S:${npc2.position.x.toFixed(0)}`, 8,68);
        ctx.fillStyle = '#0ff'; ctx.fillText(`fg.x: ${fgTexture.position.x.toFixed(1)}  parallax: [${speeds.join(',')}]`, 8,88);
        ctx.fillText(`dialog: ${ds.active ? `line ${ds.lineIndex}/${ds.lines.length}` : 'off'}  inputLock: ${inputLockedRef.current}`, 8,104);
        ctx.restore();
      }
      for (const k in justPressed) justPressed[k] = false;
    };
    animFrameRef.current = requestAnimationFrame(animate);
    return () => { cancelAnimationFrame(animFrameRef.current); bgMusic.pause(); bgMusic.currentTime = 0; walkSound.pause(); };
  }, [started]);

  useEffect(() => {
    if (!started) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return; }
      const gameKeys = ['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','w','a','s','d',' ','Enter'];
      if (gameKeys.includes(e.key)) { e.preventDefault(); e.stopPropagation(); if (!keysRef.current[e.key]) keyJustPressedRef.current[e.key] = true; keysRef.current[e.key] = true; }
    };
    const handleKeyUp = (e: KeyboardEvent) => { keysRef.current[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown, true);
    window.addEventListener('keyup', handleKeyUp, true);
    return () => { window.removeEventListener('keydown', handleKeyDown, true); window.removeEventListener('keyup', handleKeyUp, true); };
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
      {started && DEBUG && <DebugControls npcsRef={npcsRef} setDebugLog={setDebugLog} debugLog={debugLog} patrolRef={patrolRef} />}
    </div>
  );
}
