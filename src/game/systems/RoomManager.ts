import Phaser from 'phaser';
import { RoomDef } from './MapLoader';
import { EventBus } from '../events';

export class RoomManager {
  private currentRoom: RoomDef | null = null;
  private clearedRooms = new Set<string>();

  public checkPlayerRoom(playerX: number, playerY: number, rooms: RoomDef[], floorNumber: number): RoomDef | null {
    for (const r of rooms) {
      if (
        playerX >= r.x &&
        playerX <= r.x + r.w &&
        playerY >= r.y &&
        playerY <= r.y + r.h
      ) {
        if (this.currentRoom?.id !== r.id) {
          this.currentRoom = r;
          EventBus.emitEvent('room:changed', { floor: floorNumber, roomName: r.name });
        }
        return r;
      }
    }
    return null;
  }

  public isRoomCleared(roomId: string): boolean {
    return this.clearedRooms.has(roomId);
  }

  public markRoomCleared(roomId: string): void {
    if (!this.clearedRooms.has(roomId)) {
      this.clearedRooms.add(roomId);
      EventBus.emitEvent('room:cleared', undefined as unknown as void);
    }
  }

  public getCurrentRoom(): RoomDef | null {
    return this.currentRoom;
  }
}
