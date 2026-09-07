import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { BALANCE } from '../../config/balance';
import { Projectile } from '../Projectile';

export class SkeletonArcher extends Enemy {
  private nextAttackTime: number = 0;
  private windupEndTime: number = 0;
  public projectilePool: Phaser.GameObjects.Group | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'skelet');
    const cfg = BALANCE.enemies.skeleton;
    this.maxHp = cfg.hp;
    this.hp = cfg.hp;
    this.xpReward = cfg.xp;
    this.goldMin = cfg.goldMin;
    this.goldMax = cfg.goldMax;
    this.alertRadius = cfg.alertRadius;

    this.setupFSM();
  }

  private setupFSM(): void {
    const cfg = BALANCE.enemies.skeleton;

    this.fsm
      .addState({
        name: 'idle',
        update: (ctx) => {
          if (!ctx.targetPlayer) return;
          const dist = Phaser.Math.Distance.Between(ctx.x, ctx.y, ctx.targetPlayer.x, ctx.targetPlayer.y);
          if (dist <= ctx.alertRadius) {
            ctx.fsm.setState('positioning');
          }
        }
      })
      .addState({
        name: 'positioning',
        update: (ctx, time) => {
          if (!ctx.targetPlayer) {
            ctx.fsm.setState('idle');
            return;
          }

          const dist = Phaser.Math.Distance.Between(ctx.x, ctx.y, ctx.targetPlayer.x, ctx.targetPlayer.y);
          const angle = Phaser.Math.Angle.Between(ctx.x, ctx.y, ctx.targetPlayer.x, ctx.targetPlayer.y);

          // Maintain spacing 80 - 120 px
          if (dist < cfg.keepDistanceMin) {
            // Back up
            ctx.setVelocity(-Math.cos(angle) * cfg.moveSpeed, -Math.sin(angle) * cfg.moveSpeed);
          } else if (dist > cfg.keepDistanceMax) {
            // Close in
            ctx.setVelocity(Math.cos(angle) * cfg.moveSpeed, Math.sin(angle) * cfg.moveSpeed);
          } else {
            // In optimal range
            ctx.setVelocity(0, 0);
            if (time >= this.nextAttackTime) {
              ctx.fsm.setState('windup');
            }
          }

          ctx.setFlipX(ctx.targetPlayer.x < ctx.x);
        }
      })
      .addState({
        name: 'windup',
        enter: (ctx) => {
          ctx.setVelocity(0, 0);
          ctx.setTint(0xff9999);
          this.windupEndTime = ctx.scene.time.now + cfg.windupDuration;
        },
        update: (ctx, time) => {
          if (time >= this.windupEndTime) {
            this.fireArrow();
            this.nextAttackTime = time + cfg.attackCooldown;
            ctx.clearTint();
            ctx.fsm.setState('positioning');
          }
        }
      });

    this.fsm.setState('idle');
  }

  private fireArrow(): void {
    if (!this.targetPlayer || !this.projectilePool) return;
    const arrow = this.projectilePool.get() as Projectile | null;
    if (!arrow) return;

    const angle = Phaser.Math.Angle.Between(this.x, this.y, this.targetPlayer.x, this.targetPlayer.y);
    const cfg = BALANCE.enemies.skeleton;
    arrow.fire(this.x, this.y, angle, cfg.arrowSpeed, cfg.arrowDamage, cfg.arrowLifetime);
  }
}
