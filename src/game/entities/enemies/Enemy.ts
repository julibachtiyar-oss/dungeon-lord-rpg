import Phaser from 'phaser';
import { Entity } from '../Entity';
import { StateMachine } from '../../fsm/StateMachine';

export class Enemy extends Entity {
  public fsm: StateMachine<Enemy>;
  public alertRadius: number = 96;
  public xpReward: number = 10;
  public goldMin: number = 2;
  public goldMax: number = 5;
  public targetPlayer: Phaser.Physics.Arcade.Sprite | null = null;
  public isDead: boolean = false;

  constructor(scene: Phaser.Scene, x: number, y: number, texture: string) {
    super(scene, x, y, texture);
    this.fsm = new StateMachine<Enemy>(this);
  }

  preUpdate(time: number, delta: number): void {
    super.preUpdate(time, delta);
    if (!this.isDead) {
      this.fsm.update(time, delta);
    }
  }

  public override takeDamage(damage: number, knockX: number = 0, knockY: number = 0): boolean {
    const hit = super.takeDamage(damage, knockX, knockY);
    if (hit && this.hp <= 0 && !this.isDead) {
      this.die();
    }
    return hit;
  }

  protected die(): void {
    this.isDead = true;
    this.setVelocity(0, 0);

    // Fade out and disable body
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body) body.enable = false;

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        this.destroy();
      }
    });
  }
}
