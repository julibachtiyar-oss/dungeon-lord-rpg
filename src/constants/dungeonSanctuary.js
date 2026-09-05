export const GRID_COLS = 8;
export const GRID_ROWS = 6;

export const BUILDING_TYPES = {
  empty: {
    id: 'empty',
    name: 'Lantai Batu Kosong',
    desc: 'Lantai batu kosong. Sentuh untuk membangun fasilitas atau memasang jebakan maut.',
    icon: 'Grid',
    color: '#1e293b',
    canBuild: true,
  },
  portal: {
    id: 'portal',
    name: 'Gerbang Masuk Dungeon',
    desc: 'Pintu gerbang tempat para petualang manusia luar memasuki dungeon Anda.',
    icon: 'DoorOpen',
    color: '#06b6d4',
    fixed: true
  },
  core: {
    id: 'core',
    name: 'Jantung Dungeon (Core)',
    desc: 'Inti energi dungeon. Lindungi jangan sampai diserang petualang manusia!',
    icon: 'Crown',
    color: '#a855f7',
    fixed: true
  },
  vault: {
    id: 'vault',
    name: 'Tambang Emas Goblin',
    desc: 'Pasukan goblin menambang koin emas secara terus menerus (+4 Gold/detik).',
    icon: 'Coins',
    color: '#eab308',
    costGold: 120,
    costGems: 0,
    rateGold: 4.0
  },
  spawner: {
    id: 'spawner',
    name: 'Sarang Monster Penjaga',
    desc: 'Menempatkan 2 minion monster penjaga yang otomatis menyerang petualang penyusup.',
    icon: 'Skull',
    color: '#ef4444',
    costGold: 180,
    costGems: 2,
    minionType: 'goblin'
  },
  trap_spike: {
    id: 'trap_spike',
    name: 'Jebakan Duri Beracun',
    desc: 'Duri tajam mencuat dari lantai saat diinjak, memberikan 85 damage instan ke petualang.',
    icon: 'Zap',
    color: '#ec4899',
    costGold: 75,
    costGems: 0,
    trapDamage: 85
  },
  trap_fire: {
    id: 'trap_fire',
    name: 'Menara Semburan Api',
    desc: 'Menyemburkan semburan api berkala membakar semua petualang di dekatnya.',
    icon: 'Flame',
    color: '#f97316',
    costGold: 160,
    costGems: 3,
    trapDamage: 140
  },
  forge: {
    id: 'forge',
    name: 'Bengkel Tempa Obsidian',
    desc: 'Meningkatkan serangan senjata Hero dan Minion di dungeon sebesar +15%.',
    icon: 'Hammer',
    color: '#d97706',
    costGold: 220,
    costGems: 4,
    atkBonus: 0.15
  },
  alchemy: {
    id: 'alchemy',
    name: 'Kuali Ramuan Alkimia',
    desc: 'Meracik ramuan pemulihan HP & Mana otomatis untuk bekal petualangan.',
    icon: 'FlaskConical',
    color: '#10b981',
    costGold: 140,
    costGems: 2
  },
  wall: {
    id: 'wall',
    name: 'Tembok Granit Benteng',
    desc: 'Tembok batu kokoh yang tidak dapat dilewati petualang musuh. Gunakan untuk mengatur labirin jebakan!',
    icon: 'ShieldAlert',
    color: '#64748b',
    costGold: 40,
    costGems: 0,
    isObstacle: true
  },
  torture: {
    id: 'torture',
    name: 'Kamar Siksaan Iblis',
    desc: 'Menurunkan attack petualang musuh yang melintasinya sebesar -35%.',
    icon: 'Skull',
    color: '#9333ea',
    costGold: 190,
    costGems: 3
  },
  library: {
    id: 'library',
    name: 'Perpustakaan Kitab Terlarang',
    desc: 'Meningkatkan perolehan EXP Hero dan Minion di petualangan sebesar +25%.',
    icon: 'Sparkles',
    color: '#38bdf8',
    costGold: 240,
    costGems: 5,
    expBonus: 0.25
  }
};

export const INITIAL_SANCTUARY_GRID = [
  // Row 0
  'empty', 'portal', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty',
  // Row 1
  'empty', 'empty',  'empty', 'spawner', 'empty', 'empty', 'vault', 'empty',
  // Row 2
  'empty', 'trap_spike', 'empty', 'empty', 'empty', 'empty', 'empty', 'empty',
  // Row 3
  'empty', 'empty', 'trap_fire', 'empty', 'forge', 'empty', 'empty', 'empty',
  // Row 4
  'empty', 'empty', 'empty', 'empty', 'empty', 'alchemy', 'empty', 'empty',
  // Row 5
  'empty', 'empty', 'empty', 'empty', 'empty', 'empty', 'core', 'empty',
];

export const INVADER_TYPES = {
  novice_warrior: {
    id: 'novice_warrior',
    name: 'Ksatria Kerajaan',
    color: '#38bdf8',
    avatar: '⚔️',
    radius: 12,
    maxHp: 110,
    attack: 16,
    speed: 1.2,
    goldDrop: [25, 45],
    gemChance: 0.15
  },
  royal_archer: {
    id: 'royal_archer',
    name: 'Pemanah Elven',
    color: '#22c55e',
    avatar: '🏹',
    radius: 11,
    maxHp: 80,
    attack: 20,
    speed: 1.4,
    goldDrop: [35, 60],
    gemChance: 0.20
  },
  high_paladin: {
    id: 'high_paladin',
    name: 'High Paladin [ELITE]',
    color: '#facc15',
    avatar: '🛡️',
    radius: 15,
    maxHp: 280,
    attack: 30,
    speed: 1.1,
    goldDrop: [80, 150],
    gemChance: 0.65,
    equipmentChance: 0.40
  },
  archmage_infiltrator: {
    id: 'archmage_infiltrator',
    name: 'Penyihir Kerajaan [ELITE]',
    color: '#c084fc',
    avatar: '🧙‍♂️',
    radius: 13,
    maxHp: 190,
    attack: 38,
    speed: 1.3,
    goldDrop: [90, 180],
    gemChance: 0.70,
    equipmentChance: 0.50
  }
};
