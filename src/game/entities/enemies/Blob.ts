import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { BALANCE } from '../../config/balance';

export class Blob extends Enemy {
  private nextJumpTime: number = 0;
  private jumpEndTime: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'swampy');
    const cfg = BALANCE.enemies.blob;
    this.maxHp = cfg.hp;
    this.hp = cfg.hp;
    this.xpReward = cfg.xp;
    this.goldMin = cfg.goldMin;
    this.goldMax = cfg.goldMax;
    this.alertRadius = cfg.alertRadius;

    this.setupFSM();
  }

  private setupFSM(): void {
    const cfg = BALANCE.enemies.blob;

    this.fsm
      .addState({
        name: 'idle',
        update: (_, time) => {
          if (!this.targetPlayer) return;
          const dist = Phaser.Math.Distance.Between(this.x, this.y, this.targetPlayer.x, this.targetPlayer.y);
          if (dist <= this.alertRadius && time >= this.nextJumpTime) {
            this.fsm.setState('windup');
          }
        }
      })
      .addState({
        name: 'windup',
        enter: () => {
          // Squash telegraph
          this.setTint(0xff9999);
          this.scene.tweens.add({
            targets: this,
            scaleX: 1.3,
            scaleY: 0.7,
            duration: cfg.jumpWindup,
            ease: 'Cubic.easeOut',
            onComplete: () => {
              this.fsm.setState('jump');
            }
          });
        }
      })
      .addState({
        name: 'jump',
        enter: (ctx) => {
          ctx.clearTint();
          if (!ctx.targetPlayer) {
            ctx.fsm.setState('idle');
            return;
          }
          const angle = Phaser.Math.Angle.Between(ctx.x, ctx.y, ctx.targetPlayer.x, ctx.targetPlayer.y);
          const speed = (cfg.jumpDistance / (cfg.jumpDuration / 1000));
          ctx.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);

          // Stretch in air
          ctx.setScale(0.8, 1.3);
          this.jumpEndTime = ctx.scene.time.now + cfg.jumpDuration;
        },
        update: (ctx, time) => {
          if (time >= this.jumpEndTime) {
            ctx.setVelocity(0, 0);
            // Landing squash
            ctx.scene.tweens.add({
              targets: ctx,
              scaleX: 1.2,
              scaleY: 0.8,
              duration: 100,
              yoyo: true,
              onComplete: () => {
                ctx.setScale(1.0, 1.0);
                this.nextJumpTime = time + cfg.jumpInterval;
                ctx.fsm.setState('idle');
              }
            });
          }
        }
      });

    this.fsm.setState('idle');
  }
}
