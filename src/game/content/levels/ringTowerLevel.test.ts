import { describe, expect, it } from "vitest";
import { createRingTowerLevel } from "./ringTowerLevel";
import { ringTowerLayout } from "./ringTowerLayout";

describe("ring tower level", () => {
  it("defines a larger ring tower map with authored route targets", () => {
    const level = createRingTowerLevel();

    expect(level.id).toBe("ring-tower");
    expect(level.arena.width).toBe(3200);
    expect(level.arena.height).toBe(2700);
    expect(Object.keys(ringTowerLayout.routeTargets)).toEqual([
      "lobby",
      "reception",
      "newsStudio",
      "controlRoom",
      "techRoom",
      "backstage",
      "equipmentStore",
      "finalStudio",
      "exitLift",
    ]);
  });

  it("starts unarmed and places the first pistol in reception", () => {
    const level = createRingTowerLevel();

    expect(level.playerLoadout).toEqual({ kind: "unarmed" });
    expect(level.droppedWeapons).toContainEqual(
      expect.objectContaining({
        id: "ring-drop-first-pistol",
        weaponId: "ring-floor-first-pistol",
        kind: "pistol",
      }),
    );
    expect(level.weapons["ring-floor-first-pistol"]?.kind).toBe("pistol");
  });

  it("routes the tower clockwise through rooms instead of a direct lobby shortcut", () => {
    const level = createRingTowerLevel();
    const doorIds = level.doors.map((door) => door.id);

    expect(doorIds).toEqual(
      expect.arrayContaining([
        "ring-lift-door-upper",
        "ring-lobby-reception-upper",
        "ring-reception-studio-left",
        "ring-studio-control-upper",
        "ring-control-tech-upper",
        "ring-tech-backstage-left",
        "ring-backstage-lobby-upper",
        "ring-final-entry-left",
      ]),
    );
    expect(doorIds).not.toContain("ring-control-lobby-left");
    expect(ringTowerLayout.routeTargets.lobby.x).toBeLessThan(ringTowerLayout.center.x);
  });

  it("uses final fight then exit victory", () => {
    const level = createRingTowerLevel();

    expect(level.victory.kind).toBe("finalFightThenExit");
    if (level.victory.kind === "finalFightThenExit") {
      expect(level.victory.finalEnemyIds.length).toBeGreaterThanOrEqual(3);
      expect(level.victory.exitTrigger).toEqual(ringTowerLayout.exitLiftTrigger);
    }
  });

  it("contains every required zone as floor regions", () => {
    const floorIds = createRingTowerLevel().arena.floorRegions.map((region) => region.id);

    expect(floorIds).toEqual(
      expect.arrayContaining([
        "ring-lobby-floor",
        "ring-reception-floor",
        "ring-talk-studio-floor",
        "ring-control-floor",
        "ring-backstage-floor",
        "ring-final-studio-floor",
      ]),
    );
  });
});
