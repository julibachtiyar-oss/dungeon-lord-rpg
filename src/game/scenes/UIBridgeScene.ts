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

    EventBus.onEvent('game:start', () => {
      if (this.scene.isActive(SceneKey.Title)) {
        this.scene.stop(SceneKey.Title);
      }
      const gameScene = this.scene.get(SceneKey.Game);
      if (gameScene && this.scene.isActive(SceneKey.Game)) {
        gameScene.scene.restart();
      } else {
        this.scene.start(SceneKey.Game);
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
