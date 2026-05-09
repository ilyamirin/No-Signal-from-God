import type { WeaponState } from "../simulation/types";

const createPistol = (id: string): WeaponState => ({
  id,
  label: "6rnd service pistol",
  loadedRounds: 6,
  magazineSize: 6,
  reserveRounds: 24,
  fireCooldownMs: 150,
  reloadDelayMs: 680,
  cooldownRemainingMs: 0,
  reloadRemainingMs: 0,
  bulletSpeed: 780,
  damage: 1,
});

export const createStarterWeapons = (): Record<string, WeaponState> => ({
  "service-pistol": createPistol("service-pistol"),
  "enemy-ranged-anchor-pistol": createPistol("enemy-ranged-anchor-pistol"),
  "enemy-ranged-control-pistol": createPistol("enemy-ranged-control-pistol"),
  "enemy-ranged-green-pistol": createPistol("enemy-ranged-green-pistol"),
});
