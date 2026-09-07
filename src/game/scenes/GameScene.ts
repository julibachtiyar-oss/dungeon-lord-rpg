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

  // Run Stats
  private runStartTime: number = 0;
  private totalKills: number = 0;
  private totalDamageTaken: number = 0;

  constructor() {
    super(SceneKey.Game);
  }

  create(): void {
    this.runStartTime = Date.now();
    this.totalKills = 0;
    this.totalDamageTaken = 0;

    this.feel = new FeelManager(this);
    this.particles = new ParticleSystem(this);
    this.inputs = new InputSystem(this);
    this.combat = new CombatSystem(this, this.feel, this.particles);
    this.rooms = new RoomManager();

    this.setupGroups();
    this.loadFloor(this.currentFloorNumber);

    // Start background synth ambiance
    BGM.start();

    EventBus.emitEvent('game:state', 'playing');

    // Listen to damage for tracking
    EventBus.onEvent('player:damaged', (p) => {
      this.totalDamageTaken += p.damage;
    }, this);

    // Listen to boss defeat for Beat 5 & Victory
    EventBus.onEvent('boss:defeated', () => {
      this.handleBossDefeated();
    }, this);
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

    // Clear previous floor entities
    this.enemies.clear(true, true);
    this.wallsGroup.clear(true, true);
    this.chests.clear(true, true);
    this.decorGroup.clear(true, true);
    this.lightsGroup.clear(true, true);

    // Render floor background & walls & dynamic lights
    this.renderFloorGeometry(this.floorData);

    // Spawn or reposition Player
    if (!this.player) {
      this.player = new Player(this, this.floorData.playerSpawn.x, this.floorData.playerSpawn.y);
      this.cameras.main.startFollow(this.player, true, 0.12, 0.12);
      this.cameras.main.setZoom(1.0);
    } else {
      this.player.setPosition(this.floorData.playerSpawn.x, this.floorData.playerSpawn.y);
    }

    // Spawn Enemies and Chests per room
    for (const room of this.floorData.rooms) {
      for (const enemyDef of room.enemies) {
        this.spawnEnemy(enemyDef.type, enemyDef.x, enemyDef.y);
      }
      if (room.chest) {
        const chest = new Chest(this, room.chest.x, room.chest.y, room.chest.tier);
        this.chests.add(chest);
      }
    }

    // Setup Colliders
    this.physics.add.collider(this.player, this.wallsGroup);
    this.physics.add.collider(this.enemies, this.wallsGroup);
    this.physics.add.collider(this.enemies, this.enemies);

    // Trigger Story Beat
    if (floorNum === 1) {
      EventBus.emitEvent('story:dialogue', {
        id: 2,
        speaker: 'Ren (Ksatria)',
        text: '(Kuil Gerbang Kuno. Terlalu banyak goblin... mereka seperti digerakkan sesuatu dari dalam.)',
        options: ['Lanjut Menjelajah']
      });
    } else if (floorNum === 2) {
      EventBus.emitEvent('story:dialogue', {
        id: 3,
        speaker: 'Ren (Ksatria)',
        text: '(Pemanah kerangka bangkit dari makam kuno. Kristal di bawah memanggilku...)',
        options: ['Hunus Pedang']
      });
    } else if (floorNum === 3) {
      EventBus.emitEvent('story:dialogue', {
        id: 4,
        speaker: 'Suara Kristal Emberdeep',
        text: '...Ksatria terpilih... Hancurkan Ruin Warden dan jadikan inti ini milikmu selamanya!',
        options: ['Aku akan membebaskanmu!', 'Mati kau golem!']
      });
    }

    this.player.emitStats();
  }

  private renderFloorGeometry(data: FloorData): void {
    for (const r of data.rooms) {
      // Room floor tiles with decorative pattern
      for (let x = r.x; x < r.x + r.w; x += 16) {
        for (let y = r.y; y < r.y + r.h; y += 16) {
          const isRune = (Math.floor(x / 16) + Math.floor(y / 16)) % 6 === 0;
          const tex = isRune ? 'floor_rune' : 'floor_tile';
          const tile = this.add.image(x + 8, y + 8, tex);
          tile.setDepth(-10);
        }
      }

      // Perimeter walls
      // Top & Bottom walls
      for (let x = r.x - 16; x <= r.x + r.w; x += 16) {
        const topWall = this.wallsGroup.create(x + 8, r.y - 8, 'wall_tile');
        topWall.setDepth(r.y);

        // Add torch on top wall every 64 pixels
        if ((x - r.x) % 64 === 0 && x > r.x && x < r.x + r.w) {
          const torch = this.add.image(x + 8, r.y - 4, 'torch');
          torch.setDepth(r.y + 1);
          this.decorGroup.add(torch);

          const torchLight = this.add.image(x + 8, r.y + 4, 'light_halo');
          torchLight.setBlendMode(Phaser.BlendModes.ADD);
          torchLight.setAlpha(0.4);
          torchLight.setScale(0.85);
          torchLight.setDepth(998);
          this.lightsGroup.add(torchLight);
        }

        const botWall = this.wallsGroup.create(x + 8, r.y + r.h + 8, 'wall_tile');
        botWall.setDepth(r.y + r.h + 16);
      }

      // Left & Right walls
      for (let y = r.y; y < r.y + r.h; y += 16) {
        const leftWall = this.wallsGroup.create(r.x - 8, y + 8, 'wall_tile');
        leftWall.setDepth(y + 8);
        const rightWall = this.wallsGroup.create(r.x + r.w + 8, y + 8, 'wall_tile');
        rightWall.setDepth(y + 8);
      }

      // If Floor 3 (Boss Room): Add Glowing Purple Crystals in corners
      if (this.currentFloorNumber === 3) {
        const crystalPositions = [
          { x: r.x + 24, y: r.y + 24 },
          { x: r.x + r.w - 24, y: r.y + 24 },
          { x: r.x + 24, y: r.y + r.h - 24 },
          { x: r.x + r.w - 24, y: r.y + r.h - 24 }
        ];
        for (const pos of crystalPositions) {
          const crystal = this.add.image(pos.x, pos.y, 'core_crystal');
          crystal.setDepth(pos.y);
          this.decorGroup.add(crystal);

          const halo = this.add.image(pos.x, pos.y, 'crystal_halo');
          halo.setBlendMode(Phaser.BlendModes.ADD);
          halo.setAlpha(0.6);
          halo.setDepth(998);
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
    if (!this.player || this.player.currentState === 'dead') return;

    // Follow player with torch lantern light
    if (this.playerLight) {
      this.playerLight.setPosition(this.player.x, this.player.y);
      // Gentle flicker effect
      this.playerLight.setAlpha(0.55 + Math.sin(time * 0.005) * 0.08);
    }

    const inputState = this.inputs.getState();

    // Find nearest enemy for auto-aim
    let nearestEnemy: Enemy | null = null;
    let minDist = 999;
    this.enemies.getChildren().forEach((child) => {
      const e = child as Enemy;
      if (e.active && !e.isDead) {
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
      enemyPos
    );

    // Sync sword position
    if (this.player.swordSprite.visible) {
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

    // Check Room & Progression
    this.checkRoomProgression();

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

  private checkRoomProgression(): void {
    const room = this.rooms.checkPlayerRoom(this.player.x, this.player.y, this.floorData.rooms, this.currentFloorNumber);
    if (!room) return;

    // Check if down-stairs reached
    if (room.isDownStairs) {
      let anyEnemyInRoom = false;
      this.enemies.getChildren().forEach((child) => {
        const e = child as Enemy;
        if (e.active && !e.isDead && e.x >= room.x && e.x <= room.x + room.w && e.y >= room.y && e.y <= room.y + room.h) {
          anyEnemyInRoom = true;
        }
      });

      if (!anyEnemyInRoom && this.currentFloorNumber < 3) {
        SFX.door();
        this.loadFloor(this.currentFloorNumber + 1);
      }
    }
  }

  private handleBossDefeated(): void {
    SFX.victoryFanfare();
    const elapsedSec = Math.round((Date.now() - this.runStartTime) / 1000);

    // Calculate Rank S, A, B, C
    let rank = 'C';
    if (elapsedSec <= 90 && this.totalDamageTaken < 50) rank = 'S';
    else if (elapsedSec <= 150) rank = 'A';
    else if (elapsedSec <= 240) rank = 'B';

    // Beat 5 Story Dialogue
    EventBus.emitEvent('story:dialogue', {
      id: 5,
      speaker: 'Inti Kristal Emberdeep',
      text: 'Ikatan darah telah terjalin. Kuil ini sekarang adalah tempat perlindunganmu. Kau adalah DUNGEON LORD baru!',
      options: ['Klaim Kekuatan Dungeon']
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
