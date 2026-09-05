export const ITEM_RARITY = {
  common: { name: 'Biasa', color: '#94a3b8', bg: 'rgba(148, 163, 184, 0.15)', border: '#64748b' },
  rare: { name: 'Langka', color: '#38bdf8', bg: 'rgba(56, 189, 248, 0.15)', border: '#0284c7' },
  epic: { name: 'Epik', color: '#c084fc', bg: 'rgba(192, 132, 252, 0.15)', border: '#9333ea' },
  legendary: { name: 'Legendaris', color: '#facc15', bg: 'rgba(250, 204, 21, 0.15)', border: '#ca8a04' },
};

export const INITIAL_EQUIPMENT = {
  weapon: {
    id: 'starter_blade',
    name: 'Rusty Broadsword',
    type: 'weapon',
    rarity: 'common',
    attack: 8,
    speedBonus: 0,
    critBonus: 0.02,
    desc: 'Pedang latihan tua peninggalan ksatria pertama.'
  },
  armor: {
    id: 'leather_vest',
    name: 'Reinforced Leather Vest',
    type: 'armor',
    rarity: 'common',
    defense: 6,
    hpBonus: 35,
    desc: 'Baju zirah kulit ringan yang memberikan perlindungan dasar.'
  },
  ring: {
    id: 'copper_ring',
    name: 'Ring of Minor Vitality',
    type: 'ring',
    rarity: 'common',
    hpBonus: 20,
    mpBonus: 15,
    desc: 'Cincin tembaga yang memancarkan sedikit aura penyembuhan.'
  }
};

export const LOOT_TABLE = [
  // Weapons
  {
    id: 'dungeon_cleaver',
    name: 'Dungeon Cleaver',
    type: 'weapon',
    rarity: 'rare',
    attack: 22,
    critBonus: 0.08,
    desc: 'Kapak besar yang ditempa dari baja obsidian dungeon.'
  },
  {
    id: 'astral_staff',
    name: 'Staff of the Eclipse',
    type: 'weapon',
    rarity: 'epic',
    attack: 38,
    critBonus: 0.12,
    speedBonus: 0.2,
    desc: 'Tongkat sihir yang menyimpan kristal pecahan bintang.'
  },
  {
    id: 'dragon_fang_blade',
    name: 'Dragonfang Slayer',
    type: 'weapon',
    rarity: 'legendary',
    attack: 65,
    critBonus: 0.25,
    speedBonus: 0.4,
    desc: 'Pedang terhebat yang dibuat dari taring naga purba.'
  },
  // Armors
  {
    id: 'shadow_carapace',
    name: 'Shadow Chitin Armor',
    type: 'armor',
    rarity: 'rare',
    defense: 16,
    hpBonus: 80,
    desc: 'Zirah hitam yang menyerap sebagian energi pukulan musuh.'
  },
  {
    id: 'aegis_of_valor',
    name: 'Aegis of Valor',
    type: 'armor',
    rarity: 'epic',
    defense: 30,
    hpBonus: 180,
    desc: 'Baju zirah berlapis perak murni yang diberkahi cahaya pelindung.'
  },
  {
    id: 'titan_bloodplate',
    name: 'Titan Bloodplate',
    type: 'legendary',
    rarity: 'legendary',
    defense: 50,
    hpBonus: 350,
    desc: 'Zirah legendaris bangsa raksasa yang tak tertembus proyektil.'
  },
  // Rings
  {
    id: 'soul_ruby_band',
    name: 'Soul Ruby Band',
    type: 'ring',
    rarity: 'rare',
    hpBonus: 60,
    critBonus: 0.05,
    desc: 'Permata delima yang meningkatkan daya tahan sang penguasa dungeon.'
  },
  {
    id: 'chrono_talisman',
    name: 'Chrono Talisman',
    type: 'ring',
    rarity: 'epic',
    hpBonus: 100,
    speedBonus: 0.5,
    critBonus: 0.10,
    desc: 'Relik kuno yang mempercepat waktu dan pergerakan pemakainya.'
  }
];

export const CONSUMABLES = {
  health_potion: {
    id: 'health_potion',
    name: 'Healing Elixir',
    type: 'consumable',
    healHp: 75,
    color: '#ef4444',
    desc: 'Memulihkan 75 HP seketika saat darurat.'
  },
  mana_potion: {
    id: 'mana_potion',
    name: 'Astral Mana Drop',
    type: 'consumable',
    healMp: 50,
    color: '#38bdf8',
    desc: 'Memulihkan 50 MP untuk mengeluarkan skill sihir.'
  }
};
