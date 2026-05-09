import type { Rect, Vec2 } from "./types";

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

export const pointInRect = (point: Vec2, rect: Rect): boolean =>
  point.x >= rect.x &&
  point.x <= rect.x + rect.width &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.height;

export const circleIntersectsRect = (center: Vec2, radius: number, rect: Rect): boolean => {
  const closestX = Math.max(rect.x, Math.min(center.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(center.y, rect.y + rect.height));
  return Math.hypot(center.x - closestX, center.y - closestY) < radius;
};

export const hasLineOfSight = (from: Vec2, to: Vec2, blockers: Rect[]): boolean => {
  const steps = Math.max(8, Math.ceil(distance(from, to) / 18));
  for (let index = 1; index < steps; index += 1) {
    const t = index / steps;
    const probe = {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    };
    if (blockers.some((blocker) => blocker.blocksBullets && pointInRect(probe, blocker))) {
      return false;
    }
  }
  return true;
};
