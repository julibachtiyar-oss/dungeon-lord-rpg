import React, { useState } from 'react';
import { ChevronRight, Sparkles } from 'lucide-react';
import { SFX } from '../game/audio/sfx';

interface Props {
  onComplete: () => void;
}

export default function PrologueCutscene({ onComplete }: Props) {
  const [step, setStep] = useState(0);

  const storySlides = [
    {
      title: 'TERLEMPAR KE DUNIA LAIN (ISEKAI)',
      speaker: 'Narator',
      portrait: '/portraits/hero_warrior.jpg',
      text: 'Kilatan cahaya ungu misterius merobek realitas. Saat membuka mata, kau mendapati dirimu berdiri di gerbang kerajaan asing berselimutkan zirah perak dan pedang ksatria di tanganmu.',
      bg: '/backgrounds/emberdeep_sanctuary.jpg'
    },
    {
      title: 'KOTA VALENROCK',
      speaker: 'Elena (Resepsionis Guild)',
      portrait: '/portraits/elena.jpg',
      text: '"Selamat datang di Valenrock, pengelana berzirah. Aku Elena dari Guild Petualang. Aura kristal di tubuhmu sangat kuat... kau ditakdirkan untuk menjelajahi reruntuhan kuno."',
      bg: '/backgrounds/valenrock.jpg'
    },
    {
      title: 'MISI PERTAMA: KUIL EMBERDEEP',
      speaker: 'Elena (Resepsionis Guild)',
      portrait: '/portraits/elena.jpg',
      text: '"Di bawah reruntuhan kuil kuno tersimpan Kristal Inti Utama. Jika kau mampu mengalahkannya, inti kristal itu akan menjadi milikmu... dan kau bisa membangun dungeon itu menjadi rumah pribadimu!"',
      bg: '/backgrounds/valenrock.jpg'
    }
  ];

  const handleNext = () => {
    SFX.uiTap();
    if (step < storySlides.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  const slide = storySlides[step];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 select-none animate-fade-in font-sans">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-[2px] opacity-40 scale-105"
        style={{ backgroundImage: `url('${slide.bg}')` }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/80" />

      {/* Story Dialogue Card */}
      <div className="relative w-full max-w-md bg-gradient-to-b from-[#18202d] to-[#0d121a] border-2 border-amber-500/80 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-amber-400" />
            <span className="text-xs font-black font-fantasy text-amber-300 tracking-wider">
              {slide.title}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">BAGIAN {step + 1} / 3</span>
        </div>

        {/* Speaker Card */}
        <div className="flex items-center gap-3 bg-black/40 p-2.5 rounded-2xl border border-slate-800">
          <img
            src={slide.portrait}
            alt={slide.speaker}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400 shadow-md"
          />
          <div>
            <span className="text-xs font-black text-amber-300 font-fantasy block">{slide.speaker}</span>
            <span className="text-[10px] text-slate-400">Petualangan Baru Dimulai</span>
          </div>
        </div>

        {/* Dialogue Text */}
        <p className="text-xs sm:text-sm text-slate-100 leading-relaxed min-h-[64px] font-sans">
          {slide.text}
        </p>

        {/* Action Button */}
        <button
          onClick={handleNext}
          className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black font-black text-xs uppercase tracking-wider font-fantasy active:scale-95 shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 border border-yellow-200"
        >
          <span>{step < storySlides.length - 1 ? 'Lanjutkan Kisah' : 'Masuk ke Kota Valenrock'}</span>
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
