import { describe, expect, it } from "vitest";
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
});
