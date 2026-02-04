"use client";

import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

// Colors for endpoints
const PURPLE = new THREE.Color(0x9933ff);
const BLUE = new THREE.Color(0x0066ff);
const RED = new THREE.Color(0xff0044);
const PINK = new THREE.Color(0xff66aa);

// Left bar strobe pattern: [red, red, blue, purp, purp, blue, blue, purp]
const LEFT_PATTERN = [RED, RED, BLUE, PURPLE, PURPLE, BLUE, BLUE, PURPLE];

// Right bar strobe pattern: [blue, blue, red, red, pink, pink, red, pink]
const RIGHT_PATTERN = [BLUE, BLUE, RED, RED, PINK, PINK, RED, PINK];

// White bar with glow
const BAR_COLOR = new THREE.Color(0xffffff);
const BAR_EMISSIVE = new THREE.Color(0xaaaaaa);

// Ghost bar (trailing echo) - dim grey
const GHOST_COLOR = new THREE.Color(0x444444);
const GHOST_EMISSIVE = new THREE.Color(0x222222);

const BAR_LENGTH = 3.5;
const BAR_RADIUS = 0.05;
const ENDPOINT_RADIUS = 0.22;
const TRAIL_LENGTH = 180; // More trail circles for dense coverage on long swings
const TRAIL_FADE_RATE = 0.68; // Original fade rate
const TRAIL_CIRCLE_RADIUS = 0.28; // Larger trail circles

// Bounds: bars can't travel more than 3 bar lengths from origin in any direction
const MAX_TRAVEL = BAR_LENGTH * 3;

// Default BPM (beats per minute) - controls swing speed
const DEFAULT_BPM = 42; // ~1.43 seconds per swing

// Starting hinge points - inner endpoints touching at center (0, 0)
const LEFT_HINGE_START = new THREE.Vector3(0, 0, 0);
const RIGHT_HINGE_START = new THREE.Vector3(0, 0, 0);

interface BarAnimState {
  angle: number;
  targetAngle: number;
  progress: number;
  pivotEnd: -1 | 1;
  pauseTimer: number;
  // Track recent swings to prevent repetitive back-and-forth
  recentTargets: number[];
  // Rotation bias - tendency to rotate CW (1) or CCW (-1)
  rotationBias: 1 | -1;
  rotationBiasTimer: number; // Time until bias might flip
}

interface TrailCircle {
  position: THREE.Vector3;
  color: THREE.Color;
  alpha: number;
  scale: number;
}

export default function Hinges({ onClose }: { onClose: () => void }) {
  const groupRef = useRef<THREE.Group>(null);

  // Pivot groups - these are positioned at the hinge points and rotate
  const leftPivotRef = useRef<THREE.Group>(null);
  const rightPivotRef = useRef<THREE.Group>(null);

  // Bar groups inside pivots - offset so pivot end is at origin
  const leftBarRef = useRef<THREE.Group>(null);
  const rightBarRef = useRef<THREE.Group>(null);

  // Ghost (trailing echo) pivot groups
  const leftGhostPivotRef = useRef<THREE.Group>(null);
  const rightGhostPivotRef = useRef<THREE.Group>(null);

  // Ghost bar groups
  const leftGhostBarRef = useRef<THREE.Group>(null);
  const rightGhostBarRef = useRef<THREE.Group>(null);

  // Ghost state - lagging behind main bars
  const leftGhostState = useRef({
    position: new THREE.Vector3(0, 0, 0),
    rotation: 0,
    offset: 0,
  });
  const rightGhostState = useRef({
    position: new THREE.Vector3(0, 0, 0),
    rotation: 0,
    offset: 0,
  });

  // Endpoint mesh refs for color updates
  const endpointLARef = useRef<THREE.Mesh>(null);
  const endpointLBRef = useRef<THREE.Mesh>(null);
  const endpointRARef = useRef<THREE.Mesh>(null);
  const endpointRBRef = useRef<THREE.Mesh>(null);

  // Trail circle instances
  const trailInstances = useRef<{
    'LA': THREE.InstancedMesh | null;
    'LB': THREE.InstancedMesh | null;
    'RA': THREE.InstancedMesh | null;
    'RB': THREE.InstancedMesh | null;
  }>({
    'LA': null,
    'LB': null,
    'RA': null,
    'RB': null,
  });

  // Trail data for each endpoint
  const trails = useRef<{
    'LA': TrailCircle[];
    'LB': TrailCircle[];
    'RA': TrailCircle[];
    'RB': TrailCircle[];
  }>({
    'LA': [],
    'LB': [],
    'RA': [],
    'RB': [],
  });

  // INDEPENDENT animation states for each bar
  // They start mirrored but then move independently
  const leftState = useRef<BarAnimState>({
    angle: 0,
    targetAngle: Math.PI / 2, // First swing: 90° CW
    progress: 0,
    pivotEnd: 1,
    pauseTimer: 0,
    recentTargets: [],
    rotationBias: Math.random() < 0.5 ? 1 : -1,
    rotationBiasTimer: 3 + Math.random() * 5,
  });

  const rightState = useRef<BarAnimState>({
    angle: 0,
    targetAngle: -Math.PI / 2, // First swing: 90° CCW (mirrored start)
    progress: 0,
    pivotEnd: -1, // Opposite pivot end for mirror effect at start
    pauseTimer: 0,
    recentTargets: [],
    rotationBias: Math.random() < 0.5 ? 1 : -1,
    rotationBiasTimer: 3 + Math.random() * 5,
  });

  // Current hinge positions (will update when pivot transfers)
  const leftHingePos = useRef(LEFT_HINGE_START.clone());
  const rightHingePos = useRef(RIGHT_HINGE_START.clone());

  // BPM control - tap tempo
  const [bpm, setBpm] = React.useState(DEFAULT_BPM);
  const tapTimes = useRef<number[]>([]);
  const lastTapTime = useRef(0);

  const handleTap = () => {
    const now = performance.now();

    // Reset if more than 2 seconds since last tap
    if (now - lastTapTime.current > 2000) {
      tapTimes.current = [];
    }

    tapTimes.current.push(now);
    lastTapTime.current = now;

    // Keep only last 8 taps for averaging
    if (tapTimes.current.length > 8) {
      tapTimes.current.shift();
    }

    // Need at least 2 taps to calculate BPM
    if (tapTimes.current.length >= 2) {
      const intervals: number[] = [];
      for (let i = 1; i < tapTimes.current.length; i++) {
        intervals.push(tapTimes.current[i] - tapTimes.current[i - 1]);
      }
      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const calculatedBpm = Math.round(60000 / avgInterval); // 60000ms = 1 minute
      // Clamp BPM to reasonable range
      setBpm(Math.min(Math.max(calculatedBpm, 20), 200));
    }
  };

  // Flash timing - separate indices for each bar's pattern
  const leftFlashIndex = useRef(0);
  const rightFlashIndex = useRef(0);
  const lastFlashTime = useRef(0);

  const { camera } = useThree();

  // Camera setup - pulled back to see full swing area
  useFrame((state, delta) => {
    const targetPos = new THREE.Vector3(0, 0, 18);
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

  // Initialize trail arrays
  useEffect(() => {
    for (const key of ['LA', 'LB', 'RA', 'RB'] as const) {
      trails.current[key] = [];
      const initColor = key.startsWith('L') ? LEFT_PATTERN[0] : RIGHT_PATTERN[0];
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        trails.current[key].push({
          position: new THREE.Vector3(0, -100, 0),
          color: initColor.clone(),
          alpha: 0,
          scale: 1,
        });
      }
    }
  }, []);

  // Adaptive easing - smoother at high BPM, more pendulum-like at low BPM
  const adaptiveEase = (t: number, currentBpm: number): number => {
    // Sine-based pendulum easing
    const pendulum = (1 - Math.cos(t * Math.PI)) / 2;

    // Smoother cubic easing for high BPM
    const smooth = t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

    // Blend based on BPM: more pendulum at low BPM, more smooth at high BPM
    const blendFactor = Math.min(1, Math.max(0, (currentBpm - 60) / 100)); // 0 at 60 BPM, 1 at 160+ BPM
    return pendulum * (1 - blendFactor) + smooth * blendFactor;
  };

  // Check if a position is within bounds (bars can now freely overlap and cross)
  const isWithinBounds = (pos: THREE.Vector3): boolean => {
    // Check max travel distance from origin
    return Math.abs(pos.x) <= MAX_TRAVEL && Math.abs(pos.y) <= MAX_TRAVEL;
  };

  // Calculate where the swing end would be after a swing
  const predictSwingEnd = (
    currentHinge: THREE.Vector3,
    pivotEnd: -1 | 1,
    newAngle: number
  ): THREE.Vector3 => {
    const swingEndOffset = -pivotEnd * BAR_LENGTH;
    const localPos = new THREE.Vector3(swingEndOffset, 0, 0);
    localPos.applyAxisAngle(new THREE.Vector3(0, 0, 1), newAngle);
    return currentHinge.clone().add(localPos);
  };

  // Check if a swing would create repetitive back-and-forth pattern
  const isRepetitiveSwing = (state: BarAnimState, newTarget: number): boolean => {
    const recent = state.recentTargets;
    if (recent.length < 3) return false;

    // Normalize angles for comparison
    const normalize = (a: number) => ((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const newNorm = normalize(newTarget);

    // Check for A -> B -> A -> B pattern (back and forth more than once)
    const last3 = recent.slice(-3).map(normalize);
    if (last3.length >= 3) {
      const tolerance = 0.1;
      if (Math.abs(newNorm - last3[0]) < tolerance &&
          recent.length >= 4 &&
          Math.abs(normalize(recent[recent.length - 4]) - last3[1]) < tolerance) {
        return true;
      }
    }
    return false;
  };

  // Pick next swing for a specific bar with biases
  const pickNextSwing = (
    state: BarAnimState,
    myHinge: THREE.Vector3,
    otherHinge: THREE.Vector3
  ): number => {
    // Possible swing amounts: 90°, 180°, 270°, 360° in both directions
    const swingOptions = [
      Math.PI / 2,      // 90° CW
      -Math.PI / 2,     // 90° CCW
      Math.PI,          // 180° CW
      -Math.PI,         // 180° CCW
      Math.PI * 1.5,    // 270° CW
      -Math.PI * 1.5,   // 270° CCW
      Math.PI * 2,      // 360° CW
      -Math.PI * 2,     // 360° CCW
    ];

    const scores: number[] = [];

    for (const swing of swingOptions) {
      let score = 1.0;
      const newTarget = state.angle + swing;

      // === Anti-repetition bias ===
      if (isRepetitiveSwing(state, newTarget)) {
        score *= 0.05;
      }

      // === Proximity bias - prefer swings that keep this bar's swing end close to other bar's hinge ===
      const mySwingEnd = predictSwingEnd(myHinge, state.pivotEnd, newTarget);
      const distanceToOther = mySwingEnd.distanceTo(otherHinge);

      // Bonus for staying close to the other bar
      if (distanceToOther < BAR_LENGTH * 2) {
        score *= 1.5;
      }
      // Extra bonus for potential overlap
      if (distanceToOther < BAR_LENGTH * 0.8) {
        score *= 2.0;
      }
      // Penalty for drifting too far apart
      if (distanceToOther > BAR_LENGTH * 5) {
        score *= 0.3;
      }

      // === Rotation bias ===
      const swingDirection = swing > 0 ? 1 : -1;
      if (swingDirection === state.rotationBias) {
        score *= 1.4;
      }

      // === Bounds check ===
      if (!isWithinBounds(mySwingEnd)) {
        score *= 0.01;
      }

      // === Variety bonus for larger swings ===
      if (Math.abs(swing) >= Math.PI) {
        score *= 1.1;
      }

      scores.push(Math.max(score, 0.001));
    }

    // Weighted random selection
    const totalScore = scores.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalScore;

    for (let i = 0; i < swingOptions.length; i++) {
      random -= scores[i];
      if (random <= 0) {
        return state.angle + swingOptions[i];
      }
    }

    return state.angle + swingOptions[0];
  };

  // Start next movement for a specific bar
  const startNextMovement = (
    state: BarAnimState,
    myHinge: React.MutableRefObject<THREE.Vector3>,
    otherHinge: React.MutableRefObject<THREE.Vector3>
  ) => {
    state.angle = state.targetAngle;

    // Track this target for anti-repetition
    state.recentTargets.push(state.angle);
    if (state.recentTargets.length > 6) {
      state.recentTargets.shift();
    }

    // 50% chance to transfer pivot to the other end of the bar
    const shouldTransferPivot = Math.random() < 0.5;

    if (shouldTransferPivot) {
      // Calculate where the swinging end currently is
      const swingEnd = predictSwingEnd(myHinge.current, state.pivotEnd, state.angle);

      // Check if new position would be within bounds
      if (isWithinBounds(swingEnd)) {
        // Transfer pivot - move hinge to where swinging end was
        myHinge.current.copy(swingEnd);

        // Flip pivot end
        state.pivotEnd = state.pivotEnd === -1 ? 1 : -1;

        // Add a brief pause after transfer
        state.pauseTimer = 0.08;
      }
    }

    // Pick next target angle
    const nextTarget = pickNextSwing(state, myHinge.current, otherHinge.current);

    state.targetAngle = nextTarget;
    state.progress = 0;
  };

  // Temp objects for instanced mesh updates
  const tempMatrix = useMemo(() => new THREE.Matrix4(), []);
  const tempColor = useMemo(() => new THREE.Color(), []);
  const tempScale = useMemo(() => new THREE.Vector3(), []);

  // Get world position of endpoint
  const getEndpointWorldPos = (
    barRef: React.RefObject<THREE.Group>,
    endOffset: number
  ): THREE.Vector3 => {
    if (!barRef.current) return new THREE.Vector3();
    const localPos = new THREE.Vector3(endOffset * BAR_LENGTH / 2, 0, 0);
    barRef.current.updateMatrixWorld();
    return localPos.applyMatrix4(barRef.current.matrixWorld);
  };

  // Main animation loop
  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // === Flash endpoints rapidly - faster strobe for denser trails ===
    const flashInterval = 0.008; // Much faster strobe
    if (time - lastFlashTime.current > flashInterval) {
      lastFlashTime.current = time;

      // Advance pattern indices
      leftFlashIndex.current = (leftFlashIndex.current + 1) % LEFT_PATTERN.length;
      rightFlashIndex.current = (rightFlashIndex.current + 1) % RIGHT_PATTERN.length;

      const updateEndpoint = (ref: React.RefObject<THREE.Mesh>, color: THREE.Color) => {
        if (ref.current) {
          const mat = ref.current.material as THREE.MeshStandardMaterial;
          mat.emissive.copy(color);
          mat.color.copy(color);
        }
      };

      // Left bar: both endpoints cycle through LEFT_PATTERN (offset by half)
      const leftIdx = leftFlashIndex.current;
      const leftIdxOffset = (leftIdx + 4) % LEFT_PATTERN.length;
      updateEndpoint(endpointLARef, LEFT_PATTERN[leftIdx]);
      updateEndpoint(endpointLBRef, LEFT_PATTERN[leftIdxOffset]);

      // Right bar: both endpoints cycle through RIGHT_PATTERN (offset by half)
      const rightIdx = rightFlashIndex.current;
      const rightIdxOffset = (rightIdx + 4) % RIGHT_PATTERN.length;
      updateEndpoint(endpointRARef, RIGHT_PATTERN[rightIdx]);
      updateEndpoint(endpointRBRef, RIGHT_PATTERN[rightIdxOffset]);
    }

    // === Update animation for each bar independently ===
    const updateBarState = (
      state: BarAnimState,
      myHinge: React.MutableRefObject<THREE.Vector3>,
      otherHinge: React.MutableRefObject<THREE.Vector3>
    ) => {
      // Update rotation bias timer
      state.rotationBiasTimer -= delta;
      if (state.rotationBiasTimer <= 0) {
        if (Math.random() < 0.6) {
          state.rotationBias = state.rotationBias === 1 ? -1 : 1;
        }
        state.rotationBiasTimer = 4 + Math.random() * 6;
      }

      // Handle pause after pivot transfer
      if (state.pauseTimer > 0) {
        state.pauseTimer -= delta;
      } else {
        // BPM controls speed: BPM/60 = beats per second
        // Cap effective BPM at 180 for smooth visuals, but allow faster tap registration
        const effectiveBpm = Math.min(bpm, 180);
        state.progress += delta * (effectiveBpm / 60);

        if (state.progress >= 1) {
          state.progress = 0;
          startNextMovement(state, myHinge, otherHinge);
        }
      }
    };

    // Update both bars independently
    const ls = leftState.current;
    const rs = rightState.current;

    updateBarState(ls, leftHingePos, rightHingePos);
    updateBarState(rs, rightHingePos, leftHingePos);

    // Calculate current angles with adaptive easing (smoother at high BPM)
    const leftEased = adaptiveEase(ls.progress, bpm);
    const leftAngle = ls.angle + (ls.targetAngle - ls.angle) * leftEased;

    const rightEased = adaptiveEase(rs.progress, bpm);
    const rightAngle = rs.angle + (rs.targetAngle - rs.angle) * rightEased;

    // === Update pivot group positions ===
    if (leftPivotRef.current) {
      leftPivotRef.current.position.copy(leftHingePos.current);
      leftPivotRef.current.rotation.z = leftAngle;
    }

    if (rightPivotRef.current) {
      rightPivotRef.current.position.copy(rightHingePos.current);
      rightPivotRef.current.rotation.z = rightAngle;
    }

    // === Position bar groups based on each bar's pivot end ===
    const leftOffsetX = -ls.pivotEnd * BAR_LENGTH / 2;
    const rightOffsetX = -rs.pivotEnd * BAR_LENGTH / 2;

    if (leftBarRef.current) {
      leftBarRef.current.position.set(leftOffsetX, 0, 0);
    }

    if (rightBarRef.current) {
      rightBarRef.current.position.set(rightOffsetX, 0, 0);
    }

    // === Update ghost bars (trailing echo with lag) ===
    const ghostLerpSpeed = 4.0 * delta; // Adjust for more/less lag

    // Left ghost
    const lgState = leftGhostState.current;
    lgState.position.lerp(leftHingePos.current, ghostLerpSpeed);
    lgState.rotation += (leftAngle - lgState.rotation) * ghostLerpSpeed;
    lgState.offset += (leftOffsetX - lgState.offset) * ghostLerpSpeed;

    if (leftGhostPivotRef.current) {
      leftGhostPivotRef.current.position.copy(lgState.position);
      leftGhostPivotRef.current.rotation.z = lgState.rotation;
    }
    if (leftGhostBarRef.current) {
      leftGhostBarRef.current.position.set(lgState.offset, 0, 0);
    }

    // Right ghost
    const rgState = rightGhostState.current;
    rgState.position.lerp(rightHingePos.current, ghostLerpSpeed);
    rgState.rotation += (rightAngle - rgState.rotation) * ghostLerpSpeed;
    rgState.offset += (rightOffsetX - rgState.offset) * ghostLerpSpeed;

    if (rightGhostPivotRef.current) {
      rightGhostPivotRef.current.position.copy(rgState.position);
      rightGhostPivotRef.current.rotation.z = rgState.rotation;
    }
    if (rightGhostBarRef.current) {
      rightGhostBarRef.current.position.set(rgState.offset, 0, 0);
    }

    // === Update trails ===
    const updateTrailWithColor = (
      key: 'LA' | 'LB' | 'RA' | 'RB',
      barRef: React.RefObject<THREE.Group>,
      endOffset: number,
      color: THREE.Color
    ) => {
      const trail = trails.current[key];
      const mesh = trailInstances.current[key];
      if (!mesh) return;

      // Shift all points back and fade
      for (let i = TRAIL_LENGTH - 1; i > 0; i--) {
        trail[i].position.copy(trail[i - 1].position);
        trail[i].color.copy(trail[i - 1].color);
        trail[i].alpha = trail[i - 1].alpha * TRAIL_FADE_RATE;
        trail[i].scale = trail[i - 1].scale * 0.94;
      }

      // Add new point at front
      const worldPos = getEndpointWorldPos(barRef, endOffset);
      trail[0].position.copy(worldPos);
      trail[0].color.copy(color);
      trail[0].alpha = 1.0;
      trail[0].scale = 1.0;

      // Update instanced mesh
      for (let i = 0; i < TRAIL_LENGTH; i++) {
        const t = trail[i];
        if (t.alpha < 0.02) {
          tempMatrix.makeScale(0, 0, 0);
        } else {
          // Trail circles slightly smaller/dimmer than endpoints
          const sc = t.scale * TRAIL_CIRCLE_RADIUS * 3.5 * Math.pow(t.alpha, 0.8);
          tempMatrix.identity();
          tempMatrix.setPosition(t.position.x, t.position.y, t.position.z);
          tempScale.set(sc, sc, sc);
          tempMatrix.scale(tempScale);
        }
        mesh.setMatrixAt(i, tempMatrix);
        // Dimmer than endpoints - about 60% brightness
        tempColor.copy(t.color).multiplyScalar(0.6 * t.alpha);
        mesh.setColorAt(i, tempColor);
      }
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    };

    // Get current colors from patterns
    const leftIdx = leftFlashIndex.current;
    const leftIdxOffset = (leftIdx + 4) % LEFT_PATTERN.length;
    const rightIdx = rightFlashIndex.current;
    const rightIdxOffset = (rightIdx + 4) % RIGHT_PATTERN.length;

    updateTrailWithColor('LA', leftBarRef, -1, LEFT_PATTERN[leftIdx]);
    updateTrailWithColor('LB', leftBarRef, 1, LEFT_PATTERN[leftIdxOffset]);
    updateTrailWithColor('RA', rightBarRef, -1, RIGHT_PATTERN[rightIdx]);
    updateTrailWithColor('RB', rightBarRef, 1, RIGHT_PATTERN[rightIdxOffset]);
  });

  // Trail circle geometry and material - softer glow than endpoints
  const trailGeometry = useMemo(() => new THREE.CircleGeometry(TRAIL_CIRCLE_RADIUS, 16), []);
  const trailMaterial = useMemo(() => new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 0.75, // Slightly transparent
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    toneMapped: false,
  }), []);

  return (
    <group ref={groupRef}>
      {/* Dark void background sphere */}
      <mesh renderOrder={-100}>
        <sphereGeometry args={[50, 32, 32]} />
        <meshBasicMaterial color="#000000" side={THREE.BackSide} />
      </mesh>

      {/* Very minimal ambient - hinges are the light source */}
      <ambientLight intensity={0.01} />
      {/* Tiny bit of light just to see bar shape */}
      <pointLight position={[0, 0, 20]} intensity={0.15} color="#111111" />

      {/* LEFT GHOST - Trailing echo (renders behind everything) */}
      <group ref={leftGhostPivotRef} position={LEFT_HINGE_START} renderOrder={-10}>
        <group ref={leftGhostBarRef}>
          <mesh rotation={[0, 0, Math.PI / 2]} renderOrder={-10}>
            <cylinderGeometry args={[BAR_RADIUS * 1.2, BAR_RADIUS * 1.2, BAR_LENGTH, 12]} />
            <meshStandardMaterial
              color={GHOST_COLOR}
              emissive={GHOST_EMISSIVE}
              emissiveIntensity={0.2}
              transparent={true}
              opacity={0.2}
              depthWrite={false}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        </group>
      </group>

      {/* LEFT HINGE - Pivot group (position updated dynamically) */}
      <group ref={leftPivotRef} position={LEFT_HINGE_START}>
        <group ref={leftBarRef}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[BAR_RADIUS, BAR_RADIUS, BAR_LENGTH, 12]} />
            <meshStandardMaterial
              color={BAR_COLOR}
              emissive={BAR_EMISSIVE}
              emissiveIntensity={0.5}
              roughness={0.5}
              metalness={0.2}
            />
          </mesh>

          <mesh ref={endpointLARef} position={[-BAR_LENGTH / 2, 0, 0]}>
            <sphereGeometry args={[ENDPOINT_RADIUS, 16, 16]} />
            <meshStandardMaterial
              color={LEFT_PATTERN[0]}
              emissive={LEFT_PATTERN[0]}
              emissiveIntensity={6.0}
              toneMapped={false}
            />
          </mesh>

          <mesh ref={endpointLBRef} position={[BAR_LENGTH / 2, 0, 0]}>
            <sphereGeometry args={[ENDPOINT_RADIUS, 16, 16]} />
            <meshStandardMaterial
              color={LEFT_PATTERN[4]}
              emissive={LEFT_PATTERN[4]}
              emissiveIntensity={6.0}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>

      {/* RIGHT GHOST - Trailing echo (renders behind everything) */}
      <group ref={rightGhostPivotRef} position={RIGHT_HINGE_START} renderOrder={-10}>
        <group ref={rightGhostBarRef}>
          <mesh rotation={[0, 0, Math.PI / 2]} renderOrder={-10}>
            <cylinderGeometry args={[BAR_RADIUS * 1.2, BAR_RADIUS * 1.2, BAR_LENGTH, 12]} />
            <meshStandardMaterial
              color={GHOST_COLOR}
              emissive={GHOST_EMISSIVE}
              emissiveIntensity={0.2}
              transparent={true}
              opacity={0.2}
              depthWrite={false}
              roughness={0.8}
              metalness={0.1}
            />
          </mesh>
        </group>
      </group>

      {/* RIGHT HINGE - Pivot group (position updated dynamically) */}
      <group ref={rightPivotRef} position={RIGHT_HINGE_START}>
        <group ref={rightBarRef}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[BAR_RADIUS, BAR_RADIUS, BAR_LENGTH, 12]} />
            <meshStandardMaterial
              color={BAR_COLOR}
              emissive={BAR_EMISSIVE}
              emissiveIntensity={0.5}
              roughness={0.5}
              metalness={0.2}
            />
          </mesh>

          <mesh ref={endpointRARef} position={[-BAR_LENGTH / 2, 0, 0]}>
            <sphereGeometry args={[ENDPOINT_RADIUS, 16, 16]} />
            <meshStandardMaterial
              color={RIGHT_PATTERN[0]}
              emissive={RIGHT_PATTERN[0]}
              emissiveIntensity={6.0}
              toneMapped={false}
            />
          </mesh>

          <mesh ref={endpointRBRef} position={[BAR_LENGTH / 2, 0, 0]}>
            <sphereGeometry args={[ENDPOINT_RADIUS, 16, 16]} />
            <meshStandardMaterial
              color={RIGHT_PATTERN[4]}
              emissive={RIGHT_PATTERN[4]}
              emissiveIntensity={6.0}
              toneMapped={false}
            />
          </mesh>
        </group>
      </group>

      {/* Trail instances */}
      <instancedMesh
        ref={(mesh) => { trailInstances.current['LA'] = mesh; }}
        args={[trailGeometry, trailMaterial, TRAIL_LENGTH]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={(mesh) => { trailInstances.current['LB'] = mesh; }}
        args={[trailGeometry, trailMaterial, TRAIL_LENGTH]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={(mesh) => { trailInstances.current['RA'] = mesh; }}
        args={[trailGeometry, trailMaterial, TRAIL_LENGTH]}
        frustumCulled={false}
      />
      <instancedMesh
        ref={(mesh) => { trailInstances.current['RB'] = mesh; }}
        args={[trailGeometry, trailMaterial, TRAIL_LENGTH]}
        frustumCulled={false}
      />

      {/* UI Overlay */}
      <Html position={[0, 0, 0]} fullscreen style={{ pointerEvents: 'none' }}>
        <div className="absolute top-4 right-4 pointer-events-auto">
          <button
            onClick={onClose}
            className="bg-black/80 backdrop-blur-md text-cyan-400 hover:text-white px-4 py-2 rounded-lg border border-cyan-500/50 font-mono text-sm transition-colors"
          >
            [ EXIT ]
          </button>
        </div>

        {/* Tap Tempo Control */}
        <div className="absolute top-4 left-4 pointer-events-auto flex flex-col gap-2">
          <button
            onClick={handleTap}
            className="bg-black/80 backdrop-blur-md text-purple-400 hover:text-white hover:bg-purple-500/30 px-6 py-3 rounded-lg border border-purple-500/50 font-mono text-sm transition-colors active:scale-95"
          >
            TAP
          </button>
          <div className="bg-black/60 backdrop-blur-md text-purple-300 px-3 py-1 rounded border border-purple-500/30 font-mono text-xs text-center">
            {bpm} BPM
          </div>
        </div>

        <div className="absolute bottom-4 left-4 pointer-events-none">
          <div className="bg-black/60 backdrop-blur-md text-white/70 px-4 py-2 rounded-lg border border-white/10 font-mono text-xs">
            HINGES // Kinetic Light Sculpture
          </div>
        </div>
      </Html>
    </group>
  );
}
