import Phaser from 'phaser';
import { SceneKey } from '../config/keys';
import { unlockAudio } from '../audio/sfx';

export class BootScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Boot);
  }

  create(): void {
    // Audio unlock listener on first user tap/click
    this.input.once('pointerdown', () => {
      unlockAudio();
    });

    this.scene.start(SceneKey.Preload);
  }
}
