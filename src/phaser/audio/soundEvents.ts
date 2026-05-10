import { distance } from "../../game/simulation/geometry";
import type { GameState, WeaponKind } from "../../game/simulation/types";

export type SoundEvent =
  | "shot-pistol"
  | "shot-rifle"
  | "footstep"
  | "door-move"
  | "monster-attack";

const FOOTSTEP_CADENCE_MS = 280;
const WALKING_SPEED = 40;
const DOOR_MOVE_EPSILON = 0.025;
const MONSTER_ATTACK_SOUND_DISTANCE = 70;

const shotEventFor = (kind: WeaponKind): SoundEvent =>
  kind === "rifle" ? "shot-rifle" : "shot-pistol";

const crossedCadence = (previousMs: number, currentMs: number, cadenceMs: number): boolean =>
  Math.floor(previousMs / cadenceMs) < Math.floor(currentMs / cadenceMs);

const doorMoved = (previous: GameState, current: GameState): boolean =>
  current.doors.some((door) => {
    const previousDoor = previous.doors.find((candidate) => candidate.id === door.id);
    return previousDoor !== undefined && Math.abs(door.angle - previousDoor.angle) > DOOR_MOVE_EPSILON;
  });

const nearbyMeleeEnemy = (state: GameState): boolean =>
  state.enemies.some(
    (enemy) =>
      enemy.alive &&
      enemy.archetype === "monster_melee" &&
      distance(enemy.position, state.player.position) <= MONSTER_ATTACK_SOUND_DISTANCE,
  );

export const collectSoundEvents = (previous: GameState, current: GameState): SoundEvent[] => {
  const events: SoundEvent[] = [];

  for (const weapon of Object.values(current.weapons)) {
    const previousWeapon = previous.weapons[weapon.id];
    if (previousWeapon && weapon.loadedRounds < previousWeapon.loadedRounds) {
      events.push(shotEventFor(weapon.kind));
    }
  }

  if (
    Math.hypot(current.player.velocity.x, current.player.velocity.y) >= WALKING_SPEED &&
    crossedCadence(previous.elapsedMs, current.elapsedMs, FOOTSTEP_CADENCE_MS)
  ) {
    events.push("footstep");
  }

  if (doorMoved(previous, current)) {
    events.push("door-move");
  }

  if (current.player.health < previous.player.health && nearbyMeleeEnemy(current)) {
    events.push("monster-attack");
  }

  return events;
};
