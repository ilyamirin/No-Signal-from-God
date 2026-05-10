import { angleTo, distance, fromAngle, scale } from "../geometry";
import type { DroppedWeaponState, GameState, WeaponKind } from "../types";

const PICKUP_RADIUS = 42;
const FRICTION = 0.88;

const reduceTimer = (value: number, deltaMs: number): number => Math.max(0, value - deltaMs);

const nextDropId = (state: GameState): string => `drop-${state.nextId++}`;

export const nearestDroppedWeapon = (state: GameState): DroppedWeaponState | undefined => {
  let best: DroppedWeaponState | undefined;
  let bestDistance = Infinity;

  for (const weapon of state.droppedWeapons) {
    if (weapon.pickupCooldownMs > 0) {
      continue;
    }
    const current = distance(state.player.position, weapon.position);
    if (current < PICKUP_RADIUS && current < bestDistance) {
      best = weapon;
      bestDistance = current;
    }
  }

  return best;
};

export const throwHeldWeapon = (
  state: GameState,
  weaponId: string,
  kind: WeaponKind,
  angle: number,
): void => {
  const direction = fromAngle(angle);
  state.droppedWeapons.push({
    id: nextDropId(state),
    weaponId,
    kind,
    position: {
      x: state.player.position.x + direction.x * 28,
      y: state.player.position.y + direction.y * 28,
    },
    velocity: scale(direction, 520),
    rotation: angle,
    angularVelocity: 10,
    pickupCooldownMs: 420,
  });
};

export const tryPickupWeapon = (state: GameState): boolean => {
  const target = nearestDroppedWeapon(state);
  if (!target) {
    return false;
  }

  const currentWeaponId = state.player.weaponId;
  const currentWeapon = currentWeaponId ? state.weapons[currentWeaponId] : undefined;
  const throwAngle = angleTo(target.position, state.player.position) + Math.PI;

  if (currentWeapon && currentWeaponId) {
    throwHeldWeapon(state, currentWeaponId, currentWeapon.kind, throwAngle);
  }

  state.player.weaponId = target.weaponId;
  state.droppedWeapons = state.droppedWeapons.filter((weapon) => weapon.id !== target.id);
  return true;
};

export const updateDroppedWeapons = (state: GameState, deltaMs: number): void => {
  const deltaSeconds = deltaMs / 1000;

  for (const weapon of state.droppedWeapons) {
    weapon.pickupCooldownMs = reduceTimer(weapon.pickupCooldownMs, deltaMs);
    weapon.position.x += weapon.velocity.x * deltaSeconds;
    weapon.position.y += weapon.velocity.y * deltaSeconds;
    weapon.rotation += weapon.angularVelocity * deltaSeconds;
    weapon.velocity.x *= FRICTION;
    weapon.velocity.y *= FRICTION;
    weapon.angularVelocity *= FRICTION;

    if (Math.hypot(weapon.velocity.x, weapon.velocity.y) < 6) {
      weapon.velocity = { x: 0, y: 0 };
      weapon.angularVelocity = 0;
    }
  }
};
