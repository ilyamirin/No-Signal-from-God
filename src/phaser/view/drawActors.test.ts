import { describe, expect, it } from "vitest";
import { playerAnimationFor, playerLegsAnimationFor } from "./actorAnimationKeys";

describe("player actor rendering selection", () => {
  it("keeps an unarmed player torso idle instead of looping the use animation", () => {
    const actor = {
      id: "player",
      alive: true,
      weaponId: undefined,
      animation: { intent: "idle", moving: false, speed: 0, lastShotMs: 0 },
    } as Parameters<typeof playerAnimationFor>[0];

    expect(playerAnimationFor(actor, undefined, false, false)).toBe("scifi-player-unarmed-idle");
  });

  it("selects visible player legs animation from movement state", () => {
    const actor = {
      id: "player",
      alive: true,
      weaponId: undefined,
      animation: { intent: "run", moving: true, speed: 235, lastShotMs: 0 },
    } as Parameters<typeof playerLegsAnimationFor>[0];

    expect(playerLegsAnimationFor(actor, false)).toBe("scifi-player-legs-idle");
    expect(playerLegsAnimationFor(actor, true)).toBe("scifi-player-legs-run");
  });
});
