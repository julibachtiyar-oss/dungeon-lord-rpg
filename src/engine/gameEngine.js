import { sound } from './soundEngine';
import { isInsideWalkableDungeon } from './dungeonGenerator';
import { LOOT_TABLE } from '../constants/items';
import { SpriteRenderer } from './spriteRenderer';
import { DungeonTileRenderer } from './dungeonTileRenderer';

export class GameEngine {
  constructor(canvas, { 
    dungeonData, 
    heroClass, 
    playerStats, 
    mercenaryDef, 
    onStatsUpdate, 
    onDungeonClear, 
    onGameOver, 
    onLootDrop,
    onBossEncounter
  }) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.logicalWidth = window.innerWidth;
    this.logicalHeight = window.innerHeight;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    this.dungeon = dungeonData;
    this.heroClass = heroClass;
    this.onStatsUpdate = onStatsUpdate;
    this.onDungeonClear = onDungeonClear;
    this.onGameOver = onGameOver;
    this.onLootDrop = onLootDrop;
    this.onBossEncounter = onBossEncounter;

    // Running state
    this.isRunning = false;
    this.lastTime = performance.now();
    this.animId = null;
    this.gameTime = 0;
    this.torchTimer = 0;

    // Camera with Screen Shake
    this.camera = { 
      x: 0, 
      y: 0, 
      zoom: 1, 
      shakeTimer: 0, 
      shakeMag: 0 
    };

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
      dashing: false,
      dashTimer: 0,
      dashDuration: 0.18,
      dashVx: 0,
      dashVy: 0,
      invulnerableTimer: 0,
      ironBastionTimer: 0,
      frenzyTimer: 0,
      kills: 0,
      goldEarned: 0,
      gemsEarned: 0,
      weaponEnhancement: playerStats.weaponEnhancement || 0
    };

    // Mercenary Party Companion
    this.mercenary = mercenaryDef ? {
      ...mercenaryDef,
      x: this.player.x - 35,
      y: this.player.y - 20,
      hp: mercenaryDef.maxHp,
      maxHp: mercenaryDef.maxHp,
      attack: mercenaryDef.attack,
      defense: mercenaryDef.defense,
      attackCooldownTimer: 0,
      skillCooldownTimer: 0,
      facingAngle: 0,
      speechBubble: null,
      speechTimer: 0
    } : null;

    this.tacticsMode = 'attack'; // 'attack' | 'follow'

    // Entities
    this.monsters = [...this.dungeon.monsters];
    this.chests = [...this.dungeon.chests];
    this.projectiles = [];
    this.particles = [];
    this.floatingTexts = [];
    this.telegraphs = [];
    this.moltenPools = [];
    this.killedTypes = {};
    this.boss = this.monsters.find(m => m.isBoss) || null;
    this.bossEncounterTriggered = false;

    // Input state from virtual controls (3 skills + dash)
    this.input = {
      moveX: 0,
      moveY: 0,
      skillCooldowns: { 0: 0, 1: 0, 2: 0, dash: 0 }
    };

    this.torchTimer = 0;
    this.floorDecals = [];
    this.comboCount = 0;
    this.comboTimer = 0;
    this.hitstopTimer = 0;
    this.screenFlash = { color: 'rgba(255, 255, 255, 0)', timer: 0 };
    this.exploredRooms = new Set([0]);
    this.ambientDust = Array.from({ length: 35 }, () => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 600),
      speedY: 10 + Math.random() * 15,
      speedX: (Math.random() - 0.5) * 8,
      size: 1.2 + Math.random() * 2,
      alpha: 0.25 + Math.random() * 0.45,
      wobbleOffset: Math.random() * Math.PI * 2
    }));
  }

  start() {
    this.isRunning = true;
    this.lastTime = performance.now();
    sound.playBGM('dungeon');
    this.loop(this.lastTime);
  }

  stop() {
    this.isRunning = false;
    if (this.animId) {
      cancelAnimationFrame(this.animId);
    }
    sound.stopBGM();
  }

  resize(w, h, dpr) {
    this.logicalWidth = w;
    this.logicalHeight = h;
    if (dpr) this.dpr = dpr;
  }

  triggerScreenShake(duration = 0.25, magnitude = 8) {
    this.camera.shakeTimer = duration;
    this.camera.shakeMag = magnitude;
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
    this.player.attackTimer = this.player.frenzyTimer > 0 ? 0.12 : this.player.attackDuration;

    if (this.heroClass.attackType === 'ranged') {
      sound.playAttackMelee();
      const spd = this.heroClass.projectileSpeed || 8.2;
      this.projectiles.push({
        x: this.player.x + Math.cos(this.player.facingAngle) * 22,
        y: this.player.y + Math.sin(this.player.facingAngle) * 22,
        vx: Math.cos(this.player.facingAngle) * spd,
        vy: Math.sin(this.player.facingAngle) * spd,
        radius: 7,
        damage: this.player.attack,
        isCrit: Math.random() < (this.player.frenzyTimer > 0 ? 0.8 : this.player.critChance),
        fromPlayer: true,
        color: this.heroClass.color,
        life: 1.2
      });
    } else {
      sound.playAttackMelee();
      this.performMeleeHit(
        this.heroClass.attackRange || 65,
        this.heroClass.attackArc || Math.PI * 0.75,
        this.player.attack,
        false
      );
    }
  }

  // Trigger Class Skill (0: Skill 1, 1: Skill 2, 2: Skill 3 / Ultimate)
  triggerSkill(skillIndex) {
    if (this.player.hp <= 0) return;
    const skill = this.heroClass.skills[skillIndex];
    if (!skill) return;

    if (this.input.skillCooldowns[skillIndex] > 0) return;
    if (this.player.mp < skill.mpCost) {
      this.addFloatingText(this.player.x, this.player.y - 20, 'Mana Kurang!', '#38bdf8');
      return;
    }

    // Deduct MP & set cooldown
    this.player.mp = Math.max(0, this.player.mp - skill.mpCost);
    this.input.skillCooldowns[skillIndex] = skill.cooldown;

    if (skill.type === 'aoe_spin') {
      sound.playSkillExplosion();
      this.triggerScreenShake(0.3, 10);
      this.performMeleeHit(skill.radius, Math.PI * 2, this.player.attack * skill.damageMultiplier, true);
      this.createShockwave(this.player.x, this.player.y, skill.radius, this.heroClass.color);
    } else if (skill.type === 'buff_defense') {
      sound.playHeal();
      this.player.ironBastionTimer = skill.duration;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + 80);
      this.addFloatingText(this.player.x, this.player.y - 30, 'BASTION OF TORMENT (+80 HP)', '#f97316');
      this.createAuraParticles(this.player.x, this.player.y, '#f97316', 35);
    } else if (skill.type === 'projectile_explode') {
      sound.playSkillExplosion();
      const spd = 7.0;
      this.projectiles.push({
        x: this.player.x + Math.cos(this.player.facingAngle) * 25,
        y: this.player.y + Math.sin(this.player.facingAngle) * 25,
        vx: Math.cos(this.player.facingAngle) * spd,
        vy: Math.sin(this.player.facingAngle) * spd,
        radius: 14,
        damage: this.player.attack * skill.damageMultiplier,
        isCrit: true,
        fromPlayer: true,
        isExplosive: true,
        explodeRadius: skill.radius,
        color: '#f97316',
        life: 1.5
      });
    } else if (skill.type === 'aoe_freeze') {
      sound.playSkillCast();
      this.createShockwave(this.player.x, this.player.y, skill.radius, '#38bdf8');
      for (const m of this.monsters) {
        const dist = Math.hypot(m.x - this.player.x, m.y - this.player.y);
        if (dist <= skill.radius) {
          this.damageMonster(m, this.player.attack * skill.damageMultiplier, true);
          m.frozenTimer = 4.0;
          this.addFloatingText(m.x, m.y - 20, 'FROZEN!', '#38bdf8');
        }
      }
    } else if (skill.type === 'dash_strike') {
      sound.playCriticalHit();
      const dashDist = skill.dashDistance || 140;
      const targetX = this.player.x + Math.cos(this.player.facingAngle) * dashDist;
      const targetY = this.player.y + Math.sin(this.player.facingAngle) * dashDist;

      if (isInsideWalkableDungeon(targetX, targetY, this.player.radius, this.dungeon)) {
        this.player.x = targetX;
        this.player.y = targetY;
      }
      this.triggerScreenShake(0.2, 7);
      this.performMeleeHit(85, Math.PI * 2, this.player.attack * skill.damageMultiplier, true);
      this.createAuraParticles(this.player.x, this.player.y, '#eab308', 25);
    } else if (skill.type === 'multi_projectile') {
      sound.playAttackMelee();
      const count = skill.count || 8;
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i;
        this.projectiles.push({
          x: this.player.x,
          y: this.player.y,
          vx: Math.cos(angle) * 7.5,
          vy: Math.sin(angle) * 7.5,
          radius: 6,
          damage: this.player.attack * skill.damageMultiplier,
          isCrit: false,
          fromPlayer: true,
          color: '#22c55e',
          life: 0.95
        });
      }
    } else if (skill.type === 'heal_party') {
      sound.playHeal();
      const healAmt = skill.healAmount || 120;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmt);
      this.addFloatingText(this.player.x, this.player.y - 30, `+${healAmt} HP PARTY!`, '#22c55e', 16);
      this.createShockwave(this.player.x, this.player.y, 150, '#38bdf8');

      if (this.mercenary) {
        this.mercenary.hp = Math.min(this.mercenary.maxHp, this.mercenary.hp + healAmt);
        this.addFloatingText(this.mercenary.x, this.mercenary.y - 25, `+${healAmt} HP`, '#22c55e');
      }

      this.performMeleeHit(150, Math.PI * 2, this.player.attack * (skill.damageMultiplier || 2.2), true);
    } else if (skill.type === 'buff_frenzy') {
      sound.playLevelUp();
      this.player.frenzyTimer = skill.duration || 6.0;
      this.addFloatingText(this.player.x, this.player.y - 35, 'PHANTOM FRENZY! 250% CRIT', '#facc15', 16);
      this.createAuraParticles(this.player.x, this.player.y, '#facc15', 40);
    }
  }

  // Dash Evade
  triggerDash() {
    if (this.player.dashing || this.input.skillCooldowns.dash > 0 || this.player.hp <= 0) return;

    sound.playSkillCast();
    this.player.dashing = true;
    this.player.dashTimer = this.player.dashDuration;
    this.player.invulnerableTimer = this.player.dashDuration + 0.12;
    this.input.skillCooldowns.dash = 2.4;

    let moveX = this.input.moveX;
    let moveY = this.input.moveY;
    if (Math.hypot(moveX, moveY) < 0.1) {
      moveX = Math.cos(this.player.facingAngle);
      moveY = Math.sin(this.player.facingAngle);
    }

    const dashSpeed = this.player.baseSpeed * 4.5;
    this.player.dashVx = moveX * dashSpeed;
    this.player.dashVy = moveY * dashSpeed;

    this.createAuraParticles(this.player.x, this.player.y, '#ffffff', 18);
  }

  // Quick Potion Consumption (Health or Mana)
  usePotion(type = 'health') {
    if (this.player.hp <= 0) return;
    if (type === 'health') {
      const healAmount = Math.round(this.player.maxHp * 0.45);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + healAmount);
      sound.playLevelUp();
      this.createAuraParticles(this.player.x, this.player.y, '#22c55e', 22);
      this.addFloatingText(this.player.x, this.player.y - 35, `+${healAmount} HP`, '#22c55e', 18);
    } else if (type === 'mana') {
      const manaAmount = Math.round(this.player.maxMp * 0.60);
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + manaAmount);
      sound.playSkillCast();
      this.createAuraParticles(this.player.x, this.player.y, '#38bdf8', 22);
      this.addFloatingText(this.player.x, this.player.y - 35, `+${manaAmount} MP`, '#38bdf8', 18);
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
          const isCrit = guaranteeCrit || (Math.random() < (this.player.frenzyTimer > 0 ? 0.85 : this.player.critChance));
          const dmg = isCrit ? rawDmg * 2.0 : rawDmg;
          this.damageMonster(m, dmg, isCrit);

          if (isCrit) {
            this.triggerScreenShake(0.2, 8);
          }

          // Knockback
          m.vx += Math.cos(angleToTarget) * 4.5;
          m.vy += Math.sin(angleToTarget) * 4.5;
        }
      }
    }
  }

  damageMonster(monster, rawDamage, isCrit = false) {
    let effectiveDamage = rawDamage;

    // Ironhide Affix: 45% damage mitigation + metal shield deflect sparks
    if (monster.isElite && monster.affix === 'Ironhide') {
      effectiveDamage = Math.round(effectiveDamage * 0.55);
      this.createHitSparks(monster.x, monster.y, '#38bdf8', 6);
      this.addFloatingText(monster.x, monster.y - monster.radius - 20, '🛡️ KEBAL!', '#38bdf8', 12);
    }

    const netDamage = Math.max(1, Math.round(effectiveDamage - (monster.defense || 0) * 0.5));
    monster.hp -= netDamage;
    monster.flashTimer = 0.15;

    // Boss Multi-Phase: Enrage at <= 50% HP
    if (monster.isBoss && monster.hp <= monster.maxHp * 0.5 && !monster.isEnraged) {
      monster.isEnraged = true;
      monster.speed = Math.round(monster.speed * 1.35 * 10) / 10;
      monster.attack = Math.round(monster.attack * 1.25);
      monster.radius = Math.round(monster.radius * 1.15);
      this.triggerScreenShake(0.5, 16);
      this.screenFlash = { color: 'rgba(239, 68, 68, 0.45)', timer: 0.25 };
      sound.playBossRoar();
      this.addFloatingText(monster.x, monster.y - 45, '⚠️ BOSS ENRAGED! (KEMURKAAN ABADI)', '#ef4444', 18);

      // Summon 2 Elite Skeletal Guards to protect the Boss
      for (let g = 0; g < 2; g++) {
        const offset = (g === 0 ? -50 : 50);
        this.monsters.push({
          id: `guard_${Date.now()}_${g}`,
          type: 'skeleton_archer',
          name: '💀 Pengawal Bos',
          isBoss: false,
          isElite: true,
          affix: 'Ironhide',
          affixTimer: 0,
          x: monster.x + offset,
          y: monster.y + 35,
          radius: 18,
          maxHp: 160,
          hp: 160,
          attack: 22,
          defense: 8,
          speed: 1.5,
          color: '#cbd5e1',
          glowColor: '#38bdf8',
          behavior: 'chase',
          attackCooldown: 1.5,
          cooldownTimer: 0.3,
          vx: 0,
          vy: 0,
          roomIndex: monster.roomIndex,
          xpReward: 60,
          goldReward: [30, 60]
        });
        this.createShockwave(monster.x + offset, monster.y + 35, 45, '#ef4444');
      }
    }

    // Combo system
    this.comboCount++;
    this.comboTimer = 2.5;
    if (this.comboCount >= 3 && this.comboCount % 3 === 0) {
      const rank = this.comboCount >= 15 ? 'GODLIKE!!' : this.comboCount >= 9 ? 'UNSTOPPABLE!' : 'EXCELLENT!';
      this.addFloatingText(this.player.x, this.player.y - 45, `${this.comboCount}x COMBO! ${rank}`, '#facc15', 17);
    }

    // Visceral hitstop and screen flash on critical hit
    if (isCrit) {
      sound.playCriticalHit();
      this.hitstopTimer = 0.04; // 40ms micro-pause for massive impact
      this.screenFlash = { color: 'rgba(250, 204, 21, 0.22)', timer: 0.08 };
      this.triggerScreenShake(0.22, 9);
    } else {
      sound.playAttackMelee();
    }

    // Persistent floor decal: Blood splatter
    if (this.floorDecals.length < 120) {
      const isSlime = monster.type === 'slime';
      this.floorDecals.push({
        x: monster.x + (Math.random() * 16 - 8),
        y: monster.y + (Math.random() * 16 - 8),
        radius: 4 + Math.random() * 8,
        color: isSlime ? '#15803d' : '#7f1d1d',
        alpha: 0.75,
        life: 25.0
      });
    }

    // Damage popup
    this.addFloatingText(
      monster.x + (Math.random() * 20 - 10),
      monster.y - monster.radius - 8,
      isCrit ? `CRIT! ${netDamage}` : `${netDamage}`,
      isCrit ? '#facc15' : '#ffffff',
      isCrit ? 19 : 13
    );

    this.createHitSparks(monster.x, monster.y, monster.color, isCrit ? 16 : 8);

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
    this.killedTypes[monster.type] = (this.killedTypes[monster.type] || 0) + 1;
    sound.playCoinCollect();

    const gold = Array.isArray(monster.goldReward)
      ? Math.floor(monster.goldReward[0] + Math.random() * (monster.goldReward[1] - monster.goldReward[0]))
      : (monster.goldReward || 20);
    this.player.goldEarned += gold;
    this.addFloatingText(monster.x, monster.y - 15, `+${gold} Gold`, '#facc15', 14);

    if (monster.gemReward) {
      const gems = Array.isArray(monster.gemReward)
        ? Math.floor(monster.gemReward[0] + Math.random() * (monster.gemReward[1] - monster.gemReward[0]))
        : 6;
      this.player.gemsEarned += gems;
      this.addFloatingText(monster.x, monster.y - 32, `+${gems} Gems!`, '#a855f7', 15);
    }

    // Loot Drop Chance
    const dropChance = monster.isBoss ? 1.0 : 0.35;
    if (Math.random() < dropChance && LOOT_TABLE.length > 0) {
      const item = LOOT_TABLE[Math.floor(Math.random() * LOOT_TABLE.length)];
      if (this.onLootDrop) {
        this.onLootDrop(item);
      }
      this.addFloatingText(monster.x, monster.y - 45, `LOOT: ${item.name}!`, item.rarity === 'legendary' ? '#facc15' : '#38bdf8', 15);
    }

    this.createDeathExplosion(monster.x, monster.y, monster.color, monster.radius * 1.6);

    if (monster.isBoss) {
      sound.playLevelUp();
      this.addFloatingText(monster.x, monster.y - 65, '💠 +1 KRISTAL INTI DUNGEON!', '#c084fc', 18);
      if (this.onDungeonClear) {
        this.onDungeonClear({
          goldEarned: this.player.goldEarned,
          gemsEarned: this.player.gemsEarned,
          coreCrystalsEarned: 1,
          kills: this.player.kills,
          killedTypes: { ...this.killedTypes }
        });
      }
    }
  }

  damagePlayer(dmg, source) {
    if (this.player.invulnerableTimer > 0 || this.player.hp <= 0) return;

    let netDmg = Math.max(1, Math.round(dmg - this.player.defense * 0.45));
    if (this.player.ironBastionTimer > 0) {
      netDmg = Math.max(1, Math.round(netDmg * 0.3));
    }

    this.player.hp -= netDmg;
    this.player.invulnerableTimer = 0.38;
    sound.playAttackMelee();
    this.triggerScreenShake(0.18, 6);

    // Vampiric Affix: Leech 45% of damage dealt back as HP
    if (source && source.isElite && source.affix === 'Vampiric') {
      const heal = Math.round(netDmg * 0.45);
      source.hp = Math.min(source.maxHp, source.hp + heal);
      this.addFloatingText(source.x, source.y - source.radius - 12, `+${heal} HP`, '#4ade80', 13);
      this.createAuraParticles(source.x, source.y, '#22c55e', 8);
    }

    this.addFloatingText(this.player.x, this.player.y - 30, `-${netDmg}`, '#ef4444', 16);
    this.createHitSparks(this.player.x, this.player.y, '#ef4444', 12);

    if (this.player.hp <= 0) {
      this.player.hp = 0;
      if (this.onGameOver) {
        this.onGameOver({
          goldEarned: Math.floor(this.player.goldEarned * 0.6),
          kills: this.player.kills,
          killedTypes: { ...this.killedTypes }
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
        radius: 2.5 + Math.random() * 2,
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

    if (this.hitstopTimer > 0) {
      this.hitstopTimer -= dt;
      this.render();
      this.animId = requestAnimationFrame(this.loop.bind(this));
      return;
    }

    this.update(dt);
    this.render();

    this.animId = requestAnimationFrame(this.loop.bind(this));
  }

  update(dt) {
    // Cooldown timers
    if (this.input.skillCooldowns[0] > 0) this.input.skillCooldowns[0] -= dt;
    if (this.input.skillCooldowns[1] > 0) this.input.skillCooldowns[1] -= dt;
    if (this.input.skillCooldowns[2] > 0) this.input.skillCooldowns[2] -= dt;
    if (this.input.skillCooldowns.dash > 0) this.input.skillCooldowns.dash -= dt;

    if (this.player.attackTimer > 0) this.player.attackTimer -= dt;
    else this.player.isAttacking = false;

    if (this.player.dashTimer > 0) this.player.dashTimer -= dt;
    else this.player.dashing = false;

    if (this.player.invulnerableTimer > 0) this.player.invulnerableTimer -= dt;
    if (this.player.ironBastionTimer > 0) this.player.ironBastionTimer -= dt;
    if (this.player.frenzyTimer > 0) this.player.frenzyTimer -= dt;

    if (this.camera.shakeTimer > 0) {
      this.camera.shakeTimer -= dt;
    }

    // Combo timer
    if (this.comboTimer > 0) {
      this.comboTimer -= dt;
      if (this.comboTimer <= 0) {
        this.comboCount = 0;
      }
    }

    // Screen flash
    if (this.screenFlash.timer > 0) {
      this.screenFlash.timer -= dt;
    }

    // Floor decals decay
    for (let i = this.floorDecals.length - 1; i >= 0; i--) {
      const d = this.floorDecals[i];
      d.life -= dt;
      d.alpha = Math.min(0.7, d.life / 6.0);
      if (d.life <= 0) {
        this.floorDecals.splice(i, 1);
      }
    }

    // Molten Pools decay & player burn damage
    for (let i = this.moltenPools.length - 1; i >= 0; i--) {
      const p = this.moltenPools[i];
      p.life -= dt;
      p.tickTimer = (p.tickTimer || 0) - dt;

      const dPlayer = Math.hypot(this.player.x - p.x, this.player.y - p.y);
      if (dPlayer <= p.radius + this.player.radius && p.tickTimer <= 0) {
        p.tickTimer = 0.55;
        this.damagePlayer(p.damage || 5, null);
        this.createHitSparks(this.player.x, this.player.y, '#f97316', 4);
      }

      if (p.life <= 0) {
        this.moltenPools.splice(i, 1);
      }
    }

    // Danger AoE Telegraphs countdown & detonation
    for (let i = this.telegraphs.length - 1; i >= 0; i--) {
      const tg = this.telegraphs[i];
      tg.chargeTime -= dt;
      if (tg.chargeTime <= 0) {
        if (tg.onExecute) tg.onExecute();
        this.telegraphs.splice(i, 1);
      }
    }

    // Room Discovery & Exploration
    for (const r of this.dungeon.rooms) {
      if (!this.exploredRooms.has(r.id)) {
        if (this.player.x >= r.x && this.player.x <= r.x + r.w &&
            this.player.y >= r.y && this.player.y <= r.y + r.h) {
          this.exploredRooms.add(r.id);
          this.addFloatingText(r.cx, r.cy, `📍 ${r.name}`, r.isBoss ? '#c084fc' : '#facc15', 18);
          this.createAuraParticles(r.cx, r.cy, r.isBoss ? '#c084fc' : '#38bdf8', 25);
        }
      }
    }

    // Ambient floating dust particles
    const screenW = this.logicalWidth || this.canvas.width;
    const screenH = this.logicalHeight || this.canvas.height;
    for (const d of this.ambientDust) {
      d.y -= d.speedY * dt;
      d.x += Math.sin(this.gameTime * 2 + d.wobbleOffset) * 8 * dt;
      if (d.y < -10) {
        d.y = screenH + 10;
        d.x = Math.random() * screenW;
      }
    }

    this.gameTime += dt;
    this.torchTimer += dt * 4;

    // Passive MP Regen
    if (this.player.mp < this.player.maxMp) {
      this.player.mp = Math.min(this.player.maxMp, this.player.mp + 5.0 * dt);
    }

    // Player Movement
    if (this.player.hp > 0) {
      let vx = 0;
      let vy = 0;

      if (this.player.dashing) {
        vx = this.player.dashVx;
        vy = this.player.dashVy;
      } else {
        const speed = this.player.baseSpeed * (this.player.frenzyTimer > 0 ? 1.3 : 1.0) * 60 * dt;
        vx = this.input.moveX * speed;
        vy = this.input.moveY * speed;
      }

      this.player.vx = vx;
      this.player.vy = vy;

      if (isInsideWalkableDungeon(this.player.x + vx, this.player.y, this.player.radius, this.dungeon)) {
        this.player.x += vx;
      }
      if (isInsideWalkableDungeon(this.player.x, this.player.y + vy, this.player.radius, this.dungeon)) {
        this.player.y += vy;
      }
    } else {
      this.player.vx = 0;
      this.player.vy = 0;
    }

    // Update Mercenary Party Companion AI
    if (this.mercenary && this.mercenary.hp > 0 && this.player.hp > 0) {
      const merc = this.mercenary;
      const dxToPlayer = this.player.x - merc.x;
      const dyToPlayer = this.player.y - merc.y;
      const distToPlayer = Math.hypot(dxToPlayer, dyToPlayer);

      // Companion Speech Bubble decay
      if (merc.speechTimer > 0) {
        merc.speechTimer -= dt;
        if (merc.speechTimer <= 0) merc.speechBubble = null;
      }

      // Max search radius based on tacticsMode
      const maxRange = this.tacticsMode === 'follow' ? 95 : 250;
      let closestEnemy = null;
      let closestDist = maxRange;

      for (const m of this.monsters) {
        const d = Math.hypot(m.x - merc.x, m.y - merc.y);
        if (d < closestDist) {
          closestDist = d;
          closestEnemy = m;
        }
      }

      const shouldAttack = closestEnemy && (this.tacticsMode === 'attack' ? distToPlayer < 280 : distToPlayer < 110);

      if (shouldAttack) {
        // Target enemy
        const angle = Math.atan2(closestEnemy.y - merc.y, closestEnemy.x - merc.x);
        merc.facingAngle = angle;

        if (closestDist > (merc.attackRange || 45)) {
          merc.x += Math.cos(angle) * merc.speed * 60 * dt;
          merc.y += Math.sin(angle) * merc.speed * 60 * dt;
        } else {
          // Attack cooldown check
          merc.attackCooldownTimer -= dt;
          if (merc.attackCooldownTimer <= 0) {
            merc.attackCooldownTimer = merc.attackCooldown || 1.2;
            sound.playAttackMelee();
            this.damageMonster(closestEnemy, merc.attack, false);
            this.addFloatingText(closestEnemy.x, closestEnemy.y - 20, `${merc.name.split(' ')[0]}: -${merc.attack}`, merc.color);

            // Inotia Battle Cry
            if (Math.random() < 0.28 && merc.speechTimer <= 0) {
              const cries = [
                'Mampus kau!',
                'Rasakan hantamanku!',
                'Demi Dungeon!',
                'Tebasan Maut!',
                'Lindungi Tuanku!'
              ];
              merc.speechBubble = cries[Math.floor(Math.random() * cries.length)];
              merc.speechTimer = 1.8;
            }
          }
        }
      } else {
        // Follow player (maintain distance ~45px)
        if (distToPlayer > 45) {
          const angle = Math.atan2(dyToPlayer, dxToPlayer);
          merc.facingAngle = angle;
          const spdMult = this.tacticsMode === 'follow' ? 1.05 : 0.95;
          merc.x += Math.cos(angle) * (this.player.baseSpeed * spdMult) * 60 * dt;
          merc.y += Math.sin(angle) * (this.player.baseSpeed * spdMult) * 60 * dt;
        }
      }
    }

    // Check Boss encounter proximity & BGM shift
    if (this.boss && !this.bossEncounterTriggered) {
      const dToBoss = Math.hypot(this.boss.x - this.player.x, this.boss.y - this.player.y);
      if (dToBoss < 320) {
        this.bossEncounterTriggered = true;
        sound.playBGM('boss');
        if (this.onBossEncounter) {
          this.onBossEncounter(this.boss);
        }
      }
    }

    // Update Chests
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

      m.vx *= 0.85;
      m.vy *= 0.85;

      const dx = this.player.x - m.x;
      const dy = this.player.y - m.y;
      const distToPlayer = Math.hypot(dx, dy);

      if (distToPlayer < 380 && this.player.hp > 0) {
        const angle = Math.atan2(dy, dx);

        if (m.behavior === 'ranged_kite') {
          if (distToPlayer < 110) {
            m.vx -= Math.cos(angle) * m.speed * 1.5;
            m.vy -= Math.sin(angle) * m.speed * 1.5;
          } else if (distToPlayer > 180) {
            m.vx += Math.cos(angle) * m.speed;
            m.vy += Math.sin(angle) * m.speed;
          }

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
          m.cooldownTimer -= dt;
          m.slamTimer = (m.slamTimer || 3.5) - dt;

          if (distToPlayer > 45) {
            m.vx += Math.cos(angle) * m.speed;
            m.vy += Math.sin(angle) * m.speed;
          }

          // Boss Skill 1: Ground Slam AoE Danger Telegraph
          if (m.slamTimer <= 0) {
            m.slamTimer = m.isEnraged ? 3.4 : 5.0;
            const tx = this.player.x;
            const ty = this.player.y;
            const slamRadius = m.isEnraged ? 105 : 90;
            this.addFloatingText(m.x, m.y - m.radius - 18, '⚡ GEMPA PENGHANCUR!', '#ef4444', 15);

            this.telegraphs.push({
              id: `slam_${Date.now()}`,
              x: tx,
              y: ty,
              radius: slamRadius,
              chargeTime: 1.15,
              maxTime: 1.15,
              label: 'AWAS GEMPA!',
              onExecute: () => {
                sound.playBossRoar();
                this.triggerScreenShake(0.35, 14);
                this.createShockwave(tx, ty, slamRadius, '#ef4444');
                this.createDeathExplosion(tx, ty, '#f97316', 32);

                // Scorch crater decal
                if (this.floorDecals.length < 120) {
                  this.floorDecals.push({
                    x: tx,
                    y: ty,
                    radius: slamRadius * 0.65,
                    color: '#450a0a',
                    alpha: 0.7,
                    life: 18.0
                  });
                }

                // Blast hit detection
                const distToBlast = Math.hypot(this.player.x - tx, this.player.y - ty);
                if (distToBlast <= slamRadius + this.player.radius && this.player.invulnerableTimer <= 0) {
                  this.damagePlayer(Math.round(m.attack * 1.5), m);
                }
              }
            });
          }

          // Boss Skill 2: Nova Chaos Barrage (8 or 12 orbs when enraged)
          if (m.cooldownTimer <= 0) {
            m.cooldownTimer = m.isEnraged ? m.attackCooldown * 0.75 : m.attackCooldown;
            sound.playBossRoar();
            this.triggerScreenShake(0.3, 10);

            const orbs = m.isEnraged ? 12 : 8;
            for (let i = 0; i < orbs; i++) {
              const bAngle = angle + (Math.PI * 2 / orbs) * i;
              this.projectiles.push({
                x: m.x,
                y: m.y,
                vx: Math.cos(bAngle) * 3.8,
                vy: Math.sin(bAngle) * 3.8,
                radius: 8,
                damage: m.attack * 0.9,
                fromPlayer: false,
                color: m.isEnraged ? '#ef4444' : m.color,
                life: 1.8
              });
            }
          }
        } else {
          // Regular Mobs & Elite Champions
          if (distToPlayer > 28) {
            m.vx += Math.cos(angle) * m.speed;
            m.vy += Math.sin(angle) * m.speed;
          }

          // Elite Affix 1: Molten Lava Trail
          if (m.isElite && m.affix === 'Molten') {
            m.affixTimer = (m.affixTimer || 0) + dt;
            if (m.affixTimer >= 0.48 && this.moltenPools.length < 40) {
              m.affixTimer = 0;
              this.moltenPools.push({
                x: m.x,
                y: m.y,
                radius: 16,
                life: 3.2,
                damage: Math.round(m.attack * 0.35)
              });
            }
          }

          // Elite Affix 2: Shadow Blink (Teleport Behind Player)
          if (m.isElite && m.affix === 'Blink') {
            m.affixTimer = (m.affixTimer || 0) + dt;
            if (m.affixTimer >= 3.8 && distToPlayer > 55 && distToPlayer < 280) {
              m.affixTimer = 0;
              this.createDeathExplosion(m.x, m.y, '#a855f7', 16);
              const pAngle = this.player.facingAngle;
              m.x = this.player.x - Math.cos(pAngle) * 38;
              m.y = this.player.y - Math.sin(pAngle) * 38;
              this.createAuraParticles(m.x, m.y, '#c084fc', 12);
              this.addFloatingText(m.x, m.y - m.radius - 12, '💨 BLINK!', '#c084fc', 13);
              sound.playSkillCast();
            }
          }

          m.cooldownTimer -= dt;
          if (distToPlayer <= (m.attackRange || 32) && m.cooldownTimer <= 0) {
            m.cooldownTimer = m.attackCooldown;
            this.damagePlayer(m.attack, m);
          }
        }
      }

      const nextX = m.x + m.vx;
      const nextY = m.y + m.vy;
      if (isInsideWalkableDungeon(nextX, m.y, m.radius, this.dungeon)) m.x = nextX;
      if (isInsideWalkableDungeon(m.x, nextY, m.radius, this.dungeon)) m.y = nextY;
    }

    // Update Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;

      if (!isInsideWalkableDungeon(p.x, p.y, p.radius, this.dungeon)) {
        p.life = 0;
      }

      if (p.fromPlayer) {
        for (const m of this.monsters) {
          const d = Math.hypot(m.x - p.x, m.y - p.y);
          if (d <= m.radius + p.radius) {
            p.life = 0;
            if (p.isExplosive) {
              sound.playSkillExplosion();
              this.triggerScreenShake(0.2, 7);
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

    // Update Camera
    const camW = this.logicalWidth || this.canvas.width;
    const camH = this.logicalHeight || this.canvas.height;
    const targetCamX = this.player.x - camW / 2;
    const targetCamY = this.player.y - camH / 2;
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
        mercenaryHp: this.mercenary ? this.mercenary.hp : null,
        mercenaryMaxHp: this.mercenary ? this.mercenary.maxHp : null,
        skillCooldowns: { ...this.input.skillCooldowns },
        comboCount: this.comboCount,
        comboTimer: this.comboTimer,
        tacticsMode: this.tacticsMode
      });
    }
  }

  toggleTactics() {
    this.tacticsMode = this.tacticsMode === 'attack' ? 'follow' : 'attack';
    sound.playEquipItem();
    const isAttack = this.tacticsMode === 'attack';
    this.addFloatingText(
      this.player.x, 
      this.player.y - 35, 
      isAttack ? '⚔️ TAKTIK: SERBU BEBAS!' : '🛡️ TAKTIK: KAWAL PEMIMPIN!', 
      isAttack ? '#facc15' : '#38bdf8', 
      16
    );
  }

  render() {
    const { ctx, canvas } = this;
    const dpr = this.dpr || 1;
    const w = this.logicalWidth || canvas.width;
    const h = this.logicalHeight || canvas.height;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(dpr, dpr);

    ctx.save();

    // Camera with Screen Shake
    let camX = this.camera.x;
    let camY = this.camera.y;
    if (this.camera.shakeTimer > 0) {
      camX += (Math.random() - 0.5) * this.camera.shakeMag;
      camY += (Math.random() - 0.5) * this.camera.shakeMag;
    }
    ctx.translate(-Math.floor(camX), -Math.floor(camY));

    // 1. Draw Dungeon Floor & Rooms
    ctx.fillStyle = '#0a0d14';
    ctx.fillRect(0, 0, this.dungeon.mapWidth, this.dungeon.mapHeight);

    // Corridors
    for (const corr of this.dungeon.corridors) {
      DungeonTileRenderer.drawCorridor(ctx, corr);
    }

    // Rooms
    for (const room of this.dungeon.rooms) {
      DungeonTileRenderer.drawRoom(ctx, room, this.gameTime);

      // Shroud unexplored rooms in atmospheric Fog of War
      if (!this.exploredRooms.has(room.id)) {
        ctx.save();
        ctx.fillStyle = 'rgba(5, 7, 12, 0.95)';
        ctx.fillRect(room.x, room.y, room.w, room.h);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2;
        ctx.strokeRect(room.x, room.y, room.w, room.h);

        // Ancient mystery glyph in center
        ctx.font = "bold 22px 'Cinzel', serif";
        ctx.fillStyle = 'rgba(250, 204, 21, 0.22)';
        ctx.textAlign = 'center';
        ctx.fillText('?', room.cx, room.cy + 7);
        ctx.restore();
      }
    }

    // Floor Decals (Persistent Blood & Scorch Stains)
    for (const d of this.floorDecals) {
      ctx.save();
      ctx.globalAlpha = d.alpha;
      ctx.fillStyle = d.color;
      ctx.beginPath();
      ctx.ellipse(d.x, d.y, d.radius, d.radius * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Molten Lava Puddles (Floor Hazard)
    SpriteRenderer.drawMoltenEmbers(ctx, this.moltenPools, this.gameTime);

    // Danger AoE Telegraphs (Red Warning Circles)
    SpriteRenderer.drawTelegraphs(ctx, this.telegraphs, this.gameTime);

    // 2. Draw Torches
    for (const torch of this.dungeon.torches) {
      DungeonTileRenderer.drawTorch(ctx, torch, this.gameTime);
    }

    // 3. Draw Chests
    for (const c of this.chests) {
      DungeonTileRenderer.drawChest(ctx, c);
    }

    // 4. Draw Monsters & Boss
    for (const m of this.monsters) {
      SpriteRenderer.drawMonster(ctx, m, this.gameTime);
    }

    // 5. Draw Mercenary Party Companion
    if (this.mercenary && this.mercenary.hp > 0) {
      SpriteRenderer.drawMercenary(ctx, this.mercenary, this.gameTime);
    }

    // 6. Draw Player
    if (this.player.hp > 0) {
      SpriteRenderer.drawHero(ctx, this.player, this.heroClass, this.gameTime);
    }

    // 7. Draw Projectiles
    for (const p of this.projectiles) {
      ctx.save();
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 8. Draw Particles & Shockwaves
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

    // 9. Draw Floating Damage Text
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

    // Screen Flash effect (Golden crit burst / Blood damage pulse)
    if (this.screenFlash.timer > 0) {
      ctx.save();
      ctx.fillStyle = this.screenFlash.color;
      ctx.fillRect(camX - 100, camY - 100, w + 200, h + 200);
      ctx.restore();
    }

    ctx.restore();

    // 10. Ambient Floating Dust Motes & Dungeon Embers (Screen-Space)
    ctx.save();
    for (const d of this.ambientDust) {
      ctx.fillStyle = '#fde047';
      ctx.globalAlpha = d.alpha * (0.6 + Math.sin(this.gameTime * 3 + d.wobbleOffset) * 0.4);
      ctx.beginPath();
      ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 11. Cinematic Dark Dungeon Vignette
    ctx.save();
    const vigGrad = ctx.createRadialGradient(
      w / 2, h / 2, Math.min(w, h) * 0.42,
      w / 2, h / 2, Math.max(w, h) * 0.78
    );
    vigGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vigGrad.addColorStop(1, 'rgba(3, 5, 10, 0.65)');
    ctx.fillStyle = vigGrad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();

    // 12. Mini-map with Fog of War
    this.renderMiniMap(ctx, w, h);

    ctx.restore();
  }

  renderMiniMap(ctx, screenW, screenH) {
    const mmSize = 75;
    const w = screenW || this.logicalWidth || this.canvas.width;
    const mmX = w - mmSize - 12;
    const mmY = 14;

    ctx.save();
    ctx.fillStyle = 'rgba(7, 9, 14, 0.85)';
    ctx.fillRect(mmX, mmY, mmSize, mmSize);
    ctx.strokeStyle = '#3a4e6e';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(mmX, mmY, mmSize, mmSize);

    const scaleX = mmSize / this.dungeon.mapWidth;
    const scaleY = mmSize / this.dungeon.mapHeight;

    for (const r of this.dungeon.rooms) {
      const isExplored = this.exploredRooms.has(r.id);
      ctx.fillStyle = !isExplored ? '#0f172a' : r.isBoss ? '#a855f7' : r.isStart ? '#10b981' : '#64748b';
      ctx.fillRect(mmX + r.x * scaleX, mmY + r.y * scaleY, r.w * scaleX, r.h * scaleY);
    }

    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(mmX + this.player.x * scaleX, mmY + this.player.y * scaleY, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
