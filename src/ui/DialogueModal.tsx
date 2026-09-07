import React from 'react';
import { ChevronRight } from 'lucide-react';
import { EventBus } from '../game/events';

interface Props {
  dialogue: {
    id: number;
    speaker: string;
    text: string;
    options?: string[];
  };
  onClose: () => void;
}

export default function DialogueModal({ dialogue, onClose }: Props) {
  const handleSelectOption = (opt: string) => {
    EventBus.emitEvent('story:choice', opt);
    onClose();
  };

  const handleNext = () => {
    EventBus.emitEvent('story:choice', 'next');
    onClose();
  };

  // Determine speaker portrait
  let portraitSrc = '/portraits/hero_warrior.jpg';
  const name = dialogue.speaker.toLowerCase();
  if (name.includes('elena')) {
    portraitSrc = '/portraits/elena.jpg';
  } else if (name.includes('vespera') || name.includes('suara') || name.includes('kristal')) {
    portraitSrc = '/portraits/vespera.jpg';
  } else if (name.includes('borin')) {
    portraitSrc = '/portraits/borin.jpg';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end p-4 pb-8 select-none animate-fade-in">
      <div className="w-full max-w-md mx-auto bg-gradient-to-b from-[#151c27] to-[#0b0f17] border-2 border-amber-500/80 rounded-3xl p-4 sm:p-5 shadow-2xl shadow-black space-y-3">
        {/* Speaker Header with Portrait */}
        <div className="flex items-center gap-3">
          <img
            src={portraitSrc}
            alt={dialogue.speaker}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-amber-400 shadow-md flex-shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 text-xs font-black uppercase font-fantasy tracking-wider">
                {dialogue.speaker}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">STORY BEAT {dialogue.id}</span>
            </div>
          </div>
        </div>

        {/* Dialogue Text */}
        <p className="text-xs sm:text-sm text-slate-100 leading-relaxed font-sans min-h-[44px] bg-black/40 p-3 rounded-2xl border border-slate-800">
          "{dialogue.text}"
        </p>

        {/* Options or Continue */}
        {dialogue.options && dialogue.options.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            {dialogue.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(opt)}
                className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black text-xs font-black uppercase tracking-wider active:scale-95 shadow-md font-fantasy border border-yellow-200 hover:brightness-110 transition-all"
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <button
            onClick={handleNext}
            className="w-full py-2.5 flex items-center justify-center gap-1.5 text-xs font-black text-amber-400 hover:text-amber-300 bg-amber-950/40 rounded-xl border border-amber-500/30 active:scale-95 transition-all animate-pulse"
          >
            <span>Ketuk Layar untuk Lanjut</span>
            <ChevronRight size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
