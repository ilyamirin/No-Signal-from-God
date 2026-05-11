import type {
  Collider,
  DecorItem,
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

const decor = (id: string, kind: DecorItem["kind"], x: number, y: number, rotation = 0): DecorItem => ({
  id,
  kind,
  position: { x, y },
  rotation,
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
      // Reception dressing is decomposed from the approved A concept into gameplay-safe pieces.
      decor: [
        decor("ring-reception-crt-wall", "crt-wall", 398, 1108),
        decor("ring-reception-console-cables", "cable", 512, 1228, 0.25),
        decor("ring-reception-cable-coil", "cable-coil", 430, 1308),
        decor("ring-reception-papers-a", "paper-stack", 690, 1188, -0.15),
        decor("ring-reception-papers-b", "paper-stack", 548, 1470, 0.1),
        decor("ring-reception-neon-west-a", "neon-strip", 334, 1182, Math.PI / 2),
        decor("ring-reception-neon-west-b", "neon-strip", 334, 1534, Math.PI / 2),
        decor("ring-reception-neon-south", "neon-strip", 540, 1648, 0),
      ],
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
      door("ring-lift-door-upper", { x: 1460, y: 1280 }, Math.PI / 2, 0, Math.PI),
      door("ring-lift-door-lower", { x: 1460, y: 1392 }, -Math.PI / 2, -Math.PI, 0),
      door("ring-lobby-reception-upper", { x: 780, y: 1258 }, Math.PI / 2, 0, Math.PI),
      door("ring-reception-corridor-left", { x: 540, y: 1050 }, 0, -Math.PI / 2, Math.PI / 2),
      door("ring-reception-corridor-right", { x: 652, y: 1050 }, Math.PI, Math.PI / 2, Math.PI * 1.5),
      door("ring-reception-studio-left", { x: 1040, y: 790 }, 0, -Math.PI / 2, Math.PI / 2),
      door("ring-reception-studio-right", { x: 1152, y: 790 }, Math.PI, Math.PI / 2, Math.PI * 1.5),
      door("ring-studio-control-upper", { x: 1460, y: 500 }, Math.PI / 2, 0, Math.PI),
      door("ring-studio-control-lower", { x: 1460, y: 612 }, -Math.PI / 2, -Math.PI, 0),
      door("ring-control-tech-upper", { x: 2220, y: 520 }, Math.PI / 2, 0, Math.PI),
      door("ring-control-tech-lower", { x: 2220, y: 632 }, -Math.PI / 2, -Math.PI, 0),
      door("ring-tech-backstage-left", { x: 2380, y: 1000 }, 0, -Math.PI / 2, Math.PI / 2),
      door("ring-tech-backstage-right", { x: 2492, y: 1000 }, Math.PI, Math.PI / 2, Math.PI * 1.5),
      door("ring-backstage-lobby-upper", { x: 2220, y: 1320 }, Math.PI / 2, 0, Math.PI),
      door("ring-backstage-lobby-lower", { x: 2220, y: 1432 }, -Math.PI / 2, -Math.PI, 0),
      door("ring-equipment-entry-left", { x: 910, y: 1910 }, 0, -Math.PI / 2, Math.PI / 2),
      door("ring-equipment-entry-right", { x: 1022, y: 1910 }, Math.PI, Math.PI / 2, Math.PI * 1.5),
      door("ring-final-entry-left", { x: 1520, y: 1910 }, 0, -Math.PI / 2, Math.PI / 2),
      door("ring-final-entry-right", { x: 1632, y: 1910 }, Math.PI, Math.PI / 2, Math.PI * 1.5),
    ],
    props: [
      prop("ring-lobby-couch-north-a", "couch_1", 1020, 1580, 118, 52, { frame: 1, scale: 1.8 }),
      prop("ring-lobby-couch-north-b", "couch_2", 1890, 1780, 118, 52, { scale: 1.8 }),
      prop("ring-lobby-table-a", "table_4", 1220, 1570, 84, 48, { scale: 1.6 }),
      prop("ring-lobby-table-b", "table_4", 1790, 1780, 84, 48, { scale: 1.6 }),
      prop("ring-lobby-plant-a", "plants", 910, 1715, 38, 38, { frame: 2, scale: 1.35 }),
      prop("ring-lobby-plant-b", "plants", 2160, 1725, 38, 38, { scale: 1.35 }),
      prop("ring-lobby-water-cooler", "cooler", 920, 1286, 38, 62, { scale: 1.35 }),
      prop("ring-lobby-info-tv", "tv", 1260, 1288, 84, 48, { frame: 1, scale: 1.6 }),

      prop("ring-reception-desk", "table_10", 500, 1196, 180, 62, { scale: 2.05 }),
      prop("ring-reception-computer", "computer", 466, 1178, 46, 38, { frame: 5, scale: 1.55, collider: false }),
      prop("ring-reception-console-tv", "tv", 410, 1168, 84, 48, { frame: 1, scale: 1.45, collider: false }),
      prop("ring-reception-side-display", "display_2", 574, 1164, 42, 42, { frame: 1, scale: 1.45, collider: false }),
      prop("ring-reception-cooler", "cooler", 724, 1158, 38, 62, { scale: 1.35 }),
      prop("ring-reception-couch-west", "couch_2", 394, 1494, 118, 52, { scale: 1.85, rotation: Math.PI / 2 }),
      prop("ring-reception-couch-south", "couch_1", 548, 1592, 118, 52, { frame: 1, scale: 1.85 }),
      prop("ring-reception-chair", "chair_1", 706, 1538, 38, 36, { frame: 1, scale: 1.55, rotation: -Math.PI / 2 }),
      prop("ring-reception-coffee-table", "table_4", 548, 1468, 84, 48, { scale: 1.6 }),
      prop("ring-reception-plant-a", "plants", 386, 1120, 38, 38, { frame: 2, scale: 1.35 }),
      prop("ring-reception-plant-b", "plants", 398, 1604, 38, 38, { scale: 1.35 }),
      prop("ring-reception-plant-c", "plants", 724, 1600, 38, 38, { frame: 1, scale: 1.35 }),
      prop("ring-reception-trash", "trash_can_2", 724, 1452, 36, 36, { scale: 1.25 }),

      prop("ring-talk-host-desk", "table_5", 1080, 440, 176, 64, { scale: 2.35 }),
      prop("ring-talk-guest-couch", "couch_1", 1080, 615, 118, 52, { frame: 1, scale: 2 }),
      prop("ring-talk-camera-left", "display_1", 820, 665, 94, 46, { scale: 1.8, rotation: 0.25 }),
      prop("ring-talk-camera-right", "display_1", 1325, 665, 94, 46, { scale: 1.8, rotation: -0.35 }),
      prop("ring-talk-tv-wall-a", "tv", 880, 350, 84, 48, { frame: 1, scale: 1.75 }),
      prop("ring-talk-tv-wall-b", "tv", 1005, 350, 84, 48, { scale: 1.75 }),
      prop("ring-talk-light-a", "lamps", 810, 410, 40, 40, { frame: 1, scale: 1.4, collider: false }),
      prop("ring-talk-light-b", "lamps", 1330, 410, 40, 40, { frame: 2, scale: 1.4, collider: false }),

      prop("ring-control-main-console", "table_10", 1820, 440, 180, 64, { scale: 2 }),
      prop("ring-control-side-console", "table_1", 2035, 600, 210, 70, { frame: 1, scale: 2.1 }),
      prop("ring-control-monitor-a", "tv", 1650, 350, 84, 48, { frame: 1, scale: 1.75 }),
      prop("ring-control-monitor-b", "tv", 1765, 350, 84, 48, { scale: 1.75 }),
      prop("ring-control-monitor-c", "tv", 1880, 350, 84, 48, { frame: 1, scale: 1.75 }),
      prop("ring-control-computer", "computer", 1820, 405, 46, 38, { frame: 6, scale: 1.55, collider: false }),
      prop("ring-control-server-a", "laboratory_device", 2130, 455, 62, 62, { scale: 1.8 }),
      prop("ring-control-server-b", "laboratory_device", 2130, 545, 62, 62, { scale: 1.8 }),

      prop("ring-tech-server-a", "laboratory_device", 2375, 650, 62, 62, { scale: 1.85 }),
      prop("ring-tech-server-b", "laboratory_device", 2535, 650, 62, 62, { scale: 1.85 }),
      prop("ring-tech-box-a", "box_big", 2560, 820, 58, 58, { scale: 1.05, rotation: 0.2 }),
      prop("ring-tech-trash", "trash_can_2", 2295, 815, 36, 36, { scale: 1.4 }),

      prop("ring-backstage-box-a", "box_big", 2360, 1135, 58, 58, { scale: 1.05, rotation: 0.2 }),
      prop("ring-backstage-box-b", "box_small", 2545, 1410, 34, 34, { scale: 1.1, rotation: -0.25 }),
      prop("ring-backstage-fake-wall", "display_2", 2620, 1185, 94, 46, { scale: 1.8, rotation: Math.PI / 2 }),
      prop("ring-backstage-crt-prop", "tv", 2465, 1450, 84, 48, { scale: 1.6, rotation: -0.45 }),
      prop("ring-backstage-light", "lamps", 2300, 1415, 40, 40, { frame: 2, scale: 1.4, collider: false }),

      prop("ring-equipment-shelf-a", "shelf_laboratory", 690, 2070, 70, 70, { scale: 1.35 }),
      prop("ring-equipment-box-a", "box_big", 940, 2190, 58, 58, { scale: 1.05, rotation: 0.25 }),
      prop("ring-equipment-box-b", "box_small", 805, 2250, 34, 34, { scale: 1.1, rotation: -0.2 }),
      prop("ring-equipment-display", "display_1", 610, 2250, 94, 46, { scale: 1.6, rotation: 0.4 }),

      prop("ring-final-round-stage", "table_11", 1700, 2225, 200, 80, { scale: 2.5 }),
      prop("ring-final-host-desk", "table_5", 1700, 2095, 176, 64, { scale: 2.35 }),
      prop("ring-final-screen-left", "tv", 1360, 2000, 84, 48, { frame: 1, scale: 1.9 }),
      prop("ring-final-screen-right", "tv", 2050, 2000, 84, 48, { scale: 1.9 }),
      prop("ring-final-camera-left", "display_1", 1390, 2290, 94, 46, { scale: 1.8, rotation: -0.2 }),
      prop("ring-final-camera-right", "display_1", 2030, 2295, 94, 46, { scale: 1.8, rotation: 0.25 }),
      prop("ring-final-light-a", "lamps", 1290, 2140, 40, 40, { frame: 1, scale: 1.45, collider: false }),
      prop("ring-final-light-b", "lamps", 2110, 2140, 40, 40, { frame: 2, scale: 1.45, collider: false }),
    ],
    enemies: [
      enemy(
        "ring-talk-guard",
        "humanoid_ranged",
        1290,
        520,
        "ring-talk-guard-pistol",
        ai("talking", "talkStudio", { conversationId: "talk-show-floor-chat" }),
      ),
      enemy(
        "ring-talk-melee",
        "monster_melee",
        850,
        645,
        undefined,
        ai("talking", "talkStudio", {
          conversationId: "talk-show-floor-chat",
          perception: { visionRange: 390, visionAngle: Math.PI * 0.72, hearingRange: 620 },
        }),
      ),
      enemy(
        "ring-control-rifle-crt",
        "humanoid_ranged",
        2060,
        530,
        "ring-control-rifle",
        ai("posted", "controlRoom", { post: post({ x: 2060, y: 530 }, Math.PI) }),
      ),
      enemy(
        "ring-control-melee",
        "monster_melee",
        1650,
        660,
        undefined,
        ai("posted", "controlRoom", {
          post: post({ x: 1650, y: 660 }, -Math.PI / 2),
          perception: { visionRange: 390, visionAngle: Math.PI * 0.72, hearingRange: 620 },
        }),
      ),
      enemy(
        "ring-backstage-pistol",
        "humanoid_ranged",
        2540,
        1190,
        "ring-backstage-pistol",
        ai("patrolling", "backstage", {
          route: [{ x: 2540, y: 1190 }, { x: 2350, y: 1400 }, { x: 2540, y: 1190 }],
          routeIndex: 1,
        }),
      ),
      enemy(
        "ring-backstage-melee",
        "monster_melee",
        2380,
        1385,
        undefined,
        ai("posted", "backstage", {
          post: post({ x: 2380, y: 1385 }, Math.PI),
          perception: { visionRange: 390, visionAngle: Math.PI * 0.72, hearingRange: 620 },
        }),
      ),
      enemy(
        "ring-final-left-crt",
        "humanoid_ranged",
        1410,
        2115,
        "ring-final-left-rifle",
        ai("posted", "finalStudio", { post: post({ x: 1410, y: 2115 }, Math.PI / 2) }),
      ),
      enemy(
        "ring-final-right",
        "humanoid_ranged",
        2010,
        2115,
        "ring-final-right-pistol",
        ai("posted", "finalStudio", { post: post({ x: 2010, y: 2115 }, Math.PI / 2) }),
      ),
      enemy(
        "ring-final-melee-a",
        "monster_melee",
        1440,
        2295,
        undefined,
        ai("patrolling", "finalStudio", {
          route: [{ x: 1440, y: 2295 }, { x: 1580, y: 2295 }, { x: 1440, y: 2295 }],
          routeIndex: 1,
          perception: { visionRange: 420, visionAngle: Math.PI * 0.72, hearingRange: 660 },
        }),
      ),
      enemy(
        "ring-final-melee-b",
        "monster_melee",
        1975,
        2295,
        undefined,
        ai("patrolling", "finalStudio", {
          route: [{ x: 1975, y: 2295 }, { x: 1835, y: 2295 }, { x: 1975, y: 2295 }],
          routeIndex: 1,
          perception: { visionRange: 420, visionAngle: Math.PI * 0.72, hearingRange: 660 },
        }),
      ),
    ],
    droppedWeapons: [
      dropped("ring-drop-first-pistol", "ring-floor-first-pistol", "pistol", 615, 1360),
      dropped("ring-drop-control-rifle", "ring-floor-control-rifle", "rifle", 1840, 650),
    ],
    victory: {
      kind: "finalFightThenExit",
      finalEnemyIds,
      exitTrigger: ringTowerLayout.exitLiftTrigger,
    },
  };
};
