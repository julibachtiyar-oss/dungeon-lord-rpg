export interface RoomDef {
  id: string;
  name: string;
  x: number;
  y: number;
  w: number;
  h: number;
  enemies: Array<{ type: 'blob' | 'goblin' | 'skeleton' | 'boss'; x: number; y: number }>;
  chest?: { x: number; y: number; tier: number };
  isDownStairs?: boolean;
}

export interface FloorData {
  floorNumber: number;
  name: string;
  playerSpawn: { x: number; y: number };
  rooms: RoomDef[];
}

export class MapLoader {
  public static getFloor(floor: number): FloorData {
    if (floor === 1) {
      return {
        floorNumber: 1,
        name: 'Lantai 1: Halaman Runtuh',
        playerSpawn: { x: 100, y: 100 },
        rooms: [
          { id: 'F1_R1', name: 'Gerbang Kuil (Aman)', x: 40, y: 40, w: 192, h: 160, enemies: [] },
          { id: 'F1_R2', name: 'Kolam Lumpur', x: 280, y: 40, w: 224, h: 160, enemies: [{ type: 'blob', x: 360, y: 100 }, { type: 'blob', x: 420, y: 120 }] },
          { id: 'F1_R3', name: 'Pos Penjaga Goblin', x: 280, y: 240, w: 192, h: 192, enemies: [{ type: 'goblin', x: 380, y: 320 }] },
          { id: 'F1_R4', name: 'Gudang Persediaan', x: 40, y: 240, w: 208, h: 192, enemies: [{ type: 'goblin', x: 100, y: 320 }, { type: 'blob', x: 160, y: 300 }], chest: { x: 140, y: 260, tier: 1 } },
          { id: 'F1_R5', name: 'Lorong Sunyi', x: 40, y: 460, w: 160, h: 128, enemies: [] },
          { id: 'F1_R6', name: 'Tangga Menuju Kedalaman', x: 240, y: 460, w: 224, h: 192, enemies: [{ type: 'goblin', x: 300, y: 520 }, { type: 'goblin', x: 380, y: 540 }], isDownStairs: true }
        ]
      };
    } else if (floor === 2) {
      return {
        floorNumber: 2,
        name: 'Lantai 2: Lorong Pemanah',
        playerSpawn: { x: 80, y: 80 },
        rooms: [
          { id: 'F2_R1', name: 'Sarang Kerangka', x: 40, y: 40, w: 192, h: 160, enemies: [{ type: 'skeleton', x: 160, y: 100 }] },
          { id: 'F2_R2', name: 'Lorong Panjang', x: 260, y: 40, w: 256, h: 160, enemies: [{ type: 'skeleton', x: 440, y: 90 }, { type: 'blob', x: 350, y: 110 }] },
          { id: 'F2_R3', name: 'Kamar Pilar Obsidian', x: 260, y: 230, w: 224, h: 224, enemies: [{ type: 'goblin', x: 340, y: 300 }, { type: 'skeleton', x: 410, y: 340 }] },
          { id: 'F2_R4', name: 'Ruang Harta Tersembunyi', x: 40, y: 230, w: 160, h: 160, enemies: [], chest: { x: 120, y: 300, tier: 2 } },
          { id: 'F2_R5', name: 'Gerbang Penjaga Bawah', x: 40, y: 420, w: 224, h: 192, enemies: [{ type: 'goblin', x: 110, y: 500 }, { type: 'skeleton', x: 180, y: 510 }], isDownStairs: true }
        ]
      };
    } else {
      // Floor 3: Boss Arena (Ruin Warden)
      return {
        floorNumber: 3,
        name: 'Lantai 3: Ruang Inti Emberdeep',
        playerSpawn: { x: 80, y: 80 },
        rooms: [
          { id: 'F3_R1', name: 'Koridor Kristal Gaib', x: 40, y: 40, w: 160, h: 128, enemies: [] },
          { id: 'F3_R2', name: 'Singgasana Ruin Warden', x: 230, y: 40, w: 352, h: 288, enemies: [{ type: 'boss', x: 400, y: 180 }] }
        ]
      };
    }
  }
}
