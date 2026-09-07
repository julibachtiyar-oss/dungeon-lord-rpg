import React, { useState, useEffect } from 'react';
import { Sparkles, Shield, Wand2, Swords, ChevronRight, User, Compass } from 'lucide-react';
import { HERO_CLASSES } from '../constants/classes';
import { sound } from '../engine/soundEngine';

export default function PrologueModal({ isOpen, onComplete }) {
  const [step, setStep] = useState(1); // 1: Story Intro, 2: Name & Class, 3: Arrival
  const [playerName, setPlayerName] = useState('Ren');
  const [selectedClass, setSelectedClass] = useState('warrior');
  const [typedText, setTypedText] = useState('');

  const storyIntro = [
    'Dua menit lalu, kau hanya pemuda biasa yang sedang menyeberang jalanan kota modern...',
    'Tiba-tiba, sebuah kilatan cahaya ungu membutakan pandanganmu! Suara bising kendaraan mendadak lenyap berganti deru angin dingin pegunungan.',
    'Saat membuka mata, kau terbaring di depan gerbang batu raksasa bertuliskan aksara rune bercahaya...',
    'Pakaianmu telah berganti jubah petualang, dan sebuah emblem misterius tergantung di dadamu. Takdir baru telah memanggilmu ke Benua Eldoria!'
  ];

  const [dialogueIdx, setDialogueIdx] = useState(0);

  useEffect(() => {
    if (!isOpen) return;
    if (step === 1) {
      let charIdx = 0;
      setTypedText('');
      const full = storyIntro[dialogueIdx];
      const timer = setInterval(() => {
        charIdx++;
        setTypedText(full.slice(0, charIdx));
        if (charIdx >= full.length) clearInterval(timer);
      }, 22);
      return () => clearInterval(timer);
    }
  }, [step, dialogueIdx, isOpen]);

  if (!isOpen) return null;

  const handleNextDialogue = () => {
    sound.playEquipItem();
    if (typedText.length < storyIntro[dialogueIdx].length) {
      setTypedText(storyIntro[dialogueIdx]);
      return;
    }
    if (dialogueIdx < storyIntro.length - 1) {
      setDialogueIdx(prev => prev + 1);
    } else {
      setStep(2);
    }
  };

  const handleFinishProfile = () => {
    if (!playerName.trim()) return;
    sound.playLevelUp();
    setStep(3);
  };

  const handleEnterWorld = () => {
    sound.playBGM('sanctuary');
    onComplete({
      name: playerName.trim() || 'Ren',
      classId: selectedClass
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 select-none animate-fade-in">
      {/* STEP 1: Isekai Awakening Cutscene */}
      {step === 1 && (
        <div
          onClick={handleNextDialogue}
          className="w-full max-w-lg bg-gradient-to-b from-dungeon-900 to-black border-2 border-gold-500/80 rounded-3xl p-6 shadow-2xl shadow-purple-950/50 space-y-5 cursor-pointer relative overflow-hidden"
        >
          <div className="flex items-center justify-between border-b border-dungeon-800 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-purple-400 animate-spin" />
              <span className="text-xs font-black font-fantasy text-purple-300 tracking-wider">
                PROLOGUE: TERPENTAL KE ELDORIA
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">
              {dialogueIdx + 1} / {storyIntro.length}
            </span>
          </div>

          <div className="w-24 h-24 mx-auto rounded-2xl border-2 border-purple-500/60 overflow-hidden shadow-xl shadow-purple-950 bg-dungeon-950">
            <img
              src="/portraits/hero_warrior.jpg"
              alt="Hero"
              className="w-full h-full object-cover object-top"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          <div className="min-h-[72px] bg-black/40 p-3.5 rounded-2xl border border-dungeon-800">
            <p className="text-sm font-medium text-slate-100 leading-relaxed">
              {typedText}
            </p>
          </div>

          <div className="flex items-center justify-end gap-1 text-[11px] font-black text-gold-400 animate-pulse">
            <span>Ketuk layar untuk lanjut</span>
            <ChevronRight size={14} />
          </div>
        </div>
      )}

      {/* STEP 2: Character Name & Class Selection */}
      {step === 2 && (
        <div className="w-full max-w-md bg-dungeon-900 border-2 border-gold-500/80 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
          <div className="text-center space-y-1">
            <h2 className="text-base font-black font-fantasy text-white tracking-wider flex items-center justify-center gap-2">
              <Compass size={18} className="text-gold-400" />
              IDENTITAS PETUALANG ANDA
            </h2>
            <p className="text-[11px] text-slate-400">
              Pilihlah nama dan takdir kelas awal Anda di dunia Eldoria.
            </p>
          </div>

          {/* Player Name Input */}
          <div className="space-y-1.5 bg-black/40 p-3 rounded-2xl border border-dungeon-800">
            <label className="text-[11px] font-black text-gold-400 flex items-center gap-1.5">
              <User size={14} />
              NAMA ANDA:
            </label>
            <input
              type="text"
              value={playerName}
              maxLength={14}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Contoh: Ren, Lucio, Arthur..."
              className="w-full p-2.5 rounded-xl bg-dungeon-950 border border-gold-500/40 text-sm font-black text-white focus:outline-none focus:border-gold-400"
            />
          </div>

          {/* Class Options */}
          <div className="space-y-2">
            <label className="text-[11px] font-black text-slate-300">
              PILIH KELAS UTAMA:
            </label>

            {Object.values(HERO_CLASSES).map((cls) => {
              const isSelected = selectedClass === cls.id;
              const icons = {
                warrior: <Shield size={18} className="text-amber-400" />,
                mage: <Wand2 size={18} className="text-cyan-400" />,
                assassin: <Swords size={18} className="text-purple-400" />
              };

              return (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClass(cls.id)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-center gap-3 active:scale-95 ${
                    isSelected
                      ? 'bg-gold-500/15 border-gold-400 shadow-lg shadow-gold-950/40'
                      : 'bg-black/30 border-dungeon-800 opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-dungeon-800 flex items-center justify-center shrink-0">
                    {icons[cls.id]}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-white font-fantasy">
                        {cls.name}
                      </span>
                      <span className="text-[10px] text-gold-400 font-bold">
                        {cls.title}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 line-clamp-1">
                      {cls.lore || cls.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            onClick={handleFinishProfile}
            disabled={!playerName.trim()}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-gold-600 to-amber-600 hover:from-gold-500 hover:to-amber-500 text-black text-xs font-black uppercase tracking-wider shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>TETAPKAN TAKDIR & MASUK KE KOTA</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* STEP 3: Arrival at Valenrock Town Gates */}
      {step === 3 && (
        <div className="w-full max-w-md bg-gradient-to-b from-dungeon-900 to-black border-2 border-gold-500/80 rounded-3xl p-6 shadow-2xl space-y-4 text-center">
          <div className="w-full h-36 rounded-2xl overflow-hidden border border-gold-500/50 shadow-inner">
            <img
              src="/backgrounds/valenrock.jpg"
              alt="Kota Valenrock"
              className="w-full h-full object-cover"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] text-gold-400 font-black tracking-widest uppercase">
              BAB 1: KOTA PARA PETUALANG
            </span>
            <h2 className="text-lg font-black font-fantasy text-white">
              GERBANG KOTA VALENROCK
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed px-2">
              Lonceng benteng berdentang. Para ksatria dan pedagang berlalu lalang.
              Langkah pertamamu adalah mengunjungi <strong className="text-gold-300">Adventurer's Guild</strong> dan melapor kepada resepsionis guild!
            </p>
          </div>

          <button
            onClick={handleEnterWorld}
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black uppercase tracking-wider shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={16} />
            <span>MASUKI KOTA VALENROCK</span>
          </button>
        </div>
      )}
    </div>
  );
}
