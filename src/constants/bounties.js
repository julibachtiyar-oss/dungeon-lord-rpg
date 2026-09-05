// Inotia Bounty Board Quests & Monster Codex Definitions
export const BOUNTY_QUESTS = [
  {
    id: 'bounty_slimes',
    title: 'Pembersihan Lendir Beracun',
    desc: 'Bantai 12 Toxic Slime yang mencemari saluran bawah tanah.',
    targetType: 'slime',
    targetCount: 12,
    rewardGold: 140,
    rewardGems: 2,
    icon: '🟢'
  },
  {
    id: 'bounty_goblins',
    title: 'Perburuan Goblin Pengintai',
    desc: 'Tumpas 15 Goblin Scout yang memata-matai ruang tambang.',
    targetType: 'goblin',
    targetCount: 15,
    rewardGold: 220,
    rewardGems: 4,
    icon: '👺'
  },
  {
    id: 'bounty_skeletons',
    title: 'Hancurkan Pasukan Tulang',
    desc: 'Hancurkan 10 Skeleton Archer di katakombe kuno.',
    targetType: 'skeleton_archer',
    targetCount: 10,
    rewardGold: 300,
    rewardGems: 5,
    icon: '🏹'
  },
  {
    id: 'bounty_orcs',
    title: 'Tundukkan Panglima Orc',
    desc: 'Kalahkan 6 Orc Berserker berotot baja di benteng abyssal.',
    targetType: 'orc_berserker',
    targetCount: 6,
    rewardGold: 450,
    rewardGems: 8,
    icon: '🪓'
  },
  {
    id: 'bounty_boss_gargoyle',
    title: 'Taklukkan Sang Overlord',
    desc: 'Kalahkan Boss Gargoyle Overlord di sarang terdalam.',
    targetType: 'boss_gargoyle',
    targetCount: 1,
    rewardGold: 600,
    rewardGems: 15,
    icon: '👑'
  }
];

export const MONSTER_CODEX = [
  {
    id: 'slime',
    name: 'Toxic Slime',
    category: 'Biomassa Beracun',
    avatar: '🟢',
    color: '#22c55e',
    lore: 'Makhluk gelatin beracun yang terbentuk dari endapan asam bawah tanah ribuan tahun.',
    baseHp: 55,
    baseAtk: 8,
    speed: 'Sedang',
    weakness: 'Serangan Api & Tebasan Fisik',
    dropTable: [
      { name: 'Koin Emas', rate: '100%', color: '#facc15' },
      { name: 'Slime Acid Flask', rate: '45%', color: '#22c55e' },
      { name: 'Cincin Lendir Langka', rate: '12%', color: '#38bdf8' }
    ]
  },
  {
    id: 'goblin',
    name: 'Goblin Scout',
    category: 'Humanoid Liar',
    avatar: '👺',
    color: '#eab308',
    lore: 'Pencuri cerdik bertubuh kecil yang bersenjatakan belati tembaga berkarat dan mata elang.',
    baseHp: 85,
    baseAtk: 14,
    speed: 'Sangat Cepat',
    weakness: 'Serangan Area (AoE) & Kejutan',
    dropTable: [
      { name: 'Koin Emas Kantung', rate: '100%', color: '#facc15' },
      { name: 'Belati Karat Goblin', rate: '35%', color: '#cbd5e1' },
      { name: 'Sepatu Boots Kulit Serigala', rate: '18%', color: '#38bdf8' }
    ]
  },
  {
    id: 'skeleton_archer',
    name: 'Skeleton Archer',
    category: 'Mayat Hidup (Undead)',
    avatar: '🏹',
    color: '#cbd5e1',
    lore: 'Prajurit busur panah dari kerajaan yang telah runtuh, dibangkitkan oleh energi gelap.',
    baseHp: 70,
    baseAtk: 16,
    speed: 'Lambat (Menembak Jarak Jauh)',
    weakness: 'Pukulan Berat & Hantaman Perisai',
    dropTable: [
      { name: 'Tulang Belulang Kuno', rate: '100%', color: '#94a3b8' },
      { name: 'Busur Pemburu Katakombe', rate: '28%', color: '#38bdf8' },
      { name: 'Amulet Jiwa Tersiksa', rate: '14%', color: '#c084fc' }
    ]
  },
  {
    id: 'orc_berserker',
    name: 'Orc Berserker',
    category: 'Raksasa Buas',
    avatar: '🪓',
    color: '#ef4444',
    lore: 'Pendekar raksasa berkulit merah darah dengan kapak perang ganda yang tak kenal ampun.',
    baseHp: 200,
    baseAtk: 26,
    speed: 'Kencang saat Mengamuk',
    weakness: 'Jurus Pembeku Es & Serangan Balik Kritis',
    dropTable: [
      { name: 'Koin Emas Melimpah', rate: '100%', color: '#facc15' },
      { name: 'Baju Zirah Plat Besi', rate: '40%', color: '#38bdf8' },
      { name: 'Kapak Raksasa Berserker', rate: '20%', color: '#facc15' }
    ]
  },
  {
    id: 'boss_gargoyle',
    name: 'Gargoyle Overlord [BOSS]',
    category: 'Raja Iblis Batu',
    avatar: '👑',
    color: '#a855f7',
    lore: 'Penguasa gua obsidian dengan sayap iblis raksasa dan kemampuan memanggil gempa penghancur.',
    baseHp: 750,
    baseAtk: 38,
    speed: 'Kuat & Agresif',
    weakness: 'Hindari Indikator Merah Gempa saat Boss Menyerang',
    dropTable: [
      { name: 'Peti Harta Raja Iblis', rate: '100%', color: '#facc15' },
      { name: 'Pedang Legendaris Dragon Blade', rate: '45%', color: '#facc15' },
      { name: 'Kristal Jiwa Murni (Gems)', rate: '100%', color: '#c084fc' }
    ]
  },
  {
    id: 'boss_necromancer',
    name: 'Lich King Malakor [BOSS]',
    category: 'Raja Kematian Abadi',
    avatar: '💀',
    color: '#06b6d4',
    lore: 'Penyihir agung kegelapan yang menguasai sihir kematian nova dan memanggil bala tentara gaib.',
    baseHp: 1200,
    baseAtk: 52,
    speed: 'Mengambang & Nova Orbs',
    weakness: 'Tebasan Beruntun Cepat & Dash Menghindar',
    dropTable: [
      { name: 'Peti Harta Abyssal', rate: '100%', color: '#facc15' },
      { name: 'Tongkat Bintang Mahkota Lich', rate: '60%', color: '#facc15' },
      { name: 'Batu Delima Jiwa Kematian', rate: '100%', color: '#ef4444' }
    ]
  }
];

export const FLOOR_MODIFIERS = [
  { 
    id: 'standard', 
    name: '⚔️ Ekspedisi Standar', 
    desc: 'Kondisi dungeon normal tanpa kutukan maupun berkah tambahan.',
    goldBonus: 1.0, 
    expBonus: 1.0, 
    color: '#94a3b8' 
  },
  { 
    id: 'gold_rush', 
    name: '💰 Demam Emas Goblin', 
    desc: '+50% Gold dari monster & peti, namun monster bergerak sedikit lebih cepat.',
    goldBonus: 1.5, 
    expBonus: 1.1, 
    color: '#facc15' 
  },
  { 
    id: 'blood_curse', 
    name: '🩸 Kutukan Darah Kuno', 
    desc: 'Monster +25% Serangan, namun EXP yang didapat meningkat drastis +75%!',
    goldBonus: 1.25, 
    expBonus: 1.75, 
    color: '#ef4444' 
  },
  { 
    id: 'arcane_surge', 
    name: '🌀 Lonjakan Energi Arcane', 
    desc: 'Waktu jeda skill hero berkurang cepat & peluang drop item langka +40%.',
    goldBonus: 1.2, 
    expBonus: 1.3, 
    color: '#38bdf8' 
  }
];
