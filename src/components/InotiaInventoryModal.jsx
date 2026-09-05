import React, { useState } from 'react';
import { 
  X, 
  Shield, 
  Sword, 
  Sparkles, 
  Heart, 
  Zap, 
  Crosshair, 
  Check, 
  Coins, 
  Users, 
  Flame, 
  ArrowUpCircle,
  Footprints,
  Gem,
  Award
} from 'lucide-react';
import { ITEM_RARITY } from '../constants/items';
import { MERCENARIES } from '../constants/mercenaries';
import { sound } from '../engine/soundEngine';

export default function InotiaInventoryModal({
  isOpen,
  onClose,
  heroClass,
  heroLevel,
  equipment,
  inventory,
  onEquipItem,
  onSellItem,
  totalStats,
  activeMercenaryId,
  onSelectMercenary,
  gold,
  gems
}) {
  const [activeTab, setActiveTab] = useState('equipment'); // 'equipment' | 'mercenary'
  const [selectedItem, setSelectedItem] = useState(null);

  if (!isOpen) return null;

  const slots = [
    { key: 'helmet', label: 'Helm / Mahkota', icon: Award },
    { key: 'weapon', label: 'Senjata Utama', icon: Sword },
    { key: 'shield', label: 'Perisai / Offhand', icon: Shield },
    { key: 'armor', label: 'Baju Zirah', icon: Shield },
    { key: 'boots', label: 'Sepatu Boots', icon: Footprints },
    { key: 'amulet', label: 'Amulet Magis', icon: Gem },
    { key: 'ring', label: 'Cincin Jiwa', icon: Sparkles },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 animate-fade-in">
      <div className="w-full max-w-lg max-h-[92vh] bg-dungeon-900 border-2 border-dungeon-700 rounded-3xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-3.5 border-b border-dungeon-800 flex items-center justify-between bg-dungeon-950">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg border-2 shadow-lg"
              style={{ backgroundColor: `${heroClass.color}30`, borderColor: heroClass.color }}
            >
              {heroClass.avatar || '⚔️'}
            </div>
            <div>
              <h2 className="text-sm font-black font-fantasy text-white tracking-wide">
                STATUS & PERLENGKAPAN HERO
              </h2>
              <p className="text-[10px] text-gold-400 font-semibold">
                {heroClass.name} • Tingkat Lv.{heroLevel}
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
            onClick={() => setActiveTab('equipment')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'equipment'
                ? 'bg-gold-500 text-black shadow-md shadow-gold-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sword size={14} />
            <span>Perlengkapan & Tas</span>
          </button>

          <button
            onClick={() => setActiveTab('mercenary')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'mercenary'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={14} />
            <span>Rekan Tempur (Party)</span>
          </button>
        </div>

        {/* Tab 1: Inotia Paperdoll Equipment */}
        {activeTab === 'equipment' && (
          <div className="p-3.5 overflow-y-auto space-y-3.5">
            {/* Stats Dashboard */}
            <div className="p-3 rounded-2xl bg-black/50 border border-dungeon-700 grid grid-cols-4 gap-1.5 text-center">
              <div className="p-1.5 rounded-xl bg-dungeon-850">
                <span className="text-[8px] uppercase font-bold text-slate-400 block">Serangan</span>
                <span className="text-xs font-black text-blood-400 flex items-center justify-center gap-0.5">
                  <Sword size={11} /> {totalStats.attack}
                </span>
              </div>
              <div className="p-1.5 rounded-xl bg-dungeon-850">
                <span className="text-[8px] uppercase font-bold text-slate-400 block">Pertahanan</span>
                <span className="text-xs font-black text-cyan-400 flex items-center justify-center gap-0.5">
                  <Shield size={11} /> {totalStats.defense}
                </span>
              </div>
              <div className="p-1.5 rounded-xl bg-dungeon-850">
                <span className="text-[8px] uppercase font-bold text-slate-400 block">Critical</span>
                <span className="text-xs font-black text-gold-400 flex items-center justify-center gap-0.5">
                  <Crosshair size={11} /> {Math.round(totalStats.critChance * 100)}%
                </span>
              </div>
              <div className="p-1.5 rounded-xl bg-dungeon-850">
                <span className="text-[8px] uppercase font-bold text-slate-400 block">Max HP</span>
                <span className="text-xs font-black text-emerald-400 flex items-center justify-center gap-0.5">
                  <Heart size={11} /> {totalStats.maxHp}
                </span>
              </div>
            </div>

            {/* Paperdoll Visual Layout */}
            <div className="bg-dungeon-950 p-3 rounded-2xl border border-dungeon-800">
              <span className="text-[10px] font-black uppercase text-slate-400 font-fantasy block mb-2">
                Slot Paperdoll Tubuh Karakter
              </span>

              <div className="grid grid-cols-3 gap-2">
                {slots.map(s => {
                  const item = equipment[s.key];
                  const rarity = item ? ITEM_RARITY[item.rarity] || ITEM_RARITY.common : null;
                  const Icon = s.icon;

                  return (
                    <div
                      key={s.key}
                      onClick={() => item && setSelectedItem(item)}
                      className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                        item
                          ? 'bg-dungeon-850/80 active:scale-95'
                          : 'bg-black/30 border-dashed border-dungeon-800 opacity-60'
                      }`}
                      style={{
                        borderColor: rarity ? rarity.border : undefined,
                        boxShadow: rarity && item.rarity === 'legendary' ? '0 0 10px rgba(250, 204, 21, 0.3)' : undefined
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{
                          backgroundColor: rarity ? rarity.bg : 'rgba(255,255,255,0.05)',
                          color: rarity ? rarity.color : '#64748b'
                        }}
                      >
                        <Icon size={16} />
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[8px] text-slate-400 uppercase font-bold block truncate">
                          {s.label.split('/')[0]}
                        </span>
                        <span className="text-[10px] font-black text-white truncate block">
                          {item ? item.name : 'Kosong'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inventory Bag */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black uppercase text-slate-400 font-fantasy">
                  Tas Penyimpanan ({inventory.length}/24)
                </span>
                <span className="text-[9px] text-slate-500">Pilih item untuk pasang atau jual</span>
              </div>

              {inventory.length === 0 ? (
                <div className="p-6 text-center rounded-2xl bg-black/30 border border-dashed border-dungeon-800 text-slate-500 text-xs">
                  Tas kosong. Kalahkan monster di dungeon atau hadapi invasi musuh di Sanctuary untuk mendapatkan loot legendaris!
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {inventory.map((item, index) => {
                    const rarity = ITEM_RARITY[item.rarity] || ITEM_RARITY.common;
                    const sellVal = Math.floor((item.attack || item.defense || 20) * 3);

                    return (
                      <div
                        key={`${item.id}_${index}`}
                        className="p-2.5 rounded-xl bg-dungeon-850 border flex flex-col justify-between gap-2 shadow-sm relative overflow-hidden"
                        style={{ borderColor: rarity.border }}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-black text-white truncate">{item.name}</span>
                            <span
                              className="text-[8px] px-1 rounded font-black uppercase shrink-0"
                              style={{ backgroundColor: rarity.border, color: '#000' }}
                            >
                              {rarity.name}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 line-clamp-2 leading-tight">
                            {item.desc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-1 border-t border-dungeon-800">
                          <button
                            onClick={() => {
                              sound.playEquipItem();
                              onEquipItem(item, index);
                            }}
                            className="px-2 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[9px] uppercase flex items-center gap-1 active:scale-95 shadow-sm"
                          >
                            <Check size={10} />
                            <span>Pasang</span>
                          </button>

                          <button
                            onClick={() => {
                              sound.playCoinCollect();
                              onSellItem(index, sellVal);
                            }}
                            className="px-2 py-1 rounded-lg bg-black/40 text-gold-400 font-bold text-[9px] flex items-center gap-0.5 border border-dungeon-700 active:scale-95"
                          >
                            <Coins size={10} />
                            <span>+{sellVal}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Mercenary Party Companions */}
        {activeTab === 'mercenary' && (
          <div className="p-3.5 overflow-y-auto space-y-3">
            <div className="p-3 rounded-2xl bg-purple-950/40 border border-purple-800/50 flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-purple-600/30 border border-purple-500 flex items-center justify-center text-purple-300 shrink-0">
                <Users size={20} />
              </div>
              <div>
                <h3 className="text-xs font-black text-white font-fantasy">SISTEM PARTY MINION INOTIA</h3>
                <p className="text-[10px] text-slate-300 leading-snug">
                  Pilih 1 rekan minion untuk menemani Anda bertarung di dalam dungeon liar. Rekan akan otomatis menyerang musuh di samping Anda!
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {MERCENARIES.map(merc => {
                const isActive = activeMercenaryId === merc.id;

                return (
                  <div
                    key={merc.id}
                    className={`p-4 rounded-2xl border-2 transition-all relative overflow-hidden ${
                      isActive
                        ? 'bg-dungeon-800 border-purple-500 shadow-xl shadow-purple-900/30'
                        : 'bg-dungeon-850 border-dungeon-700/80 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl border-2 shadow-lg"
                          style={{
                            backgroundColor: `${merc.color}25`,
                            borderColor: merc.color
                          }}
                        >
                          {merc.avatar}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-black text-white">{merc.name}</h4>
                            {isActive && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-600 text-white flex items-center gap-1">
                                <Check size={10} /> Anggota Party Aktif
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-purple-300 font-bold block">{merc.title}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 mt-2 leading-relaxed">{merc.desc}</p>

                    {/* Stats & Special Skill */}
                    <div className="grid grid-cols-3 gap-2 my-2.5 p-2 rounded-xl bg-black/40 text-center text-[10px]">
                      <div>
                        <span className="text-slate-400 block font-bold">HP</span>
                        <span className="font-black text-emerald-400">{merc.maxHp}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">Serangan</span>
                        <span className="font-black text-blood-400">{merc.attack}</span>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-bold">Skill Jurus</span>
                        <span className="font-black text-gold-400 truncate block">{merc.skillName}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] text-slate-400 font-medium">
                        Jurus: <strong className="text-white">{merc.skillDesc}</strong>
                      </span>

                      <button
                        onClick={() => {
                          sound.playLevelUp();
                          onSelectMercenary(merc.id);
                        }}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md active:scale-95 ${
                          isActive
                            ? 'bg-purple-600 text-white cursor-default'
                            : 'bg-gold-500 hover:bg-gold-400 text-black shadow-gold-500/20'
                        }`}
                      >
                        {isActive ? 'Sedang Dipakai' : 'Pilih ke Party'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
