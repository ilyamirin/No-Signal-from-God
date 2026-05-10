import { describe, expect, it } from "vitest";
import { parallaxPosition } from "./drawLevelBackground";

describe("parallaxPosition", () => {
  it("moves slower than camera scroll", () => {
    expect(parallaxPosition(1000, 0.35)).toBe(-350);
    expect(parallaxPosition(1000, 0.65)).toBe(-650);
  });
});
