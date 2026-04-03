import { Howl, Howler } from 'howler';

type SoundMap = {
  [key: string]: any;
};

class AudioEngine {
  private static instance: AudioEngine;
  private audioContext: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sounds: SoundMap = {};
  private isInitialized = false;
  private isMuted = false;
  private sfxVolume = 0.1;
  private bgmVolume = 0.1;

  private constructor() {}

  public static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  public init() {
    if (this.isInitialized || typeof window === 'undefined') return;

    this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    this.masterGain = this.audioContext.createGain();
    this.masterGain.connect(this.audioContext.destination);

    // Attempt to unlock audio context immediately (might fail if no gesture)
    if (this.audioContext.state === 'suspended') {
      const unlock = () => {
        this.audioContext?.resume().then(() => {
          window.removeEventListener('click', unlock);
          window.removeEventListener('touchstart', unlock);
          window.removeEventListener('keydown', unlock);
        });
      };
      window.addEventListener('click', unlock);
      window.addEventListener('touchstart', unlock);
      window.addEventListener('keydown', unlock);
    }

    this.isInitialized = true;
  }

  public async load(): Promise<void> {
    this.init();

    // Define sounds if not already defined (idempotent)
    if (Object.keys(this.sounds).length === 0) {
        this.sounds['background'] = new Howl({
            src: ['https://bizi8uwyyyejujyu.public.blob.vercel-storage.com/portfolio/landingPage.wav'],
            loop: true,
            volume: 0,
            preload: true,
        });
        this.sounds['hover'] = new Howl({
            src: ['/sfxInputBlur.wav'],
            volume: this.sfxVolume,
            preload: true,
        });
        this.sounds['select'] = new Howl({
            src: ['/sfxInputSelect.wav'],
            volume: this.sfxVolume,
            preload: true,
        });
    }

    // Wait for all sounds to load
    const loadPromises = Object.values(this.sounds).map(sound => {
        return new Promise<void>((resolve) => {
            if (sound.state() === 'loaded') {
                resolve();
            } else {
                sound.once('load', () => resolve());
                sound.once('loaderror', () => resolve()); // Resolve on error too to avoid blocking
            }
        });
    });

    await Promise.all(loadPromises);
  }

  public play(sound: string, fadein: boolean = false) {
    if (!this.isInitialized || this.isMuted) return;
    const s = this.sounds[sound];
    if (s) {
      if (!s.playing()) {
        const targetVol = sound === 'background' ? this.bgmVolume : this.sfxVolume;
        s.volume(fadein ? 0 : targetVol);
        s.play();
        if (fadein) {
            s.fade(0, targetVol, 2000);
        }
      }
    }
  }

  public stop(sound: string) {
    const s = this.sounds[sound];
    if (s) {
      s.stop();
    }
  }

  public fadeOut(sound: string, duration: number = 1000) {
    const s = this.sounds[sound];
    if (s && s.playing()) {
      s.fade(s.volume(), 0, duration);
      s.once('fade', () => {
        s.stop();
      });
    }
  }

  public setVolume(volume: number) {
    Howler.volume(volume);
  }

  public toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.audioContext) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.audioContext.currentTime);
    }
    Howler.mute(this.isMuted);
  }

  public getIsMuted() {
    return this.isMuted;
  }

  public setSfxVolume(val: number) {
    this.sfxVolume = val;
    // Update instances
    if (this.sounds['hover']) this.sounds['hover'].volume(val);
    if (this.sounds['select']) this.sounds['select'].volume(val);
  }

  public setBgmVolume(val: number) {
    this.bgmVolume = val;
    if (this.sounds['background']) this.sounds['background'].volume(val);
  }

  private _suspendedVolume: number | null = null;

  /** Fade out and pause all portfolio audio (for handing off to a sub-experience like LornScroll) */
  public suspend(fadeDuration = 500) {
    this._suspendedVolume = Howler.volume();
    // Fade Howler master to 0
    const steps = 20;
    const stepMs = fadeDuration / steps;
    const startVol = this._suspendedVolume ?? 1;
    let step = 0;
    const interval = setInterval(() => {
      step++;
      Howler.volume(startVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(interval);
        // Pause all playing sounds
        Object.values(this.sounds).forEach((s: any) => {
          if (s && s.playing()) s.pause();
        });
      }
    }, stepMs);
  }

  /** Resume portfolio audio after suspend */
  public resume() {
    const targetVol = this._suspendedVolume ?? 1;
    Howler.volume(targetVol);
    this._suspendedVolume = null;
    // Resume background music
    const bg = this.sounds['background'];
    if (bg && !bg.playing()) {
      bg.volume(this.bgmVolume);
      bg.play();
    }
  }

  public playProceduralHit() {
      if (!this.audioContext || !this.masterGain || this.isMuted) return;
      if (this.audioContext.state === 'suspended') {
          this.audioContext.resume();
      }

      const dMinorScale = [1174.66, 1318.51, 1396.91, 1567.98, 1760.00, 1864.66, 2093.00];
      const noteIndex = Math.floor(Math.random() * dMinorScale.length);
      const volume = this.sfxVolume * 0.4;

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
