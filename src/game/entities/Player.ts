import Phaser from 'phaser';
import { Entity } from './Entity';
import { BALANCE } from '../config/balance';
import { EventBus } from '../events';
import { SFX } from '../audio/sfx';

export type PlayerState = 
  | 'idle' 
  | 'run' 
  | 'attack1' 
  | 'attack2' 
  | 'attack3' 
  | 'cleave' 
  | 'bulwark' 
  | 'dash' 
  | 'hurt' 
  | 'dead';

export class Player extends Entity {
  public currentState: PlayerState = 'idle';
  public facing: Phaser.Math.Vector2 = new Phaser.Math.Vector2(0, 1);
  
  // Progression
  public level: number = 1;
  public xp: number = 0;
  public gold: number = 0;
  public potions: number = BALANCE.player.potionsPerRun;
  public weaponTier: number = 1;

  // Timers & Cooldowns
  private stateEndTime: number = 0;
  private comboBufferUntil: number = 0;
  private hasBufferedAttack: boolean = false;
  private cleaveReadyUntil: number = 0;
  private bulwarkReadyUntil: number = 0;
  private bulwarkActiveUntil: number = 0;
  private dashReadyUntil: number = 0;
  private dashEndTime: number = 0;
  private dashVelocity: Phaser.Math.Vector2 = new Phaser.Math.Vector2();

  // Attack references
  public swordSprite!: Phaser.GameObjects.Sprite;
  private afterimageTimer: number = 0;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'knight');
    this.maxHp = BALANCE.player.maxHp;
    this.hp = this.maxHp;

    // Body collider set to feet (GDD §3.1: 10x8 px)
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.setSize(BALANCE.player.colliderWidth, BALANCE.player.colliderHeight);
    body.setOffset(3, 20);

    // Sword child sprite for sweeps
    this.swordSprite = scene.add.sprite(x, y, 'weapon');
    this.swordSprite.setOrigin(0.2, 0.8);
    this.swordSprite.setVisible(false);
  }

  public getDamage(): number {
    const base = BALANCE.player.baseDamage;
    const lvlBonus = (this.level - 1) * BALANCE.player.damagePerLevel;
    const wepBonus = (this.weaponTier - 1) * BALANCE.player.damagePerWeaponTier;
    return base + lvlBonus + wepBonus;
  }

  public handleInput(
    moveVec: { x: number; y: number },
    attackPressed: boolean,
    cleavePressed: boolean,
    bulwarkPressed: boolean,
    dashPressed: boolean,
    potionPressed: boolean,
    nearestEnemyPos: { x: number; y: number } | null = null
  ): void {
    const time = this.scene.time.now;

    // Potions
    if (potionPressed && this.potions > 0 && this.hp < this.maxHp && this.currentState !== 'dead') {
      this.potions--;
      this.heal(BALANCE.player.potionHeal);
      SFX.potion();
      this.emitStats();
    }

    // Dead or Stunned
    if (this.currentState === 'dead') return;

    // Bulwark state active check
    const isBulwarkActive = time < this.bulwarkActiveUntil;

    // Dash Trigger
    if (dashPressed && time >= this.dashReadyUntil && this.currentState !== 'dash') {
      this.startDash(moveVec, time);
      return;
    }

    // Ember Cleave Trigger
    if (cleavePressed && time >= this.cleaveReadyUntil && this.canCancelIntoAction()) {
      this.startCleave(time, nearestEnemyPos);
      return;
    }

    // Bulwark Trigger
    if (bulwarkPressed && time >= this.bulwarkReadyUntil && this.canCancelIntoAction()) {
      this.startBulwark(time);
      return;
    }

    // Combo Attack Trigger (Buffered input)
    if (attackPressed) {
      if (this.isAttackingState()) {
        this.hasBufferedAttack = true;
        this.comboBufferUntil = time + BALANCE.player.comboBufferWindow;
      } else if (this.canAttack()) {
        this.startComboAttack(1, time, nearestEnemyPos);
      }
    }

    // State Execution
    if (this.currentState === 'dash') {
      this.setVelocity(this.dashVelocity.x, this.dashVelocity.y);
      if (time >= this.dashEndTime) {
        this.currentState = 'idle';
      }
      return;
    }

    if (this.isAttackingState()) {
      this.setVelocity(0, 0); // Hero committed to attack
      if (time >= this.stateEndTime) {
        // Attack finished, check buffered continuation
        if (this.hasBufferedAttack && time <= this.comboBufferUntil) {
          this.hasBufferedAttack = false;
          if (this.currentState === 'attack1') {
            this.startComboAttack(2, time, nearestEnemyPos);
          } else if (this.currentState === 'attack2') {
            this.startComboAttack(3, time, nearestEnemyPos);
          } else {
            this.currentState = 'idle';
          }
        } else {
          this.currentState = 'idle';
        }
      }
      return;
    }

    // Normal Movement
    let speed = BALANCE.player.moveSpeed;
    if (isBulwarkActive) speed *= BALANCE.player.bulwark.moveSpeedMultiplier;

    if (moveVec.x !== 0 || moveVec.y !== 0) {
      this.setVelocity(moveVec.x * speed, moveVec.y * speed);
      this.facing.set(moveVec.x, moveVec.y).normalize();
      this.currentState = 'run';
      this.setFlipX(moveVec.x < 0);
    } else {
      this.setVelocity(0, 0);
      this.currentState = 'idle';
    }
  }

  private canCancelIntoAction(): boolean {
    if (this.currentState === 'idle' || this.currentState === 'run') return true;
    if (this.currentState === 'attack1' || this.currentState === 'attack2') return true;
    return false;
  }

  private canAttack(): boolean {
    return this.currentState === 'idle' || this.currentState === 'run';
  }

  private isAttackingState(): boolean {
    return (
      this.currentState === 'attack1' ||
      this.currentState === 'attack2' ||
      this.currentState === 'attack3' ||
      this.currentState === 'cleave'
    );
  }

  private startComboAttack(hitIndex: 1 | 2 | 3, time: number, enemyPos: { x: number; y: number } | null): void {
    const hitData = BALANCE.player.combo[hitIndex - 1];
    this.currentState = (`attack${hitIndex}`) as PlayerState;
    this.stateEndTime = time + hitData.startup + hitData.active + hitData.recovery;

    // Auto-aim direction adjustment
    this.applyAutoAim(enemyPos);

    // Audio
    if (hitIndex === 1) SFX.swing1();
    else if (hitIndex === 2) SFX.swing2();
    else SFX.swing3();

    // Trigger weapon visual sweep
    this.triggerWeaponSweep(hitIndex);
  }

  private startCleave(time: number, enemyPos: { x: number; y: number } | null): void {
    const cleave = BALANCE.player.cleave;
    this.currentState = 'cleave';
    this.cleaveReadyUntil = time + cleave.cooldown;
    this.stateEndTime = time + cleave.startup + cleave.active + cleave.recovery;

    this.applyAutoAim(enemyPos);
    SFX.cleave();
    this.setTint(0xffaa00);
    this.scene.time.delayedCall(cleave.startup, () => this.clearTint());
    this.triggerWeaponSweep(3);
  }

  private startBulwark(time: number): void {
    const bulwark = BALANCE.player.bulwark;
    this.bulwarkReadyUntil = time + bulwark.cooldown;
    this.bulwarkActiveUntil = time + bulwark.duration;
    SFX.shieldUp();
  }

  private startDash(moveVec: { x: number; y: number }, time: number): void {
    const dash = BALANCE.player.dash;
    this.currentState = 'dash';
    this.dashReadyUntil = time + dash.cooldown;
    this.dashEndTime = time + dash.duration;
    this.isInvulnerable = true;
    this.invulnerableUntil = time + dash.iFrames;

    let dirX = moveVec.x;
    let dirY = moveVec.y;
    if (dirX === 0 && dirY === 0) {
      dirX = this.facing.x;
      dirY = this.facing.y;
    }
    const len = Math.hypot(dirX, dirY) || 1;
    const speed = (dash.distance / (dash.duration / 1000));
    this.dashVelocity.set((dirX / len) * speed, (dirY / len) * speed);

    SFX.dash();
  }

  private applyAutoAim(enemyPos: { x: number; y: number } | null): void {
    if (!enemyPos) return;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, enemyPos.x, enemyPos.y);
    if (dist <= BALANCE.player.autoAimRadius) {
      this.facing.set(enemyPos.x - this.x, enemyPos.y - this.y).normalize();
      this.setFlipX(this.facing.x < 0);
    }
  }

  private triggerWeaponSweep(hitIndex: number): void {
    this.swordSprite.setVisible(true);
    this.swordSprite.setPosition(this.x + this.facing.x * 12, this.y + this.facing.y * 12);
    const baseAngle = Phaser.Math.RadToDeg(Math.atan2(this.facing.y, this.facing.x));
    this.swordSprite.setAngle(baseAngle - 45);

    this.scene.tweens.add({
      targets: this.swordSprite,
      angle: baseAngle + 45,
      duration: hitIndex === 3 ? 140 : 100,
      ease: 'Cubic.easeOut',
      onComplete: () => {
        this.swordSprite.setVisible(false);
      }
    });
  }

  public override takeDamage(damage: number, knockX: number = 0, knockY: number = 0): boolean {
    const time = this.scene.time.now;
    if (this.isInvulnerable || this.hp <= 0) return false;

    // Parry window check (GDD §3.6: first 200 ms of Bulwark)
    const isBulwark = time < this.bulwarkActiveUntil;
    const bulwarkAge = time - (this.bulwarkActiveUntil - BALANCE.player.bulwark.duration);
    if (isBulwark && bulwarkAge <= BALANCE.player.bulwark.parryWindow) {
      // PARRY SUCCESS!
      SFX.parry();
      this.bulwarkReadyUntil -= (BALANCE.player.bulwark.cooldown * BALANCE.player.bulwark.parryCooldownReduction);
      EventBus.emitEvent('player:damaged', { damage: 0, currentHp: this.hp });
      return false;
    }

    // Damage reduction during Bulwark
    let actualDamage = damage;
    if (isBulwark) {
      actualDamage = Math.round(damage * (1 - BALANCE.player.bulwark.damageReduction));
    }

    const hit = super.takeDamage(actualDamage, knockX, knockY);
    if (hit) {
      SFX.hurt();
      this.isInvulnerable = true;
      this.invulnerableUntil = time + BALANCE.player.invulnerableDuration;
      EventBus.emitEvent('player:damaged', { damage: actualDamage, currentHp: this.hp });
      this.emitStats();

      if (this.hp <= 0) {
        this.currentState = 'dead';
        this.setVelocity(0, 0);
      }
    }
    return hit;
  }

  public addXp(amount: number): void {
    this.xp += amount;
    const xpTable = BALANCE.player.levelXp;
    while (this.level < 5 && this.xp >= xpTable[this.level]) {
      this.level++;
      this.maxHp += BALANCE.player.hpPerLevel;
      this.hp = Math.min(this.maxHp, this.hp + BALANCE.player.levelHealBonus);
      SFX.levelUp();
      EventBus.emitEvent('player:levelup', undefined as unknown as void);
    }
    this.emitStats();
  }

  public addGold(amount: number): void {
    this.gold += amount;
    SFX.coin();
    EventBus.emitEvent('player:gold', this.gold);
  }

  public emitStats(): void {
    const nextXp = this.level < 5 ? BALANCE.player.levelXp[this.level] : BALANCE.player.levelXp[4];
    EventBus.emitEvent('player:stats', {
      hp: this.hp,
      maxHp: this.maxHp,
      level: this.level,
      xp: this.xp,
      nextXp,
      potions: this.potions
    });
  }

  public getSkillState(time: number) {
    const cleaveElapsed = Math.max(0, this.cleaveReadyUntil - time);
    const bulwarkElapsed = Math.max(0, this.bulwarkReadyUntil - time);
    const dashElapsed = Math.max(0, this.dashReadyUntil - time);

    return {
      cleaveReady: cleaveElapsed === 0,
      cleaveCooldownProgress: cleaveElapsed / BALANCE.player.cleave.cooldown,
      bulwarkReady: bulwarkElapsed === 0,
      bulwarkCooldownProgress: bulwarkElapsed / BALANCE.player.bulwark.cooldown,
      dashReady: dashElapsed === 0,
      dashCooldownProgress: dashElapsed / BALANCE.player.dash.cooldown,
    };
  }
}
