import { describe, expect, it } from "vitest";
import { createArena } from "./arena";
import { receptionHubLayout } from "./receptionHubLayout";
import { createInitialGameState } from "../simulation/state";
import { blocksMovementAtCircle } from "../simulation/collision";
import type { Collider, Vec2 } from "../simulation/types";

const canReach = (
  colliders: Collider[],
  from: Vec2,
  to: Vec2,
  radius: number,
  step = 32,
): boolean => {
  const state = createInitialGameState({ levelId: "reception-hub" });
  const widthSteps = Math.ceil(state.arena.width / step);
  const heightSteps = Math.ceil(state.arena.height / step);
  const toCell = (point: Vec2) => ({
    x: Math.max(0, Math.min(widthSteps - 1, Math.floor(point.x / step))),
    y: Math.max(0, Math.min(heightSteps - 1, Math.floor(point.y / step))),
  });
  const start = toCell(from);
  const goal = toCell(to);
  const queue = [start];
  const seen = new Set([`${start.x},${start.y}`]);

  while (queue.length > 0) {
    const cell = queue.shift();
    if (!cell) {
      continue;
    }
    if (cell.x === goal.x && cell.y === goal.y) {
      return true;
    }

    for (const next of [
      { x: cell.x + 1, y: cell.y },
      { x: cell.x - 1, y: cell.y },
      { x: cell.x, y: cell.y + 1 },
      { x: cell.x, y: cell.y - 1 },
    ]) {
      const key = `${next.x},${next.y}`;
      const point = { x: next.x * step + step / 2, y: next.y * step + step / 2 };
      if (
        seen.has(key) ||
        next.x < 0 ||
        next.y < 0 ||
        next.x >= widthSteps ||
        next.y >= heightSteps ||
        blocksMovementAtCircle(colliders, point, radius)
      ) {
        continue;
      }
      seen.add(key);
      queue.push(next);
    }
  }

  return false;
};

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

  it("keeps every authored room reachable from the player spawn when hinged doors are open", () => {
    const state = createInitialGameState({ levelId: "reception-hub" });
    const openDoorColliders = state.colliders.filter((collider) => !collider.id.startsWith("door-"));
    for (const [roomId, target] of Object.entries(receptionHubLayout.routeTargets)) {
      expect(
        canReach(openDoorColliders, state.player.position, target, state.player.radius),
        `${roomId} should be reachable from spawn`,
      ).toBe(true);
    }
  });
});
