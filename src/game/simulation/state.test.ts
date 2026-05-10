import { describe, expect, it } from "vitest";
import { circleIntersectsRect } from "./geometry";
import { createInitialGameState } from "./state";

describe("createInitialGameState", () => {
  it("creates one suited TV-head player with one equipped weapon and eight enemies", () => {
    const state = createInitialGameState();

    expect(state.player.head).toBe("crt");
    expect(state.player.outfit).toBe("suit");
    expect(state.player.weaponId).toBe("service-pistol");
    expect(state.weapons[state.player.weaponId]?.loadedRounds).toBe(6);
    expect(state.enemies).toHaveLength(8);
    expect(state.enemies.filter((enemy) => enemy.archetype === "humanoid_ranged")).toHaveLength(6);
    expect(state.enemies.filter((enemy) => enemy.archetype === "monster_melee")).toHaveLength(2);
    expect(state.enemies.some((enemy) => enemy.head === "human")).toBe(true);
    expect(state.enemies.some((enemy) => enemy.head === "crt")).toBe(true);
    expect(state.status).toBe("playing");
  });

  it("initializes prop, door, dropped weapon, decal, and collider collections", () => {
    const state = createInitialGameState();

    expect(state.props.length).toBeGreaterThan(0);
    expect(state.doors.length).toBeGreaterThan(0);
    expect(state.droppedWeapons.length).toBeGreaterThan(0);
    expect(state.decals).toEqual([]);
    expect(state.colliders.length).toBeGreaterThan(state.arena.obstacles.length);
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

  it("starts the player in the safe reception while enemies start outside it", () => {
    const state = createInitialGameState();
    const reception = { x: 120, y: 820, width: 600, height: 430 };

    expect(state.player.position.x).toBeGreaterThan(reception.x);
    expect(state.player.position.x).toBeLessThan(reception.x + reception.width);
    expect(state.player.position.y).toBeGreaterThan(reception.y);
    expect(state.player.position.y).toBeLessThan(reception.y + reception.height);

    for (const enemy of state.enemies) {
      const inReception =
        enemy.position.x > reception.x &&
        enemy.position.x < reception.x + reception.width &&
        enemy.position.y > reception.y &&
        enemy.position.y < reception.y + reception.height;
      expect(inReception, `${enemy.id} should not spawn in safe reception`).toBe(false);
    }
  });
});
