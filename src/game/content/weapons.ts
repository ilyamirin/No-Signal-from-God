import type { WeaponKind, WeaponState } from "../simulation/types";

const createPistol = (id: string): WeaponState => ({
  id,
  kind: "pistol",
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

const createRifle = (id: string): WeaponState => ({
  id,
  kind: "rifle",
  label: "12rnd burst rifle",
  loadedRounds: 12,
  magazineSize: 12,
  reserveRounds: 36,
  fireCooldownMs: 105,
  reloadDelayMs: 820,
  cooldownRemainingMs: 0,
  reloadRemainingMs: 0,
  bulletSpeed: 920,
  damage: 1,
});

export const createWeapon = (id: string, kind: WeaponKind): WeaponState =>
  kind === "rifle" ? createRifle(id) : createPistol(id);

export const createStarterWeapons = (): Record<string, WeaponState> => ({
  "service-pistol": createPistol("service-pistol"),
  "enemy-ranged-anchor-pistol": createPistol("enemy-ranged-anchor-pistol"),
  "enemy-ranged-control-pistol": createPistol("enemy-ranged-control-pistol"),
  "enemy-ranged-green-pistol": createPistol("enemy-ranged-green-pistol"),
  "enemy-ranged-office-rifle": createRifle("enemy-ranged-office-rifle"),
  "floor-rifle-1": createRifle("floor-rifle-1"),
  "floor-pistol-1": createPistol("floor-pistol-1"),
});
