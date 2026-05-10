import Phaser from "phaser";
import type { EnemyState, PlayerState, Vec2, WeaponState } from "../../game/simulation/types";

type ActorState = Pick<
  PlayerState | EnemyState,
  "id" | "position" | "velocity" | "facing" | "alive" | "head" | "weaponId"
> & {
  kind?: EnemyState["kind"];
};

type ActorSheetDefinition = {
  key: string;
  url: string;
};

export type ActorRig = {
  sprite: Phaser.GameObjects.Sprite;
  shadow: Phaser.GameObjects.Ellipse;
  textureKey: string;
  previousLoadedRounds?: number;
  recoilMs: number;
  walkTimerMs: number;
  moveDirection: number;
};

const FRAME_SIZE = 96;
const SHEET_COLUMNS = 16;
const AIM_DIRECTIONS = 8;
const MOVE_DIRECTIONS = 8;
const WALK_FRAMES = 4;
const WALK_SPEED_THRESHOLD = 8;
const RECOIL_DURATION_MS = 110;
const ACTOR_SCALE = 0.82;

const actorSheets: ActorSheetDefinition[] = [
  {
    key: "baked-player-crt-suit-pistol",
    url: new URL("../../assets/generated/baked-actors/player-crt-suit-pistol.png", import.meta.url).href,
  },
  {
    key: "baked-enemy-human-guard-pistol",
    url: new URL("../../assets/generated/baked-actors/enemy-human-guard-pistol.png", import.meta.url).href,
  },
  {
    key: "baked-enemy-crt-guard-pistol",
    url: new URL("../../assets/generated/baked-actors/enemy-crt-guard-pistol.png", import.meta.url).href,
  },
  {
    key: "baked-enemy-human-rush",
    url: new URL("../../assets/generated/baked-actors/enemy-human-rush.png", import.meta.url).href,
  },
];

export const loadBakedActorSheets = (scene: Phaser.Scene): void => {
  for (const sheet of actorSheets) {
    scene.load.spritesheet(sheet.key, sheet.url, {
      frameWidth: FRAME_SIZE,
      frameHeight: FRAME_SIZE,
    });
  }
};

const normalizeDirectionIndex = (index: number): number =>
  Phaser.Math.Wrap(index, 0, AIM_DIRECTIONS);

const angleToDirectionIndex = (angle: number): number => {
  const northBasedAngle = Phaser.Math.Angle.Normalize(angle + Math.PI / 2);
  return normalizeDirectionIndex(Math.round(northBasedAngle / (Math.PI / 4)));
};

const velocityDirectionIndex = (velocity: Vec2): number | undefined => {
  if (Math.hypot(velocity.x, velocity.y) < WALK_SPEED_THRESHOLD) {
    return undefined;
  }
  return angleToDirectionIndex(Math.atan2(velocity.y, velocity.x));
};

const frameIndexFor = (aimDirection: number, moveDirection: number, walkFrame: number): number =>
  aimDirection * MOVE_DIRECTIONS * WALK_FRAMES + moveDirection * WALK_FRAMES + walkFrame;

const enemyTextureKey = (enemy: EnemyState): string => {
  if (enemy.kind === "rush") {
    return "baked-enemy-human-rush";
  }
  return enemy.head === "crt" ? "baked-enemy-crt-guard-pistol" : "baked-enemy-human-guard-pistol";
};

const createActorSprite = (
  scene: Phaser.Scene,
  textureKey: string,
  position: Vec2,
): ActorRig => {
  const shadow = scene.add
    .ellipse(position.x, position.y + 15, 52, 30, 0x030303, 0.58)
    .setDepth(23);
  const sprite = scene.add
    .sprite(position.x, position.y, textureKey, 0)
    .setOrigin(0.5)
    .setScale(ACTOR_SCALE)
    .setDepth(25);

  return {
    sprite,
    shadow,
    textureKey,
    recoilMs: 0,
    walkTimerMs: 0,
    moveDirection: 0,
  };
};

const syncRecoil = (
  rig: ActorRig,
  weapon: WeaponState | undefined,
  deltaMs: number,
): void => {
  if (weapon) {
    if (rig.previousLoadedRounds !== undefined && weapon.loadedRounds < rig.previousLoadedRounds) {
      rig.recoilMs = RECOIL_DURATION_MS;
    }
    rig.previousLoadedRounds = weapon.loadedRounds;
  }
  rig.recoilMs = Math.max(0, rig.recoilMs - deltaMs);
};

const syncTextureKey = (rig: ActorRig, nextTextureKey: string): void => {
  if (rig.textureKey === nextTextureKey) {
    return;
  }
  rig.textureKey = nextTextureKey;
  rig.sprite.setTexture(nextTextureKey);
};

export const syncActorRig = (
  rig: ActorRig,
  actor: ActorState,
  weapon: WeaponState | undefined,
  deltaMs: number,
): void => {
  const nextTextureKey =
    actor.id === "player" ? "baked-player-crt-suit-pistol" : enemyTextureKey(actor as EnemyState);
  syncTextureKey(rig, nextTextureKey);
  syncRecoil(rig, weapon, deltaMs);

  const aimDirection = angleToDirectionIndex(actor.facing);
  const velocityDirection = velocityDirectionIndex(actor.velocity);
  const moving = actor.alive && velocityDirection !== undefined;
  if (moving) {
    rig.moveDirection = velocityDirection;
    rig.walkTimerMs += deltaMs;
  } else {
    rig.moveDirection = aimDirection;
    rig.walkTimerMs = 0;
  }

  const walkFrame = moving ? Math.floor(rig.walkTimerMs / 85) % WALK_FRAMES : 0;
  const recoilProgress = rig.recoilMs / RECOIL_DURATION_MS;
  const recoilDistance = recoilProgress * 5;
  const facing = actor.facing;
  const recoilX = -Math.cos(facing) * recoilDistance;
  const recoilY = -Math.sin(facing) * recoilDistance;

  rig.sprite.setFrame(frameIndexFor(aimDirection, rig.moveDirection, walkFrame));
  rig.sprite.setPosition(actor.position.x + recoilX, actor.position.y + recoilY);
  rig.sprite.setRotation(actor.alive ? 0 : actor.facing + Math.PI / 2 + 0.75);
  rig.sprite.setAlpha(actor.alive ? 1 : 0.58);
  rig.sprite.setTint(actor.alive ? 0xffffff : 0x9b1d25);

  rig.shadow.setPosition(actor.position.x, actor.position.y + 15);
  rig.shadow.setVisible(actor.alive);
};

export const createPlayerRig = (
  scene: Phaser.Scene,
  player: PlayerState,
): ActorRig =>
  createActorSprite(scene, "baked-player-crt-suit-pistol", player.position);

export const createEnemyRig = (
  scene: Phaser.Scene,
  enemy: EnemyState,
): ActorRig =>
  createActorSprite(scene, enemyTextureKey(enemy), enemy.position);

export const actorSheetDebug = {
  frameSize: FRAME_SIZE,
  sheetColumns: SHEET_COLUMNS,
  aimDirections: AIM_DIRECTIONS,
  moveDirections: MOVE_DIRECTIONS,
  walkFrames: WALK_FRAMES,
};
