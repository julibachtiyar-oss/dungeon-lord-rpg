import Phaser from 'phaser';

export type EventPayloads = {
  'game:start': void;
  'game:pause': boolean;
  'game:restart': void;
  'game:state': 'title' | 'playing' | 'paused' | 'gameover' | 'victory';
  'player:stats': { hp: number; maxHp: number; level: number; xp: number; nextXp: number; potions: number };
  'player:gold': number;
  'player:skills': { 
    cleaveReady: boolean; 
    cleaveCooldownProgress: number; 
    bulwarkReady: boolean; 
    bulwarkCooldownProgress: number; 
    dashReady: boolean; 
    dashCooldownProgress: number; 
  };
  'player:damaged': { damage: number; currentHp: number };
  'player:levelup': void;
  'boss:defeated': void;
  'room:cleared': void;
  'boss:hp': { current: number; max: number; phase: number; name: string } | null;
  'story:dialogue': { id: number; speaker: string; text: string; options?: string[] } | null;
  'story:choice': string;
  'room:changed': { floor: number; roomName: string };
  'input:joystick': { x: number; y: number; active: boolean };
  'input:button': { action: 'attack' | 'cleave' | 'bulwark' | 'dash' | 'potion' };
  'game:victory': { timeSec: number; kills: number; damageTaken: number; gold: number; rank: string };
  'game:over': { floor: number };
};

class TypedEventBus extends Phaser.Events.EventEmitter {
  emitEvent<K extends keyof EventPayloads>(event: K, payload: EventPayloads[K]): boolean {
    return this.emit(event, payload);
  }

  onEvent<K extends keyof EventPayloads>(event: K, fn: (payload: EventPayloads[K]) => void, context?: unknown): this {
    return this.on(event, fn, context);
  }

  offEvent<K extends keyof EventPayloads>(event: K, fn?: (payload: EventPayloads[K]) => void, context?: unknown): this {
    return this.off(event, fn, context);
  }
}

export const EventBus = new TypedEventBus();
