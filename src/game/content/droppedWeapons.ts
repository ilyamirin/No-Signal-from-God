import type { DroppedWeaponState } from "../simulation/types";

export const createDroppedWeapons = (): DroppedWeaponState[] => [
  {
    id: "drop-pistol-reception",
    weaponId: "floor-pistol-reception",
    kind: "pistol",
    position: { x: 470, y: 1015 },
    velocity: { x: 0, y: 0 },
    rotation: 0.2,
    angularVelocity: 0,
    pickupCooldownMs: 0,
  },
  {
    id: "drop-rifle-server",
    weaponId: "floor-rifle-server",
    kind: "rifle",
    position: { x: 1750, y: 1035 },
    velocity: { x: 0, y: 0 },
    rotation: -0.35,
    angularVelocity: 0,
    pickupCooldownMs: 0,
  },
];
