import React, { useState, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  Shield, 
  Crown, 
  Coins, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  LogOut, 
  Trophy, 
  Skull, 
  ArrowLeft,
  Heart,
  Zap,
  Play
} from 'lucide-react';

import { useGameState } from './hooks/useGameState';
import DungeonManagement from './components/DungeonManagement';
import GameCanvas from './engine/GameCanvas';
import VirtualControls from './components/VirtualControls';
import InventoryModal from './components/InventoryModal';
import ClassSelectModal from './components/ClassSelectModal';
import DungeonFloorSelect from './components/DungeonFloorSelect';
import BossHealthBar from './components/BossHealthBar';
import InstallPwaPrompt from './components/InstallPwaPrompt';
import { DUNGEON_FLOORS } from './constants/rooms';
import { sound } from './engine/soundEngine';

export default function App() {
  const {
    gameState,
    heroClass,
    totalStats,
    claimPassiveIncome,
    upgradeRoom,
    equipItem,
    sellItem,
    addLootItem,
    addExpAndGold,
    selectClass,
    consumePotion,
    addPotion
  } = useGameState();

  const [currentView, setCurrentView] = useState('sanctuary'); // 'sanctuary' | 'adventure'
  const [selectedFloor, setSelectedFloor] = useState(DUNGEON_FLOORS[0]);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isClassSelectOpen, setIsClassSelectOpen] = useState(false);
  const [isFloorSelectOpen, setIsFloorSelectOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // Adventure live stats
  const [liveStats, setLiveStats] = useState({
    currentHp: totalStats.maxHp,
    maxHp: totalStats.maxHp,
    currentMp: totalStats.maxMp,
    maxMp: totalStats.maxMp,
    goldEarned: 0,
    gemsEarned: 0,
    kills: 0,
    bossHp: null,
    bossMaxHp: null,
    bossName: null,
    skillCooldowns: {}
  });

  // End game state modals
  const [victoryData, setVictoryData] = useState(null);
  const [defeatData, setDefeatData] = useState(null);

  const gameCanvasRef = useRef(null);

  // Toggle Sound
  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sound.muted = next;
  };

  // Start Adventure
  const handleStartAdventureFromFloor = (floor) => {
    setSelectedFloor(floor);
    setCurrentView('adventure');
    setVictoryData(null);
    setDefeatData(null);
    setLiveStats({
      currentHp: totalStats.maxHp,
      maxHp: totalStats.maxHp,
      currentMp: totalStats.maxMp,
      maxMp: totalStats.maxMp,
      goldEarned: 0,
      gemsEarned: 0,
      kills: 0,
      bossHp: null,
      bossMaxHp: null,
      bossName: null,
      skillCooldowns: {}
    });
  };

  // Live stats callback from engine
  const handleStatsUpdate = useCallback((stats) => {
    setLiveStats(stats);
  }, []);

  // Floor Clear / Victory
  const handleDungeonClear = useCallback((result) => {
    addExpAndGold(result.goldEarned, result.gemsEarned, result.kills);
    setVictoryData(result);

    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      // Confetti fallback
    }
  }, [addExpAndGold]);

  // Defeat / Game Over
  const handleGameOver = useCallback((result) => {
    addExpAndGold(result.goldEarned, 0, result.kills);
    setDefeatData(result);
  }, [addExpAndGold]);

  // Potion used in adventure
  const handleUsePotion = () => {
    if (gameState.potionsCount > 0) {
      const ok = consumePotion();
      if (ok) {
        gameCanvasRef.current?.usePotion('health');
      }
    }
  };

  // Return to Sanctuary
  const handleExitToSanctuary = () => {
    if (currentView === 'adventure' && liveStats.goldEarned > 0) {
      addExpAndGold(liveStats.goldEarned, liveStats.gemsEarned, liveStats.kills);
    }
    setCurrentView('sanctuary');
    setVictoryData(null);
    setDefeatData(null);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-dungeon-950 font-sans select-none">
      {/* 1. Sanctuary View (Dungeon Tycoon) */}
      {currentView === 'sanctuary' && (
        <DungeonManagement
          gameState={gameState}
          onUpgradeRoom={upgradeRoom}
          onClaimPassiveIncome={claimPassiveIncome}
          onStartAdventure={() => setIsFloorSelectOpen(true)}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenClassSelect={() => setIsClassSelectOpen(true)}
        />
      )}

      {/* 2. Adventure View (Action RPG) */}
      {currentView === 'adventure' && (
        <div className="w-full h-full relative">
          {/* Canvas Engine */}
          <GameCanvas
            ref={gameCanvasRef}
            floorConfig={selectedFloor}
            heroClass={heroClass}
            totalStats={totalStats}
            onStatsUpdate={handleStatsUpdate}
            onDungeonClear={handleDungeonClear}
            onGameOver={handleGameOver}
            onLootDrop={addLootItem}
          />

          {/* Top Adventure HUD */}
          <div className="absolute top-0 left-0 right-0 z-30 p-3 pt-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent flex items-start justify-between pointer-events-none">
            {/* Left: Player Bars */}
            <div className="flex items-center gap-2 pointer-events-auto">
              {/* Avatar circle */}
              <div
                className="w-11 h-11 rounded-2xl flex items-center justify-center font-fantasy font-black text-white text-base shadow-lg border-2 border-white/40"
                style={{ backgroundColor: heroClass.color }}
              >
                {heroClass.name[0]}
              </div>

              {/* HP / MP Bars */}
              <div className="space-y-1 w-32 sm:w-44">
                {/* Health Bar */}
                <div className="relative w-full h-4 bg-black/60 rounded-full border border-blood-600/60 overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-blood-600 to-blood-400 rounded-full transition-all duration-150"
                    style={{ width: `${Math.max(0, Math.min(100, (liveStats.currentHp / liveStats.maxHp) * 100))}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[9px] font-black text-white drop-shadow">
                    {Math.max(0, Math.round(liveStats.currentHp))} / {liveStats.maxHp} HP
                  </span>
                </div>

                {/* Mana Bar */}
                <div className="relative w-full h-3 bg-black/60 rounded-full border border-mana-600/60 overflow-hidden p-0.5 shadow-inner">
                  <div
                    className="h-full bg-gradient-to-r from-mana-600 to-mana-400 rounded-full transition-all duration-150"
                    style={{ width: `${Math.max(0, Math.min(100, (liveStats.currentMp / liveStats.maxMp) * 100))}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center text-[8px] font-black text-white drop-shadow">
                    {Math.max(0, Math.round(liveStats.currentMp))} / {liveStats.maxMp} MP
                  </span>
                </div>
              </div>
            </div>

            {/* Center: Floor Badge */}
            <div className="text-center">
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md inline-block"
                style={{
                  backgroundColor: `${selectedFloor.color}25`,
                  color: selectedFloor.color,
                  border: `1px solid ${selectedFloor.color}60`
                }}
              >
                {selectedFloor.name}
              </span>
            </div>

            {/* Right: Controls & Loot Count */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                onClick={toggleSound}
                className="p-2 rounded-xl bg-black/50 border border-slate-700 text-slate-300 hover:text-white active:scale-95 transition-all shadow-md"
              >
                {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <button
                onClick={handleExitToSanctuary}
                className="px-2.5 py-1.5 rounded-xl bg-blood-600/80 hover:bg-blood-500 border border-blood-400/50 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all shadow-md shadow-blood-600/30"
              >
                <LogOut size={13} />
                <span>Keluar</span>
              </button>
            </div>
          </div>

          {/* Boss Health Bar Overlay */}
          <BossHealthBar
            bossName={liveStats.bossName}
            bossHp={liveStats.bossHp}
            bossMaxHp={liveStats.bossMaxHp}
          />

          {/* Virtual Touch Controls */}
          <VirtualControls
            heroClass={heroClass}
            onMove={(vx, vy) => gameCanvasRef.current?.setMove(vx, vy)}
            onAttack={() => gameCanvasRef.current?.attack()}
            onSkill={(idx) => gameCanvasRef.current?.skill(idx)}
            onDash={() => gameCanvasRef.current?.dash()}
            onPotion={handleUsePotion}
            skillCooldowns={liveStats.skillCooldowns}
            potionsCount={gameState.potionsCount}
          />
        </div>
      )}

      {/* 3. Victory Modal */}
      {victoryData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-dungeon-900 border-2 border-gold-400 rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-gold-500/20 border-2 border-gold-400 text-gold-400 mx-auto flex items-center justify-center shadow-xl shadow-gold-500/30">
              <Trophy size={32} />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black font-fantasy text-gold-400 tracking-wide">
                DUNGEON SELESAI!
              </h2>
              <p className="text-xs text-slate-300">
                Boss lantai berhasil ditaklukkan oleh sang penguasa dungeon.
              </p>
            </div>

            {/* Spoils / Rewards */}
            <div className="p-3.5 rounded-2xl bg-black/50 border border-gold-500/30 grid grid-cols-3 gap-2">
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Gold</span>
                <span className="text-sm font-black text-gold-400">+{victoryData.goldEarned}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Gems</span>
                <span className="text-sm font-black text-purple-300">+{victoryData.gemsEarned}</span>
              </div>
              <div>
                <span className="text-[9px] text-slate-400 uppercase font-bold block">Monster</span>
                <span className="text-sm font-black text-blood-400">{victoryData.kills} Mati</span>
              </div>
            </div>

            <button
              onClick={handleExitToSanctuary}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-tr from-gold-600 to-amber-400 text-black font-black text-sm uppercase tracking-wider shadow-lg shadow-gold-600/30 active:scale-95 transition-all"
            >
              Ambil Hadiah & Kembali ke Sanctuary
            </button>
          </div>
        </div>
      )}

      {/* 4. Defeat / Game Over Modal */}
      {defeatData && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="w-full max-w-sm bg-dungeon-900 border-2 border-blood-600 rounded-3xl p-6 text-center shadow-2xl space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-blood-600/20 border-2 border-blood-500 text-blood-400 mx-auto flex items-center justify-center shadow-xl shadow-blood-600/30">
              <Skull size={32} />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black font-fantasy text-blood-500 tracking-wide">
                HERO TUMBANG
              </h2>
              <p className="text-xs text-slate-300">
                Monster terlalu kuat kali ini. Perkuat senjata dan perlengkapan di Sanctuary.
              </p>
            </div>

            {/* Retained Gold */}
            <div className="p-3 rounded-2xl bg-black/50 border border-blood-600/30">
              <span className="text-xs text-slate-400 block">Gold yang berhasil diselamatkan:</span>
              <span className="text-base font-black text-gold-400">+{defeatData.goldEarned} Gold</span>
            </div>

            <button
              onClick={handleExitToSanctuary}
              className="w-full py-3.5 rounded-2xl bg-dungeon-700 hover:bg-dungeon-600 text-white font-black text-sm uppercase tracking-wider active:scale-95 transition-all"
            >
              Kembali ke Sanctuary
            </button>
          </div>
        </div>
      )}

      {/* 5. Modals */}
      <InventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        heroClass={heroClass}
        heroLevel={gameState.heroLevel}
        equipment={gameState.equipment}
        inventory={gameState.inventory}
        onEquipItem={equipItem}
        onSellItem={sellItem}
        totalStats={totalStats}
      />

      <ClassSelectModal
        isOpen={isClassSelectOpen}
        onClose={() => setIsClassSelectOpen(false)}
        selectedClassId={gameState.heroClassId}
        onSelectClass={selectClass}
      />

      <DungeonFloorSelect
        isOpen={isFloorSelectOpen}
        onClose={() => setIsFloorSelectOpen(false)}
        onSelectFloor={handleStartAdventureFromFloor}
        heroLevel={gameState.heroLevel}
        totalAttack={totalStats.attack}
      />

      {/* 6. PWA Add to Home Screen Prompt */}
      <InstallPwaPrompt />
    </div>
  );
}
