import React from 'react';
import { 
  Flame, 
  Shield, 
  Zap, 
  Sparkles, 
  X, 
  RotateCcw, 
  Plus, 
  CheckCircle,
  Award
} from 'lucide-react';
import { CLASS_TALENT_TREES } from '../constants/talents';

export default function TalentTreeModal({
  isOpen,
  onClose,
  heroClassId,
  talentPoints,
  talents,
  onLearnTalent,
  onResetTalents
}) {
  if (!isOpen) return null;

  const classTree = CLASS_TALENT_TREES[heroClassId] || CLASS_TALENT_TREES.warrior;
  const iconMap = {
    Flame,
    Shield,
    Zap,
    Sparkles
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-lg bg-dungeon-900 border-2 border-gold-400 rounded-3xl p-4 shadow-2xl space-y-4 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-dungeon-700 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gold-500/20 border border-gold-400 flex items-center justify-center text-gold-400 shadow-md">
              <Award size={22} />
            </div>
            <div>
              <h2 className="text-base font-black font-fantasy text-gold-300 tracking-wide">
                POHON BAKAT (TALENT TREE)
              </h2>
              <p className="text-[11px] text-slate-400">
                Kembangkan 3 cabang spesialisasi untuk memperkuat Hero
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-dungeon-800 text-slate-400 hover:text-white transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Talent Points Counter & Reset Button */}
        <div className="flex items-center justify-between bg-black/50 p-2.5 rounded-2xl border border-gold-500/30">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-gold-400 animate-spin" />
            <span className="text-xs text-slate-300 font-medium">Sisa Poin Bakat:</span>
            <span className="text-sm font-black text-gold-400 bg-gold-500/20 px-2 py-0.5 rounded-lg border border-gold-400/50">
              {talentPoints || 0} Poin
            </span>
          </div>

          <button
            onClick={onResetTalents}
            className="px-2.5 py-1 rounded-xl bg-dungeon-800 hover:bg-dungeon-700 text-slate-300 hover:text-white text-[10px] font-bold flex items-center gap-1 border border-slate-700 transition-all active:scale-95"
          >
            <RotateCcw size={12} />
            <span>Reset Bakat</span>
          </button>
        </div>

        {/* 3 Talent Branches */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {classTree.branches.map(branch => {
            const BranchIcon = iconMap[branch.icon] || Flame;

            return (
              <div
                key={branch.id}
                className="p-3 rounded-2xl bg-dungeon-950 border border-dungeon-800 space-y-2.5"
              >
                {/* Branch Title */}
                <div className="flex items-center gap-2 border-b border-dungeon-800/80 pb-1.5">
                  <span style={{ color: branch.color }}>
                    <BranchIcon size={16} />
                  </span>
                  <h3 className="text-xs font-black font-fantasy text-white tracking-wide" style={{ color: branch.color }}>
                    {branch.name}
                  </h3>
                </div>

                {/* Talents in this Branch */}
                <div className="space-y-2">
                  {branch.talents.map(t => {
                    const currentRank = talents?.[t.id] || 0;
                    const isMax = currentRank >= t.maxRank;
                    const canUpgrade = !isMax && (talentPoints || 0) > 0;

                    return (
                      <div
                        key={t.id}
                        className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                          currentRank > 0
                            ? 'bg-dungeon-850/90 border-gold-500/40 shadow-sm'
                            : 'bg-dungeon-900/60 border-dungeon-800'
                        }`}
                      >
                        <div className="space-y-0.5 flex-1 pr-3">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-white">{t.name}</span>
                            <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-md ${
                              isMax
                                ? 'bg-gold-500/20 text-gold-400 border border-gold-400/50'
                                : currentRank > 0
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                                : 'bg-slate-800 text-slate-500'
                            }`}>
                              [{currentRank}/{t.maxRank}]
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed">
                            {t.desc}
                          </p>
                        </div>

                        {/* Upgrade Button */}
                        <button
                          onClick={() => onLearnTalent(t.id, t.maxRank)}
                          disabled={!canUpgrade}
                          className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1 transition-all active:scale-95 shrink-0 ${
                            isMax
                              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/50 cursor-default'
                              : canUpgrade
                              ? 'bg-gradient-to-tr from-gold-600 to-amber-500 text-black shadow-md shadow-gold-600/30'
                              : 'bg-dungeon-800 text-slate-500 cursor-not-allowed border border-dungeon-700'
                          }`}
                        >
                          {isMax ? (
                            <>
                              <CheckCircle size={14} />
                              <span>MAX</span>
                            </>
                          ) : (
                            <>
                              <Plus size={14} />
                              <span>Tingkatkan</span>
                            </>
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
