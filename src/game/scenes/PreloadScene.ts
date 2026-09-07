import Phaser from 'phaser';
import { SceneKey } from '../config/keys';

export class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SceneKey.Preload);
  }

  preload(): void {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const bar = this.add.graphics();

    this.load.on('progress', (value: number) => {
      bar.clear();
      bar.fillStyle(0x1e293b, 1);
      bar.fillRoundedRect(width * 0.15, height * 0.5 - 6, width * 0.7, 12, 6);
      bar.fillStyle(0xf59e0b, 1);
      bar.fillRoundedRect(width * 0.15 + 2, height * 0.5 - 4, (width * 0.7 - 4) * value, 8, 4);
    });

    this.createProceduralTextures();
  }

  create(): void {
    this.scene.start(SceneKey.Title);
    this.scene.start(SceneKey.UIBridge);
  }

  private createProceduralTextures(): void {
    // 1. Soft Light Halos
    if (!this.textures.exists('light_halo')) {
      const canvas = this.textures.createCanvas('light_halo', 128, 128);
      if (canvas) {
        const ctx = canvas.getContext();
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(255, 215, 140, 0.65)');
        grad.addColorStop(0.3, 'rgba(255, 180, 80, 0.35)');
        grad.addColorStop(0.7, 'rgba(200, 100, 30, 0.1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
        canvas.refresh();
      }
    }

    if (!this.textures.exists('crystal_halo')) {
      const canvas = this.textures.createCanvas('crystal_halo', 96, 96);
      if (canvas) {
        const ctx = canvas.getContext();
        const grad = ctx.createRadialGradient(48, 48, 0, 48, 48, 48);
        grad.addColorStop(0, 'rgba(216, 120, 255, 0.75)');
        grad.addColorStop(0.4, 'rgba(168, 85, 247, 0.35)');
        grad.addColorStop(0.8, 'rgba(120, 40, 200, 0.1)');
        grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 96, 96);
        canvas.refresh();
      }
    }

    // 2. High-Contrast Floor & Wall Tiles
    if (!this.textures.exists('floor_tile')) {
      const g = this.add.graphics();
      g.fillStyle(0x384252, 1);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x475569, 1);
      g.fillRect(1, 1, 14, 14);
      g.fillStyle(0x64748b, 1);
      g.fillRect(1, 1, 14, 1);
      g.fillRect(1, 1, 1, 14);
      g.fillStyle(0x1e293b, 1);
      g.fillRect(1, 14, 14, 1);
      g.fillRect(14, 1, 1, 14);
      g.generateTexture('floor_tile', 16, 16);
      g.destroy();
    }

    if (!this.textures.exists('floor_rune')) {
      const g = this.add.graphics();
      g.fillStyle(0x384252, 1);
      g.fillRect(0, 0, 16, 16);
      g.fillStyle(0x475569, 1);
      g.fillRect(1, 1, 14, 14);
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(7, 2, 2, 12);
      g.fillRect(3, 7, 10, 2);
      g.fillStyle(0xfef08a, 1);
      g.fillRect(7, 7, 2, 2);
      g.generateTexture('floor_rune', 16, 16);
      g.destroy();
    }

    if (!this.textures.exists('wall_tile')) {
      const g = this.add.graphics();
      g.fillStyle(0x64748b, 1);
      g.fillRect(0, 0, 16, 5);
      g.fillStyle(0x94a3b8, 1);
      g.fillRect(0, 0, 16, 1);
      g.fillStyle(0x334155, 1);
      g.fillRect(0, 5, 16, 11);
      g.fillStyle(0x1e293b, 1);
      g.fillRect(0, 5, 16, 1);
      g.fillRect(0, 10, 16, 1);
      g.fillRect(8, 5, 1, 5);
      g.fillRect(4, 10, 1, 6);
      g.fillRect(12, 10, 1, 6);
      g.generateTexture('wall_tile', 16, 16);
      g.destroy();
    }

    // 3. Torch & Light
    if (!this.textures.exists('torch')) {
      const g = this.add.graphics();
      g.fillStyle(0x1e293b, 1);
      g.fillRect(2, 6, 4, 7);
      g.fillStyle(0x78350f, 1);
      g.fillRect(3, 4, 2, 7);
      g.fillStyle(0xef4444, 1);
      g.fillCircle(4, 4, 3);
      g.fillStyle(0xf97316, 1);
      g.fillCircle(4, 3, 2);
      g.fillStyle(0xfef08a, 1);
      g.fillRect(3, 1, 2, 2);
      g.generateTexture('torch', 8, 14);
      g.destroy();
    }

    // 4. Downstairs Portal (Exit Gate)
    if (!this.textures.exists('stairs_portal')) {
      const g = this.add.graphics();
      g.fillStyle(0x0f172a, 1);
      g.fillCircle(12, 12, 11);
      g.fillStyle(0x0284c7, 1);
      g.fillCircle(12, 12, 9);
      g.fillStyle(0x38bdf8, 1);
      g.fillCircle(12, 12, 6);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(12, 12, 3);
      g.generateTexture('stairs_portal', 24, 24);
      g.destroy();
    }

    // 5. 2D HERO KNIGHT SPRITES (Authentic GDD §3 & ASSET SPEC)
    // Down (Front facing)
    if (!this.textures.exists('hero_idle_down')) {
      const g = this.add.graphics();
      this.drawHeroDown(g, 0, 0, 0);
      g.generateTexture('hero_idle_down', 24, 32);
      g.destroy();
    }
    if (!this.textures.exists('hero_walk_down_1')) {
      const g = this.add.graphics();
      this.drawHeroDown(g, -2, 1, 1);
      g.generateTexture('hero_walk_down_1', 24, 32);
      g.destroy();
    }
    if (!this.textures.exists('hero_walk_down_2')) {
      const g = this.add.graphics();
      this.drawHeroDown(g, 2, 1, -1);
      g.generateTexture('hero_walk_down_2', 24, 32);
      g.destroy();
    }

    // Up (Back facing)
    if (!this.textures.exists('hero_idle_up')) {
      const g = this.add.graphics();
      this.drawHeroUp(g, 0, 0, 0);
      g.generateTexture('hero_idle_up', 24, 32);
      g.destroy();
    }
    if (!this.textures.exists('hero_walk_up_1')) {
      const g = this.add.graphics();
      this.drawHeroUp(g, -2, 1, 1);
      g.generateTexture('hero_walk_up_1', 24, 32);
      g.destroy();
    }
    if (!this.textures.exists('hero_walk_up_2')) {
      const g = this.add.graphics();
      this.drawHeroUp(g, 2, 1, -1);
      g.generateTexture('hero_walk_up_2', 24, 32);
      g.destroy();
    }

    // Side (Profile facing)
    if (!this.textures.exists('hero_idle_side')) {
      const g = this.add.graphics();
      this.drawHeroSide(g, 0, 0, 0);
      g.generateTexture('hero_idle_side', 24, 32);
      g.destroy();
    }
    if (!this.textures.exists('hero_walk_side_1')) {
      const g = this.add.graphics();
      this.drawHeroSide(g, -2, 1, 1);
      g.generateTexture('hero_walk_side_1', 24, 32);
      g.destroy();
    }
    if (!this.textures.exists('hero_walk_side_2')) {
      const g = this.add.graphics();
      this.drawHeroSide(g, 2, 1, -1);
      g.generateTexture('hero_walk_side_2', 24, 32);
      g.destroy();
    }

    // Fallbacks for default idle and walk
    if (!this.textures.exists('hero_idle')) {
      const g = this.add.graphics();
      this.drawHeroDown(g, 0, 0, 0);
      g.generateTexture('hero_idle', 24, 32);
      g.destroy();
    }
    if (!this.textures.exists('hero_walk_1')) {
      const g = this.add.graphics();
      this.drawHeroDown(g, -2, 1, 1);
      g.generateTexture('hero_walk_1', 24, 32);
      g.destroy();
    }
    if (!this.textures.exists('hero_walk_2')) {
      const g = this.add.graphics();
      this.drawHeroDown(g, 2, 1, -1);
      g.generateTexture('hero_walk_2', 24, 32);
      g.destroy();
    }

    // Frame: Attack Combo 1 (Slash with bright cyan trail)
    if (!this.textures.exists('hero_atk_1')) {
      const g = this.add.graphics();
      this.drawHeroSide(g, 2, 0, 0);
      g.fillStyle(0x38bdf8, 0.9);
      g.fillCircle(19, 14, 7);
      g.fillStyle(0xffffff, 1);
      g.fillCircle(19, 14, 4);
      g.generateTexture('hero_atk_1', 28, 32);
      g.destroy();
    }

    // Frame: Attack Combo 2 (Horizontal Cleave with amber slash)
    if (!this.textures.exists('hero_atk_2')) {
      const g = this.add.graphics();
      this.drawHeroDown(g, 0, 0, 0);
      g.fillStyle(0xf59e0b, 0.9);
      g.fillRect(14, 12, 13, 5);
      g.fillStyle(0xfef08a, 1);
      g.fillRect(16, 13, 9, 3);
      g.generateTexture('hero_atk_2', 28, 32);
      g.destroy();
    }

    // Frame: Attack Combo 3 (Finisher Slam with radiant golden energy)
    if (!this.textures.exists('hero_atk_3')) {
      const g = this.add.graphics();
      this.drawHeroDown(g, 0, -2, 0);
      g.fillStyle(0xfacc15, 1);
      g.fillRect(10, 0, 4, 18);
      g.fillStyle(0xffffff, 1);
      g.fillRect(11, 1, 2, 16);
      g.generateTexture('hero_atk_3', 28, 32);
      g.destroy();
    }

    // Frame: Bulwark Guard (Radiant Aegis Shield)
    if (!this.textures.exists('hero_guard')) {
      const g = this.add.graphics();
      this.drawHeroDown(g, 0, 1, 0);
      g.fillStyle(0xf59e0b, 0.65);
      g.fillCircle(12, 16, 13);
      g.fillStyle(0xfef08a, 0.9);
      g.fillRect(3, 8, 18, 16);
      g.generateTexture('hero_guard', 28, 32);
      g.destroy();
    }

    // Frame: Ember Cleave (Whirling Fire Burst)
    if (!this.textures.exists('hero_cleave')) {
      const g = this.add.graphics();
      this.drawHeroDown(g, 0, 0, 0);
      g.fillStyle(0xef4444, 0.85);
      g.fillCircle(12, 16, 14);
      g.fillStyle(0xf97316, 0.9);
      g.fillCircle(12, 16, 10);
      g.fillStyle(0xfef08a, 1);
      g.fillCircle(12, 16, 5);
      g.generateTexture('hero_cleave', 28, 32);
      g.destroy();
    }

    // Frame: Hurt
    if (!this.textures.exists('hero_hurt')) {
      const g = this.add.graphics();
      this.drawHeroDown(g, 0, 0, 0);
      g.fillStyle(0xff0000, 0.4);
      g.fillRect(0, 0, 24, 32);
      g.generateTexture('hero_hurt', 24, 32);
      g.destroy();
    }

    // Fallback 'knight' texture mapping
    if (!this.textures.exists('knight')) {
      const g = this.add.graphics();
      this.drawHeroDown(g, 0, 0, 0);
      g.generateTexture('knight', 24, 32);
      g.destroy();
    }

    // 6. Broadsword Weapon
    if (!this.textures.exists('weapon')) {
      const g = this.add.graphics();
      g.fillStyle(0xf1f5f9, 1);
      g.fillRect(8, 0, 2, 12);
      g.fillStyle(0x38bdf8, 1);
      g.fillRect(8, 2, 2, 8);
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(4, 12, 10, 2);
      g.fillStyle(0x78350f, 1);
      g.fillRect(8, 14, 2, 3);
      g.generateTexture('weapon', 18, 18);
      g.destroy();
    }

    // 7. Monsters (Blob, Goblin, Skeleton, Boss)
    if (!this.textures.exists('swampy')) {
      const g = this.add.graphics();
      g.fillStyle(0x22c55e, 1);
      g.fillCircle(10, 10, 7);
      g.fillRect(3, 10, 14, 6);
      g.fillStyle(0x86efac, 1);
      g.fillCircle(8, 7, 2);
      g.fillStyle(0xffffff, 1);
      g.fillRect(6, 8, 3, 3);
      g.fillRect(11, 8, 3, 3);
      g.fillStyle(0x052e16, 1);
      g.fillRect(7, 9, 2, 2);
      g.fillRect(12, 9, 2, 2);
      g.generateTexture('swampy', 20, 20);
      g.destroy();
    }

    if (!this.textures.exists('goblin')) {
      const g = this.add.graphics();
      g.fillStyle(0x16a34a, 1);
      g.fillRect(5, 3, 8, 7);
      g.fillRect(2, 4, 3, 3);
      g.fillRect(13, 4, 3, 3);
      g.fillStyle(0x78350f, 1);
      g.fillRect(5, 10, 8, 6);
      g.fillStyle(0xef4444, 1);
      g.fillRect(6, 5, 2, 2);
      g.fillRect(10, 5, 2, 2);
      g.fillStyle(0xd97706, 1);
      g.fillRect(14, 8, 2, 7);
      g.generateTexture('goblin', 18, 18);
      g.destroy();
    }

    if (!this.textures.exists('skelet')) {
      const g = this.add.graphics();
      g.fillStyle(0xf8fafc, 1);
      g.fillRect(6, 2, 6, 6);
      g.fillStyle(0xa855f7, 1);
      g.fillRect(7, 4, 1, 2);
      g.fillRect(10, 4, 1, 2);
      g.fillStyle(0xe2e8f0, 1);
      g.fillRect(7, 8, 4, 6);
      g.fillStyle(0x92400e, 1);
      g.fillRect(13, 4, 2, 14);
      g.generateTexture('skelet', 18, 22);
      g.destroy();
    }

    if (!this.textures.exists('big_demon')) {
      const g = this.add.graphics();
      g.fillStyle(0x1e293b, 1);
      g.fillRect(6, 10, 24, 26);
      g.fillStyle(0x334155, 1);
      g.fillRect(8, 12, 20, 22);
      g.fillStyle(0xf97316, 1);
      g.fillRect(10, 16, 16, 3);
      g.fillRect(12, 22, 12, 2);
      g.fillStyle(0xef4444, 1);
      g.fillCircle(18, 20, 5);
      g.fillStyle(0x475569, 1);
      g.fillRect(11, 4, 14, 9);
      g.fillStyle(0xa855f7, 1);
      g.fillRect(7, 1, 4, 8);
      g.fillRect(25, 1, 4, 8);
      g.fillStyle(0xfacc15, 1);
      g.fillRect(13, 8, 3, 2);
      g.fillRect(20, 8, 3, 2);
      g.generateTexture('big_demon', 36, 42);
      g.destroy();
    }

    if (!this.textures.exists('arrow')) {
      const g = this.add.graphics();
      g.fillStyle(0x78350f, 1);
      g.fillRect(0, 1, 8, 1);
      g.fillStyle(0x94a3b8, 1);
      g.fillRect(7, 0, 3, 3);
      g.generateTexture('arrow', 10, 3);
      g.destroy();
    }

    if (!this.textures.exists('chest')) {
      const g = this.add.graphics();
      g.fillStyle(0x78350f, 1);
      g.fillRect(2, 4, 14, 12);
      g.fillStyle(0xf59e0b, 1);
      g.fillRect(2, 4, 14, 2);
      g.fillRect(2, 10, 14, 2);
      g.fillRect(8, 8, 2, 3);
      g.generateTexture('chest', 18, 18);
      g.destroy();
    }

    if (!this.textures.exists('core_crystal')) {
      const g = this.add.graphics();
      g.fillStyle(0xa855f7, 1);
      g.fillTriangle(9, 2, 3, 14, 15, 14);
      g.fillTriangle(9, 22, 3, 14, 15, 14);
      g.fillStyle(0xd8b4fe, 1);
      g.fillTriangle(9, 4, 6, 13, 12, 13);
      g.generateTexture('core_crystal', 18, 24);
      g.destroy();
    }
  }

  private drawHeroDown(g: Phaser.GameObjects.Graphics, legOff: number, bodyOffY: number, capeWave: number): void {
    const ox = 2;
    const oy = 2 + bodyOffY;

    // Scarlet flowing cape behind shoulders
    g.fillStyle(0x991b1b, 1);
    g.fillRect(ox + 3 + capeWave, oy + 9, 14, 15);
    g.fillStyle(0xb91c1c, 1);
    g.fillRect(ox + 4 + capeWave, oy + 10, 12, 14);

    // Dark Steel plate armor body
    g.fillStyle(0x334155, 1);
    g.fillRect(ox + 5, oy + 9, 10, 11);
    g.fillStyle(0x64748b, 1);
    g.fillRect(ox + 6, oy + 10, 8, 9);

    // Golden lion crest emblem & golden pauldrons
    g.fillStyle(0xd97706, 1);
    g.fillRect(ox + 3, oy + 9, 3, 4);
    g.fillRect(ox + 14, oy + 9, 3, 4);
    g.fillStyle(0xf59e0b, 1);
    g.fillRect(ox + 9, oy + 11, 2, 6);
    g.fillRect(ox + 7, oy + 13, 6, 2);

    // Winged Knight Helmet
    g.fillStyle(0x334155, 1);
    g.fillRect(ox + 6, oy + 2, 8, 8);
    g.fillStyle(0x64748b, 1);
    g.fillRect(ox + 7, oy + 3, 6, 6);
    // Glowing Cyan Visor Slit
    g.fillStyle(0x38bdf8, 1);
    g.fillRect(ox + 7, oy + 5, 6, 2);
    g.fillStyle(0xffffff, 1);
    g.fillRect(ox + 9, oy + 5, 2, 1);
    // Gold Helm Wings
    g.fillStyle(0xf59e0b, 1);
    g.fillRect(ox + 5, oy + 1, 10, 2);
    g.fillRect(ox + 9, oy + 0, 2, 3);

    // Golden Shield on Left Arm
    g.fillStyle(0xb45309, 1);
    g.fillRect(ox + 1, oy + 10, 4, 10);
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(ox + 2, oy + 11, 2, 8);

    // Armored Legs & Greaves
    g.fillStyle(0x1e293b, 1);
    g.fillRect(ox + 5 + legOff, oy + 20, 4, 6);
    g.fillRect(ox + 11 - legOff, oy + 20, 4, 6);
    g.fillStyle(0x64748b, 1);
    g.fillRect(ox + 5 + legOff, oy + 24, 4, 2);
    g.fillRect(ox + 11 - legOff, oy + 24, 4, 2);
  }

  private drawHeroUp(g: Phaser.GameObjects.Graphics, legOff: number, bodyOffY: number, capeWave: number): void {
    const ox = 2;
    const oy = 2 + bodyOffY;

    // Full Scarlet Flowing Cape
    g.fillStyle(0x7f1d1d, 1);
    g.fillRect(ox + 3 + capeWave, oy + 8, 14, 16);
    g.fillStyle(0x991b1b, 1);
    g.fillRect(ox + 4 + capeWave, oy + 9, 12, 15);
    g.fillStyle(0xb91c1c, 1);
    g.fillRect(ox + 6 + capeWave, oy + 10, 8, 13);

    // Helm Back
    g.fillStyle(0x334155, 1);
    g.fillRect(ox + 6, oy + 2, 8, 7);
    g.fillStyle(0x475569, 1);
    g.fillRect(ox + 7, oy + 3, 6, 5);
    // Gold Wings Back
    g.fillStyle(0xf59e0b, 1);
    g.fillRect(ox + 5, oy + 1, 10, 2);
    g.fillRect(ox + 9, oy + 0, 2, 3);

    // Gold Pauldrons Edges
    g.fillStyle(0xd97706, 1);
    g.fillRect(ox + 3, oy + 8, 3, 4);
    g.fillRect(ox + 14, oy + 8, 3, 4);

    // Armored Legs
    g.fillStyle(0x1e293b, 1);
    g.fillRect(ox + 5 + legOff, oy + 22, 4, 4);
    g.fillRect(ox + 11 - legOff, oy + 22, 4, 4);
  }

  private drawHeroSide(g: Phaser.GameObjects.Graphics, legOff: number, bodyOffY: number, capeWave: number): void {
    const ox = 2;
    const oy = 2 + bodyOffY;

    // Flowing Cape Behind
    g.fillStyle(0x991b1b, 1);
    g.fillRect(ox + 1 + capeWave, oy + 9, 7, 15);
    g.fillStyle(0xb91c1c, 1);
    g.fillRect(ox + 2 + capeWave, oy + 10, 5, 13);

    // Steel Plate Armor Profile
    g.fillStyle(0x334155, 1);
    g.fillRect(ox + 6, oy + 9, 9, 11);
    g.fillStyle(0x64748b, 1);
    g.fillRect(ox + 7, oy + 10, 7, 9);
    g.fillStyle(0xd97706, 1);
    g.fillRect(ox + 8, oy + 9, 4, 3);

    // Winged Helm Profile
    g.fillStyle(0x334155, 1);
    g.fillRect(ox + 6, oy + 2, 9, 7);
    g.fillStyle(0x64748b, 1);
    g.fillRect(ox + 8, oy + 3, 6, 6);
    g.fillStyle(0x38bdf8, 1);
    g.fillRect(ox + 12, oy + 4, 3, 2);
    g.fillStyle(0xf59e0b, 1);
    g.fillRect(ox + 7, oy + 1, 6, 2);

    // Raised Broadsword
    g.fillStyle(0xe2e8f0, 1);
    g.fillRect(ox + 15, oy + 4, 2, 10);
    g.fillStyle(0xf59e0b, 1);
    g.fillRect(ox + 13, oy + 12, 5, 2);

    // Golden Shield on Shoulder
    g.fillStyle(0xb45309, 1);
    g.fillRect(ox + 5, oy + 10, 4, 9);
    g.fillStyle(0xfbbf24, 1);
    g.fillRect(ox + 6, oy + 11, 2, 7);

    // Walking Legs
    g.fillStyle(0x1e293b, 1);
    g.fillRect(ox + 6 + legOff, oy + 20, 4, 6);
    g.fillRect(ox + 10 - legOff, oy + 20, 4, 6);
    g.fillStyle(0x64748b, 1);
    g.fillRect(ox + 6 + legOff, oy + 24, 4, 2);
    g.fillRect(ox + 10 - legOff, oy + 24, 4, 2);
  }
}
