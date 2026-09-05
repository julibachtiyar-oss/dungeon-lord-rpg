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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
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
