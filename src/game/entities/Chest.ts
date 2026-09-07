import Phaser from 'phaser';

export class Chest extends Phaser.Physics.Arcade.Sprite {
  public tier: number = 1;
  public isOpened: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, tier: number = 1) {
    super(scene, x, y, 'chest');
    this.tier = tier;
    scene.add.existing(this);
    scene.physics.add.existing(this, true); // static body
  }

  public open(): { weaponUpgrade: boolean; gold: number; potion: boolean } {
    if (this.isOpened) return { weaponUpgrade: false, gold: 0, potion: false };
    this.isOpened = true;
    this.setTint(0x888888);

    if (this.tier === 1) {
      return { weaponUpgrade: true, gold: 10, potion: false };
    } else {
      return { weaponUpgrade: true, gold: 20, potion: true };
    }
  }
}
