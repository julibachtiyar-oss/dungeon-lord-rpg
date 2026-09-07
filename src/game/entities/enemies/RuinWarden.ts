import Phaser from 'phaser';
import { Enemy } from './Enemy';
import { BALANCE } from '../../config/balance';
import { EventBus } from '../../events';
import { SFX } from '../../audio/sfx';

export class RuinWarden extends Enemy {
  public phase: number = 1;
  private actionEndTime: number = 0;
  private nextSlamTime: number = 0;
  private nextChargeTime: number = 0;
  private nextShockwaveTime: number = 0;
  private telegraphCircle!: Phaser.GameObjects.Arc;
  private chargeDir: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'big_demon');
    const cfg = BALANCE.enemies.boss;
    this.maxHp = cfg.hp;
    this.hp = cfg.hp;
    this.xpReward = cfg.xp;
    this.goldMin = 50;
    this.goldMax = 80;
    this.alertRadius = 250;

    // Body collider
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(24, 28);
    body.setOffset(4, 8);

    // Telegraph red circle
    this.telegraphCircle = scene.add.circle(0, 0, cfg.slamRadius, 0xff0000, 0.35);
    this.telegraphCircle.setVisible(false);

    this.setupFSM();
    this.emitBossHp();
  }

  private setupFSM(): void {
    const cfg = BALANCE.enemies.boss;

    this.fsm
      .addState({
        name: 'idle',
        update: (ctx, time) => {
          if (!ctx.targetPlayer) return;
          const dist = Phaser.Math.Distance.Between(ctx.x, ctx.y, ctx.targetPlayer.x, ctx.targetPlayer.y);
          if (dist <= ctx.alertRadius) {
            ctx.fsm.setState('approach');
          }
        }
      })
      .addState({
        name: 'approach',
        update: (ctx, time) => {
          if (!ctx.targetPlayer) return;

          // Check Phase Transitions
          this.checkPhaseTransitions(time);

          // Action choices by phase
          if (this.phase >= 3 && time >= this.nextShockwaveTime) {
            ctx.fsm.setState('shockwave_windup');
            return;
          }

          if (this.phase >= 2 && time >= this.nextChargeTime) {
            ctx.fsm.setState('charge_windup');
            return;
          }

          if (time >= this.nextSlamTime) {
            ctx.fsm.setState('slam_windup');
            return;
          }

          // Move toward player
          const speed = this.phase === 1 ? cfg.speedP1 : this.phase === 2 ? cfg.speedP2 : cfg.speedP3;
          const angle = Phaser.Math.Angle.Between(ctx.x, ctx.y, ctx.targetPlayer.x, ctx.targetPlayer.y);
          ctx.setVelocity(Math.cos(angle) * speed, Math.sin(angle) * speed);
          ctx.setFlipX(ctx.targetPlayer.x < ctx.x);
        }
      })
      .addState({
        name: 'slam_windup',
        enter: (ctx) => {
          ctx.setVelocity(0, 0);
          ctx.setTint(0xff9999);
          if (ctx.targetPlayer) {
            this.telegraphCircle.setPosition(ctx.targetPlayer.x, ctx.targetPlayer.y);
            this.telegraphCircle.setRadius(cfg.slamRadius);
            this.telegraphCircle.setVisible(true);
          }
          this.actionEndTime = ctx.scene.time.now + cfg.slamWindup;
        },
        update: (ctx, time) => {
          if (time >= this.actionEndTime) {
            // SLAM IMPACT
            this.telegraphCircle.setVisible(false);
            ctx.clearTint();
            SFX.hitStone();

            // Check damage to player in radius
            if (ctx.targetPlayer) {
              const d = Phaser.Math.Distance.Between(this.telegraphCircle.x, this.telegraphCircle.y, ctx.targetPlayer.x, ctx.targetPlayer.y);
              if (d <= cfg.slamRadius) {
                (ctx.targetPlayer as any).takeDamage?.(cfg.slamDamage, 0, 0);
              }
            }

            const cd = this.phase === 1 ? cfg.slamCooldownP1 : cfg.slamCooldownP2;
            this.nextSlamTime = time + cd;
            ctx.fsm.setState('approach');
          }
        }
      })
      .addState({
        name: 'charge_windup',
        enter: (ctx) => {
          ctx.setVelocity(0, 0);
          ctx.setTint(0xff5555);
          if (ctx.targetPlayer) {
            this.chargeDir.set(ctx.targetPlayer.x - ctx.x, ctx.targetPlayer.y - ctx.y).normalize();
          }
          this.actionEndTime = ctx.scene.time.now + cfg.chargeWindup;
        },
        update: (ctx, time) => {
          if (time >= this.actionEndTime) {
            ctx.fsm.setState('charge_rush');
          }
        }
      })
      .addState({
        name: 'charge_rush',
        enter: (ctx) => {
          ctx.clearTint();
          ctx.setVelocity(this.chargeDir.x * cfg.chargeSpeed, this.chargeDir.y * cfg.chargeSpeed);
          this.actionEndTime = ctx.scene.time.now + 1200;
        },
        update: (ctx, time) => {
          if (time >= this.actionEndTime) {
            ctx.fsm.setState('approach');
          }
        }
      })
      .addState({
        name: 'shockwave_windup',
        enter: (ctx) => {
          ctx.setVelocity(0, 0);
          ctx.setTint(0xaa55ff);
          this.actionEndTime = ctx.scene.time.now + cfg.shockwaveWindup;
        },
        update: (ctx, time) => {
          if (time >= this.actionEndTime) {
            ctx.clearTint();
            SFX.bossRoar();
            this.nextShockwaveTime = time + cfg.shockwaveCooldown;
            ctx.fsm.setState('approach');
          }
        }
      })
      .addState({
        name: 'phase_transition',
        enter: (ctx) => {
          ctx.setVelocity(0, 0);
          ctx.isInvulnerable = true;
          SFX.bossRoar();
          ctx.setTint(0xff3333);
          this.actionEndTime = ctx.scene.time.now + cfg.phaseTransitionDuration;
        },
        update: (ctx, time) => {
          if (time >= this.actionEndTime) {
            ctx.isInvulnerable = false;
            ctx.clearTint();
            ctx.fsm.setState('approach');
          }
        }
      });

    this.fsm.setState('idle');
  }

  private checkPhaseTransitions(time: number): void {
    const hpRatio = this.hp / this.maxHp;
    if (this.phase === 1 && hpRatio <= 0.66) {
      this.phase = 2;
      this.fsm.setState('phase_transition');
    } else if (this.phase === 2 && hpRatio <= 0.33) {
      this.phase = 3;
      this.fsm.setState('phase_transition');
    }
  }

  public override takeDamage(damage: number, knockX: number = 0, knockY: number = 0): boolean {
    // Ruin Warden is immune to knockback (GDD §4.4)
    const hit = super.takeDamage(damage, 0, 0);
    if (hit) {
      this.emitBossHp();
      if (this.hp <= 0) {
        EventBus.emitEvent('boss:hp', null);
        EventBus.emitEvent('boss:defeated', undefined as unknown as void);
      }
    }
    return hit;
  }

  private emitBossHp(): void {
    EventBus.emitEvent('boss:hp', {
      current: this.hp,
      max: this.maxHp,
      phase: this.phase,
      name: 'RUIN WARDEN'
    });
  }

  protected override die(): void {
    super.die();
    this.telegraphCircle.destroy();
  }
}
