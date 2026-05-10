import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { updateBulletsAndHits } from "./systems/combat";

describe("combat friendly fire", () => {
  it("lets enemy bullets damage another enemy", () => {
    const state = createInitialGameState();
    const [shooter, target] = state.enemies;
    state.enemies.forEach((enemy) => {
      enemy.alive = enemy.id === shooter.id || enemy.id === target.id;
      enemy.health = enemy.alive ? 1 : 0;
    });
    target.position = { x: 200, y: 100 };
    state.bullets.push({
      id: "enemy-bullet",
      ownerId: shooter.id,
      position: { ...target.position },
      velocity: { x: 100, y: 0 },
      damage: 1,
      ttlMs: 100,
    });
    const scoreBefore = state.score;

    updateBulletsAndHits(state, 16);

    expect(target.alive).toBe(false);
    expect(state.score).toBe(scoreBefore);
  });
});
