import { circleIntersectsRect, pointInRect } from "./geometry";
import type { Collider, CollisionChannel, Vec2 } from "./types";

const distanceToSegment = (point: Vec2, start: Vec2, end: Vec2): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }

  const t = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared),
  );
  const projected = { x: start.x + t * dx, y: start.y + t * dy };
  return Math.hypot(point.x - projected.x, point.y - projected.y);
};

export const blocksChannelAtPoint = (
  colliders: Collider[],
  channel: CollisionChannel,
  point: Vec2,
): boolean =>
  colliders.some((collider) => {
    if (!collider.channels[channel]) {
      return false;
    }

    if (collider.kind === "rect") {
      return pointInRect(point, collider.rect);
    }

    return distanceToSegment(point, collider.start, collider.end) <= collider.thickness / 2;
  });

export const blocksMovementAtCircle = (
  colliders: Collider[],
  center: Vec2,
  radius: number,
): boolean =>
  colliders.some((collider) => {
    if (!collider.channels.movement) {
      return false;
    }

    if (collider.kind === "rect") {
      return circleIntersectsRect(center, radius, collider.rect);
    }

    return distanceToSegment(center, collider.start, collider.end) <= radius + collider.thickness / 2;
  });

export const hasLineOfSightThroughColliders = (
  colliders: Collider[],
  from: Vec2,
  to: Vec2,
  channel: CollisionChannel,
  step = 8,
): boolean => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.hypot(dx, dy);
  const samples = Math.max(1, Math.ceil(length / step));

  for (let index = 1; index < samples; index += 1) {
    const t = index / samples;
    if (blocksChannelAtPoint(colliders, channel, { x: from.x + dx * t, y: from.y + dy * t })) {
      return false;
    }
  }

  return true;
};

export const rectToCollider = (id: string, rect: { x: number; y: number; width: number; height: number }, bullets = true): Collider => ({
  id,
  kind: "rect",
  rect,
  channels: {
    movement: true,
    bullets,
    vision: bullets,
    sound: bullets,
  },
});
