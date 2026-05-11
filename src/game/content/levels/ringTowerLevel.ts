import type {
  Collider,
  DoorState,
  DroppedWeaponState,
  EnemyAiState,
  EnemyAiStateName,
  EnemyState,
  PropEntity,
  Vec2,
  WeaponState,
} from "../../simulation/types";
import { createWeapon } from "../weapons";
import { ringTowerLayout } from "./ringTowerLayout";
import type { LevelDefinition } from "./types";

const animation = { intent: "idle" as const, weaponKind: undefined, moving: false, speed: 0, lastShotMs: 0 };

const defaultPerception = {
  visionRange: 500,
  visionAngle: Math.PI * 0.62,
  hearingRange: 560,
};

const ai = (
  state: EnemyAiStateName,
  alertGroupId: string,
  options: Partial<EnemyAiState> = {},
): EnemyAiState => ({
  state,
  alertGroupId,
  perception: defaultPerception,
  suspicionMs: 0,
  cooldownMs: 0,
  ...options,
});

const post = (position: Vec2, facing: number) => ({
  position,
  facing,
});

const door = (
  id: string,
  hinge: { x: number; y: number },
  closedAngle: number,
  minAngle: number,
  maxAngle: number,
): DoorState => ({
  id,
  assetKey: "scifi-door",
  hinge,
  length: 56,
  thickness: 7,
  closedAngle,
  openAngle: 0,
  minAngle,
  maxAngle,
  angle: closedAngle,
  targetAngle: closedAngle,
  angularVelocity: 0,
  state: "closed",
  blocksBullets: true,
});

const enemy = (
  id: string,
  archetype: EnemyState["archetype"],
  x: number,
  y: number,
  weaponId?: string,
  aiState: EnemyAiState = ai("posted", "ring-tower", { post: post({ x, y }, Math.PI) }),
): EnemyState => ({
  id,
  kind: archetype === "monster_melee" ? "rush" : "ranged",
  archetype,
  head: id.includes("crt") ? "crt" : "human",
  position: { x, y },
  velocity: { x: 0, y: 0 },
  radius: archetype === "monster_melee" ? 17 : 18,
  facing: Math.PI,
  health: 1,
  alive: true,
  weaponId,
  attackCooldownMs: archetype === "monster_melee" ? 0 : 1000,
  ai: aiState,
  animation: { ...animation, weaponKind: weaponId?.includes("rifle") ? "rifle" : weaponId ? "pistol" : undefined },
});

const dropped = (id: string, weaponId: string, kind: "pistol" | "rifle", x: number, y: number): DroppedWeaponState => ({
  id,
  weaponId,
  kind,
  position: { x, y },
  velocity: { x: 0, y: 0 },
  rotation: kind === "rifle" ? -0.35 : 0.25,
  angularVelocity: 0,
  pickupCooldownMs: 0,
});

const propChannels = (catalogKey: string): Collider["channels"] => {
  const soft = { movement: true, bullets: false, vision: false, sound: false };
  const hard = { movement: true, bullets: true, vision: true, sound: true };
  const visual = { movement: false, bullets: false, vision: false, sound: false };
  const hardKeys = new Set(["laboratory_device", "display_1", "display_2"]);
  const visualKeys = new Set(["keyboard_mouse", "wall_lamp", "lamps", "tv_remote"]);
  return visualKeys.has(catalogKey) ? visual : hardKeys.has(catalogKey) ? hard : soft;
};

const prop = (
  id: string,
  catalogKey: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: { frame?: number; scale?: number; rotation?: number; collider?: boolean } = {},
): PropEntity => {
  const channels = propChannels(catalogKey);
  const collider: Collider | undefined =
    options.collider === false || !channels.movement
      ? undefined
      : {
          id: `prop-${id}`,
          kind: "rect",
          rect: { x: x - width / 2, y: y - height / 2, width, height },
          channels,
        };

  return {
    id,
    catalogKey,
    position: { x, y },
    rotation: options.rotation ?? 0,
    frame: options.frame ?? 0,
    scale: options.scale ?? 1,
    collider,
  };
};

export const createRingTowerLevel = (): LevelDefinition => {
  const weapons: Record<string, WeaponState> = {
    "ring-floor-first-pistol": createWeapon("ring-floor-first-pistol", "pistol"),
    "ring-talk-guard-pistol": createWeapon("ring-talk-guard-pistol", "pistol"),
    "ring-control-rifle": createWeapon("ring-control-rifle", "rifle"),
    "ring-backstage-pistol": createWeapon("ring-backstage-pistol", "pistol"),
    "ring-final-left-rifle": createWeapon("ring-final-left-rifle", "rifle"),
    "ring-final-right-pistol": createWeapon("ring-final-right-pistol", "pistol"),
    "ring-floor-control-rifle": createWeapon("ring-floor-control-rifle", "rifle"),
  };
  const finalEnemyIds = ["ring-final-left-crt", "ring-final-right", "ring-final-melee-a", "ring-final-melee-b"];

  return {
    id: "ring-tower",
    label: "Ring TV Tower",
    arena: {
      width: ringTowerLayout.size.width,
      height: ringTowerLayout.size.height,
      floorRegions: ringTowerLayout.floorRegions,
      obstacles: ringTowerLayout.obstacles,
      decor: [],
      background: {
        cityTextureKey: "ring-tower-city",
        cityParallax: 0.35,
        towerParallax: 0.65,
      },
    },
    playerSpawn: { ...ringTowerLayout.playerSpawn },
    playerLoadout: { kind: "unarmed" },
    weapons,
    doors: [
      door("ring-lift-door-left", { x: 1244, y: 820 }, Math.PI / 2, 0, Math.PI),
      door("ring-lift-door-right", { x: 1356, y: 820 }, Math.PI / 2, 0, Math.PI),
      door("ring-lobby-reception-upper", { x: 1040, y: 805 }, Math.PI, Math.PI / 2, Math.PI),
      door("ring-lobby-reception-lower", { x: 1040, y: 917 }, Math.PI, Math.PI / 2, Math.PI),
      door("ring-reception-studio-left", { x: 560, y: 600 }, Math.PI / 2, 0, Math.PI),
      door("ring-reception-studio-right", { x: 672, y: 600 }, Math.PI / 2, 0, Math.PI),
      door("ring-studio-control-upper", { x: 1150, y: 340 }, 0, -Math.PI / 2, Math.PI / 2),
      door("ring-studio-control-lower", { x: 1150, y: 452 }, 0, -Math.PI / 2, Math.PI / 2),
      door("ring-backstage-final-left", { x: 1660, y: 1120 }, Math.PI / 2, 0, Math.PI),
      door("ring-backstage-final-right", { x: 1772, y: 1120 }, Math.PI / 2, 0, Math.PI),
    ],
    props: [
      prop("ring-reception-desk", "table_1", 500, 735, 210, 70, { frame: 1, scale: 2.55 }),
      prop("ring-reception-couch-a", "couch_1", 440, 980, 118, 52, { frame: 1, scale: 1.85 }),
      prop("ring-reception-couch-b", "couch_2", 720, 980, 118, 52, { scale: 1.85 }),
      prop("ring-reception-cooler", "cooler", 850, 735, 38, 62, { scale: 1.4 }),
      prop("ring-reception-guard-body-table", "table_4", 650, 850, 84, 48, { scale: 1.8 }),
      prop("ring-talk-host-desk", "table_5", 720, 350, 176, 64, { scale: 2.25 }),
      prop("ring-talk-guest-couch", "couch_1", 740, 465, 118, 52, { frame: 1, scale: 2 }),
      prop("ring-talk-camera-left", "display_1", 435, 505, 94, 46, { scale: 1.8, rotation: 0.3 }),
      prop("ring-talk-camera-right", "display_1", 1040, 500, 94, 46, { scale: 1.8, rotation: -0.4 }),
      prop("ring-talk-light-a", "lamps", 450, 270, 40, 40, { frame: 1, scale: 1.4, collider: false }),
      prop("ring-talk-light-b", "lamps", 1010, 270, 40, 40, { frame: 2, scale: 1.4, collider: false }),
      prop("ring-control-main-console", "table_10", 1510, 360, 180, 64, { scale: 2 }),
      prop("ring-control-monitor-a", "tv", 1340, 255, 84, 48, { frame: 1, scale: 1.75 }),
      prop("ring-control-monitor-b", "tv", 1460, 255, 84, 48, { scale: 1.75 }),
      prop("ring-control-monitor-c", "tv", 1580, 255, 84, 48, { frame: 1, scale: 1.75 }),
      prop("ring-control-server-a", "laboratory_device", 1740, 430, 62, 62, { scale: 1.85 }),
      prop("ring-control-server-b", "laboratory_device", 1740, 520, 62, 62, { scale: 1.85 }),
      prop("ring-backstage-box-a", "box_big", 1800, 820, 58, 58, { scale: 1.05, rotation: 0.2 }),
      prop("ring-backstage-box-b", "box_small", 1900, 980, 34, 34, { scale: 1.1, rotation: -0.25 }),
      prop("ring-backstage-fake-wall", "display_2", 2080, 820, 94, 46, { scale: 1.8, rotation: Math.PI / 2 }),
      prop("ring-backstage-crt-prop", "tv", 2020, 1010, 84, 48, { scale: 1.6, rotation: -0.45 }),
      prop("ring-final-round-stage", "table_11", 1280, 1470, 200, 80, { scale: 2.5 }),
      prop("ring-final-host-desk", "table_5", 1280, 1370, 176, 64, { scale: 2.25 }),
      prop("ring-final-screen-left", "tv", 930, 1305, 84, 48, { frame: 1, scale: 1.9 }),
      prop("ring-final-screen-right", "tv", 1640, 1305, 84, 48, { scale: 1.9 }),
      prop("ring-final-camera-left", "display_1", 970, 1600, 94, 46, { scale: 1.8, rotation: -0.2 }),
      prop("ring-final-camera-right", "display_1", 1600, 1600, 94, 46, { scale: 1.8, rotation: 0.25 }),
    ],
    enemies: [
      enemy(
        "ring-talk-guard",
        "humanoid_ranged",
        980,
        390,
        "ring-talk-guard-pistol",
        ai("talking", "talkStudio", { conversationId: "talk-show-floor-chat" }),
      ),
      enemy(
        "ring-talk-melee",
        "monster_melee",
        540,
        500,
        undefined,
        ai("talking", "talkStudio", {
          conversationId: "talk-show-floor-chat",
          perception: { visionRange: 390, visionAngle: Math.PI * 0.72, hearingRange: 620 },
        }),
      ),
      enemy(
        "ring-control-rifle-crt",
        "humanoid_ranged",
        1690,
        380,
        "ring-control-rifle",
        ai("posted", "controlRoom", { post: post({ x: 1690, y: 380 }, Math.PI) }),
      ),
      enemy(
        "ring-control-melee",
        "monster_melee",
        1390,
        525,
        undefined,
        ai("posted", "controlRoom", {
          post: post({ x: 1390, y: 525 }, -Math.PI / 2),
          perception: { visionRange: 390, visionAngle: Math.PI * 0.72, hearingRange: 620 },
        }),
      ),
      enemy(
        "ring-backstage-pistol",
        "humanoid_ranged",
        2120,
        925,
        "ring-backstage-pistol",
        ai("patrolling", "backstage", {
          route: [{ x: 2120, y: 925 }, { x: 1900, y: 925 }, { x: 2120, y: 925 }],
          routeIndex: 1,
        }),
      ),
      enemy(
        "ring-backstage-melee",
        "monster_melee",
        1800,
        1000,
        undefined,
        ai("posted", "backstage", {
          post: post({ x: 1800, y: 1000 }, Math.PI),
          perception: { visionRange: 390, visionAngle: Math.PI * 0.72, hearingRange: 620 },
        }),
      ),
      enemy(
        "ring-final-left-crt",
        "humanoid_ranged",
        1010,
        1385,
        "ring-final-left-rifle",
        ai("posted", "finalStudio", { post: post({ x: 1010, y: 1385 }, Math.PI / 2) }),
      ),
      enemy(
        "ring-final-right",
        "humanoid_ranged",
        1590,
        1390,
        "ring-final-right-pistol",
        ai("posted", "finalStudio", { post: post({ x: 1590, y: 1390 }, Math.PI / 2) }),
      ),
      enemy(
        "ring-final-melee-a",
        "monster_melee",
        1040,
        1600,
        undefined,
        ai("patrolling", "finalStudio", {
          route: [{ x: 1040, y: 1600 }, { x: 1180, y: 1600 }, { x: 1040, y: 1600 }],
          routeIndex: 1,
          perception: { visionRange: 420, visionAngle: Math.PI * 0.72, hearingRange: 660 },
        }),
      ),
      enemy(
        "ring-final-melee-b",
        "monster_melee",
        1540,
        1605,
        undefined,
        ai("patrolling", "finalStudio", {
          route: [{ x: 1540, y: 1605 }, { x: 1400, y: 1605 }, { x: 1540, y: 1605 }],
          routeIndex: 1,
          perception: { visionRange: 420, visionAngle: Math.PI * 0.72, hearingRange: 660 },
        }),
      ),
    ],
    droppedWeapons: [
      dropped("ring-drop-first-pistol", "ring-floor-first-pistol", "pistol", 650, 850),
      dropped("ring-drop-control-rifle", "ring-floor-control-rifle", "rifle", 1510, 535),
    ],
    victory: {
      kind: "finalFightThenExit",
      finalEnemyIds,
      exitTrigger: ringTowerLayout.exitLiftTrigger,
    },
  };
};
