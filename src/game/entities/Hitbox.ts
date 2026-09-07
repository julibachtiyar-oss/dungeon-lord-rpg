import Phaser from 'phaser';

export class Hitbox extends Phaser.GameObjects.Zone {
  public damage: number = 10;
  public knockback: number = 20;
  public isCleave: boolean = false;
  public activeUntil: number = 0;
  public sourceX: number = 0;
  public sourceY: number = 0;

  constructor(scene: Phaser.Scene) {
    super(scene, 0, 0, 20, 20);
    scene.add.existing(this);
    scene.physics.add.existing(this);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(false);
    body.setImmovable(true);
    body.enable = false;
  }

  public activate(
    x: number,
    y: number,
    w: number,
    h: number,
    damage: number,
    knockback: number,
    duration: number,
    isCleave: boolean = false
  ): void {
    this.setPosition(x, y);
    this.setSize(w, h);
    this.damage = damage;
    this.knockback = knockback;
    this.isCleave = isCleave;
    this.sourceX = x;
    this.sourceY = y;
    this.activeUntil = this.scene.time.now + duration;

    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(w, h);
    body.enable = true;
  }

  public deactivate(): void {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.enable = false;
  }
}
