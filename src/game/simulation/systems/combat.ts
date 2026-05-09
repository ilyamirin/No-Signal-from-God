import { distance, pointInRect } from "../geometry";
import type { GameState, Vec2 } from "../types";

const RUSH_SCORE = 900;
const RANGED_SCORE = 1200;

const nextFxId = (state: GameState): string => `fx-${state.nextId++}`;

const addFx = (state: GameState, kind: "blood" | "impact", position: Vec2, rotation: number): void => {
  state.fx.push({
    id: nextFxId(state),
    kind,
    position: { ...position },
    rotation,
    ttlMs: kind === "blood" ? 360 : 220,
  });
};

const killScore = (kind: "rush" | "ranged"): number => (kind === "rush" ? RUSH_SCORE : RANGED_SCORE);

export const updateBulletsAndHits = (state: GameState, deltaMs: number): void => {
  const deltaSeconds = deltaMs / 1000;
  const remaining = [];

  for (const bullet of state.bullets) {
    bullet.ttlMs -= deltaMs;
    bullet.position = {
      x: bullet.position.x + bullet.velocity.x * deltaSeconds,
      y: bullet.position.y + bullet.velocity.y * deltaSeconds,
    };

    if (bullet.ttlMs <= 0) {
      continue;
    }

    const blockerHit = state.arena.obstacles.find((obstacle) => obstacle.blocksBullets && pointInRect(bullet.position, obstacle));
    if (blockerHit) {
      addFx(state, "impact", bullet.position, Math.atan2(bullet.velocity.y, bullet.velocity.x));
      continue;
    }

    if (bullet.ownerId === state.player.id) {
      const enemy = state.enemies.find((candidate) => candidate.alive && distance(candidate.position, bullet.position) <= candidate.radius);
      if (enemy) {
        enemy.health -= bullet.damage;
        addFx(state, "blood", enemy.position, Math.atan2(bullet.velocity.y, bullet.velocity.x));
        if (enemy.health <= 0) {
          enemy.alive = false;
          enemy.velocity = { x: 0, y: 0 };
          state.score += killScore(enemy.kind);
        }
        continue;
      }
    } else if (
      state.player.alive &&
      state.player.invulnerableMs === 0 &&
      distance(state.player.position, bullet.position) <= state.player.radius
    ) {
      state.player.health -= bullet.damage;
      state.player.invulnerableMs = 700;
      addFx(state, "blood", state.player.position, Math.atan2(bullet.velocity.y, bullet.velocity.x));
      continue;
    }

    remaining.push(bullet);
  }

  state.bullets = remaining;
};

export const updateStatus = (state: GameState): void => {
  if (state.player.health <= 0) {
    state.player.alive = false;
    state.status = "dead";
    return;
  }

  if (state.enemies.every((enemy) => !enemy.alive)) {
    state.status = "victory";
  }
};
