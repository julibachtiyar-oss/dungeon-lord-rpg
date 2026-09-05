import React, { useState } from 'react';
import { X, Target, BookOpen, Check, Coins, Sparkles, Award, Skull, ChevronRight, ShieldAlert } from 'lucide-react';
import { BOUNTY_QUESTS, MONSTER_CODEX } from '../constants/bounties';
import { sound } from '../engine/soundEngine';

export default function BountyBoardModal({
  isOpen,
  onClose,
  bountyProgress = {},
  claimedBounties = [],
  onClaimBounty,
  monsterKills = {}
}) {
  const [activeTab, setActiveTab] = useState('bounties'); // 'bounties' | 'bestiary'
  const [selectedCodex, setSelectedCodex] = useState(MONSTER_CODEX[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-lg max-h-[92vh] bg-dungeon-900 border-2 border-gold-500/60 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3.5 border-b border-dungeon-800 flex items-center justify-between bg-dungeon-950">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-gold-600 to-amber-400 text-black flex items-center justify-center text-lg font-black shadow-lg shadow-gold-500/20">
              🎯
            </div>
            <div>
              <h2 className="text-sm font-black font-fantasy text-white tracking-wide">
                PAPAN BURONAN & BESTIARY CODEX
              </h2>
              <p className="text-[10px] text-gold-400 font-semibold">
                Inotia Hunter Guild • Misi Harian & Ensiklopedia
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-dungeon-800 hover:bg-dungeon-700 text-slate-300 flex items-center justify-center active:scale-95 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-dungeon-800 bg-dungeon-950/60 p-1.5 gap-2">
          <button
            onClick={() => setActiveTab('bounties')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'bounties'
                ? 'bg-gradient-to-r from-gold-600 to-amber-400 text-black shadow-md shadow-gold-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Target size={14} />
            <span>Papan Misi Pemburu</span>
          </button>

          <button
            onClick={() => setActiveTab('bestiary')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'bestiary'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen size={14} />
            <span>Bestiary Codex ({MONSTER_CODEX.length})</span>
          </button>
        </div>

        {/* Tab 1: Bounty Quests */}
        {activeTab === 'bounties' && (
          <div className="p-3.5 overflow-y-auto space-y-3">
            <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-600/40 flex items-center gap-2.5">
              <span className="text-xl">📜</span>
              <p className="text-[11px] text-amber-200/90 leading-snug">
                Selesaikan misi perburuan monster di dalam dungeon untuk mengklaim tumpukan koin emas dan kristal permata dari Guild Pemburu!
              </p>
            </div>

            <div className="space-y-2.5">
              {BOUNTY_QUESTS.map(q => {
                const currentKills = bountyProgress[q.targetType] || 0;
                const progress = Math.min(q.targetCount, currentKills);
                const isComplete = progress >= q.targetCount;
                const isClaimed = claimedBounties.includes(q.id);

                return (
                  <div
                    key={q.id}
                    className={`p-3.5 rounded-2xl border-2 transition-all space-y-2.5 ${
                      isClaimed
                        ? 'bg-black/40 border-dungeon-800 opacity-60'
                        : isComplete
                        ? 'bg-dungeon-800 border-gold-500/80 shadow-lg shadow-gold-500/15'
                        : 'bg-dungeon-850 border-dungeon-700/80'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl p-1.5 rounded-xl bg-black/40 border border-dungeon-700">
                          {q.icon}
                        </span>
                        <div>
                          <h4 className="text-xs font-black text-white">{q.title}</h4>
                          <p className="text-[10px] text-slate-400">{q.desc}</p>
                        </div>
                      </div>

                      {/* Reward Pill */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-[9px] font-black text-gold-400 flex items-center gap-0.5">
                          <Coins size={11} /> +{q.rewardGold}
                        </span>
                        <span className="text-[9px] font-black text-purple-300 flex items-center gap-0.5">
                          <Sparkles size={11} /> +{q.rewardGems}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar & Claim Button */}
                    <div className="flex items-center justify-between gap-3 pt-1">
                      <div className="flex-1">
                        <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1">
                          <span>Progres:</span>
                          <span className={isComplete ? 'text-emerald-400 font-black' : 'text-slate-300'}>
                            {progress} / {q.targetCount}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-black/60 overflow-hidden border border-dungeon-700">
                          <div
                            className={`h-full transition-all duration-300 ${
                              isComplete ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' : 'bg-gold-500'
                            }`}
                            style={{ width: `${(progress / q.targetCount) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        {isClaimed ? (
                          <span className="px-3 py-1.5 rounded-xl bg-dungeon-800 text-slate-500 text-[10px] font-black uppercase block">
                            Sudah Diklaim
                          </span>
                        ) : isComplete ? (
                          <button
                            onClick={() => {
                              sound.playCoinCollect();
                              onClaimBounty(q);
                            }}
                            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-tr from-gold-500 to-amber-300 text-black font-black text-[10px] uppercase shadow-md shadow-gold-500/30 active:scale-95 transition-all"
                          >
                            Klaim Hadiah
                          </button>
                        ) : (
                          <span className="px-2.5 py-1 rounded-lg bg-black/40 text-slate-500 text-[9px] font-bold block">
                            Belum Selesai
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Monster Hunter Bestiary Codex */}
        {activeTab === 'bestiary' && (
          <div className="p-3.5 overflow-y-auto space-y-3">
            {/* Monster Grid Selector */}
            <div className="grid grid-cols-6 gap-1.5">
              {MONSTER_CODEX.map(m => {
                const isSelected = selectedCodex.id === m.id;
                const kills = monsterKills[m.id] || 0;

                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedCodex(m)}
                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all relative ${
                      isSelected
                        ? 'bg-purple-900/80 border-purple-400 shadow-md shadow-purple-600/30 scale-105'
                        : 'bg-dungeon-850 border-dungeon-700/80 hover:border-slate-500'
                    }`}
                  >
                    <span className="text-xl">{m.avatar}</span>
                    <span className="text-[8px] font-black text-slate-300 truncate max-w-full">
                      {m.name.split(' ')[0]}
                    </span>
                    {kills > 0 && (
                      <span className="absolute -top-1 -right-1 text-[7px] font-black px-1 rounded-full bg-blood-600 text-white">
                        {kills}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Selected Monster Codex Card */}
            {selectedCodex && (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-dungeon-850 to-black/70 border-2 border-purple-600/60 shadow-xl space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 shadow-lg"
                      style={{
                        backgroundColor: `${selectedCodex.color}20`,
                        borderColor: selectedCodex.color
                      }}
                    >
                      {selectedCodex.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-white">{selectedCodex.name}</h3>
                      <span className="text-[10px] font-bold text-purple-400 block">
                        {selectedCodex.category}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold">
                        Total Dibantai: <strong className="text-gold-400">{monsterKills[selectedCodex.id] || 0} ekor</strong>
                      </span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed italic bg-black/30 p-2.5 rounded-xl border border-dungeon-800">
                  "{selectedCodex.lore}"
                </p>

                {/* Base Combat Attributes */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-black/40 border border-dungeon-700 text-center text-[10px]">
                  <div>
                    <span className="text-slate-400 block font-bold">Base HP</span>
                    <span className="font-black text-emerald-400">{selectedCodex.baseHp}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Base Attack</span>
                    <span className="font-black text-blood-400">{selectedCodex.baseAtk}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block font-bold">Kecepatan</span>
                    <span className="font-black text-cyan-400 truncate block">{selectedCodex.speed}</span>
                  </div>
                </div>

                {/* Tactical Weakness */}
                <div className="p-2.5 rounded-xl bg-blood-950/40 border border-blood-800/60 flex items-center gap-2">
                  <ShieldAlert size={16} className="text-blood-400 shrink-0" />
                  <div className="text-[10px]">
                    <strong className="text-blood-300 block">Kelemahan & Taktik Bertarung:</strong>
                    <span className="text-slate-300">{selectedCodex.weakness}</span>
                  </div>
                </div>

                {/* Loot Drop Table */}
                <div className="space-y-1.5 pt-1">
                  <span className="text-[10px] font-black uppercase text-gold-400 flex items-center gap-1">
                    <Award size={12} />
                    Tabel Kemungkinan Drop Loot:
                  </span>
                  <div className="space-y-1">
                    {selectedCodex.dropTable.map((drop, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-lg bg-dungeon-950 border border-dungeon-800 text-[10px]"
                      >
                        <span className="font-bold text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: drop.color }} />
                          {drop.name}
                        </span>
                        <span className="font-black text-gold-400 font-mono">{drop.rate}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
