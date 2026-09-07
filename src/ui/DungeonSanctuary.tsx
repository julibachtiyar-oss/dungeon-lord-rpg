import React from 'react';
import { Sparkles, ArrowLeft, Shield, Flame, Gem, Zap, Check } from 'lucide-react';
import { SFX } from '../game/audio/sfx';

interface Props {
  coreCrystals: number;
  sanctuaryUpgrades: {
    altar: number;
    training: number;
    vault: number;
    defense: number;
  };
  onUpgrade: (facility: 'altar' | 'training' | 'vault' | 'defense', cost: number) => void;
  onBackToTown: () => void;
}

export default function DungeonSanctuary({
  coreCrystals,
  sanctuaryUpgrades,
  onUpgrade,
  onBackToTown
}: Props) {
  const facilities = [
    {
      id: 'altar' as const,
      name: 'Altar Inti Kristal',
      icon: Gem,
      color: 'text-purple-400',
      level: sanctuaryUpgrades.altar,
      desc: 'Menyerap esensi kristal untuk meningkatkan HP Maksimum (+25 HP) dan Kekuatan Serang (+15%).',
      cost: sanctuaryUpgrades.altar + 1
    },
    {
      id: 'training' as const,
      name: 'Ruang Pelatihan Ksatria',
      icon: Flame,
      color: 'text-amber-400',
      level: sanctuaryUpgrades.training,
      desc: 'Meningkatkan critical combo finisher (+8%) dan durasi pembakaran Ember Cleave (+1.5s).',
      cost: sanctuaryUpgrades.training + 1
    },
    {
      id: 'vault' as const,
      name: 'Kubah Relik Kristal',
      icon: Sparkles,
      color: 'text-cyan-400',
      level: sanctuaryUpgrades.vault,
      desc: 'Menyimpan relik kuno untuk melipatgandakan drop koin emas (+30%) saat menjelajah.',
      cost: sanctuaryUpgrades.vault + 1
    },
    {
      id: 'defense' as const,
      name: 'Pertahanan Inti & Jebakan',
      icon: Shield,
      color: 'text-emerald-400',
      level: sanctuaryUpgrades.defense,
      desc: 'Membangun barikade magis yang mengurangi damage yang diterima Ren di dungeon (-12%).',
      cost: sanctuaryUpgrades.defense + 1
    }
  ];

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden font-sans">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center -z-10 scale-105"
        style={{ backgroundImage: "url('/backgrounds/emberdeep_sanctuary.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/60 to-black/85 -z-10" />

      {/* Top Header */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={onBackToTown}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 border border-slate-700 text-slate-200 text-xs font-bold hover:text-amber-400 active:scale-95 transition-all backdrop-blur-md"
        >
          <ArrowLeft size={16} />
          <span>Kembali ke Kota</span>
        </button>

        {/* Core Crystals Display */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/80 border border-purple-500 shadow-lg shadow-purple-950/50 backdrop-blur-md">
          <Gem size={15} className="text-purple-400 animate-pulse" />
          <span className="text-xs font-black text-purple-200 font-mono">
            {coreCrystals} KRISTAL INTI
          </span>
        </div>
      </div>

      {/* Center Content */}
      <div className="my-auto max-w-md mx-auto w-full space-y-3">
        {/* Title Banner */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-900/40 border border-purple-500/40 text-[10px] text-purple-300 font-bold uppercase tracking-wider">
            <span>Dungeon Rumah Milik Pribadi</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-amber-300 to-purple-400 tracking-wider">
            SANCTUARY EMBERDEEP
          </h2>
          <p className="text-[11px] text-slate-300 max-w-xs mx-auto leading-relaxed">
            Dungeon ini adalah rumahmu. Tingkatkan fasilitas dengan <b>Kristal Inti</b> yang didapat dari mengalahkan boss dungeon lain!
          </p>
        </div>

        {/* Facility Upgrade Cards */}
        <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
          {facilities.map((fac) => {
            const Icon = fac.icon;
            const canAfford = coreCrystals >= fac.cost && fac.level < 5;
            const isMax = fac.level >= 5;

            return (
              <div
                key={fac.id}
                className="p-3 rounded-2xl bg-black/60 border border-slate-800 hover:border-purple-500/50 transition-all backdrop-blur-md flex items-center justify-between gap-3 shadow-lg"
              >
                <div className="flex items-start gap-2.5">
                  <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-800/80 flex-shrink-0 mt-0.5">
                    <Icon size={18} className={fac.color} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-slate-100 font-fantasy">{fac.name}</span>
                      <span className="text-[9px] font-bold text-purple-300 px-1.5 py-0.2 rounded bg-purple-900/60 font-mono">
                        Lv.{fac.level}/5
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 leading-snug mt-0.5">
                      {fac.desc}
                    </p>
                  </div>
                </div>

                {/* Upgrade Action Button */}
                <button
                  disabled={!canAfford || isMax}
                  onClick={() => {
                    SFX.levelUp();
                    onUpgrade(fac.id, fac.cost);
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-black font-fantasy flex-shrink-0 flex items-center gap-1.5 transition-all shadow-md ${
                    isMax
                      ? 'bg-slate-800 text-slate-500 cursor-default'
                      : canAfford
                      ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white active:scale-95 shadow-purple-900/40 border border-purple-400'
                      : 'bg-black/50 text-slate-500 border border-slate-800 cursor-not-allowed'
                  }`}
                >
                  {isMax ? (
                    <>
                      <Check size={12} />
                      <span>MAX</span>
                    </>
                  ) : (
                    <>
                      <Gem size={11} className="text-purple-300" />
                      <span>{fac.cost}</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Tip */}
      <div className="text-center pb-2">
        <span className="text-[10px] text-slate-400 font-mono">
          *Kristal Inti diperoleh dari menaklukkan Lantai 3 Kuil Emberdeep.
        </span>
      </div>
    </div>
  );
}
