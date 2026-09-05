export const HERO_CLASSES = {
  warrior: {
    id: 'warrior',
    name: 'Dragon Knight',
    title: 'Penjaga Perisai & Pedang Besar',
    description: 'Petarung jarak dekat dengan pertahanan sangat tinggi dan tebasan area mematikan.',
    icon: 'Shield',
    color: '#ef4444',
    secondaryColor: '#f97316',
    baseStats: {
      maxHp: 220,
      maxMp: 60,
      attack: 28,
      defense: 18,
      speed: 3.2,
      critChance: 0.12,
    },
    attackType: 'melee',
    attackRange: 60,
    attackArc: Math.PI * 0.75, // cone slash
    skills: [
      {
        id: 'whirlwind',
        name: 'Whirlwind Slash',
        desc: 'Memutar pedang 360 derajat menghasilkan damage ganda ke semua musuh sekitar.',
        icon: 'Flame',
        mpCost: 20,
        cooldown: 4, // seconds
        type: 'aoe_spin',
        radius: 90,
        damageMultiplier: 2.2
      },
      {
        id: 'iron_wall',
        name: 'Iron Bastion',
        desc: 'Mengaktifkan perisai naga, mengurangi damage masuk 70% dan menyembuhkan HP selama 4 detik.',
        icon: 'ShieldAlert',
        mpCost: 25,
        cooldown: 9,
        type: 'buff_defense',
        duration: 4
      }
    ]
  },
  mage: {
    id: 'mage',
    name: 'Astral Archmage',
    title: 'Penguasa Mantra Api & Es',
    description: 'Ahli sihir jarak jauh dengan proyektil berkecepatan tinggi dan mantra ledakan area.',
    icon: 'Wand2',
    color: '#38bdf8',
    secondaryColor: '#a855f7',
    baseStats: {
      maxHp: 140,
      maxMp: 150,
      attack: 38,
      defense: 7,
      speed: 3.4,
      critChance: 0.20,
    },
    attackType: 'ranged',
    attackRange: 240,
    projectileSpeed: 7.5,
    skills: [
      {
        id: 'fireball_storm',
        name: 'Meteor Fireball',
        desc: 'Meluncurkan bola api raksasa yang meledak saat benturan membakar area sekitar.',
        icon: 'Sun',
        mpCost: 35,
        cooldown: 5,
        type: 'projectile_explode',
        radius: 80,
        damageMultiplier: 2.8
      },
      {
        id: 'frost_nova',
        name: 'Frost Nova',
        desc: 'Membekukan dan melambatkan semua monster sekitar serta memberikan damage es instan.',
        icon: 'Snowflake',
        mpCost: 30,
        cooldown: 7,
        type: 'aoe_freeze',
        radius: 110,
        damageMultiplier: 1.8
      }
    ]
  },
  rogue: {
    id: 'rogue',
    name: 'Shadow Assassin',
    title: 'Pembunuh Bayangan Belati Kembar',
    description: 'Sangat lincah, menyerang cepat dengan kemungkinan critical hit yang mematikan.',
    icon: 'Zap',
    color: '#eab308',
    secondaryColor: '#22c55e',
    baseStats: {
      maxHp: 160,
      maxMp: 90,
      attack: 32,
      defense: 10,
      speed: 4.2,
      critChance: 0.35,
    },
    attackType: 'melee',
    attackRange: 50,
    attackArc: Math.PI * 0.6,
    skills: [
      {
        id: 'shadow_strike',
        name: 'Shadow Blitz',
        desc: 'Melesat maju seketika menembus musuh dengan serangan critical 100%.',
        icon: 'FastForward',
        mpCost: 22,
        cooldown: 4,
        type: 'dash_strike',
        dashDistance: 130,
        damageMultiplier: 2.4
      },
      {
        id: 'blade_vortex',
        name: 'Poison Blades',
        desc: 'Melemparkan 8 belati beracun ke segala arah dengan efek racun per detik.',
        icon: 'Compass',
        mpCost: 28,
        cooldown: 6,
        type: 'multi_projectile',
        count: 8,
        damageMultiplier: 1.5
      }
    ]
  }
};
