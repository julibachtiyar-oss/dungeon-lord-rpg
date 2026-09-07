// Centralized Balance Config for EMBERDEEP
// All numbers referenced from GDD sections (AGENTS.md Rule 4)

export const BALANCE = {
  // GDD §3.1 Hero Knight
  player: {
    maxHp: 100,
    hpPerLevel: 12,
    moveSpeed: 72,           // 4.5 tile/s
    colliderWidth: 10,
    colliderHeight: 8,
    baseDamage: 10,
    damagePerLevel: 2,
    damagePerWeaponTier: 5,
    invulnerableDuration: 600,
    potionsPerRun: 3,
    potionHeal: 40,
    autoAimRadius: 40,
    autoAimArcDeg: 60,

    // GDD §3.4 3-Hit Combo
    combo: [
      { hit: 1, startup: 80, active: 100, recovery: 180, damageMultiplier: 1.0, hitboxW: 22, hitboxH: 18, knockback: 20 },
      { hit: 2, startup: 80, active: 100, recovery: 180, damageMultiplier: 1.0, hitboxW: 22, hitboxH: 18, knockback: 20 },
      { hit: 3, startup: 120, active: 140, recovery: 320, damageMultiplier: 1.6, hitboxW: 30, hitboxH: 24, knockback: 48 }
    ],
    comboBufferWindow: 200,

    // GDD §3.5 Skill 1: Ember Cleave
    cleave: {
      cooldown: 5000,
      startup: 200,
      active: 160,
      recovery: 300,
      damageMultiplier: 2.5,
      radius: 44,
      arcDeg: 90,
      knockback: 64,
      burnDamage: 3,
      burnInterval: 500,
      burnDuration: 2000,
      shakeIntensity: 4,
      shakeDuration: 120,
      hitPause: 90
    },

    // GDD §3.6 Skill 2: Bulwark
    bulwark: {
      cooldown: 8000,
      duration: 1200,
      damageReduction: 0.70,
      moveSpeedMultiplier: 0.50,
      parryWindow: 200,
      parryStunDuration: 800,
      parryCooldownReduction: 0.50
    },

    // GDD §3.7 Dash
    dash: {
      cooldown: 1200,
      distance: 48,
      duration: 180,
      iFrames: 180
    },

    // GDD §3.8 Level XP table
    levelXp: [0, 40, 110, 220, 380],
    levelHealBonus: 30
  },

  // GDD §4 Enemies
  enemies: {
    // 4.1 Blob
    blob: {
      hp: 20,
      xp: 8,
      goldMin: 2,
      goldMax: 4,
      alertRadius: 64,
      contactDamage: 8,
      knockbackToPlayer: 16,
      jumpInterval: 1100,
      jumpWindup: 300,
      jumpDuration: 250,
      jumpDistance: 28
    },

    // 4.2 Goblin
    goblin: {
      hp: 35,
      xp: 15,
      goldMin: 4,
      goldMax: 7,
      moveSpeed: 58,
      alertRadius: 96,
      lungeTriggerDistance: 30,
      windupDuration: 400,
      lungeDuration: 150,
      lungeDistance: 48,
      lungeDamage: 12,
      recoveryDuration: 500,
      hitboxSize: 14
    },

    // 4.3 Skeleton Archer
    skeleton: {
      hp: 30,
      xp: 18,
      goldMin: 5,
      goldMax: 8,
      moveSpeed: 44,
      alertRadius: 128,
      keepDistanceMin: 80,
      keepDistanceMax: 120,
      closeFleeDistance: 32,
      attackCooldown: 2000,
      windupDuration: 500,
      arrowSpeed: 130,
      arrowDamage: 10,
      arrowLifetime: 1600
    },

    // 4.4 Boss: Ruin Warden
    boss: {
      hp: 420,
      xp: 100,
      speedP1: 36,
      speedP2: 48,
      speedP3: 56,
      parryStunDuration: 800,
      slamWindup: 700,
      slamDamage: 20,
      slamRadius: 36,
      slamCooldownP1: 2500,
      slamCooldownP2: 1800,
      slamShakeIntensity: 6,
      slamShakeDuration: 200,
      chargeWindup: 600,
      chargeSpeed: 140,
      chargeDamage: 18,
      chargeCooldown: 4000,
      chargeWallStun: 900,
      shockwaveWindup: 900,
      shockwaveDamage: 15,
      shockwaveMaxRadius: 80,
      shockwaveDuration: 400,
      shockwaveCooldown: 5000,
      phaseTransitionDuration: 1000
    }
  },

  // GDD §8 Feel Manager Specifications
  feel: {
    hit12: { hitPause: 40, shake: 1.5, shakeDuration: 60, flash: 80 },
    hit3:  { hitPause: 70, shake: 3.0, shakeDuration: 100 },
    cleave: { hitPause: 90, shake: 4.0, shakeDuration: 120 },
    playerHurt: { hitPause: 60, shake: 3.0, shakeDuration: 120, vignette: 200, vibrate: 30 },
    parry: { hitPause: 120, shake: 3.0, shakeDuration: 100, slowMoScale: 0.3, slowMoDuration: 200 },
    bossSlam: { shake: 6.0, shakeDuration: 200 }
  }
};
