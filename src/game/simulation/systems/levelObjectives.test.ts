import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../state";
import { updateLevelObjectives } from "./levelObjectives";

describe("level objectives", () => {
  it("does not immediately win ring tower when all final enemies die away from the lift", () => {
    const state = createInitialGameState({ levelId: "ring-tower" });
    if (state.level.victory.kind !== "finalFightThenExit") {
      throw new Error("Expected finalFightThenExit victory");
    }

    for (const enemy of state.enemies) {
      if (state.level.victory.finalEnemyIds.includes(enemy.id)) {
        enemy.alive = false;
      }
    }
    state.player.position = { x: 1280, y: 1470 };

    updateLevelObjectives(state);

    expect(state.levelState.finalFightComplete).toBe(true);
    expect(state.levelState.exitActive).toBe(true);
    expect(state.status).toBe("playing");
  });

  it("wins ring tower only after final fight and player enters the lift trigger", () => {
    const state = createInitialGameState({ levelId: "ring-tower" });
    if (state.level.victory.kind !== "finalFightThenExit") {
      throw new Error("Expected finalFightThenExit victory");
    }

    for (const enemy of state.enemies) {
      if (state.level.victory.finalEnemyIds.includes(enemy.id)) {
        enemy.alive = false;
      }
    }
    state.player.position = {
      x: state.level.victory.exitTrigger.x + state.level.victory.exitTrigger.width / 2,
      y: state.level.victory.exitTrigger.y + state.level.victory.exitTrigger.height / 2,
    };

    updateLevelObjectives(state);

    expect(state.status).toBe("victory");
  });

  it("keeps reception hub all-enemies-dead victory behavior", () => {
    const state = createInitialGameState({ levelId: "reception-hub" });
    state.enemies.forEach((enemy) => {
      enemy.alive = false;
    });

    updateLevelObjectives(state);

    expect(state.status).toBe("victory");
  });
});
