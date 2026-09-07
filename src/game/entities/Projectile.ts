import Phaser from 'phaser';

export class Projectile extends Phaser.Physics.Arcade.Sprite {
  public damage: number = 10;
  private deathTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  public fire(x: number, y: number, angleRad: number, speed: number, damage: number, lifetimeMs: number): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.damage = damage;
    this.deathTime = this.scene.time.now + lifetimeMs;

    this.setRotation(angleRad);
    this.setVelocity(Math.cos(angleRad) * speed, Math.sin(angleRad) * speed);

    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) {
      body.enable = true;
      body.setSize(8, 4);
    }
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (this.active && time >= this.deathTime) {
      this.kill();
    }
  }

  public kill(): void {
    this.setActive(false);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.enable = false;
  }
}
