import { angleTo, clampToArena, distance, normalize, scale } from "../geometry";
import { blocksMovementAtCircle, hasLineOfSightThroughColliders } from "../collision";
import type { EnemyState, GameState, Vec2 } from "../types";
import { emitHeavyBlood } from "./death";
import { applyDoorPressure } from "./doors";
import { canEnemySeePlayer, hasFriendlyInLineOfFire, nearestHeardSound } from "./perception";
import { tryFireWeapon } from "./weapons";

const RUSH_SPEED = 185;
const RANGED_SPEED = 130;
const RANGED_MIN_DISTANCE = 210;
const RANGED_MAX_DISTANCE = 330;
const RUSH_STOP_DISTANCE = 58;
const RUSH_HIT_DISTANCE = 62;
const RUSH_DAMAGE_COOLDOWN_MS = 520;
const RANGED_ATTACK_COOLDOWN_MS = 520;
const PATROL_SPEED = 95;
const INVESTIGATE_SPEED = 120;
const ROUTE_POINT_DISTANCE = 16;
const SUSPICION_DELAY_MS = 260;
const DEFAULT_COOLDOWN_MS = 950;

const reduceTimer = (value: number, deltaMs: number): number => Math.max(0, value - deltaMs);

const canStandAt = (state: GameState, enemy: EnemyState, position: Vec2): boolean =>
  !blocksMovementAtCircle(state.colliders, position, enemy.radius);

const tryMoveEnemy = (state: GameState, enemy: EnemyState, desiredVelocity: Vec2, deltaMs: number): boolean => {
  if (Math.hypot(desiredVelocity.x, desiredVelocity.y) < 1) {
    return false;
  }

  const deltaSeconds = deltaMs / 1000;
  const nextPosition = clampToArena(
    {
      x: enemy.position.x + desiredVelocity.x * deltaSeconds,
      y: enemy.position.y + desiredVelocity.y * deltaSeconds,
    },
    enemy.radius,
    state.arena.width,
    state.arena.height,
  );

  applyDoorPressure(state, nextPosition, enemy.radius);

  if (canStandAt(state, enemy, nextPosition)) {
    enemy.position = nextPosition;
    enemy.velocity = desiredVelocity;
    return true;
  }

  return false;
};

const moveEnemy = (state: GameState, enemy: EnemyState, desiredVelocity: Vec2, deltaMs: number): void => {
  if (tryMoveEnemy(state, enemy, desiredVelocity, deltaMs)) {
    return;
  }

  const horizontal = { x: desiredVelocity.x, y: 0 };
  const vertical = { x: 0, y: desiredVelocity.y };
  const slideCandidates =
    Math.abs(desiredVelocity.x) >= Math.abs(desiredVelocity.y)
      ? [horizontal, vertical]
      : [vertical, horizontal];

  for (const candidate of slideCandidates) {
    if (tryMoveEnemy(state, enemy, candidate, deltaMs)) {
      return;
    }
  }

  enemy.velocity = { x: 0, y: 0 };
};

const moveTowardPoint = (state: GameState, enemy: EnemyState, target: Vec2, speed: number, deltaMs: number): boolean => {
  enemy.facing = angleTo(enemy.position, target);
  const toTarget = normalize({ x: target.x - enemy.position.x, y: target.y - enemy.position.y });
  moveEnemy(state, enemy, scale(toTarget, speed), deltaMs);
  return distance(enemy.position, target) <= ROUTE_POINT_DISTANCE;
};

const swingAtPlayer = (state: GameState, enemy: EnemyState): void => {
  enemy.attackCooldownMs = RUSH_DAMAGE_COOLDOWN_MS;
  enemy.animation.lastShotMs = 220;
  enemy.animation.intent = "attack";

  if (state.player.invulnerableMs === 0) {
    state.player.health -= 1;
    state.player.invulnerableMs = 700;
    emitHeavyBlood(state, state.player.position, enemy.facing, true);
  }
};

const enterCombat = (state: GameState, enemy: EnemyState, knownPosition = state.player.position): void => {
  enemy.ai.state = "combat";
  enemy.ai.knownPlayerPosition = { ...knownPosition };

  for (const ally of state.enemies) {
    if (!ally.alive || ally.id === enemy.id || ally.ai.alertGroupId !== enemy.ai.alertGroupId) {
      continue;
    }

    ally.ai.knownPlayerPosition = { ...knownPosition };
    if (canEnemySeePlayer(state, ally)) {
      ally.ai.state = "combat";
    } else if (ally.ai.state !== "combat") {
      ally.ai.state = "investigating";
    }
  }
};

const updatePerceptionAndAlerts = (state: GameState, enemy: EnemyState): void => {
  if (canEnemySeePlayer(state, enemy)) {
    enterCombat(state, enemy, state.player.position);
    return;
  }

  const sound = nearestHeardSound(state, enemy);
  if (sound && enemy.ai.state !== "combat") {
    enemy.ai.knownPlayerPosition = { ...sound.position };
    enemy.ai.state = "suspicious";
  }
};

const updateRushEnemy = (state: GameState, enemy: EnemyState, deltaMs: number): void => {
  let playerDistance = distance(enemy.position, state.player.position);
  const toPlayer = normalize({
    x: state.player.position.x - enemy.position.x,
    y: state.player.position.y - enemy.position.y,
  });
  enemy.facing = angleTo(enemy.position, state.player.position);
  if (playerDistance > RUSH_STOP_DISTANCE) {
    moveEnemy(state, enemy, scale(toPlayer, RUSH_SPEED), deltaMs);
    playerDistance = distance(enemy.position, state.player.position);
  } else {
    enemy.velocity = { x: 0, y: 0 };
  }

  if (
    state.player.alive &&
    enemy.attackCooldownMs === 0 &&
    playerDistance <= RUSH_HIT_DISTANCE
  ) {
    swingAtPlayer(state, enemy);
  }
};

const updateRangedEnemy = (state: GameState, enemy: EnemyState, deltaMs: number): void => {
  enemy.facing = angleTo(enemy.position, state.player.position);
  const playerDistance = distance(enemy.position, state.player.position);
  let desiredVelocity: Vec2 = { x: 0, y: 0 };

  if (playerDistance < RANGED_MIN_DISTANCE) {
    desiredVelocity = scale(normalize({ x: enemy.position.x - state.player.position.x, y: enemy.position.y - state.player.position.y }), RANGED_SPEED);
  } else if (playerDistance > RANGED_MAX_DISTANCE) {
    desiredVelocity = scale(normalize({ x: state.player.position.x - enemy.position.x, y: state.player.position.y - enemy.position.y }), RANGED_SPEED);
  }

  moveEnemy(state, enemy, desiredVelocity, deltaMs);

  if (
    enemy.weaponId &&
    enemy.attackCooldownMs === 0 &&
    hasLineOfSightThroughColliders(state.colliders, enemy.position, state.player.position, "vision") &&
    !hasFriendlyInLineOfFire(state, enemy, state.player.position)
  ) {
    const fired = tryFireWeapon(state, enemy.id, enemy.weaponId, enemy.position, enemy.facing);
    if (fired) {
      enemy.attackCooldownMs = RANGED_ATTACK_COOLDOWN_MS;
    }
  }
};

const updateNonCombatEnemy = (state: GameState, enemy: EnemyState, deltaMs: number): void => {
  if (enemy.ai.state === "posted") {
    enemy.velocity = { x: 0, y: 0 };
    if (enemy.ai.post) {
      enemy.facing = enemy.ai.post.facing;
    }
    return;
  }

  if (enemy.ai.state === "talking") {
    enemy.velocity = { x: 0, y: 0 };
    const partner = state.enemies.find(
      (candidate) =>
        candidate.alive &&
        candidate.id !== enemy.id &&
        candidate.ai.conversationId === enemy.ai.conversationId,
    );
    if (partner) {
      enemy.facing = angleTo(enemy.position, partner.position);
    }
    return;
  }

  if (enemy.ai.state === "patrolling") {
    const route = enemy.ai.route;
    if (!route || route.length === 0) {
      enemy.velocity = { x: 0, y: 0 };
      return;
    }

    const routeIndex = enemy.ai.routeIndex ?? 0;
    const target = route[routeIndex % route.length];
    if (moveTowardPoint(state, enemy, target, PATROL_SPEED, deltaMs)) {
      enemy.ai.routeIndex = (routeIndex + 1) % route.length;
    }
    return;
  }

  if (enemy.ai.state === "suspicious") {
    enemy.velocity = { x: 0, y: 0 };
    enemy.ai.suspicionMs += deltaMs;
    if (enemy.ai.knownPlayerPosition) {
      enemy.facing = angleTo(enemy.position, enemy.ai.knownPlayerPosition);
    }
    if (enemy.ai.suspicionMs >= SUSPICION_DELAY_MS) {
      enemy.ai.suspicionMs = 0;
      enemy.ai.state = "investigating";
    }
    return;
  }

  if (enemy.ai.state === "investigating") {
    if (!enemy.ai.knownPlayerPosition) {
      enemy.ai.state = "coolingDown";
      enemy.ai.cooldownMs = DEFAULT_COOLDOWN_MS;
      return;
    }

    if (moveTowardPoint(state, enemy, enemy.ai.knownPlayerPosition, INVESTIGATE_SPEED, deltaMs)) {
      enemy.ai.state = "coolingDown";
      enemy.ai.cooldownMs = DEFAULT_COOLDOWN_MS;
    }
    return;
  }

  if (enemy.ai.state === "coolingDown") {
    enemy.velocity = { x: 0, y: 0 };
    enemy.ai.cooldownMs = reduceTimer(enemy.ai.cooldownMs, deltaMs);
    if (enemy.ai.cooldownMs === 0) {
      if (enemy.ai.post) {
        enemy.position = { ...enemy.ai.post.position };
        enemy.facing = enemy.ai.post.facing;
        enemy.ai.state = "posted";
      } else if (enemy.ai.route && enemy.ai.route.length > 0) {
        enemy.ai.state = "patrolling";
      } else {
        enemy.ai.state = "posted";
      }
    }
  }
};

export const updateEnemies = (state: GameState, deltaMs: number): void => {
  for (const enemy of state.enemies) {
    if (!enemy.alive) {
      continue;
    }

    enemy.attackCooldownMs = reduceTimer(enemy.attackCooldownMs, deltaMs);
    updatePerceptionAndAlerts(state, enemy);

    if (enemy.ai.state !== "combat") {
      updateNonCombatEnemy(state, enemy, deltaMs);
      continue;
    }

    if (enemy.archetype === "monster_melee") {
      updateRushEnemy(state, enemy, deltaMs);
    } else if (enemy.archetype === "humanoid_ranged") {
      updateRangedEnemy(state, enemy, deltaMs);
    }
  }
};
