// Multi-Track Procedural Web Audio Synthesizer
// Zero external files, 100% offline, adaptive fantasy moods

class MultiTrackBGM {
  private ctx: AudioContext | null = null;
  private currentTrack: 'none' | 'town' | 'dungeon' | 'boss' = 'none';
  private masterGain: GainNode | null = null;
  private intervalId: any = null;
  private droneOsc: OscillatorNode | null = null;
  private isMuted = false;

  private initContext(): void {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.22, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public playTown(): void {
    if (this.currentTrack === 'town') return;
    this.stop();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.currentTrack = 'town';

    // Warm medieval fantasy chords in C Major / Lydian (G3, C4, E4, G4, A4, B4, C5)
    const townScale = [196.0, 261.63, 329.63, 392.0, 440.0, 493.88, 523.25];
    let step = 0;

    // Gentle lute/harp arpeggio timer
    this.intervalId = setInterval(() => {
      if (this.currentTrack !== 'town' || !this.ctx || this.isMuted) return;
      const note = townScale[step % townScale.length];
      const oct = (step % 4 === 0) ? 0.5 : 1;
      this.playPluck(note * oct, 0.6, 'triangle', 0.12);

      // Flute counter-melody every 4 steps
      if (step % 4 === 2) {
        const fluteNote = townScale[Math.floor(Math.random() * 3) + 3];
        this.playSmooth(fluteNote * 1.5, 1.2, 'sine', 0.08);
      }
      step++;
    }, 650);
  }

  public playDungeon(): void {
    if (this.currentTrack === 'dungeon') return;
    this.stop();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.currentTrack = 'dungeon';

    // Deep mysterious ambient D-minor pentatonic / dorian [D2, A2, D3, F3, G3, A3, C4, D4]
    const dungeonScale = [73.42, 110.0, 146.83, 174.61, 196.0, 220.0, 261.63, 293.66];
    this.startDeepDrone(73.42);

    let step = 0;
    this.intervalId = setInterval(() => {
      if (this.currentTrack !== 'dungeon' || !this.ctx || this.isMuted) return;
      const note = dungeonScale[Math.floor(Math.random() * dungeonScale.length)];
      this.playSmooth(note, 2.0, 'sine', 0.09);

      if (step % 5 === 0) {
        const chime = dungeonScale[dungeonScale.length - 1] * 1.5;
        this.playPluck(chime, 2.5, 'triangle', 0.05);
      }
      step++;
    }, 1200);
  }

  public playBoss(): void {
    if (this.currentTrack === 'boss') return;
    this.stop();
    this.initContext();
    if (!this.ctx || !this.masterGain) return;
    this.currentTrack = 'boss';

    // Fast-paced battle drive in E minor
    const bossNotes = [82.41, 98.0, 110.0, 123.47, 146.83, 164.81];
    let step = 0;

    this.intervalId = setInterval(() => {
      if (this.currentTrack !== 'boss' || !this.ctx || this.isMuted) return;
      // Driving bass rhythm
      const bassNote = (step % 2 === 0) ? 82.41 : 123.47;
      this.playPluck(bassNote, 0.25, 'sawtooth', 0.16);

      // Percussive click
      if (step % 4 === 0) {
        this.playPercussion();
      }

      // Dramatic battle lead
      if (step % 8 >= 4) {
        const lead = bossNotes[step % bossNotes.length] * 2;
        this.playSmooth(lead, 0.4, 'square', 0.06);
      }
      step++;
    }, 280);
  }

  private startDeepDrone(freq: number): void {
    if (!this.ctx || !this.masterGain) return;
    this.droneOsc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    this.droneOsc.type = 'sawtooth';
    this.droneOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(140, this.ctx.currentTime);
    gain.gain.setValueAtTime(0.1, this.ctx.currentTime);

    this.droneOsc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    this.droneOsc.start();
  }

  private playPluck(freq: number, duration: number, type: OscillatorType, volume: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration);
  }

  private playSmooth(freq: number, duration: number, type: OscillatorType, volume: number): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(700, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    osc.start(now);
    osc.stop(now + duration);
  }

  private playPercussion(): void {
    if (!this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(120, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(20, this.ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.12);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.12);
  }

  public stop(): void {
    this.currentTrack = 'none';
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    if (this.droneOsc) {
      try {
        this.droneOsc.stop();
        this.droneOsc.disconnect();
      } catch (e) {}
      this.droneOsc = null;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.22, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const BGM = new MultiTrackBGM();
