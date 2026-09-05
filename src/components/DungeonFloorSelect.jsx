import React, { useState } from 'react';
import { X, Skull, ShieldAlert, Award, Play, ChevronRight, Sparkles, Flame } from 'lucide-react';
import { DUNGEON_FLOORS } from '../constants/rooms';
import { FLOOR_MODIFIERS } from '../constants/bounties';
import { sound } from '../engine/soundEngine';

export default function DungeonFloorSelect({ isOpen, onClose, onSelectFloor, heroLevel, totalAttack }) {
  const [selectedModifier, setSelectedModifier] = useState(FLOOR_MODIFIERS[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-md bg-dungeon-900 border-2 border-dungeon-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
        {/* Header */}
        <div className="p-3.5 border-b border-dungeon-800 flex items-center justify-between bg-dungeon-950">
          <div>
            <h2 className="text-sm font-black font-fantasy text-blood-400 uppercase tracking-wider flex items-center gap-1.5">
              <Skull size={18} />
              PILIH EKSPEDISI DUNGEON
            </h2>
            <p className="text-[10px] text-slate-400">
              Pilih lantai dan modifikasi kondisi dungeon sebelum bertualang
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-dungeon-800 hover:bg-dungeon-700 text-slate-300 flex items-center justify-center active:scale-95 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-3.5 space-y-3.5 overflow-y-auto">
          {/* Floor Modifier Selector */}
          <div className="p-3 rounded-2xl bg-black/40 border border-dungeon-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-gold-400 font-fantasy flex items-center gap-1">
                <Sparkles size={12} />
                Modifikasi Atmosfir Lantai (Buff & Tantangan)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {FLOOR_MODIFIERS.map(mod => {
                const isSelected = selectedModifier.id === mod.id;
                return (
                  <button
                    key={mod.id}
                    onClick={() => {
                      sound.playEquipItem();
                      setSelectedModifier(mod);
                    }}
                    className={`p-2 rounded-xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-dungeon-800 border-gold-400 shadow-md shadow-gold-500/20'
                        : 'bg-dungeon-950/80 border-dungeon-800 hover:border-slate-600'
                    }`}
                  >
                    <span className="text-[11px] font-black text-white block truncate">{mod.name}</span>
                    <span className="text-[9px] text-slate-400 block line-clamp-2 leading-tight mt-0.5">{mod.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Floors List */}
          <div className="space-y-2.5">
            <span className="text-[10px] font-black uppercase text-slate-400 font-fantasy block">
              Daftar Tingkatan Lantai
            </span>

            {DUNGEON_FLOORS.map((fl) => {
              const isUnlocked = heroLevel >= fl.requiredLevel;
              const isDangerous = totalAttack < fl.recommendedAtk;

              return (
                <div
                  key={fl.floorNumber}
                  onClick={() => {
                    if (isUnlocked) {
                      sound.playSkillCast();
                      onSelectFloor({ ...fl, modifier: selectedModifier });
                      onClose();
                    }
                  }}
                  className={`p-3.5 rounded-2xl border-2 transition-all relative overflow-hidden ${
                    isUnlocked
                      ? 'bg-dungeon-850 border-dungeon-700 hover:border-gold-500 cursor-pointer active:scale-98 shadow-md'
                      : 'bg-dungeon-950/60 border-dungeon-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center font-fantasy font-black text-lg border"
                        style={{
                          backgroundColor: `${fl.color}20`,
                          borderColor: fl.color,
                          color: fl.color
                        }}
                      >
                        {fl.floorNumber}
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-white">{fl.name}</h3>
                        <p className="text-[10px] text-slate-400">{fl.subtitle}</p>
                      </div>
                    </div>

                    <span
                      className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase"
                      style={{
                        backgroundColor: `${fl.color}25`,
                        color: fl.color,
                        border: `1px solid ${fl.color}60`
                      }}
                    >
                      {fl.difficulty}
                    </span>
                  </div>

                  {/* Details Footer */}
                  <div className="mt-2.5 pt-2.5 border-t border-dungeon-800 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2.5 text-slate-400 text-[10px]">
                      <span>Syarat: Lv.{fl.requiredLevel}</span>
                      <span>• Rekomendasi ATK: {fl.recommendedAtk}</span>
                    </div>

                    {isUnlocked ? (
                      <div className="flex items-center gap-1 font-black text-gold-400 text-xs">
                        <span>Serbu</span>
                        <ChevronRight size={14} />
                      </div>
                    ) : (
                      <span className="text-slate-500 font-bold text-xs">Terkunci</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
