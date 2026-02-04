import { create } from 'zustand';

type GamePhase = 'login' | 'placement' | 'waiting' | 'battle' | 'results';

interface GameState {
  phase: GamePhase;
  user: { id: string; username: string } | null;
  shipPos: { x: number, y: number } | null;
  debugInfo: { x: number, y: number, cam: string };
  
  setPhase: (phase: GamePhase) => void;
  setUser: (user: { id: string; username: string } | null) => void;
  setShipPos: (pos: { x: number, y: number } | null) => void;
  setDebugInfo: (info: Partial<{ x: number, y: number, cam: string }>) => void;
}

export const useGameStore = create<GameState>((set) => ({
  phase: 'login',
  user: null,
  shipPos: null,
  debugInfo: { x: -1, y: -1, cam: '' },

  setPhase: (phase) => set({ phase }),
  setUser: (user) => set({ user }),
  setShipPos: (shipPos) => set({ shipPos }),
  setDebugInfo: (info) => set((state) => ({ debugInfo: { ...state.debugInfo, ...info } })),
}));
