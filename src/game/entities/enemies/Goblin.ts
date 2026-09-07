import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { BALANCE } from '../../config/balance';

export class Goblin extends Enemy {
  private windupEndTime: number = 0;
  private lungeEndTime: number = 0;
  private recoverEndTime: number = 0;
  private lungeDir: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'goblin');
    const cfg = BALANCE.enemies.goblin;
    this.maxHp = cfg.hp;
    this.hp = cfg.hp;
    this.xpReward = cfg.xp;
    this.goldMin = cfg.goldMin;
    this.goldMax = cfg.goldMax;
    this.alertRadius = cfg.alertRadius;

    this.setupFSM();
  }

  private setupFSM(): void {
    const cfg = BALANCE.enemies.goblin;

    this.fsm
      .addState({
        name: 'idle',
        update: (ctx) => {
          if (!ctx.targetPlayer) return;
          const dist = Phaser.Math.Distance.Between(ctx.x, ctx.y, ctx.targetPlayer.x, ctx.targetPlayer.y);
          if (dist <= ctx.alertRadius) {
            ctx.fsm.setState('chase');
          }
        }
      })
      .addState({
        name: 'chase',
        update: (ctx) => {
          if (!ctx.targetPlayer) {
            ctx.fsm.setState('idle');
            return;
          }
          const dist = Phaser.Math.Distance.Between(ctx.x, ctx.y, ctx.targetPlayer.x, ctx.targetPlayer.y);
          if (dist <= cfg.lungeTriggerDistance) {
            ctx.fsm.setState('windup');
            return;
          }
          const angle = Phaser.Math.Angle.Between(ctx.x, ctx.y, ctx.targetPlayer.x, ctx.targetPlayer.y);
          ctx.setVelocity(Math.cos(angle) * cfg.moveSpeed, Math.sin(angle) * cfg.moveSpeed);
          ctx.setFlipX(ctx.targetPlayer.x < ctx.x);
        }
      })
      .addState({
        name: 'windup',
        enter: (ctx) => {
          ctx.setVelocity(0, 0);
          ctx.setTint(0xff9999);
          if (ctx.targetPlayer) {
            this.lungeDir.set(ctx.targetPlayer.x - ctx.x, ctx.targetPlayer.y - ctx.y).normalize();
          }
          this.windupEndTime = ctx.scene.time.now + cfg.windupDuration;
        },
        update: (ctx, time) => {
          if (time >= this.windupEndTime) {
            ctx.fsm.setState('lunge');
          }
        }
      })
      .addState({
        name: 'lunge',
        enter: (ctx) => {
          ctx.clearTint();
          const speed = (cfg.lungeDistance / (cfg.lungeDuration / 1000));
          ctx.setVelocity(this.lungeDir.x * speed, this.lungeDir.y * speed);
          this.lungeEndTime = ctx.scene.time.now + cfg.lungeDuration;
        },
        update: (ctx, time) => {
          if (time >= this.lungeEndTime) {
            ctx.fsm.setState('recover');
          }
        }
      })
      .addState({
        name: 'recover',
        enter: (ctx) => {
          ctx.setVelocity(0, 0);
          ctx.setTint(0xaaaaaa);
          this.recoverEndTime = ctx.scene.time.now + cfg.recoveryDuration;
        },
        update: (ctx, time) => {
          if (time >= this.recoverEndTime) {
            ctx.clearTint();
            ctx.fsm.setState('chase');
          }
        }
      });

    this.fsm.setState('idle');
  }
}
