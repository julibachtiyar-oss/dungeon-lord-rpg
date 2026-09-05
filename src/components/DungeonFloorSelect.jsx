import React from 'react';
import { X, Skull, ShieldAlert, Award, Play, ChevronRight } from 'lucide-react';
import { DUNGEON_FLOORS } from '../constants/rooms';

export default function DungeonFloorSelect({ isOpen, onClose, onSelectFloor, heroLevel, totalAttack }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-md bg-dungeon-900 border border-dungeon-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-dungeon-800 flex items-center justify-between bg-dungeon-950">
          <div>
            <h2 className="text-sm font-black font-fantasy text-blood-400 uppercase tracking-wider flex items-center gap-1.5">
              <Skull size={18} />
              Pilih Ekspedisi Dungeon
            </h2>
            <p className="text-[10px] text-slate-400">
              Kalahkan monster & Boss untuk mendapatkan Gold, Gems dan Loot Legendaris
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-dungeon-800 hover:bg-dungeon-700 text-slate-300 flex items-center justify-center active:scale-95 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Floors List */}
        <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {DUNGEON_FLOORS.map((fl) => {
            const isUnlocked = heroLevel >= fl.requiredLevel;
            const isDangerous = totalAttack < fl.recommendedAtk;

            return (
              <div
                key={fl.floorNumber}
                onClick={() => {
                  if (isUnlocked) {
                    onSelectFloor(fl);
                    onClose();
                  }
                }}
                className={`p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
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
                <div className="mt-3 pt-3 border-t border-dungeon-800 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-3 text-slate-400">
                    <span>Butuh Lv.{fl.requiredLevel}</span>
                    <span>• Rekomendasi ATK: {fl.recommendedAtk}</span>
                  </div>

                  {isUnlocked ? (
                    <div className="flex items-center gap-1 font-black text-gold-400 text-xs">
                      <span>Masuk</span>
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
  );
}
