import { Howl } from 'howler';

type SoundMap = {
  [key: string]: Howl;
};

class AudioEngine {
  private static instance: AudioEngine;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sounds: SoundMap = {};
  private isInitialized = false;

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public init(callback: () => void) {
    if (this.isInitialized || typeof window === 'undefined') {
      if (this.isInitialized) callback();
      return;
    }

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);
    
    this.loadSounds();

    const startAudio = () => {
      if (this.audioContext?.state === 'suspended') {
        this.audioContext.resume();
      }
      this.isInitialized = true;
      callback();
      window.removeEventListener('click', startAudio);
      window.removeEventListener('keydown', startAudio);
    };

    window.addEventListener('click', startAudio);
    window.addEventListener('keydown', startAudio);
  }

  private loadSounds() {
    this.sounds['background'] = new Howl({
      src: ['/landingPage.wav'],
      loop: true,
      volume: 0, // Start at 0, fade in
    });
    this.sounds['hover'] = new Howl({
      src: ['/sfxInputBlur.wav'],
      volume: 0.25, // 50% of 0.5
    });
    this.sounds['select'] = new Howl({
      src: ['/sfxInputSelect.wav'],
      volume: 0.25, // 50% of 0.5
    });
  }

  public play(sound: string, fadein: boolean = false) {
    if (!this.isInitialized) return;
    const s = this.sounds[sound];
    if (s) {
      if (!s.playing()) {
        s.play();
        if (fadein) {
            s.fade(0, 0.75, 2000); // Fade to 75% (user requested +50% from 0.5)
        }
      }
    }
  }

  public playProceduralHit() {
      if (!this.audioContext || !this.masterGain) return;
      if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
      }

      const dMinorScale = [1174.66, 1318.51, 1396.91, 1567.98, 1760.00, 1864.66, 2093.00];
      const noteIndex = Math.floor(Math.random() * dMinorScale.length);
      const volume = 0.1; // Reduced volume (user requested down 20% then another 20% -> 0.5 * 0.8 * 0.8 = 0.32, let's go lower for subtlety)

      const oscillator = this.audioContext.createOscillator();
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(dMinorScale[noteIndex], this.audioContext.currentTime);

      const noteGain = this.audioContext.createGain();
      noteGain.gain.setValueAtTime(0, this.audioContext.currentTime);
      noteGain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
      noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

      oscillator.connect(noteGain).connect(this.masterGain);
      oscillator.start();
      oscillator.stop(this.audioContext.currentTime + 0.3);
  }
}

export const audioEngine = AudioEngine.getInstance();
