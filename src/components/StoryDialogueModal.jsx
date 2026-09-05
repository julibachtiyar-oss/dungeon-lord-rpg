import React, { useState, useEffect } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { sound } from '../engine/soundEngine';

export default function StoryDialogueModal({ isOpen, dialogueList, onFinish }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [displayedText, setDisplayedText] = useState('');

  const currentDialogue = dialogueList ? dialogueList[currentIndex] : null;

  useEffect(() => {
    if (!isOpen || !currentDialogue) return;

    let charIdx = 0;
    setDisplayedText('');
    const fullText = currentDialogue.text;

    const timer = setInterval(() => {
      charIdx++;
      setDisplayedText(fullText.slice(0, charIdx));
      if (charIdx >= fullText.length) {
        clearInterval(timer);
      }
    }, 25);

    return () => clearInterval(timer);
  }, [currentIndex, isOpen, currentDialogue]);

  if (!isOpen || !currentDialogue) return null;

  const handleNext = () => {
    sound.playEquipItem();
    if (displayedText.length < currentDialogue.text.length) {
      // Fast forward text
      setDisplayedText(currentDialogue.text);
      return;
    }

    if (currentIndex < dialogueList.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish();
    }
  };

  return (
    <div
      onClick={handleNext}
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex flex-col justify-end p-4 pb-8 select-none animate-fade-in cursor-pointer"
    >
      <div className="w-full max-w-lg mx-auto bg-dungeon-900/95 border-2 border-gold-500/80 rounded-3xl p-4 shadow-2xl shadow-black relative overflow-hidden flex items-start gap-3">
        {/* Character Portrait Avatar */}
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border-2 shadow-xl shrink-0"
          style={{
            backgroundColor: `${currentDialogue.avatarColor || '#eab308'}25`,
            borderColor: currentDialogue.avatarColor || '#eab308'
          }}
        >
          {currentDialogue.avatar || '🧙‍♂️'}
        </div>

        {/* Text Area */}
        <div className="flex-1 space-y-1">
          {/* Speaker Badge */}
          <div className="flex items-center justify-between">
            <span
              className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider font-fantasy"
              style={{
                backgroundColor: currentDialogue.avatarColor || '#eab308',
                color: '#000000'
              }}
            >
              {currentDialogue.speaker}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {currentIndex + 1} / {dialogueList.length}
            </span>
          </div>

          <p className="text-xs sm:text-sm font-medium text-slate-100 leading-relaxed pt-1 min-h-[48px]">
            {displayedText}
          </p>

          <div className="flex items-center justify-end gap-1 text-[10px] font-bold text-gold-400 pt-1 animate-pulse">
            <span>Ketuk layar untuk lanjut</span>
            <ChevronRight size={12} />
          </div>
        </div>
      </div>
    </div>
  );
}
