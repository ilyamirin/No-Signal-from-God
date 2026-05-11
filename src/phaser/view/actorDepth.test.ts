import { describe, expect, it } from "vitest";
import { actorDepthFor, CORPSE_ACTOR_DEPTH, LIVE_ACTOR_DEPTH } from "./actorDepth";

describe("actorDepthFor", () => {
  it("renders corpses under live actors", () => {
    expect(actorDepthFor(false)).toBe(CORPSE_ACTOR_DEPTH);
    expect(actorDepthFor(true)).toBe(LIVE_ACTOR_DEPTH);
    expect(actorDepthFor(false)).toBeLessThan(actorDepthFor(true));
  });
});
