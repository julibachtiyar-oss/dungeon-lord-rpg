import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { GameEngine } from './gameEngine';
import { generateDungeon } from './dungeonGenerator';
import { sound } from './soundEngine';

const GameCanvas = forwardRef(function GameCanvas({
  floorConfig,
  heroClass,
  totalStats,
  onStatsUpdate,
  onDungeonClear,
  onGameOver,
  onLootDrop
}, ref) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set canvas dimensions to window size
    const updateSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    updateSize();

    // Generate dungeon floor
    const dungeonData = generateDungeon({ floorConfig });

    // Initialize Game Engine
    const engine = new GameEngine(canvas, {
      dungeonData,
      heroClass,
      playerStats: totalStats,
      onStatsUpdate,
      onDungeonClear,
      onGameOver,
      onLootDrop
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
  }, [floorConfig, heroClass, totalStats]);

  // Expose engine controls to VirtualControls
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
