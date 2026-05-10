import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { updateEnemies } from "./systems/enemies";

describe("enemy alert groups", () => {
  it("alerts enemies in the same group without waking the whole map", () => {
    const state = createInitialGameState();
    const [spotter, sameGroup, otherGroup] = state.enemies;
    state.enemies.forEach((enemy) => {
      enemy.alive = enemy.id === spotter.id || enemy.id === sameGroup.id || enemy.id === otherGroup.id;
      enemy.health = enemy.alive ? 1 : 0;
      enemy.ai.state = "posted";
      enemy.attackCooldownMs = 12000;
    });
    spotter.ai.alertGroupId = "security";
    sameGroup.ai.alertGroupId = "security";
    otherGroup.ai.alertGroupId = "newsroom";
    spotter.position = { x: 100, y: 100 };
    spotter.facing = 0;
    spotter.ai.perception = { visionRange: 500, visionAngle: Math.PI, hearingRange: 300 };
    sameGroup.position = { x: 140, y: 130 };
    otherGroup.position = { x: 180, y: 130 };
    state.player.position = { x: 220, y: 100 };

    updateEnemies(state, 16);

    expect(spotter.ai.state).toBe("combat");
    expect(sameGroup.ai.state).toBe("investigating");
    expect(sameGroup.ai.knownPlayerPosition).toEqual(state.player.position);
    expect(otherGroup.ai.state).toBe("posted");
  });
});
