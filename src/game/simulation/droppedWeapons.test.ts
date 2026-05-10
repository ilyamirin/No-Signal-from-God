import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { tryPickupWeapon, updateDroppedWeapons } from "./systems/droppedWeapons";

describe("dropped weapons", () => {
  it("moves thrown weapons with spin and friction", () => {
    const state = createInitialGameState();
    const weapon = state.droppedWeapons[0];
    weapon.velocity = { x: 300, y: 0 };
    weapon.angularVelocity = 5;

    updateDroppedWeapons(state, 100);

    expect(weapon.position.x).toBeGreaterThan(470);
    expect(weapon.velocity.x).toBeLessThan(300);
    expect(weapon.rotation).not.toBe(0.2);
  });

  it("equips nearest dropped weapon and leaves the old one on the floor", () => {
    const state = createInitialGameState();
    state.player.position = { ...state.droppedWeapons[0].position };

    expect(tryPickupWeapon(state)).toBe(true);
    expect(state.player.weaponId).toBe("floor-pistol-reception");
    expect(state.droppedWeapons.some((weapon) => weapon.weaponId === "service-pistol")).toBe(true);
  });
});
