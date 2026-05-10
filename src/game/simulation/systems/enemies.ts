import { angleTo, clampToArena, distance, normalize, scale } from "../geometry";
import { blocksMovementAtCircle, hasLineOfSightThroughColliders } from "../collision";
import type { EnemyState, GameState, Vec2 } from "../types";
import { tryFireWeapon } from "./weapons";

const RUSH_SPEED = 215;
const RANGED_SPEED = 130;
const RANGED_MIN_DISTANCE = 210;
const RANGED_MAX_DISTANCE = 330;
const RUSH_HIT_DISTANCE = 34;
const RUSH_DAMAGE_COOLDOWN_MS = 520;
const RANGED_ATTACK_COOLDOWN_MS = 520;

const reduceTimer = (value: number, deltaMs: number): number => Math.max(0, value - deltaMs);

const canStandAt = (state: GameState, enemy: EnemyState, position: Vec2): boolean =>
  !blocksMovementAtCircle(state.colliders, position, enemy.radius);

const moveEnemy = (state: GameState, enemy: EnemyState, desiredVelocity: Vec2, deltaMs: number): void => {
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

  if (canStandAt(state, enemy, nextPosition)) {
    enemy.position = nextPosition;
    enemy.velocity = desiredVelocity;
  } else {
    enemy.velocity = { x: 0, y: 0 };
  }
};

const updateRushEnemy = (state: GameState, enemy: EnemyState, deltaMs: number): void => {
  const toPlayer = normalize({
    x: state.player.position.x - enemy.position.x,
    y: state.player.position.y - enemy.position.y,
  });
  enemy.facing = angleTo(enemy.position, state.player.position);
  moveEnemy(state, enemy, scale(toPlayer, RUSH_SPEED), deltaMs);

  if (
    state.player.alive &&
    state.player.invulnerableMs === 0 &&
    enemy.attackCooldownMs === 0 &&
    distance(enemy.position, state.player.position) <= RUSH_HIT_DISTANCE
  ) {
    state.player.health -= 1;
    state.player.invulnerableMs = 700;
    enemy.attackCooldownMs = RUSH_DAMAGE_COOLDOWN_MS;
    state.fx.push({
      id: `fx-${state.nextId++}`,
      kind: "blood",
      position: { ...state.player.position },
      rotation: enemy.facing,
      ttlMs: 300,
    });
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
    hasLineOfSightThroughColliders(state.colliders, enemy.position, state.player.position, "vision")
  ) {
    const fired = tryFireWeapon(state, enemy.id, enemy.weaponId, enemy.position, enemy.facing);
    if (fired) {
      enemy.attackCooldownMs = RANGED_ATTACK_COOLDOWN_MS;
    }
  }
};

export const updateEnemies = (state: GameState, deltaMs: number): void => {
  for (const enemy of state.enemies) {
    if (!enemy.alive) {
      enemy.velocity = { x: 0, y: 0 };
      continue;
    }

    enemy.attackCooldownMs = reduceTimer(enemy.attackCooldownMs, deltaMs);
    if (enemy.archetype === "monster_melee") {
      updateRushEnemy(state, enemy, deltaMs);
    } else if (enemy.archetype === "humanoid_ranged") {
      updateRangedEnemy(state, enemy, deltaMs);
    }
  }
};
