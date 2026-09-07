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

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex flex-col justify-end p-4 pb-8 select-none animate-fade-in">
      <div className="w-full max-w-sm mx-auto bg-dungeon-950/95 border-2 border-gold-500/80 rounded-2xl p-4 shadow-2xl space-y-2">
        <div className="flex items-center justify-between">
          <span className="px-2 py-0.5 rounded bg-gold-500/20 text-gold-400 text-xs font-black uppercase font-fantasy">
            {dialogue.speaker}
          </span>
          <span className="text-[10px] text-slate-500 font-mono">BEAT {dialogue.id}</span>
        </div>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-serif min-h-[42px]">
          {dialogue.text}
        </p>

        {dialogue.options && dialogue.options.length > 0 ? (
          <div className="grid grid-cols-2 gap-2 pt-2">
            {dialogue.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => handleSelectOption(opt)}
                className="py-2 px-3 rounded-xl bg-gradient-to-r from-gold-600 to-amber-600 text-black text-xs font-black uppercase active:scale-95 shadow-md"
              >
                {opt}
              </button>
            ))}
          </div>
        ) : (
          <div
            onClick={onClose}
            className="flex items-center justify-end gap-1 text-[10px] font-bold text-gold-400 pt-1 cursor-pointer animate-pulse"
          >
            <span>Ketuk layar untuk lanjut</span>
            <ChevronRight size={12} />
          </div>
        )}
      </div>
    </div>
  );
}
