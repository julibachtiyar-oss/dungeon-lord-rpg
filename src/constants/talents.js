// Inotia 4-Style 3-Branch Talent Trees & Passive Perks

export const CLASS_TALENT_TREES = {
  warrior: {
    className: 'Black Knight',
    branches: [
      {
        id: 'blood_berserker',
        name: 'Blood Berserker',
        color: '#dc2626',
        icon: 'Flame',
        talents: [
          {
            id: 'warrior_vampiric',
            name: 'Vampiric Drain',
            desc: 'Memulihkan 4% HP maksimum setiap kali serangan Critical mendarat.',
            maxRank: 3,
            statBonus: (rank) => ({ lifeSteal: rank * 0.04 })
          },
          {
            id: 'warrior_frenzy',
            name: 'Blood Frenzy',
            desc: 'Meningkatkan attack speed dan move speed sebesar +10% per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ speedBonus: rank * 0.10 })
          },
          {
            id: 'warrior_executioner',
            name: 'Executioner',
            desc: 'Memberikan +25% bonus damage pada musuh dengan HP di bawah 40%.',
            maxRank: 3,
            statBonus: (rank) => ({ executeBonus: rank * 0.25 })
          }
        ]
      },
      {
        id: 'iron_bulwark',
        name: 'Iron Bulwark',
        color: '#f97316',
        icon: 'Shield',
        talents: [
          {
            id: 'warrior_stone_skin',
            name: 'Stone Skin',
            desc: 'Meningkatkan Defense dasar sebesar +15 per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ defense: rank * 15 })
          },
          {
            id: 'warrior_thorns',
            name: 'Thorns of Torment',
            desc: 'Memantulkan 20% damage fisik yang diterima kembali ke penyerang.',
            maxRank: 3,
            statBonus: (rank) => ({ thorns: rank * 0.20 })
          },
          {
            id: 'warrior_titan_heart',
            name: 'Titan Heart',
            desc: 'Meningkatkan Max HP dasar sebesar +120 per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ maxHp: rank * 120 })
          }
        ]
      },
      {
        id: 'abyssal_warlock',
        name: 'Abyssal Warlock',
        color: '#9333ea',
        icon: 'Zap',
        talents: [
          {
            id: 'warrior_hellfire',
            name: 'Hellfire Burst',
            desc: 'Meningkatkan radius dan damage tebasan api sebesar +18% per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ attack: rank * 14 })
          },
          {
            id: 'warrior_dark_haste',
            name: 'Dark Haste',
            desc: 'Mengurangi cooldown semua skill aktif sebesar 8% per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ cooldownReduction: rank * 0.08 })
          },
          {
            id: 'warrior_nether_leech',
            name: 'Nether Leech',
            desc: 'Memulihkan 15 Mana instan setiap kali membunuh monster musuh.',
            maxRank: 3,
            statBonus: (rank) => ({ mpOnKill: rank * 15 })
          }
        ]
      }
    ]
  },
  mage: {
    className: 'Astral Archmage',
    branches: [
      {
        id: 'cataclysm',
        name: 'Cataclysm Pyromancy',
        color: '#f97316',
        icon: 'Flame',
        talents: [
          {
            id: 'mage_meteor_force',
            name: 'Meteor Impact',
            desc: 'Meningkatkan damage meteor sebesar +25% per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ attack: rank * 18 })
          },
          {
            id: 'mage_pyroblast',
            name: 'Scorching Ground',
            desc: 'Meningkatkan Crit Chance sihir sebesar +6% per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ critChance: rank * 0.06 })
          },
          {
            id: 'mage_supernova',
            name: 'Supernova Burst',
            desc: 'Meningkatkan radius ledakan semua sihir sebesar +25% per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ aoeRadius: rank * 0.25 })
          }
        ]
      },
      {
        id: 'cryomancy',
        name: 'Glacial Cryomancy',
        color: '#06b6d4',
        icon: 'Zap',
        talents: [
          {
            id: 'mage_frost_armor',
            name: 'Glacial Barrier',
            desc: 'Menyerap 15% damage dan memperlambat musuh yang mendekat.',
            maxRank: 3,
            statBonus: (rank) => ({ defense: rank * 12 })
          },
          {
            id: 'mage_frostbite',
            name: 'Deep Freeze',
            desc: 'Menambah durasi pembekuan es sebesar +1.5 detik per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ freezeBonus: rank * 1.5 })
          },
          {
            id: 'mage_shatter',
            name: 'Ice Shatter',
            desc: 'Meningkatkan damage Critical sebesar +35% per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ critMultiplier: rank * 0.35 })
          }
        ]
      },
      {
        id: 'celestial_flow',
        name: 'Celestial Restoration',
        color: '#a855f7',
        icon: 'Sparkles',
        talents: [
          {
            id: 'mage_mana_surge',
            name: 'Arcane Surge',
            desc: 'Meningkatkan regenerasi Mana pasif sebesar +8 MP/detik per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ mpRegen: rank * 8 })
          },
          {
            id: 'mage_sanctuary_aura',
            name: 'Archmage Blessing',
            desc: 'Meningkatkan efektivitas pemulihan HP Party sebesar +30% per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ healBonus: rank * 0.30 })
          },
          {
            id: 'mage_astral_ascension',
            name: 'Astral Flow',
            desc: 'Meningkatkan Max MP sebesar +150 per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ maxMp: rank * 150 })
          }
        ]
      }
    ]
  },
  assassin: {
    className: 'Shadow Assassin',
    branches: [
      {
        id: 'shadow_striker',
        name: 'Shadow Striker',
        color: '#eab308',
        icon: 'Zap',
        talents: [
          {
            id: 'assassin_fatal_crit',
            name: 'Fatal Precision',
            desc: 'Meningkatkan Crit Chance sebesar +8% per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ critChance: rank * 0.08 })
          },
          {
            id: 'assassin_shadow_dance',
            name: 'Phantom Step',
            desc: 'Mengurangi cooldown Dash sebesar 15% per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ dashCooldownReduction: rank * 0.15 })
          },
          {
            id: 'assassin_execution_blade',
            name: 'Backstab Mastery',
            desc: 'Meningkatkan Attack murni sebesar +22 per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ attack: rank * 22 })
          }
        ]
      },
      {
        id: 'venom_master',
        name: 'Venom Master',
        color: '#22c55e',
        icon: 'Flame',
        talents: [
          {
            id: 'assassin_toxic_coating',
            name: 'Viper Blade',
            desc: 'Serangan biasa memberikan racun yang membakar darah musuh.',
            maxRank: 3,
            statBonus: (rank) => ({ poisonDmg: rank * 12 })
          },
          {
            id: 'assassin_shuriken_hail',
            name: 'Poison Shuriken Storm',
            desc: 'Menambah jumlah lemparan shuriken sebesar +2 bilah per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ extraShurikens: rank * 2 })
          },
          {
            id: 'assassin_corrosive',
            name: 'Corrosive Acid',
            desc: 'Mengurangi defense musuh yang terkena racun sebesar 25%.',
            maxRank: 3,
            statBonus: (rank) => ({ armorPenetration: rank * 0.25 })
          }
        ]
      },
      {
        id: 'phantom_ghost',
        name: 'Phantom Ghost',
        color: '#06b6d4',
        icon: 'Shield',
        talents: [
          {
            id: 'assassin_ghost_walk',
            name: 'Shadow Evasion',
            desc: 'Memberikan 10% peluang menghindar dari semua serangan musuh per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ evasion: rank * 0.10 })
          },
          {
            id: 'assassin_wind_runner',
            name: 'Wind Runner',
            desc: 'Meningkatkan kecepatan lari hero sebesar +12% per rank.',
            maxRank: 3,
            statBonus: (rank) => ({ speedBonus: rank * 0.12 })
          },
          {
            id: 'assassin_adrenaline',
            name: 'Adrenaline Surge',
            desc: 'Membunuh monster langsung memulihkan 8% Max HP dan 15 MP.',
            maxRank: 3,
            statBonus: (rank) => ({ killRecovery: rank * 0.08 })
          }
        ]
      }
    ]
  }
};
