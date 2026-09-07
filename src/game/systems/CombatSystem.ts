import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/enemies/Enemy';
import { Hitbox } from '../entities/Hitbox';
import { FeelManager } from './FeelManager';
import { ParticleSystem } from './ParticleSystem';
import { BALANCE } from '../config/balance';
import { SFX } from '../audio/sfx';

export class CombatSystem {
  private scene: Phaser.Scene;
  private feel: FeelManager;
  private particles: ParticleSystem;

  constructor(scene: Phaser.Scene, feel: FeelManager, particles: ParticleSystem) {
    this.scene = scene;
    this.feel = feel;
    this.particles = particles;
  }

  public handlePlayerAttackHit(hitbox: Hitbox, enemy: Enemy, player: Player): void {
    if (!hitbox.active || enemy.isDead) return;

    // Calculate knockback direction away from player
    const angle = Phaser.Math.Angle.Between(player.x, player.y, enemy.x, enemy.y);
    const knockX = Math.cos(angle) * hitbox.knockback;
    const knockY = Math.sin(angle) * hitbox.knockback;

    const damage = hitbox.damage;
    const tookDamage = enemy.takeDamage(damage, knockX, knockY);

    if (tookDamage) {
      // Audio SFX
      SFX.hitFlesh();

      // Combat Feel: hit-pause, shake, damage numbers
      const isFinisher = hitbox.knockback > 30;
      const feelConfig = isFinisher ? BALANCE.feel.hit3 : BALANCE.feel.hit12;
      this.feel.hitPause(feelConfig.hitPause);
      this.feel.shake(feelConfig.shake, feelConfig.shakeDuration);
      this.feel.spawnDamageNumber(enemy.x, enemy.y, damage, isFinisher || hitbox.isCleave);

      // Particle effect
      if (hitbox.isCleave) {
        this.particles.emitEmbers(enemy.x, enemy.y, 8);
      } else {
        this.particles.emitHit(enemy.x, enemy.y, 0xffffff, 4);
      }

      // Check Enemy Death
      if (enemy.hp <= 0) {
        player.addXp(enemy.xpReward);
        const goldDrop = Phaser.Math.Between(enemy.goldMin, enemy.goldMax);
        player.addGold(goldDrop);
      }
    }
  }

  public handleEnemyAttackHit(player: Player, enemyDamage: number, sourceX: number, sourceY: number): void {
    if (player.hp <= 0 || player.isInvulnerable) return;

    const angle = Phaser.Math.Angle.Between(sourceX, sourceY, player.x, player.y);
    const knockX = Math.cos(angle) * 24;
    const knockY = Math.sin(angle) * 24;

    const hit = player.takeDamage(enemyDamage, knockX, knockY);
    if (hit) {
      this.feel.hitPause(BALANCE.feel.playerHurt.hitPause);
      this.feel.shake(BALANCE.feel.playerHurt.shake, BALANCE.feel.playerHurt.shakeDuration);
      this.feel.spawnDamageNumber(player.x, player.y, enemyDamage, true);
      this.feel.vibrate(BALANCE.feel.playerHurt.vibrate);
      this.particles.emitBlood(player.x, player.y, 6);
    }
  }
}
