import type { EnemyState } from "../simulation/types";

const animation = { intent: "idle" as const, weaponKind: undefined, moving: false, speed: 0, lastShotMs: 0 };

export const createEnemies = (): EnemyState[] => [
  { id: "enemy-security-guard", kind: "ranged", archetype: "humanoid_ranged", head: "human", position: { x: 1040, y: 1020 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "security-guard-pistol", attackCooldownMs: 12000, animation: { ...animation, weaponKind: "pistol" } },
  { id: "enemy-newsroom-guard-left", kind: "ranged", archetype: "humanoid_ranged", head: "crt", position: { x: 460, y: 610 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI / 2, health: 1, alive: true, weaponId: "newsroom-guard-left-pistol", attackCooldownMs: 12000, animation: { ...animation, weaponKind: "pistol" } },
  { id: "enemy-newsroom-guard-right", kind: "ranged", archetype: "humanoid_ranged", head: "human", position: { x: 955, y: 565 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "newsroom-guard-right-pistol", attackCooldownMs: 12000, animation: { ...animation, weaponKind: "pistol" } },
  { id: "enemy-server-rifle", kind: "ranged", archetype: "humanoid_ranged", head: "crt", position: { x: 1815, y: 1000 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "server-guard-rifle", attackCooldownMs: 12000, animation: { ...animation, weaponKind: "rifle" } },
  { id: "enemy-control-pistol", kind: "ranged", archetype: "humanoid_ranged", head: "human", position: { x: 1710, y: 455 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "control-guard-pistol", attackCooldownMs: 12000, animation: { ...animation, weaponKind: "pistol" } },
  { id: "enemy-control-rifle", kind: "ranged", archetype: "humanoid_ranged", head: "crt", position: { x: 1870, y: 610 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "control-guard-rifle", attackCooldownMs: 12000, animation: { ...animation, weaponKind: "rifle" } },
  { id: "enemy-newsroom-melee", kind: "rush", archetype: "monster_melee", head: "human", position: { x: 760, y: 665 }, velocity: { x: 0, y: 0 }, radius: 17, facing: Math.PI / 2, health: 1, alive: true, attackCooldownMs: 12000, animation: { ...animation } },
  { id: "enemy-server-melee", kind: "rush", archetype: "monster_melee", head: "crt", position: { x: 1325, y: 1180 }, velocity: { x: 0, y: 0 }, radius: 17, facing: -Math.PI / 2, health: 1, alive: true, attackCooldownMs: 12000, animation: { ...animation } },
];
