import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ArrowLeft,
  Shield,
  Flame,
  Gem,
  Coins,
  FlaskConical,
  Hammer,
  Zap,
  Swords,
  Plus,
  Check,
  X,
  AlertTriangle,
  Award
} from 'lucide-react';
import { SFX } from '../game/audio/sfx';

export type RoomType = 'empty' | 'core' | 'vault' | 'den' | 'forge' | 'alchemy' | 'trap';

export interface GridTile {
  index: number;
  type: RoomType;
  level: number;
  unclaimedGold: number;
  unclaimedPotions: number;
}

interface Props {
  gold: number;
  coreCrystals: number;
  potions: number;
  onUpdateCurrency: (goldDelta: number, crystalDelta: number, potionDelta: number) => void;
  onBackToTown: () => void;
}

const TOTAL_TILES = 48; // 8 Kolom x 6 Baris (GDD §4 Mode 2)

// Initial default grid setup with Jantung Dungeon in the center
const createDefaultGrid = (): GridTile[] => {
  const grid: GridTile[] = [];
  for (let i = 0; i < TOTAL_TILES; i++) {
    // Tile 19 & 20 are center: Core and initial Vault
    if (i === 19) {
      grid.push({ index: i, type: 'core', level: 1, unclaimedGold: 0, unclaimedPotions: 0 });
    } else if (i === 20) {
      grid.push({ index: i, type: 'vault', level: 1, unclaimedGold: 15, unclaimedPotions: 0 });
    } else if (i === 11) {
      grid.push({ index: i, type: 'den', level: 1, unclaimedGold: 0, unclaimedPotions: 0 });
    } else if (i === 27) {
      grid.push({ index: i, type: 'trap', level: 1, unclaimedGold: 0, unclaimedPotions: 0 });
    } else {
      grid.push({ index: i, type: 'empty', level: 0, unclaimedGold: 0, unclaimedPotions: 0 });
    }
  }
  return grid;
};

export default function DungeonSanctuary({
  gold,
  coreCrystals,
  potions,
  onUpdateCurrency,
  onBackToTown
}: Props) {
  const [grid, setGrid] = useState<GridTile[]>(() => {
    try {
      const saved = localStorage.getItem('EMBERDEEP_SANCTUARY_GRID');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === TOTAL_TILES) {
          return parsed;
        }
      }
    } catch (e) {}
    return createDefaultGrid();
  });

  const [selectedTile, setSelectedTile] = useState<GridTile | null>(null);
  const [showBuildModal, setShowBuildModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [invaderReport, setInvaderReport] = useState<{
    victory: boolean;
    rewardGold: number;
    rewardCrystal: number;
    log: string[];
  } | null>(null);

  // Save grid whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('EMBERDEEP_SANCTUARY_GRID', JSON.stringify(grid));
    } catch (e) {}
  }, [grid]);

  // Passive Revenue Generation Ticker (Every 4 seconds)
  useEffect(() => {
    const timer = setInterval(() => {
      setGrid((prevGrid) =>
        prevGrid.map((tile) => {
          if (tile.type === 'vault') {
            return {
              ...tile,
              unclaimedGold: Math.min(100, tile.unclaimedGold + tile.level * 2)
            };
          }
          if (tile.type === 'alchemy') {
            return {
              ...tile,
              unclaimedPotions: Math.min(3, tile.unclaimedPotions + (Math.random() > 0.6 ? 1 : 0))
            };
          }
          return tile;
        })
      );
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  // Room metadata & build specs
  const roomDefs = {
    core: {
      name: 'Jantung Dungeon (Core)',
      icon: Gem,
      color: 'text-purple-400',
      bg: 'from-purple-950/90 to-indigo-950/90 border-purple-500/80',
      desc: 'Pusat kristal kehidupan dungeon. Memancarkan aura pelindung dan mempertebal status Hero.',
      costGold: 0,
      costCrystal: 2,
      benefit: '+50 Max HP & +20% Defense Hero'
    },
    vault: {
      name: 'Ruang Simpanan Goblin (Gold Vault)',
      icon: Coins,
      color: 'text-yellow-400',
      bg: 'from-amber-950/80 to-yellow-950/80 border-amber-500/80',
      desc: 'Menimbun emas rampasan minion. Menghasilkan Gold pasif setiap beberapa detik.',
      costGold: 60,
      costCrystal: 0,
      benefit: '+2 Gold / 4 detik'
    },
    den: {
      name: 'Sarang Monster Minion (Monster Den)',
      icon: Flame,
      color: 'text-emerald-400',
      bg: 'from-emerald-950/80 to-teal-950/80 border-emerald-500/80',
      desc: 'Membiakkan minion penjaga (Goblin & Slime) untuk menghadang penjelajah luar.',
      costGold: 90,
      costCrystal: 1,
      benefit: '+2 Minion Penjaga & Produksi Kristal'
    },
    forge: {
      name: 'Ruang Tempa Obsidian (Forge)',
      icon: Hammer,
      color: 'text-red-400',
      bg: 'from-red-950/80 to-rose-950/80 border-red-500/80',
      desc: 'Bengkel tempa api hitam. Memperkuat senjata tajam dan kemampuan serang hero.',
      costGold: 110,
      costCrystal: 1,
      benefit: '+15% Damage Serangan Hero di Dungeon'
    },
    alchemy: {
      name: 'Kuali Alkimia (Alchemy Lab)',
      icon: FlaskConical,
      color: 'text-cyan-400',
      bg: 'from-cyan-950/80 to-blue-950/80 border-cyan-500/80',
      desc: 'Meracik ramuan gaib secara otomatis. Menyediakan stok Potion penyembuh ekstra.',
      costGold: 70,
      costCrystal: 0,
      benefit: 'Meracik 1 Potion gratis secara berkala'
    },
    trap: {
      name: 'Ruang Perangkap Duri (Trap Chamber)',
      icon: Zap,
      color: 'text-orange-400',
      bg: 'from-orange-950/80 to-amber-950/80 border-orange-500/80',
      desc: 'Lantai perangkap duri dan batu jatuh untuk melumpuhkan penyerang kerajaan.',
      costGold: 50,
      costCrystal: 0,
      benefit: '+30 Pertahanan vs Serbuan Invader'
    }
  };

  // Calculate overall dungeon statistics
  const coreTile = grid.find((t) => t.type === 'core');
  const coreLevel = coreTile ? coreTile.level : 1;
  const builtCount = grid.filter((t) => t.type !== 'empty').length;
  const totalTraps = grid.filter((t) => t.type === 'trap').reduce((acc, t) => acc + t.level * 30, 0);
  const totalMinions = grid.filter((t) => t.type === 'den').reduce((acc, t) => acc + t.level * 25, 0);
  const totalDefense = 50 + totalTraps + totalMinions + coreLevel * 20;

  // Unclaimed totals
  const totalUnclaimedGold = grid.reduce((sum, t) => sum + t.unclaimedGold, 0);
  const totalUnclaimedPotions = grid.reduce((sum, t) => sum + t.unclaimedPotions, 0);

  const handleTileClick = (tile: GridTile) => {
    SFX.uiTap();
    setSelectedTile(tile);
    if (tile.type === 'empty') {
      setShowBuildModal(true);
    } else {
      setShowRoomModal(true);
    }
  };

  // Build a new room on an empty tile
  const handleBuild = (roomType: RoomType) => {
    if (!selectedTile || roomType === 'empty') return;
    const def = roomDefs[roomType];
    if (gold < def.costGold || coreCrystals < def.costCrystal) return;

    onUpdateCurrency(-def.costGold, -def.costCrystal, 0);
    SFX.door();

    setGrid((prev) =>
      prev.map((t) =>
        t.index === selectedTile.index
          ? { ...t, type: roomType, level: 1, unclaimedGold: 0, unclaimedPotions: 0 }
          : t
      )
    );

    setShowBuildModal(false);
    setSelectedTile(null);
  };

  // Upgrade an existing room
  const handleUpgrade = () => {
    if (!selectedTile || selectedTile.type === 'empty') return;
    const def = roomDefs[selectedTile.type];
    const upgradeCostGold = selectedTile.level * 60;
    const upgradeCostCrystal = selectedTile.type === 'core' ? 1 : 0;

    if (gold < upgradeCostGold || coreCrystals < upgradeCostCrystal) return;

    onUpdateCurrency(-upgradeCostGold, -upgradeCostCrystal, 0);
    SFX.levelUp();

    setGrid((prev) =>
      prev.map((t) =>
        t.index === selectedTile.index ? { ...t, level: t.level + 1 } : t
      )
    );

    setShowRoomModal(false);
    setSelectedTile(null);
  };

  // Demolish a room
  const handleDemolish = () => {
    if (!selectedTile || selectedTile.type === 'empty' || selectedTile.type === 'core') return;

    onUpdateCurrency(25, 0, 0); // 25 gold salvage refund
    SFX.hitStone();

    setGrid((prev) =>
      prev.map((t) =>
        t.index === selectedTile.index
          ? { ...t, type: 'empty', level: 0, unclaimedGold: 0, unclaimedPotions: 0 }
          : t
      )
    );

    setShowRoomModal(false);
    setSelectedTile(null);
  };

  // Claim all accumulated passive loot
  const handleClaimAll = () => {
    if (totalUnclaimedGold === 0 && totalUnclaimedPotions === 0) return;

    SFX.coin();
    onUpdateCurrency(totalUnclaimedGold, 0, totalUnclaimedPotions);

    setGrid((prev) =>
      prev.map((t) => ({
        ...t,
        unclaimedGold: 0,
        unclaimedPotions: 0
      }))
    );
  };

  // Trigger Invader Defense Simulation (GDD §4 Mode 2)
  const handleSimulateInvaders = () => {
    SFX.bossRoar();
    const invaderStrength = 80 + Math.floor(Math.random() * 60);
    const victory = totalDefense >= invaderStrength;

    const rewardGold = victory ? 120 + Math.floor(Math.random() * 80) : 30;
    const rewardCrystal = victory ? 1 : 0;

    if (victory) {
      onUpdateCurrency(rewardGold, rewardCrystal, 0);
    }

    setInvaderReport({
      victory,
      rewardGold,
      rewardCrystal,
      log: [
        `⚔️ 4 Petualang Kerajaan mencoba menerobos Gerbang Kuil!`,
        `⚡ Kekuatan Penyerang: ${invaderStrength} Poin Tempur.`,
        `🛡️ Pertahanan Dungeon Anda: ${totalDefense} Poin (Jebakan + Minion + Core).`,
        victory
          ? `🏆 Perangkap duri melumpuhkan barisan depan dan minion menghabisi sisa penyerang!`
          : `⚠️ Pertahanan tertembus sebagian! Bangun lebih banyak Perangkap Duri dan Sarang Minion!`
      ]
    });
  };

  return (
    <div className="fixed inset-0 z-40 flex flex-col justify-between p-3 sm:p-5 select-none overflow-hidden font-sans bg-[#08090f]">
      {/* Background Image of Player's Sanctuary */}
      <div
        className="absolute inset-0 bg-cover bg-center -z-20 opacity-30 scale-105"
        style={{ backgroundImage: "url('/backgrounds/emberdeep_sanctuary.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/90 -z-10" />

      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between pt-1">
        <button
          onClick={onBackToTown}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/70 border border-slate-700 text-slate-200 text-xs font-bold hover:text-amber-400 active:scale-95 transition-all backdrop-blur-md"
        >
          <ArrowLeft size={15} />
          <span>Kembali ke Kota</span>
        </button>

        {/* Currency Badges */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-black/70 border border-amber-500/50 shadow-md backdrop-blur-md">
            <Coins size={13} className="text-yellow-400" />
            <span className="text-xs font-black text-amber-300 font-mono">{gold}</span>
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-950/80 border border-purple-500/60 shadow-md backdrop-blur-md">
            <Gem size={13} className="text-purple-400 animate-pulse" />
            <span className="text-xs font-black text-purple-200 font-mono">{coreCrystals}</span>
          </div>
        </div>
      </div>

      {/* Header Info & Passive Claim Banner */}
      <div className="max-w-md mx-auto w-full text-center space-y-1 mt-1">
        <div className="flex items-center justify-center gap-2">
          <Sparkles size={14} className="text-purple-400" />
          <h1 className="text-lg sm:text-xl font-black font-fantasy text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-amber-300 to-purple-400 tracking-wide uppercase">
            PENGELOLAAN SANCTUARY (48 PETAK)
          </h1>
        </div>

        {/* Quick Stats Summary */}
        <div className="flex items-center justify-center gap-3 text-[10px] text-slate-300 font-mono">
          <span className="text-purple-300">Inti Lv.{coreLevel}</span>
          <span>•</span>
          <span className="text-emerald-300">Ruangan: {builtCount}/48</span>
          <span>•</span>
          <span className="text-amber-300">🛡️ Defense: {totalDefense}</span>
        </div>

        {/* Claim Loot Action Bar */}
        {(totalUnclaimedGold > 0 || totalUnclaimedPotions > 0) && (
          <button
            onClick={handleClaimAll}
            className="w-full py-1.5 px-3 rounded-xl bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black font-black text-[11px] uppercase font-fantasy active:scale-95 shadow-md flex items-center justify-center gap-2 border border-yellow-200 animate-bounce"
          >
            <Coins size={13} />
            <span>KLAIM HASIL PASIF: +{totalUnclaimedGold} Gold {totalUnclaimedPotions > 0 ? `• +${totalUnclaimedPotions} Potion` : ''}</span>
          </button>
        )}
      </div>

      {/* 48-Tile Interactive Dungeon Grid (8 Columns x 6 Rows) */}
      <div className="my-auto max-w-md mx-auto w-full p-2 rounded-2xl bg-black/75 border border-purple-500/40 backdrop-blur-md shadow-2xl shadow-purple-950/40">
        <div className="grid grid-cols-8 gap-1.5 sm:gap-2">
          {grid.map((tile) => {
            const isCore = tile.type === 'core';
            const isEmpty = tile.type === 'empty';
            const def = !isEmpty ? roomDefs[tile.type as Exclude<RoomType, 'empty'>] : null;
            const Icon = def ? def.icon : Plus;

            return (
              <button
                key={tile.index}
                onClick={() => handleTileClick(tile)}
                className={`relative aspect-square rounded-xl border flex flex-col items-center justify-center p-0.5 transition-all active:scale-90 shadow-sm ${
                  isEmpty
                    ? 'border-slate-800 bg-slate-950/60 hover:border-purple-500/50 hover:bg-purple-950/20 text-slate-600'
                    : isCore
                    ? 'border-purple-400 bg-gradient-to-b from-purple-900/90 to-indigo-950/90 text-purple-200 shadow-purple-900/60 shadow-md animate-pulse'
                    : `bg-gradient-to-b ${def?.bg} text-slate-100`
                }`}
                title={def?.name || `Petak Kosong #${tile.index + 1}`}
              >
                <Icon size={14} className={def ? def.color : 'text-slate-500'} />
                {!isEmpty && (
                  <span className="text-[7px] font-black font-mono leading-none mt-0.5 text-slate-300">
                    L.{tile.level}
                  </span>
                )}
                {/* Loot Ready Dot Indicator */}
                {tile.unclaimedGold > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom Action Footer */}
      <div className="max-w-md mx-auto w-full space-y-2 pb-1">
        <button
          onClick={handleSimulateInvaders}
          className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 via-orange-600 to-amber-600 text-white font-black text-xs uppercase font-fantasy active:scale-95 shadow-lg shadow-red-950/50 flex items-center justify-center gap-2 border border-red-400"
        >
          <Swords size={15} />
          <span>SIMULASI PERTAHANAN INVADER (SERANGAN MUSUH)</span>
        </button>
      </div>

      {/* MODAL 1: Build New Room Selection */}
      {showBuildModal && selectedTile && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#121622] border-2 border-purple-500/70 rounded-3xl p-5 space-y-3 relative shadow-2xl max-h-[85vh] overflow-y-auto">
            <button
              onClick={() => setShowBuildModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Plus size={18} className="text-purple-400" />
              <h2 className="text-sm font-black font-fantasy text-purple-300 uppercase">
                BANGUN RUANGAN DI PETAK #{selectedTile.index + 1}
              </h2>
            </div>

            {/* List of buildable rooms */}
            <div className="space-y-2">
              {(Object.keys(roomDefs) as RoomType[])
                .filter((key) => key !== 'core' && key !== 'empty')
                .map((key) => {
                  const def = roomDefs[key];
                  const Icon = def.icon;
                  const canAfford = gold >= def.costGold && coreCrystals >= def.costCrystal;

                  return (
                    <button
                      key={key}
                      disabled={!canAfford}
                      onClick={() => handleBuild(key)}
                      className={`w-full p-2.5 rounded-2xl border flex items-center justify-between text-left transition-all active:scale-95 ${
                        canAfford
                          ? 'border-purple-500/40 bg-black/50 hover:bg-purple-950/40'
                          : 'border-slate-800 bg-black/30 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-black/60 border border-slate-800">
                          <Icon size={16} className={def.color} />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-black text-slate-100 font-fantasy block truncate">
                            {def.name}
                          </span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            {def.benefit}
                          </span>
                        </div>
                      </div>

                      {/* Cost Badge */}
                      <div className="text-right flex-shrink-0 font-mono text-[10px]">
                        {def.costGold > 0 && (
                          <div className="text-amber-400 font-bold">{def.costGold} Gold</div>
                        )}
                        {def.costCrystal > 0 && (
                          <div className="text-purple-400 font-bold">{def.costCrystal} Kristal</div>
                        )}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Room Inspection & Upgrade / Demolish */}
      {showRoomModal && selectedTile && selectedTile.type !== 'empty' && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#121622] border-2 border-purple-500/70 rounded-3xl p-5 space-y-3 relative shadow-2xl">
            <button
              onClick={() => setShowRoomModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X size={18} />
            </button>

            {(() => {
              const def = roomDefs[selectedTile.type as Exclude<RoomType, 'empty'>];
              const Icon = def.icon;
              const isCore = selectedTile.type === 'core';
              const upgradeCostGold = selectedTile.level * 60;
              const upgradeCostCrystal = isCore ? 1 : 0;
              const canAffordUpgrade = gold >= upgradeCostGold && coreCrystals >= upgradeCostCrystal;

              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-2xl bg-purple-950/80 border border-purple-500/60">
                      <Icon size={24} className={def.color} />
                    </div>
                    <div>
                      <h2 className="text-sm font-black font-fantasy text-slate-100">
                        {def.name}
                      </h2>
                      <span className="text-[10px] font-bold text-purple-300 font-mono">
                        TINGKAT LEVEL {selectedTile.level}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 bg-black/50 p-3 rounded-2xl border border-slate-800 leading-relaxed">
                    {def.desc}
                  </p>

                  <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-500/30 text-xs text-purple-200">
                    <b>Manfaat Saat Ini:</b> {def.benefit} (Efek bertambah seiring peningkatan level).
                  </div>

                  {/* Actions: Upgrade & Demolish */}
                  <div className="space-y-2 pt-1">
                    <button
                      disabled={!canAffordUpgrade}
                      onClick={handleUpgrade}
                      className={`w-full py-2.5 rounded-xl text-xs font-black font-fantasy uppercase tracking-wider flex items-center justify-center gap-2 active:scale-95 ${
                        canAffordUpgrade
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg border border-purple-400'
                          : 'bg-black/50 text-slate-500 border border-slate-800 cursor-not-allowed'
                      }`}
                    >
                      <Sparkles size={14} />
                      <span>Upgrade ke Lv.{selectedTile.level + 1} ({upgradeCostGold} Gold {upgradeCostCrystal > 0 ? `• ${upgradeCostCrystal} Kristal` : ''})</span>
                    </button>

                    {!isCore && (
                      <button
                        onClick={handleDemolish}
                        className="w-full py-2 rounded-xl text-[11px] font-bold text-red-400 hover:text-red-300 bg-red-950/20 border border-red-900/40 active:scale-95 transition-all"
                      >
                        Bongkar Ruangan (+25 Gold Refund)
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* MODAL 3: Invader Defense Battle Report */}
      {invaderReport && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-[#141824] border-2 border-amber-500/80 rounded-3xl p-5 space-y-3 relative shadow-2xl text-center">
            <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center border-2 border-amber-400 bg-amber-950/60">
              {invaderReport.victory ? (
                <Award size={24} className="text-yellow-400 animate-bounce" />
              ) : (
                <AlertTriangle size={24} className="text-red-400 animate-pulse" />
              )}
            </div>

            <h2 className="text-base font-black font-fantasy text-amber-300 uppercase">
              {invaderReport.victory ? 'DUNGEON BERHASIL DIPERTAHANKAN!' : 'PERTAHANAN TERTEMBUS!'}
            </h2>

            <div className="text-left bg-black/60 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-[11px] text-slate-300 font-mono">
              {invaderReport.log.map((line, i) => (
                <p key={i}>{line}</p>
              ))}
            </div>

            {invaderReport.victory && (
              <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/50 text-xs font-bold text-amber-300 font-mono">
                Hadiah: +{invaderReport.rewardGold} Gold {invaderReport.rewardCrystal > 0 ? `• +${invaderReport.rewardCrystal} Kristal Inti` : ''}
              </div>
            )}

            <button
              onClick={() => setInvaderReport(null)}
              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs uppercase font-fantasy active:scale-95"
            >
              Lanjutkan Mengelola Dungeon
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
