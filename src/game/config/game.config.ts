import Phaser from 'phaser';

export const GAME_WIDTH = 180;   // logical px, 11.25 tile
export const GAME_HEIGHT = 320;  // logical px, 20 tile (9:16 portrait)

export const createGameConfig = (
  scenes: Phaser.Types.Scenes.SceneType[]
): Phaser.Types.Core.GameConfig => ({
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: 'game-root',
  backgroundColor: '#0b0a10',
  pixelArt: true,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
      debug: false,
    },
  },
  render: {
    antialias: false,
    powerPreference: 'high-performance',
  },
  input: {
    activePointers: 3, // Multi-touch: joystick + 2 buttons simultaneously
  },
  scene: scenes,
});
