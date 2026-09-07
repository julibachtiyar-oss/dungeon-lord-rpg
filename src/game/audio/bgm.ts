// Procedural Ambient Dungeon Synth (Web Audio API)
// Rich dark-fantasy ambiance with zero external dependencies

class AmbientSynthMusic {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private masterGain: GainNode | null = null;
  private intervalId: any = null;
  private isMuted = false;

  private initContext(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public start(): void {
    if (this.isPlaying) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.isPlaying = true;

    // Scale notes: D minor pentatonic / dorian [D2, A2, D3, F3, G3, A3, C4, D4, F4]
    const notes = [73.42, 110.0, 146.83, 174.61, 196.0, 220.0, 261.63, 293.66, 349.23];
    let step = 0;

    // Play a gentle bass drone
    this.playDrone();

    // Play ambient melodic arpeggio pulses
    this.intervalId = setInterval(() => {
      if (!this.isPlaying || !this.ctx || this.isMuted) return;
      
      // Select melody note
      const note = notes[Math.floor(Math.random() * notes.length)];
      this.playNote(note, 1.8, 'sine', 0.08);

      // Occasional crystalline high chime
      if (step % 4 === 0) {
        const chime = notes[notes.length - 1 - (step % 3)] * 1.5;
        this.playNote(chime, 2.5, 'triangle', 0.04);
      }

      step++;
    }, 1200);
  }

  private playDrone(): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(73.42, this.ctx.currentTime); // D2

    // Low-pass filter for deep warm rumble
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start();
  }

  private playNote(freq: number, duration: number, type: OscillatorType, volume: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    // Filter to make it soft and mystical
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, this.ctx.currentTime);

    // Soft attack, sustained gentle release
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.3);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  public stop(): void {
    this.isPlaying = false;
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.25, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const BGM = new AmbientSynthMusic();
