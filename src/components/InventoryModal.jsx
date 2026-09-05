import React from 'react';
import { X, Shield, Sword, Sparkles, Heart, Zap, Crosshair, Check, Trash2, Coins } from 'lucide-react';
import { ITEM_RARITY } from '../constants/items';
import { sound } from '../engine/soundEngine';

export default function InventoryModal({
  isOpen,
  onClose,
  heroClass,
  heroLevel,
  equipment,
  inventory,
  onEquipItem,
  onSellItem,
  totalStats
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-md max-h-[90vh] bg-dungeon-900 border border-dungeon-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-dungeon-800 flex items-center justify-between bg-dungeon-950">
          <div className="flex items-center gap-2">
            <Sword size={20} className="text-gold-400" />
            <div>
              <h2 className="text-sm font-black font-fantasy text-white uppercase tracking-wider">
                Perlengkapan & Tas Hero
              </h2>
              <p className="text-[10px] text-slate-400">
                {heroClass.name} • Level {heroLevel}
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

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Stats Overview */}
          <div className="p-3.5 rounded-2xl bg-black/40 border border-dungeon-700 grid grid-cols-3 gap-2 text-center">
            <div className="p-2 rounded-xl bg-dungeon-850">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Serangan</span>
              <span className="text-sm font-black text-blood-400 flex items-center justify-center gap-1">
                <Sword size={12} />
                {totalStats.attack}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-dungeon-850">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Pertahanan</span>
              <span className="text-sm font-black text-indigo-400 flex items-center justify-center gap-1">
                <Shield size={12} />
                {totalStats.defense}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-dungeon-850">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Critical</span>
              <span className="text-sm font-black text-gold-400 flex items-center justify-center gap-1">
                <Crosshair size={12} />
                {Math.round(totalStats.critChance * 100)}%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-dungeon-850">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Max HP</span>
              <span className="text-sm font-black text-emerald-400 flex items-center justify-center gap-1">
                <Heart size={12} />
                {totalStats.maxHp}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-dungeon-850">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Max MP</span>
              <span className="text-sm font-black text-mana-400 flex items-center justify-center gap-1">
                <Zap size={12} />
                {totalStats.maxMp}
              </span>
            </div>
            <div className="p-2 rounded-xl bg-dungeon-850">
              <span className="text-[9px] uppercase font-bold text-slate-400 block">Kecepatan</span>
              <span className="text-sm font-black text-amber-300">
                {totalStats.speed.toFixed(1)}
              </span>
            </div>
          </div>

          {/* Currently Equipped */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 font-fantasy">
              Sedang Dipakai
            </h3>
            <div className="space-y-2">
              {['weapon', 'armor', 'ring'].map((slotKey) => {
                const item = equipment[slotKey];
                const rarity = item ? ITEM_RARITY[item.rarity] || ITEM_RARITY.common : null;

                return (
                  <div
                    key={slotKey}
                    className="p-2.5 rounded-xl bg-dungeon-850 border border-dungeon-700/80 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center border font-bold text-xs"
                        style={{
                          backgroundColor: rarity ? rarity.bg : 'rgba(255,255,255,0.05)',
                          borderColor: rarity ? rarity.border : '#3a4e6e',
                          color: rarity ? rarity.color : '#94a3b8'
                        }}
                      >
                        {slotKey === 'weapon' ? <Sword size={18} /> : slotKey === 'armor' ? <Shield size={18} /> : <Sparkles size={18} />}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-white">
                            {item ? item.name : `Kosong (${slotKey})`}
                          </span>
                          {rarity && (
                            <span
                              className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase"
                              style={{ backgroundColor: rarity.border, color: '#ffffff' }}
                            >
                              {rarity.name}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-slate-400">
                          {item ? item.desc : 'Belum ada item yang terpasang.'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bag Inventory */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-fantasy">
                Isi Tas ({inventory.length}/20)
              </h3>
              <span className="text-[10px] text-slate-500">Tap item untuk Pasang atau Jual</span>
            </div>

            {inventory.length === 0 ? (
              <div className="p-6 text-center rounded-2xl bg-black/20 border border-dashed border-dungeon-700 text-slate-500 text-xs">
                Tas kosong. Jelajahi dungeon untuk menemukan senjata & perlengkapan langka!
              </div>
            ) : (
              <div className="space-y-2">
                {inventory.map((item, index) => {
                  const rarity = ITEM_RARITY[item.rarity] || ITEM_RARITY.common;
                  const sellValue = Math.floor((item.attack || item.defense || item.hpBonus || 20) * 3.5);

                  return (
                    <div
                      key={`${item.id}_${index}`}
                      className="p-2.5 rounded-xl bg-dungeon-850 border border-dungeon-700/80 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center border font-bold text-xs shrink-0"
                          style={{
                            backgroundColor: rarity.bg,
                            borderColor: rarity.border,
                            color: rarity.color
                          }}
                        >
                          {item.type === 'weapon' ? <Sword size={18} /> : item.type === 'armor' ? <Shield size={18} /> : <Sparkles size={18} />}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white">{item.name}</span>
                            <span
                              className="text-[9px] px-1.5 py-0.2 rounded font-black uppercase"
                              style={{ backgroundColor: rarity.border, color: '#ffffff' }}
                            >
                              {rarity.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            sound.playPotionUse();
                            onEquipItem(item, index);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[10px] uppercase flex items-center gap-1 active:scale-95 shadow-md"
                        >
                          <Check size={12} />
                          <span>Pakai</span>
                        </button>
                        <button
                          onClick={() => {
                            sound.playCoinCollect();
                            onSellItem(index, sellValue);
                          }}
                          className="p-1.5 rounded-lg bg-dungeon-700 hover:bg-blood-900/60 text-gold-400 font-bold text-[10px] flex items-center gap-1 active:scale-95 border border-dungeon-600"
                          title="Jual item"
                        >
                          <Coins size={12} />
                          <span>+{sellValue}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
