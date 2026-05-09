import type { WeaponState } from "../simulation/types";

export const createStarterWeapons = (): Record<string, WeaponState> => ({
  "service-pistol": {
    id: "service-pistol",
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
  },
});
