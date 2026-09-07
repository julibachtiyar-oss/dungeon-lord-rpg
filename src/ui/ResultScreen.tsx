import { EventBus } from '../game/events';
import { BGM } from '../game/audio/bgm';
import React from 'react';
import { Trophy, Clock, Skull, ShieldAlert, RotateCcw, Share2 } from 'lucide-react';

interface Props {
  data: {
    timeSec: number;
    kills: number;
    damageTaken: number;
    gold: number;
    rank: string;
  };
}

export default function ResultScreen({ data }: Props) {
  const handlePlayAgain = () => {
    EventBus.emitEvent('game:stop', undefined as unknown as void);
    EventBus.emitEvent('game:state', 'town');
    BGM.playTown();
  };

  const handleShare = async () => {
    const text = `Saya menyelesaikan ekspedisi EMBERDEEP dengan Rank ${data.rank} dalam ${data.timeSec} detik! Bisakah kau mengalahkanku?`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'EMBERDEEP Action RPG',
          text,
          url: window.location.href
        });
      } catch (e) {}
    } else {
      navigator.clipboard?.writeText(text);
      alert('Hasil skor disalin ke clipboard!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in select-none font-sans">
      <div className="w-full max-w-sm bg-dungeon-950 border-2 border-gold-500/80 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
        {/* Big Rank Badge */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-gold-600 to-amber-400 border-2 border-gold-200 text-black mx-auto flex items-center justify-center font-black text-4xl shadow-xl font-fantasy">
          {data.rank}
        </div>

        <div>
          <h2 className="text-xl font-black font-fantasy text-gold-400">
            EKSPEDISI SELESAI!
          </h2>
          <p className="text-xs text-slate-400">
            Kristal Inti Emberdeep telah memilih tuannya.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 p-3 rounded-2xl bg-black/50 border border-slate-800 text-left text-xs">
          <div className="flex items-center gap-2 text-slate-300">
            <Clock size={14} className="text-cyan-400" />
            <div>
              <div className="text-[9px] text-slate-500">Waktu Run</div>
              <div className="font-bold font-mono">{data.timeSec} detik</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Skull size={14} className="text-red-400" />
            <div>
              <div className="text-[9px] text-slate-500">Musuh Kalah</div>
              <div className="font-bold font-mono">{data.kills}</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <ShieldAlert size={14} className="text-amber-400" />
            <div>
              <div className="text-[9px] text-slate-500">Damage Kena</div>
              <div className="font-bold font-mono">{data.damageTaken} HP</div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-slate-300">
            <Trophy size={14} className="text-gold-400" />
            <div>
              <div className="text-[9px] text-slate-500">Gold Koin</div>
              <div className="font-bold font-mono">{data.gold} G</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2 pt-2">
          <button
            onClick={handlePlayAgain}
            className="py-3 rounded-2xl bg-gradient-to-r from-gold-600 to-amber-600 text-black text-xs font-black uppercase active:scale-95 shadow-md flex items-center justify-center gap-1.5 font-fantasy"
          >
            <RotateCcw size={14} />
            <span>Kembali ke Kota Valenrock</span>
          </button>

          <button
            onClick={handleShare}
            className="py-3 rounded-2xl bg-dungeon-800 hover:bg-dungeon-700 border border-slate-700 text-white text-xs font-black uppercase active:scale-95 shadow-md flex items-center justify-center gap-1.5"
          >
            <Share2 size={14} />
            <span>Bagikan</span>
          </button>
        </div>
      </div>
    </div>
  );
}
