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
  private keys: { [key: string]: Phaser.Input.Keyboard.Key } = {};

  // Touch & Pointer state
  private touchMove = { x: 0, y: 0 };
  private touchAttack = false;
  private touchCleave = false;
  private touchBulwark = false;
  private touchDash = false;
  private touchPotion = false;
  private pointerAttack = false;
  private pointerDash = false;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;
    this.setupKeyboard();
    this.setupPointer();
    this.setupTouchListeners();
  }

  private setupKeyboard(): void {
    if (this.scene.input.keyboard) {
      this.cursors = this.scene.input.keyboard.createCursorKeys();
      this.keys = this.scene.input.keyboard.addKeys({
        w: Phaser.Input.Keyboard.KeyCodes.W,
        s: Phaser.Input.Keyboard.KeyCodes.S,
        a: Phaser.Input.Keyboard.KeyCodes.A,
        d: Phaser.Input.Keyboard.KeyCodes.D,
        j: Phaser.Input.Keyboard.KeyCodes.J,
        k: Phaser.Input.Keyboard.KeyCodes.K,
        l: Phaser.Input.Keyboard.KeyCodes.L,
        q: Phaser.Input.Keyboard.KeyCodes.Q,
        e: Phaser.Input.Keyboard.KeyCodes.E,
        r: Phaser.Input.Keyboard.KeyCodes.R,
        f: Phaser.Input.Keyboard.KeyCodes.F,
        p: Phaser.Input.Keyboard.KeyCodes.P,
        one: Phaser.Input.Keyboard.KeyCodes.ONE,
        two: Phaser.Input.Keyboard.KeyCodes.TWO,
        three: Phaser.Input.Keyboard.KeyCodes.THREE,
        shift: Phaser.Input.Keyboard.KeyCodes.SHIFT,
        space: Phaser.Input.Keyboard.KeyCodes.SPACE,
        enter: Phaser.Input.Keyboard.KeyCodes.ENTER
      }) as { [key: string]: Phaser.Input.Keyboard.Key };
    }
  }

  private setupPointer(): void {
    // Mouse clicks on canvas
    this.scene.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (pointer.rightButtonDown()) {
        this.pointerDash = true;
      } else {
        this.pointerAttack = true;
      }
    });
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

    // Keyboard Check (WASD + Arrow Keys)
    if (this.cursors) {
      if (this.cursors.left.isDown || this.keys.a?.isDown) mx -= 1;
      if (this.cursors.right.isDown || this.keys.d?.isDown) mx += 1;
      if (this.cursors.up.isDown || this.keys.w?.isDown) my -= 1;
      if (this.cursors.down.isDown || this.keys.s?.isDown) my += 1;
    }

    // Touch / Joystick Check (takes precedence if active)
    if (this.touchMove.x !== 0 || this.touchMove.y !== 0) {
      mx = this.touchMove.x;
      my = this.touchMove.y;
    }

    // Normalize diagonal movement
    const len = Math.hypot(mx, my);
    if (len > 1) {
      mx /= len;
      my /= len;
    }

    // Action buttons (multiple PC shortcuts + touch + mouse)
    const attack = 
      this.touchAttack || 
      this.pointerAttack ||
      Boolean(this.keys.j?.isDown || this.keys.f?.isDown || this.keys.enter?.isDown || (this.keys.space?.isDown && !this.keys.shift?.isDown));

    const cleave = 
      this.touchCleave || 
      Boolean(this.keys.k?.isDown || this.keys.q?.isDown || this.keys.one?.isDown);

    const bulwark = 
      this.touchBulwark || 
      Boolean(this.keys.l?.isDown || this.keys.e?.isDown || this.keys.two?.isDown);

    const dash = 
      this.touchDash || 
      this.pointerDash ||
      Boolean(this.keys.shift?.isDown || this.keys.three?.isDown);

    const potion = 
      this.touchPotion || 
      Boolean(this.keys.p?.isDown || this.keys.r?.isDown);

    // Consume triggers
    this.touchAttack = false;
    this.touchCleave = false;
    this.touchBulwark = false;
    this.touchDash = false;
    this.touchPotion = false;
    this.pointerAttack = false;
    this.pointerDash = false;

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
