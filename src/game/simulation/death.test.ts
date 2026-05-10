import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { killEnemy, updateCorpseMotion } from "./systems/death";
import { updateEnemies } from "./systems/enemies";

describe("death effects", () => {
  it("throws a dead enemy away from the shot and emits heavy blood", () => {
    const state = createInitialGameState();
    const enemy = state.enemies[0];

    killEnemy(state, enemy, { x: -800, y: 0 });

    expect(enemy.alive).toBe(false);
    expect(enemy.velocity.x).toBeLessThan(0);
    expect(state.fx.filter((fx) => fx.kind === "blood" || fx.kind === "blood-death").length).toBeGreaterThanOrEqual(5);
    expect(state.decals.some((decal) => decal.kind === "enemy-blood")).toBe(true);

    const startX = enemy.position.x;
    updateCorpseMotion(state, 100);
    expect(enemy.position.x).toBeLessThan(startX);
  });

  it("keeps corpse impulse alive after enemy AI updates", () => {
    const state = createInitialGameState();
    const enemy = state.enemies[0];

    killEnemy(state, enemy, { x: 900, y: 0 });
    const impulseX = enemy.velocity.x;
    updateEnemies(state, 16);

    expect(enemy.velocity.x).toBe(impulseX);
  });
});
