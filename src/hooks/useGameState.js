import { useState, useEffect, useMemo, useCallback } from 'react';
import { HERO_CLASSES } from '../constants/classes';
import { INITIAL_EQUIPMENT } from '../constants/items';
import { DUNGEON_ROOMS_TEMPLATE } from '../constants/rooms';
import { sound } from '../engine/soundEngine';

const SAVE_KEY = 'DUNGEON_LORD_SAVE_V1';

export function useGameState() {
  const [gameState, setGameState] = useState(() => {
    // Initial default state
    const defaultState = {
      gold: 150,
      gems: 5,
      unclaimedGold: 0,
      lastSaved: Date.now(),
      heroClassId: 'warrior',
      heroLevel: 1,
      heroExp: 0,
      potionsCount: 3,
      equipment: { ...INITIAL_EQUIPMENT },
      inventory: [],
      rooms: DUNGEON_ROOMS_TEMPLATE.map(r => ({ ...r, level: 1 })),
      soundEnabled: true
    };

    try {
      const saved = localStorage.getItem(SAVE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Calculate offline progress
        const now = Date.now();
        const elapsedSec = Math.max(0, (now - (parsed.lastSaved || now)) / 1000);

        const vaultRoom = parsed.rooms?.find(r => r.id === 'gold_vault');
        const goldPerSec = (vaultRoom?.level || 1) * 2.5;
        const offlineGold = Math.floor(elapsedSec * goldPerSec);

        // Cap offline gold to 8 hours
        const maxOfflineSec = 8 * 3600;
        const cappedOfflineGold = Math.min(offlineGold, Math.floor(maxOfflineSec * goldPerSec));

        return {
          ...defaultState,
          ...parsed,
          unclaimedGold: (parsed.unclaimedGold || 0) + cappedOfflineGold,
          lastSaved: now
        };
      }
    } catch (e) {
      console.warn('Failed to load save state:', e);
    }

    return defaultState;
  });

  // Autosave to localStorage on changes
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

  // Passive gold tick every second
  useEffect(() => {
    const timer = setInterval(() => {
      setGameState(prev => {
        const vault = prev.rooms.find(r => r.id === 'gold_vault');
        const rate = (vault?.level || 1) * 2.5;
        return {
          ...prev,
          unclaimedGold: prev.unclaimedGold + rate
        };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const heroClass = HERO_CLASSES[gameState.heroClassId] || HERO_CLASSES.warrior;

  // Calculate Total Hero Stats (Base + Equipment + Room Bonuses)
  const totalStats = useMemo(() => {
    const base = heroClass.baseStats;
    const forge = gameState.rooms.find(r => r.id === 'forge');
    const trap = gameState.rooms.find(r => r.id === 'trap_chamber');

    const forgeAtkBonus = 1 + ((forge?.level || 1) - 1) * 0.08;
    const trapDefBonus = ((trap?.level || 1) - 1) * 6;

    let atk = base.attack * forgeAtkBonus;
    let def = base.defense + trapDefBonus;
    let maxHp = base.maxHp;
    let maxMp = base.maxMp;
    let speed = base.speed;
    let crit = base.critChance;

    // Add equipped gear
    if (gameState.equipment.weapon) {
      atk += gameState.equipment.weapon.attack || 0;
      crit += gameState.equipment.weapon.critBonus || 0;
      speed += gameState.equipment.weapon.speedBonus || 0;
    }
    if (gameState.equipment.armor) {
      def += gameState.equipment.armor.defense || 0;
      maxHp += gameState.equipment.armor.hpBonus || 0;
    }
    if (gameState.equipment.ring) {
      maxHp += gameState.equipment.ring.hpBonus || 0;
      maxMp += gameState.equipment.ring.mpBonus || 0;
      crit += gameState.equipment.ring.critBonus || 0;
      speed += gameState.equipment.ring.speedBonus || 0;
    }

    // Add Level multipliers
    const lvlMultiplier = 1 + (gameState.heroLevel - 1) * 0.12;
    atk = Math.round(atk * lvlMultiplier);
    maxHp = Math.round(maxHp * lvlMultiplier);
    maxMp = Math.round(maxMp * lvlMultiplier);

    return {
      attack: atk,
      defense: Math.round(def),
      maxHp,
      maxMp,
      speed,
      critChance: Math.min(0.85, crit)
    };
  }, [heroClass, gameState.equipment, gameState.rooms, gameState.heroLevel]);

  // Actions
  const claimPassiveIncome = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gold: prev.gold + Math.floor(prev.unclaimedGold),
      unclaimedGold: 0
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
      if (prev.inventory.length >= 25) return prev; // Inventory full
      return {
        ...prev,
        inventory: [item, ...prev.inventory]
      };
    });
  }, []);

  const addExpAndGold = useCallback((earnedGold, earnedGems, kills) => {
    setGameState(prev => {
      let expToAdd = kills * 35;
      let newExp = prev.heroExp + expToAdd;
      let newLevel = prev.heroLevel;
      const expNeeded = newLevel * 100;

      if (newExp >= expNeeded) {
        newLevel += 1;
        newExp -= expNeeded;
        sound.playLevelUp();
      }

      return {
        ...prev,
        gold: prev.gold + earnedGold,
        gems: prev.gems + earnedGems,
        heroLevel: newLevel,
        heroExp: newExp
      };
    });
  }, []);

  const selectClass = useCallback((classId) => {
    setGameState(prev => ({
      ...prev,
      heroClassId: classId
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

  const addPotion = useCallback((count = 1) => {
    setGameState(prev => ({
      ...prev,
      potionsCount: prev.potionsCount + count
    }));
  }, []);

  return {
    gameState,
    heroClass,
    totalStats,
    claimPassiveIncome,
    upgradeRoom,
    equipItem,
    sellItem,
    addLootItem,
    addExpAndGold,
    selectClass,
    consumePotion,
    addPotion
  };
}
