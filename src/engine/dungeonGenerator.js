import { MONSTER_TYPES } from '../constants/monsters.js';

export function generateDungeon({ floorConfig, mapWidth = 2400, mapHeight = 1800 } = {}) {
  const config = floorConfig || {
    floorNumber: 1,
    name: 'Whispering Ruins',
    roomsCount: 4,
    monsterPool: ['slime', 'goblin'],
    bossType: 'boss_gargoyle'
  };

  const rooms = [];
  const walls = [];
  const torches = [];
  const chests = [];
  const monsters = [];

  const numRooms = config.roomsCount || 4;
  const roomSizes = [
    { w: 380, h: 320 },
    { w: 450, h: 360 },
    { w: 360, h: 300 },
    { w: 420, h: 380 },
    { w: 520, h: 440 }, // Boss Room
  ];

  // Grid layout to guarantee non-overlapping rooms connected by corridors
  const cols = 3;
  const cellW = mapWidth / cols;
  const cellH = mapHeight / 2;

  const positions = [
    { cx: cellW * 0.5, cy: cellH * 0.5 }, // Room 0: Spawn / Entrance
    { cx: cellW * 1.5, cy: cellH * 0.4 }, // Room 1: Goblin Camp
    { cx: cellW * 2.5, cy: cellH * 0.5 }, // Room 2: Crypt Chamber
    { cx: cellW * 1.8, cy: cellH * 1.5 }, // Room 3: Guard Post
    { cx: cellW * 0.6, cy: cellH * 1.5 }, // Room 4: Boss Lair
  ];

  for (let i = 0; i < numRooms; i++) {
    const size = roomSizes[Math.min(i, roomSizes.length - 1)];
    const pos = positions[i] || {
      cx: 300 + (i * 350) % (mapWidth - 600),
      cy: 300 + Math.floor(i / 2) * 450
    };

    const rx = Math.floor(pos.cx - size.w / 2);
    const ry = Math.floor(pos.cy - size.h / 2);

    const isStart = i === 0;
    const isBoss = i === numRooms - 1;

    const room = {
      id: i,
      x: rx,
      y: ry,
      w: size.w,
      h: size.h,
      cx: pos.cx,
      cy: pos.cy,
      isStart,
      isBoss,
      name: isStart ? 'Dungeon Entrance' : isBoss ? 'Abyssal Throne' : `Chamber ${i}`
    };
    rooms.push(room);

    // Add Torches along walls
    torches.push({ x: rx + 30, y: ry + 15, flickerOffset: Math.random() * 10 });
    torches.push({ x: rx + size.w - 30, y: ry + 15, flickerOffset: Math.random() * 10 });
    torches.push({ x: rx + 30, y: ry + size.h - 15, flickerOffset: Math.random() * 10 });
    torches.push({ x: rx + size.w - 30, y: ry + size.h - 15, flickerOffset: Math.random() * 10 });

    // Spawn Chests (in non-start rooms)
    if (!isStart) {
      chests.push({
        id: `chest_${i}`,
        x: rx + size.w / 2 + (Math.random() * 60 - 30),
        y: ry + size.h / 2 + (Math.random() * 60 - 30),
        opened: false,
        radius: 18,
        gold: Math.floor(25 + Math.random() * 50 * (config.floorNumber || 1))
      });
    }

    // Spawn Monsters
    if (!isStart) {
      if (isBoss) {
        // Spawn Floor Boss
        const bossKey = config.bossType || 'boss_gargoyle';
        const bossDef = MONSTER_TYPES[bossKey] || MONSTER_TYPES.boss_gargoyle;
        monsters.push({
          id: `boss_${bossKey}_${Date.now()}`,
          type: bossKey,
          name: bossDef.name || 'Gargoyle Overlord [BOSS]',
          isBoss: true,
          x: pos.cx,
          y: pos.cy,
          radius: bossDef.radius || 34,
          maxHp: bossDef.maxHp || 750,
          hp: bossDef.maxHp || 750,
          attack: bossDef.attack || 38,
          defense: bossDef.defense || 16,
          speed: bossDef.speed || 1.5,
          color: bossDef.color || '#a855f7',
          glowColor: bossDef.glowColor || 'rgba(168, 85, 247, 0.7)',
          behavior: bossDef.behavior || 'boss_complex',
          attackCooldown: bossDef.attackCooldown || 2.2,
          cooldownTimer: 0,
          vx: 0,
          vy: 0,
          roomIndex: i,
          xpReward: bossDef.xpReward || 300,
          goldReward: bossDef.goldReward || [150, 300],
          gemReward: bossDef.gemReward || [5, 10]
        });
      } else {
        // Spawn Normal Mob pack with ~30% Elite Champions
        const count = 3 + (config.floorNumber || 1);
        const AFFIXES = ['Molten', 'Vampiric', 'Blink', 'Ironhide'];

        for (let m = 0; m < count; m++) {
          const pool = Array.isArray(config.monsterPool) && config.monsterPool.length > 0
            ? config.monsterPool
            : ['slime', 'goblin'];
          const typeKey = pool[Math.floor(Math.random() * pool.length)];
          const mobDef = MONSTER_TYPES[typeKey] || MONSTER_TYPES.slime;

          // 30% chance for Elite Champion in rooms > 0
          const isElite = Math.random() < 0.32;
          const affix = isElite ? AFFIXES[Math.floor(Math.random() * AFFIXES.length)] : null;

          const hpMult = isElite ? 1.65 : 1.0;
          const atkMult = isElite ? 1.3 : 1.0;
          const xpMult = isElite ? 2.2 : 1.0;
          const goldMult = isElite ? 2.5 : 1.0;

          monsters.push({
            id: `mob_${i}_${m}_${Date.now()}_${Math.random()}`,
            type: typeKey,
            name: isElite ? `★ ${affix} ${mobDef.name}` : mobDef.name,
            isBoss: false,
            isElite: isElite,
            affix: affix,
            affixTimer: 0,
            x: rx + 50 + Math.random() * (size.w - 100),
            y: ry + 50 + Math.random() * (size.h - 100),
            radius: isElite ? Math.round(mobDef.radius * 1.25) : mobDef.radius,
            maxHp: Math.round(mobDef.maxHp * hpMult),
            hp: Math.round(mobDef.maxHp * hpMult),
            attack: Math.round(mobDef.attack * atkMult),
            defense: isElite ? mobDef.defense + 4 : mobDef.defense,
            speed: mobDef.speed,
            color: mobDef.color,
            glowColor: isElite ? '#fbbf24' : mobDef.glowColor,
            behavior: mobDef.behavior,
            attackCooldown: mobDef.attackCooldown,
            cooldownTimer: Math.random() * mobDef.attackCooldown,
            vx: 0,
            vy: 0,
            roomIndex: i,
            xpReward: Math.round(mobDef.xpReward * xpMult),
            goldReward: [
              Math.round(mobDef.goldReward[0] * goldMult),
              Math.round(mobDef.goldReward[1] * goldMult)
            ]
          });
        }
      }
    }
  }

  // Corridors connecting Room 0 -> 1 -> 2 -> 3 -> 4
  const corridors = [];
  const corridorWidth = 90;

  for (let i = 0; i < rooms.length - 1; i++) {
    const rA = rooms[i];
    const rB = rooms[i + 1];

    // Horizontal then vertical connection
    const midX = (rA.cx + rB.cx) / 2;
    corridors.push({
      x: Math.min(rA.cx, midX) - corridorWidth / 2,
      y: rA.cy - corridorWidth / 2,
      w: Math.abs(midX - rA.cx) + corridorWidth,
      h: corridorWidth
    });
    corridors.push({
      x: midX - corridorWidth / 2,
      y: Math.min(rA.cy, rB.cy) - corridorWidth / 2,
      w: corridorWidth,
      h: Math.abs(rB.cy - rA.cy) + corridorWidth
    });
    corridors.push({
      x: Math.min(midX, rB.cx) - corridorWidth / 2,
      y: rB.cy - corridorWidth / 2,
      w: Math.abs(rB.cx - midX) + corridorWidth,
      h: corridorWidth
    });
  }

  // Player start position in Room 0
  const startRoom = rooms[0];
  const playerSpawn = {
    x: startRoom.cx,
    y: startRoom.cy
  };

  return {
    mapWidth,
    mapHeight,
    rooms,
    corridors,
    torches,
    chests,
    monsters,
    playerSpawn
  };
}

// Check if a point (x, y) with radius r is inside valid walkable dungeon space
export function isInsideWalkableDungeon(x, y, r, dungeon) {
  if (!dungeon || !Array.isArray(dungeon.rooms) || !Array.isArray(dungeon.corridors)) {
    return true;
  }

  // Check bounds
  if (x - r < 40 || x + r > (dungeon.mapWidth || 2400) - 40 || y - r < 40 || y + r > (dungeon.mapHeight || 1800) - 40) {
    return false;
  }

  // Check rooms
  for (const room of dungeon.rooms) {
    if (
      x + r >= room.x &&
      x - r <= room.x + room.w &&
      y + r >= room.y &&
      y - r <= room.y + room.h
    ) {
      return true;
    }
  }

  // Check corridors
  for (const corr of dungeon.corridors) {
    if (
      x + r >= corr.x &&
      x - r <= corr.x + corr.w &&
      y + r >= corr.y &&
      y - r <= corr.y + corr.h
    ) {
      return true;
    }
  }

  return false;
}
