import { sound } from './soundEngine';
import { isInsideWalkableDungeon } from './dungeonGenerator';
import { LOOT_TABLE } from '../constants/items';

export class GameEngine {
  constructor(canvas, { dungeonData, heroClass, playerStats, onStatsUpdate, onDungeonClear, onGameOver, onLootDrop }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.dungeon = dungeonData;
    this.heroClass = heroClass;
    this.onStatsUpdate = onStatsUpdate;
    this.onDungeonClear = onDungeonClear;
    this.onGameOver = onGameOver;
    this.onLootDrop = onLootDrop;

    // Running state
    this.isRunning = false;
    this.lastTime = performance.now();
    this.animId = null;

    // Camera
    this.camera = { x: 0, y: 0, zoom: 1 };

    // Player State
    this.player = {
      x: this.dungeon.playerSpawn.x,
      y: this.dungeon.playerSpawn.y,
      radius: 18,
      facingAngle: 0,
      baseSpeed: playerStats.speed || heroClass.baseStats.speed,
      hp: playerStats.currentHp || playerStats.maxHp,
      maxHp: playerStats.maxHp,
      mp: playerStats.currentMp || playerStats.maxMp,
      maxMp: playerStats.maxMp,
      attack: playerStats.attack,
      defense: playerStats.defense,
      critChance: playerStats.critChance,
      isAttacking: false,
      attackTimer: 0,
      attackDuration: 0.22,
      slashArc: 0,
      dashing: false,
      dashTimer: 0,
      dashDuration: 0.18,
      dashVx: 0,
      dashVy: 0,
      invulnerableTimer: 0,
      ironBastionTimer: 0,
      kills: 0,
      goldEarned: 0,
      gemsEarned: 0
    };

    // Entities
    this.monsters = [...this.dungeon.monsters];
    this.chests = [...this.dungeon.chests];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.boss = this.monsters.find(m => m.isBoss) || null;

    // Input state from virtual controls
    this.input = {
      moveX: 0,
      moveY: 0,
      skillCooldowns: { 0: 0, 1: 0, dash: 0 }
    };

    // Torch flicker
    this.torchTimer = 0;
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    this.loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
  }

  setInput(moveX, moveY) {
    this.input.moveX = moveX;
    this.input.moveY = moveY;
    if (Math.abs(moveX) > 0.05 || Math.abs(moveY) > 0.05) {
      this.player.facingAngle = Math.atan2(moveY, moveX);
    }
  }

  // Basic Attack
  triggerAttack() {
    if (this.player.isAttacking || this.player.hp <= 0) return;

    this.player.isAttacking = true;
    this.player.attackTimer = this.player.attackDuration;

    if (this.heroClass.attackType === 'ranged') {
      sound.playAttackMagic();
      // Spawn Magic Bolt Projectile
      const spd = this.heroClass.projectileSpeed || 7.5;
      this.projectiles.push({
        x: this.player.x + Math.cos(this.player.facingAngle) * 22,
        y: this.player.y + Math.sin(this.player.facingAngle) * 22,
        vx: Math.cos(this.player.facingAngle) * spd,
        vy: Math.sin(this.player.facingAngle) * spd,
        radius: 7,
        damage: this.player.attack,
        isCrit: Math.random() < this.player.critChance,
        fromPlayer: true,
        color: this.heroClass.color,
        life: 1.2
      });
    } else {
      sound.playAttackMelee();
      // Melee Swing Hit Check
      this.performMeleeHit(
        this.heroClass.attackRange || 55,
        this.heroClass.attackArc || Math.PI * 0.7,
        this.player.attack,
        false
      );
    }
  }

  // Trigger Class Skill 1
  triggerSkill(skillIndex) {
    if (this.player.hp <= 0) return;
    const skill = this.heroClass.skills[skillIndex];
    if (!skill) return;

    if (this.input.skillCooldowns[skillIndex] > 0) return;
    if (this.player.mp < skill.mpCost) {
      this.addFloatingText(this.player.x, this.player.y - 20, 'Mana Kurang!', '#38bdf8');
      return;
    }

    // Deduct MP
    this.player.mp = Math.max(0, this.player.mp - skill.mpCost);
    this.input.skillCooldowns[skillIndex] = skill.cooldown;

    if (skill.type === 'aoe_spin') {
      sound.playSkillWhirlwind();
      this.performMeleeHit(skill.radius, Math.PI * 2, this.player.attack * skill.damageMultiplier, true);
      this.createShockwave(this.player.x, this.player.y, skill.radius, '#ef4444');
    } else if (skill.type === 'buff_defense') {
      sound.playPotionUse();
      this.player.ironBastionTimer = skill.duration;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 60);
      this.addFloatingText(this.player.x, this.player.y - 30, 'IRON BASTION! (+60 HP)', '#f97316');
      this.createAuraParticles(this.player.x, this.player.y, '#f97316', 30);
    } else if (skill.type === 'projectile_explode') {
      sound.playSkillFireball();
      const spd = 6.5;
      this.projectiles.push({
        x: this.player.x + Math.cos(this.player.facingAngle) * 25,
        y: this.player.y + Math.sin(this.player.facingAngle) * 25,
        vx: Math.cos(this.player.facingAngle) * spd,
        vy: Math.sin(this.player.facingAngle) * spd,
        radius: 12,
        damage: this.player.attack * skill.damageMultiplier,
        isCrit: true,
        fromPlayer: true,
        isExplosive: true,
        explodeRadius: skill.radius,
        color: '#f97316',
        life: 1.5
      });
    } else if (skill.type === 'aoe_freeze') {
      sound.playSkillFrostNova();
      this.createShockwave(this.player.x, this.player.y, skill.radius, '#38bdf8');
      for (const m of this.monsters) {
        const dist = Math.hypot(m.x - this.player.x, m.y - this.player.y);
        if (dist <= skill.radius) {
          this.damageMonster(m, this.player.attack * skill.damageMultiplier, true);
          m.frozenTimer = 3.5;
          this.addFloatingText(m.x, m.y - 20, 'FROZEN!', '#38bdf8');
        }
      }
    } else if (skill.type === 'dash_strike') {
      sound.playSkillDash();
      const dashDist = skill.dashDistance || 120;
      const targetX = this.player.x + Math.cos(this.player.facingAngle) * dashDist;
      const targetY = this.player.y + Math.sin(this.player.facingAngle) * dashDist;

      if (isInsideWalkableDungeon(targetX, targetY, this.player.radius, this.dungeon)) {
        this.player.x = targetX;
        this.player.y = targetY;
      }
      this.performMeleeHit(75, Math.PI * 2, this.player.attack * skill.damageMultiplier, true);
      this.createAuraParticles(this.player.x, this.player.y, '#eab308', 25);
    } else if (skill.type === 'multi_projectile') {
      sound.playAttackMelee();
      const count = skill.count || 8;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        this.projectiles.push({
          x: this.player.x,
          y: this.player.y,
          vx: Math.cos(angle) * 7,
          vy: Math.sin(angle) * 7,
          radius: 5,
          damage: this.player.attack * skill.damageMultiplier,
          isCrit: false,
          fromPlayer: true,
          color: '#22c55e',
          life: 0.9
        });
      }
    }
  }

  // Dash Evade
  triggerDash() {
    if (this.player.dashing || this.input.skillCooldowns.dash > 0 || this.player.hp <= 0) return;

    sound.playSkillDash();
    this.player.dashing = true;
    this.player.dashTimer = this.player.dashDuration;
    this.player.invulnerableTimer = this.player.dashDuration + 0.1;
    this.input.skillCooldowns.dash = 2.5;

    let moveX = this.input.moveX;
    let moveY = this.input.moveY;
    if (Math.hypot(moveX, moveY) < 0.1) {
      moveX = Math.cos(this.player.facingAngle);
      moveY = Math.sin(this.player.facingAngle);
    }

    const dashSpeed = this.player.baseSpeed * 4.2;
    this.player.dashVx = moveX * dashSpeed;
    this.player.dashVy = moveY * dashSpeed;

    this.createAuraParticles(this.player.x, this.player.y, '#ffffff', 15);
  }

  // Use Healing Potion
  usePotion(type = 'health') {
    if (this.player.hp <= 0) return;
    sound.playPotionUse();

    if (type === 'health') {
      const heal = 80;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
      this.addFloatingText(this.player.x, this.player.y - 25, `+${heal} HP`, '#22c55e');
      this.createAuraParticles(this.player.x, this.player.y, '#22c55e', 20);
    } else {
      const mana = 55;
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + mana);
      this.addFloatingText(this.player.x, this.player.y - 25, `+${mana} MP`, '#38bdf8');
      this.createAuraParticles(this.player.x, this.player.y, '#38bdf8', 20);
    }
  }

  performMeleeHit(range, arc, rawDmg, guaranteeCrit = false) {
    for (const m of this.monsters) {
      const dx = m.x - this.player.x;
      const dy = m.y - this.player.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= range + m.radius) {
        const angleToTarget = Math.atan2(dy, dx);
        let diff = Math.abs(angleToTarget - this.player.facingAngle);
        while (diff > Math.PI) diff = Math.abs(diff - Math.PI * 2);

        if (diff <= arc / 2 || arc >= Math.PI * 1.9) {
          const isCrit = guaranteeCrit || Math.random() < this.player.critChance;
          const dmg = isCrit ? rawDmg * 1.8 : rawDmg;
          this.damageMonster(m, dmg, isCrit);

          // Knockback
          m.vx += Math.cos(angleToTarget) * 4;
          m.vy += Math.sin(angleToTarget) * 4;
        }
      }
    }
  }

  damageMonster(monster, rawDamage, isCrit = false) {
    const netDamage = Math.max(1, Math.round(rawDamage - (monster.defense || 0) * 0.5));
    monster.hp -= netDamage;
    monster.flashTimer = 0.15;

    sound.playEnemyHit();

    // Damage number popup
    this.addFloatingText(
      monster.x + (Math.random() * 20 - 10),
      monster.y - monster.radius - 8,
      isCrit ? `CRIT! ${netDamage}` : `${netDamage}`,
      isCrit ? '#facc15' : '#ffffff',
      isCrit ? 18 : 13
    );

    // Blood / sparks
    this.createHitSparks(monster.x, monster.y, monster.color, 8);

    if (monster.hp <= 0) {
      this.killMonster(monster);
    }
  }

  killMonster(monster) {
    const idx = this.monsters.indexOf(monster);
    if (idx !== -1) {
      this.monsters.splice(idx, 1);
    }

    this.player.kills++;
    sound.playCoinCollect();

    // Rewards
    const gold = Array.isArray(monster.goldReward)
      ? Math.floor(monster.goldReward[0] + Math.random() * (monster.goldReward[1] - monster.goldReward[0]))
      : (monster.goldReward || 15);
    this.player.goldEarned += gold;
    this.addFloatingText(monster.x, monster.y - 15, `+${gold} Gold`, '#facc15', 14);

    if (monster.gemReward) {
      const gems = Array.isArray(monster.gemReward)
        ? Math.floor(monster.gemReward[0] + Math.random() * (monster.gemReward[1] - monster.gemReward[0]))
        : 5;
      this.player.gemsEarned += gems;
      this.addFloatingText(monster.x, monster.y - 32, `+${gems} Gems!`, '#a855f7', 15);
    }

    // Roll Loot Drop (Chance 30% for normal, 100% for boss)
    const dropChance = monster.isBoss ? 1.0 : 0.28;
    if (Math.random() < dropChance && LOOT_TABLE.length > 0) {
      const item = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
      if (this.onLootDrop) {
        this.onLootDrop(item);
      }
      this.addFloatingText(monster.x, monster.y - 45, `LOOT: ${item.name}!`, item.rarity === 'legendary' ? '#facc15' : '#38bdf8', 15);
    }

    this.createDeathExplosion(monster.x, monster.y, monster.color, monster.radius * 1.5);

    // Check if Boss died -> Floor Clear!
    if (monster.isBoss) {
      sound.playVictory();
      if (this.onDungeonClear) {
        this.onDungeonClear({
          goldEarned: this.player.goldEarned,
          gemsEarned: this.player.gemsEarned,
          kills: this.player.kills
        });
      }
    }
  }

  damagePlayer(dmg, source) {
    if (this.player.invulnerableTimer > 0 || this.player.hp <= 0) return;

    let netDmg = Math.max(1, Math.round(dmg - this.player.defense * 0.45));
    if (this.player.ironBastionTimer > 0) {
      netDmg = Math.max(1, Math.round(netDmg * 0.3)); // 70% damage reduction
    }

    this.player.hp -= netDmg;
    this.player.invulnerableTimer = 0.4;
    sound.playPlayerHit();

    this.addFloatingText(this.player.x, this.player.y - 30, `-${netDmg}`, '#ef4444', 16);
    this.createHitSparks(this.player.x, this.player.y, '#ef4444', 10);

    if (this.player.hp <= 0) {
      this.player.hp = 0;
      sound.playGameOver?.();
      if (this.onGameOver) {
        this.onGameOver({
          goldEarned: Math.floor(this.player.goldEarned * 0.6), // keep 60% gold on defeat
          kills: this.player.kills
        });
      }
    }
  }

  addFloatingText(x, y, text, color = '#ffffff', size = 14) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      size,
      alpha: 1,
      vy: -1.2,
      life: 0.85
    });
  }

  createHitSparks(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 4;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 2 + Math.random() * 2,
        color,
        alpha: 1,
        life: 0.35 + Math.random() * 0.2
      });
    }
  }

  createAuraParticles(x, y, color, count = 15) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 3,
        color,
        alpha: 1,
        life: 0.5
      });
    }
  }

  createShockwave(x, y, maxRadius, color) {
    this.particles.push({
      x,
      y,
      isShockwave: true,
      radius: 10,
      maxRadius,
      color,
      alpha: 0.8,
      life: 0.35
    });
  }

  createDeathExplosion(x, y, color, radius) {
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 5;
      this.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: 3 + Math.random() * 4,
        color,
        alpha: 1,
        life: 0.6 + Math.random() * 0.3
      });
    }
  }

  // Core Game Loop
  loop(timestamp) {
    if (!this.isRunning) return;

    const dt = Math.min(0.1, (timestamp - this.lastTime) / 1000);
    this.lastTime = timestamp;

    this.update(dt);
    this.render();

    this.animId = requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    // Cooldown timers
    if (this.input.skillCooldowns[0] > 0) this.input.skillCooldowns[0] -= dt;
    if (this.input.skillCooldowns[1] > 0) this.input.skillCooldowns[1] -= dt;
    if (this.input.skillCooldowns.dash > 0) this.input.skillCooldowns.dash -= dt;

    if (this.player.attackTimer > 0) this.player.attackTimer -= dt;
    else this.player.isAttacking = false;

    if (this.player.dashTimer > 0) this.player.dashTimer -= dt;
    else this.player.dashing = false;

    if (this.player.invulnerableTimer > 0) this.player.invulnerableTimer -= dt;
    if (this.player.ironBastionTimer > 0) this.player.ironBastionTimer -= dt;

    this.torchTimer += dt * 4;

    // Passive MP Regen
    if (this.player.mp < this.player.maxMp) {
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + 4.5 * dt);
    }

    // Player Movement
    if (this.player.hp > 0) {
      let vx = 0;
      let vy = 0;

      if (this.player.dashing) {
        vx = this.player.dashVx;
        vy = this.player.dashVy;
      } else {
        const speed = this.player.baseSpeed * 60 * dt;
        vx = this.input.moveX * speed;
        vy = this.input.moveY * speed;
      }

      // Try moving along X
      if (isInsideWalkableDungeon(this.player.x + vx, this.player.y, this.player.radius, this.dungeon)) {
        this.player.x += vx;
      }
      // Try moving along Y
      if (isInsideWalkableDungeon(this.player.x, this.player.y + vy, this.player.radius, this.dungeon)) {
        this.player.y += vy;
      }
    }

    // Chest Opening Check
    for (const chest of this.chests) {
      if (!chest.opened) {
        const dist = Math.hypot(chest.x - this.player.x, chest.y - this.player.y);
        if (dist <= chest.radius + this.player.radius + 15) {
          chest.opened = true;
          sound.playCoinCollect();
          this.player.goldEarned += chest.gold;
          this.addFloatingText(chest.x, chest.y - 20, `+${chest.gold} Gold (Peti)`, '#facc15', 14);
          this.createHitSparks(chest.x, chest.y, '#facc15', 12);
        }
      }
    }

    // Update Monsters AI
    for (const m of this.monsters) {
      if (m.frozenTimer > 0) {
        m.frozenTimer -= dt;
        continue;
      }

      // Friction
      m.vx *= 0.85;
      m.vy *= 0.85;

      const dx = this.player.x - m.x;
      const dy = this.player.y - m.y;
      const distToPlayer = Math.hypot(dx, dy);

      // Aggro Range check (within 350px)
      if (distToPlayer < 380 && this.player.hp > 0) {
        const angle = Math.atan2(dy, dx);

        if (m.behavior === 'ranged_kite') {
          // Keep distance ~130px
          if (distToPlayer < 110) {
            m.vx -= Math.cos(angle) * m.speed * 1.5;
            m.vy -= Math.sin(angle) * m.speed * 1.5;
          } else if (distToPlayer > 180) {
            m.vx += Math.cos(angle) * m.speed;
            m.vy += Math.sin(angle) * m.speed;
          }

          // Ranged shoot
          m.cooldownTimer -= dt;
          if (m.cooldownTimer <= 0) {
            m.cooldownTimer = m.attackCooldown;
            this.projectiles.push({
              x: m.x,
              y: m.y,
              vx: Math.cos(angle) * 4.2,
              vy: Math.sin(angle) * 4.2,
              radius: 5,
              damage: m.attack,
              fromPlayer: false,
              color: '#cbd5e1',
              life: 1.5
            });
          }
        } else if (m.isBoss) {
          // Boss Complex AI
          m.cooldownTimer -= dt;

          if (distToPlayer > 45) {
            m.vx += Math.cos(angle) * m.speed;
            m.vy += Math.sin(angle) * m.speed;
          }

          if (m.cooldownTimer <= 0) {
            m.cooldownTimer = m.attackCooldown;
            sound.playBossRoar();

            // Boss Nova Attack
            const orbs = 6;
            for (let i = 0; i < orbs; i++) {
              const bAngle = angle + (Math.PI * 2 / orbs) * i;
              this.projectiles.push({
                x: m.x,
                y: m.y,
                vx: Math.cos(bAngle) * 3.5,
                vy: Math.sin(bAngle) * 3.5,
                radius: 8,
                damage: m.attack * 0.9,
                fromPlayer: false,
                color: m.color,
                life: 1.8
              });
            }
          }
        } else {
          // Regular Melee Chase
          if (distToPlayer > 28) {
            m.vx += Math.cos(angle) * m.speed;
            m.vy += Math.sin(angle) * m.speed;
          }

          // Melee attack player
          m.cooldownTimer -= dt;
          if (distToPlayer <= (m.attackRange || 32) && m.cooldownTimer <= 0) {
            m.cooldownTimer = m.attackCooldown;
            this.damagePlayer(m.attack, m);
          }
        }
      }

      // Apply monster velocity if inside walkable dungeon
      const nextX = m.x + m.vx;
      const nextY = m.y + m.vy;
      if (isInsideWalkableDungeon(nextX, m.y, m.radius, this.dungeon)) {
        m.x = nextX;
      }
      if (isInsideWalkableDungeon(m.x, nextY, m.radius, this.dungeon)) {
        m.y = nextY;
      }
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;

      // Trail particle
      if (Math.random() < 0.4) {
        this.particles.push({
          x: p.x,
          y: p.y,
          vx: (Math.random() - 0.5) * 0.5,
          vy: (Math.random() - 0.5) * 0.5,
          radius: 2,
          color: p.color,
          alpha: 0.6,
          life: 0.2
        });
      }

      // Check collision with walls
      if (!isInsideWalkableDungeon(p.x, p.y, p.radius, this.dungeon)) {
        p.life = 0;
      }

      // Check collision with targets
      if (p.fromPlayer) {
        for (const m of this.monsters) {
          const d = Math.hypot(m.x - p.x, m.y - p.y);
          if (d <= m.radius + p.radius) {
            p.life = 0;
            if (p.isExplosive) {
              sound.playSkillFireball();
              this.createShockwave(p.x, p.y, p.explodeRadius, '#f97316');
              for (const splashTarget of this.monsters) {
                const sDist = Math.hypot(splashTarget.x - p.x, splashTarget.y - p.y);
                if (sDist <= p.explodeRadius) {
                  this.damageMonster(splashTarget, p.damage, true);
                }
              }
            } else {
              this.damageMonster(m, p.damage, p.isCrit);
            }
            break;
          }
        }
      } else {
        // Enemy projectile hits player
        const d = Math.hypot(this.player.x - p.x, this.player.y - p.y);
        if (d <= this.player.radius + p.radius) {
          p.life = 0;
          this.damagePlayer(p.damage, p);
        }
      }

      if (p.life <= 0) {
        this.projectiles.splice(i, 1);
      }
    }

    // Update Particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      if (pt.isShockwave) {
        pt.radius += (pt.maxRadius - pt.radius) * 12 * dt;
      } else {
        pt.x += pt.vx;
        pt.y += pt.vy;
      }
      pt.life -= dt;
      pt.alpha = Math.max(0, pt.life / 0.5);

      if (pt.life <= 0) {
        this.particles.splice(i, 1);
      }
    }

    // Update Floating Text
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.life -= dt;
      ft.alpha = Math.max(0, ft.life / 0.85);

      if (ft.life <= 0) {
        this.floatingTexts.splice(i, 1);
      }
    }

    // Update Camera (Lerp follow player)
    const targetCamX = this.player.x - this.canvas.width / 2;
    const targetCamY = this.player.y - this.canvas.height / 2;
    this.camera.x += (targetCamX - this.camera.x) * 8 * dt;
    this.camera.y += (targetCamY - this.camera.y) * 8 * dt;

    // Report stats back to React HUD
    if (this.onStatsUpdate) {
      this.onStatsUpdate({
        currentHp: this.player.hp,
        maxHp: this.player.maxHp,
        currentMp: this.player.mp,
        maxMp: this.player.maxMp,
        goldEarned: this.player.goldEarned,
        gemsEarned: this.player.gemsEarned,
        kills: this.player.kills,
        bossHp: this.boss ? this.boss.hp : null,
        bossMaxHp: this.boss ? this.boss.maxHp : null,
        bossName: this.boss ? this.boss.name : null,
        skillCooldowns: { ...this.input.skillCooldowns }
      });
    }
  }

  render() {
    const { ctx, canvas } = this;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save camera transform
    ctx.save();
    ctx.translate(-Math.floor(this.camera.x), -Math.floor(this.camera.y));

    // 1. Draw Dungeon Floor & Rooms
    ctx.fillStyle = '#0f141c';
    ctx.fillRect(0, 0, this.dungeon.mapWidth, this.dungeon.mapHeight);

    // Corridors
    ctx.fillStyle = '#17202d';
    for (const corr of this.dungeon.corridors) {
      ctx.fillRect(corr.x, corr.y, corr.w, corr.h);
      ctx.strokeStyle = '#28364d';
      ctx.lineWidth = 2;
      ctx.strokeRect(corr.x, corr.y, corr.w, corr.h);
    }

    // Rooms
    for (const room of this.dungeon.rooms) {
      ctx.fillStyle = room.isBoss ? '#1f132b' : room.isStart ? '#0f241a' : '#1a2332';
      ctx.fillRect(room.x, room.y, room.w, room.h);

      // Floor grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let rx = room.x; rx <= room.x + room.w; rx += 40) {
        ctx.beginPath();
        ctx.moveTo(rx, room.y);
        ctx.lineTo(rx, room.y + room.h);
        ctx.stroke();
      }
      for (let ry = room.y; ry <= room.y + room.h; ry += 40) {
        ctx.beginPath();
        ctx.moveTo(room.x, ry);
        ctx.lineTo(room.x + room.w, ry);
        ctx.stroke();
      }

      // Room border
      ctx.strokeStyle = room.isBoss ? '#7e22ce' : room.isStart ? '#10b981' : '#3a4e6e';
      ctx.lineWidth = 4;
      ctx.strokeRect(room.x, room.y, room.w, room.h);
    }

    // 2. Draw Torches with warm lighting
    for (const torch of this.dungeon.torches) {
      const flicker = Math.sin(this.torchTimer + torch.flickerOffset) * 4;
      const grad = ctx.createRadialGradient(torch.x, torch.y, 4, torch.x, torch.y, 55 + flicker);
      grad.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
      grad.addColorStop(0.5, 'rgba(234, 88, 12, 0.15)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(torch.x, torch.y, 60 + flicker, 0, Math.PI * 2);
      ctx.fill();

      // Torch post
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(torch.x, torch.y, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Draw Chests
    for (const c of this.chests) {
      ctx.save();
      ctx.translate(c.x, c.y);
      ctx.fillStyle = c.opened ? '#475569' : '#ca8a04';
      ctx.fillRect(-12, -9, 24, 18);
      ctx.strokeStyle = c.opened ? '#1e293b' : '#facc15';
      ctx.lineWidth = 2;
      ctx.strokeRect(-12, -9, 24, 18);

      // Lock / Latch
      ctx.fillStyle = c.opened ? '#64748b' : '#ffffff';
      ctx.fillRect(-3, -3, 6, 6);
      ctx.restore();
    }

    // 4. Draw Monsters
    for (const m of this.monsters) {
      ctx.save();
      ctx.translate(m.x, m.y);

      // Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.beginPath();
      ctx.ellipse(0, m.radius * 0.7, m.radius, m.radius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glow / Telegraph aura for Boss
      if (m.isBoss) {
        const bGlow = ctx.createRadialGradient(0, 0, m.radius * 0.5, 0, 0, m.radius * 1.6);
        bGlow.addColorStop(0, m.glowColor || 'rgba(168, 85, 247, 0.6)');
        bGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = bGlow;
        ctx.beginPath();
        ctx.arc(0, 0, m.radius * 1.6, 0, Math.PI * 2);
        ctx.fill();
      }

      // Monster Body
      ctx.fillStyle = m.flashTimer > 0 ? '#ffffff' : m.color;
      ctx.beginPath();
      ctx.arc(0, 0, m.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Monster Eyes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(-m.radius * 0.3, -m.radius * 0.2, m.radius * 0.22, 0, Math.PI * 2);
      ctx.arc(m.radius * 0.3, -m.radius * 0.2, m.radius * 0.22, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(-m.radius * 0.3, -m.radius * 0.2, m.radius * 0.12, 0, Math.PI * 2);
      ctx.arc(m.radius * 0.3, -m.radius * 0.2, m.radius * 0.12, 0, Math.PI * 2);
      ctx.fill();

      // Health Bar above monster
      const barW = Math.max(30, m.radius * 2);
      const barH = 4;
      const hpPct = Math.max(0, m.hp / m.maxHp);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.fillRect(-barW / 2, -m.radius - 12, barW, barH);
      ctx.fillStyle = m.isBoss ? '#c084fc' : '#ef4444';
      ctx.fillRect(-barW / 2, -m.radius - 12, barW * hpPct, barH);

      ctx.restore();
    }

    // 5. Draw Player
    if (this.player.hp > 0) {
      ctx.save();
      ctx.translate(this.player.x, this.player.y);

      // Invulnerability flicker
      if (this.player.invulnerableTimer > 0 && Math.floor(Date.now() / 60) % 2 === 0) {
        ctx.globalAlpha = 0.4;
      }

      // Iron Bastion Shield Barrier
      if (this.player.ironBastionTimer > 0) {
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, this.player.radius + 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Player Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(0, this.player.radius * 0.8, this.player.radius, this.player.radius * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();

      // Player Body
      ctx.fillStyle = this.heroClass.color;
      ctx.beginPath();
      ctx.arc(0, 0, this.player.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();

      // Direction pointer / Weapon
      ctx.rotate(this.player.facingAngle);

      // Weapon
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(this.player.radius * 0.6, -3, 16, 6);
      ctx.fillStyle = this.heroClass.secondaryColor;
      ctx.fillRect(this.player.radius * 0.5, -6, 4, 12);

      // Slash visual arc
      if (this.player.isAttacking && this.heroClass.attackType === 'melee') {
        ctx.strokeStyle = this.heroClass.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, this.player.radius + 24, -0.6, 0.6);
        ctx.stroke();
      }

      ctx.restore();
    }

    // 6. Draw Projectiles
    for (const p of this.projectiles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 7. Draw Particles & Shockwaves
    for (const pt of this.particles) {
      ctx.save();
      ctx.globalAlpha = pt.alpha;
      if (pt.isShockwave) {
        ctx.strokeStyle = pt.color;
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.fillStyle = pt.color;
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 8. Draw Floating Damage Text
    for (const ft of this.floatingTexts) {
      ctx.save();
      ctx.globalAlpha = ft.alpha;
      ctx.font = `bold ${ft.size}px 'Plus Jakarta Sans', sans-serif`;
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 3;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    // Restore camera
    ctx.restore();

    // 9. Draw Mini-map in top right
    this.renderMiniMap(ctx);
  }

  renderMiniMap(ctx) {
    const mmSize = 75;
    const mmX = this.canvas.width - mmSize - 12;
    const mmY = 14;

    ctx.save();
    ctx.fillStyle = 'rgba(7, 9, 14, 0.75)';
    ctx.fillRect(mmX, mmY, mmSize, mmSize);
    ctx.strokeStyle = '#3a4e6e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mmX, mmY, mmSize, mmSize);

    const scaleX = mmSize / this.dungeon.mapWidth;
    const scaleY = mmSize / this.dungeon.mapHeight;

    // Rooms
    for (const r of this.dungeon.rooms) {
      ctx.fillStyle = r.isBoss ? '#a855f7' : r.isStart ? '#10b981' : '#64748b';
      ctx.fillRect(mmX + r.x * scaleX, mmY + r.y * scaleY, r.w * scaleX, r.h * scaleY);
    }

    // Player blip
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(mmX + this.player.x * scaleX, mmY + this.player.y * scaleY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
