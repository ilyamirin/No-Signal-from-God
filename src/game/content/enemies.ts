import type { EnemyAiState, EnemyAiStateName, EnemyState, Vec2 } from "../simulation/types";

const animation = { intent: "idle" as const, weaponKind: undefined, moving: false, speed: 0, lastShotMs: 0 };

const defaultPerception = {
  visionRange: 520,
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

export const createEnemies = (): EnemyState[] => [
  { id: "enemy-security-guard", kind: "ranged", archetype: "humanoid_ranged", head: "human", position: { x: 1040, y: 1020 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "security-guard-pistol", attackCooldownMs: 12000, ai: ai("posted", "security", { post: post({ x: 1040, y: 1020 }, Math.PI) }), animation: { ...animation, weaponKind: "pistol" } },
  { id: "enemy-newsroom-guard-left", kind: "ranged", archetype: "humanoid_ranged", head: "crt", position: { x: 460, y: 610 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI / 2, health: 1, alive: true, weaponId: "newsroom-guard-left-pistol", attackCooldownMs: 12000, ai: ai("talking", "newsroom", { conversationId: "newsroom-floor-chat" }), animation: { ...animation, weaponKind: "pistol" } },
  { id: "enemy-newsroom-guard-right", kind: "ranged", archetype: "humanoid_ranged", head: "human", position: { x: 955, y: 565 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "newsroom-guard-right-pistol", attackCooldownMs: 12000, ai: ai("talking", "newsroom", { conversationId: "newsroom-floor-chat" }), animation: { ...animation, weaponKind: "pistol" } },
  { id: "enemy-server-rifle", kind: "ranged", archetype: "humanoid_ranged", head: "crt", position: { x: 1815, y: 1000 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "server-guard-rifle", attackCooldownMs: 12000, ai: ai("patrolling", "serverArchive", { route: [{ x: 1815, y: 1000 }, { x: 1500, y: 1000 }, { x: 1815, y: 1000 }], routeIndex: 1 }), animation: { ...animation, weaponKind: "rifle" } },
  { id: "enemy-control-pistol", kind: "ranged", archetype: "humanoid_ranged", head: "human", position: { x: 1710, y: 455 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "control-guard-pistol", attackCooldownMs: 12000, ai: ai("posted", "broadcastControl", { post: post({ x: 1710, y: 455 }, Math.PI) }), animation: { ...animation, weaponKind: "pistol" } },
  { id: "enemy-control-rifle", kind: "ranged", archetype: "humanoid_ranged", head: "crt", position: { x: 1870, y: 610 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "control-guard-rifle", attackCooldownMs: 12000, ai: ai("posted", "broadcastControl", { post: post({ x: 1870, y: 610 }, Math.PI) }), animation: { ...animation, weaponKind: "rifle" } },
  { id: "enemy-newsroom-melee", kind: "rush", archetype: "monster_melee", head: "human", position: { x: 760, y: 665 }, velocity: { x: 0, y: 0 }, radius: 17, facing: Math.PI / 2, health: 1, alive: true, attackCooldownMs: 0, ai: ai("patrolling", "newsroom", { route: [{ x: 760, y: 665 }, { x: 620, y: 665 }, { x: 760, y: 665 }], routeIndex: 1, perception: { visionRange: 420, visionAngle: Math.PI * 0.72, hearingRange: 620 } }), animation: { ...animation } },
  { id: "enemy-server-melee", kind: "rush", archetype: "monster_melee", head: "crt", position: { x: 1325, y: 1180 }, velocity: { x: 0, y: 0 }, radius: 17, facing: -Math.PI / 2, health: 1, alive: true, attackCooldownMs: 0, ai: ai("posted", "serverArchive", { post: post({ x: 1325, y: 1180 }, -Math.PI / 2), perception: { visionRange: 390, visionAngle: Math.PI * 0.72, hearingRange: 620 } }), animation: { ...animation } },
];
