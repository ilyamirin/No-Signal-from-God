import { describe, expect, it } from "vitest";
import type { PlayerInput } from "../input/actions";
import { createInitialGameState } from "./state";
import { updateGame } from "./update";

const input: PlayerInput = {
  move: { x: 0, y: 0 },
  aimWorld: { x: 900, y: 390 },
  firing: false,
  restart: false,
  kick: false,
  interact: false,
};

describe("interactions", () => {
  it("picks up a floor weapon with E and throws the previous weapon away", () => {
    const state = createInitialGameState();
    state.player.position = { ...state.droppedWeapons[0].position };

    const next = updateGame(state, { ...input, interact: true }, 16);

    expect(next.player.weaponId).toBe("floor-pistol-reception");
    expect(next.droppedWeapons.some((weapon) => weapon.weaponId === "service-pistol")).toBe(true);
    expect(next.droppedWeapons.find((weapon) => weapon.weaponId === "service-pistol")?.velocity.x).not.toBe(0);
  });

  it("does not expose doors as E-key interactions", () => {
    const state = createInitialGameState();
    state.player.position = { x: 359, y: 330 };

    const next = updateGame(state, input, 16);

    expect(next.interaction).toBeUndefined();
  });
});
