import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { toggleDoor, updateDoors } from "./systems/doors";

describe("doors", () => {
  it("animates a hinged door and keeps a bullet-blocking segment collider", () => {
    const state = createInitialGameState();
    const door = state.doors[0];

    toggleDoor(door);
    updateDoors(state, 120);

    const collider = state.colliders.find((candidate) => candidate.id === `door-${door.id}`);
    expect(door.angle).not.toBe(door.closedAngle);
    expect(collider?.kind).toBe("door-segment");
    expect(collider?.channels.bullets).toBe(true);
  });
});
