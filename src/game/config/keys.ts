// Centralized String Keys for EMBERDEEP
// Violating AGENTS.md Rule 5 to use string literals is forbidden.

export const enum SceneKey {
  Boot = 'BootScene',
  Preload = 'PreloadScene',
  Title = 'TitleScene',
  Game = 'GameScene',
  UIBridge = 'UIBridgeScene'
}

export const enum TextureKey {
  Atlas = 'dungeon',
  Hero = 'knight',
  Blob = 'swampy',
  Goblin = 'goblin',
  Skeleton = 'skelet',
  Boss = 'big_demon',
  Particle = 'particle_square',
  Shockwave = 'shockwave_ring',
  Slash = 'slash_arc',
  Arrow = 'arrow',
  Chest = 'chest',
  Coin = 'coin',
  Potion = 'flask_red',
  FloorSpikes = 'spikes'
}

export const enum AnimKey {
  HeroIdle = 'knight_idle',
  HeroRun = 'knight_run',
  HeroHit = 'knight_hit',
  BlobIdle = 'blob_idle',
  BlobJump = 'blob_jump',
  GoblinIdle = 'goblin_idle',
  GoblinRun = 'goblin_run',
  SkeletonIdle = 'skeleton_idle',
  SkeletonRun = 'skeleton_run',
  BossIdle = 'boss_idle',
  BossRun = 'boss_run'
}

export const enum EventKey {
  // Game lifecycle
  GameStart = 'game:start',
  GamePause = 'game:pause',
  GameResume = 'game:resume',
  GameRestart = 'game:restart',
  GameState = 'game:state',
  GameVictory = 'game:victory',
  GameOver = 'game:over',

  // Player stats & updates
  PlayerStats = 'player:stats',
  PlayerDamaged = 'player:damaged',
  PlayerHealed = 'player:healed',
  PlayerLevelUp = 'player:levelup',
  PlayerGold = 'player:gold',
  PlayerSkills = 'player:skills',

  // Boss updates
  BossSpawn = 'boss:spawn',
  BossHp = 'boss:hp',
  BossDefeated = 'boss:defeated',

  // Story & World
  StoryDialogue = 'story:dialogue',
  RoomChanged = 'room:changed',
  RoomCleared = 'room:cleared',

  // Input from React HUD to Phaser
  InputJoystick = 'input:joystick',
  InputButton = 'input:button',
  InputSkill = 'input:skill'
}
