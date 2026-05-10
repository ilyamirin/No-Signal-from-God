import { describe, expect, it } from "vitest";
import { DEFAULT_LEVEL_ID, getLevelDefinition, levelIds, resolveLevelId } from "./levelRegistry";

describe("level registry", () => {
  it("uses ring tower as the default level", () => {
    expect(DEFAULT_LEVEL_ID).toBe("ring-tower");
    expect(resolveLevelId(undefined)).toBe("ring-tower");
    expect(resolveLevelId("")).toBe("ring-tower");
  });

  it("keeps the old reception hub level available by id", () => {
    expect(levelIds).toEqual(expect.arrayContaining(["ring-tower", "reception-hub"]));
    expect(getLevelDefinition("reception-hub").id).toBe("reception-hub");
  });

  it("falls unknown level ids back to ring tower", () => {
    expect(resolveLevelId("missing-level")).toBe("ring-tower");
    expect(getLevelDefinition("missing-level").id).toBe("ring-tower");
  });
});
