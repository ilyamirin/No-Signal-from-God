import Phaser from "phaser";
import type { EnemyState, PlayerState, Vec2, WeaponState } from "../../game/simulation/types";
import { actorDepthFor, LIVE_ACTOR_DEPTH } from "./actorDepth";

type ActorState = Pick<
  PlayerState | EnemyState,
  "id" | "position" | "velocity" | "facing" | "alive" | "head" | "weaponId"
> & {
  kind?: EnemyState["kind"];
  archetype?: EnemyState["archetype"];
  animation?: PlayerState["animation"] | EnemyState["animation"];
};

export type ActorRig = {
  sprite: Phaser.GameObjects.Sprite;
  textureKey: string;
  previousLoadedRounds?: number;
  recoilMs: number;
  shootMs: number;
  walkTimerMs: number;
  currentAnimation?: string;
};

const FRAME_SIZE = 48;
const SHEET_COLUMNS = 6;
const WALK_SPEED_THRESHOLD = 8;
const RECOIL_DURATION_MS = 110;
const SHOOT_ANIMATION_MS = 95;
const ACTOR_SCALE = 1.42;

const velocityDirectionIndex = (velocity: Vec2): number | undefined => {
  if (Math.hypot(velocity.x, velocity.y) < WALK_SPEED_THRESHOLD) {
    return undefined;
  }
  return Math.round(Phaser.Math.Angle.Normalize(Math.atan2(velocity.y, velocity.x)) / (Math.PI / 4));
};

const enemyTextureKey = (enemy: EnemyState): string => {
  if (enemy.archetype === "monster_melee") {
    return "scifi-enemy-run";
  }
  return "scifi-enemy-idle";
};

const playerAnimationFor = (actor: ActorState, weapon: WeaponState | undefined, moving: boolean, shooting: boolean): string => {
  const weaponKind = weapon?.kind ?? actor.animation?.weaponKind ?? "pistol";
  const suffix = weaponKind === "rifle" ? "rifle" : "pistol";

  if (actor.animation?.intent === "reload") {
    return `scifi-player-reload-${suffix}`;
  }
  if (shooting || actor.animation?.intent === "shoot") {
    return `scifi-player-shoot-${suffix}`;
  }
  return moving ? `scifi-player-run-${suffix}` : `scifi-player-idle-${suffix}`;
};

const animationFor = (actor: ActorState, weapon: WeaponState | undefined, moving: boolean, shooting: boolean): string => {
  if (!actor.alive) {
    return actor.id === "player" ? "scifi-player-death" : "scifi-enemy-death";
  }

  if (actor.id === "player") {
    return playerAnimationFor(actor, weapon, moving, shooting);
  }

  if (shooting) {
    return "scifi-enemy-attack";
  }
  return moving ? (actor.kind === "rush" ? "scifi-enemy-run" : "scifi-enemy-walk") : "scifi-enemy-idle";
};

const createActorSprite = (
  scene: Phaser.Scene,
  textureKey: string,
  position: Vec2,
): ActorRig => {
  const sprite = scene.add
    .sprite(position.x, position.y, textureKey, 0)
    .setOrigin(0.5)
    .setScale(ACTOR_SCALE)
    .setDepth(LIVE_ACTOR_DEPTH);

  return {
    sprite,
    textureKey,
    recoilMs: 0,
    shootMs: 0,
    walkTimerMs: 0,
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
      rig.shootMs = SHOOT_ANIMATION_MS;
    }
    rig.previousLoadedRounds = weapon.loadedRounds;
  }
  rig.recoilMs = Math.max(0, rig.recoilMs - deltaMs);
  rig.shootMs = Math.max(0, rig.shootMs - deltaMs);
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
    actor.id === "player"
      ? `scifi-player-idle-${weapon?.kind === "rifle" ? "rifle" : "pistol"}`
      : enemyTextureKey(actor as EnemyState);
  syncTextureKey(rig, nextTextureKey);
  syncRecoil(rig, weapon, deltaMs);

  const velocityDirection = velocityDirectionIndex(actor.velocity);
  const moving = actor.alive && velocityDirection !== undefined;
  if (moving) {
    rig.walkTimerMs += deltaMs;
  } else {
    rig.walkTimerMs = 0;
  }

  const recoilProgress = rig.recoilMs / RECOIL_DURATION_MS;
  const recoilDistance = recoilProgress * 5;
  const facing = actor.facing;
  const recoilX = -Math.cos(facing) * recoilDistance;
  const recoilY = -Math.sin(facing) * recoilDistance;
  const walkBob = moving ? Math.sin(rig.walkTimerMs / 70) * 1.5 : 0;
  const nextAnimation = animationFor(actor, weapon, moving, rig.shootMs > 0 || (actor.animation?.lastShotMs ?? 0) > 0);

  if (rig.currentAnimation !== nextAnimation) {
    rig.currentAnimation = nextAnimation;
    rig.sprite.play(nextAnimation, true);
  }

  rig.sprite.setPosition(actor.position.x + recoilX, actor.position.y + recoilY + walkBob);
  rig.sprite.setRotation(actor.facing);
  rig.sprite.setDepth(actorDepthFor(actor.alive));
  rig.sprite.setAlpha(actor.alive ? 1 : 0.76);
  rig.sprite.setTint(actor.alive ? 0xffffff : 0xa0d65f);
};

export const createPlayerRig = (
  scene: Phaser.Scene,
  player: PlayerState,
): ActorRig =>
  createActorSprite(scene, "scifi-player-idle-pistol", player.position);

export const createEnemyRig = (
  scene: Phaser.Scene,
  enemy: EnemyState,
): ActorRig =>
  createActorSprite(scene, enemyTextureKey(enemy), enemy.position);

export const actorSheetDebug = {
  frameSize: FRAME_SIZE,
  sheetColumns: SHEET_COLUMNS,
};
