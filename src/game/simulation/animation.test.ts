import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { updateActorAnimations } from "./systems/animation";

describe("actor animation state", () => {
  it("selects player weapon and run/shoot intents from simulation state", () => {
    const state = createInitialGameState();
    state.player.velocity = { x: 220, y: 0 };
    updateActorAnimations(state, 16);

    expect(state.player.animation.intent).toBe("run");
    expect(state.player.animation.weaponKind).toBe("pistol");

    state.player.animation.lastShotMs = 100;
    updateActorAnimations(state, 16);
    expect(state.player.animation.intent).toBe("shoot");
  });

  it("keeps melee monsters away from ranged weapon animation branches", () => {
    const state = createInitialGameState();
    const monster = state.enemies.find((enemy) => enemy.archetype === "monster_melee");

    expect(monster).toBeDefined();
    if (!monster) return;

    monster.velocity = { x: 100, y: 0 };
    updateActorAnimations(state, 16);

    expect(monster.animation.intent).toBe("run");
    expect(monster.animation.weaponKind).toBeUndefined();
  });
});
