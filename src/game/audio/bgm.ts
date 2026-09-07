// Multi-Track Procedural Web Audio Synthesizer
// Zero external files, 100% offline, mobile speaker optimized, unified AudioContext
import { audioManager } from './audioManager';

class MultiTrackBGM {
  private currentTrack: 'none' | 'town' | 'dungeon' | 'boss' = 'none';
  private intervalId: any = null;
  private droneOsc: OscillatorNode | null = null;
  private isMuted = false;

  public playTown(): void {
    if (this.currentTrack === 'town') return;
    this.stop();
    audioManager.unlock();
    const ctx = audioManager.getContext();
    if (!ctx) return;
    this.currentTrack = 'town';

    // Warm medieval fantasy chords in C Major / Lydian (G3, C4, E4, G4, A4, B4, C5)
    // Frequencies: 196.0Hz to 523.25Hz (crystal clear on mobile phone speakers)
    const townScale = [196.0, 261.63, 329.63, 392.0, 440.0, 493.88, 523.25];
    let step = 0;

    // Gentle lute/harp arpeggio loop
    this.intervalId = setInterval(() => {
      if (this.currentTrack !== 'town' || this.isMuted) return;
      const note = townScale[step % townScale.length];
      const oct = (step % 4 === 0) ? 1 : (step % 3 === 0 ? 1.5 : 1.25);
      this.playPluck(note * (oct > 2 ? 1 : oct), 0.55, 'triangle', 0.18);

      // Warm woodwind counter-melody every 4 steps
      if (step % 4 === 2) {
        const fluteNote = townScale[Math.floor(Math.random() * 4) + 2];
        this.playSmooth(fluteNote * 1.2, 1.1, 'sine', 0.14);
      }
      step++;
    }, 550);
  }

  public playDungeon(): void {
    if (this.currentTrack === 'dungeon') return;
    this.stop();
    audioManager.unlock();
    const ctx = audioManager.getContext();
    if (!ctx) return;
    this.currentTrack = 'dungeon';

    // Mysterious ambient D-minor pentatonic / dorian [D3, F3, G3, A3, C4, D4]
    // Raised to 146.83Hz - 587.33Hz so phone speakers reproduce full resonance!
    const dungeonScale = [146.83, 174.61, 196.0, 220.0, 261.63, 293.66, 349.23, 440.0];
    this.startDeepDrone(146.83);

    let step = 0;
    this.intervalId = setInterval(() => {
      if (this.currentTrack !== 'dungeon' || this.isMuted) return;
      const note = dungeonScale[Math.floor(Math.random() * dungeonScale.length)];
      this.playSmooth(note, 1.8, 'sine', 0.15);

      // Eerie dungeon chime every 4 steps
      if (step % 4 === 0) {
        const chime = dungeonScale[dungeonScale.length - 1];
        this.playPluck(chime * 1.5, 1.8, 'triangle', 0.12);
      }
      step++;
    }, 950);
  }

  public playBoss(): void {
    if (this.currentTrack === 'boss') return;
    this.stop();
    audioManager.unlock();
    const ctx = audioManager.getContext();
    if (!ctx) return;
    this.currentTrack = 'boss';

    // Fast-paced battle drive in E minor (164.81Hz - 659.25Hz)
    const bossNotes = [164.81, 196.0, 220.0, 246.94, 293.66, 329.63, 392.0];
    let step = 0;

    this.intervalId = setInterval(() => {
      if (this.currentTrack !== 'boss' || this.isMuted) return;
      // Driving battle rhythm bass
      const bassNote = (step % 2 === 0) ? 164.81 : 246.94;
      this.playPluck(bassNote, 0.22, 'sawtooth', 0.22);

      // Percussive combat click
      if (step % 4 === 0) {
        this.playPercussion();
      }

      // Dramatic heroic battle riff
      if (step % 4 >= 2) {
        const lead = bossNotes[step % bossNotes.length] * 1.5;
        this.playSmooth(lead, 0.35, 'square', 0.12);
      }
      step++;
    }, 260);
  }

  private startDeepDrone(freq: number): void {
    const ctx = audioManager.getContext();
    const masterGain = audioManager.getMasterGain();
    if (!ctx || !masterGain) return;

    try {
      this.droneOsc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      this.droneOsc.type = 'sawtooth';
      this.droneOsc.frequency.setValueAtTime(freq, ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, ctx.currentTime);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);

      this.droneOsc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      this.droneOsc.start();
    } catch (e) {}
  }

  private playPluck(freq: number, duration: number, type: OscillatorType, volume: number): void {
    const ctx = audioManager.getContext();
    const masterGain = audioManager.getMasterGain();
    if (!ctx || !masterGain) return;

    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(volume, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  private playSmooth(freq: number, duration: number, type: OscillatorType, volume: number): void {
    const ctx = audioManager.getContext();
    const masterGain = audioManager.getMasterGain();
    if (!ctx || !masterGain) return;

    try {
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, ctx.currentTime);

      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {}
  }

  private playPercussion(): void {
    const ctx = audioManager.getContext();
    const masterGain = audioManager.getMasterGain();
    if (!ctx || !masterGain) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.1);

      gain.gain.setValueAtTime(0.35, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

      osc.connect(gain);
      gain.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {}
  }

  public stop(): void {
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
    this.currentTrack = 'none';
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    const masterGain = audioManager.getMasterGain();
    const ctx = audioManager.getContext();
    if (masterGain && ctx) {
      masterGain.gain.setValueAtTime(this.isMuted ? 0 : 0.75, ctx.currentTime);
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }
}

export const BGM = new MultiTrackBGM();
