import Phaser from 'phaser';
import { SceneKey } from '../config/keys';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Preload);
  }

  preload(): void {
    // Progress bar UI
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const bar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      bar.clear();
      bar.fillStyle(0xeab308, 1);
      bar.fillRect(width * 0.2, height * 0.5 - 4, width * 0.6 * value, 8);
    });

    // Generate high-quality pixel art procedural textures directly
    this.createProceduralTextures();
  }

  create(): void {
    this.scene.start(SceneKey.Title);
    this.scene.start(SceneKey.UIBridge);
  }

  private createProceduralTextures(): void {
    // 1. Hero Knight (16x28)
    if (!this.textures.exists('knight')) {
      const g = this.add.graphics();
      // Body & Armor
      g.fillStyle(0x334155, 1); // Dark steel
      g.fillRect(3, 8, 10, 14);
      // Helmet & Visor
      g.fillStyle(0x475569, 1);
      g.fillRect(4, 2, 8, 8);
      g.fillStyle(0xeab308, 1); // Gold visor slit
      g.fillRect(5, 5, 6, 2);
      // Shield
      g.fillStyle(0xb45309, 1);
      g.fillRect(1, 10, 4, 10);
      // Legs / Feet
      g.fillStyle(0x1e293b, 1);
      g.fillRect(4, 22, 3, 5);
      g.fillRect(9, 22, 3, 5);
      g.generateTexture('knight', 16, 28);
      g.destroy();
    }

    // 2. Weapon (Sword 16x16)
    if (!this.textures.exists('weapon')) {
      const g = this.add.graphics();
      g.fillStyle(0x94a3b8, 1); // Steel blade
      g.fillRect(7, 1, 2, 10);
      g.fillStyle(0xeab308, 1); // Gold hilt
      g.fillRect(4, 11, 8, 2);
      g.fillStyle(0x78350f, 1); // Leather handle
      g.fillRect(7, 13, 2, 3);
      g.generateTexture('weapon', 16, 16);
      g.destroy();
    }

    // 3. Blob (16x16)
    if (!this.textures.exists('swampy')) {
      const g = this.add.graphics();
      g.fillStyle(0x22c55e, 1); // Toxic green jelly
      g.fillCircle(8, 9, 6);
      g.fillRect(2, 9, 12, 6);
      g.fillStyle(0xffffff, 1); // Eyes
      g.fillRect(5, 7, 2, 2);
      g.fillRect(9, 7, 2, 2);
      g.fillStyle(0x000000, 1);
      g.fillRect(6, 7, 1, 2);
      g.fillRect(10, 7, 1, 2);
      g.generateTexture('swampy', 16, 16);
      g.destroy();
    }

    // 4. Goblin (16x16)
    if (!this.textures.exists('goblin')) {
      const g = this.add.graphics();
      g.fillStyle(0x15803d, 1); // Green goblin skin
      g.fillRect(4, 3, 8, 7);
      g.fillStyle(0x78350f, 1); // Leather tunic
      g.fillRect(4, 10, 8, 5);
      g.fillStyle(0xef4444, 1); // Red glowing eyes
      g.fillRect(5, 5, 2, 2);
      g.fillRect(9, 5, 2, 2);
      g.fillStyle(0x94a3b8, 1); // Small dagger
      g.fillRect(12, 8, 2, 6);
      g.generateTexture('goblin', 16, 16);
      g.destroy();
    }

    // 5. Skeleton Archer (16x20)
    if (!this.textures.exists('skelet')) {
      const g = this.add.graphics();
      g.fillStyle(0xe2e8f0, 1); // White bones skull
      g.fillRect(5, 2, 6, 6);
      g.fillStyle(0x000000, 1); // Eye sockets
      g.fillRect(6, 4, 1, 2);
      g.fillRect(9, 4, 1, 2);
      g.fillStyle(0xcbd5e1, 1); // Ribs
      g.fillRect(6, 9, 4, 5);
      g.fillStyle(0x854d0e, 1); // Wooden bow
      g.fillRect(12, 4, 2, 12);
      g.generateTexture('skelet', 16, 20);
      g.destroy();
    }

    // 6. Ruin Warden Boss (32x36)
    if (!this.textures.exists('big_demon')) {
      const g = this.add.graphics();
      // Ancient stone body
      g.fillStyle(0x334155, 1);
      g.fillRect(6, 10, 20, 22);
      // Red rune core in chest
      g.fillStyle(0xef4444, 1);
      g.fillCircle(16, 18, 4);
      // Head & Horns
      g.fillStyle(0x475569, 1);
      g.fillRect(10, 4, 12, 10);
      g.fillStyle(0xa855f7, 1); // Glowing purple horns
      g.fillRect(6, 1, 4, 6);
      g.fillRect(22, 1, 4, 6);
      // Glowing eyes
      g.fillStyle(0xfacc15, 1);
      g.fillRect(12, 8, 2, 2);
      g.fillRect(18, 8, 2, 2);
      g.generateTexture('big_demon', 32, 36);
      g.destroy();
    }

    // 7. Arrow (8x2)
    if (!this.textures.exists('arrow')) {
      const g = this.add.graphics();
      g.fillStyle(0x78350f, 1);
      g.fillRect(0, 0, 6, 2);
      g.fillStyle(0x94a3b8, 1);
      g.fillRect(6, 0, 2, 2);
      g.generateTexture('arrow', 8, 2);
      g.destroy();
    }

    // 8. Chest (16x16)
    if (!this.textures.exists('chest')) {
      const g = this.add.graphics();
      g.fillStyle(0x78350f, 1);
      g.fillRect(2, 4, 12, 10);
      g.fillStyle(0xeab308, 1); // Gold rim
      g.fillRect(2, 4, 12, 2);
      g.fillRect(7, 7, 2, 3);
      g.generateTexture('chest', 16, 16);
      g.destroy();
    }

    // 9. Floor Tile (16x16)
    if (!this.textures.exists('floor_tile')) {
      const g = this.add.graphics();
      g.fillStyle(0x1e1b2e, 1);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x27243d, 1);
      g.fillRect(1, 1, 14, 14);
      g.fillStyle(0x322d4f, 1);
      g.fillRect(2, 2, 6, 6);
      g.generateTexture('floor_tile', 16, 16);
      g.destroy();
    }

    // 10. Wall Tile (16x16)
    if (!this.textures.exists('wall_tile')) {
      const g = this.add.graphics();
      g.fillStyle(0x0f0e17, 1);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x171524, 1);
      g.fillRect(1, 1, 14, 7);
      g.fillRect(1, 9, 14, 6);
      g.fillStyle(0x2e2a44, 1);
      g.fillRect(2, 2, 12, 2);
      g.generateTexture('wall_tile', 16, 16);
      g.destroy();
    }
  }
}
