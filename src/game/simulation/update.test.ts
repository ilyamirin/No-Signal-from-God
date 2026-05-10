import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { updateGame } from "./update";
import type { PlayerInput } from "../input/actions";

const neutralInput: PlayerInput = {
  move: { x: 0, y: 0 },
  aimWorld: { x: 800, y: 390 },
  firing: false,
  restart: false,
  kick: false,
  interact: false,
};

describe("updateGame", () => {
  it("moves the suited TV-head player with normalized WASD input", () => {
    const state = createInitialGameState({ levelId: "reception-hub" });
    const next = updateGame(state, { ...neutralInput, move: { x: 1, y: 1 } }, 100);

    expect(next.player.position.x).toBeGreaterThan(state.player.position.x);
    expect(next.player.position.y).toBeGreaterThan(state.player.position.y);
    expect(Math.hypot(next.player.velocity.x, next.player.velocity.y)).toBeLessThanOrEqual(235);
  });

  it("fires one bullet from the single equipped weapon and consumes one round", () => {
    const state = createInitialGameState({ levelId: "reception-hub" });
    const next = updateGame(state, { ...neutralInput, firing: true }, 16);

    expect(next.bullets).toHaveLength(1);
    expect(next.weapons["service-pistol"].loadedRounds).toBe(5);
    expect(next.fx.some((fx) => fx.kind === "muzzle")).toBe(true);
  });

  it("does not fire when the selected level starts unarmed", () => {
    const state = createInitialGameState({ levelId: "ring-tower" });
    const next = updateGame(
      state,
      {
        ...neutralInput,
        aimWorld: { x: state.player.position.x + 100, y: state.player.position.y },
        firing: true,
      },
      16,
    );

    expect(state.player.weaponId).toBeUndefined();
    expect(next.bullets).toHaveLength(0);
    expect(next.fx.some((fx) => fx.kind === "muzzle")).toBe(false);
  });

  it("can pick up the first ring tower pistol from an unarmed start", () => {
    const state = createInitialGameState({ levelId: "ring-tower" });
    const firstDrop = state.droppedWeapons.find((weapon) => weapon.id === "ring-drop-first-pistol")!;
    state.player.position = { ...firstDrop.position };

    const next = updateGame(
      state,
      {
        ...neutralInput,
        aimWorld: { x: firstDrop.position.x + 100, y: firstDrop.position.y },
        interact: true,
      },
      16,
    );

    expect(next.player.weaponId).toBe("ring-floor-first-pistol");
    expect(next.droppedWeapons.some((weapon) => weapon.id === "ring-drop-first-pistol")).toBe(false);
  });

  it("lets ranged enemies fire their own weapon state without consuming the player weapon", () => {
    const state = createInitialGameState({ levelId: "reception-hub" });
    state.player.position = { x: 690, y: 390 };
    const firingEnemies = state.enemies.filter((enemy) => enemy.archetype === "humanoid_ranged").slice(0, 2);
    state.enemies.forEach((enemy) => {
      const active = firingEnemies.includes(enemy);
      enemy.alive = active;
      enemy.health = active ? 1 : 0;
      enemy.attackCooldownMs = 0;
    });
    firingEnemies[0].position = { x: 620, y: 390 };
    firingEnemies[1].position = { x: 760, y: 390 };
    state.engaged = true;

    const next = updateGame(state, neutralInput, 16);

    expect(next.weapons["service-pistol"].loadedRounds).toBe(6);
    expect(next.weapons["security-guard-pistol"].loadedRounds).toBe(5);
    expect(next.weapons["newsroom-guard-left-pistol"].loadedRounds).toBe(5);
    expect(next.bullets.filter((bullet) => bullet.ownerId.startsWith("enemy-"))).toHaveLength(2);
  });

  it("keeps the opening encounter playable for the first reaction window", () => {
    let state = createInitialGameState({ levelId: "reception-hub" });

    for (let frame = 0; frame < 300; frame += 1) {
      state = updateGame(state, neutralInput, 16);
    }

    expect(state.status).toBe("playing");
    expect(state.player.alive).toBe(true);
    expect(state.player.health).toBeGreaterThan(0);
  });

  it("marks victory and awards score after the last enemy dies", () => {
    const state = createInitialGameState({ levelId: "reception-hub" });
    state.enemies.forEach((enemy, index) => {
      enemy.alive = index === 0;
      enemy.health = index === 0 ? 1 : 0;
    });
    state.engaged = true;
    state.bullets.push({
      id: "test-bullet",
      ownerId: "player",
      position: { ...state.enemies[0].position },
      velocity: { x: 0, y: 0 },
      damage: 1,
      ttlMs: 100,
    });

    const next = updateGame(state, neutralInput, 16);

    expect(next.enemies.every((enemy) => !enemy.alive)).toBe(true);
    expect(next.status).toBe("victory");
    expect(next.score).toBeGreaterThanOrEqual(1000);
  });

  it("resets after death when restart is pressed", () => {
    const state = createInitialGameState({ levelId: "reception-hub" });
    state.status = "dead";
    state.player.alive = false;
    state.score = 9000;

    const next = updateGame(state, { ...neutralInput, restart: true }, 16);

    expect(next.status).toBe("playing");
    expect(next.player.alive).toBe(true);
    expect(next.score).toBe(0);
  });
});
