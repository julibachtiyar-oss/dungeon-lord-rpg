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
  bounds: { minX: number; minY: number; maxX: number; maxY: number };
}

export class MapLoader {
  public static getFloor(floor: number): FloorData {
    if (floor === 1) {
      return {
        floorNumber: 1,
        name: 'Lantai 1: Kuil Gerbang Runtuh',
        playerSpawn: { x: 112, y: 112 },
        bounds: { minX: 48, minY: 48, maxX: 464, maxY: 640 },
        rooms: [
          // Room 1: Entrance (Safe)
          { id: 'F1_R1', name: 'Gerbang Kuil (Aman)', x: 48, y: 48, w: 160, h: 128, enemies: [] },
          // Room 2: Slime Pits
          { id: 'F1_R2', name: 'Kolam Lumpur Beracun', x: 288, y: 48, w: 176, h: 128, enemies: [
            { type: 'blob', x: 336, y: 96 },
            { type: 'blob', x: 400, y: 112 }
          ]},
          // Room 3: Goblin Barracks
          { id: 'F1_R3', name: 'Pos Penjaga Goblin', x: 288, y: 256, w: 176, h: 160, enemies: [
            { type: 'goblin', x: 336, y: 304 },
            { type: 'goblin', x: 400, y: 352 }
          ]},
          // Room 4: Storage & Chest
          { id: 'F1_R4', name: 'Gudang Harta Karun', x: 48, y: 256, w: 160, h: 160, enemies: [
            { type: 'blob', x: 112, y: 320 },
            { type: 'goblin', x: 144, y: 352 }
          ], chest: { x: 128, y: 288, tier: 1 } },
          // Room 5: Dark Chamber
          { id: 'F1_R5', name: 'Lorong Bayangan', x: 48, y: 496, w: 160, h: 128, enemies: [
            { type: 'blob', x: 128, y: 544 }
          ]},
          // Room 6: Exit Stairway
          { id: 'F1_R6', name: 'Tangga Menuju Kedalaman', x: 288, y: 496, w: 176, h: 144, enemies: [
            { type: 'goblin', x: 336, y: 528 },
            { type: 'goblin', x: 400, y: 560 }
          ], isDownStairs: true }
        ],
        corridors: [
          { x: 208, y: 80, w: 80, h: 48 },   // Room 1 to 2
          { x: 352, y: 176, w: 48, h: 80 },  // Room 2 to 3
          { x: 208, y: 304, w: 80, h: 48 },  // Room 3 to 4
          { x: 96, y: 416, w: 48, h: 80 },   // Room 4 to 5
          { x: 208, y: 528, w: 80, h: 48 }   // Room 5 to 6
        ]
      };
    } else if (floor === 2) {
      return {
        floorNumber: 2,
        name: 'Lantai 2: Makam Obsidian',
        playerSpawn: { x: 112, y: 112 },
        bounds: { minX: 48, minY: 48, maxX: 480, maxY: 672 },
        rooms: [
          { id: 'F2_R1', name: 'Makam Kerangka', x: 48, y: 48, w: 160, h: 144, enemies: [
            { type: 'skeleton', x: 144, y: 112 }
          ]},
          { id: 'F2_R2', name: 'Aula Pilar Bawah', x: 288, y: 48, w: 192, h: 144, enemies: [
            { type: 'skeleton', x: 352, y: 96 },
            { type: 'goblin', x: 416, y: 112 }
          ]},
          { id: 'F2_R3', name: 'Kamar Pembantaian', x: 288, y: 272, w: 192, h: 176, enemies: [
            { type: 'skeleton', x: 336, y: 320 },
            { type: 'goblin', x: 400, y: 352 },
            { type: 'blob', x: 368, y: 384 }
          ]},
          { id: 'F2_R4', name: 'Ruang Harta Tersembunyi', x: 48, y: 272, w: 160, h: 160, enemies: [], chest: { x: 128, y: 320, tier: 2 } },
          { id: 'F2_R5', name: 'Gerbang Segel Ruin Warden', x: 48, y: 512, w: 240, h: 160, enemies: [
            { type: 'skeleton', x: 128, y: 560 },
            { type: 'goblin', x: 192, y: 576 }
          ], isDownStairs: true }
        ],
        corridors: [
          { x: 208, y: 96, w: 80, h: 48 },
          { x: 352, y: 192, w: 48, h: 80 },
          { x: 208, y: 320, w: 80, h: 48 },
          { x: 96, y: 432, w: 48, h: 80 }
        ]
      };
    } else {
      // Floor 3: Boss Arena (Ruin Warden)
      return {
        floorNumber: 3,
        name: 'Lantai 3: Ruang Inti Emberdeep',
        playerSpawn: { x: 112, y: 112 },
        bounds: { minX: 48, minY: 48, maxX: 592, maxY: 336 },
        rooms: [
          { id: 'F3_R1', name: 'Serambi Kristal Purba', x: 48, y: 48, w: 144, h: 144, enemies: [] },
          { id: 'F3_R2', name: 'Singgasana Ruin Warden', x: 272, y: 48, w: 320, h: 288, enemies: [
            { type: 'boss', x: 416, y: 192 }
          ]}
        ],
        corridors: [
          { x: 192, y: 96, w: 80, h: 48 }
        ]
      };
    }
  }
}
