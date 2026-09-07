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

  // Attached Visuals
  public swordSprite: Phaser.GameObjects.Sprite;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'hero_idle');
    this.hp = BALANCE.player.maxHp;
    this.maxHp = BALANCE.player.maxHp;

    const body = this.body as Phaser.Physics.Arcade.Body;
    // GDD §3.1 & AGENTS.md rule 78: 10x8 collider offset to feet
    body.setSize(10, 8);
    body.setOffset(7, 22);
    body.setCollideWorldBounds(true);

    // Attached sword for weapon sweep
    this.swordSprite = scene.add.sprite(x, y, 'weapon');
    this.swordSprite.setVisible(false);
    this.swordSprite.setDepth(15);
  }

  public handleInput(
    moveVec: { x: number; y: number },
    attackPressed: boolean,
    cleavePressed: boolean,
    bulwarkPressed: boolean,
    dashPressed: boolean,
    potionPressed: boolean,
    nearestEnemyPos: { x: number; y: number } | null,
    timeInput?: number
  ): void {
    const time = timeInput ?? (this.scene?.time?.now ?? Date.now());

    // Healing Potion
    if (potionPressed && this.potions > 0 && this.hp < this.maxHp && this.currentState !== 'dead') {
      this.potions--;
      this.heal(BALANCE.player.potionHeal);
      SFX.potion();
      this.emitStats();
    }

    // Dead
    if (this.currentState === 'dead') return;

    // Bulwark state active check
    const isBulwarkActive = time < this.bulwarkActiveUntil;

    // Dash Trigger
    if (dashPressed && time >= this.dashReadyUntil && this.currentState !== 'dash') {
      this.startDash(moveVec, time);
      this.updateVisualFrame(time);
      return;
    }

    // Ember Cleave Trigger
    if (cleavePressed && time >= this.cleaveReadyUntil && this.canCancelIntoAction()) {
      this.startCleave(time, nearestEnemyPos);
      this.updateVisualFrame(time);
      return;
    }

    // Bulwark Trigger
    if (bulwarkPressed && time >= this.bulwarkReadyUntil && this.canCancelIntoAction()) {
      this.startBulwark(time);
      this.updateVisualFrame(time);
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
      this.updateVisualFrame(time);
      return;
    }

    if (this.isAttackingState()) {
      this.setVelocity(0, 0); // Hero committed to attack
      if (time >= this.stateEndTime) {
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
      this.updateVisualFrame(time);
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
      if (this.currentState === 'run') {
        this.currentState = 'idle';
      }
    }

    this.updateVisualFrame(time);
  }

  private updateVisualFrame(time: number): void {
    if (this.currentState === 'attack1') {
      this.setTexture('hero_atk_1');
      return;
    }
    if (this.currentState === 'attack2') {
      this.setTexture('hero_atk_2');
      return;
    }
    if (this.currentState === 'attack3') {
      this.setTexture('hero_atk_3');
      return;
    }
    if (this.currentState === 'cleave') {
      this.setTexture('hero_cleave');
      return;
    }
    if (this.currentState === 'bulwark') {
      this.setTexture('hero_guard');
      return;
    }
    if (this.currentState === 'hurt') {
      this.setTexture('hero_hurt');
      return;
    }

    const isFacingUp = this.facing.y < -0.4;
    const isFacingDown = this.facing.y > 0.4;
    const dir = isFacingUp ? 'up' : isFacingDown ? 'down' : 'side';

    if (this.currentState === 'dash') {
      this.setTexture(`hero_walk_${dir}_1`);
      return;
    }

    if (this.currentState === 'run') {
      const step = Math.floor(time / 130) % 2;
      const frameNum = step === 0 ? '1' : '2';
      this.setTexture(`hero_walk_${dir}_${frameNum}`);
    } else {
      this.setTexture(`hero_idle_${dir}`);
    }
  }

  private canCancelIntoAction(): boolean {
    return this.currentState === 'idle' || this.currentState === 'run';
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

    this.applyAutoAim(enemyPos);

    if (hitIndex === 1) SFX.swing1();
    else if (hitIndex === 2) SFX.swing2();
    else SFX.swing3();

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
    if (this.scene?.time) {
      this.scene.time.delayedCall(cleave.startup, () => this.clearTint());
    }
  }

  private startBulwark(time: number): void {
    const bulwark = BALANCE.player.bulwark;
    this.currentState = 'bulwark';
    this.bulwarkReadyUntil = time + bulwark.cooldown;
    this.bulwarkActiveUntil = time + bulwark.parryWindow;
    this.stateEndTime = time + bulwark.duration;

    SFX.shieldUp();
  }

  private startDash(moveVec: { x: number; y: number }, time: number): void {
    const dash = BALANCE.player.dash;
    this.currentState = 'dash';
    this.dashReadyUntil = time + dash.cooldown;
    this.dashEndTime = time + dash.duration;
    this.isInvulnerable = true;

    let dir = new Phaser.Math.Vector2(moveVec.x, moveVec.y);
    if (dir.length() === 0) dir.copy(this.facing);
    dir.normalize();

    const speed = dash.distance / (dash.duration / 1000);
    this.dashVelocity.set(dir.x * speed, dir.y * speed);
    SFX.dash();

    // Afterimage ghost effect
    this.createAfterimage();
    if (this.scene?.time) {
      this.scene.time.delayedCall(60, () => this.createAfterimage());
      this.scene.time.delayedCall(120, () => this.createAfterimage());
      this.scene.time.delayedCall(dash.duration, () => {
        this.isInvulnerable = false;
      });
    }
  }

  private createAfterimage(): void {
    if (!this.scene?.add || !this.scene?.tweens) return;
    const ghost = this.scene.add.sprite(this.x, this.y, this.texture.key);
    ghost.setFlipX(this.flipX);
    ghost.setAlpha(0.65);
    ghost.setTint(0x38bdf8);
    ghost.setDepth(this.depth - 1);
    this.scene.tweens.add({
      targets: ghost,
      alpha: 0,
      duration: 200,
      onComplete: () => ghost.destroy()
    });
  }

  private applyAutoAim(enemyPos: { x: number; y: number } | null): void {
    if (!enemyPos) return;
    const dist = Phaser.Math.Distance.Between(this.x, this.y, enemyPos.x, enemyPos.y);
    if (dist <= BALANCE.player.autoAimRadius) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, enemyPos.x, enemyPos.y);
      this.facing.set(Math.cos(angle), Math.sin(angle));
      this.setFlipX(this.facing.x < 0);
    }
  }

  private triggerWeaponSweep(hitIndex: number): void {
    if (!this.swordSprite || !this.scene?.tweens) return;
    this.swordSprite.setVisible(true);
    const startAngle = hitIndex === 1 ? -45 : hitIndex === 2 ? 45 : -80;
    const endAngle = hitIndex === 1 ? 45 : hitIndex === 2 ? -45 : 80;
    const flip = this.flipX ? -1 : 1;

    this.swordSprite.setAngle(startAngle * flip);
    this.scene.tweens.add({
      targets: this.swordSprite,
      angle: endAngle * flip,
      duration: 120,
      ease: 'Power1',
      onComplete: () => {
        if (this.swordSprite) {
          this.swordSprite.setVisible(false);
        }
      }
    });
  }

  public override takeDamage(damage: number, knockX: number = 0, knockY: number = 0): boolean {
    const time = this.scene?.time?.now ?? Date.now();

    // Bulwark Parry Check
    if (this.currentState === 'bulwark' && time < this.bulwarkActiveUntil) {
      SFX.parry();
      if (this.scene?.cameras?.main) {
        this.scene.cameras.main.shake(100, 0.008);
      }
      return false; // 0 damage!
    }

    const took = super.takeDamage(damage, knockX, knockY);
    if (took) {
      SFX.hurt();
      this.emitStats();
      EventBus.emitEvent('player:damaged', { damage, currentHp: this.hp });
    }
    return took;
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
    const cleave = BALANCE.player.cleave;
    const bulwark = BALANCE.player.bulwark;
    const dash = BALANCE.player.dash;

    const cleaveRemain = Math.max(0, this.cleaveReadyUntil - time);
    const bulwarkRemain = Math.max(0, this.bulwarkReadyUntil - time);
    const dashRemain = Math.max(0, this.dashReadyUntil - time);

    return {
      cleaveReady: cleaveRemain === 0,
      cleaveCooldownProgress: cleaveRemain / cleave.cooldown,
      bulwarkReady: bulwarkRemain === 0,
      bulwarkCooldownProgress: bulwarkRemain / bulwark.cooldown,
      dashReady: dashRemain === 0,
      dashCooldownProgress: dashRemain / dash.cooldown
    };
  }

  public getDamage(): number {
    return BALANCE.player.baseDamage * (1 + (this.weaponTier - 1) * 0.25);
  }
}
