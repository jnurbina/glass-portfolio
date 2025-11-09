class AudioEngine {
    private audioContext: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private reverb: ConvolverNode | null = null;
    private dMinorScale: number[] = [];

    constructor() {
        if (typeof window !== 'undefined') {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.audioContext.createGain();
            this.masterGain.gain.setValueAtTime(0.5, this.audioContext.currentTime);
            this.reverb = this.audioContext.createConvolver();
            this.createReverb();
            this.masterGain.connect(this.reverb);
            this.reverb.connect(this.audioContext.destination);

            // Higher octaves
            this.dMinorScale = [
                1174.66, 1318.51, 1396.91, 1567.98, 1760.00, 1864.66, 2093.00
            ];
        }
    }

    private async createReverb() {
        if (!this.audioContext || !this.reverb) return;
        const decay = 1.2;
        const sampleRate = this.audioContext.sampleRate;
        const length = sampleRate * decay;
        const impulse = this.audioContext.createBuffer(2, length, sampleRate);
        for (let channel = 0; channel < 2; channel++) {
            const channelData = impulse.getChannelData(channel);
            for (let i = 0; i < length; i++) {
                channelData[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2.5);
            }
        }
        this.reverb.buffer = impulse;
    }

    public playNote(noteIndex: number, volume = 0.5) {
        if (!this.audioContext) return;
        if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
        }

        const oscillator = this.audioContext.createOscillator();
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(this.dMinorScale[noteIndex % this.dMinorScale.length], this.audioContext.currentTime);

        const noteGain = this.audioContext.createGain();
        noteGain.gain.setValueAtTime(0, this.audioContext.currentTime);
        noteGain.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01);
        noteGain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 0.2);

        if (this.masterGain) {
            oscillator.connect(noteGain).connect(this.masterGain);
        }
        oscillator.start();
        oscillator.stop(this.audioContext.currentTime + 0.3);
    }

    public setVolume(volume: number) {
        if (this.masterGain && this.audioContext) {
            this.masterGain.gain.setValueAtTime(volume, this.audioContext.currentTime);
        }
    }
}

export const audioEngine = new AudioEngine();
