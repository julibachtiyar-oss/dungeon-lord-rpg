import React, { useRef, useEffect, useImperativeHandle, forwardRef } from 'react';
import { GameEngine } from './gameEngine';
import { generateDungeon } from './dungeonGenerator';

const GameCanvas = forwardRef(function GameCanvas({
  floorConfig,
  heroClass,
  totalStats,
  mercenaryDef,
  onStatsUpdate,
  onDungeonClear,
  onGameOver,
  onLootDrop,
  onBossEncounter
}, ref) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateSize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      if (engineRef.current) {
        engineRef.current.resize(w, h, dpr);
      }
    };
    updateSize();

    const dungeonData = generateDungeon({ floorConfig });

    const engine = new GameEngine(canvas, {
      dungeonData,
      heroClass,
      playerStats: totalStats,
      mercenaryDef,
      onStatsUpdate,
      onDungeonClear,
      onGameOver,
      onLootDrop,
      onBossEncounter
    });

    const initialDpr = Math.min(window.devicePixelRatio || 1, 2.5);
    engine.resize(window.innerWidth, window.innerHeight, initialDpr);

    engineRef.current = engine;
    engine.start();

    const handleResize = () => {
      updateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      engine.stop();
    };
  }, [floorConfig, heroClass, totalStats, mercenaryDef]);

  useImperativeHandle(ref, () => ({
    setMove: (vx, vy) => {
      engineRef.current?.setInput(vx, vy);
    },
    attack: () => {
      engineRef.current?.triggerAttack();
    },
    skill: (idx) => {
      engineRef.current?.triggerSkill(idx);
    },
    dash: () => {
      engineRef.current?.triggerDash();
    },
    usePotion: (type) => {
      engineRef.current?.usePotion(type);
    },
    toggleTactics: () => {
      engineRef.current?.toggleTactics();
    }
  }));

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full block bg-dungeon-950 touch-none"
    />
  );
});

export default GameCanvas;
