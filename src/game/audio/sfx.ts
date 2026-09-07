// Procedural Sound Effects via ZzFX (GDD §10)
// Zero assets, lightweight, randomized pitch support

// ZzFX micro synth implementation
let zzfxCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!zzfxCtx && typeof window !== 'undefined') {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    zzfxCtx = new AudioCtx();
  }
  return zzfxCtx!;
}

export function unlockAudio(): void {
  const ctx = getAudioContext();
  if (ctx && ctx.state === 'suspended') {
    ctx.resume();
  }
}

// ZzFX core function by Frank Force (MIT)
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
    const ctx = getAudioContext();
    if (!ctx || ctx.state === 'suspended') return;

    // Randomize pitch slightly
    const randomFreq = frequency * (1 + (Math.random() * 2 - 1) * randomness);

    // Calculate buffer
    const sampleRate = ctx.sampleRate;
    const length = Math.max(1, (attack + sustain + decay + delay) * sampleRate);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    let sample = 0;
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

      data[i] = Math.max(-1, Math.min(1, val * amp * volume * 0.25));
    }

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start();
  } catch (e) {
    // Audio unlock error fallback
  }
}

// 15 GDD SFX Presets
export const SFX = {
  swing1: () => playZzfx(0.4, 0.05, 340, 0.01, 0.02, 0.08, 0, 1, -12, 0, 0, 0, 0, 0.3),
  swing2: () => playZzfx(0.45, 0.05, 380, 0.01, 0.02, 0.09, 0, 1, -14, 0, 0, 0, 0, 0.35),
  swing3: () => playZzfx(0.6, 0.08, 220, 0.02, 0.05, 0.16, 1, 1, -18, 0, 0, 0, 0, 0.4),
  hitFlesh: () => playZzfx(0.7, 0.1, 180, 0, 0.03, 0.1, 0, 1, -8, 0, 0, 0, 0, 0.2),
  hitBone: () => playZzfx(0.6, 0.05, 520, 0, 0.02, 0.07, 1, 1, -10, 0, 0, 0, 0, 0.1),
  hitStone: () => playZzfx(0.8, 0.05, 90, 0.01, 0.08, 0.22, 1, 1, -4, 0, 0, 0, 0, 0.3),
  hurt: () => playZzfx(0.8, 0.1, 150, 0.02, 0.08, 0.2, 1, 1, -25, 0, 0, 0, 0, 0.2),
  dash: () => playZzfx(0.5, 0.05, 450, 0.01, 0.04, 0.14, 0, 1, 18, 0, 0, 0, 0, 0.5),
  cleave: () => playZzfx(0.8, 0.1, 160, 0.04, 0.1, 0.28, 1, 1, -8, 0, 0, 0, 0, 0.6),
  shieldUp: () => playZzfx(0.6, 0.05, 320, 0.02, 0.06, 0.18, 0, 1, 24, 0, 0, 0, 0, 0),
  parry: () => playZzfx(0.9, 0.02, 880, 0.005, 0.04, 0.25, 0, 1, 10, 0, 0, 0, 0, 0.05),
  coin: () => playZzfx(0.5, 0.02, 980, 0, 0.03, 0.12, 0, 1, 0, 0, 420, 0.05),
  potion: () => playZzfx(0.6, 0.05, 420, 0.03, 0.08, 0.2, 0, 1, 16, 0, 0, 0, 0, 0.1),
  levelUp: () => {
    playZzfx(0.7, 0, 392, 0, 0.05, 0.1, 0);
    setTimeout(() => playZzfx(0.7, 0, 523, 0, 0.05, 0.1, 0), 100);
    setTimeout(() => playZzfx(0.7, 0, 659, 0, 0.05, 0.1, 0), 200);
    setTimeout(() => playZzfx(0.8, 0, 784, 0, 0.1, 0.3, 0), 300);
  },
  door: () => playZzfx(0.6, 0.1, 110, 0.05, 0.15, 0.3, 3, 1, -4, 0, 0, 0, 0, 0.8),
  bossRoar: () => playZzfx(0.9, 0.1, 75, 0.05, 0.4, 0.8, 1, 1, -12, 0, 0, 0, 0, 0.7),
  uiTap: () => playZzfx(0.3, 0, 600, 0, 0.01, 0.04, 0),
  victoryFanfare: () => {
    SFX.levelUp();
    setTimeout(() => SFX.coin(), 400);
    setTimeout(() => SFX.levelUp(), 600);
  }
};
