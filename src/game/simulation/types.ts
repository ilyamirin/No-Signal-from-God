export type Vec2 = {
  x: number;
  y: number;
};

export type Box = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type HeadType = "crt" | "human";
export type EnemyKind = "ranged" | "rush";
export type ActorArchetype = "humanoid_ranged" | "monster_melee";
export type GameStatus = "playing" | "dead" | "victory";
export type WeaponKind = "pistol" | "rifle";
export type AnimationIntent =
  | "idle"
  | "walk"
  | "run"
  | "shoot"
  | "reload"
  | "switch"
  | "pain"
  | "attack"
  | "death";

export type Rect = Box & {
  id: string;
  blocksMovement: boolean;
  blocksBullets: boolean;
};

export type CollisionChannel = "movement" | "bullets" | "vision" | "sound";

export type CollisionChannels = Record<CollisionChannel, boolean>;

export type Collider =
  | {
      id: string;
      kind: "rect";
      rect: Box;
      channels: CollisionChannels;
    }
  | {
      id: string;
      kind: "door-segment";
      start: Vec2;
      end: Vec2;
      thickness: number;
      channels: CollisionChannels;
    };

export type PropCollisionClass =
  | "softCover"
  | "hardCover"
  | "visualDecor"
  | "interactivePickup"
  | "thinBarrier";

export type RoomTheme = "tvStudio" | "office" | "lab" | "server" | "medical" | "utility";

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
  kind: WeaponKind;
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
  animation: ActorAnimationState;
};

export type EnemyState = ActorBase & {
  kind: EnemyKind;
  archetype: ActorArchetype;
  head: HeadType;
  weaponId?: string;
  attackCooldownMs: number;
  animation: ActorAnimationState;
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
  kind: "muzzle" | "blood" | "casing" | "impact" | "blood-death" | "bullet-puff";
  position: Vec2;
  rotation: number;
  ttlMs: number;
  frame?: number;
};

export type DecalState = {
  id: string;
  kind: "enemy-blood" | "player-blood" | "rubbish";
  position: Vec2;
  rotation: number;
  frame: number;
  scale: number;
};

export type ActorAnimationState = {
  intent: AnimationIntent;
  weaponKind?: WeaponKind;
  moving: boolean;
  speed: number;
  lastShotMs: number;
};

export type PropEntity = {
  id: string;
  catalogKey: string;
  position: Vec2;
  rotation: number;
  frame: number;
  scale: number;
  collider?: Collider;
};

export type DoorState = {
  id: string;
  assetKey: "scifi-door" | "scifi-door-heavy" | "scifi-door-small";
  hinge: Vec2;
  length: number;
  thickness: number;
  closedAngle: number;
  openAngle: number;
  minAngle: number;
  maxAngle: number;
  angle: number;
  targetAngle: number;
  angularVelocity: number;
  state: "closed" | "opening" | "open" | "closing";
  blocksBullets: boolean;
};

export type DroppedWeaponState = {
  id: string;
  weaponId: string;
  kind: WeaponKind;
  position: Vec2;
  velocity: Vec2;
  rotation: number;
  angularVelocity: number;
  pickupCooldownMs: number;
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
  decals: DecalState[];
  props: PropEntity[];
  doors: DoorState[];
  droppedWeapons: DroppedWeaponState[];
  colliders: Collider[];
  interaction?: InteractionState;
  weapons: Record<string, WeaponState>;
  score: number;
  status: GameStatus;
  engaged: boolean;
  elapsedMs: number;
  nextId: number;
};

export type InteractionState = {
  kind: "pickup";
  targetId: string;
  label: string;
};
