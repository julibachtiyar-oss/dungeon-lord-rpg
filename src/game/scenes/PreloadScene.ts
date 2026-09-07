import Phaser from 'phaser';
import { SceneKey } from '../config/keys';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Preload);
  }

  preload(): void {
    // Progress bar UI with glowing gold bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const bar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      bar.clear();
      bar.fillStyle(0x334155, 1);
      bar.fillRoundedRect(width * 0.15, height * 0.5 - 6, width * 0.7, 12, 6);
      bar.fillStyle(0xfacc15, 1);
      bar.fillRoundedRect(width * 0.15 + 2, height * 0.5 - 4, (width * 0.7 - 4) * value, 8, 4);
    });

    // Generate vibrant, high-contrast, premium pixel art textures
    this.createProceduralTextures();
  }

  create(): void {
    this.scene.start(SceneKey.Title);
    this.scene.start(SceneKey.UIBridge);
  }

  private createProceduralTextures(): void {
    // 1. Soft Light Halo (for dynamic lighting around hero, torches, crystals)
    if (!this.textures.exists('light_halo')) {
      const canvas = this.textures.createCanvas('light_halo', 128, 128);
      if (canvas) {
        const ctx = canvas.getContext();
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(255, 210, 140, 0.6)');
        grad.addColorStop(0.3, 'rgba(255, 180, 80, 0.35)');
        grad.addColorStop(0.7, 'rgba(200, 100, 40, 0.12)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
        canvas.refresh();
      }
    }

    // 2. Crystal Light Halo (Purple)
    if (!this.textures.exists('crystal_halo')) {
      const canvas = this.textures.createCanvas('crystal_halo', 96, 96);
      if (canvas) {
        const ctx = canvas.getContext();
        const grad = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
        grad.addColorStop(0, 'rgba(216, 120, 255, 0.7)');
        grad.addColorStop(0.4, 'rgba(168, 85, 247, 0.35)');
        grad.addColorStop(0.8, 'rgba(120, 40, 200, 0.1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 96, 96);
        canvas.refresh();
      }
    }

    // 3. Bright Carved Floor Tile (16x16)
    if (!this.textures.exists('floor_tile')) {
      const g = this.add.graphics();
      // Base warm stone
      g.fillStyle(0x384252, 1);
      g.fillRect(0, 0, 16, 16);
      // Inner stone block
      g.fillStyle(0x475569, 1);
      g.fillRect(1, 1, 14, 14);
      // Top/Left highlight bevel
      g.fillStyle(0x64748b, 1);
      g.fillRect(1, 1, 14, 1);
      g.fillRect(1, 1, 1, 14);
      // Bottom/Right shadow bevel
      g.fillStyle(0x1e293b, 1);
      g.fillRect(1, 14, 14, 1);
      g.fillRect(14, 1, 1, 14);
      // Fine cobblestone detail
      g.fillStyle(0x526177, 1);
      g.fillRect(3, 3, 5, 5);
      g.fillRect(9, 8, 4, 4);
      g.generateTexture('floor_tile', 16, 16);
      g.destroy();
    }

    // 4. Runic Gold Floor Tile (16x16)
    if (!this.textures.exists('floor_rune')) {
      const g = this.add.graphics();
      g.fillStyle(0x384252, 1);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x475569, 1);
      g.fillRect(1, 1, 14, 14);
      // Gold glowing rune pattern
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(7, 3, 2, 10);
      g.fillRect(4, 5, 8, 2);
      g.fillRect(5, 9, 6, 2);
      g.fillStyle(0xfef08a, 1); // Center spark
      g.fillRect(7, 6, 2, 2);
      g.generateTexture('floor_rune', 16, 16);
      g.destroy();
    }

    // 5. 3D Castle Wall Tile (16x16)
    if (!this.textures.exists('wall_tile')) {
      const g = this.add.graphics();
      // Stone wall cap (top face)
      g.fillStyle(0x64748b, 1);
      g.fillRect(0, 0, 16, 6);
      g.fillStyle(0x94a3b8, 1); // Top edge highlight
      g.fillRect(0, 0, 16, 1);
      // Wall face (front brick)
      g.fillStyle(0x334155, 1);
      g.fillRect(0, 6, 16, 10);
      // Brick mortar lines
      g.fillStyle(0x1e293b, 1);
      g.fillRect(0, 6, 16, 1);
      g.fillRect(0, 11, 16, 1);
      g.fillRect(8, 6, 1, 5);
      g.fillRect(4, 11, 1, 5);
      g.fillRect(12, 11, 1, 5);
      // Drop shadow at foot of wall
      g.fillStyle(0x0f172a, 0.6);
      g.fillRect(0, 14, 16, 2);
      g.generateTexture('wall_tile', 16, 16);
      g.destroy();
    }

    // 6. Wall Torch (8x14)
    if (!this.textures.exists('torch')) {
      const g = this.add.graphics();
      // Iron bracket
      g.fillStyle(0x1e293b, 1);
      g.fillRect(2, 6, 4, 7);
      g.fillStyle(0x78350f, 1); // Wood post
      g.fillRect(3, 4, 2, 7);
      // Flame core
      g.fillStyle(0xef4444, 1);
      g.fillCircle(4, 4, 3);
      g.fillStyle(0xf97316, 1);
      g.fillCircle(4, 3, 2);
      g.fillStyle(0xfef08a, 1);
      g.fillRect(3, 1, 2, 2);
      g.generateTexture('torch', 8, 14);
      g.destroy();
    }

    // 7. Hero Knight (18x28) - Gleaming Silver & Crimson Cape
    if (!this.textures.exists('knight')) {
      const g = this.add.graphics();
      // Flowing red cape on back
      g.fillStyle(0xb91c1c, 1);
      g.fillRect(2, 10, 14, 14);
      g.fillStyle(0xef4444, 1);
      g.fillRect(3, 11, 12, 11);

      // Silver Plate Body
      g.fillStyle(0x94a3b8, 1);
      g.fillRect(4, 9, 10, 11);
      g.fillStyle(0xe2e8f0, 1); // Chestplate highlight
      g.fillRect(5, 10, 8, 9);
      // Golden filigree emblem
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(8, 12, 2, 5);
      g.fillRect(6, 13, 6, 2);

      // Silver Helmet & Winged Crest
      g.fillStyle(0x64748b, 1);
      g.fillRect(5, 2, 8, 8);
      g.fillStyle(0xcbd5e1, 1);
      g.fillRect(6, 2, 6, 7);
      // Glowing Blue Visor Slit
      g.fillStyle(0x38bdf8, 1);
      g.fillRect(6, 5, 6, 2);
      // Golden helm crown
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(5, 1, 8, 2);

      // Golden Shield on left arm
      g.fillStyle(0xb45309, 1);
      g.fillRect(1, 10, 4, 10);
      g.fillStyle(0xfbbf24, 1);
      g.fillRect(2, 11, 2, 8);

      // Armored Greaves & Boots
      g.fillStyle(0x334155, 1);
      g.fillRect(4, 20, 4, 6);
      g.fillRect(10, 20, 4, 6);
      g.fillStyle(0x94a3b8, 1);
      g.fillRect(4, 24, 4, 2);
      g.fillRect(10, 24, 4, 2);

      g.generateTexture('knight', 18, 28);
      g.destroy();
    }

    // 8. Broadsword (18x18)
    if (!this.textures.exists('weapon')) {
      const g = this.add.graphics();
      // Shining steel blade
      g.fillStyle(0xf1f5f9, 1);
      g.fillRect(8, 1, 2, 11);
      // Cyan magic rune groove
      g.fillStyle(0x38bdf8, 1);
      g.fillRect(8, 3, 2, 7);
      // Golden crossguard
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(4, 12, 10, 2);
      // Leather hilt & pommel
      g.fillStyle(0x78350f, 1);
      g.fillRect(8, 14, 2, 3);
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(7, 16, 4, 2);
      g.generateTexture('weapon', 18, 18);
      g.destroy();
    }

    // 9. Toxic Slime / Blob (18x18) - Vibrant Emerald Glow
    if (!this.textures.exists('swampy')) {
      const g = this.add.graphics();
      // Translucent slime aura
      g.fillStyle(0x15803d, 0.4);
      g.fillCircle(9, 10, 8);
      // Vivid toxic green jelly
      g.fillStyle(0x22c55e, 1);
      g.fillCircle(9, 10, 6);
      g.fillRect(3, 10, 12, 6);
      // Specular shine highlight
      g.fillStyle(0x86efac, 1);
      g.fillCircle(7, 7, 2);
      // Eyes
      g.fillStyle(0xffffff, 1);
      g.fillRect(6, 8, 2, 3);
      g.fillRect(10, 8, 2, 3);
      g.fillStyle(0x052e16, 1);
      g.fillRect(7, 9, 1, 2);
      g.fillRect(11, 9, 1, 2);
      g.generateTexture('swampy', 18, 18);
      g.destroy();
    }

    // 10. Goblin Rogue (18x18)
    if (!this.textures.exists('goblin')) {
      const g = this.add.graphics();
      // Goblin green skin
      g.fillStyle(0x16a34a, 1);
      g.fillRect(5, 3, 8, 7);
      // Pointed ears
      g.fillRect(2, 4, 3, 3);
      g.fillRect(13, 4, 3, 3);
      // Leather armor
      g.fillStyle(0x78350f, 1);
      g.fillRect(5, 10, 8, 6);
      // Fiery glowing eyes
      g.fillStyle(0xef4444, 1);
      g.fillRect(6, 6, 2, 2);
      g.fillRect(10, 6, 2, 2);
      // Bronze Dagger
      g.fillStyle(0xd97706, 1);
      g.fillRect(14, 8, 2, 7);
      g.fillStyle(0xfef08a, 1);
      g.fillRect(14, 7, 2, 2);
      g.generateTexture('goblin', 18, 18);
      g.destroy();
    }

    // 11. Skeleton Archer (18x22)
    if (!this.textures.exists('skelet')) {
      const g = this.add.graphics();
      // Bleached bone skull
      g.fillStyle(0xf8fafc, 1);
      g.fillRect(6, 2, 6, 6);
      // Glowing purple eyes
      g.fillStyle(0xa855f7, 1);
      g.fillRect(7, 4, 1, 2);
      g.fillRect(10, 4, 1, 2);
      // Ribcage
      g.fillStyle(0xe2e8f0, 1);
      g.fillRect(7, 8, 4, 6);
      g.fillStyle(0x475569, 1);
      g.fillRect(6, 9, 6, 1);
      g.fillRect(6, 11, 6, 1);
      // Wooden Longbow
      g.fillStyle(0x92400e, 1);
      g.fillRect(13, 4, 2, 14);
      g.fillStyle(0xe2e8f0, 1);
      g.fillRect(14, 5, 1, 12);
      g.generateTexture('skelet', 18, 22);
      g.destroy();
    }

    // 12. Ruin Warden Colossus Boss (36x42)
    if (!this.textures.exists('big_demon')) {
      const g = this.add.graphics();
      // Massive obsidian stone body
      g.fillStyle(0x1e293b, 1);
      g.fillRect(6, 10, 24, 26);
      g.fillStyle(0x334155, 1);
      g.fillRect(8, 12, 20, 22);

      // Glowing Molten Magma Veins
      g.fillStyle(0xf97316, 1);
      g.fillRect(10, 16, 16, 3);
      g.fillRect(12, 22, 12, 2);
      g.fillRect(14, 27, 8, 2);

      // Burning Crystal Core
      g.fillStyle(0xef4444, 1);
      g.fillCircle(18, 20, 5);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(18, 20, 2);

      // Stone Golem Head & Fiery Crown Horns
      g.fillStyle(0x475569, 1);
      g.fillRect(11, 4, 14, 9);
      // Flaming obsidian horns
      g.fillStyle(0xa855f7, 1);
      g.fillRect(7, 1, 4, 8);
      g.fillRect(25, 1, 4, 8);
      g.fillStyle(0xf43f5e, 1);
      g.fillRect(7, 1, 2, 4);
      g.fillRect(27, 1, 2, 4);

      // Blazing Yellow Visor Eyes
      g.fillStyle(0xfacc15, 1);
      g.fillRect(13, 8, 3, 2);
      g.fillRect(20, 8, 3, 2);

      g.generateTexture('big_demon', 36, 42);
      g.destroy();
    }

    // 13. Arrow (10x3)
    if (!this.textures.exists('arrow')) {
      const g = this.add.graphics();
      g.fillStyle(0x78350f, 1);
      g.fillRect(0, 1, 8, 1);
      g.fillStyle(0x94a3b8, 1);
      g.fillRect(7, 0, 3, 3);
      g.fillStyle(0xa855f7, 1); // Ethereal tip
      g.fillRect(9, 1, 1, 1);
      g.generateTexture('arrow', 10, 3);
      g.destroy();
    }

    // 14. Treasure Chest (18x18)
    if (!this.textures.exists('chest')) {
      const g = this.add.graphics();
      // Polished mahogany wood
      g.fillStyle(0x78350f, 1);
      g.fillRect(2, 4, 14, 12);
      // Gilded gold banding
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(2, 4, 14, 2);
      g.fillRect(2, 10, 14, 2);
      g.fillRect(2, 4, 2, 12);
      g.fillRect(14, 4, 2, 12);
      // Ruby gem lock
      g.fillStyle(0xef4444, 1);
      g.fillRect(8, 8, 2, 3);
      g.generateTexture('chest', 18, 18);
      g.destroy();
    }

    // 15. Radiant Purple Core Crystal (18x24)
    if (!this.textures.exists('core_crystal')) {
      const g = this.add.graphics();
      g.fillStyle(0xa855f7, 1);
      g.fillTriangle(9, 2, 3, 14, 15, 14);
      g.fillTriangle(9, 22, 3, 14, 15, 14);
      g.fillStyle(0xd8b4fe, 1); // Inner bright facet
      g.fillTriangle(9, 4, 6, 13, 12, 13);
      g.fillStyle(0xffffff, 1); // Specular star
      g.fillRect(8, 8, 2, 2);
      g.generateTexture('core_crystal', 18, 24);
      g.destroy();
    }
  }
}
