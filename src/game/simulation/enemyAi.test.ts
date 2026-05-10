import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { updateDoors } from "./systems/doors";
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

describe("non-combat enemy AI states", () => {
  it("keeps talking enemies facing each other until alerted", () => {
    const state = createInitialGameState();
    const [left, right] = state.enemies;
    state.enemies.forEach((enemy) => {
      enemy.alive = enemy.id === left.id || enemy.id === right.id;
      enemy.health = enemy.alive ? 1 : 0;
    });
    left.position = { x: 100, y: 100 };
    right.position = { x: 180, y: 100 };
    left.ai = { ...left.ai, state: "talking", conversationId: "test-chat", alertGroupId: "test" };
    right.ai = { ...right.ai, state: "talking", conversationId: "test-chat", alertGroupId: "test" };
    state.player.position = { x: 1000, y: 1000 };

    updateEnemies(state, 16);

    expect(left.facing).toBeCloseTo(0);
    expect(right.facing).toBeCloseTo(Math.PI);
  });

  it("moves a patrolling enemy toward its next route point", () => {
    const state = createInitialGameState();
    const enemy = state.enemies[0];
    state.enemies.forEach((candidate) => {
      candidate.alive = candidate.id === enemy.id;
      candidate.health = candidate.alive ? 1 : 0;
    });
    enemy.position = { x: 100, y: 100 };
    enemy.ai = {
      ...enemy.ai,
      state: "patrolling",
      route: [{ x: 100, y: 100 }, { x: 200, y: 100 }],
      routeIndex: 1,
    };
    state.player.position = { x: 1000, y: 1000 };

    updateEnemies(state, 250);

    expect(enemy.position.x).toBeGreaterThan(100);
  });

  it("returns a cooling enemy to its post after the cooldown expires", () => {
    const state = createInitialGameState();
    const enemy = state.enemies[0];
    state.enemies.forEach((candidate) => {
      candidate.alive = candidate.id === enemy.id;
      candidate.health = candidate.alive ? 1 : 0;
    });
    enemy.position = { x: 120, y: 100 };
    enemy.ai = {
      ...enemy.ai,
      state: "coolingDown",
      cooldownMs: 10,
      post: { position: { x: 100, y: 100 }, facing: Math.PI / 2 },
    };
    state.player.position = { x: 1000, y: 1000 };

    updateEnemies(state, 20);

    expect(enemy.ai.state).toBe("posted");
    expect(enemy.facing).toBeCloseTo(Math.PI / 2);
  });
});

describe("enemy door traversal", () => {
  it("applies door pressure while a patrolling enemy moves through a doorway", () => {
    const state = createInitialGameState();
    const enemy = state.enemies[0];
    const door = state.doors[0];
    state.enemies.forEach((candidate) => {
      candidate.alive = candidate.id === enemy.id;
      candidate.health = candidate.alive ? 1 : 0;
    });
    enemy.position = { x: door.hinge.x + 16, y: door.hinge.y + 28 };
    enemy.ai = {
      ...enemy.ai,
      state: "patrolling",
      route: [
        { x: door.hinge.x + 16, y: door.hinge.y + 28 },
        { x: door.hinge.x + 16, y: door.hinge.y + 100 },
      ],
      routeIndex: 1,
    };
    state.player.position = { x: 1000, y: 1000 };
    const initialAngle = door.angle;

    for (let frame = 0; frame < 8; frame += 1) {
      updateEnemies(state, 80);
      updateDoors(state, 80);
    }

    expect(door.angle).not.toBe(initialAngle);
    expect(enemy.position.y).toBeGreaterThan(door.hinge.y + 28);
  });
});
