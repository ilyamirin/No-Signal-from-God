import type { Collider, DoorState, GameState, Vec2 } from "../types";

const DOOR_SPEED = 0.007;

const doorEnd = (door: DoorState): Vec2 => ({
  x: door.hinge.x + Math.cos(door.angle) * door.length,
  y: door.hinge.y + Math.sin(door.angle) * door.length,
});

export const doorToCollider = (door: DoorState): Collider => ({
  id: `door-${door.id}`,
  kind: "door-segment",
  start: door.hinge,
  end: doorEnd(door),
  thickness: door.thickness,
  channels: {
    movement: true,
    bullets: door.blocksBullets,
    vision: door.blocksBullets,
    sound: false,
  },
});

export const syncDoorColliders = (state: GameState): void => {
  const doorColliderIds = new Set(state.doors.map((door) => `door-${door.id}`));
  state.colliders = state.colliders.filter((collider) => !doorColliderIds.has(collider.id));
  state.colliders.push(...state.doors.map(doorToCollider));
};

export const toggleDoor = (door: DoorState): void => {
  const opening = door.state === "closed" || door.state === "closing";
  door.targetAngle = opening ? door.openAngle : door.closedAngle;
  door.state = opening ? "opening" : "closing";
};

export const updateDoors = (state: GameState, deltaMs: number): void => {
  for (const door of state.doors) {
    const remaining = door.targetAngle - door.angle;
    if (Math.abs(remaining) < 0.01) {
      door.angle = door.targetAngle;
      door.state = door.targetAngle === door.openAngle ? "open" : "closed";
      continue;
    }

    const step = Math.sign(remaining) * Math.min(Math.abs(remaining), DOOR_SPEED * deltaMs);
    door.angle += step;
  }

  syncDoorColliders(state);
};
