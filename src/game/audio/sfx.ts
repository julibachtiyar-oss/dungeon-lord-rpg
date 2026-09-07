// Procedural Sound Effects via ZzFX (GDD §10)
// Zero assets, lightweight, unified AudioContext, audible on mobile phone speakers
import { audioManager } from './audioManager';

export function unlockAudio(): void {
  audioManager.unlock();
}

// ZzFX core synthesis with unified AudioContext
export function playZzfx(
  volume = 1,
  randomness = 0.05,
  frequency = 220,
  attack = 0,
  sustain = 0,
  decay = 0.1,
  shape = 0,
  shapeCurve = 1,
  slide = 0,
  deltaSlide = 0,
  pitchJump = 0,
  pitchJumpTime = 0,
  repeatTime = 0,
  noise = 0,
  modulation = 0,
  bitCrush = 0,
  delay = 0,
  sustainVolume = 1,
  decayCurve = 1,
  tremolo = 0
): void {
  if (typeof window === 'undefined') return;
  try {
    const ctx = audioManager.getContext();
    if (!ctx || ctx.state === 'suspended') return;

    // Randomize pitch slightly
    const randomFreq = frequency * (1 + (Math.random() * 2 - 1) * randomness);

    // Calculate buffer
    const sampleRate = ctx.sampleRate;
    const length = Math.max(1, (attack + sustain + decay + delay) * sampleRate);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    let phase = 0;
    let freq = randomFreq;

    for (let i = 0; i < length; i++) {
      const t = i / sampleRate;
      let amp = 0;

      if (t < attack) {
        amp = t / Math.max(0.001, attack);
      } else if (t < attack + sustain) {
        amp = 1;
      } else if (t < attack + sustain + decay) {
        amp = sustainVolume * (1 - (t - attack - sustain) / Math.max(0.001, decay));
      }

      freq += slide + deltaSlide * t;
      if (pitchJumpTime > 0 && t >= pitchJumpTime) {
        freq += pitchJump;
      }

      phase += (2 * Math.PI * Math.max(10, freq)) / sampleRate;

      // Waveform generator
      let val = 0;
      if (shape === 0) val = Math.sin(phase); // Sine
      else if (shape === 1) val = Math.sin(phase) > 0 ? 1 : -1; // Square
      else if (shape === 2) val = (phase % (2 * Math.PI)) / Math.PI - 1; // Sawtooth
      else val = Math.random() * 2 - 1; // Noise

      if (noise > 0) val = val * (1 - noise) + (Math.random() * 2 - 1) * noise;

      // Master volume boost for mobile phone speakers
      data[i] = Math.max(-1, Math.min(1, val * amp * volume * 0.45));
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(audioManager.getMasterGain() || ctx.destination);
    source.start();
  } catch (e) {
    // Audio unlock error fallback
  }
}

// 15 GDD SFX Presets (GDD §10: crisp, punchy, mobile-optimized frequencies)
export const SFX = {
  swing1: () => playZzfx(0.6, 0.05, 380, 0.01, 0.02, 0.08, 0, 1, -14, 0, 0, 0, 0, 0.35),
  swing2: () => playZzfx(0.65, 0.05, 440, 0.01, 0.02, 0.09, 0, 1, -16, 0, 0, 0, 0, 0.4),
  swing3: () => playZzfx(0.85, 0.08, 280, 0.02, 0.06, 0.18, 1, 1, -22, 0, 0, 0, 0, 0.45),
  hitFlesh: () => playZzfx(0.85, 0.1, 240, 0, 0.04, 0.12, 0, 1, -10, 0, 0, 0, 0, 0.25),
  hitBone: () => playZzfx(0.75, 0.05, 620, 0.005, 0.03, 0.09, 1, 1, -12, 0, 0, 0, 0, 0.15),
  hitStone: () => playZzfx(0.9, 0.05, 120, 0.01, 0.09, 0.25, 1, 1, -6, 0, 0, 0, 0, 0.35),
  hurt: () => playZzfx(0.9, 0.1, 190, 0.02, 0.09, 0.22, 1, 1, -28, 0, 0, 0, 0, 0.25),
  dash: () => playZzfx(0.7, 0.05, 520, 0.01, 0.05, 0.16, 0, 1, 22, 0, 0, 0, 0, 0.5),
  cleave: () => playZzfx(0.95, 0.1, 200, 0.04, 0.12, 0.32, 1, 1, -12, 0, 0, 0, 0, 0.7),
  shieldUp: () => playZzfx(0.75, 0.05, 420, 0.02, 0.07, 0.2, 0, 1, 30, 0, 0, 0, 0, 0),
  parry: () => playZzfx(1.0, 0.02, 1100, 0.005, 0.05, 0.28, 0, 1, 14, 0, 0, 0, 0, 0.05),
  coin: () => playZzfx(0.65, 0.02, 1200, 0, 0.04, 0.14, 0, 1, 0, 0, 520, 0.04),
  potion: () => playZzfx(0.75, 0.05, 480, 0.03, 0.09, 0.22, 0, 1, 20, 0, 0, 0, 0, 0.1),
  levelUp: () => {
    playZzfx(0.8, 0, 440, 0, 0.06, 0.12, 0);
    setTimeout(() => playZzfx(0.85, 0, 554, 0, 0.06, 0.12, 0), 110);
    setTimeout(() => playZzfx(0.9, 0, 659, 0, 0.06, 0.12, 0), 220);
    setTimeout(() => playZzfx(1.0, 0, 880, 0, 0.12, 0.35, 0), 330);
  },
  door: () => playZzfx(0.7, 0.1, 140, 0.05, 0.18, 0.35, 3, 1, -6, 0, 0, 0, 0, 0.8),
  bossRoar: () => playZzfx(1.0, 0.1, 95, 0.06, 0.5, 0.9, 1, 1, -16, 0, 0, 0, 0, 0.8),
  uiTap: () => playZzfx(0.45, 0, 720, 0, 0.01, 0.05, 0),
  victoryFanfare: () => {
    SFX.levelUp();
    setTimeout(() => SFX.coin(), 400);
    setTimeout(() => SFX.levelUp(), 700);
  }
};
