import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import type { EnemyState, SoundEvent } from "./types";
import { canEnemyHearSound, canEnemySeePlayer, hasFriendlyInLineOfFire } from "./systems/perception";

const firstEnemy = (): { state: ReturnType<typeof createInitialGameState>; enemy: EnemyState } => {
  const state = createInitialGameState();
  const enemy = state.enemies[0];
  state.enemies.forEach((candidate) => {
    candidate.alive = candidate.id === enemy.id;
    candidate.health = candidate.id === enemy.id ? 1 : 0;
  });
  enemy.position = { x: 100, y: 100 };
  enemy.facing = 0;
  enemy.ai.perception = { visionRange: 300, visionAngle: Math.PI / 2, hearingRange: 260 };
  state.player.position = { x: 220, y: 100 };
  return { state, enemy };
};

describe("enemy perception", () => {
  it("sees the player inside range, cone, and line of sight", () => {
    const { state, enemy } = firstEnemy();

    expect(canEnemySeePlayer(state, enemy)).toBe(true);
  });

  it("does not see the player outside the vision cone", () => {
    const { state, enemy } = firstEnemy();
    state.player.position = { x: 100, y: 220 };

    expect(canEnemySeePlayer(state, enemy)).toBe(false);
  });

  it("does not see through a vision-blocking collider", () => {
    const { state, enemy } = firstEnemy();
    state.colliders.push({
      id: "vision-wall",
      kind: "rect",
      rect: { x: 150, y: 70, width: 20, height: 80 },
      channels: { movement: true, bullets: true, vision: true, sound: true },
    });

    expect(canEnemySeePlayer(state, enemy)).toBe(false);
  });

  it("hears an unblocked sound inside hearing range", () => {
    const { state, enemy } = firstEnemy();
    const sound: SoundEvent = {
      id: "sound-test",
      kind: "gunshot",
      position: { x: 180, y: 100 },
      radius: 400,
      sourceId: "player",
    };

    expect(canEnemyHearSound(state, enemy, sound)).toBe(true);
  });

  it("does not hear through a sound-blocking collider", () => {
    const { state, enemy } = firstEnemy();
    state.colliders.push({
      id: "sound-wall",
      kind: "rect",
      rect: { x: 140, y: 70, width: 20, height: 80 },
      channels: { movement: true, bullets: true, vision: true, sound: true },
    });
    const sound: SoundEvent = {
      id: "sound-test",
      kind: "gunshot",
      position: { x: 200, y: 100 },
      radius: 400,
      sourceId: "player",
    };

    expect(canEnemyHearSound(state, enemy, sound)).toBe(false);
  });
});

describe("friendly fire safety", () => {
  it("detects a friendly enemy between shooter and player", () => {
    const state = createInitialGameState();
    const [shooter, friendly] = state.enemies;
    state.enemies.forEach((enemy) => {
      enemy.alive = enemy.id === shooter.id || enemy.id === friendly.id;
      enemy.health = enemy.alive ? 1 : 0;
      enemy.ai.alertGroupId = "test-room";
    });
    shooter.position = { x: 100, y: 100 };
    friendly.position = { x: 180, y: 100 };
    friendly.radius = 18;
    state.player.position = { x: 260, y: 100 };

    expect(hasFriendlyInLineOfFire(state, shooter, state.player.position)).toBe(true);
  });

  it("does not flag a friendly behind the player as blocking fire", () => {
    const state = createInitialGameState();
    const [shooter, friendly] = state.enemies;
    state.enemies.forEach((enemy) => {
      enemy.alive = enemy.id === shooter.id || enemy.id === friendly.id;
      enemy.health = enemy.alive ? 1 : 0;
    });
    shooter.position = { x: 100, y: 100 };
    friendly.position = { x: 320, y: 100 };
    friendly.radius = 18;
    state.player.position = { x: 260, y: 100 };

    expect(hasFriendlyInLineOfFire(state, shooter, state.player.position)).toBe(false);
  });
});
