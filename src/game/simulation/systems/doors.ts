import type { Collider, DoorState, GameState, Vec2 } from "../types";

const DOOR_FRICTION = 0.94;
const DOOR_SPRING = 0.000004;
const DOOR_PUSH = 0.055;
const DOOR_CONTACT_PADDING = 12;

export const doorEnd = (door: DoorState): Vec2 => ({
  x: door.hinge.x + Math.cos(door.angle) * door.length,
  y: door.hinge.y + Math.sin(door.angle) * door.length,
});

const normalizeAngle = (angle: number): number => Math.atan2(Math.sin(angle), Math.cos(angle));

const clampDoorAngle = (door: DoorState): void => {
  if (door.angle < door.minAngle) {
    door.angle = door.minAngle;
    door.angularVelocity = Math.max(0, door.angularVelocity);
  } else if (door.angle > door.maxAngle) {
    door.angle = door.maxAngle;
    door.angularVelocity = Math.min(0, door.angularVelocity);
  }
};

const distanceToSegment = (point: Vec2, start: Vec2, end: Vec2): { distance: number; t: number } => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) {
    return { distance: Math.hypot(point.x - start.x, point.y - start.y), t: 0 };
  }

  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  const projected = { x: start.x + t * dx, y: start.y + t * dy };
  return { distance: Math.hypot(point.x - projected.x, point.y - projected.y), t };
};

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

export const applyDoorPressure = (
  state: GameState,
  position: Vec2,
  radius: number,
): void => {
  for (const door of state.doors) {
    const end = doorEnd(door);
    const contact = distanceToSegment(position, door.hinge, end);
    if (contact.t <= 0 || contact.t >= 1) {
      continue;
    }
    if (contact.distance > radius + door.thickness / 2 + DOOR_CONTACT_PADDING) {
      continue;
    }

    const angleToActor = Math.atan2(position.y - door.hinge.y, position.x - door.hinge.x);
    const side = Math.sign(normalizeAngle(angleToActor - door.angle)) || 1;
    const leverage = 0.25 + contact.t * 0.75;
    const pressure = 1 - contact.distance / (radius + door.thickness / 2 + DOOR_CONTACT_PADDING);
    door.angularVelocity -= side * pressure * leverage * DOOR_PUSH;
  }
};

export const updateDoors = (state: GameState, deltaMs: number): void => {
  for (const door of state.doors) {
    const springToClosed = normalizeAngle(door.closedAngle - door.angle) * DOOR_SPRING * deltaMs;
    door.angularVelocity += springToClosed;
    door.angle += door.angularVelocity * deltaMs;
    door.angularVelocity *= Math.pow(DOOR_FRICTION, deltaMs / 16);
    clampDoorAngle(door);

    const openAmount = Math.abs(normalizeAngle(door.angle - door.closedAngle));
    if (openAmount < 0.04 && Math.abs(door.angularVelocity) < 0.0004) {
      door.angle = door.closedAngle;
      door.angularVelocity = 0;
      door.state = "closed";
    } else {
      door.state = door.angularVelocity === 0 ? "open" : door.angularVelocity > 0 ? "opening" : "closing";
    }
  }

  syncDoorColliders(state);
};
