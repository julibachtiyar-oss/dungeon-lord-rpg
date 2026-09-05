// Polyphonic Chiptune Audio Engine 2.0 with FM Arpeggio & Volume Control
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

    // Volume settings (0.0 to 1.0)
    this.bgmVolume = 0.65;
    this.sfxVolume = 0.85;
    this.hapticsEnabled = true;

    // Restore saved settings
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('DUNGEON_AUDIO_SETTINGS');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.bgmVolume === 'number') this.bgmVolume = parsed.bgmVolume;
          if (typeof parsed.sfxVolume === 'number') this.sfxVolume = parsed.sfxVolume;
          if (typeof parsed.muted === 'boolean') this.muted = parsed.muted;
          if (typeof parsed.hapticsEnabled === 'boolean') this.hapticsEnabled = parsed.hapticsEnabled;
        }
      } catch (e) {}
    }
  }

  saveSettings() {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('DUNGEON_AUDIO_SETTINGS', JSON.stringify({
          bgmVolume: this.bgmVolume,
          sfxVolume: this.sfxVolume,
          muted: this.muted,
          hapticsEnabled: this.hapticsEnabled
        }));
      } catch (e) {}
    }
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.bgmGain = this.ctx.createGain();
        this.bgmGain.gain.setValueAtTime(this.muted ? 0 : this.bgmVolume * 0.16, this.ctx.currentTime);
        this.bgmGain.connect(this.ctx.destination);

        this.sfxGain = this.ctx.createGain();
        this.sfxGain.gain.setValueAtTime(this.muted ? 0 : this.sfxVolume * 0.35, this.ctx.currentTime);
        this.sfxGain.connect(this.ctx.destination);
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setBGMVolume(vol) {
    this.bgmVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.bgmGain) {
      this.bgmGain.gain.setValueAtTime(this.muted ? 0 : this.bgmVolume * 0.16, this.ctx.currentTime);
    }
    this.saveSettings();
  }

  setSFXVolume(vol) {
    this.sfxVolume = Math.max(0, Math.min(1, vol));
    if (this.ctx && this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.muted ? 0 : this.sfxVolume * 0.35, this.ctx.currentTime);
    }
    this.saveSettings();
  }

  setMuted(isMuted) {
    this.muted = isMuted;
    if (this.ctx) {
      if (this.bgmGain) {
        this.bgmGain.gain.setValueAtTime(isMuted ? 0 : this.bgmVolume * 0.16, this.ctx.currentTime);
      }
      if (this.sfxGain) {
        this.sfxGain.gain.setValueAtTime(isMuted ? 0 : this.sfxVolume * 0.35, this.ctx.currentTime);
      }
    }
    this.saveSettings();
  }

  setHapticsEnabled(enabled) {
    this.hapticsEnabled = enabled;
    this.saveSettings();
  }

  vibrate(pattern = 25) {
    if (!this.hapticsEnabled) return;
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(pattern);
      } catch (e) {}
    }
  }

  // --- POLYPHONIC PROCEDURAL CHIPTUNE BGM 2.0 (3-Voice Harmonies) ---
  playBGM(track = 'sanctuary') {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    if (this.currentTrack === track && this.isPlayingBgm) return;
    this.stopBGM();

    this.currentTrack = track;
    this.isPlayingBgm = true;

    // Track notes & polyphonic scales
    let melodyNotes = [];
    let counterMelody = [];
    let bassNotes = [];
    let tempo = 220; // ms per step

    if (track === 'title') {
      // Noble & Mysterious Fantasy Theme (D minor / Aeolian)
      melodyNotes = [293.66, 329.63, 349.23, 440.00, 392.00, 349.23, 329.63, 261.63];
      counterMelody = [440.00, 523.25, 587.33, 523.25, 440.00, 392.00, 349.23, 329.63];
      bassNotes = [146.83, 174.61, 196.00, 146.83];
      tempo = 280;
    } else if (track === 'sanctuary') {
      // Dark Sanctuary / Dungeon Tycoon Theme (Atmospheric & Calm)
      melodyNotes = [220.00, 246.94, 261.63, 329.63, 293.66, 261.63, 246.94, 196.00];
      counterMelody = [329.63, 392.00, 440.00, 392.00, 329.63, 261.63, 293.66, 246.94];
      bassNotes = [110.00, 130.81, 146.83, 110.00];
      tempo = 240;
    } else if (track === 'dungeon') {
      // Inotia Dungeon Exploration (Suspenseful, Fast Arpeggios)
      melodyNotes = [329.63, 392.00, 440.00, 493.88, 587.33, 523.25, 440.00, 392.00];
      counterMelody = [659.25, 587.33, 523.25, 440.00, 493.88, 587.33, 659.25, 440.00];
      bassNotes = [164.81, 196.00, 220.00, 164.81];
      tempo = 190;
    } else if (track === 'boss') {
      // Epic Boss Battle (Intense Chords & Speed)
      melodyNotes = [293.66, 311.13, 349.23, 415.30, 440.00, 349.23, 311.13, 293.66];
      counterMelody = [587.33, 622.25, 698.46, 830.61, 880.00, 698.46, 622.25, 587.33];
      bassNotes = [146.83, 155.56, 174.61, 146.83];
      tempo = 145;
    }

    let step = 0;
    const playStep = () => {
      if (!this.isPlayingBgm || this.muted || !this.ctx) return;

      const t = this.ctx.currentTime;
      const stepDuration = tempo / 1000;

      // Voice 1: Lead Melody (Triangle Wave)
      const mFreq = melodyNotes[step % melodyNotes.length];
      if (mFreq) {
        const osc = this.ctx.createOscillator();
        const g = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(mFreq, t);

        g.gain.setValueAtTime(0.09, t);
        g.gain.exponentialRampToValueAtTime(0.005, t + stepDuration * 0.9);

        osc.connect(g);
        g.connect(this.bgmGain);
        osc.start(t);
        osc.stop(t + stepDuration * 0.9);
      }

      // Voice 2: Arpeggio Counter-Melody (Soft Sine Wave)
      const cFreq = counterMelody[step % counterMelody.length];
      if (cFreq && (step % 2 === 0 || track === 'boss')) {
        const oscC = this.ctx.createOscillator();
        const gC = this.ctx.createGain();
        oscC.type = 'sine';
        oscC.frequency.setValueAtTime(cFreq, t);

        gC.gain.setValueAtTime(0.045, t);
        gC.gain.exponentialRampToValueAtTime(0.002, t + stepDuration * 0.7);

        oscC.connect(gC);
        gC.connect(this.bgmGain);
        oscC.start(t);
        oscC.stop(t + stepDuration * 0.7);
      }

      // Voice 3: Bass Foundation (Every 2 steps)
      if (step % 2 === 0) {
        const bFreq = bassNotes[(step / 2) % bassNotes.length];
        if (bFreq) {
          const bOsc = this.ctx.createOscillator();
          const bGain = this.ctx.createGain();
          bOsc.type = 'triangle';
          bOsc.frequency.setValueAtTime(bFreq, t);

          bGain.gain.setValueAtTime(0.12, t);
          bGain.gain.exponentialRampToValueAtTime(0.01, t + stepDuration * 1.8);

          bOsc.connect(bGain);
          bGain.connect(this.bgmGain);
          bOsc.start(t);
          bOsc.stop(t + stepDuration * 1.8);
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

  // --- SOUND EFFECTS (SFX) ---
  playAttackMelee() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(240, t);
    osc.frequency.exponentialRampToValueAtTime(60, t + 0.1);

    g.gain.setValueAtTime(0.2, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.1);
    this.vibrate(18);
  }

  playCriticalHit() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Heavy punch
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

    // Metallic chime
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

  // Blacksmith Anvil Clang with Spark Hiss
  playAnvilClang() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    // Layer 1: Metal impact
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, t);
    osc.frequency.exponentialRampToValueAtTime(440, t + 0.25);
    g.gain.setValueAtTime(0.3, t);
    g.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
    osc.connect(g);
    g.connect(this.sfxGain);
    osc.start(t);
    osc.stop(t + 0.25);

    // Layer 2: Ringing harmonic
    const osc2 = this.ctx.createOscillator();
    const g2 = this.ctx.createGain();
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(2400, t);
    osc2.frequency.exponentialRampToValueAtTime(1800, t + 0.3);
    g2.gain.setValueAtTime(0.15, t);
    g2.gain.exponentialRampToValueAtTime(0.005, t + 0.3);
    osc2.connect(g2);
    g2.connect(this.sfxGain);
    osc2.start(t);
    osc2.stop(t + 0.3);

    this.vibrate([40, 20, 50]);
  }

  // Victory Fanfare Chime
  playVictoryFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.ctx) return;

    const fanfare = [
      { f: 523.25, d: 0.12 },
      { f: 659.25, d: 0.12 },
      { f: 783.99, d: 0.12 },
      { f: 1046.50, d: 0.35 }
    ];
    let offset = 0;
    fanfare.forEach(item => {
      const t = this.ctx.currentTime + offset;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(item.f, t);
      g.gain.setValueAtTime(0.24, t);
      g.gain.exponentialRampToValueAtTime(0.01, t + item.d);
      osc.connect(g);
      g.connect(this.sfxGain);
      osc.start(t);
      osc.stop(t + item.d);
      offset += item.d;
    });
    this.vibrate([80, 40, 80, 40, 160]);
  }
}

export const sound = new InotiaSoundEngine();
