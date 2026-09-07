import Phaser from 'phaser';
import { EventBus } from '../events';

export interface InputState {
  move: { x: number; y: number };
  attack: boolean;
  cleave: boolean;
  bulwark: boolean;
  dash: boolean;
  potion: boolean;
}

export class InputSystem {
  private scene: Phaser.Scene;
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private wasdKeys: { [key: string]: Phaser.Input.Keyboard.Key } = {};

  // Touch state
  private touchMove = { x: 0, y: 0 };
  private touchAttack = false;
  private touchCleave = false;
  private touchBulwark = false;
  private touchDash = false;
  private touchPotion = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboard();
    this.setupTouchListeners();
  }

  private setupKeyboard(): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.wasdKeys = this.scene.input.keyboard.addKeys({
        up: Phaser.Input.Keyboard.KeyCodes.W,
        down: Phaser.Input.Keyboard.KeyCodes.S,
        left: Phaser.Input.Keyboard.KeyCodes.A,
        right: Phaser.Input.Keyboard.KeyCodes.D,
        attack: Phaser.Input.Keyboard.KeyCodes.J,
        cleave: Phaser.Input.Keyboard.KeyCodes.K,
        bulwark: Phaser.Input.Keyboard.KeyCodes.L,
        dash: Phaser.Input.Keyboard.KeyCodes.SPACE,
        potion: Phaser.Input.Keyboard.KeyCodes.P
      }) as { [key: string]: Phaser.Input.Keyboard.Key };
    }
  }

  private setupTouchListeners(): void {
    EventBus.onEvent('input:joystick', (payload) => {
      this.touchMove.x = payload.x;
      this.touchMove.y = payload.y;
    });

    EventBus.onEvent('input:button', (payload) => {
      if (payload.action === 'attack') this.touchAttack = true;
      else if (payload.action === 'cleave') this.touchCleave = true;
      else if (payload.action === 'bulwark') this.touchBulwark = true;
      else if (payload.action === 'dash') this.touchDash = true;
      else if (payload.action === 'potion') this.touchPotion = true;
    });
  }

  public getState(): InputState {
    let mx = 0;
    let my = 0;

    // Keyboard Check
    if (this.cursors) {
      if (this.cursors.left.isDown || this.wasdKeys.left?.isDown) mx -= 1;
      if (this.cursors.right.isDown || this.wasdKeys.right?.isDown) mx += 1;
      if (this.cursors.up.isDown || this.wasdKeys.up?.isDown) my -= 1;
      if (this.cursors.down.isDown || this.wasdKeys.down?.isDown) my += 1;
    }

    // Touch Check (takes precedence if active)
    if (this.touchMove.x !== 0 || this.touchMove.y !== 0) {
      mx = this.touchMove.x;
      my = this.touchMove.y;
    }

    // Normalize movement
    const len = Math.hypot(mx, my);
    if (len > 1) {
      mx /= len;
      my /= len;
    }

    // Action buttons
    const attack = this.touchAttack || Boolean(this.wasdKeys.attack?.isDown);
    const cleave = this.touchCleave || Boolean(this.wasdKeys.cleave?.isDown);
    const bulwark = this.touchBulwark || Boolean(this.wasdKeys.bulwark?.isDown);
    const dash = this.touchDash || Boolean(this.cursors?.space?.isDown || this.wasdKeys.dash?.isDown);
    const potion = this.touchPotion || Boolean(this.wasdKeys.potion?.isDown);

    // Consume touch triggers
    this.touchAttack = false;
    this.touchCleave = false;
    this.touchBulwark = false;
    this.touchDash = false;
    this.touchPotion = false;

    return {
      move: { x: mx, y: my },
      attack,
      cleave,
      bulwark,
      dash,
      potion
    };
  }
}
