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
  "security-guard-pistol": createPistol("security-guard-pistol"),
  "newsroom-guard-left-pistol": createPistol("newsroom-guard-left-pistol"),
  "newsroom-guard-right-pistol": createPistol("newsroom-guard-right-pistol"),
  "server-guard-rifle": createRifle("server-guard-rifle"),
  "control-guard-pistol": createPistol("control-guard-pistol"),
  "control-guard-rifle": createRifle("control-guard-rifle"),
  "floor-pistol-reception": createPistol("floor-pistol-reception"),
  "floor-rifle-server": createRifle("floor-rifle-server"),
});
