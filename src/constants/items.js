export const ITEM_RARITY = {
  common: { name: 'Biasa', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: '#64748b' },
  magic: { name: 'Sihir', color: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', border: '#16a34a' },
  rare: { name: 'Langka', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: '#0284c7' },
  epic: { name: 'Epik', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: '#9333ea' },
  legendary: { name: 'Legendaris', color: '#facc15', bg: 'rgba(250, 204, 21, 0.18)', border: '#ca8a04' },
};

export const INITIAL_EQUIPMENT = {
  weapon: {
    id: 'starter_blade',
    name: 'Broadsword Pemula',
    type: 'weapon',
    rarity: 'common',
    attack: 12,
    critBonus: 0.02,
    desc: 'Pedang latihan tua peninggalan ksatria pertama.'
  },
  shield: {
    id: 'wooden_buckler',
    name: 'Tameng Kayu Kokoh',
    type: 'shield',
    rarity: 'common',
    defense: 8,
    hpBonus: 25,
    desc: 'Perisai bundar kayu untuk menangkis sabetan cakar monster.'
  },
  helmet: {
    id: 'leather_cap',
    name: 'Topi Kulit Pemburu',
    type: 'helmet',
    rarity: 'common',
    defense: 4,
    hpBonus: 20,
    desc: 'Pelindung kepala sederhana dari kulit serigala.'
  },
  armor: {
    id: 'iron_chestplate',
    name: 'Baju Zirah Besi Tempa',
    type: 'armor',
    rarity: 'common',
    defense: 12,
    hpBonus: 40,
    desc: 'Zirah dada besi tebal yang melindungi organ vital.'
  },
  boots: {
    id: 'traveler_boots',
    name: 'Sepatu Boots Pengelana',
    type: 'boots',
    rarity: 'common',
    defense: 3,
    speedBonus: 0.2,
    desc: 'Sepatu kulit lentur yang mempermudah pergerakan lincah.'
  },
  amulet: {
    id: 'copper_pendant',
    name: 'Amulet Kristal Pemula',
    type: 'amulet',
    rarity: 'common',
    mpBonus: 25,
    desc: 'Kalung kristal kecil yang memancarkan energi magis samar.'
  },
  ring: {
    id: 'iron_band',
    name: 'Cincin Daya Tahan',
    type: 'ring',
    rarity: 'common',
    hpBonus: 30,
    critBonus: 0.03,
    desc: 'Cincin tempaan pandai besi yang menambah kekuatan hidup.'
  }
};

export const LOOT_TABLE = [
  // --- WEAPONS ---
  {
    id: 'obsidian_cleaver',
    name: 'Obsidian Cleaver',
    type: 'weapon',
    rarity: 'rare',
    attack: 26,
    critBonus: 0.08,
    desc: 'Pedang bergerigi yang ditempa dari batu magma hitam pegunungan.'
  },
  {
    id: 'astral_starlight_staff',
    name: 'Tongkat Bintang Astral',
    type: 'weapon',
    rarity: 'epic',
    attack: 42,
    critBonus: 0.14,
    speedBonus: 0.3,
    desc: 'Tongkat pusaka penyihir kuno yang menyerap kekuatan kosmik.'
  },
  {
    id: 'dragon_slayer_greatsword',
    name: 'Dragonfang Greatsword',
    type: 'weapon',
    rarity: 'legendary',
    attack: 78,
    critBonus: 0.25,
    speedBonus: 0.5,
    lifeSteal: 0.08,
    desc: 'Senjata dewa purba yang dibuat dari taring naga bermahkota api.'
  },
  {
    id: 'shadow_fang_daggers',
    name: 'Twin Daggers of Chaos',
    type: 'weapon',
    rarity: 'legendary',
    attack: 68,
    critBonus: 0.35,
    speedBonus: 0.8,
    desc: 'Sepasang belati kegelapan yang menyerang secepat sambaran petir.'
  },

  // --- SHIELDS / OFFHAND ---
  {
    id: 'tower_shield_valiant',
    name: 'Aegis of the Valiant',
    type: 'shield',
    rarity: 'rare',
    defense: 22,
    hpBonus: 90,
    desc: 'Tameng besar baja berlapis perak murni penahan gempuran monster.'
  },
  {
    id: 'abyssal_mirror_shield',
    name: 'Abyssal Shield of Reflection',
    type: 'shield',
    rarity: 'epic',
    defense: 38,
    hpBonus: 180,
    desc: 'Memantulkan sebagian energi pukulan musuh kembali ke penyerangnya.'
  },

  // --- HELMETS ---
  {
    id: 'crown_of_blood',
    name: 'Crown of the Crimson King',
    type: 'helmet',
    rarity: 'epic',
    defense: 20,
    hpBonus: 120,
    critBonus: 0.08,
    desc: 'Mahkota bertatahkan batu delima merah darah milik raja masa lalu.'
  },
  {
    id: 'helm_of_imperium',
    name: 'Imperium War Helm',
    type: 'helmet',
    rarity: 'legendary',
    defense: 35,
    hpBonus: 220,
    attack: 15,
    desc: 'Helm perang legendaris ksatria suci yang memberkati pemakainya.'
  },

  // --- ARMORS ---
  {
    id: 'chitin_armor',
    name: 'Shadow Chitin Carapace',
    type: 'armor',
    rarity: 'rare',
    defense: 25,
    hpBonus: 110,
    desc: 'Baju zirah dari cangkang monster goa purba yang tahan goresan tajam.'
  },
  {
    id: 'titan_bloodplate',
    name: 'Titan Bloodplate of Ruin',
    type: 'armor',
    rarity: 'legendary',
    defense: 65,
    hpBonus: 420,
    lifeSteal: 0.05,
    desc: 'Zirah raksasa berlumur darah titan purba yang hampir mustahil dihancurkan.'
  },

  // --- BOOTS ---
  {
    id: 'mercury_greaves',
    name: 'Mercury Wind Greaves',
    type: 'boots',
    rarity: 'rare',
    defense: 14,
    speedBonus: 0.6,
    desc: 'Sepatu zirah ringan yang membuat langkah kaki terasa melayang di atas tanah.'
  },

  // --- AMULETS & RINGS ---
  {
    id: 'eye_of_abaddon',
    name: 'Eye of Abaddon Talisman',
    type: 'amulet',
    rarity: 'epic',
    hpBonus: 140,
    mpBonus: 90,
    critBonus: 0.10,
    desc: 'Kalung mata naga yang mempertajam insting membunuh dalam pertarungan.'
  },
  {
    id: 'ring_of_eternal_vampirism',
    name: 'Band of the Vampire Lord',
    type: 'ring',
    rarity: 'legendary',
    hpBonus: 200,
    attack: 20,
    critBonus: 0.15,
    lifeSteal: 0.10,
    desc: 'Cincin penguasa vampir: Setiap pukulan menyerap 10% darah musuh menjadi HP!'
  }
];

export const CONSUMABLES = {
  health_potion: {
    id: 'health_potion',
    name: 'Elixir Penyembuh Super',
    healHp: 120,
    desc: 'Memulihkan 120 HP seketika dalam pertempuran sengit.'
  },
  mana_potion: {
    id: 'mana_potion',
    name: 'Astral Mana Flask',
    healMp: 90,
    desc: 'Mengisi ulang 90 MP untuk melancarkan rentetan jurus sihir.'
  }
};
