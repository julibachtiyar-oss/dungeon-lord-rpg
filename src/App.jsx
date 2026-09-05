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
  Play,
  Users,
  Flame
} from 'lucide-react';

import { useGameState } from './hooks/useGameState';
import DungeonManagement from './components/DungeonManagement';
import GameCanvas from './engine/GameCanvas';
import VirtualControls from './components/VirtualControls';
import InotiaInventoryModal from './components/InotiaInventoryModal';
import ClassSelectModal from './components/ClassSelectModal';
import DungeonFloorSelect from './components/DungeonFloorSelect';
import TalentTreeModal from './components/TalentTreeModal';
import BossHealthBar from './components/BossHealthBar';
import InstallPwaPrompt from './components/InstallPwaPrompt';
import TitleScreen from './components/TitleScreen';
import StoryDialogueModal from './components/StoryDialogueModal';
import { DUNGEON_FLOORS } from './constants/rooms';
import { sound } from './engine/soundEngine';

export default function App() {
  const {
    gameState,
    heroClass,
    activeMercenary,
    totalStats,
    claimPassiveIncome,
    updateGrid,
    upgradeRoom,
    equipItem,
    sellItem,
    addLootItem,
    addExpAndGold,
    addSanctuaryRewards,
    selectClass,
    selectMercenary,
    consumePotion,
    markPrologueSeen,
    resetGame,
    learnTalent,
    resetTalents
  } = useGameState();

  // Screens: 'title' | 'sanctuary' | 'adventure'
  const [currentView, setCurrentView] = useState('title');
  const [selectedFloor, setSelectedFloor] = useState(DUNGEON_FLOORS[0]);
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isClassSelectOpen, setIsClassSelectOpen] = useState(false);
  const [isFloorSelectOpen, setIsFloorSelectOpen] = useState(false);
  const [isTalentTreeOpen, setIsTalentTreeOpen] = useState(false);
  const [soundMuted, setSoundMuted] = useState(false);

  // Story Dialogue State
  const [activeDialogue, setActiveDialogue] = useState(null);

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
    mercenaryHp: activeMercenary ? activeMercenary.maxHp : null,
    mercenaryMaxHp: activeMercenary ? activeMercenary.maxHp : null,
    skillCooldowns: {}
  });

  const [victoryData, setVictoryData] = useState(null);
  const [defeatData, setDefeatData] = useState(null);

  const gameCanvasRef = useRef(null);

  // Toggle Sound
  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sound.muted = next;
    if (next) {
      sound.stopBGM();
    } else {
      if (currentView === 'adventure') sound.playBGM('dungeon');
      else sound.playBGM('sanctuary');
    }
  };

  // Start from Title Screen
  const handleStartGame = () => {
    sound.init();
    sound.playBGM('sanctuary');

    if (!gameState.prologueSeen) {
      // Trigger Inotia Prologue Dialogue
      setActiveDialogue([
        {
          speaker: 'Roh Kuno Nether',
          avatar: '🧙‍♂️',
          avatarColor: '#a855f7',
          text: 'Salam, Yang Mulia Penguasa Dungeon... Akhirnya Anda terbangun dari tidur seribu tahun.'
        },
        {
          speaker: heroClass.name,
          avatar: heroClass.avatar || '⚔️',
          avatarColor: heroClass.color,
          text: 'Di mana aku...? Apakah petualang manusia dari kerajaan permukaan telah menjamah wilayahku?'
        },
        {
          speaker: 'Roh Kuno Nether',
          avatar: '🧙‍♂️',
          avatarColor: '#a855f7',
          text: 'Benar. Para ksatria manusia terus menyerbu melalui portal untuk menjarah Inti Emasmu. Bangun pertahanan, pasang jebakan, dan pimpin pasukan monster Anda untuk menaklukkan mereka!'
        }
      ]);
      markPrologueSeen();
    }

    setCurrentView('sanctuary');
  };

  const handleNewGame = () => {
    resetGame();
  };

  // Start Action RPG Adventure Floor
  const handleStartAdventureFromFloor = (floor) => {
    setSelectedFloor(floor);
    setCurrentView('adventure');
    setVictoryData(null);
    setDefeatData(null);
    sound.playBGM('dungeon');

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
      mercenaryHp: activeMercenary ? activeMercenary.maxHp : null,
      mercenaryMaxHp: activeMercenary ? activeMercenary.maxHp : null,
      skillCooldowns: {}
    });
  };

  const handleStatsUpdate = useCallback((stats) => {
    setLiveStats(stats);
  }, []);

  const handleDungeonClear = useCallback((result) => {
    addExpAndGold(result.goldEarned, result.gemsEarned, result.kills);
    setVictoryData(result);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch (e) {}
  }, [addExpAndGold]);

  const handleGameOver = useCallback((result) => {
    addExpAndGold(result.goldEarned, 0, result.kills);
    setDefeatData(result);
  }, [addExpAndGold]);

  const handleBossEncounter = useCallback((boss) => {
    sound.playBossRoar();
    setActiveDialogue([
      {
        speaker: boss.name,
        avatar: '👹',
        avatarColor: '#ef4444',
        text: 'Siapa yang berani menantang kekuasaanku di kedalaman ini?! Bersiaplah menjadi santapan para monster!'
      },
      {
        speaker: heroClass.name,
        avatar: heroClass.avatar || '⚔️',
        avatarColor: heroClass.color,
        text: 'Aku adalah Penguasa Dungeon Sejati. Berlututlah, atau hancurlah menjadi abu!'
      }
    ]);
  }, [heroClass]);

  const handleUsePotion = (type = 'health') => {
    if (gameState.potionsCount > 0) {
      const ok = consumePotion();
      if (ok) {
        gameCanvasRef.current?.usePotion(type);
      }
    }
  };

  const handleExitToSanctuary = () => {
    if (currentView === 'adventure' && liveStats.goldEarned > 0) {
      addExpAndGold(liveStats.goldEarned, liveStats.gemsEarned, liveStats.kills);
    }
    sound.playBGM('sanctuary');
    setCurrentView('sanctuary');
    setVictoryData(null);
    setDefeatData(null);
  };

  return (
    <div className="w-full h-full relative overflow-hidden bg-dungeon-950 font-sans select-none">
      {/* 1. Proper Title Screen */}
      {currentView === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onNewGame={handleNewGame}
          hasSaveData={gameState.prologueSeen}
          soundMuted={soundMuted}
          onToggleSound={toggleSound}
        />
      )}

      {/* 2. Sanctuary Mode (Visual Grid Builder & Invaders) */}
      {currentView === 'sanctuary' && (
        <DungeonManagement
          gameState={gameState}
          heroClass={heroClass}
          onUpgradeRoom={upgradeRoom}
          onClaimPassiveIncome={claimPassiveIncome}
          onStartAdventure={() => setIsFloorSelectOpen(true)}
          onOpenInventory={() => setIsInventoryOpen(true)}
          onOpenClassSelect={() => setIsClassSelectOpen(true)}
          onOpenTalentTree={() => setIsTalentTreeOpen(true)}
          onUpdateGrid={updateGrid}
          onAddSanctuaryRewards={addSanctuaryRewards}
          onAddLoot={addLootItem}
        />
      )}

      {/* 3. Adventure Mode (Inotia Action RPG) */}
      {currentView === 'adventure' && (
        <div className="w-full h-full relative">
          <GameCanvas
            ref={gameCanvasRef}
            floorConfig={selectedFloor}
            heroClass={heroClass}
            totalStats={totalStats}
            mercenaryDef={activeMercenary}
            onStatsUpdate={handleStatsUpdate}
            onDungeonClear={handleDungeonClear}
            onGameOver={handleGameOver}
            onLootDrop={addLootItem}
            onBossEncounter={handleBossEncounter}
          />

          {/* Top Adventure HUD */}
          {/* Top Adventure HUD - Inotia Retro Ornate Layout */}
          <div className="absolute top-0 left-0 right-0 z-30 p-2.5 pt-3 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-start justify-between pointer-events-none">
            {/* Left: Hero Portrait & Dual Ornate Bars */}
            <div className="flex items-center gap-2.5 pointer-events-auto">
              {/* Ornate Gold Dragon Hero Portrait Frame */}
              <div className="relative">
                <div
                  className="w-13 h-13 rounded-2xl flex items-center justify-center font-black text-2xl shadow-2xl border-2 border-gold-400/90 relative overflow-hidden ring-2 ring-black/80"
                  style={{ 
                    backgroundColor: heroClass.color,
                    boxShadow: '0 0 14px rgba(250, 204, 21, 0.35)' 
                  }}
                >
                  {/* Subtle shine diagonal sheen */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/40 via-transparent to-white/20 pointer-events-none" />
                  <span className="relative z-10 drop-shadow">{heroClass.avatar || '⚔️'}</span>
                </div>
                {/* Level Diamond Badge */}
                <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-600 to-yellow-500 text-black text-[9px] font-black px-1.5 py-0.2 rounded-md border border-amber-300 shadow-md font-fantasy">
                  Lv.{gameState.heroLevel || 1}
                </div>
              </div>

              {/* HP & MP Dual Ornate Bars */}
              <div className="space-y-1.5 w-36 sm:w-48">
                {/* Hero Name & Class */}
                <div className="flex items-center justify-between text-[10px] font-black text-gold-300 font-fantasy leading-none drop-shadow">
                  <span>{heroClass.name}</span>
                  <span className="text-[9px] text-slate-400 font-mono">
                    {Math.max(0, Math.round(liveStats.currentHp))}/{liveStats.maxHp}
                  </span>
                </div>

                {/* Health Bar (Red Ruby Glass Sheen) */}
                <div className="relative w-full h-3.5 bg-black/80 rounded-full border border-blood-500/80 overflow-hidden p-0.5 shadow-inner ring-1 ring-black">
                  <div
                    className="h-full bg-gradient-to-r from-red-700 via-blood-500 to-rose-400 rounded-full transition-all duration-100 relative"
                    style={{ width: `${Math.max(0, Math.min(100, (liveStats.currentHp / liveStats.maxHp) * 100))}%` }}
                  >
                    <div className="absolute inset-0 bg-white/15 rounded-full" />
                  </div>
                </div>

                {/* Mana Bar (Blue Sapphire Glass Sheen) */}
                <div className="relative w-full h-2.5 bg-black/80 rounded-full border border-mana-500/80 overflow-hidden p-0.5 shadow-inner ring-1 ring-black">
                  <div
                    className="h-full bg-gradient-to-r from-blue-700 via-mana-500 to-cyan-300 rounded-full transition-all duration-100"
                    style={{ width: `${Math.max(0, Math.min(100, (liveStats.currentMp / liveStats.maxMp) * 100))}%` }}
                  />
                </div>

                {/* Mercenary Companion Mini Health Indicator */}
                {activeMercenary && liveStats.mercenaryHp !== null && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] drop-shadow">{activeMercenary.avatar}</span>
                    <div className="flex-1 h-1.5 bg-black/80 rounded-full border border-purple-800/80 overflow-hidden">
                      <div
                        className="h-full bg-purple-500 rounded-full"
                        style={{
                          width: `${Math.max(0, Math.min(100, (liveStats.mercenaryHp / liveStats.mercenaryMaxHp) * 100))}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Center: Floor Badge & Run Stats */}
            <div className="text-center space-y-1">
              <span
                className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg inline-block font-fantasy"
                style={{
                  backgroundColor: `${selectedFloor.color}25`,
                  color: selectedFloor.color,
                  border: `1px solid ${selectedFloor.color}80`
                }}
              >
                {selectedFloor.name}
              </span>

              {/* Run Gold & Kills tracker */}
              <div className="flex items-center justify-center gap-2 text-[9px] text-slate-300 font-bold bg-black/60 px-2 py-0.5 rounded-md border border-white/10">
                <span className="text-gold-400">+{liveStats.goldEarned || 0}G</span>
                <span>•</span>
                <span className="text-blood-400">{liveStats.kills || 0} Kills</span>
              </div>
            </div>

            {/* Right: Sound & Retreat Buttons */}
            <div className="flex items-center gap-1.5 pointer-events-auto">
              <button
                onClick={toggleSound}
                className="p-2 rounded-xl bg-black/70 border border-gold-500/30 text-slate-300 hover:text-white active:scale-95 transition-all shadow-md"
              >
                {soundMuted ? <VolumeX size={16} /> : <Volume2 size={16} className="text-gold-400" />}
              </button>

              <button
                onClick={handleExitToSanctuary}
                className="px-2.5 py-1.5 rounded-xl bg-blood-600/90 hover:bg-blood-500 border border-blood-400/50 text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1 active:scale-95 transition-all shadow-md shadow-blood-600/30"
              >
                <LogOut size={13} />
                <span>Retreat</span>
              </button>
            </div>
          </div>

          {/* Dynamic Combo Multiplier Badge */}
          {liveStats.comboCount >= 2 && (
            <div className="absolute top-20 left-4 z-40 pointer-events-none animate-bounce flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/90 border-2 border-gold-400 shadow-2xl shadow-gold-500/40">
              <Flame size={14} className="text-amber-400 animate-pulse" />
              <span className="text-xs font-black text-gold-300 font-fantasy tracking-wider">
                {liveStats.comboCount}x COMBO!
              </span>
              <span className="text-[9px] text-amber-300 font-bold uppercase tracking-tight">
                {liveStats.comboCount >= 15 ? '🔥 GODLIKE' : liveStats.comboCount >= 8 ? '⚡ UNSTOPPABLE' : 'BRUTAL'}
              </span>
            </div>
          )}

          {/* Boss Health Bar Overlay */}
          <BossHealthBar
            bossName={liveStats.bossName}
            bossHp={liveStats.bossHp}
            bossMaxHp={liveStats.bossMaxHp}
          />

          {/* Inotia Virtual Controls */}
          <VirtualControls
            heroClass={heroClass}
            onMove={(vx, vy) => gameCanvasRef.current?.setMove(vx, vy)}
            onAttack={() => gameCanvasRef.current?.attack()}
            onSkill={(idx) => gameCanvasRef.current?.skill(idx)}
            onDash={() => gameCanvasRef.current?.dash()}
            onPotion={handleUsePotion}
            onToggleTactics={() => gameCanvasRef.current?.toggleTactics()}
            tacticsMode={liveStats.tacticsMode || 'attack'}
            skillCooldowns={liveStats.skillCooldowns}
            potionsCount={gameState.potionsCount}
            mercenary={activeMercenary}
          />
        </div>
      )}

      {/* 4. Story Dialogue Cutscene Modal */}
      {activeDialogue && (
        <StoryDialogueModal
          isOpen={true}
          dialogueList={activeDialogue}
          onFinish={() => setActiveDialogue(null)}
        />
      )}

      {/* 5. Victory Modal */}
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
                Boss lantai berhasil ditaklukkan oleh Sang Penguasa Dungeon dan pasukannya.
              </p>
            </div>

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
              Ambil Hadiah & Pulang ke Sanctuary
            </button>
          </div>
        </div>
      )}

      {/* 6. Defeat Modal */}
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
                Monster terlalu kuat kali ini. Perkuat perlengkapan Paperdoll dan minion di Sanctuary.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-black/50 border border-blood-600/30">
              <span className="text-xs text-slate-400 block">Gold diselamatkan:</span>
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

      {/* 7. Inotia 7-Slot Paperdoll & Mercenary Modal */}
      <InotiaInventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        heroClass={heroClass}
        heroLevel={gameState.heroLevel}
        equipment={gameState.equipment}
        inventory={gameState.inventory}
        onEquipItem={equipItem}
        onSellItem={sellItem}
        totalStats={totalStats}
        activeMercenaryId={gameState.activeMercenaryId}
        onSelectMercenary={selectMercenary}
        gold={gameState.gold}
        gems={gameState.gems}
      />

      {/* 8. Class Select Modal */}
      <ClassSelectModal
        isOpen={isClassSelectOpen}
        onClose={() => setIsClassSelectOpen(false)}
        selectedClassId={gameState.heroClassId}
        onSelectClass={selectClass}
      />

      {/* 9. Floor Select Modal */}
      <DungeonFloorSelect
        isOpen={isFloorSelectOpen}
        onClose={() => setIsFloorSelectOpen(false)}
        onSelectFloor={handleStartAdventureFromFloor}
        heroLevel={gameState.heroLevel}
        totalAttack={totalStats.attack}
      />

      {/* 10. Inotia 3-Branch Talent Tree Modal */}
      <TalentTreeModal
        isOpen={isTalentTreeOpen}
        onClose={() => setIsTalentTreeOpen(false)}
        heroClassId={gameState.heroClassId}
        talentPoints={gameState.talentPoints}
        talents={gameState.talents}
        onLearnTalent={learnTalent}
        onResetTalents={resetTalents}
      />

      {/* 11. PWA Install Prompt */}
      <InstallPwaPrompt />
    </div>
  );
}
