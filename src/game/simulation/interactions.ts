import { nearestDroppedWeapon, tryPickupWeapon } from "./systems/droppedWeapons";
import type { GameState, InteractionState } from "./types";

export const resolveInteractionPrompt = (state: GameState): InteractionState | undefined => {
  const weapon = nearestDroppedWeapon(state);
  if (weapon) {
    return {
      kind: "pickup",
      targetId: weapon.id,
      label: `E pick ${state.weapons[weapon.weaponId]?.kind ?? weapon.kind}`,
    };
  }

  return undefined;
};

export const performInteraction = (state: GameState): void => {
  const prompt = resolveInteractionPrompt(state);
  if (!prompt) {
    state.interaction = undefined;
    return;
  }

  if (prompt.kind === "pickup") {
    tryPickupWeapon(state);
  }

  state.interaction = resolveInteractionPrompt(state);
};
