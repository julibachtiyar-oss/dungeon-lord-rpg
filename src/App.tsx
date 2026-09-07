import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import { createGameConfig } from './game/config/game.config';
import { BootScene } from './game/scenes/BootScene';
import { PreloadScene } from './game/scenes/PreloadScene';
import { TitleScene } from './game/scenes/TitleScene';
import { GameScene } from './game/scenes/GameScene';
import { UIBridgeScene } from './game/scenes/UIBridgeScene';
import { EventBus } from './game/events';
import HudOverlay from './ui/HudOverlay';
import TitleOverlay from './ui/TitleOverlay';
import DialogueModal from './ui/DialogueModal';
import ResultScreen from './ui/ResultScreen';
import PauseMenu from './ui/PauseMenu';
import TownHub from './ui/TownHub';
import DungeonSanctuary from './ui/DungeonSanctuary';
import PrologueCutscene from './ui/PrologueCutscene';
import { BGM } from './game/audio/bgm';
import { RotateCcw } from 'lucide-react';

export default function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<
    'title' | 'prologue' | 'town' | 'sanctuary' | 'playing' | 'paused' | 'gameover' | 'victory'
  >('title');

  // Persistent Player Progression
  const [playerStats, setPlayerStats] = useState({
    hp: 100,
    maxHp: 100,
    level: 1,
    xp: 0,
    nextXp: 40,
    potions: 3
  });
  const [gold, setGold] = useState(150);
  const [coreCrystals, setCoreCrystals] = useState(1);
  const [weaponTier, setWeaponTier] = useState(1);
  const [armorTier, setArmorTier] = useState(1);

  // Sanctuary Upgrades (Upgraded only with Core Crystals)
  const [sanctuaryUpgrades, setSanctuaryUpgrades] = useState({
    altar: 1,
    training: 0,
    vault: 0,
    defense: 0
  });

  // Skills state for HUD
  const [skills, setSkills] = useState({
    cleaveReady: true,
    cleaveCooldownProgress: 0,
    bulwarkReady: true,
    bulwarkCooldownProgress: 0,
    dashReady: true,
    dashCooldownProgress: 0
  });

  // Boss & Story
  const [bossHp, setBossHp] = useState<{ current: number; max: number; phase: number; name: string } | null>(null);
  const [roomInfo, setRoomInfo] = useState({ floor: 1, roomName: 'Gerbang Kuil Kuno' });
  const [activeDialogue, setActiveDialogue] = useState<{ id: number; speaker: string; text: string; options?: string[] } | null>(null);
  const [victoryData, setVictoryData] = useState<{ timeSec: number; kills: number; damageTaken: number; gold: number; rank: string } | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Load saved progression from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('EMBERDEEP_SAVE');
      if (saved) {
        const d = JSON.parse(saved);
        if (d.gold !== undefined) setGold(d.gold);
        if (d.coreCrystals !== undefined) setCoreCrystals(d.coreCrystals);
        if (d.weaponTier !== undefined) setWeaponTier(d.weaponTier);
        if (d.armorTier !== undefined) setArmorTier(d.armorTier);
        if (d.sanctuaryUpgrades) setSanctuaryUpgrades(d.sanctuaryUpgrades);
        if (d.playerStats) setPlayerStats(d.playerStats);
      }
    } catch (e) {}
  }, []);

  // Save progression whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem('EMBERDEEP_SAVE', JSON.stringify({
        gold,
        coreCrystals,
        weaponTier,
        armorTier,
        sanctuaryUpgrades,
        playerStats
      }));
    } catch (e) {}
  }, [gold, coreCrystals, weaponTier, armorTier, sanctuaryUpgrades, playerStats]);

  // Initialize Phaser
  useEffect(() => {
    if (!gameRef.current) {
      const config = createGameConfig([
        BootScene,
        PreloadScene,
        TitleScene,
        GameScene,
        UIBridgeScene
      ]);
      gameRef.current = new Phaser.Game(config);
    }

    const onStats = (stats: any) => setPlayerStats(stats);
    const onGoldEarned = (g: number) => setGold((prev) => Math.max(prev, g));
    const onSkillsUpdate = (sk: any) => setSkills(sk);
    const onBoss = (b: any) => setBossHp(b);
    const onRoom = (r: any) => setRoomInfo(r);
    const onDialogue = (d: any) => setActiveDialogue(d);
    const onVictory = (v: any) => {
      setVictoryData(v);
      setGold((prev) => prev + v.gold + 100);
      setCoreCrystals((prev) => prev + 1); // Reward 1 Core Crystal for defeating dungeon!
      setGameState('victory');
    };
    const onOver = () => {
      setGameState('gameover');
    };

    EventBus.onEvent('player:stats', onStats);
    EventBus.onEvent('player:gold', onGoldEarned);
    EventBus.onEvent('player:skills', onSkillsUpdate);
    EventBus.onEvent('boss:hp', onBoss);
    EventBus.onEvent('room:changed', onRoom);
    EventBus.onEvent('story:dialogue', onDialogue);
    EventBus.onEvent('game:victory', onVictory);
    EventBus.onEvent('game:over', onOver);

    return () => {
      EventBus.offEvent('player:stats', onStats);
      EventBus.offEvent('player:gold', onGoldEarned);
      EventBus.offEvent('player:skills', onSkillsUpdate);
      EventBus.offEvent('boss:hp', onBoss);
      EventBus.offEvent('room:changed', onRoom);
      EventBus.offEvent('story:dialogue', onDialogue);
      EventBus.offEvent('game:victory', onVictory);
      EventBus.offEvent('game:over', onOver);

      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Handlers for Town Facilities
  const handleEnterDungeon = () => {
    setGameState('playing');
    EventBus.emitEvent('game:start', undefined as unknown as void);
  };

  const handleBuyPotion = (cost: number) => {
    if (gold >= cost && playerStats.potions < 5) {
      setGold((g) => g - cost);
      setPlayerStats((p) => ({ ...p, potions: p.potions + 1 }));
    }
  };

  const handleUpgradeWeapon = (costGold: number, costCrystal: number) => {
    if (gold >= costGold && coreCrystals >= costCrystal) {
      setGold((g) => g - costGold);
      setCoreCrystals((c) => c - costCrystal);
      setWeaponTier((w) => w + 1);
    }
  };

  const handleUpgradeArmor = (costGold: number) => {
    if (gold >= costGold) {
      setGold((g) => g - costGold);
      setArmorTier((a) => a + 1);
      setPlayerStats((p) => ({ ...p, maxHp: p.maxHp + 25, hp: p.hp + 25 }));
    }
  };

  const handleSanctuaryUpgrade = (facility: 'altar' | 'training' | 'vault' | 'defense', cost: number) => {
    if (coreCrystals >= cost) {
      setCoreCrystals((c) => c - cost);
      setSanctuaryUpgrades((prev) => ({
        ...prev,
        [facility]: prev[facility] + 1
      }));
      // Apply passive sanctuary bonuses immediately
      if (facility === 'altar') {
        setPlayerStats((p) => ({ ...p, maxHp: p.maxHp + 20, hp: p.hp + 20 }));
      }
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none touch-none bg-[#07090e] flex items-center justify-center">
      {/* Desktop Ambient Background Wallpaper */}
      <div 
        className="hidden sm:block absolute inset-0 bg-cover bg-center filter blur-sm scale-110 opacity-35 -z-10"
        style={{ backgroundImage: "url('/backgrounds/valenrock.jpg')" }}
      />
      <div className="hidden sm:block absolute inset-0 bg-black/65 -z-10" />

      {/* Main Game Container (Mobile: Fullscreen, Desktop: Gilded Frame) */}
      <div className="relative w-full h-full sm:w-[420px] sm:h-[92vh] sm:max-h-[860px] sm:rounded-[36px] sm:border-4 sm:border-amber-500/70 sm:shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden bg-[#07090e] flex items-center justify-center">
        
        {/* Phaser Canvas Container */}
        <div id="game-root" className="w-full h-full flex items-center justify-center" />

        {/* 1. Title Screen Overlay */}
        {gameState === 'title' && (
          <TitleOverlay />
        )}

        {/* 2. Prologue Isekai Cutscene */}
        {gameState === 'prologue' && (
          <PrologueCutscene
            onComplete={() => {
              setGameState('town');
              BGM.playTown();
            }}
          />
        )}

        {/* 3. Town Hub (Kota Valenrock) */}
        {gameState === 'town' && (
          <TownHub
            gold={gold}
            coreCrystals={coreCrystals}
            potions={playerStats.potions}
            weaponTier={weaponTier}
            armorTier={armorTier}
            level={playerStats.level}
            onEnterDungeon={handleEnterDungeon}
            onOpenSanctuary={() => setGameState('sanctuary')}
            onBuyPotion={handleBuyPotion}
            onUpgradeWeapon={handleUpgradeWeapon}
            onUpgradeArmor={handleUpgradeArmor}
          />
        )}

        {/* 4. Dungeon Sanctuary (Player's Conquered Home Base) */}
        {gameState === 'sanctuary' && (
          <DungeonSanctuary
            coreCrystals={coreCrystals}
            sanctuaryUpgrades={sanctuaryUpgrades}
            onUpgrade={handleSanctuaryUpgrade}
            onBackToTown={() => {
              setGameState('town');
              BGM.playTown();
            }}
          />
        )}

        {/* 5. In-Game HUD Overlay (Playing or Paused) */}
        {(gameState === 'playing' || gameState === 'paused') && (
          <HudOverlay
            stats={playerStats}
            gold={gold}
            skills={skills}
            bossHp={bossHp}
            roomInfo={roomInfo}
            onPause={() => {
              setIsPaused(true);
              EventBus.emitEvent('game:pause', true);
            }}
          />
        )}

        {/* Story Dialogue Cutscene (Visual Novel Modal) */}
        {activeDialogue && (
          <DialogueModal
            dialogue={activeDialogue}
            onClose={() => setActiveDialogue(null)}
          />
        )}

        {/* Pause Menu */}
        {isPaused && (
          <PauseMenu
            onResume={() => {
              setIsPaused(false);
              EventBus.emitEvent('game:pause', false);
            }}
          />
        )}

        {/* Victory Screen */}
        {gameState === 'victory' && victoryData && (
          <ResultScreen data={victoryData} />
        )}

        {/* Defeat Screen */}
        {gameState === 'gameover' && (
          <div className="fixed sm:absolute inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-xs bg-gradient-to-b from-[#1c1318] to-[#0d070a] border-2 border-red-600 rounded-3xl p-6 text-center space-y-4 shadow-2xl shadow-red-950/80">
              <div className="w-14 h-14 rounded-full bg-red-950/80 border-2 border-red-500 mx-auto flex items-center justify-center text-red-400 text-2xl animate-pulse">
                💀
              </div>
              <h2 className="text-2xl font-black font-fantasy text-red-500 uppercase tracking-wider">
                KAU GUGUR
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kekuatan kuno reruntuhan menghempaskanmu. Kembali ke Kota Valenrock dan pulihkan tenagamu!
              </p>
              <button
                onClick={() => {
                  setGameState('town');
                  BGM.playTown();
                }}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider active:scale-95 shadow-lg shadow-red-900/50 flex items-center justify-center gap-2 font-fantasy border border-red-400"
              >
                <RotateCcw size={16} />
                <span>Kembali ke Kota Valenrock</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
