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
  Award,
  Hammer,
  AlertCircle
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
  gems,
  onEnhanceItem,
  onSocketGem
}) {
  const [activeTab, setActiveTab] = useState('equipment'); // 'equipment' | 'forge' | 'mercenary'
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedForgeSlot, setSelectedForgeSlot] = useState('weapon');
  const [forgeFeedback, setForgeFeedback] = useState(null);

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

  const currentForgeItem = equipment[selectedForgeSlot];
  const curEnhance = currentForgeItem?.enhancement || 0;
  const isMaxLevel = curEnhance >= 10;
  const enhanceGoldCost = (curEnhance + 1) * 75;
  const enhanceGemCost = curEnhance >= 6 ? 2 : (curEnhance >= 3 ? 1 : 0);
  const successRate = curEnhance < 3 ? '100%' : curEnhance < 6 ? '80%' : curEnhance < 8 ? '60%' : '40%';

  const handleEnhance = () => {
    if (!onEnhanceItem || isMaxLevel) return;
    if (gold < enhanceGoldCost || gems < enhanceGemCost) {
      setForgeFeedback({ success: false, text: 'Gold atau Gems tidak mencukupi!' });
      return;
    }
    const res = onEnhanceItem(selectedForgeSlot);
    setForgeFeedback({ success: res.success, text: res.msg });
    setTimeout(() => setForgeFeedback(null), 3500);
  };

  const handleSocket = (slotKey, socketIdx, gemType) => {
    if (!onSocketGem) return;
    if (gems < 1) {
      setForgeFeedback({ success: false, text: 'Dibutuhkan 1 Gem untuk memasang permata!' });
      return;
    }
    onSocketGem(slotKey, socketIdx, gemType);
    setForgeFeedback({ success: true, text: `Permata ${gemType.toUpperCase()} berhasil dipasang!` });
    setTimeout(() => setForgeFeedback(null), 3500);
  };

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
                {heroClass.name} • Tingkat Lv.{heroLevel} • 🪙 {gold} • 💎 {gems}
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
        <div className="flex border-b border-dungeon-800 bg-dungeon-950/60 p-1.5 gap-1.5">
          <button
            onClick={() => setActiveTab('equipment')}
            className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
              activeTab === 'equipment'
                ? 'bg-gold-500 text-black shadow-md shadow-gold-500/20'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sword size={13} />
            <span>Perlengkapan</span>
          </button>

          <button
            onClick={() => setActiveTab('forge')}
            className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
              activeTab === 'forge'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Hammer size={13} />
            <span>Pandai Besi +10</span>
          </button>

          <button
            onClick={() => setActiveTab('mercenary')}
            className={`flex-1 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider flex items-center justify-center gap-1 transition-all ${
              activeTab === 'mercenary'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={13} />
            <span>Party Minion</span>
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
                  const enh = item?.enhancement || 0;

                  return (
                    <div
                      key={s.key}
                      onClick={() => item && setSelectedItem(item)}
                      className={`p-2 rounded-xl border flex items-center gap-2 cursor-pointer transition-all relative ${
                        item
                          ? 'bg-dungeon-850/80 active:scale-95'
                          : 'bg-black/30 border-dashed border-dungeon-800 opacity-60'
                      }`}
                      style={{
                        borderColor: rarity ? rarity.border : undefined,
                        boxShadow: enh >= 9 ? '0 0 10px rgba(250, 204, 21, 0.4)' : enh >= 6 ? '0 0 8px rgba(192, 132, 252, 0.3)' : enh >= 3 ? '0 0 6px rgba(34, 197, 94, 0.3)' : undefined
                      }}
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 relative"
                        style={{
                          backgroundColor: rarity ? rarity.bg : 'rgba(255,255,255,0.05)',
                          color: rarity ? rarity.color : '#64748b'
                        }}
                      >
                        <Icon size={16} />
                        {enh > 0 && (
                          <span className={`absolute -top-1 -right-1 text-[8px] font-black px-1 rounded-full ${
                            enh >= 9 ? 'bg-gold-500 text-black' : enh >= 6 ? 'bg-purple-600 text-white' : enh >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                          }`}>
                            +{enh}
                          </span>
                        )}
                      </div>
                      <div className="overflow-hidden">
                        <span className="text-[8px] text-slate-400 uppercase font-bold block truncate">
                          {s.label.split('/')[0]}
                        </span>
                        <span className="text-[10px] font-black text-white truncate block">
                          {item ? `${enh > 0 ? `+${enh} ` : ''}${item.name}` : 'Kosong'}
                        </span>
                        {/* Gem socket dots */}
                        {item?.sockets && (
                          <div className="flex items-center gap-1 mt-0.5">
                            {item.sockets.map((g, gi) => (
                              <span
                                key={gi}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  g === 'ruby' ? 'bg-red-500 shadow-sm shadow-red-500' : g === 'sapphire' ? 'bg-blue-400 shadow-sm shadow-blue-400' : g === 'emerald' ? 'bg-green-400 shadow-sm shadow-green-400' : 'bg-slate-700'
                                }`}
                              />
                            ))}
                          </div>
                        )}
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

        {/* Tab 2: Inotia Blacksmith +10 Forge & Gem Socketing */}
        {activeTab === 'forge' && (
          <div className="p-3.5 overflow-y-auto space-y-3.5">
            {/* Slot Selector Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {slots.map(s => {
                const item = equipment[s.key];
                const isSelected = selectedForgeSlot === s.key;
                const enh = item?.enhancement || 0;

                return (
                  <button
                    key={s.key}
                    onClick={() => setSelectedForgeSlot(s.key)}
                    className={`px-2.5 py-1.5 rounded-xl border text-[10px] font-black uppercase whitespace-nowrap transition-all flex items-center gap-1 ${
                      isSelected
                        ? 'bg-amber-600 border-amber-400 text-white shadow-md shadow-amber-600/30'
                        : 'bg-dungeon-850 border-dungeon-700 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{s.label.split('/')[0]}</span>
                    {item && (
                      <span className={`text-[8px] font-black px-1 rounded ${
                        enh >= 9 ? 'bg-gold-500 text-black' : enh >= 6 ? 'bg-purple-600 text-white' : enh >= 3 ? 'bg-emerald-600 text-white' : 'bg-slate-700 text-white'
                      }`}>
                        +{enh}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Central Forge Anvil Card */}
            {currentForgeItem ? (
              <div className="p-4 rounded-2xl bg-gradient-to-b from-dungeon-850 to-black/70 border-2 border-amber-600/60 shadow-xl relative overflow-hidden space-y-3">
                {/* Aura Glow Backdrop */}
                <div
                  className="absolute -top-12 -right-12 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-20"
                  style={{
                    backgroundColor: curEnhance >= 9 ? '#facc15' : curEnhance >= 6 ? '#c084fc' : curEnhance >= 3 ? '#22c55e' : '#94a3b8'
                  }}
                />

                {/* Item Details */}
                <div className="flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl border-2 shadow-lg relative"
                    style={{
                      backgroundColor: curEnhance >= 9 ? '#facc1520' : curEnhance >= 6 ? '#c084fc20' : curEnhance >= 3 ? '#22c55e20' : '#1e293b',
                      borderColor: curEnhance >= 9 ? '#facc15' : curEnhance >= 6 ? '#c084fc' : curEnhance >= 3 ? '#22c55e' : '#64748b'
                    }}
                  >
                    {selectedForgeSlot === 'weapon' ? '⚔️' : selectedForgeSlot === 'shield' ? '🛡️' : selectedForgeSlot === 'helmet' ? '👑' : selectedForgeSlot === 'armor' ? '🥋' : selectedForgeSlot === 'boots' ? '👢' : '💍'}
                    <span className="absolute -bottom-2 -right-1 px-1.5 py-0.2 rounded-full text-[9px] font-black bg-black border border-amber-400 text-amber-300">
                      +{curEnhance}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-black text-white flex items-center gap-1.5">
                      <span>{currentForgeItem.name}</span>
                      <span className="text-[10px] text-amber-400 font-bold">
                        [{curEnhance >= 9 ? '🔥 AURA KAHYANGAN' : curEnhance >= 6 ? '⚡ AURA ARCANE' : curEnhance >= 3 ? '🌿 AURA EMERALD' : 'BIASA'}]
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Penguat Stat: <strong className="text-emerald-400">+{curEnhance * 12}%</strong>
                      {!isMaxLevel && <span className="text-gold-400"> ➜ +{(curEnhance + 1) * 12}%</span>}
                    </p>
                  </div>
                </div>

                {/* Progress Visual Bar (+0 to +10) */}
                <div>
                  <div className="flex justify-between text-[9px] font-bold text-slate-400 mb-1">
                    <span>Tingkat Tempa: +{curEnhance}/10</span>
                    <span className="text-amber-400">Peluang Sukses: {successRate}</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-black/60 border border-dungeon-700 overflow-hidden flex">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 border-r border-black/40 ${
                          i < curEnhance
                            ? i >= 8 ? 'bg-gold-400' : i >= 5 ? 'bg-purple-500' : i >= 2 ? 'bg-emerald-500' : 'bg-slate-400'
                            : 'bg-transparent'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Feedback Message */}
                {forgeFeedback && (
                  <div className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1.5 ${
                    forgeFeedback.success
                      ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-200'
                      : 'bg-blood-950/80 border border-blood-500 text-blood-200'
                  }`}>
                    <AlertCircle size={14} />
                    <span>{forgeFeedback.text}</span>
                  </div>
                )}

                {/* Upgrade Action Button */}
                <div className="pt-1">
                  <button
                    onClick={handleEnhance}
                    disabled={isMaxLevel}
                    className={`w-full py-3 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all ${
                      isMaxLevel
                        ? 'bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-600 via-gold-500 to-amber-600 text-black border border-gold-300 shadow-amber-500/25'
                    }`}
                  >
                    <Hammer size={16} />
                    <span>
                      {isMaxLevel ? 'MAKSIMAL +10 TERCAPAI' : `TEMPA KE +${curEnhance + 1} (🪙 ${enhanceGoldCost}${enhanceGemCost > 0 ? ` + 💎 ${enhanceGemCost}` : ''})`}
                    </span>
                  </button>
                </div>

                {/* Gem Socketing System */}
                <div className="pt-3 border-t border-dungeon-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase text-slate-300 flex items-center gap-1">
                      <Gem size={12} className="text-purple-400" />
                      Soket Permata ({currentForgeItem.sockets?.filter(Boolean).length || 0}/2)
                    </span>
                    <span className="text-[9px] text-slate-500">Biaya pasang: 1 Gem</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {[0, 1].map(socketIdx => {
                      const currentGem = currentForgeItem.sockets?.[socketIdx];

                      return (
                        <div key={socketIdx} className="p-2.5 rounded-xl bg-black/40 border border-dungeon-700 space-y-1.5">
                          <span className="text-[9px] font-bold text-slate-400 block">Soket #{socketIdx + 1}</span>

                          {currentGem ? (
                            <div className="flex items-center gap-1.5 p-1.5 rounded-lg bg-dungeon-800">
                              <span className="text-sm">
                                {currentGem === 'ruby' ? '🔴' : currentGem === 'sapphire' ? '🔵' : '🟢'}
                              </span>
                              <div className="overflow-hidden">
                                <span className="text-[9px] font-black text-white block uppercase">{currentGem}</span>
                                <span className="text-[8px] text-emerald-400 block font-semibold">
                                  {currentGem === 'ruby' ? '+16 Atk' : currentGem === 'sapphire' ? '+110 HP & +6 Def' : '+8% Crit'}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <span className="text-[8px] text-slate-500 block italic">Soket Kosong</span>
                              <div className="flex gap-1">
                                <button
                                  onClick={() => handleSocket(selectedForgeSlot, socketIdx, 'ruby')}
                                  className="flex-1 py-1 px-1 rounded bg-red-950/80 border border-red-700 text-red-300 text-[8px] font-bold hover:bg-red-800 active:scale-95"
                                  title="Ruby: +16 Serangan"
                                >
                                  🔴 Ruby
                                </button>
                                <button
                                  onClick={() => handleSocket(selectedForgeSlot, socketIdx, 'sapphire')}
                                  className="flex-1 py-1 px-1 rounded bg-blue-950/80 border border-blue-700 text-blue-300 text-[8px] font-bold hover:bg-blue-800 active:scale-95"
                                  title="Sapphire: +110 HP & +6 Def"
                                >
                                  🔵 Saph
                                </button>
                                <button
                                  onClick={() => handleSocket(selectedForgeSlot, socketIdx, 'emerald')}
                                  className="flex-1 py-1 px-1 rounded bg-green-950/80 border border-green-700 text-green-300 text-[8px] font-bold hover:bg-green-800 active:scale-95"
                                  title="Emerald: +8% Crit & +0.12 Spd"
                                >
                                  🟢 Emld
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-2xl bg-black/30 border border-dashed border-dungeon-800 text-slate-500 text-xs">
                Tidak ada perlengkapan yang terpasang pada slot ini.
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Mercenary Party Companions */}
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
