import Phaser from 'phaser';

export class Entity extends Phaser.Physics.Arcade.Sprite {
  public hp: number = 100;
  public maxHp: number = 100;
  public isInvulnerable: boolean = false;
  protected invulnerableUntil: number = 0;
  protected flashUntil: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string, frame?: string | number) {
    super(scene, x, y, texture, frame);
    scene.add.existing(this);
    scene.physics.add.existing(this);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    // AGENTS.md §4: Depth sorting once per frame in entity preUpdate
    this.setDepth(this.y);

    if (this.isInvulnerable && time >= this.invulnerableUntil) {
      this.isInvulnerable = false;
      this.setAlpha(1.0);
    }

    if (this.flashUntil > 0 && time >= this.flashUntil) {
      this.clearTint();
      this.flashUntil = 0;
    }
  }

  public takeDamage(damage: number, knockX: number = 0, knockY: number = 0): boolean {
    if (this.hp <= 0 || this.isInvulnerable) return false;

    this.hp = Math.max(0, this.hp - damage);

    // Hit flash reaction (GDD §8: 80 ms white flash)
    this.setTint(0xffffff);
    this.flashUntil = (this.scene?.time?.now ?? Date.now()) + 80;

    // Apply knockback
    if (knockX !== 0 || knockY !== 0) {
      this.setVelocity(knockX, knockY);
    }

    return true;
  }

  public heal(amount: number): void {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }
}
