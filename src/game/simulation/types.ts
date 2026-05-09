export type Vec2 = {
  x: number;
  y: number;
};

export type HeadType = "crt" | "human";
export type EnemyKind = "ranged" | "rush";
export type GameStatus = "playing" | "dead" | "victory";

export type Rect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  blocksMovement: boolean;
  blocksBullets: boolean;
};

export type ArenaDecor =
  | "news-desk"
  | "crt-wall"
  | "camera"
  | "studio-light"
  | "cable"
  | "server-rack"
  | "green-screen"
  | "control-panel";

export type DecorItem = {
  id: string;
  kind: ArenaDecor;
  position: Vec2;
  rotation: number;
};

export type WeaponState = {
  id: string;
  label: string;
  loadedRounds: number;
  magazineSize: number;
  reserveRounds: number;
  fireCooldownMs: number;
  reloadDelayMs: number;
  cooldownRemainingMs: number;
  reloadRemainingMs: number;
  bulletSpeed: number;
  damage: number;
};

export type ActorBase = {
  id: string;
  position: Vec2;
  velocity: Vec2;
  radius: number;
  facing: number;
  health: number;
  alive: boolean;
};

export type PlayerState = ActorBase & {
  head: "crt";
  outfit: "suit";
  weaponId: string;
  invulnerableMs: number;
};

export type EnemyState = ActorBase & {
  kind: EnemyKind;
  head: HeadType;
  weaponId?: string;
  attackCooldownMs: number;
};

export type BulletState = {
  id: string;
  ownerId: string;
  position: Vec2;
  velocity: Vec2;
  damage: number;
  ttlMs: number;
};

export type FxState = {
  id: string;
  kind: "muzzle" | "blood" | "casing" | "impact";
  position: Vec2;
  rotation: number;
  ttlMs: number;
};

export type ArenaState = {
  width: number;
  height: number;
  obstacles: Rect[];
  decor: DecorItem[];
};

export type GameState = {
  arena: ArenaState;
  player: PlayerState;
  enemies: EnemyState[];
  bullets: BulletState[];
  fx: FxState[];
  weapons: Record<string, WeaponState>;
  score: number;
  status: GameStatus;
  engaged: boolean;
  elapsedMs: number;
  nextId: number;
};
