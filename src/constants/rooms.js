export const DUNGEON_ROOMS_TEMPLATE = [
  {
    id: 'dungeon_core',
    name: 'Jantung Dungeon (Core)',
    icon: 'Crown',
    color: '#a855f7',
    badge: 'Pusat Kekuatan',
    desc: 'Inti energi dungeon Anda. Naikkan level ini untuk memperluas wilayah dan membuka fasilitas baru.',
    baseGoldCost: 100,
    costMultiplier: 1.8,
    baseGemCost: 0,
    effectDesc: (lvl) => `Kapasitas wilayah & bonus loot petualangan +${lvl * 15}%`
  },
  {
    id: 'gold_vault',
    name: 'Ruang Simpanan Goblin',
    icon: 'Coins',
    color: '#eab308',
    badge: 'Penghasil Gold',
    desc: 'Pasukan goblin penambang menghasilkan koin emas secara pasif per detik untuk kas dungeon Anda.',
    baseGoldCost: 50,
    costMultiplier: 1.5,
    baseGemCost: 0,
    effectDesc: (lvl) => `Menghasilkan +${(lvl * 2.5).toFixed(1)} Gold / detik (Bisa diklaim kapan saja)`
  },
  {
    id: 'monster_den',
    name: 'Sarang Monster Minion',
    icon: 'Skull',
    color: '#ef4444',
    badge: 'Minion Spawner',
    desc: 'Membiakkan monster liar sebagai penjaga dungeon dan menghasilkan Kristal Jiwa (Gems).',
    baseGoldCost: 80,
    costMultiplier: 1.6,
    baseGemCost: 2,
    effectDesc: (lvl) => `Level Minion Penjaga Lv.${lvl} & Peluang kristal jiwa +${lvl * 5}%`
  },
  {
    id: 'forge',
    name: 'Ruang Tempa Obsidian',
    icon: 'Hammer',
    color: '#f97316',
    badge: 'Upgrade Senjata',
    desc: 'Bengkel pandai besi untuk memperkuat statistik senjata dan perlengkapan zirah Hero.',
    baseGoldCost: 120,
    costMultiplier: 1.7,
    baseGemCost: 3,
    effectDesc: (lvl) => `Bonus Serangan Senjata +${lvl * 8}% & Efisiensi tempa meningkat`
  },
  {
    id: 'alchemy_lab',
    name: 'Kuali Alkimia Misterius',
    icon: 'FlaskConical',
    color: '#10b981',
    badge: 'Racikan Potion',
    desc: 'Menyeduh ramuan Elixir pemulihan HP & Mana otomatis untuk bekal petualangan dungeon.',
    baseGoldCost: 70,
    costMultiplier: 1.5,
    baseGemCost: 1,
    effectDesc: (lvl) => `Membuat Potion gratis otomatis setiap ${Math.max(15, 60 - lvl * 8)} detik`
  },
  {
    id: 'trap_chamber',
    name: 'Ruang Jebakan Duri & Api',
    icon: 'Zap',
    color: '#ec4899',
    badge: 'Pertahanan Dungeon',
    desc: 'Jebakan maut untuk memusnahkan penjelajah luar yang ingin menjarah dungeon Anda.',
    baseGoldCost: 150,
    costMultiplier: 1.7,
    baseGemCost: 5,
    effectDesc: (lvl) => `Bonus Defense Hero +${lvl * 6} & Perangkap duri membunuh penyusup`
  }
];

export const DUNGEON_FLOORS = [
  {
    floorNumber: 1,
    name: 'Misi 1: Whispering Ruins',
    subtitle: 'Gua Reruntuhan Kuno Berbisik',
    monsterPool: ['slime', 'goblin'],
    bossType: 'boss_gargoyle',
    requiredLevel: 1,
    difficulty: 'Normal',
    color: '#22c55e',
    ambientColor: '#0a1a12',
    roomsCount: 4,
    recommendedAtk: 25,
    rewardCore: 1
  },
  {
    floorNumber: 2,
    name: 'Lantai 2: Katakombe Tengkorak',
    subtitle: 'Crypt of Lost Souls',
    monsterPool: ['slime', 'goblin', 'skeleton_archer'],
    bossType: 'boss_gargoyle',
    requiredLevel: 3,
    difficulty: 'Menantang',
    color: '#eab308',
    ambientColor: '#1c190a',
    roomsCount: 5,
    recommendedAtk: 45
  },
  {
    floorNumber: 3,
    name: 'Lantai 3: Benteng Kematian Abyssal',
    subtitle: 'Abyssal Lich Keep',
    monsterPool: ['goblin', 'skeleton_archer', 'orc_berserker'],
    bossType: 'boss_necromancer',
    requiredLevel: 6,
    difficulty: 'Neraka (Hard)',
    color: '#ef4444',
    ambientColor: '#1f0d0d',
    roomsCount: 6,
    recommendedAtk: 75
  }
];
