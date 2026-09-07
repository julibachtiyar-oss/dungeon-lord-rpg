import Phaser from 'phaser';
import { SceneKey } from '../config/keys';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/enemies/Enemy';
import { Blob } from '../entities/enemies/Blob';
import { Goblin } from '../entities/enemies/Goblin';
import { SkeletonArcher } from '../entities/enemies/SkeletonArcher';
import { RuinWarden } from '../entities/enemies/RuinWarden';
import { Hitbox } from '../entities/Hitbox';
import { Projectile } from '../entities/Projectile';
import { Chest } from '../entities/Chest';
import { Pickup } from '../entities/Pickup';
import { FeelManager } from '../systems/FeelManager';
import { ParticleSystem } from '../systems/ParticleSystem';
import { InputSystem } from '../systems/InputSystem';
import { CombatSystem } from '../systems/CombatSystem';
import { RoomManager } from '../systems/RoomManager';
import { MapLoader, FloorData } from '../systems/MapLoader';
import { EventBus } from '../events';
import { BALANCE } from '../config/balance';
import { SFX } from '../audio/sfx';
import { BGM } from '../audio/bgm';

export class GameScene extends Phaser.Scene {
  private currentFloorNumber: number = 1;
  private floorData!: FloorData;
  private player!: Player;
  private feel!: FeelManager;
  private particles!: ParticleSystem;
  private inputs!: InputSystem;
  private combat!: CombatSystem;
  private rooms!: RoomManager;

  // Groups
  private enemies!: Phaser.GameObjects.Group;
  private projectiles!: Phaser.GameObjects.Group;
  private pickups!: Phaser.GameObjects.Group;
  private chests!: Phaser.GameObjects.Group;
  private playerHitbox!: Hitbox;
  private wallsGroup!: Phaser.Physics.Arcade.StaticGroup;
  private decorGroup!: Phaser.GameObjects.Group;
  private lightsGroup!: Phaser.GameObjects.Group;
  private playerLight!: Phaser.GameObjects.Image;
  private stairsPortal: { x: number; y: number } | null = null;
  private stairsHalo: Phaser.GameObjects.Image | null = null;

  // Run Stats & Timers
  private runStartTime: number = 0;
  private totalKills: number = 0;
  private totalDamageTaken: number = 0;
  private lastMapEmitTime: number = 0;
  private onPlayerDamaged?: (p: { damage: number; currentHp: number }) => void;
  private onBossDefeated?: () => void;

  constructor() {
    super(SceneKey.Game);
  }

  init(): void {
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, this.shutdown, this);
  }

  private shutdown(): void {
    if (this.onPlayerDamaged) EventBus.offEvent('player:damaged', this.onPlayerDamaged);
    if (this.onBossDefeated) EventBus.offEvent('boss:defeated', this.onBossDefeated);
    if (this.player) {
      if (this.player.swordSprite) {
        this.player.swordSprite.destroy();
      }
      this.player.destroy();
      this.player = null as any;
    }
  }

  create(): void {
    this.currentFloorNumber = 1;
    this.runStartTime = Date.now();
    this.totalKills = 0;
    this.totalDamageTaken = 0;
    this.lastMapEmitTime = 0;
    this.player = null as any;

    this.feel = new FeelManager(this);
    this.particles = new ParticleSystem(this);
    this.inputs = new InputSystem(this);
    this.combat = new CombatSystem(this, this.feel, this.particles);
    this.rooms = new RoomManager();

    this.setupGroups();
    this.loadFloor(1);

    EventBus.emitEvent('game:state', 'playing');

    // Listen to damage for tracking
    this.onPlayerDamaged = (p) => {
      this.totalDamageTaken += p.damage;
    };
    EventBus.onEvent('player:damaged', this.onPlayerDamaged, this);

    // Listen to boss defeat for Beat 5 & Victory
    this.onBossDefeated = () => {
      this.handleBossDefeated();
    };
    EventBus.onEvent('boss:defeated', this.onBossDefeated, this);
  }

  private setupGroups(): void {
    this.enemies = this.add.group({ runChildUpdate: true });
    this.projectiles = this.add.group({
      classType: Projectile,
      maxSize: 30,
      runChildUpdate: true
    });
    this.pickups = this.add.group({
      classType: Pickup,
      maxSize: 40,
      runChildUpdate: true
    });
    this.chests = this.add.group();
    this.wallsGroup = this.physics.add.staticGroup();
    this.decorGroup = this.add.group();
    this.lightsGroup = this.add.group();

    this.playerHitbox = new Hitbox(this);

    // Create Hero Lantern Light Halo
    this.playerLight = this.add.image(0, 0, 'light_halo');
    this.playerLight.setBlendMode(Phaser.BlendModes.ADD);
    this.playerLight.setAlpha(0.65);
    this.playerLight.setDepth(999);
  }

  private loadFloor(floorNum: number): void {
    this.currentFloorNumber = floorNum;
    this.floorData = MapLoader.getFloor(floorNum);
    this.stairsPortal = null;
    this.stairsHalo = null;

    // Clear previous floor entities
    this.enemies.clear(true, true);
    this.wallsGroup.clear(true, true);
    this.chests.clear(true, true);
    this.decorGroup.clear(true, true);
    this.lightsGroup.clear(true, true);

    // 1. Set Expanded Physics World Bounds & Camera Bounds to fit entire dungeon!
    const b = this.floorData.bounds;
    const pad = 96;
    const worldW = (b.maxX - b.minX) + pad * 2;
    const worldH = (b.maxY - b.minY) + pad * 2;
    this.physics.world.setBounds(b.minX - pad, b.minY - pad, worldW, worldH);
    this.cameras.main.setBounds(b.minX - pad, b.minY - pad, worldW, worldH);

    // 2. Render 100% interconnected floor geometry & outer perimeter walls
    this.renderFloorGeometry(this.floorData);

    // 3. Cleanly recreate Player attached to current scene
    const prevHp = this.player?.hp;
    const prevPotions = this.player?.potions;
    const prevGold = this.player?.gold;
    const prevLevel = this.player?.level;
    const prevXp = this.player?.xp;
    const prevWeaponTier = this.player?.weaponTier;

    if (this.player) {
      if (this.player.swordSprite) {
        this.player.swordSprite.destroy();
      }
      this.player.destroy();
      this.player = null as any;
    }

    this.player = new Player(this, this.floorData.playerSpawn.x, this.floorData.playerSpawn.y);
    if (prevHp !== undefined && floorNum > 1) {
      this.player.hp = prevHp;
      this.player.potions = prevPotions!;
      this.player.gold = prevGold!;
      this.player.level = prevLevel!;
      this.player.xp = prevXp!;
      this.player.weaponTier = prevWeaponTier!;
    }
    this.cameras.main.startFollow(this.player, true, 0.15, 0.15);
    this.cameras.main.setZoom(1.0);

    // 4. Spawn Enemies and Chests per room
    for (const room of this.floorData.rooms) {
      for (const enemyDef of room.enemies) {
        this.spawnEnemy(enemyDef.type, enemyDef.x, enemyDef.y);
      }
      if (room.chest) {
        const chest = new Chest(this, room.chest.x, room.chest.y, room.chest.tier);
        this.chests.add(chest);
      }
    }

    // 5. Setup Colliders
    this.physics.add.collider(this.player, this.wallsGroup);
    this.physics.add.collider(this.enemies, this.wallsGroup);
    this.physics.add.collider(this.enemies, this.enemies);

    // 6. Audio Track selection
    if (floorNum === 3) {
      BGM.playBoss();
    } else {
      BGM.playDungeon();
    }

    // Story Beats
    if (floorNum === 1) {
      EventBus.emitEvent('story:dialogue', {
        id: 2,
        speaker: 'Ren (Ksatria)',
        text: '(Kuil Gerbang Runtuh. Lorong-lorong batu kuno terbuka. Habisi monster di setiap aula untuk membuka segel tangga!)',
        options: ['Maju Menjelajah']
      });
    } else if (floorNum === 2) {
      EventBus.emitEvent('story:dialogue', {
        id: 3,
        speaker: 'Ren (Ksatria)',
        text: '(Makam Obsidian. Udara semakin dingin... pemanah kerangka dan goblin menjaga jalan ke inti kuil.)',
        options: ['Hunus Pedang']
      });
    } else if (floorNum === 3) {
      EventBus.emitEvent('story:dialogue', {
        id: 4,
        speaker: 'Inti Kristal Emberdeep',
        text: 'Ksatria terpilih! Hancurkan Ruin Warden dan jadikan inti kristal ini milikmu!',
        options: ['Hancurkan Golem!']
      });
    }

    this.player.emitStats();
  }

  private renderFloorGeometry(data: FloorData): void {
    const floorTilesSet = new Set<string>();

    // 1. Collect all room floor tiles
    for (const r of data.rooms) {
      for (let x = r.x; x < r.x + r.w; x += 16) {
        for (let y = r.y; y < r.y + r.h; y += 16) {
          floorTilesSet.add(`${x},${y}`);
        }
      }
    }

    // 2. Collect all corridor floor tiles
    for (const c of data.corridors) {
      for (let x = c.x; x < c.x + c.w; x += 16) {
        for (let y = c.y; y < c.y + c.h; y += 16) {
          floorTilesSet.add(`${x},${y}`);
        }
      }
    }

    // 3. Render floor tiles
    floorTilesSet.forEach((coord) => {
      const parts = coord.split(',');
      const sx = parseInt(parts[0], 10);
      const sy = parseInt(parts[1], 10);
      const isRune = (Math.floor(sx / 16) + Math.floor(sy / 16)) % 7 === 0;
      const tex = isRune ? 'floor_rune' : 'floor_tile';
      const tile = this.add.image(sx + 8, sy + 8, tex);
      tile.setDepth(-10);
    });

    // 4. Place wall tiles strictly on the outer perimeter
    const wallSet = new Set<string>();
    const offsets = [
      [-16, 0], [16, 0], [0, -16], [0, 16],
      [-16, -16], [16, -16], [-16, 16], [16, 16]
    ];

    floorTilesSet.forEach((coord) => {
      const parts = coord.split(',');
      const fx = parseInt(parts[0], 10);
      const fy = parseInt(parts[1], 10);

      for (const [dx, dy] of offsets) {
        const nx = fx + dx;
        const ny = fy + dy;
        const key = `${nx},${ny}`;
        if (!floorTilesSet.has(key) && !wallSet.has(key)) {
          wallSet.add(key);
          const wall = this.wallsGroup.create(nx + 8, ny + 8, 'wall_tile');
          wall.setDepth(ny + 8);
        }
      }
    });

    // 5. Add torches and DownStairs Portal
    for (const r of data.rooms) {
      // Wall torch
      const torchX = r.x + 32;
      const torchY = r.y - 4;
      const torch = this.add.image(torchX, torchY, 'torch');
      torch.setDepth(torchY + 1);
      this.decorGroup.add(torch);

      const torchLight = this.add.image(torchX, torchY + 6, 'light_halo');
      torchLight.setBlendMode(Phaser.BlendModes.ADD);
      torchLight.setAlpha(0.4);
      torchLight.setScale(0.8);
      this.lightsGroup.add(torchLight);

      // DownStairs Portal in exit room
      if (r.isDownStairs) {
        const px = r.x + Math.floor(r.w * 0.5);
        const py = r.y + Math.floor(r.h * 0.5);
        this.stairsPortal = { x: px, y: py };

        const portal = this.add.image(px, py, 'stairs_portal');
        portal.setDepth(py);
        this.decorGroup.add(portal);

        this.stairsHalo = this.add.image(px, py, 'crystal_halo');
        this.stairsHalo.setBlendMode(Phaser.BlendModes.ADD);
        this.stairsHalo.setAlpha(0.7);
        this.stairsHalo.setScale(0.9);
        this.lightsGroup.add(this.stairsHalo);
      }
    }

    // Floor 3 (Boss Room): Add Glowing Purple Crystals
    if (this.currentFloorNumber === 3) {
      const bossRoom = data.rooms[1];
      if (bossRoom) {
        const corners = [
          { x: bossRoom.x + 32, y: bossRoom.y + 32 },
          { x: bossRoom.x + bossRoom.w - 32, y: bossRoom.y + 32 },
          { x: bossRoom.x + 32, y: bossRoom.y + bossRoom.h - 32 },
          { x: bossRoom.x + bossRoom.w - 32, y: bossRoom.y + bossRoom.h - 32 }
        ];
        for (const c of corners) {
          const crystal = this.add.image(c.x, c.y, 'core_crystal');
          crystal.setDepth(c.y);
          this.decorGroup.add(crystal);

          const halo = this.add.image(c.x, c.y, 'crystal_halo');
          halo.setBlendMode(Phaser.BlendModes.ADD);
          halo.setAlpha(0.7);
          this.lightsGroup.add(halo);
        }
      }
    }
  }

  private spawnEnemy(type: 'blob' | 'goblin' | 'skeleton' | 'boss', x: number, y: number): void {
    let enemy;
    if (type === 'blob') {
      enemy = new Blob(this, x, y);
    } else if (type === 'goblin') {
      enemy = new Goblin(this, x, y);
    } else if (type === 'skeleton') {
      const archer = new SkeletonArcher(this, x, y);
      archer.projectilePool = this.projectiles;
      enemy = archer;
    } else {
      enemy = new RuinWarden(this, x, y);
    }

    if (enemy) {
      this.enemies.add(enemy);
    }
  }

  update(time: number, delta: number): void {
    if (!this.player || !this.player.active || this.player.currentState === 'dead') return;

    // Follow player with torch lantern light
    if (this.playerLight) {
      this.playerLight.setPosition(this.player.x, this.player.y);
      this.playerLight.setAlpha(0.55 + Math.sin(time * 0.005) * 0.08);
    }

    // Pulse stairs halo
    if (this.stairsHalo) {
      this.stairsHalo.setAlpha(0.6 + Math.sin(time * 0.006) * 0.25);
    }

    const inputState = this.inputs.getState();

    // Auto-aim: find nearest active enemy
    let nearestEnemy: Enemy | null = null;
    let minDist = 999;
    let activeEnemiesCount = 0;
    this.enemies.getChildren().forEach((child) => {
      const e = child as Enemy;
      if (e.active && !e.isDead) {
        activeEnemiesCount++;
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
        if (d < minDist) {
          minDist = d;
          nearestEnemy = e;
        }
      }
    });

    const enemyPos = nearestEnemy ? { x: (nearestEnemy as Enemy).x, y: (nearestEnemy as Enemy).y } : null;

    // Update Player Input & State
    this.player.handleInput(
      inputState.move,
      inputState.attack,
      inputState.cleave,
      inputState.bulwark,
      inputState.dash,
      inputState.potion,
      enemyPos,
      time
    );

    // Sync sword position
    if (this.player.swordSprite && this.player.swordSprite.visible) {
      this.player.swordSprite.setPosition(
        this.player.x + this.player.facing.x * 12,
        this.player.y + this.player.facing.y * 12
      );
    }

    // Check Player Attacking -> Activate Hitbox
    if (
      this.player.currentState === 'attack1' ||
      this.player.currentState === 'attack2' ||
      this.player.currentState === 'attack3' ||
      this.player.currentState === 'cleave'
    ) {
      this.checkPlayerAttackOverlap();
    }

    // Check Enemy Contact -> Damage Player
    this.checkEnemyAttackOverlap();

    // Check Projectiles vs Player
    this.checkProjectileOverlap();

    // Check Pickups & Chests
    this.checkPickupsAndChests();

    // Check Stairs / Floor Progression
    this.checkStairsProgression(activeEnemiesCount === 0);

    // Periodically emit mini-map radar state (every 250ms)
    if (time - this.lastMapEmitTime > 250) {
      this.lastMapEmitTime = time;
      EventBus.emitEvent('dungeon:map', {
        playerX: Math.round(this.player.x),
        playerY: Math.round(this.player.y),
        floor: this.currentFloorNumber,
        bounds: this.floorData.bounds,
        rooms: this.floorData.rooms.map((r) => ({
          id: r.id,
          x: r.x,
          y: r.y,
          w: r.w,
          h: r.h,
          isExit: r.isDownStairs
        })),
        enemiesCount: activeEnemiesCount,
        portalReady: activeEnemiesCount === 0
      });
    }

    // Emit Skills Cooldown Progress to React HUD
    EventBus.emitEvent('player:skills', this.player.getSkillState(time));

    // Check Game Over
    if (this.player.hp <= 0) {
      this.player.currentState = 'dead';
      EventBus.emitEvent('game:over', { floor: this.currentFloorNumber });
    }
  }

  private checkPlayerAttackOverlap(): void {
    const p = this.player;
    const facing = p.facing;
    const hitIndex = p.currentState === 'attack1' ? 1 : p.currentState === 'attack2' ? 2 : 3;
    const isCleave = p.currentState === 'cleave';
    const comboCfg = BALANCE.player.combo[hitIndex - 1];
    const cleaveCfg = BALANCE.player.cleave;
    const hitboxW = isCleave ? cleaveCfg.radius * 1.5 : comboCfg.hitboxW;
    const hitboxH = isCleave ? cleaveCfg.radius * 1.5 : comboCfg.hitboxH;
    const damageMultiplier = isCleave ? cleaveCfg.damageMultiplier : comboCfg.damageMultiplier;
    const knockback = isCleave ? cleaveCfg.knockback : comboCfg.knockback;
    const damage = Math.round(p.getDamage() * damageMultiplier);

    const hitboxX = p.x + facing.x * 18;
    const hitboxY = p.y + facing.y * 18;

    this.playerHitbox.activate(hitboxX, hitboxY, hitboxW, hitboxH, damage, knockback, 100, isCleave);

    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      if (enemy.active && !enemy.isDead) {
        const d = Phaser.Math.Distance.Between(hitboxX, hitboxY, enemy.x, enemy.y);
        if (d <= hitboxW) {
          this.combat.handlePlayerAttackHit(this.playerHitbox, enemy, p);
          this.totalKills++;
        }
      }
    });
  }

  private checkEnemyAttackOverlap(): void {
    if (this.player.isInvulnerable || this.player.currentState === 'dash') return;

    this.enemies.getChildren().forEach((child) => {
      const e = child as Enemy;
      if (e.active && !e.isDead) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, e.x, e.y);
        if (dist <= 18) {
          const dmg = (e as any).contactDamage || 8;
          this.combat.handleEnemyAttackHit(this.player, dmg, e.x, e.y);
        }
      }
    });
  }

  private checkProjectileOverlap(): void {
    this.projectiles.getChildren().forEach((child) => {
      const proj = child as Projectile;
      if (proj.active) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, proj.x, proj.y);
        if (dist <= 14) {
          proj.kill();
          this.combat.handleEnemyAttackHit(this.player, proj.damage, proj.x, proj.y);
        }
      }
    });
  }

  private checkPickupsAndChests(): void {
    // Pickups
    this.pickups.getChildren().forEach((child) => {
      const p = child as Pickup;
      if (p.active) {
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, p.x, p.y);
        if (d <= 28) {
          p.magnetTo(this.player.x, this.player.y);
          if (d <= 12) {
            if (p.pickupType === 'gold') this.player.addGold(p.value);
            else if (p.pickupType === 'potion') this.player.potions = Math.min(5, this.player.potions + 1);
            p.collect();
          }
        }
      }
    });

    // Chests
    this.chests.getChildren().forEach((child) => {
      const chest = child as Chest;
      if (!chest.isOpened) {
        const d = Phaser.Math.Distance.Between(this.player.x, this.player.y, chest.x, chest.y);
        if (d <= 24) {
          const reward = chest.open();
          SFX.coin();
          if (reward.weaponUpgrade) this.player.weaponTier++;
          if (reward.gold) this.player.addGold(reward.gold);
          if (reward.potion) this.player.potions = Math.min(5, this.player.potions + 1);
          this.player.emitStats();
        }
      }
    });
  }

  private checkStairsProgression(allEnemiesDefeated: boolean): void {
    if (!this.stairsPortal || this.currentFloorNumber >= 3) return;

    const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.stairsPortal.x, this.stairsPortal.y);
    if (dist <= 28) {
      if (allEnemiesDefeated) {
        SFX.door();
        this.cameras.main.flash(300, 255, 255, 255);
        this.loadFloor(this.currentFloorNumber + 1);
      }
    }
  }

  private handleBossDefeated(): void {
    SFX.victoryFanfare();
    const elapsedSec = Math.round((Date.now() - this.runStartTime) / 1000);

    let rank = 'C';
    if (elapsedSec <= 90 && this.totalDamageTaken < 50) rank = 'S';
    else if (elapsedSec <= 150) rank = 'A';
    else if (elapsedSec <= 240) rank = 'B';

    EventBus.emitEvent('story:dialogue', {
      id: 5,
      speaker: 'Inti Kristal Emberdeep',
      text: 'Ruin Warden telah tumbang! Inti Kristal Utama kini menyatu dengan jiwamu. Kau adalah Penguasa Dungeon (DUNGEON LORD) baru!',
      options: ['Klaim Kristal & Kembali ke Kota']
    });

    EventBus.onEvent('story:choice', () => {
      EventBus.emitEvent('game:victory', {
        timeSec: elapsedSec,
        kills: this.totalKills,
        damageTaken: this.totalDamageTaken,
        gold: this.player.gold,
        rank
      });
    });
  }
}
