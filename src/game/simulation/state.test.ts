import { describe, expect, it } from "vitest";
import { circleIntersectsRect } from "./geometry";
import { createInitialGameState } from "./state";

describe("createInitialGameState", () => {
  it("creates one suited TV-head player with one equipped weapon and six enemies", () => {
    const state = createInitialGameState();

    expect(state.player.head).toBe("crt");
    expect(state.player.outfit).toBe("suit");
    expect(state.player.weaponId).toBe("service-pistol");
    expect(state.weapons[state.player.weaponId]?.loadedRounds).toBe(6);
    expect(state.enemies).toHaveLength(6);
    expect(state.enemies.some((enemy) => enemy.head === "human")).toBe(true);
    expect(state.enemies.some((enemy) => enemy.head === "crt")).toBe(true);
    expect(state.status).toBe("playing");
  });

  it("starts every actor outside movement blockers", () => {
    const state = createInitialGameState();
    const actors = [state.player, ...state.enemies];
    const movementBlockers = state.arena.obstacles.filter((obstacle) => obstacle.blocksMovement);

    for (const actor of actors) {
      for (const blocker of movementBlockers) {
        expect(
          circleIntersectsRect(actor.position, actor.radius, blocker),
          `${actor.id} intersects ${blocker.id}`,
        ).toBe(false);
      }
    }
  });

  it("gives each armed actor a unique existing mutable weapon state", () => {
    const state = createInitialGameState();
    const weaponIds = [state.player, ...state.enemies]
      .map((actor) => actor.weaponId)
      .filter((weaponId): weaponId is string => weaponId !== undefined);

    for (const weaponId of weaponIds) {
      expect(state.weapons[weaponId], `${weaponId} should exist`).toBeDefined();
    }
    expect(new Set(weaponIds).size).toBe(weaponIds.length);
  });
});
