import type { EnemyState } from "../simulation/types";

const animation = { intent: "idle" as const, weaponKind: undefined, moving: false, speed: 0, lastShotMs: 0 };

export const createEnemies = (): EnemyState[] => [
  { id: "enemy-ranged-anchor", kind: "ranged", archetype: "humanoid_ranged", head: "crt", position: { x: 940, y: 235 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "enemy-ranged-anchor-pistol", attackCooldownMs: 12000, animation: { ...animation, weaponKind: "pistol" } },
  { id: "enemy-ranged-control", kind: "ranged", archetype: "humanoid_ranged", head: "human", position: { x: 245, y: 142 }, velocity: { x: 0, y: 0 }, radius: 18, facing: 0, health: 1, alive: true, weaponId: "enemy-ranged-control-pistol", attackCooldownMs: 12000, animation: { ...animation, weaponKind: "pistol" } },
  { id: "enemy-ranged-green", kind: "ranged", archetype: "humanoid_ranged", head: "crt", position: { x: 1130, y: 528 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "enemy-ranged-green-pistol", attackCooldownMs: 12000, animation: { ...animation, weaponKind: "pistol" } },
  { id: "enemy-ranged-office", kind: "ranged", archetype: "humanoid_ranged", head: "human", position: { x: 520, y: 625 }, velocity: { x: 0, y: 0 }, radius: 18, facing: -Math.PI / 2, health: 1, alive: true, weaponId: "enemy-ranged-office-rifle", attackCooldownMs: 12000, animation: { ...animation, weaponKind: "rifle" } },
  { id: "enemy-rush-left", kind: "rush", archetype: "monster_melee", head: "human", position: { x: 230, y: 520 }, velocity: { x: 0, y: 0 }, radius: 17, facing: 0, health: 1, alive: true, attackCooldownMs: 12000, animation: { ...animation } },
  { id: "enemy-rush-desk", kind: "rush", archetype: "monster_melee", head: "crt", position: { x: 680, y: 230 }, velocity: { x: 0, y: 0 }, radius: 17, facing: Math.PI / 2, health: 1, alive: true, attackCooldownMs: 12000, animation: { ...animation } },
  { id: "enemy-rush-floor", kind: "rush", archetype: "monster_melee", head: "human", position: { x: 690, y: 620 }, velocity: { x: 0, y: 0 }, radius: 17, facing: -Math.PI / 2, health: 1, alive: true, attackCooldownMs: 12000, animation: { ...animation } },
];
