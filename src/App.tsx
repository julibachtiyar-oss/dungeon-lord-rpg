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
import { RotateCcw, Sparkles } from 'lucide-react';

export default function App() {
  const gameRef = useRef<Phaser.Game | null>(null);
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'gameover' | 'victory'>('title');

  // Player Stats & Skills
  const [playerStats, setPlayerStats] = useState({
    hp: 100,
    maxHp: 100,
    level: 1,
    xp: 0,
    nextXp: 40,
    potions: 3
  });
  const [gold, setGold] = useState(0);
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

  // Victory / Defeat
  const [victoryData, setVictoryData] = useState<{ timeSec: number; kills: number; damageTaken: number; gold: number; rank: string } | null>(null);
  const [isGameOver, setIsGameOver] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  // Initialize Phaser 3
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

    // Event Listeners
    const onState = (s: 'title' | 'playing' | 'paused' | 'gameover' | 'victory') => setGameState(s);
    const onStats = (stats: any) => setPlayerStats(stats);
    const onGold = (g: number) => setGold(g);
    const onSkills = (sk: any) => setSkills(sk);
    const onBoss = (b: any) => setBossHp(b);
    const onRoom = (r: any) => setRoomInfo(r);
    const onDialogue = (d: any) => setActiveDialogue(d);
    const onVictory = (v: any) => {
      setVictoryData(v);
      setGameState('victory');
    };
    const onOver = () => {
      setIsGameOver(true);
      setGameState('gameover');
    };

    EventBus.onEvent('game:state', onState);
    EventBus.onEvent('player:stats', onStats);
    EventBus.onEvent('player:gold', onGold);
    EventBus.onEvent('player:skills', onSkills);
    EventBus.onEvent('boss:hp', onBoss);
    EventBus.onEvent('room:changed', onRoom);
    EventBus.onEvent('story:dialogue', onDialogue);
    EventBus.onEvent('game:victory', onVictory);
    EventBus.onEvent('game:over', onOver);

    return () => {
      EventBus.offEvent('game:state', onState);
      EventBus.offEvent('player:stats', onStats);
      EventBus.offEvent('player:gold', onGold);
      EventBus.offEvent('player:skills', onSkills);
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

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none touch-none bg-[#07090e] flex items-center justify-center">
      {/* Desktop Scenic Ambient Wallpaper */}
      <div 
        className="hidden sm:block absolute inset-0 bg-cover bg-center bg-no-repeat filter blur-sm scale-110 opacity-40 -z-10"
        style={{ backgroundImage: "url('/backgrounds/emberdeep_sanctuary.jpg')" }}
      />
      <div className="hidden sm:block absolute inset-0 bg-black/60 -z-10" />

      {/* Main Game Container (Edge-to-edge on mobile, Gilded Frame on desktop) */}
      <div className="relative w-full h-full sm:w-[420px] sm:h-[92vh] sm:max-h-[860px] sm:rounded-[36px] sm:border-4 sm:border-amber-500/70 sm:shadow-[0_0_50px_rgba(245,158,11,0.3)] overflow-hidden bg-[#07090e] flex items-center justify-center">
        
        {/* Phaser Canvas Mount */}
        <div id="game-root" className="w-full h-full flex items-center justify-center" />

        {/* Title Screen Overlay */}
        {gameState === 'title' && <TitleOverlay />}

        {/* HUD Layer (Playing or Paused) */}
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

        {/* Story Dialogue Cutscene */}
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
        {isGameOver && (
          <div className="fixed sm:absolute inset-0 z-50 bg-black/85 flex items-center justify-center p-4 animate-fade-in">
            <div className="w-full max-w-xs bg-gradient-to-b from-[#1c1318] to-[#0d070a] border-2 border-red-600 rounded-3xl p-6 text-center space-y-4 shadow-2xl shadow-red-950/80">
              <div className="w-14 h-14 rounded-full bg-red-950/80 border-2 border-red-500 mx-auto flex items-center justify-center text-red-400 text-2xl animate-pulse">
                💀
              </div>
              <h2 className="text-2xl font-black font-fantasy text-red-500 uppercase tracking-wider">
                KAU GUGUR
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Kekuatan kuno penjaga Emberdeep menghempaskanmu. Bangkitlah kembali, ksatria!
              </p>
              <button
                onClick={() => window.location.reload()}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-wider active:scale-95 shadow-lg shadow-red-900/50 flex items-center justify-center gap-2 font-fantasy border border-red-400"
              >
                <RotateCcw size={16} />
                <span>Ulangi Ekspedisi</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
