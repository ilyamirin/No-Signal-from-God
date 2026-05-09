import { describe, expect, it } from "vitest";
import { actorParts, actorRigPresets, rigPresetForHead, weaponPoseCatalog } from "./actorParts";
import { createStarterWeapons } from "./weapons";

describe("actor part catalog", () => {
  it("keeps actor part, weapon pose, and rig ids unique", () => {
    const ids = [
      ...actorParts.map((part) => part.id),
      ...weaponPoseCatalog.map((pose) => pose.id),
      ...actorRigPresets.map((rig) => rig.id),
    ];

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("only references existing parts and weapon poses from rig presets", () => {
    const partIds = new Set(actorParts.map((part) => part.id));
    const poseIds = new Set(weaponPoseCatalog.map((pose) => pose.id));

    for (const rig of actorRigPresets) {
      expect(partIds.has(rig.legsPartId), `${rig.id} legs`).toBe(true);
      expect(partIds.has(rig.torsoPartId), `${rig.id} torso`).toBe(true);
      expect(partIds.has(rig.headPartId), `${rig.id} head`).toBe(true);
      if (rig.defaultWeaponPoseId) {
        expect(poseIds.has(rig.defaultWeaponPoseId), `${rig.id} weapon pose`).toBe(true);
      }
    }
  });

  it("only references existing arms and weapon parts from weapon poses", () => {
    const partIds = new Set(actorParts.map((part) => part.id));

    for (const pose of weaponPoseCatalog) {
      expect(partIds.has(pose.armsPartId), `${pose.id} arms`).toBe(true);
      expect(partIds.has(pose.weaponPartId), `${pose.id} weapon`).toBe(true);
    }
  });

  it("covers every current starter weapon with a reusable weapon pose", () => {
    const coveredWeaponIds = new Set(weaponPoseCatalog.flatMap((pose) => pose.weaponIds));

    for (const weaponId of Object.keys(createStarterWeapons())) {
      expect(coveredWeaponIds.has(weaponId), `${weaponId} pose`).toBe(true);
    }
  });

  it("maps current actor heads to starter rig presets", () => {
    expect(rigPresetForHead("crt", "player")).toBe("rig-player-crt-suit");
    expect(rigPresetForHead("crt", "ranged")).toBe("rig-enemy-crt-ranged");
    expect(rigPresetForHead("human", "ranged")).toBe("rig-enemy-human-ranged");
    expect(rigPresetForHead("human", "rush")).toBe("rig-enemy-human-rush");
  });
});
