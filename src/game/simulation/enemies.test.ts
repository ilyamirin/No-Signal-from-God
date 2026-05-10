import { describe, expect, it } from "vitest";
import type { PlayerInput } from "../input/actions";
import { distance } from "./geometry";
import { createInitialGameState } from "./state";
import { updateGame } from "./update";

const input: PlayerInput = {
  move: { x: 0, y: 0 },
  aimWorld: { x: 600, y: 1040 },
  firing: false,
  restart: false,
  kick: false,
  interact: false,
};

const isolateFirstMeleeEnemy = () => {
  const state = createInitialGameState({ levelId: "reception-hub" });
  const melee = state.enemies.find((enemy) => enemy.archetype === "monster_melee");
  if (!melee) {
    throw new Error("Missing melee enemy");
  }
  state.enemies.forEach((enemy) => {
    enemy.alive = enemy.id === melee.id;
    enemy.health = enemy.id === melee.id ? 1 : 0;
  });
  state.player.position = { x: 330, y: 1040 };
  melee.position = { x: 390, y: 1040 };
  melee.attackCooldownMs = 0;
  state.engaged = true;

  return { state, meleeId: melee.id };
};

describe("melee enemies", () => {
  it("starts melee monsters ready to swing instead of waiting like ranged guards", () => {
    const state = createInitialGameState({ levelId: "reception-hub" });
    const meleeEnemies = state.enemies.filter((enemy) => enemy.archetype === "monster_melee");

    expect(meleeEnemies.length).toBeGreaterThan(0);
    expect(meleeEnemies.every((enemy) => enemy.attackCooldownMs <= 250)).toBe(true);
  });

  it("hits from hand reach instead of requiring body overlap", () => {
    const { state } = isolateFirstMeleeEnemy();
    const next = updateGame(state, input, 16);

    expect(next.player.health).toBe(7);
  });

  it("attacks on the same frame it steps into hand reach", () => {
    const { state, meleeId } = isolateFirstMeleeEnemy();
    const melee = state.enemies.find((enemy) => enemy.id === meleeId)!;
    melee.position = { x: state.player.position.x + 64, y: state.player.position.y };

    const next = updateGame(state, input, 16);

    expect(next.player.health).toBe(7);
  });

  it("keeps swinging during player invulnerability without dealing extra damage", () => {
    const { state, meleeId } = isolateFirstMeleeEnemy();
    state.player.invulnerableMs = 300;

    const next = updateGame(state, input, 16);
    const melee = next.enemies.find((enemy) => enemy.id === meleeId);

    expect(next.player.health).toBe(8);
    expect(melee?.animation.intent).toBe("attack");
    expect(melee?.attackCooldownMs).toBeGreaterThan(0);
  });

  it("slides along partial blockers instead of freezing on a blocked diagonal", () => {
    const { state, meleeId } = isolateFirstMeleeEnemy();
    const melee = state.enemies.find((enemy) => enemy.id === meleeId)!;
    state.player.position = { x: 400, y: 1000 };
    melee.position = { x: 500, y: 1100 };
    state.colliders.push({
      id: "diagonal-snag",
      kind: "rect",
      rect: { x: 470, y: 1070, width: 8, height: 8 },
      channels: { movement: true, bullets: false, vision: false, sound: false },
    });

    const next = updateGame(state, input, 200);
    const nextMelee = next.enemies.find((enemy) => enemy.id === meleeId)!;

    expect(distance(nextMelee.position, melee.position)).toBeGreaterThan(0);
  });

  it("plays a melee attack and throws blood splashes when it hits", () => {
    const { state, meleeId } = isolateFirstMeleeEnemy();
    const next = updateGame(state, input, 16);
    const melee = next.enemies.find((enemy) => enemy.id === meleeId);

    expect(melee?.animation.intent).toBe("attack");
    expect(next.fx.filter((fx) => fx.kind === "blood" || fx.kind === "blood-death").length).toBeGreaterThanOrEqual(5);
    expect(next.decals.some((decal) => decal.kind === "player-blood")).toBe(true);
  });

  it("holds a small gap instead of crawling over the player", () => {
    let { state, meleeId } = isolateFirstMeleeEnemy();

    for (let frame = 0; frame < 60; frame += 1) {
      state = updateGame(state, input, 16);
    }

    const melee = state.enemies.find((enemy) => enemy.id === meleeId);
    expect(melee).toBeDefined();
    expect(distance(melee!.position, state.player.position)).toBeGreaterThanOrEqual(56);
  });
});
