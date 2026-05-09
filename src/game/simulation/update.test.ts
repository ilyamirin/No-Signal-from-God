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
};

describe("updateGame", () => {
  it("moves the suited TV-head player with normalized WASD input", () => {
    const state = createInitialGameState();
    const next = updateGame(state, { ...neutralInput, move: { x: 1, y: 1 } }, 100);

    expect(next.player.position.x).toBeGreaterThan(state.player.position.x);
    expect(next.player.position.y).toBeGreaterThan(state.player.position.y);
    expect(Math.hypot(next.player.velocity.x, next.player.velocity.y)).toBeLessThanOrEqual(270);
  });

  it("fires one bullet from the single equipped weapon and consumes one round", () => {
    const state = createInitialGameState();
    const next = updateGame(state, { ...neutralInput, firing: true }, 16);

    expect(next.bullets).toHaveLength(1);
    expect(next.weapons["service-pistol"].loadedRounds).toBe(5);
    expect(next.fx.some((fx) => fx.kind === "muzzle")).toBe(true);
  });

  it("lets ranged enemies fire their own weapon state without consuming the player weapon", () => {
    const state = createInitialGameState();
    state.player.position = { x: 690, y: 390 };
    state.enemies.forEach((enemy, index) => {
      enemy.alive = index < 2;
      enemy.health = index < 2 ? 1 : 0;
      enemy.attackCooldownMs = 0;
    });
    state.enemies[0].position = { x: 500, y: 390 };
    state.enemies[1].position = { x: 880, y: 390 };

    const next = updateGame(state, neutralInput, 16);

    expect(next.weapons["service-pistol"].loadedRounds).toBe(6);
    expect(next.weapons["enemy-ranged-anchor-pistol"].loadedRounds).toBe(5);
    expect(next.weapons["enemy-ranged-control-pistol"].loadedRounds).toBe(5);
    expect(next.bullets.filter((bullet) => bullet.ownerId.startsWith("enemy-ranged"))).toHaveLength(2);
  });

  it("marks victory and awards score after the last enemy dies", () => {
    const state = createInitialGameState();
    state.enemies.forEach((enemy, index) => {
      enemy.alive = index === 0;
      enemy.health = index === 0 ? 1 : 0;
    });
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
    const state = createInitialGameState();
    state.status = "dead";
    state.player.alive = false;
    state.score = 9000;

    const next = updateGame(state, { ...neutralInput, restart: true }, 16);

    expect(next.status).toBe("playing");
    expect(next.player.alive).toBe(true);
    expect(next.score).toBe(0);
  });
});
