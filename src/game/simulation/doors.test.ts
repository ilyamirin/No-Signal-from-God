import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { applyDoorPressure, doorEnd, updateDoors } from "./systems/doors";

describe("doors", () => {
  it("opens a hinged door from actor pressure and keeps a bullet-blocking segment collider", () => {
    const state = createInitialGameState();
    const door = state.doors[0];

    applyDoorPressure(state, { x: door.hinge.x + 16, y: door.hinge.y + 28 }, 18);
    updateDoors(state, 120);

    const collider = state.colliders.find((candidate) => candidate.id === `door-${door.id}`);
    expect(door.angle).not.toBe(door.closedAngle);
    expect(collider?.kind).toBe("door-segment");
    expect(collider?.channels.bullets).toBe(true);
  });

  it("does not require an interaction key to open a door", () => {
    const state = createInitialGameState();
    const door = state.doors[0];

    state.player.position = { x: door.hinge.x + 16, y: door.hinge.y + 28 };
    applyDoorPressure(state, state.player.position, state.player.radius);
    updateDoors(state, 120);

    expect(door.angle).not.toBe(door.closedAngle);
  });

  it("opens when the actor presses near the handle end", () => {
    const state = createInitialGameState();
    const door = state.doors[0];
    const end = doorEnd(door);

    applyDoorPressure(state, { x: end.x + 10, y: end.y + 8 }, 18);
    updateDoors(state, 120);

    expect(door.angle).not.toBe(door.closedAngle);
  });

  it("uses standardized single and double reception-hub doors", () => {
    const state = createInitialGameState();
    const singleDoors = state.doors.filter((door) => door.id.includes("single"));
    const doubleDoors = state.doors.filter((door) => door.id.includes("double"));

    expect(singleDoors).toHaveLength(0);
    expect(doubleDoors).toHaveLength(8);
    expect(state.doors.every((door) => door.assetKey === "scifi-door")).toBe(true);
    expect(state.doors.every((door) => door.length === 56)).toBe(true);
    expect(state.doors.every((door) => door.thickness === 7)).toBe(true);
    expect(state.doors.every((door) => door.blocksBullets)).toBe(true);
  });
});
