import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, BookOpen, HelpCircle, X, Shield, Swords, Sparkles } from 'lucide-react';
import { EventBus } from '../game/events';
import { unlockAudio, SFX } from '../game/audio/sfx';
import { BGM } from '../game/audio/bgm';

interface TitleOverlayProps {
  onStart?: () => void;
  onPrologue?: () => void;
  onDirectDungeon?: () => void;
  onOpenSanctuary?: () => void;
}

export default function TitleOverlay({ onStart, onPrologue, onDirectDungeon, onOpenSanctuary }: TitleOverlayProps) {
  const [bestScore, setBestScore] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number>(0);
  const [showCodex, setShowCodex] = useState(false);
  const [isMuted, setIsMuted] = useState(BGM.getMuted());

  useEffect(() => {
    try {
      const s = localStorage.getItem('EMBERDEEP_BEST_SCORE');
      const t = localStorage.getItem('EMBERDEEP_BEST_TIME');
      if (s) setBestScore(parseInt(s, 10));
      if (t) setBestTime(parseInt(t, 10));
    } catch (e) {}
  }, []);

  const handleTouchStart = (e?: React.MouseEvent | React.TouchEvent) => {
    // If clicking codex or toggle, do not start game
    if (showCodex) return;

    unlockAudio();
    SFX.uiTap();
    BGM.playTown();

    if (onStart) {
      onStart();
    } else {
      EventBus.emitEvent('game:state', 'town');
    }
  };

  const handleStartPrologue = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudio();
    SFX.uiTap();
    if (onPrologue) {
      onPrologue();
    } else {
      EventBus.emitEvent('game:state', 'prologue');
    }
  };

  const handleDirectDungeon = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudio();
    SFX.uiTap();
    BGM.playDungeon();
    if (onDirectDungeon) {
      onDirectDungeon();
    } else {
      EventBus.emitEvent('game:start', undefined as unknown as void);
    }
  };

  const handleStartSanctuary = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudio();
    SFX.uiTap();
    if (onOpenSanctuary) {
      onOpenSanctuary();
    } else {
      EventBus.emitEvent('game:state', 'sanctuary');
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockAudio();
    const muted = BGM.toggleMute();
    setIsMuted(muted);
  };

  return (
    <div 
      onClick={() => handleTouchStart()}
      className="fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden cursor-pointer"
    >
      {/* Fullscreen Cinematic Background Art */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat -z-20 transform scale-105 transition-transform duration-1000"
        style={{ backgroundImage: "url('/backgrounds/emberdeep_sanctuary.jpg')" }}
      />

      {/* Atmospheric Vignette & Embers Glow */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/80 -z-10" />

      {/* Floating Embers Visual Accent */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute w-2 h-2 rounded-full bg-amber-400/60 blur-[1px] bottom-10 left-[15%] animate-ping" />
        <div className="absolute w-1.5 h-1.5 rounded-full bg-yellow-300/50 blur-[1px] bottom-24 right-[20%] animate-pulse" />
        <div className="absolute w-2.5 h-2.5 rounded-full bg-orange-500/40 blur-[2px] bottom-40 left-[45%] animate-bounce" />
      </div>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 border border-amber-500/40 backdrop-blur-md shadow-lg shadow-amber-950/40">
          <Sparkles size={13} className="text-amber-400 animate-spin" />
          <span className="text-[10px] sm:text-xs font-black text-amber-300 tracking-widest uppercase font-mono">
            EMBERDEEP MOBILE EDITION
          </span>
        </div>

        <button
          onClick={toggleSound}
          className="p-2.5 rounded-full bg-black/70 border border-slate-700 text-slate-200 hover:text-amber-400 active:scale-95 transition-all backdrop-blur-md shadow-md"
          title="Toggle Audio"
        >
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-amber-400 animate-pulse" />}
        </button>
      </div>

      {/* Grand Title Logo & Subtitle */}
      <div className="my-auto text-center space-y-3 max-w-sm mx-auto pointer-events-none">
        <div className="space-y-1">
          <h1 className="text-5xl sm:text-6xl font-black font-fantasy tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-yellow-100 via-amber-300 to-amber-600 drop-shadow-[0_4px_18px_rgba(245,158,11,0.7)]">
            EMBERDEEP
          </h1>
          <p className="text-xs sm:text-sm font-bold font-serif text-amber-200/90 tracking-widest uppercase drop-shadow">
            CHRONICLES OF THE DUNGEON LORD
          </p>
          <div className="w-36 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
        </div>

        {/* High Score & Speedrun Badge */}
        {bestScore > 0 && (
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-black/80 border border-amber-500/40 text-[11px] text-slate-200 backdrop-blur-sm shadow-md">
            <span className="text-amber-400 font-bold">Rekor Terbaik:</span>
            <span className="font-mono font-black text-yellow-300">{bestScore} Pts</span>
            <span className="text-slate-400 font-mono">({bestTime}s)</span>
          </div>
        )}
      </div>

      {/* Interactive Bottom Section: Classic Mobile Game Start */}
      <div className="space-y-4 max-w-xs mx-auto w-full pb-6 text-center">
        {/* Pulsing Touch to Start Prompt */}
        <div className="animate-pulse">
          <div className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black text-sm uppercase tracking-widest font-fantasy shadow-[0_0_30px_rgba(245,158,11,0.5)] border border-yellow-200 flex items-center justify-center gap-2 transform active:scale-95 transition-all">
            <Sparkles size={16} className="fill-black" />
            <span>KETUK UNTUK MEMULAI</span>
          </div>
          <p className="text-[10px] text-amber-200/70 font-mono mt-1.5 tracking-wider uppercase">
            SENTUH DI MANA SAJA UNTUK MASUK
          </p>
        </div>

        {/* Story & Quick Access Grid */}
        <div className="grid grid-cols-2 gap-2 pt-1 pointer-events-auto">
          <button
            onClick={handleStartSanctuary}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-purple-950/90 to-indigo-950/90 hover:brightness-125 border border-purple-500/60 text-purple-200 text-[11px] font-black uppercase tracking-wider font-fantasy active:scale-95 transition-all flex items-center justify-center gap-1.5 backdrop-blur-md shadow-md shadow-purple-950/50"
          >
            <Sparkles size={13} className="text-yellow-400" />
            <span>DUNGEON SAYA (48P)</span>
          </button>

          <button
            onClick={handleDirectDungeon}
            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-950/90 to-orange-950/90 hover:brightness-125 border border-amber-500/60 text-amber-200 text-[11px] font-black uppercase tracking-wider font-fantasy active:scale-95 transition-all flex items-center justify-center gap-1.5 backdrop-blur-md shadow-md shadow-amber-950/50"
          >
            <Swords size={13} className="text-amber-400" />
            <span>EKSPEDISI LANTAI 1</span>
          </button>

          <button
            onClick={handleStartPrologue}
            className="py-2 px-3 rounded-xl bg-black/80 hover:bg-black/95 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider font-fantasy active:scale-95 transition-all flex items-center justify-center gap-1.5 backdrop-blur-md"
          >
            <BookOpen size={12} />
            <span>Prolog Kisah</span>
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              unlockAudio();
              setShowCodex(true);
            }}
            className="py-2 px-3 rounded-xl bg-black/80 hover:bg-black/95 border border-slate-700 text-slate-300 text-[10px] font-bold uppercase tracking-wider font-fantasy active:scale-95 transition-all flex items-center justify-center gap-1.5 backdrop-blur-md"
          >
            <HelpCircle size={12} />
            <span>Panduan & Hero</span>
          </button>
        </div>
      </div>

      {/* Codex & Guide Modal */}
      {showCodex && (
        <div 
          onClick={(e) => e.stopPropagation()} 
          className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in"
        >
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
              <p className="text-[11px] text-slate-400 leading-relaxed">
                - <b>Joystick Kiri</b>: Sentuh area kiri bawah untuk bergerak 8 arah.<br />
                - <b>Tombol Pedang (A)</b>: 3-Hit Combo dengan Auto-Aim ke musuh terdekat.<br />
                - <b>Tombol Api (S1)</b>: Ember Cleave (Tebasan api melingkar 360°).<br />
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
