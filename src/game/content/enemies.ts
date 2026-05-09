import type { EnemyState } from "../simulation/types";

export const createEnemies = (): EnemyState[] => [
  { id: "enemy-ranged-anchor", kind: "ranged", head: "crt", position: { x: 1010, y: 210 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "enemy-ranged-anchor-pistol", attackCooldownMs: 350 },
  { id: "enemy-ranged-control", kind: "ranged", head: "human", position: { x: 380, y: 180 }, velocity: { x: 0, y: 0 }, radius: 18, facing: 0, health: 1, alive: true, weaponId: "enemy-ranged-control-pistol", attackCooldownMs: 550 },
  { id: "enemy-ranged-green", kind: "ranged", head: "crt", position: { x: 1140, y: 560 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "enemy-ranged-green-pistol", attackCooldownMs: 650 },
  { id: "enemy-rush-left", kind: "rush", head: "human", position: { x: 260, y: 540 }, velocity: { x: 0, y: 0 }, radius: 17, facing: 0, health: 1, alive: true, attackCooldownMs: 0 },
  { id: "enemy-rush-desk", kind: "rush", head: "crt", position: { x: 690, y: 235 }, velocity: { x: 0, y: 0 }, radius: 17, facing: Math.PI / 2, health: 1, alive: true, attackCooldownMs: 0 },
  { id: "enemy-rush-floor", kind: "rush", head: "human", position: { x: 820, y: 585 }, velocity: { x: 0, y: 0 }, radius: 17, facing: -Math.PI / 2, health: 1, alive: true, attackCooldownMs: 0 },
];
