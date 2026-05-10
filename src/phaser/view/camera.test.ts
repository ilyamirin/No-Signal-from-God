import { describe, expect, it } from "vitest";
import {
  AIM_OFFSET,
  FOLLOW_LERP,
  SHOT_SHAKE_DURATION_MS,
  SHOT_SHAKE_INTENSITY,
  calculateCameraTarget,
} from "./cameraMath";

describe("calculateCameraTarget", () => {
  it("adds a limited aim offset toward the mouse", () => {
    const target = calculateCameraTarget(
      { x: 500, y: 500 },
      { x: 900, y: 500 },
      { width: 2200, height: 1500 },
      { width: 1366, height: 768 },
      1.35,
    );

    expect(target.x).toBe(580);
    expect(target.y).toBe(500);
  });

  it("clamps the target so the camera does not show empty map edges", () => {
    const target = calculateCameraTarget(
      { x: 90, y: 80 },
      { x: 0, y: 0 },
      { width: 2200, height: 1500 },
      { width: 1366, height: 768 },
      1.35,
    );

    expect(target.x).toBeCloseTo(505.93, 1);
    expect(target.y).toBeCloseTo(284.44, 1);
  });

  it("uses conservative aim offset and follow lerp to avoid jitter", () => {
    expect(AIM_OFFSET).toBeLessThanOrEqual(80);
    expect(FOLLOW_LERP).toBeLessThanOrEqual(0.055);
    expect(SHOT_SHAKE_DURATION_MS).toBeLessThanOrEqual(35);
    expect(SHOT_SHAKE_INTENSITY).toBeLessThanOrEqual(0.002);
  });
});
