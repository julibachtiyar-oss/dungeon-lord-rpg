import Phaser from 'phaser';
import { SceneKey } from '../config/keys';
import { EventBus } from '../events';

export class TitleScene extends Phaser.Scene {
  private crystal!: Phaser.GameObjects.Arc;

  constructor() {
    super(SceneKey.Title);
  }

  create(): void {
    const cx = this.cameras.main.width * 0.5;
    const cy = this.cameras.main.height * 0.45;

    // Glowing atmospheric rune backdrop
    this.crystal = this.add.circle(cx, cy, 32, 0xa855f7, 0.4);
    this.tweens.add({
      targets: this.crystal,
      scaleX: 1.25,
      scaleY: 1.25,
      alpha: 0.8,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    EventBus.emitEvent('game:state', 'title');

    EventBus.onEvent('game:start', () => {
      this.scene.start(SceneKey.Game);
    }, this);
  }
}
