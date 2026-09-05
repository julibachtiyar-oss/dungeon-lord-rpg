import { useState, useEffect, useMemo, useCallback } from 'react';
import { HERO_CLASSES } from '../constants/classes';
import { INITIAL_EQUIPMENT } from '../constants/items';
import { DUNGEON_ROOMS_TEMPLATE } from '../constants/rooms';
import { INITIAL_SANCTUARY_GRID, BUILDING_TYPES } from '../constants/dungeonSanctuary';
import { MERCENARIES } from '../constants/mercenaries';
import { CLASS_TALENT_TREES } from '../constants/talents';
import { sound } from '../engine/soundEngine';

const SAVE_KEY = 'DUNGEON_LORD_INOTIA_SAVE_V2';

export function useGameState() {
  const [gameState, setGameState] = useState(() => {
    const defaultState = {
      gold: 250,
      gems: 10,
      unclaimedGold: 0,
      lastSaved: Date.now(),
      heroClassId: 'warrior',
      heroLevel: 1,
      heroExp: 0,
      talentPoints: 3,
      talents: {},
      potionsCount: 5,
      activeMercenaryId: 'goblin_berserker',
      gridState: [...INITIAL_SANCTUARY_GRID],
      equipment: { ...INITIAL_EQUIPMENT },
      inventory: [],
      rooms: DUNGEON_ROOMS_TEMPLATE.map(r => ({ ...r, level: 1 })),
      soundEnabled: true,
      prologueSeen: false,
      monsterKills: {},
      claimedBounties: []
    };

    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const now = Date.now();
        const elapsedSec = Math.max(0, (now - (parsed.lastSaved || now)) / 1000);

        // Count vaults on grid
        const vaultCount = (parsed.gridState || INITIAL_SANCTUARY_GRID).filter(c => c === 'vault').length;
        const goldPerSec = Math.max(3.0, vaultCount * 4.0);
        const maxOfflineSec = 8 * 3600;
        const offlineGold = Math.min(Math.floor(elapsedSec * goldPerSec), Math.floor(maxOfflineSec * goldPerSec));

        const mergedRooms = DUNGEON_ROOMS_TEMPLATE.map(tpl => {
          const savedRoom = parsed.rooms?.find(r => r.id === tpl.id);
          return {
            ...tpl,
            level: savedRoom?.level || 1
          };
        });

        return {
          ...defaultState,
          ...parsed,
          gridState: parsed.gridState && parsed.gridState.length === 48 ? parsed.gridState : defaultState.gridState,
          rooms: mergedRooms,
          unclaimedGold: (parsed.unclaimedGold || 0) + offlineGold,
          lastSaved: now
        };
      }
    } catch (e) {
      console.warn('Failed to load save state:', e);
    }

    return defaultState;
  });

  // Autosave to localStorage on state changes
  useEffect(() => {
    try {
      const toSave = {
        ...gameState,
        lastSaved: Date.now()
      };
      localStorage.setItem(SAVE_KEY, JSON.stringify(toSave));
    } catch (e) {
      console.warn('Autosave error:', e);
    }
  }, [gameState]);

  // Passive gold tick every second based on grid vaults
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        const vaultCount = prev.gridState.filter(c => c === 'vault').length;
        const rate = Math.max(3.0, vaultCount * 4.0);
        return {
          ...prev,
          unclaimedGold: prev.unclaimedGold + rate
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const heroClass = HERO_CLASSES[gameState.heroClassId] || HERO_CLASSES.warrior;
  const activeMercenary = MERCENARIES.find(m => m.id === gameState.activeMercenaryId) || MERCENARIES[0];

  // Calculate Inotia Total Stats (Base + All 7 Paperdoll Slots + Forge bonus + Level)
  const totalStats = useMemo(() => {
    const base = heroClass.baseStats;
    const forgeCount = gameState.gridState.filter(c => c === 'forge').length;
    const forgeMultiplier = 1 + forgeCount * 0.15;

    let atk = base.attack * forgeMultiplier;
    let def = base.defense;
    let maxHp = base.maxHp;
    let maxMp = base.maxMp;
    let speed = base.speed;
    let crit = base.critChance;

    const eq = gameState.equipment;
    const processSlot = (item) => {
      if (!item) return { atk: 0, def: 0, hp: 0, mp: 0, crit: 0, spd: 0 };
      const enhMult = 1 + (item.enhancement || 0) * 0.12;
      let slotAtk = (item.attack || 0) * enhMult;
      let slotDef = (item.defense || 0) * enhMult;
      let slotHp = (item.hpBonus || 0) * enhMult;
      let slotMp = (item.mpBonus || 0) * enhMult;
      let slotCrit = (item.critBonus || 0);
      let slotSpd = (item.speedBonus || 0);

      // Gem socket bonuses
      if (item.sockets && Array.isArray(item.sockets)) {
        for (const g of item.sockets) {
          if (g === 'ruby') slotAtk += 16;
          else if (g === 'sapphire') { slotHp += 110; slotDef += 6; }
          else if (g === 'emerald') { slotCrit += 0.08; slotSpd += 0.12; }
        }
      }
      return { atk: slotAtk, def: slotDef, hp: slotHp, mp: slotMp, crit: slotCrit, spd: slotSpd };
    };

    for (const key of ['weapon', 'shield', 'helmet', 'armor', 'boots', 'amulet', 'ring']) {
      const s = processSlot(eq[key]);
      atk += s.atk;
      def += s.def;
      maxHp += s.hp;
      maxMp += s.mp;
      crit += s.crit;
      speed += s.spd;
    }

    // Talent tree passive perks
    const talentMap = gameState.talents || {};
    const classTree = CLASS_TALENT_TREES[gameState.heroClassId];
    if (classTree) {
      for (const branch of classTree.branches) {
        for (const t of branch.talents) {
          const rank = talentMap[t.id] || 0;
          if (rank > 0) {
            const bonuses = t.statBonus(rank);
            if (bonuses.attack) atk += bonuses.attack;
            if (bonuses.defense) def += bonuses.defense;
            if (bonuses.maxHp) maxHp += bonuses.maxHp;
            if (bonuses.maxMp) maxMp += bonuses.maxMp;
            if (bonuses.critChance) crit += bonuses.critChance;
            if (bonuses.speedBonus) speed += bonuses.speedBonus;
          }
        }
      }
    }

    const lvlMultiplier = 1 + (gameState.heroLevel - 1) * 0.15;
    atk = Math.round(atk * lvlMultiplier);
    maxHp = Math.round(maxHp * lvlMultiplier);
    maxMp = Math.round(maxMp * lvlMultiplier);

    return {
      attack: atk,
      defense: Math.round(def),
      maxHp,
      maxMp,
      speed,
      critChance: Math.min(0.90, crit),
      weaponEnhancement: eq.weapon?.enhancement || 0
    };
  }, [heroClass, gameState.equipment, gameState.gridState, gameState.heroLevel, gameState.talents, gameState.heroClassId]);

  // Actions
  const claimPassiveIncome = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gold: prev.gold + Math.floor(prev.unclaimedGold),
      unclaimedGold: 0
    }));
  }, []);

  const updateGrid = useCallback((newGrid, costGold, costGems) => {
    setGameState(prev => ({
      ...prev,
      gold: Math.max(0, prev.gold - costGold),
      gems: Math.max(0, prev.gems - costGems),
      gridState: newGrid
    }));
  }, []);

  const upgradeRoom = useCallback((roomId, goldCost, gemCost) => {
    setGameState(prev => ({
      ...prev,
      gold: Math.max(0, prev.gold - goldCost),
      gems: Math.max(0, prev.gems - gemCost),
      rooms: prev.rooms.map(r => r.id === roomId ? { ...r, level: r.level + 1 } : r)
    }));
  }, []);

  const equipItem = useCallback((item, inventoryIndex) => {
    setGameState(prev => {
      const slot = item.type;
      const oldEquipped = prev.equipment[slot];

      const newInv = [...prev.inventory];
      newInv.splice(inventoryIndex, 1);
      if (oldEquipped) {
        newInv.push(oldEquipped);
      }

      return {
        ...prev,
        equipment: {
          ...prev.equipment,
          [slot]: item
        },
        inventory: newInv
      };
    });
  }, []);

  const sellItem = useCallback((inventoryIndex, value) => {
    setGameState(prev => {
      const newInv = [...prev.inventory];
      newInv.splice(inventoryIndex, 1);
      return {
        ...prev,
        gold: prev.gold + value,
        inventory: newInv
      };
    });
  }, []);

  const addLootItem = useCallback((item) => {
    setGameState(prev => {
      if (prev.inventory.length >= 24) return prev;
      return {
        ...prev,
        inventory: [item, ...prev.inventory]
      };
    });
  }, []);

  const addExpAndGold = useCallback((earnedGold, earnedGems, kills, killedTypes = {}) => {
    setGameState(prev => {
      let expToAdd = kills * 40;
      let newExp = prev.heroExp + expToAdd;
      let newLevel = prev.heroLevel;
      let newTalentPoints = prev.talentPoints || 0;
      const expNeeded = newLevel * 120;

      if (newExp >= expNeeded) {
        newLevel += 1;
        newExp -= expNeeded;
        newTalentPoints += 1;
        sound.playLevelUp();
      }

      const updatedKills = { ...(prev.monsterKills || {}) };
      for (const [type, count] of Object.entries(killedTypes)) {
        updatedKills[type] = (updatedKills[type] || 0) + count;
      }

      return {
        ...prev,
        gold: prev.gold + earnedGold,
        gems: prev.gems + earnedGems,
        heroLevel: newLevel,
        heroExp: newExp,
        talentPoints: newTalentPoints,
        monsterKills: updatedKills
      };
    });
  }, []);

  const claimBounty = useCallback((bounty) => {
    setGameState(prev => {
      if ((prev.claimedBounties || []).includes(bounty.id)) return prev;
      sound.playLevelUp();
      return {
        ...prev,
        gold: prev.gold + bounty.rewardGold,
        gems: prev.gems + bounty.rewardGems,
        claimedBounties: [...(prev.claimedBounties || []), bounty.id]
      };
    });
  }, []);

  const learnTalent = useCallback((talentId, maxRank) => {
    setGameState(prev => {
      if ((prev.talentPoints || 0) <= 0) return prev;
      const currentRank = prev.talents?.[talentId] || 0;
      if (currentRank >= maxRank) return prev;

      sound.playLevelUp();
      return {
        ...prev,
        talentPoints: prev.talentPoints - 1,
        talents: {
          ...(prev.talents || {}),
          [talentId]: currentRank + 1
        }
      };
    });
  }, []);

  const resetTalents = useCallback(() => {
    setGameState(prev => {
      const invested = Object.values(prev.talents || {}).reduce((a, b) => a + b, 0);
      sound.playEquipItem();
      return {
        ...prev,
        talentPoints: (prev.talentPoints || 0) + invested,
        talents: {}
      };
    });
  }, []);

  const addSanctuaryRewards = useCallback((addGold, addGems) => {
    setGameState(prev => ({
      ...prev,
      gold: prev.gold + addGold,
      gems: prev.gems + addGems
    }));
  }, []);

  const selectClass = useCallback((classId) => {
    setGameState(prev => ({
      ...prev,
      heroClassId: classId
    }));
  }, []);

  const selectMercenary = useCallback((mercId) => {
    setGameState(prev => ({
      ...prev,
      activeMercenaryId: mercId
    }));
  }, []);

  const consumePotion = useCallback(() => {
    if (gameState.potionsCount <= 0) return false;
    setGameState(prev => ({
      ...prev,
      potionsCount: prev.potionsCount - 1
    }));
    return true;
  }, [gameState.potionsCount]);

  const enhanceEquipment = useCallback((slot) => {
    let result = { success: false, msg: '' };
    setGameState(prev => {
      const item = prev.equipment[slot];
      if (!item) return prev;
      const curEnhance = item.enhancement || 0;
      if (curEnhance >= 10) {
        result = { success: false, msg: 'Tingkat maksimal +10 tercapai!' };
        return prev;
      }

      const goldCost = (curEnhance + 1) * 75;
      const gemCost = curEnhance >= 6 ? 2 : (curEnhance >= 3 ? 1 : 0);

      if (prev.gold < goldCost || prev.gems < gemCost) {
        result = { success: false, msg: 'Gold atau Gems tidak mencukupi!' };
        return prev;
      }

      // Success chances: +1..+3: 100%, +4..+6: 80%, +7..+8: 60%, +9..+10: 40%
      const successChance = curEnhance < 3 ? 1.0 : curEnhance < 6 ? 0.8 : curEnhance < 8 ? 0.6 : 0.4;
      const isSuccess = Math.random() <= successChance;

      if (isSuccess) {
        sound.playLevelUp();
        result = { success: true, newLevel: curEnhance + 1, msg: `Sukses Menempa! Menjadi +${curEnhance + 1}!` };
        return {
          ...prev,
          gold: prev.gold - goldCost,
          gems: prev.gems - gemCost,
          equipment: {
            ...prev.equipment,
            [slot]: {
              ...item,
              enhancement: curEnhance + 1
            }
          }
        };
      } else {
        sound.playAttackMelee();
        result = { success: false, newLevel: curEnhance, msg: 'Tempaan gagal! Beruntung perlengkapan utuh.' };
        return {
          ...prev,
          gold: prev.gold - goldCost,
          gems: prev.gems - gemCost
        };
      }
    });
    return result;
  }, []);

  const socketGem = useCallback((slot, socketIndex, gemType) => {
    setGameState(prev => {
      const item = prev.equipment[slot];
      if (!item || prev.gems < 1) return prev;

      const curSockets = item.sockets ? [...item.sockets] : [null, null];
      curSockets[socketIndex] = gemType;
      sound.playEquipItem();

      return {
        ...prev,
        gems: prev.gems - 1,
        equipment: {
          ...prev.equipment,
          [slot]: {
            ...item,
            sockets: curSockets
          }
        }
      };
    });
  }, []);

  const markPrologueSeen = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      prologueSeen: true
    }));
  }, []);

  const resetGame = useCallback(() => {
    localStorage.removeItem(SAVE_KEY);
    window.location.reload();
  }, []);

  return {
    gameState,
    heroClass,
    activeMercenary,
    totalStats,
    claimPassiveIncome,
    updateGrid,
    upgradeRoom,
    equipItem,
    sellItem,
    addLootItem,
    addExpAndGold,
    addSanctuaryRewards,
    selectClass,
    selectMercenary,
    consumePotion,
    markPrologueSeen,
    resetGame,
    learnTalent,
    resetTalents,
    enhanceEquipment,
    socketGem,
    claimBounty
  };
}
