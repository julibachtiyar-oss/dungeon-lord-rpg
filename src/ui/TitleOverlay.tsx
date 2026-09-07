import React, { useState, useEffect } from 'react';
import { Play, BookOpen, Volume2, VolumeX, Shield, Swords, Sparkles, HelpCircle, X } from 'lucide-react';
import { EventBus } from '../game/events';
import { unlockAudio } from '../game/audio/sfx';
import { BGM } from '../game/audio/bgm';

export default function TitleOverlay() {
  const [bestScore, setBestScore] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number>(0);
  const [showCodex, setShowCodex] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    try {
      const s = localStorage.getItem('EMBERDEEP_BEST_SCORE');
      const t = localStorage.getItem('EMBERDEEP_BEST_TIME');
      if (s) setBestScore(parseInt(s, 10));
      if (t) setBestTime(parseInt(t, 10));
    } catch (e) {}
  }, []);

  const handleStartGame = () => {
    unlockAudio();
    BGM.playTown();
    EventBus.emitEvent('game:state', 'town');
  };

  const handleDirectDungeon = () => {
    unlockAudio();
    BGM.playDungeon();
    EventBus.emitEvent('game:start', undefined as unknown as void);
  };

  const handleOpenStoryPrologue = () => {
    unlockAudio();
    EventBus.emitEvent('game:state', 'prologue');
  };

  const toggleSound = () => {
    const muted = BGM.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden">
      {/* Cinematic High-Res Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-10 scale-105 transform animate-pulse duration-[8000ms]"
        style={{ backgroundImage: "url('/backgrounds/emberdeep_sanctuary.jpg')" }}
      />
      {/* Dark Vignette Overlay for Crisp Contrast */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/80 -z-10" />

      {/* Top Bar: Edition Badge & Audio Toggle */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-amber-500/50 backdrop-blur-md shadow-lg shadow-amber-950/40">
          <Sparkles size={13} className="text-amber-400 animate-spin" />
          <span className="text-[10px] sm:text-xs font-black text-amber-300 tracking-widest uppercase font-mono">
            EMBERDEEP PREMIUM EDITION
          </span>
        </div>

        <button
          onClick={toggleSound}
          className="p-2.5 rounded-full bg-black/60 border border-slate-700 text-slate-200 hover:text-amber-400 active:scale-95 transition-all backdrop-blur-md"
          title="Toggle Audio"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-amber-400" />}
        </button>
      </div>

      {/* Hero & Title Center Area */}
      <div className="my-auto text-center space-y-4 max-w-md mx-auto">
        {/* Glowing Title Crest */}
        <div className="space-y-1">
          <h1 className="text-4xl sm:text-5xl font-black font-fantasy tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-amber-600 drop-shadow-[0_4px_12px_rgba(245,158,11,0.6)]">
            EMBERDEEP
          </h1>
          <p className="text-xs sm:text-sm font-bold font-serif text-amber-200 tracking-widest uppercase drop-shadow">
            CHRONICLES OF THE DUNGEON LORD
          </p>
          <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
        </div>

        {/* Hero Character Card */}
        <div className="flex items-center gap-3 p-3 rounded-2xl bg-black/70 border border-amber-500/40 backdrop-blur-md shadow-2xl text-left">
          <img 
            src="/portraits/hero_warrior.jpg" 
            alt="Hero Ren" 
            className="w-14 h-14 rounded-xl object-cover border-2 border-amber-400 shadow-md"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-white font-fantasy tracking-wide">REN (HERO KNIGHT)</span>
              <span className="text-[10px] font-bold text-amber-400 font-mono px-1.5 py-0.5 rounded bg-amber-950/80 border border-amber-500/40">TIER 1</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-snug mt-0.5 line-clamp-2">
              Ksatria pedang api dengan perisai Bulwark. Misi pertama: mengklaim kristal kuil bawah tanah.
            </p>
          </div>
        </div>

        {/* Best Records Display */}
        {bestScore > 0 && (
          <div className="inline-flex items-center gap-4 px-4 py-1.5 rounded-full bg-black/80 border border-amber-500/30 text-[11px] text-slate-200">
            <span className="text-amber-400 font-bold">Rekor Terbaik:</span>
            <span className="font-mono font-black text-yellow-300">{bestScore} Poin</span>
            <span className="text-slate-400 font-mono">({bestTime}s)</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5 max-w-xs mx-auto w-full pb-4">
        {/* Main CTA: Play Game Immediately */}
        <button
          onClick={handleStartGame}
          className="group relative w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black text-sm uppercase tracking-wider font-fantasy shadow-xl shadow-amber-500/30 active:scale-95 transition-all flex items-center justify-center gap-2 overflow-hidden border border-yellow-200"
        >
          <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
          <Play size={18} className="fill-black" />
          <span>MASUK KOTA VALENROCK</span>
        </button>

        {/* Secondary: Story Prologue */}
        <button
          onClick={handleOpenStoryPrologue}
          className="w-full py-2.5 px-4 rounded-xl bg-black/70 hover:bg-black/90 border border-amber-500/50 text-amber-300 text-xs font-bold uppercase tracking-wider font-fantasy active:scale-95 transition-all flex items-center justify-center gap-2 backdrop-blur-md"
        >
          <BookOpen size={15} />
          <span>PROLOG KISAH ISEKAI</span>
        </button>

        {/* Tertiary: Codex & Guide */}
        <button
          onClick={() => setShowCodex(true)}
          className="w-full py-2 px-3 text-[11px] font-bold text-slate-400 hover:text-slate-200 flex items-center justify-center gap-1.5 active:scale-95"
        >
          <HelpCircle size={13} />
          <span>Panduan Kontrol & Keahlian</span>
        </button>
      </div>

      {/* Codex & Guide Modal */}
      {showCodex && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#0f141c] border-2 border-amber-500/60 rounded-3xl p-5 text-left space-y-4 shadow-2xl relative max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowCodex(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Swords size={20} className="text-amber-400" />
              <h2 className="text-base font-black font-fantasy text-amber-300 uppercase">
                PANDUAN KONTROL & HERO
              </h2>
            </div>

            {/* Mobile Touch Controls */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-slate-300 uppercase font-mono">Kontrol Mobile (Layar Sentuh)</h3>
              <p className="text-[11px] text-slate-400">
                - <b>Joystick Kiri</b>: Sentuh area kiri bawah untuk bergerak 8 arah.<br />
                - <b>Tombol Pedang (A)</b>: 3-Hit Combo dengan Auto-Aim ke musuh terdekat.<br />
                - <b>Tombol Api (S1)</b>: Ember Cleave (AoE tebasan api + Burn DoT).<br />
                - <b>Tombol Perisai (S2)</b>: Bulwark Parry (200ms blok damage + stun 800ms).<br />
                - <b>Tombol Angin (D)</b>: Dash cepat dengan i-frames kebal serangan.<br />
                - <b>Tombol Potion</b>: Memulihkan 45 HP seketika.
              </p>
            </div>

            {/* PC Keyboard Shortcuts */}
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <h3 className="text-xs font-bold text-slate-300 uppercase font-mono">Shortcut Keyboard & Mouse (PC)</h3>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 font-mono">
                <div className="p-2 rounded bg-black/50 border border-slate-800">
                  <span className="text-amber-400 font-bold">[W][A][S][D]</span> Gerak
                </div>
                <div className="p-2 rounded bg-black/50 border border-slate-800">
                  <span className="text-amber-400 font-bold">[SPASI / Klik]</span> Serang
                </div>
                <div className="p-2 rounded bg-black/50 border border-slate-800">
                  <span className="text-amber-400 font-bold">[Q / K]</span> Ember Cleave
                </div>
                <div className="p-2 rounded bg-black/50 border border-slate-800">
                  <span className="text-amber-400 font-bold">[E / L]</span> Bulwark Parry
                </div>
                <div className="p-2 rounded bg-black/50 border border-slate-800">
                  <span className="text-amber-400 font-bold">[SHIFT]</span> Dash
                </div>
                <div className="p-2 rounded bg-black/50 border border-slate-800">
                  <span className="text-amber-400 font-bold">[R / P]</span> Potion HP
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowCodex(false)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase font-fantasy active:scale-95"
            >
              Tutup & Siap Bertarung
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
