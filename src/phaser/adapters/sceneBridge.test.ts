import { describe, expect, it } from "vitest";
import { createSceneBridge, levelIdFromSearch } from "./sceneBridge";

describe("scene bridge level selection", () => {
  it("reads ring tower as the default level", () => {
    expect(levelIdFromSearch("")).toBe("ring-tower");
  });

  it("reads reception hub from URL query", () => {
    expect(levelIdFromSearch("?level=reception-hub")).toBe("reception-hub");
  });

  it("creates state for the selected level", () => {
    const bridge = createSceneBridge("reception-hub");

    expect(bridge.getState().level.id).toBe("reception-hub");
  });
});
