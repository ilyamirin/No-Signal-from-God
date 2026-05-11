import type { EnemyState, PlayerState, WeaponState } from "../../game/simulation/types";

export type ActorAnimationInput = Pick<PlayerState | EnemyState, "id" | "alive" | "weaponId"> & {
  animation?: PlayerState["animation"] | EnemyState["animation"];
};

export const playerAnimationFor = (
  actor: ActorAnimationInput,
  weapon: WeaponState | undefined,
  moving: boolean,
  shooting: boolean,
): string => {
  const weaponKind = weapon?.kind ?? actor.animation?.weaponKind;
  if (!weaponKind || !actor.weaponId) {
    return "scifi-player-unarmed-idle";
  }
  const suffix = weaponKind === "rifle" ? "rifle" : "pistol";

  if (actor.animation?.intent === "reload") {
    return `scifi-player-reload-${suffix}`;
  }
  if (shooting || actor.animation?.intent === "shoot") {
    return `scifi-player-shoot-${suffix}`;
  }
  return moving ? `scifi-player-run-${suffix}` : `scifi-player-idle-${suffix}`;
};

export const playerLegsAnimationFor = (
  actor: ActorAnimationInput,
  moving: boolean,
): string | undefined => {
  if (actor.id !== "player" || !actor.alive) {
    return undefined;
  }
  if (!moving) {
    return "scifi-player-legs-idle";
  }
  return actor.animation?.intent === "run" ? "scifi-player-legs-run" : "scifi-player-legs-walk";
};

export const enemyLegsAnimationFor = (
  actor: ActorAnimationInput,
  moving: boolean,
): string | undefined => {
  if (actor.id === "player" || !actor.alive) {
    return undefined;
  }
  if (!moving) {
    return "scifi-enemy-legs-idle";
  }
  return actor.animation?.intent === "run" ? "scifi-enemy-legs-run" : "scifi-enemy-legs-walk";
};
