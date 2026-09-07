import Phaser from 'phaser';
import { SceneKey } from '../config/keys';
import { EventBus } from '../events';

export class UIBridgeScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.UIBridge);
  }

  create(): void {
    EventBus.onEvent('game:pause', (isPaused) => {
      const gameScene = this.scene.get(SceneKey.Game);
      if (gameScene) {
        if (isPaused) {
          gameScene.scene.pause();
          EventBus.emitEvent('game:state', 'paused');
        } else {
          gameScene.scene.resume();
          EventBus.emitEvent('game:state', 'playing');
        }
      }
    });

    EventBus.onEvent('game:restart', () => {
      const gameScene = this.scene.get(SceneKey.Game);
      if (gameScene) {
        gameScene.scene.restart();
      }
    });
  }
}
