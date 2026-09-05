import React, { useRef, useEffect, useState, useCallback } from 'react';
import { 
  Crown, 
  Coins, 
  Skull, 
  Flame, 
  Zap, 
  Hammer, 
  FlaskConical, 
  DoorOpen, 
  ShieldAlert, 
  Swords, 
  Plus, 
  X, 
  Sparkles,
  Info
} from 'lucide-react';
import { GRID_COLS, GRID_ROWS, BUILDING_TYPES, INVADER_TYPES } from '../constants/dungeonSanctuary';
import { LOOT_TABLE } from '../constants/items';
import { sound } from '../engine/soundEngine';

export default function DungeonSanctuaryMap({
  gridState,
  onUpdateGrid,
  gold,
  gems,
  onAddRewards,
  onAddLoot,
  heroClass
}) {
  const [selectedCellIdx, setSelectedCellIdx] = useState(null);
  const [invaders, setInvaders] = useState([]);
  const [minions, setMinions] = useState([]);
  const [combatEffects, setCombatEffects] = useState([]);
  const [invaderKillCount, setInvaderKillCount] = useState(0);

  const iconMap = {
    Crown,
    Coins,
    Skull,
    Flame,
    Zap,
    Hammer,
    FlaskConical,
    DoorOpen
  };

  // Find Portal cell index and Core cell index
  const portalIdx = gridState.indexOf('portal');
  const coreIdx = gridState.indexOf('core');

  // Spawn an Invader party
  const spawnInvaderWave = useCallback(() => {
    sound.playBossRoar();
    const types = Object.keys(INVADER_TYPES);
    const count = 2 + Math.floor(Math.random() * 2);

    const newInvaders = [];
    for (let i = 0; i < count; i++) {
      const typeKey = types[Math.floor(Math.random() * types.length)];
      const def = INVADER_TYPES[typeKey];
      const startCell = portalIdx !== -1 ? portalIdx : 1;

      newInvaders.push({
        id: `inv_${Date.now()}_${i}`,
        type: typeKey,
        name: def.name,
        avatar: def.avatar,
        color: def.color,
        hp: def.maxHp,
        maxHp: def.maxHp,
        attack: def.attack,
        cellIdx: startCell,
        targetCellIdx: coreIdx !== -1 ? coreIdx : GRID_COLS * GRID_ROWS - 2,
        pathStep: 0,
        goldDrop: def.goldDrop,
        gemChance: def.gemChance,
        equipmentChance: def.equipmentChance
      });
    }

    setInvaders(prev => [...prev, ...newInvaders]);
  }, [portalIdx, coreIdx]);

  // Synchronize Minions based on Spawner rooms
  useEffect(() => {
    const spawnerCount = gridState.filter(cell => cell === 'spawner').length;
    const currentMinions = [];

    gridState.forEach((cellType, idx) => {
      if (cellType === 'spawner') {
        currentMinions.push({
          id: `minion_${idx}_1`,
          cellIdx: idx,
          name: 'Goblin Guard',
          avatar: '👺',
          color: '#eab308',
          hp: 120,
          attack: 18
        });
        currentMinions.push({
          id: `minion_${idx}_2`,
          cellIdx: idx,
          name: 'Skeleton Sentry',
          avatar: '💀',
          color: '#cbd5e1',
          hp: 90,
          attack: 24
        });
      }
    });

    setMinions(currentMinions);
  }, [gridState]);

  // Auto invasion wave every 28 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (invaders.length === 0) {
        spawnInvaderWave();
      }
    }, 28000);

    return () => clearInterval(interval);
  }, [spawnInvaderWave, invaders.length]);

  // Simulation Tick (Every 1.2s): Invaders advance, step on traps, fight minions
  useEffect(() => {
    const simTimer = setInterval(() => {
      setInvaders(prevInvaders => {
        if (prevInvaders.length === 0) return prevInvaders;

        const updated = [];
        let earnedGold = 0;
        let earnedGems = 0;
        let kills = 0;

        for (const inv of prevInvaders) {
          let currentHp = inv.hp;
          let currentCell = inv.cellIdx;

          // 1. Move invader 1 step towards Core
          const target = inv.targetCellIdx;
          const currCol = currentCell % GRID_COLS;
          const currRow = Math.floor(currentCell / GRID_COLS);
          const targetCol = target % GRID_COLS;
          const targetRow = Math.floor(target / GRID_COLS);

          let nextCol = currCol;
          let nextRow = currRow;

          if (currCol < targetCol && Math.random() < 0.65) nextCol++;
          else if (currCol > targetCol && Math.random() < 0.65) nextCol--;
          else if (currRow < targetRow) nextRow++;
          else if (currRow > targetRow) nextRow--;

          const nextCell = nextRow * GRID_COLS + nextCol;
          currentCell = nextCell;

          // 2. Check Trap on this cell
          const building = BUILDING_TYPES[gridState[currentCell]];
          if (building && building.trapDamage) {
            currentHp -= building.trapDamage;
            sound.playCriticalHit();

            setCombatEffects(prev => [
              ...prev,
              {
                id: `fx_${Date.now()}_${Math.random()}`,
                cellIdx: currentCell,
                text: `TRAP! -${building.trapDamage}`,
                color: '#ec4899'
              }
            ]);
          }

          // 3. Minion combat check
          const cellMinions = minions.filter(m => Math.abs(m.cellIdx - currentCell) <= 1);
          if (cellMinions.length > 0) {
            const minionAtk = cellMinions.reduce((acc, m) => acc + m.attack, 0);
            currentHp -= minionAtk;
            sound.playAttackMelee();

            setCombatEffects(prev => [
              ...prev,
              {
                id: `fx_${Date.now()}_${Math.random()}`,
                cellIdx: currentCell,
                text: `-${minionAtk}`,
                color: '#ef4444'
              }
            ]);
          }

          // 4. Check if dead
          if (currentHp <= 0) {
            sound.playCoinCollect();
            kills++;
            const g = Math.floor(inv.goldDrop[0] + Math.random() * (inv.goldDrop[1] - inv.goldDrop[0]));
            earnedGold += g;

            if (Math.random() < inv.gemChance) {
              earnedGems += 2;
            }

            // Roll loot equipment
            if (inv.equipmentChance && Math.random() < inv.equipmentChance) {
              const item = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
              if (onAddLoot) onAddLoot(item);
            }

            setCombatEffects(prev => [
              ...prev,
              {
                id: `fx_${Date.now()}_${Math.random()}`,
                cellIdx: currentCell,
                text: `DEAD! +${g} Gold`,
                color: '#facc15'
              }
            ]);
            continue; // Invader removed
          }

          // 5. Check if reached Core
          if (currentCell === coreIdx) {
            sound.playAttackMelee();
            setCombatEffects(prev => [
              ...prev,
              {
                id: `fx_${Date.now()}_${Math.random()}`,
                cellIdx: currentCell,
                text: `CORE DISERANG!`,
                color: '#ef4444'
              }
            ]);
            continue; // Plundered & escaped
          }

          updated.push({
            ...inv,
            hp: currentHp,
            cellIdx: currentCell
          });
        }

        if (earnedGold > 0 || earnedGems > 0 || kills > 0) {
          onAddRewards(earnedGold, earnedGems);
          setInvaderKillCount(prev => prev + kills);
        }

        return updated;
      });

      // Clear old combat text effects
      setCombatEffects(prev => prev.filter(fx => Date.now() - parseInt(fx.id.split('_')[1]) < 1200));
    }, 1400);

    return () => clearInterval(simTimer);
  }, [gridState, minions, coreIdx, onAddRewards, onAddLoot]);

  // Handle building on cell
  const handleBuildFacility = (buildingKey) => {
    if (selectedCellIdx === null) return;
    const bDef = BUILDING_TYPES[buildingKey];
    if (!bDef) return;

    if (gold < (bDef.costGold || 0) || gems < (bDef.costGems || 0)) {
      sound.playAttackMelee();
      return;
    }

    sound.playLevelUp();
    const nextGrid = [...gridState];
    nextGrid[selectedCellIdx] = buildingKey;
    onUpdateGrid(nextGrid, bDef.costGold || 0, bDef.costGems || 0);
    setSelectedCellIdx(null);
  };

  const selectedBuilding = selectedCellIdx !== null ? BUILDING_TYPES[gridState[selectedCellIdx]] : null;

  return (
    <div className="w-full flex flex-col items-center space-y-3 p-3">
      {/* Top Banner: Dungeon Defense & Lure Button */}
      <div className="w-full max-w-md rounded-2xl p-3 bg-dungeon-900 border border-dungeon-700 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blood-600/20 border border-blood-500/50 flex items-center justify-center text-blood-400">
            <Swords size={20} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white font-fantasy">PERTAHANAN SANCTUARY</span>
              {invaders.length > 0 && (
                <span className="w-2 h-2 rounded-full bg-blood-500 animate-ping" />
              )}
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              {invaders.length > 0
                ? `${invaders.length} Petualang musuh sedang menjarah!`
                : `Aman. ${invaderKillCount} Petualang berhasil dibasmi.`}
            </p>
          </div>
        </div>

        <button
          onClick={spawnInvaderWave}
          className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blood-600 to-amber-600 hover:brightness-110 text-white font-black text-[10px] uppercase tracking-wider shadow-md active:scale-95 transition-all flex items-center gap-1 border border-amber-400/40"
        >
          <Swords size={12} />
          <span>Panggil Petualang</span>
        </button>
      </div>

      {/* Interactive Visual Dungeon Grid */}
      <div className="w-full max-w-md bg-dungeon-950 p-2.5 rounded-3xl border-2 border-dungeon-700/80 shadow-2xl relative overflow-hidden">
        {/* Background Dungeon Stone Texture Overlay */}
        <div className="grid grid-cols-8 gap-1.5 select-none relative">
          {gridState.map((cellType, idx) => {
            const building = BUILDING_TYPES[cellType] || BUILDING_TYPES.empty;
            const Icon = iconMap[building.icon] || Skull;
            const isSelected = selectedCellIdx === idx;
            const cellInvaders = invaders.filter(inv => inv.cellIdx === idx);
            const cellMinions = minions.filter(m => m.cellIdx === idx);
            const cellFx = combatEffects.filter(fx => fx.cellIdx === idx);

            return (
              <div
                key={idx}
                onClick={() => {
                  sound.playEquipItem();
                  setSelectedCellIdx(idx);
                }}
                className={`aspect-square rounded-xl border relative flex flex-col items-center justify-center p-1 transition-all cursor-pointer ${
                  isSelected
                    ? 'border-gold-400 bg-gold-500/20 shadow-lg shadow-gold-500/30 scale-105 z-10'
                    : building.id === 'empty'
                    ? 'border-dungeon-800 bg-dungeon-900/60 hover:border-slate-600'
                    : 'border-dungeon-600 bg-dungeon-850 hover:border-gold-500/50'
                }`}
                style={{
                  boxShadow: building.id === 'core' ? '0 0 14px rgba(168, 85, 247, 0.4)' : undefined
                }}
              >
                {/* Building Icon / Tile */}
                {building.id !== 'empty' && (
                  <div
                    className="flex items-center justify-center"
                    style={{ color: building.color }}
                  >
                    <Icon size={18} />
                  </div>
                )}

                {/* Facility name on special cells */}
                {building.id === 'portal' && (
                  <span className="text-[7px] font-black text-cyan-300 uppercase leading-none mt-0.5">
                    GERBANG
                  </span>
                )}
                {building.id === 'core' && (
                  <span className="text-[7px] font-black text-purple-300 uppercase leading-none mt-0.5">
                    CORE
                  </span>
                )}

                {/* Minions in cell */}
                {cellMinions.length > 0 && (
                  <div className="absolute top-0.5 left-0.5 flex gap-0.5 pointer-events-none">
                    {cellMinions.slice(0, 2).map((m, mIdx) => (
                      <span key={mIdx} className="text-[10px] drop-shadow animate-bounce">
                        {m.avatar}
                      </span>
                    ))}
                  </div>
                )}

                {/* Invaders in cell */}
                {cellInvaders.length > 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                    <div className="flex flex-col items-center">
                      <span className="text-sm drop-shadow-md animate-pulse">
                        {cellInvaders[0].avatar}
                      </span>
                      {/* Health Mini Bar */}
                      <div className="w-6 h-1 bg-black/80 rounded-full overflow-hidden border border-slate-700 mt-0.5">
                        <div
                          className="h-full bg-blood-500 rounded-full"
                          style={{
                            width: `${Math.max(0, (cellInvaders[0].hp / cellInvaders[0].maxHp) * 100)}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Floating Combat Text Popups */}
                {cellFx.map(fx => (
                  <span
                    key={fx.id}
                    className="absolute -top-3 z-30 font-black text-[9px] drop-shadow-md pointer-events-none animate-float-damage whitespace-nowrap"
                    style={{ color: fx.color }}
                  >
                    {fx.text}
                  </span>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Facility Inspector & Building Drawer */}
      {selectedCellIdx !== null && selectedBuilding && (
        <div className="w-full max-w-md bg-dungeon-900 border border-dungeon-700 rounded-2xl p-3.5 shadow-2xl space-y-3 animate-fade-in">
          <div className="flex items-center justify-between border-b border-dungeon-800 pb-2">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ backgroundColor: `${selectedBuilding.color}25`, color: selectedBuilding.color }}
              >
                {React.createElement(iconMap[selectedBuilding.icon] || Skull, { size: 18 })}
              </div>
              <div>
                <h4 className="text-xs font-black text-white">{selectedBuilding.name}</h4>
                <p className="text-[10px] text-slate-400">Petak {selectedCellIdx + 1} di Sanctuary</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedCellIdx(null)}
              className="p-1 rounded-lg text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">{selectedBuilding.desc}</p>

          {/* Build Options if cell is customizable */}
          {!selectedBuilding.fixed && (
            <div className="space-y-2 pt-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 block font-fantasy">
                Ubah / Bangun Fasilitas Baru:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(BUILDING_TYPES)
                  .filter(([k, b]) => !b.fixed && k !== 'empty' && k !== selectedBuilding.id)
                  .map(([bKey, bDef]) => {
                    const canAfford = gold >= (bDef.costGold || 0) && gems >= (bDef.costGems || 0);

                    return (
                      <button
                        key={bKey}
                        onClick={() => handleBuildFacility(bKey)}
                        disabled={!canAfford}
                        className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                          canAfford
                            ? 'bg-dungeon-850 border-dungeon-700 hover:border-gold-500 active:scale-95 shadow-md'
                            : 'bg-dungeon-950/60 border-dungeon-800 opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 mb-1">
                          <span style={{ color: bDef.color }}>
                            {React.createElement(iconMap[bDef.icon] || Skull, { size: 14 })}
                          </span>
                          <span className="text-[11px] font-bold text-white truncate">{bDef.name}</span>
                        </div>

                        <div className="flex items-center gap-2 text-[10px] font-black mt-1">
                          <div className="flex items-center gap-0.5 text-gold-400">
                            <Coins size={11} />
                            <span>{bDef.costGold}</span>
                          </div>
                          {bDef.costGems > 0 && (
                            <div className="flex items-center gap-0.5 text-purple-300">
                              <Sparkles size={11} />
                              <span>{bDef.costGems}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
