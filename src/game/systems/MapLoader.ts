export interface RectDef {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface RoomDef extends RectDef {
  id: string;
  name: string;
  enemies: Array<{ type: 'blob' | 'goblin' | 'skeleton' | 'boss'; x: number; y: number }>;
  chest?: { x: number; y: number; tier: number };
  isDownStairs?: boolean;
}

export interface FloorData {
  floorNumber: number;
  name: string;
  playerSpawn: { x: number; y: number };
  rooms: RoomDef[];
  corridors: RectDef[];
}

export class MapLoader {
  public static getFloor(floor: number): FloorData {
    if (floor === 1) {
      return {
        floorNumber: 1,
        name: 'Lantai 1: Kuil Gerbang Runtuh',
        playerSpawn: { x: 100, y: 100 },
        rooms: [
          // Room 1: Entrance (Safe)
          { id: 'F1_R1', name: 'Gerbang Kuil (Aman)', x: 48, y: 48, w: 160, h: 128, enemies: [] },
          // Room 2: Slime Pits
          { id: 'F1_R2', name: 'Kolam Lumpur Beracun', x: 272, y: 48, w: 176, h: 128, enemies: [
            { type: 'blob', x: 330, y: 90 },
            { type: 'blob', x: 390, y: 120 }
          ]},
          // Room 3: Goblin Barracks
          { id: 'F1_R3', name: 'Pos Penjaga Goblin', x: 272, y: 240, w: 176, h: 160, enemies: [
            { type: 'goblin', x: 330, y: 290 },
            { type: 'goblin', x: 380, y: 340 }
          ]},
          // Room 4: Storage & Chest
          { id: 'F1_R4', name: 'Gudang Harta Karun', x: 48, y: 240, w: 160, h: 160, enemies: [
            { type: 'blob', x: 100, y: 310 },
            { type: 'goblin', x: 150, y: 340 }
          ], chest: { x: 128, y: 270, tier: 1 } },
          // Room 5: Dark Chamber
          { id: 'F1_R5', name: 'Lorong Bayangan', x: 48, y: 464, w: 160, h: 128, enemies: [
            { type: 'blob', x: 120, y: 520 }
          ]},
          // Room 6: Exit Stairway
          { id: 'F1_R6', name: 'Tangga Menuju Kedalaman', x: 272, y: 464, w: 176, h: 144, enemies: [
            { type: 'goblin', x: 320, y: 510 },
            { type: 'goblin', x: 380, y: 540 }
          ], isDownStairs: true }
        ],
        // Open connecting corridors! (Wide, smooth, 48px width)
        corridors: [
          { x: 208, y: 88, w: 64, h: 48 },  // Room 1 to 2
          { x: 336, y: 176, w: 48, h: 64 }, // Room 2 to 3
          { x: 208, y: 296, w: 64, h: 48 }, // Room 3 to 4
          { x: 104, y: 400, w: 48, h: 64 }, // Room 4 to 5
          { x: 208, y: 504, w: 64, h: 48 }  // Room 5 to 6
        ]
      };
    } else if (floor === 2) {
      return {
        floorNumber: 2,
        name: 'Lantai 2: Makam Obsidian',
        playerSpawn: { x: 96, y: 96 },
        rooms: [
          { id: 'F2_R1', name: 'Makam Kerangka', x: 48, y: 48, w: 160, h: 144, enemies: [
            { type: 'skeleton', x: 150, y: 110 }
          ]},
          { id: 'F2_R2', name: 'Aula Pilar Bawah', x: 272, y: 48, w: 192, h: 144, enemies: [
            { type: 'skeleton', x: 340, y: 90 },
            { type: 'goblin', x: 400, y: 120 }
          ]},
          { id: 'F2_R3', name: 'Kamar Pembantaian', x: 272, y: 256, w: 192, h: 176, enemies: [
            { type: 'skeleton', x: 330, y: 300 },
            { type: 'goblin', x: 390, y: 340 },
            { type: 'blob', x: 360, y: 380 }
          ]},
          { id: 'F2_R4', name: 'Ruang Harta Tersembunyi', x: 48, y: 256, w: 160, h: 160, enemies: [], chest: { x: 128, y: 310, tier: 2 } },
          { id: 'F2_R5', name: 'Gerbang Segel Ruin Warden', x: 48, y: 480, w: 240, h: 160, enemies: [
            { type: 'skeleton', x: 120, y: 540 },
            { type: 'goblin', x: 180, y: 550 }
          ], isDownStairs: true }
        ],
        corridors: [
          { x: 208, y: 96, w: 64, h: 48 },
          { x: 344, y: 192, w: 48, h: 64 },
          { x: 208, y: 312, w: 64, h: 48 },
          { x: 104, y: 416, w: 48, h: 64 }
        ]
      };
    } else {
      // Floor 3: Boss Arena (Ruin Warden)
      return {
        floorNumber: 3,
        name: 'Lantai 3: Ruang Inti Emberdeep',
        playerSpawn: { x: 96, y: 96 },
        rooms: [
          { id: 'F3_R1', name: 'Serambi Kristal Purba', x: 48, y: 48, w: 144, h: 128, enemies: [] },
          { id: 'F3_R2', name: 'Singgasana Ruin Warden', x: 256, y: 48, w: 320, h: 288, enemies: [
            { type: 'boss', x: 400, y: 180 }
          ]}
        ],
        corridors: [
          { x: 192, y: 88, w: 64, h: 48 } // Wide grand corridor to Boss Arena!
        ]
      };
    }
  }
}
