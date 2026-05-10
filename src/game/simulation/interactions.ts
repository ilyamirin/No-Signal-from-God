import { distance } from "./geometry";
import { nearestDroppedWeapon, tryPickupWeapon } from "./systems/droppedWeapons";
import { toggleDoor } from "./systems/doors";
import type { GameState, InteractionState } from "./types";

const DOOR_RADIUS = 64;

const nearestDoorInteraction = (state: GameState): InteractionState | undefined => {
  let best: InteractionState | undefined;
  let bestDistance = Infinity;

  for (const door of state.doors) {
    const current = distance(state.player.position, door.hinge);
    if (current < DOOR_RADIUS && current < bestDistance) {
      best = {
        kind: "door",
        targetId: door.id,
        label: door.state === "open" || door.state === "opening" ? "E close" : "E open",
      };
      bestDistance = current;
    }
  }

  return best;
};

export const resolveInteractionPrompt = (state: GameState): InteractionState | undefined => {
  const weapon = nearestDroppedWeapon(state);
  if (weapon) {
    return {
      kind: "pickup",
      targetId: weapon.id,
      label: `E pick ${state.weapons[weapon.weaponId]?.kind ?? weapon.kind}`,
    };
  }

  return nearestDoorInteraction(state);
};

export const performInteraction = (state: GameState): void => {
  const prompt = resolveInteractionPrompt(state);
  if (!prompt) {
    state.interaction = undefined;
    return;
  }

  if (prompt.kind === "pickup") {
    tryPickupWeapon(state);
  } else {
    const door = state.doors.find((candidate) => candidate.id === prompt.targetId);
    if (door) {
      toggleDoor(door);
    }
  }

  state.interaction = resolveInteractionPrompt(state);
};
