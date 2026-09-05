// Procedural Web Audio API Sound & Chiptune BGM Engine
class InotiaSoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.muted = false;
    this.bgmTimer = null;
    this.currentTrack = null;
    this.bgmGain = null;
    this.sfxGain = null;
    this.isPlayingBgm = false;
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        this.bgmGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
        this.sfxGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  vibrate(pattern = 25) {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // --- PROCEDURAL CHIPTUNE BGM (Zero Assets, Ultra-Atmospheric) ---
  playBGM(track = 'sanctuary') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    if (this.currentTrack === track && this.isPlayingBgm) return;
    this.stopBGM();

    this.currentTrack = track;
    this.isPlayingBgm = true;

    // Track notes & scales
    let melodyNotes = [];
    let bassNotes = [];
    let tempo = 220; // ms per step

    if (track === 'title') {
      // Noble & Mysterious Fantasy Theme (D minor / Aeolian)
      melodyNotes = [293.66, 329.63, 349.23, 440.00, 392.00, 349.23, 329.63, 261.63];
      bassNotes = [146.83, 174.61, 196.00, 146.83];
      tempo = 280;
    } else if (track === 'sanctuary') {
      // Dark Sanctuary / Dungeon Tycoon Theme (Atmospheric & Calm)
      melodyNotes = [220.00, 246.94, 261.63, 329.63, 293.66, 261.63, 246.94, 196.00];
      bassNotes = [110.00, 130.81, 146.83, 110.00];
      tempo = 240;
    } else if (track === 'dungeon') {
      // Inotia Dungeon Exploration (Fast, Suspenseful)
      melodyNotes = [329.63, 392.00, 440.00, 493.88, 587.33, 523.25, 440.00, 392.00];
      bassNotes = [164.81, 196.00, 220.00, 164.81];
      tempo = 190;
    } else if (track === 'boss') {
      // Intense Boss Battle (Urgent, Heavy Chords)
      melodyNotes = [293.66, 311.13, 349.23, 415.30, 440.00, 349.23, 311.13, 293.66];
      bassNotes = [146.83, 155.56, 174.61, 146.83];
      tempo = 150;
    }

    let step = 0;
    const playStep = () => {
      if (!this.isPlayingBgm || this.muted || !this.ctx) return;

      const t = this.ctx.currentTime;

      // Melody Voice (Square wave with soft envelope)
      const mFreq = melodyNotes[step % melodyNotes.length];
      if (mFreq) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(mFreq, t);

        g.gain.setValueAtTime(0.08, t);
        g.gain.exponentialRampToValueAtTime(0.005, t + tempo / 1000 * 0.9);

        osc.connect(g);
        g.connect(this.bgmGain);
        osc.start(t);
        osc.stop(t + tempo / 1000 * 0.9);
      }

      // Bass Voice (Sawtooth wave for heavy dungeon pulse)
      if (step % 2 === 0) {
        const bFreq = bassNotes[(step / 2) % bassNotes.length];
        if (bFreq) {
          const bassOsc = this.ctx.createOscillator();
          const bg = this.ctx.createGain();
          bassOsc.type = 'sawtooth';
          bassOsc.frequency.setValueAtTime(bFreq, t);

          bg.gain.setValueAtTime(0.09, t);
          bg.gain.exponentialRampToValueAtTime(0.008, t + tempo / 1000 * 1.8);

          bassOsc.connect(bg);
          bg.connect(this.bgmGain);
          bassOsc.start(t);
          bassOsc.stop(t + tempo / 1000 * 1.8);
        }
      }

      step++;
      this.bgmTimer = setTimeout(playStep, tempo);
    };

    playStep();
  }

  stopBGM() {
    this.isPlayingBgm = false;
    if (this.bgmTimer) {
      clearTimeout(this.bgmTimer);
      this.bgmTimer = null;
    }
  }

  // --- INOTIA RETRO SOUND EFFECTS ---

  playAttackMelee() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(320, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);

    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playCriticalHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Layer 1: Heavy punch
    const osc1 = this.ctx.createOscillator();
    const g1 = this.ctx.createGain();
    osc1.type = 'square';
    osc1.frequency.setValueAtTime(180, t);
    osc1.frequency.exponentialRampToValueAtTime(30, t + 0.15);
    g1.gain.setValueAtTime(0.3, t);
    g1.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc1.connect(g1);
    g1.connect(this.sfxGain);
    osc1.start(t);
    osc1.stop(t + 0.15);

    // Layer 2: Metallic chime
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(880, t);
    osc2.frequency.exponentialRampToValueAtTime(220, t + 0.12);
    g2.gain.setValueAtTime(0.22, t);
    g2.gain.exponentialRampToValueAtTime(0.01, t + 0.12);
    osc2.connect(g2);
    g2.connect(this.sfxGain);
    osc2.start(t);
    osc2.stop(t + 0.12);

    this.vibrate([40, 30, 70]);
  }

  playSkillCast() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, t);
    osc.frequency.linearRampToValueAtTime(900, t + 0.2);

    g.gain.setValueAtTime(0.22, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.25);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);
  }

  playSkillExplosion() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(160, t);
    osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);

    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.35);
    this.vibrate([50, 30, 80]);
  }

  playHeal() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const notes = [440, 554.37, 659.25, 880];
    notes.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.06;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }

  playCoinCollect() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(987.77, t);
    osc.frequency.setValueAtTime(1318.51, t + 0.08);

    g.gain.setValueAtTime(0.16, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.2);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  playEquipItem() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(520, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.08);

    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
  }

  playLevelUp() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const chords = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    chords.forEach((freq, idx) => {
      const t = this.ctx.currentTime + idx * 0.08;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0.22, t);
      g.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + 0.25);
    });
    this.vibrate([60, 40, 120]);
  }

  playBossRoar() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(65, t);
    osc.frequency.linearRampToValueAtTime(140, t + 0.25);
    osc.frequency.exponentialRampToValueAtTime(30, t + 0.7);

    g.gain.setValueAtTime(0.35, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.7);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.7);
    this.vibrate([100, 60, 160]);
  }
}

export const sound = new InotiaSoundEngine();
