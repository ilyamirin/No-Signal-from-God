import type { Vec2 } from "../../game/simulation/types";

export const CAMERA_ZOOM = 1.35;
export const AIM_OFFSET = 100;
export const FOLLOW_LERP = 0.1;

type Size = {
  width: number;
  height: number;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const calculateCameraTarget = (
  playerPosition: Vec2,
  aimWorld: Vec2,
  mapSize: Size,
  viewportSize: Size,
  zoom = CAMERA_ZOOM,
): Vec2 => {
  const dx = aimWorld.x - playerPosition.x;
  const dy = aimWorld.y - playerPosition.y;
  const length = Math.hypot(dx, dy) || 1;
  const desired = {
    x: playerPosition.x + (dx / length) * AIM_OFFSET,
    y: playerPosition.y + (dy / length) * AIM_OFFSET,
  };

  const halfWidth = viewportSize.width / zoom / 2;
  const halfHeight = viewportSize.height / zoom / 2;

  return {
    x: clamp(desired.x, halfWidth, mapSize.width - halfWidth),
    y: clamp(desired.y, halfHeight, mapSize.height - halfHeight),
  };
};

export const lerp = (from: number, to: number, amount: number): number =>
  from + (to - from) * amount;
