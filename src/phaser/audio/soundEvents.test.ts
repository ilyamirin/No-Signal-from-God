import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../../game/simulation/state";
import { collectSoundEvents } from "./soundEvents";

describe("collectSoundEvents", () => {
  it("emits weapon-specific shot events when loaded rounds decrease", () => {
    const previous = createInitialGameState();
    const current = structuredClone(previous);
    current.weapons["service-pistol"].loadedRounds -= 1;

    expect(collectSoundEvents(previous, current)).toContain("shot-pistol");
  });

  it("emits a footstep only when movement crosses the step cadence", () => {
    const previous = createInitialGameState();
    const current = structuredClone(previous);
    previous.elapsedMs = 260;
    current.elapsedMs = 290;
    current.player.velocity = { x: 235, y: 0 };

    expect(collectSoundEvents(previous, current)).toContain("footstep");
  });

  it("emits door and monster events from simulation changes", () => {
    const previous = createInitialGameState();
    const current = structuredClone(previous);
    current.doors[0].angle += 0.2;
    current.player.health -= 1;
    current.enemies.find((enemy) => enemy.archetype === "monster_melee")!.position = {
      x: current.player.position.x + 58,
      y: current.player.position.y,
    };

    expect(collectSoundEvents(previous, current)).toEqual(
      expect.arrayContaining(["door-move", "monster-attack"]),
    );
  });
});
