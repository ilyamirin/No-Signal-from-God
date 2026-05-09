import type { EnemyState } from "../simulation/types";

export const createEnemies = (): EnemyState[] => [
  { id: "enemy-ranged-anchor", kind: "ranged", head: "crt", position: { x: 940, y: 235 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "enemy-ranged-anchor-pistol", attackCooldownMs: 2500 },
  { id: "enemy-ranged-control", kind: "ranged", head: "human", position: { x: 245, y: 142 }, velocity: { x: 0, y: 0 }, radius: 18, facing: 0, health: 1, alive: true, weaponId: "enemy-ranged-control-pistol", attackCooldownMs: 2700 },
  { id: "enemy-ranged-green", kind: "ranged", head: "crt", position: { x: 1130, y: 528 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "enemy-ranged-green-pistol", attackCooldownMs: 2900 },
  { id: "enemy-rush-left", kind: "rush", head: "human", position: { x: 230, y: 520 }, velocity: { x: 0, y: 0 }, radius: 17, facing: 0, health: 1, alive: true, attackCooldownMs: 2100 },
  { id: "enemy-rush-desk", kind: "rush", head: "crt", position: { x: 680, y: 230 }, velocity: { x: 0, y: 0 }, radius: 17, facing: Math.PI / 2, health: 1, alive: true, attackCooldownMs: 2100 },
  { id: "enemy-rush-floor", kind: "rush", head: "human", position: { x: 690, y: 620 }, velocity: { x: 0, y: 0 }, radius: 17, facing: -Math.PI / 2, health: 1, alive: true, attackCooldownMs: 2100 },
];
