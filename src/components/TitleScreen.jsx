import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Shield, Sparkles, Crown } from 'lucide-react';
import { sound } from '../engine/soundEngine';

export default function TitleScreen({ onStartGame, onNewGame, hasSaveData, soundMuted, onToggleSound }) {
  const handleStart = () => {
    sound.init();
    sound.playLevelUp();
    sound.playBGM('sanctuary');
    onStartGame();
  };

  const handleNew = () => {
    sound.init();
    sound.playLevelUp();
    sound.playBGM('sanctuary');
    onNewGame();
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#07090e] via-[#0f141c] to-[#07090e] text-slate-100 flex flex-col justify-between p-6 select-none overflow-hidden font-sans">
      {/* Background Animated Torches & Runes */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-gold-600/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 rounded-full bg-purple-600/20 blur-3xl" />
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-dungeon-700 text-[10px] font-bold text-slate-400">
          <Crown size={12} className="text-gold-400" />
          <span>INOTIA MOBILE EDITION v2.0</span>
        </div>

        <button
          onClick={onToggleSound}
          className="p-2 rounded-xl bg-black/50 border border-slate-700 text-slate-300 hover:text-white active:scale-95 transition-all"
        >
          {soundMuted ? <VolumeX size={18} /> : <Volume2 size={18} className="text-gold-400" />}
        </button>
      </div>

      {/* Center Hero Emblem & Title */}
      <div className="relative z-10 text-center space-y-4 my-auto">
        {/* Glowing Sword Portal Crest */}
        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-purple-700 via-amber-600 to-blood-600 p-1 shadow-2xl shadow-purple-900/40 animate-pulse-glow flex items-center justify-center">
          <div className="w-full h-full bg-[#07090e] rounded-[22px] flex items-center justify-center text-4xl">
            ⚔️
          </div>
        </div>

        <div className="space-y-1.5">
          <h1 className="text-2xl sm:text-3xl font-black font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-400 to-gold-500 tracking-wider drop-shadow-md">
            DUNGEON LORD
          </h1>
          <p className="text-xs font-black font-fantasy text-purple-300 tracking-widest uppercase">
            CHRONICLES OF INOTIA
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed pt-1">
            Bangun kerajaan bawah tanahmu, bantai petualang manusia, dan jelajahi dungeon berbahaya.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="relative z-10 w-full max-w-xs mx-auto space-y-3 pb-4">
        {hasSaveData ? (
          <>
            <button
              onClick={handleStart}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-gold-600 via-amber-500 to-gold-600 hover:brightness-110 text-black font-black text-sm uppercase tracking-wider shadow-xl shadow-gold-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 border border-gold-300 font-fantasy"
            >
              <Play size={18} className="fill-black" />
              <span>LANJUTKAN PERJALANAN</span>
            </button>

            <button
              onClick={handleNew}
              className="w-full py-2.5 rounded-xl bg-dungeon-850 hover:bg-dungeon-800 text-slate-400 hover:text-white font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-1.5 border border-dungeon-700"
            >
              <RotateCcw size={14} />
              <span>Mulai Cerita Baru</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleStart}
            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blood-600 via-amber-600 to-blood-600 hover:brightness-110 text-white font-black text-sm uppercase tracking-wider shadow-2xl shadow-blood-600/40 active:scale-95 transition-all flex items-center justify-center gap-2 border border-amber-400/50 font-fantasy"
          >
            <Play size={18} className="fill-white" />
            <span>MASUK KE DUNGEON</span>
          </button>
        )}

        <p className="text-[9px] text-slate-600 text-center uppercase tracking-widest font-mono pt-2">
          Ketuk layar untuk mengaktifkan audio chiptune
        </p>
      </div>
    </div>
  );
}
