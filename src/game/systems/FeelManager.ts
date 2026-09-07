import Phaser from 'phaser';
import { GAME_WIDTH } from '../config/game.config';

export class FeelManager {
  private scene: Phaser.Scene;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
  }

  // AGENTS.md §4: Hit-pause using scene.time.timeScale + physics.world.timeScale
  public hitPause(durationMs: number): void {
    this.scene.time.timeScale = 0.05;
    this.scene.physics.world.timeScale = 20;

    setTimeout(() => {
      if (this.scene && this.scene.time) {
        this.scene.time.timeScale = 1.0;
        this.scene.physics.world.timeScale = 1.0;
      }
    }, durationMs);
  }

  // Camera shake intensity is a fraction of viewport (AGENTS.md §4)
  public shake(intensityPx: number, durationMs: number = 100): void {
    const fraction = intensityPx / GAME_WIDTH;
    this.scene.cameras.main.shake(durationMs, fraction);
  }

  // Floating damage number popup
  public spawnDamageNumber(x: number, y: number, amount: number, isCritical: boolean = false): void {
    const color = isCritical ? '#facc15' : '#ffffff';
    const size = isCritical ? '14px' : '10px';
    const text = this.scene.add.text(x, y - 8, amount.toString(), {
      fontSize: size,
      fontFamily: 'monospace',
      color: color,
      stroke: '#000000',
      strokeThickness: 2,
    });
    text.setOrigin(0.5, 0.5);
    text.setDepth(1000);

    this.scene.tweens.add({
      targets: text,
      y: y - 24,
      alpha: 0,
      duration: 600,
      ease: 'Cubic.easeOut',
      onComplete: () => text.destroy(),
    });
  }

  public vibrate(ms: number = 30): void {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(ms);
      } catch (e) {}
    }
  }
}
