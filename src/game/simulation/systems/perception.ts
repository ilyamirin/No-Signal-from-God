import { angleDelta, angleTo, distance, distanceToSegment } from "../geometry";
import { hasLineOfSightThroughColliders } from "../collision";
import type { EnemyState, GameState, SoundEvent, Vec2 } from "../types";

export const canEnemySeePlayer = (state: GameState, enemy: EnemyState): boolean => {
  if (!state.player.alive) {
    return false;
  }

  const playerDistance = distance(enemy.position, state.player.position);
  if (playerDistance > enemy.ai.perception.visionRange) {
    return false;
  }

  const toPlayer = angleTo(enemy.position, state.player.position);
  if (Math.abs(angleDelta(enemy.facing, toPlayer)) > enemy.ai.perception.visionAngle / 2) {
    return false;
  }

  return hasLineOfSightThroughColliders(state.colliders, enemy.position, state.player.position, "vision");
};

export const canEnemyHearSound = (state: GameState, enemy: EnemyState, sound: SoundEvent): boolean => {
  if (sound.sourceId === enemy.id) {
    return false;
  }

  const effectiveRange = Math.min(enemy.ai.perception.hearingRange, sound.radius);
  if (distance(enemy.position, sound.position) > effectiveRange) {
    return false;
  }

  return hasLineOfSightThroughColliders(state.colliders, enemy.position, sound.position, "sound");
};

export const nearestHeardSound = (state: GameState, enemy: EnemyState): SoundEvent | undefined =>
  state.soundEvents.find((sound) => canEnemyHearSound(state, enemy, sound));

export const hasFriendlyInLineOfFire = (
  state: GameState,
  shooter: EnemyState,
  target: Vec2,
): boolean => {
  const targetDistance = distance(shooter.position, target);

  return state.enemies.some((candidate) => {
    if (!candidate.alive || candidate.id === shooter.id) {
      return false;
    }

    const candidateDistance = distance(shooter.position, candidate.position);
    if (candidateDistance >= targetDistance) {
      return false;
    }

    return distanceToSegment(candidate.position, shooter.position, target) <= candidate.radius + 6;
  });
};
