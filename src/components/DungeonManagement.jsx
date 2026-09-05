import React, { useState } from 'react';
import { 
  Crown, 
  Coins, 
  Skull, 
  Hammer, 
  FlaskConical, 
  Zap, 
  ArrowUpCircle, 
  Play, 
  Sparkles, 
  ShieldAlert,
  Swords,
  Map,
  ListFilter,
  Award,
  Volume2
} from 'lucide-react';
import { DUNGEON_ROOMS_TEMPLATE } from '../constants/rooms';
import { HERO_CLASSES } from '../constants/classes';
import DungeonSanctuaryMap from './DungeonSanctuaryMap';
import { sound } from '../engine/soundEngine';

export default function DungeonManagement({
  gameState,
  heroClass,
  onUpgradeRoom,
  onClaimPassiveIncome,
  onStartAdventure,
  onOpenInventory,
  onOpenClassSelect,
  onOpenTalentTree,
  onOpenAudioSettings,
  onUpdateGrid,
  onAddSanctuaryRewards,
  onAddLoot
}) {
  const { gold, gems, rooms, unclaimedGold, heroLevel, gridState } = gameState;
  const activeHero = heroClass || HERO_CLASSES[gameState?.heroClassId] || HERO_CLASSES.warrior;

  const [managementView, setManagementView] = useState('map'); // 'map' | 'facilities'

  const iconMap = {
    Crown,
    Coins,
    Skull,
    Hammer,
    FlaskConical,
    Zap
  };

  const handleClaim = () => {
    if (unclaimedGold <= 0) return;
    sound.playCoinCollect();
    onClaimPassiveIncome();
  };

  const handleUpgrade = (roomId) => {
    const room = rooms.find(r => r.id === roomId);
    if (!room) return;

    const goldCost = Math.floor(room.baseGoldCost * Math.pow(room.costMultiplier, room.level - 1));
    const gemCost = room.baseGemCost * room.level;

    if (gold < goldCost || gems < gemCost) {
      sound.playAttackMelee();
      return;
    }

    sound.playLevelUp();
    onUpgradeRoom(roomId, goldCost, gemCost);
  };

  // Calculate total passive gold per second
  const vaultCount = gridState ? gridState.filter(c => c === 'vault').length : 1;
  const goldPerSec = Math.max(3.0, vaultCount * 4.0);

  return (
    <div className="w-full h-full flex flex-col bg-gradient-to-b from-dungeon-950 via-dungeon-900 to-dungeon-950 text-slate-100 overflow-y-auto pb-24">
      {/* Header Bar */}
      <div className="sticky top-0 z-30 bg-dungeon-950/95 backdrop-blur-md border-b border-dungeon-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-700 to-amber-500 flex items-center justify-center shadow-lg shadow-purple-900/30">
            <Crown size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-fantasy font-black text-sm tracking-wide text-gold-400">
              DUNGEON SANCTUARY
            </h1>
            <p className="text-[10px] text-slate-400 font-medium">
              Penguasa: <span className="text-white font-bold">{activeHero.name} (Lv.{heroLevel})</span>
            </p>
          </div>
        </div>

        {/* Currency Pill */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-black/60 border border-gold-600/40 px-2.5 py-1 rounded-full text-xs font-black text-gold-400 shadow-inner">
            <Coins size={14} className="text-gold-400" />
            <span>{Math.floor(gold).toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1 bg-black/60 border border-purple-500/40 px-2.5 py-1 rounded-full text-xs font-black text-purple-300 shadow-inner">
            <Sparkles size={14} className="text-purple-400" />
            <span>{gems}</span>
          </div>
          {onOpenAudioSettings && (
            <button
              onClick={onOpenAudioSettings}
              className="w-7 h-7 rounded-full bg-dungeon-850 border border-dungeon-700 hover:border-gold-500/60 text-slate-300 hover:text-white flex items-center justify-center active:scale-95 shadow-md transition-all"
              title="Pengaturan Suara & Audio"
            >
              <Volume2 size={13} />
            </button>
          )}
        </div>
      </div>

      <div className="p-4 max-w-lg mx-auto w-full space-y-4">
        {/* Passive Income Claim Banner */}
        <div className="rounded-2xl p-4 bg-gradient-to-r from-amber-950/50 via-dungeon-850 to-amber-950/40 border border-gold-600/40 shadow-xl flex items-center justify-between relative overflow-hidden">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-bold text-gold-300 uppercase tracking-wide">
                Pendapatan Tambang Goblin
              </span>
            </div>
            <div className="text-2xl font-black font-fantasy text-white flex items-center gap-1">
              +{Math.floor(unclaimedGold)} <span className="text-xs text-gold-400 font-mono">Gold Siap Klaim</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Menghasilkan <span className="text-gold-400 font-bold">+{goldPerSec.toFixed(1)} gold/detik</span> dari {vaultCount} tambang aktif.
            </p>
          </div>

          <button
            onClick={handleClaim}
            disabled={unclaimedGold <= 0}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-tr from-gold-600 to-amber-400 hover:from-gold-500 hover:to-amber-300 text-black font-black text-xs uppercase tracking-wider shadow-lg shadow-gold-600/30 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
          >
            Klaim Gold
          </button>
        </div>

        {/* Hero Quick Navigation Cards */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onOpenInventory}
            className="p-2.5 rounded-2xl bg-dungeon-850 border border-dungeon-700/70 hover:border-slate-500 active:scale-98 transition-all flex flex-col items-center text-center gap-1.5 shadow-md"
          >
            <div className="w-8 h-8 rounded-xl bg-blood-600/20 border border-blood-500/40 flex items-center justify-center text-blood-400">
              <Hammer size={16} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-white block leading-tight">Tas & Party</span>
              <span className="text-[9px] text-slate-400">7 Slot</span>
            </div>
          </button>

          <button
            onClick={onOpenTalentTree}
            className="p-2.5 rounded-2xl bg-dungeon-850 border border-gold-500/40 hover:border-gold-400 active:scale-98 transition-all flex flex-col items-center text-center gap-1.5 relative shadow-md shadow-gold-500/10"
          >
            {(gameState.talentPoints || 0) > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-black text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce border border-yellow-200">
                {gameState.talentPoints}
              </span>
            )}
            <div className="w-8 h-8 rounded-xl bg-gold-600/20 border border-gold-500/40 flex items-center justify-center text-gold-400">
              <Award size={16} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-gold-300 block leading-tight">Pohon Bakat</span>
              <span className="text-[9px] text-slate-400">3 Cabang</span>
            </div>
          </button>

          <button
            onClick={onOpenClassSelect}
            className="p-2.5 rounded-2xl bg-dungeon-850 border border-dungeon-700/70 hover:border-slate-500 active:scale-98 transition-all flex flex-col items-center text-center gap-1.5 shadow-md"
          >
            <div className="w-8 h-8 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
              <Crown size={16} />
            </div>
            <div>
              <span className="text-[11px] font-bold text-white block leading-tight">Ganti Kelas</span>
              <span className="text-[9px] text-slate-400">3 Class</span>
            </div>
          </button>
        </div>

        {/* Big Start Adventure Button */}
        <button
          onClick={onStartAdventure}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-blood-600 via-amber-600 to-blood-600 hover:brightness-110 text-white font-fantasy font-black text-sm sm:text-base uppercase tracking-wider shadow-2xl shadow-blood-600/40 active:scale-98 transition-all flex items-center justify-center gap-3 border border-amber-400/50"
        >
          <Play size={22} className="fill-white" />
          <span>EKSPEDISI DUNGEON LIAR (ACTION RPG INOTIA)</span>
        </button>

        {/* Section Mode Switcher: Visual Map vs Room Facilities */}
        <div className="flex bg-dungeon-950 p-1.5 rounded-2xl border border-dungeon-800 gap-2">
          <button
            onClick={() => setManagementView('map')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              managementView === 'map'
                ? 'bg-gold-500 text-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Map size={14} />
            <span>Peta Visual & Invasi Petualang</span>
          </button>

          <button
            onClick={() => setManagementView('facilities')}
            className={`flex-1 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all ${
              managementView === 'facilities'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListFilter size={14} />
            <span>Upgrade Ruangan</span>
          </button>
        </div>

        {/* View 1: Visual Interactive Grid Map with NPC Invaders */}
        {managementView === 'map' && (
          <DungeonSanctuaryMap
            gridState={gridState}
            onUpdateGrid={onUpdateGrid}
            gold={gold}
            gems={gems}
            onAddRewards={onAddSanctuaryRewards}
            onAddLoot={onAddLoot}
            heroClass={activeHero}
          />
        )}

        {/* View 2: Detailed Room Upgrades */}
        {managementView === 'facilities' && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-black uppercase tracking-wider text-slate-400 font-fantasy">
                Fasilitas & Kamar Khusus ({rooms.length})
              </h2>
              <span className="text-[10px] text-slate-500">Upgrade level kamar utama</span>
            </div>

            <div className="space-y-3">
              {rooms.map((room) => {
                const IconComponent = iconMap[room.icon] || Crown;
                const goldCost = Math.floor(room.baseGoldCost * Math.pow(room.costMultiplier, room.level - 1));
                const gemCost = room.baseGemCost * room.level;
                const canAfford = gold >= goldCost && gems >= gemCost;

                return (
                  <div
                    key={room.id}
                    className="rounded-2xl p-4 bg-dungeon-850/80 border border-dungeon-700/80 shadow-md space-y-3 relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-11 h-11 rounded-xl flex items-center justify-center shadow-md shrink-0"
                          style={{
                            backgroundColor: `${room.color}20`,
                            border: `1.5px solid ${room.color}50`,
                            color: room.color
                          }}
                        >
                          <IconComponent size={22} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-black text-white">{room.name}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-dungeon-700 text-gold-400 border border-dungeon-600">
                              Lv.{room.level}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 leading-snug mt-0.5">
                            {room.desc}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-black/40 border border-dungeon-700/50 text-[11px] text-emerald-400 font-medium">
                      ✨ Efek: {(() => {
                        const tpl = DUNGEON_ROOMS_TEMPLATE.find(t => t.id === room.id) || room;
                        if (typeof tpl.effectDesc === 'function') return tpl.effectDesc(room.level);
                        if (typeof room.effectDesc === 'function') return room.effectDesc(room.level);
                        return 'Meningkatkan kekuatan dungeon.';
                      })()}
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Biaya:</span>
                        <div className="flex items-center gap-1 text-xs font-black text-gold-400">
                          <Coins size={13} />
                          <span>{goldCost.toLocaleString()}</span>
                        </div>
                        {gemCost > 0 && (
                          <div className="flex items-center gap-1 text-xs font-black text-purple-300 ml-1">
                            <Sparkles size={13} />
                            <span>{gemCost}</span>
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleUpgrade(room.id)}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md active:scale-95 ${
                          canAfford
                            ? 'bg-gold-500 hover:bg-gold-400 text-black shadow-gold-500/20'
                            : 'bg-dungeon-700 text-slate-500 cursor-not-allowed opacity-60'
                        }`}
                      >
                        <ArrowUpCircle size={14} />
                        <span>Upgrade</span>
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
