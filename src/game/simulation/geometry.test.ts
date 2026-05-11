import { describe, expect, it } from "vitest";
import { angleDelta, distanceToSegment, hasLineOfSight } from "./geometry";
import type { Rect } from "./types";

describe("hasLineOfSight", () => {
  it("detects a segment crossing a thin bullet blocker", () => {
    const blockers: Rect[] = [
      {
        id: "thin-blocker",
        x: 44,
        y: -5,
        width: 2,
        height: 10,
        blocksMovement: true,
        blocksBullets: true,
      },
    ];

    expect(hasLineOfSight({ x: 0, y: 0 }, { x: 100, y: 0 }, blockers)).toBe(false);
  });

  it("keeps line of sight for a clear segment", () => {
    const blockers: Rect[] = [
      {
        id: "off-path-blocker",
        x: 44,
        y: 12,
        width: 2,
        height: 10,
        blocksMovement: true,
        blocksBullets: true,
      },
    ];

    expect(hasLineOfSight({ x: 0, y: 0 }, { x: 100, y: 0 }, blockers)).toBe(true);
  });
});

describe("angleDelta", () => {
  it("returns the smallest signed angle difference", () => {
    expect(angleDelta(Math.PI - 0.1, -Math.PI + 0.1)).toBeCloseTo(-0.2);
    expect(angleDelta(-Math.PI + 0.1, Math.PI - 0.1)).toBeCloseTo(0.2);
  });
});

describe("distanceToSegment", () => {
  it("measures the closest distance to a finite line segment", () => {
    expect(distanceToSegment({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(3);
    expect(distanceToSegment({ x: 14, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(5);
  });
});
