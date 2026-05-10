import { describe, expect, it } from "vitest";
import { blocksChannelAtPoint, blocksMovementAtCircle } from "./collision";
import type { Collider } from "./types";

const softCover: Collider = {
  id: "table-soft-cover",
  kind: "rect",
  rect: { x: 10, y: 10, width: 40, height: 20 },
  channels: {
    movement: true,
    bullets: false,
    vision: false,
    sound: false,
  },
};

const column: Collider = {
  id: "column-hard-cover",
  kind: "rect",
  rect: { x: 100, y: 100, width: 30, height: 30 },
  channels: {
    movement: true,
    bullets: true,
    vision: true,
    sound: true,
  },
};

describe("channel-aware collision", () => {
  it("soft cover blocks movement but not bullets, vision, or sound", () => {
    expect(blocksMovementAtCircle([softCover], { x: 20, y: 20 }, 8)).toBe(true);
    expect(blocksChannelAtPoint([softCover], "bullets", { x: 20, y: 20 })).toBe(false);
    expect(blocksChannelAtPoint([softCover], "vision", { x: 20, y: 20 })).toBe(false);
    expect(blocksChannelAtPoint([softCover], "sound", { x: 20, y: 20 })).toBe(false);
  });

  it("hard cover blocks movement, bullets, vision, and sound", () => {
    expect(blocksMovementAtCircle([column], { x: 112, y: 112 }, 8)).toBe(true);
    expect(blocksChannelAtPoint([column], "bullets", { x: 112, y: 112 })).toBe(true);
    expect(blocksChannelAtPoint([column], "vision", { x: 112, y: 112 })).toBe(true);
    expect(blocksChannelAtPoint([column], "sound", { x: 112, y: 112 })).toBe(true);
  });
});
