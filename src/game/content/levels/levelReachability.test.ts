import { describe, expect, it } from "vitest";
import { blocksMovementAtCircle } from "../../simulation/collision";
import { createInitialGameState } from "../../simulation/state";
import type { LevelId, Vec2 } from "../../simulation/types";
import { ringTowerLayout } from "./ringTowerLayout";

const canStand = (levelId: LevelId, position: Vec2): boolean => {
  const state = createInitialGameState({ levelId });
  return !blocksMovementAtCircle(state.colliders, position, state.player.radius);
};

describe("level reachability anchors", () => {
  it("keeps authored ring tower route targets walkable", () => {
    for (const [id, target] of Object.entries(ringTowerLayout.routeTargets)) {
      expect(canStand("ring-tower", target), `${id} should be walkable`).toBe(true);
    }
  });

  it("keeps old reception hub spawn walkable", () => {
    const state = createInitialGameState({ levelId: "reception-hub" });
    expect(blocksMovementAtCircle(state.colliders, state.player.position, state.player.radius)).toBe(false);
  });
});
