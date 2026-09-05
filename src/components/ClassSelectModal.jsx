import React from 'react';
import { X, Shield, Wand2, Zap, Check } from 'lucide-react';
import { HERO_CLASSES } from '../constants/classes';
import { sound } from '../engine/soundEngine';

export default function ClassSelectModal({ isOpen, onClose, selectedClassId, onSelectClass }) {
  if (!isOpen) return null;

  const classList = Object.values(HERO_CLASSES);
  const iconMap = {
    Shield,
    Wand2,
    Zap
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-md bg-dungeon-900 border border-dungeon-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-dungeon-800 flex items-center justify-between bg-dungeon-950">
          <div>
            <h2 className="text-sm font-black font-fantasy text-gold-400 uppercase tracking-wider">
              Pilih Kelas Karakter Hero
            </h2>
            <p className="text-[10px] text-slate-400">
              Setiap kelas memiliki gaya bertarung & skill unik di HP Anda
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-dungeon-800 hover:bg-dungeon-700 text-slate-300 flex items-center justify-center active:scale-95 transition-all"
          >
            <X size={18} />
          </button>
        </div>

        {/* Classes List */}
        <div className="p-4 space-y-3 max-h-[75vh] overflow-y-auto">
          {classList.map((cls) => {
            const Icon = iconMap[cls.icon] || Shield;
            const isSelected = selectedClassId === cls.id;

            return (
              <div
                key={cls.id}
                onClick={() => {
                  sound.playLevelUp();
                  onSelectClass(cls.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden active:scale-98 ${
                  isSelected
                    ? 'bg-dungeon-800 border-gold-400 shadow-lg shadow-gold-500/20'
                    : 'bg-dungeon-850 border-dungeon-700/80 hover:border-slate-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg"
                      style={{
                        backgroundColor: `${cls.color}25`,
                        border: `2px solid ${cls.color}`,
                        color: cls.color
                      }}
                    >
                      <Icon size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-black text-white font-fantasy">{cls.name}</h3>
                        {isSelected && (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-gold-500 text-black flex items-center gap-1">
                            <Check size={10} /> Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-gold-400 font-semibold">{cls.title}</p>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-300 mt-2 leading-relaxed">{cls.description}</p>

                {/* Base Stats Bar */}
                <div className="grid grid-cols-4 gap-1.5 mt-3 pt-3 border-t border-dungeon-700/60 text-center">
                  <div className="bg-black/30 rounded-lg p-1">
                    <span className="text-[8px] text-slate-400 block font-bold">HP</span>
                    <span className="text-xs font-black text-emerald-400">{cls.baseStats.maxHp}</span>
                  </div>
                  <div className="bg-black/30 rounded-lg p-1">
                    <span className="text-[8px] text-slate-400 block font-bold">MP</span>
                    <span className="text-xs font-black text-mana-400">{cls.baseStats.maxMp}</span>
                  </div>
                  <div className="bg-black/30 rounded-lg p-1">
                    <span className="text-[8px] text-slate-400 block font-bold">ATK</span>
                    <span className="text-xs font-black text-blood-400">{cls.baseStats.attack}</span>
                  </div>
                  <div className="bg-black/30 rounded-lg p-1">
                    <span className="text-[8px] text-slate-400 block font-bold">CRIT</span>
                    <span className="text-xs font-black text-gold-400">{Math.round(cls.baseStats.critChance * 100)}%</span>
                  </div>
                </div>

                {/* Skills Preview */}
                <div className="mt-3 flex gap-2">
                  {cls.skills.map((sk) => (
                    <div
                      key={sk.id}
                      className="flex-1 bg-black/40 rounded-xl p-2 border border-dungeon-700/50 text-left"
                    >
                      <span className="text-[10px] font-black text-white block truncate">{sk.name}</span>
                      <span className="text-[9px] text-slate-400 line-clamp-1">{sk.desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
