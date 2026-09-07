import Phaser from 'phaser';

export type PickupType = 'gold' | 'potion';

export class Pickup extends Phaser.Physics.Arcade.Sprite {
  public pickupType: PickupType = 'gold';
  public value: number = 1;
  private isCollected: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  public spawn(x: number, y: number, type: PickupType, val: number): void {
    this.setPosition(x, y);
    this.setActive(true);
    this.setVisible(true);
    this.pickupType = type;
    this.value = val;
    this.isCollected = false;

    // Small pop / bounce animation
    this.setVelocity(Phaser.Math.Between(-30, 30), Phaser.Math.Between(-50, -20));
    this.setDrag(100, 100);
  }

  public magnetTo(targetX: number, targetY: number, speed: number = 160): void {
    if (this.isCollected) return;
    const angle = Phaser.Math.Angle.Between(this.x, this.y, targetX, targetY);
    this.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
  }

  public collect(): void {
    this.isCollected = true;
    this.setActive(false);
    this.setVisible(false);
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.enable = false;
  }
}
