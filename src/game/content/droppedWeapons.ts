import type { DroppedWeaponState } from "../simulation/types";

export const createDroppedWeapons = (): DroppedWeaponState[] => [
  {
    id: "drop-rifle-center",
    weaponId: "floor-rifle-1",
    kind: "rifle",
    position: { x: 675, y: 300 },
    velocity: { x: 0, y: 0 },
    rotation: -0.25,
    angularVelocity: 0,
    pickupCooldownMs: 0,
  },
  {
    id: "drop-pistol-right",
    weaponId: "floor-pistol-1",
    kind: "pistol",
    position: { x: 1000, y: 356 },
    velocity: { x: 0, y: 0 },
    rotation: 0.55,
    angularVelocity: 0,
    pickupCooldownMs: 0,
  },
];
