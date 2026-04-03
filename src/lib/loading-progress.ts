type Listener = (state: LoadingState) => void;

export interface LoadingState {
  phase: string;
  detail: string;
  progress: number; // 0–100
  complete: boolean;
}

const PHASES = [
  { key: 'init', label: 'Initializing', weight: 5 },
  { key: 'renderer', label: 'Preparing 3D renderer', weight: 10 },
  { key: 'skybox', label: 'Loading skybox texture', weight: 15 },
  { key: 'scene', label: 'Building scene geometry', weight: 15 },
  { key: 'audio-bg', label: 'Loading background music', weight: 20 },
  { key: 'audio-sfx', label: 'Loading sound effects', weight: 15 },
  { key: 'shaders', label: 'Compiling shaders', weight: 10 },
  { key: 'finalize', label: 'Finalizing', weight: 10 },
];

class LoadingProgress {
  private listeners = new Set<Listener>();
  private completedPhases = new Set<string>();
  private currentPhase = '';
  private currentDetail = '';

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    // Immediately send current state
    fn(this.getState());
    return () => { this.listeners.delete(fn); };
  }

  /** Mark a phase as started */
  begin(phaseKey: string, detail?: string) {
    this.currentPhase = phaseKey;
    this.currentDetail = detail || PHASES.find((p) => p.key === phaseKey)?.label || phaseKey;
    this.emit();
  }

  /** Mark a phase as complete */
  complete(phaseKey: string) {
    this.completedPhases.add(phaseKey);
    this.emit();
  }

  /** Mark everything done */
  finish() {
    PHASES.forEach((p) => this.completedPhases.add(p.key));
    this.currentPhase = 'done';
    this.currentDetail = 'Ready';
    this.emit();
  }

  private getState(): LoadingState {
    const totalWeight = PHASES.reduce((s, p) => s + p.weight, 0);
    let progress = 0;
    for (const phase of PHASES) {
      if (this.completedPhases.has(phase.key)) {
        progress += phase.weight;
      }
    }
    return {
      phase: this.currentPhase,
      detail: this.currentDetail,
      progress: Math.min(100, Math.round((progress / totalWeight) * 100)),
      complete: this.completedPhases.size >= PHASES.length,
    };
  }

  private emit() {
    const state = this.getState();
    this.listeners.forEach((fn) => fn(state));
  }
}

export const loadingProgress = new LoadingProgress();
