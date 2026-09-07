import Phaser from 'phaser';

export class ParticleSystem {
  private scene: Phaser.Scene;
  private emitter!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupEmitter();
  }

  private setupEmitter(): void {
    // Generate 2x2 white square texture for all particles (GDD §4)
    if (!this.scene.textures.exists('particle_square')) {
      const graphics = this.scene.add.graphics();
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(0, 0, 2, 2);
      graphics.generateTexture('particle_square', 2, 2);
      graphics.destroy();
    }

    this.emitter = this.scene.add.particles(0, 0, 'particle_square', {
      lifespan: 300,
      speed: { min: 20, max: 60 },
      scale: { start: 1.5, end: 0 },
      emitting: false
    });
    this.emitter.setDepth(999);
  }

  public emitHit(x: number, y: number, color: number = 0xffffff, count: number = 4): void {
    this.emitter.setParticleTint(color);
    this.emitter.explode(count, x, y);
  }

  public emitEmbers(x: number, y: number, count: number = 10): void {
    this.emitter.setParticleTint(0xff6600);
    this.emitter.explode(count, x, y);
  }

  public emitBlood(x: number, y: number, count: number = 6): void {
    this.emitter.setParticleTint(0xcc2222);
    this.emitter.explode(count, x, y);
  }
}
