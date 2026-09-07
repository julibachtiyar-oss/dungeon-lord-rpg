import { BGM } from '../game/audio/bgm';
import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';
import { EventBus } from '../game/events';

interface Props {
  onResume: () => void;
}

export default function PauseMenu({ onResume }: Props) {
  const handleRestart = () => {
    EventBus.emitEvent('game:restart', undefined as unknown as void);
    onResume();
  };

  const handleQuit = () => {
    EventBus.emitEvent('game:state', 'town');
    BGM.playTown();
    onResume();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in select-none font-sans">
      <div className="w-full max-w-xs bg-dungeon-950 border-2 border-slate-700 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
        <h2 className="text-lg font-black font-fantasy text-gold-400 uppercase tracking-wider">
          PERMAINAN DIHENTIKAN
        </h2>

        <div className="space-y-2">
          <button
            onClick={onResume}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-gold-600 to-amber-500 text-black text-xs font-black uppercase active:scale-95 shadow-lg flex items-center justify-center gap-2 font-fantasy"
          >
            <Play size={16} className="fill-black" />
            <span>Lanjutkan</span>
          </button>

          <button
            onClick={handleRestart}
            className="w-full py-3 rounded-2xl bg-dungeon-800 border border-slate-700 text-slate-200 text-xs font-bold uppercase active:scale-95 shadow-md flex items-center justify-center gap-2"
          >
            <RotateCcw size={14} />
            <span>Ulangi Lantai Ini</span>
          </button>

          <button
            onClick={handleQuit}
            className="w-full py-2.5 rounded-2xl bg-black/50 border border-red-900/50 text-red-400 text-xs font-bold uppercase active:scale-95 flex items-center justify-center gap-2"
          >
            <Home size={14} />
            <span>Kembali ke Kota</span>
          </button>
        </div>
      </div>
    </div>
  );
}
