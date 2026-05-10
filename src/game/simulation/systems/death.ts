import { fromAngle, scale } from "../geometry";
import type { EnemyState, GameState, Vec2 } from "../types";

const nextId = (state: GameState, prefix: string): string => `${prefix}-${state.nextId++}`;

export const emitHeavyBlood = (state: GameState, position: Vec2, rotation: number, playerBlood = false): void => {
  for (let index = 0; index < 5; index += 1) {
    const spread = rotation + (index - 2) * 0.32;
    const direction = fromAngle(spread);
    state.fx.push({
      id: nextId(state, "fx"),
      kind: index === 0 ? "blood-death" : "blood",
      position: {
        x: position.x + direction.x * (8 + index * 5),
        y: position.y + direction.y * (8 + index * 5),
      },
      rotation: spread,
      ttlMs: index === 0 ? 900 : 5200,
      frame: index % 3,
    });
  }

  state.decals.push({
    id: nextId(state, "decal"),
    kind: playerBlood ? "player-blood" : "enemy-blood",
    position: { ...position },
    rotation,
    frame: state.nextId % 3,
    scale: 1.8 + (state.nextId % 3) * 0.22,
  });
};

export const killEnemy = (state: GameState, enemy: EnemyState, hitVelocity: Vec2): void => {
  enemy.alive = false;
  const impulse = scale(fromAngle(Math.atan2(hitVelocity.y, hitVelocity.x)), 260);
  enemy.velocity = impulse;
  enemy.animation.intent = "death";
  emitHeavyBlood(state, enemy.position, Math.atan2(hitVelocity.y, hitVelocity.x));
};

export const updateCorpseMotion = (state: GameState, deltaMs: number): void => {
  const deltaSeconds = deltaMs / 1000;

  for (const enemy of state.enemies) {
    if (enemy.alive) {
      continue;
    }
    enemy.position.x += enemy.velocity.x * deltaSeconds;
    enemy.position.y += enemy.velocity.y * deltaSeconds;
    enemy.velocity.x *= 0.88;
    enemy.velocity.y *= 0.88;
    if (Math.hypot(enemy.velocity.x, enemy.velocity.y) < 5) {
      enemy.velocity = { x: 0, y: 0 };
    }
  }
};
