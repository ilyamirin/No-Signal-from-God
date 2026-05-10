import type { Box, Rect, Vec2 } from "./types";

export const vec = (x = 0, y = 0): Vec2 => ({ x, y });

export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });

export const scale = (value: Vec2, amount: number): Vec2 => ({
  x: value.x * amount,
  y: value.y * amount,
});

export const length = (value: Vec2): number => Math.hypot(value.x, value.y);

export const normalize = (value: Vec2): Vec2 => {
  const magnitude = length(value);
  return magnitude === 0 ? vec(0, 0) : vec(value.x / magnitude, value.y / magnitude);
};

export const angleTo = (from: Vec2, to: Vec2): number => Math.atan2(to.y - from.y, to.x - from.x);

export const fromAngle = (angle: number): Vec2 => ({ x: Math.cos(angle), y: Math.sin(angle) });

export const distance = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);

export const clampToArena = (position: Vec2, radius: number, width: number, height: number): Vec2 => ({
  x: Math.max(radius, Math.min(width - radius, position.x)),
  y: Math.max(radius, Math.min(height - radius, position.y)),
});

export const pointInRect = (point: Vec2, rect: Box): boolean =>
  point.x >= rect.x &&
  point.x <= rect.x + rect.width &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.height;

export const circleIntersectsRect = (center: Vec2, radius: number, rect: Box): boolean => {
  const closestX = Math.max(rect.x, Math.min(center.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(center.y, rect.y + rect.height));
  return Math.hypot(center.x - closestX, center.y - closestY) < radius;
};

const segmentIntersectsRect = (from: Vec2, to: Vec2, rect: Box): boolean => {
  if (pointInRect(from, rect) || pointInRect(to, rect)) {
    return true;
  }

  const direction = {
    x: to.x - from.x,
    y: to.y - from.y,
  };
  let minT = 0;
  let maxT = 1;

  const clip = (edgeDirection: number, edgeDistance: number): boolean => {
    if (edgeDirection === 0) {
      return edgeDistance >= 0;
    }

    const t = edgeDistance / edgeDirection;
    if (edgeDirection < 0) {
      if (t > maxT) {
        return false;
      }
      minT = Math.max(minT, t);
    } else {
      if (t < minT) {
        return false;
      }
      maxT = Math.min(maxT, t);
    }
    return true;
  };

  return (
    clip(-direction.x, from.x - rect.x) &&
    clip(direction.x, rect.x + rect.width - from.x) &&
    clip(-direction.y, from.y - rect.y) &&
    clip(direction.y, rect.y + rect.height - from.y)
  );
};

export const hasLineOfSight = (from: Vec2, to: Vec2, blockers: Rect[]): boolean => {
  return !blockers.some((blocker) => blocker.blocksBullets && segmentIntersectsRect(from, to, blocker));
};
