import { fromAngle, scale } from "../geometry";
import type { BulletState, FxState, GameState, Vec2, WeaponState } from "../types";

const nextId = (state: GameState, prefix: string): string => `${prefix}-${state.nextId++}`;

const reduceTimer = (value: number, deltaMs: number): number => Math.max(0, value - deltaMs);

export const tickWeapon = (weapon: WeaponState, deltaMs: number): void => {
  const wasReloading = weapon.reloadRemainingMs > 0;
  weapon.cooldownRemainingMs = reduceTimer(weapon.cooldownRemainingMs, deltaMs);
  weapon.reloadRemainingMs = reduceTimer(weapon.reloadRemainingMs, deltaMs);

  if (wasReloading && weapon.reloadRemainingMs === 0 && weapon.loadedRounds === 0 && weapon.reserveRounds > 0) {
    const roundsToLoad = Math.min(weapon.magazineSize, weapon.reserveRounds);
    weapon.loadedRounds = roundsToLoad;
    weapon.reserveRounds -= roundsToLoad;
  }
};

export const tryFireWeapon = (
  state: GameState,
  ownerId: string,
  weaponId: string,
  origin: Vec2,
  angle: number,
): BulletState | undefined => {
  const weapon = state.weapons[weaponId];
  if (!weapon || weapon.cooldownRemainingMs > 0 || weapon.reloadRemainingMs > 0) {
    return undefined;
  }

  if (weapon.loadedRounds <= 0) {
    if (weapon.reserveRounds > 0) {
      weapon.reloadRemainingMs = weapon.reloadDelayMs;
    }
    return undefined;
  }

  const direction = fromAngle(angle);
  const muzzlePosition = {
    x: origin.x + direction.x * 24,
    y: origin.y + direction.y * 24,
  };
  const bullet: BulletState = {
    id: nextId(state, "bullet"),
    ownerId,
    position: muzzlePosition,
    velocity: scale(direction, weapon.bulletSpeed),
    damage: weapon.damage,
    ttlMs: 900,
  };
  const muzzleFx: FxState = {
    id: nextId(state, "fx"),
    kind: "muzzle",
    position: muzzlePosition,
    rotation: angle,
    ttlMs: 90,
  };
  const casingFx: FxState = {
    id: nextId(state, "fx"),
    kind: "casing",
    position: { ...origin },
    rotation: angle + Math.PI / 2,
    ttlMs: 450,
  };

  state.bullets.push(bullet);
  state.fx.push(muzzleFx, casingFx);
  weapon.loadedRounds -= 1;
  weapon.cooldownRemainingMs = weapon.fireCooldownMs;

  if (weapon.loadedRounds === 0 && weapon.reserveRounds > 0) {
    weapon.reloadRemainingMs = weapon.reloadDelayMs;
  }

  return bullet;
};
