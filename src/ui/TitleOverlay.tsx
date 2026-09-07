import React, { useState, useEffect } from 'react';
import { Play, Trophy, Clock } from 'lucide-react';
import { EventBus } from '../game/events';
import { unlockAudio } from '../game/audio/sfx';

export default function TitleOverlay() {
  const [bestScore, setBestScore] = useState<number>(0);
  const [bestTime, setBestTime] = useState<number>(0);

  useEffect(() => {
    try {
      const s = localStorage.getItem('EMBERDEEP_BEST_SCORE');
      const t = localStorage.getItem('EMBERDEEP_BEST_TIME');
      if (s) setBestScore(parseInt(s, 10));
      if (t) setBestTime(parseInt(t, 10));
    } catch (e) {}
  }, []);

  const handleStart = () => {
    unlockAudio();
    // Trigger Beat 1 (Elena dialog) before dungeon start
    EventBus.emitEvent('story:dialogue', {
      id: 1,
      speaker: 'Elena',
      text: 'Kontrak rank F. Emberdeep, cek sarang goblin, lapor kembali. Jangan pergi terlalu dalam, tidak ada yang berharga di sana.',
      options: ['Mengerti.', 'Kenapa tidak?']
    });

    EventBus.onEvent('story:choice', () => {
      EventBus.emitEvent('game:start', undefined as unknown as void);
    });
  };

  return (
    <div className="fixed inset-0 z-40 bg-gradient-to-b from-[#07090e]/95 via-[#0b0a14]/90 to-[#07090e]/95 flex flex-col justify-between p-6 select-none font-sans text-center">
      {/* Top Banner */}
      <div className="pt-4">
        <span className="px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/50 text-[10px] font-black text-purple-300 tracking-widest uppercase font-mono">
          VERTICAL SLICE EDITION
        </span>
      </div>

      {/* Center Title Logo */}
      <div className="space-y-3 my-auto">
        <div className="w-20 h-20 mx-auto rounded-3xl bg-gradient-to-tr from-purple-800 via-amber-600 to-red-600 p-1 shadow-2xl shadow-purple-900/50 flex items-center justify-center animate-pulse">
          <div className="w-full h-full bg-[#07090e] rounded-[22px] flex items-center justify-center text-4xl">
            ⚔️
          </div>
        </div>

        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-amber-400 to-red-500 tracking-wider">
            EMBERDEEP
          </h1>
          <p className="text-xs font-black text-purple-300 font-mono tracking-widest uppercase">
            TOP-DOWN ACTION RPG
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed pt-1">
            Ksatria rendahan yang dikirim ke kuil terbengkalai, menemukan kristal inti kuno yang memanggilnya.
          </p>
        </div>

        {/* Best Records Display */}
        {bestScore > 0 && (
          <div className="inline-flex items-center gap-4 px-4 py-2 rounded-2xl bg-black/50 border border-gold-500/30 text-[10px] text-slate-300">
            <div className="flex items-center gap-1">
              <Trophy size={12} className="text-gold-400" />
              <span className="font-bold font-mono">{bestScore} pts</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock size={12} className="text-cyan-400" />
              <span className="font-bold font-mono">{bestTime}s</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Start Button */}
      <div className="pb-6 space-y-2">
        <button
          onClick={handleStart}
          className="w-full max-w-xs mx-auto py-4 rounded-2xl bg-gradient-to-r from-gold-600 via-amber-500 to-red-600 text-black text-sm font-black uppercase tracking-wider shadow-xl shadow-gold-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 font-fantasy"
        >
          <Play size={18} className="fill-black" />
          <span>MULAI EKSPEDISI</span>
        </button>
        <p className="text-[9px] text-slate-600 uppercase tracking-widest font-mono">
          Ketuk layar untuk mengaktifkan audio
        </p>
      </div>
    </div>
  );
}
