import type { EnemyState } from "../simulation/types";

export const createEnemies = (): EnemyState[] => [
  { id: "enemy-ranged-anchor", kind: "ranged", head: "crt", position: { x: 890, y: 380 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "enemy-ranged-anchor-pistol", attackCooldownMs: 2500 },
  { id: "enemy-ranged-control", kind: "ranged", head: "human", position: { x: 310, y: 170 }, velocity: { x: 0, y: 0 }, radius: 18, facing: 0, health: 1, alive: true, weaponId: "enemy-ranged-control-pistol", attackCooldownMs: 2700 },
  { id: "enemy-ranged-green", kind: "ranged", head: "crt", position: { x: 1000, y: 625 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "enemy-ranged-green-pistol", attackCooldownMs: 2900 },
  { id: "enemy-rush-left", kind: "rush", head: "human", position: { x: 240, y: 500 }, velocity: { x: 0, y: 0 }, radius: 17, facing: 0, health: 1, alive: true, attackCooldownMs: 2100 },
  { id: "enemy-rush-desk", kind: "rush", head: "crt", position: { x: 760, y: 400 }, velocity: { x: 0, y: 0 }, radius: 17, facing: Math.PI / 2, health: 1, alive: true, attackCooldownMs: 2100 },
  { id: "enemy-rush-floor", kind: "rush", head: "human", position: { x: 700, y: 620 }, velocity: { x: 0, y: 0 }, radius: 17, facing: -Math.PI / 2, health: 1, alive: true, attackCooldownMs: 2100 },
];
