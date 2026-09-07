// Unified Web Audio Manager
// Manages singleton AudioContext, user-gesture unlocking, and mobile speaker optimization.

class AudioManager {
  private static instance: AudioManager;
  private ctx: AudioContext | null = null;
  private isUnlocked: boolean = false;
  private masterGain: GainNode | null = null;

  private constructor() {
    if (typeof window !== 'undefined') {
      const unlockEvents = ['touchstart', 'touchend', 'pointerdown', 'keydown', 'click'];
      const onUserInteraction = () => {
        this.unlock();
        unlockEvents.forEach(evt => window.removeEventListener(evt, onUserInteraction));
      };
      unlockEvents.forEach(evt => window.addEventListener(evt, onUserInteraction, { passive: true }));
    }
  }

  public static getInstance(): AudioManager {
    if (!AudioManager.instance) {
      AudioManager.instance = new AudioManager();
    }
    return AudioManager.instance;
  }

  public getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(0.75, this.ctx.currentTime);
        this.masterGain.connect(this.ctx.destination);
      }
    }
    return this.ctx;
  }

  public getMasterGain(): GainNode | null {
    this.getContext();
    return this.masterGain;
  }

  public unlock(): void {
    const ctx = this.getContext();
    if (ctx) {
      if (ctx.state === 'suspended') {
        ctx.resume().then(() => {
          this.isUnlocked = true;
        }).catch(() => {});
      } else if (ctx.state === 'running') {
        this.isUnlocked = true;
      }
    }
  }

  public isReady(): boolean {
    return this.isUnlocked && this.ctx?.state === 'running';
  }
}

export const audioManager = AudioManager.getInstance();
