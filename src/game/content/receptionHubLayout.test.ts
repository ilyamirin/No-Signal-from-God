import { describe, expect, it } from "vitest";
import { createArena } from "./arena";
import { receptionHubLayout } from "./receptionHubLayout";

describe("reception hub layout", () => {
  it("is larger than the fixed 16:9 camera frame", () => {
    expect(receptionHubLayout.size.width).toBe(2200);
    expect(receptionHubLayout.size.height).toBe(1500);
    expect(receptionHubLayout.size.width).toBeGreaterThan(1366);
    expect(receptionHubLayout.size.height).toBeGreaterThan(768);
  });

  it("keeps the player spawn inside the safe reception room", () => {
    const { playerSpawn, rooms } = receptionHubLayout;
    expect(playerSpawn.x).toBeGreaterThan(rooms.reception.x);
    expect(playerSpawn.x).toBeLessThan(rooms.reception.x + rooms.reception.width);
    expect(playerSpawn.y).toBeGreaterThan(rooms.reception.y);
    expect(playerSpawn.y).toBeLessThan(rooms.reception.y + rooms.reception.height);
  });

  it("draws floor regions for each authored room", () => {
    const arena = createArena();
    expect(arena.floorRegions.map((region) => region.id).sort()).toEqual([
      "broadcast-control-floor",
      "newsroom-floor",
      "reception-floor",
      "reception-newsroom-corridor-floor",
      "reception-security-corridor-floor",
      "security-control-corridor-floor",
      "security-floor",
      "security-server-corridor-floor",
      "server-archive-floor",
    ]);
  });

  it("does not put hard arena walls over the safe player spawn", () => {
    const arena = createArena();
    const { playerSpawn } = receptionHubLayout;
    const overlapping = arena.obstacles.filter((obstacle) =>
      playerSpawn.x >= obstacle.x &&
      playerSpawn.x <= obstacle.x + obstacle.width &&
      playerSpawn.y >= obstacle.y &&
      playerSpawn.y <= obstacle.y + obstacle.height,
    );

    expect(overlapping).toEqual([]);
  });
});
