export const HERO_CLASSES = {
  warrior: {
    id: 'warrior',
    name: 'Black Knight',
    title: 'Ksatria Kegelapan Berzirah Obsidian',
    lore: 'Mantan panglima kerajaan yang mengikat sumpah darah dengan batu inti dungeon. Menggunakan pedang besar dua tangan dengan tebasan api kegelapan.',
    avatar: '🛡️',
    color: '#ef4444',
    secondaryColor: '#f97316',
    baseStats: {
      maxHp: 260,
      maxMp: 70,
      attack: 32,
      defense: 22,
      speed: 3.3,
      critChance: 0.15,
    },
    attackType: 'melee',
    attackRange: 65,
    attackArc: Math.PI * 0.75,
    skills: [
      {
        id: 'hellfire_cleave',
        name: 'Hellfire Cleave',
        desc: 'Menebas pedang besar bermuatan kobaran api hitam ke depan, melukai semua musuh dalam jangkauan.',
        icon: 'Flame',
        mpCost: 18,
        cooldown: 3.5,
        type: 'aoe_spin',
        radius: 85,
        damageMultiplier: 2.2
      },
      {
        id: 'bastion_torment',
        name: 'Bastion of Torment',
        desc: 'Tameng kutukan menyerap 70% damage musuh, memulihkan 80 HP, dan mempertebal pertahanan selama 5 detik.',
        icon: 'Shield',
        mpCost: 24,
        cooldown: 8.0,
        type: 'buff_defense',
        duration: 5.0
      },
      {
        id: 'whirlwind_doom',
        name: 'Whirlwind of Doom',
        desc: 'Ultimate: Berputar seperti badai kematian 360 derajat menghasilkan damage beruntun dan efek knockback.',
        icon: 'Zap',
        mpCost: 35,
        cooldown: 10.0,
        type: 'aoe_spin',
        radius: 120,
        damageMultiplier: 3.4
      }
    ]
  },
  mage: {
    id: 'mage',
    name: 'Astral Archmage',
    title: 'Penyihir Elemen Bintang & Es',
    lore: 'Sarjana sihir terlarang yang meneliti kristal mana dungeon. Melontarkan proyektil sihir bintang dan badai es pembeku dari jarak jauh.',
    avatar: '🔮',
    color: '#38bdf8',
    secondaryColor: '#a855f7',
    baseStats: {
      maxHp: 160,
      maxMp: 180,
      attack: 42,
      defense: 10,
      speed: 3.5,
      critChance: 0.22,
    },
    attackType: 'ranged',
    attackRange: 260,
    projectileSpeed: 8.2,
    skills: [
      {
        id: 'meteor_cataclysm',
        name: 'Meteor Cataclysm',
        desc: 'Menjatuhkan bola meteor raksasa yang meledak saat menghantam musuh menghasilkan ledakan api area.',
        icon: 'Sun',
        mpCost: 30,
        cooldown: 4.5,
        type: 'projectile_explode',
        radius: 90,
        damageMultiplier: 2.8
      },
      {
        id: 'frost_nova',
        name: 'Glacial Frost Nova',
        desc: 'Membekukan suhu ruangan seketika, menghentikan gerak semua monster selama 4 detik.',
        icon: 'Snowflake',
        mpCost: 28,
        cooldown: 7.0,
        type: 'aoe_freeze',
        radius: 125,
        damageMultiplier: 1.8
      },
      {
        id: 'celestial_healing_ray',
        name: 'Celestial Restoration',
        desc: 'Ultimate: Gelombang cahaya bintang memulihkan 120 HP untuk Hero dan Rekan Minion sekaligus meledakkan musuh.',
        icon: 'Sparkles',
        mpCost: 45,
        cooldown: 12.0,
        type: 'heal_party',
        healAmount: 120,
        damageMultiplier: 2.5
      }
    ]
  },
  rogue: {
    id: 'rogue',
    name: 'Shadow Assassin',
    title: 'Pembunuh Bayangan Belati Beracun',
    lore: 'Pemburu bayaran misterius yang mahir menyusup dalam kegelapan. Sangat mematikan dengan serangan bertubi-tubi berkecepatan tinggi.',
    avatar: '⚡',
    color: '#eab308',
    secondaryColor: '#22c55e',
    baseStats: {
      maxHp: 180,
      maxMp: 100,
      attack: 36,
      defense: 13,
      speed: 4.4,
      critChance: 0.38,
    },
    attackType: 'melee',
    attackRange: 55,
    attackArc: Math.PI * 0.65,
    skills: [
      {
        id: 'shadow_blitz',
        name: 'Shadow Flash Blitz',
        desc: 'Melesat menembus musuh seketika dalam sekejap mata dengan jaminan 100% Critical Hit.',
        icon: 'FastForward',
        mpCost: 20,
        cooldown: 3.5,
        type: 'dash_strike',
        dashDistance: 140,
        damageMultiplier: 2.6
      },
      {
        id: 'poison_storm',
        name: 'Poison Shuriken Storm',
        desc: 'Melemparkan 8 bilah belati beracun ke 8 penjuru mata angin yang meracuni musuh.',
        icon: 'Compass',
        mpCost: 26,
        cooldown: 6.0,
        type: 'multi_projectile',
        count: 8,
        damageMultiplier: 1.6
      },
      {
        id: 'phantom_frenzy',
        name: 'Phantom Blade Dance',
        desc: 'Ultimate: Memasuki mode bayangan membunuh, meningkatkan kecepatan serangan dan critical damage sebesar 250% selama 6 detik.',
        icon: 'Zap',
        mpCost: 38,
        cooldown: 11.0,
        type: 'buff_frenzy',
        duration: 6.0
      }
    ]
  }
};
