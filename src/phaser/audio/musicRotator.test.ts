import { describe, expect, it } from "vitest";

import { pickNextMusicTrack } from "./musicSelection";

const tracks = [
  { key: "a" },
  { key: "b" },
  { key: "c" },
];

describe("pickNextMusicTrack", () => {
  it("picks a random track from the rotation", () => {
    expect(pickNextMusicTrack(tracks, undefined, () => 0.7)).toEqual({ key: "c" });
  });

  it("avoids repeating the previous track when alternatives exist", () => {
    expect(pickNextMusicTrack(tracks, "b", () => 0.01)).toEqual({ key: "a" });
    expect(pickNextMusicTrack(tracks, "b", () => 0.99)).toEqual({ key: "c" });
  });

  it("allows the only available track to repeat", () => {
    expect(pickNextMusicTrack([{ key: "only" }], "only", () => 0.99)).toEqual({
      key: "only",
    });
  });

  it("rejects an empty rotation", () => {
    expect(() => pickNextMusicTrack([], undefined, () => 0)).toThrow(
      "Cannot pick a background music track",
    );
  });
});
