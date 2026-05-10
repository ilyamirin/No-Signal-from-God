import type { PlayerInput } from "../input/actions";
import { resolveInteractionPrompt, performInteraction } from "./interactions";
import { createInitialGameState } from "./state";
import { angleTo, clampToArena, normalize, scale } from "./geometry";
import { blocksMovementAtCircle } from "./collision";
import type { GameState, Vec2 } from "./types";
import { updateBulletsAndHits, updateStatus } from "./systems/combat";
import { updateDroppedWeapons } from "./systems/droppedWeapons";
import { applyDoorPressure, updateDoors } from "./systems/doors";
import { updateEnemies } from "./systems/enemies";
import { updateActorAnimations } from "./systems/animation";
import { updateCorpseMotion } from "./systems/death";
import { tickWeapon, tryFireWeapon } from "./systems/weapons";

const PLAYER_SPEED = 235;

const reduceTimer = (value: number, deltaMs: number): number => Math.max(0, value - deltaMs);

const cloneGameState = (state: GameState): GameState => structuredClone(state) as GameState;

const hasEngagementInput = (input: PlayerInput): boolean =>
  input.firing || input.interact || input.move.x !== 0 || input.move.y !== 0;

const canPlayerStandAt = (state: GameState, position: Vec2): boolean =>
  !blocksMovementAtCircle(state.colliders, position, state.player.radius);

const updatePlayerMovement = (state: GameState, input: PlayerInput, deltaMs: number): void => {
  const direction = normalize(input.move);
  const velocity = scale(direction, PLAYER_SPEED);
  const deltaSeconds = deltaMs / 1000;
  const nextPosition = clampToArena(
    {
      x: state.player.position.x + velocity.x * deltaSeconds,
      y: state.player.position.y + velocity.y * deltaSeconds,
    },
    state.player.radius,
    state.arena.width,
    state.arena.height,
  );

  state.player.velocity = velocity;
  applyDoorPressure(state, nextPosition, state.player.radius);
  updateDoors(state, deltaMs);

  if (canPlayerStandAt(state, nextPosition)) {
    state.player.position = nextPosition;
  } else {
    state.player.velocity = { x: 0, y: 0 };
  }
};

const updateFx = (state: GameState, deltaMs: number): void => {
  state.fx.forEach((fx) => {
    fx.ttlMs = reduceTimer(fx.ttlMs, deltaMs);
  });
  state.fx = state.fx.filter((fx) => fx.ttlMs > 0);
};

export const updateGame = (current: GameState, input: PlayerInput, deltaMs: number): GameState => {
  if (input.restart && current.status !== "playing") {
    return createInitialGameState();
  }

  const state = cloneGameState(current);
  if (state.status !== "playing") {
    return state;
  }

  state.soundEvents = [];
  state.elapsedMs += deltaMs;
  updateFx(state, deltaMs);
  updateDoors(state, deltaMs);
  updateDroppedWeapons(state, deltaMs);
  Object.values(state.weapons).forEach((weapon) => tickWeapon(weapon, deltaMs));
  state.player.invulnerableMs = reduceTimer(state.player.invulnerableMs, deltaMs);
  state.player.facing = angleTo(state.player.position, input.aimWorld);
  state.engaged = state.engaged || hasEngagementInput(input);

  updatePlayerMovement(state, input, deltaMs);
  state.interaction = resolveInteractionPrompt(state);
  if (input.interact) {
    performInteraction(state);
  }
  if (input.firing && state.player.alive) {
    tryFireWeapon(state, state.player.id, state.player.weaponId, state.player.position, state.player.facing);
  }

  updateActorAnimations(state, deltaMs);

  if (!state.engaged) {
    return state;
  }

  updateEnemies(state, deltaMs);
  updateBulletsAndHits(state, deltaMs);
  updateCorpseMotion(state, deltaMs);
  updateActorAnimations(state, deltaMs);
  updateStatus(state);

  return state;
};
