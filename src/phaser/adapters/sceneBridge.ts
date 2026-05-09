import type { PlayerInput } from "../../game/input/actions";
import { createInitialGameState } from "../../game/simulation/state";
import type { GameState } from "../../game/simulation/types";
import { updateGame } from "../../game/simulation/update";

export type SceneBridge = {
  getState: () => GameState;
  reset: () => GameState;
  step: (input: PlayerInput, deltaMs: number) => GameState;
};

export const createSceneBridge = (): SceneBridge => {
  let state = createInitialGameState();

  return {
    getState: () => state,
    reset: () => {
      state = createInitialGameState();
      return state;
    },
    step: (input, deltaMs) => {
      state = updateGame(state, input, deltaMs);
      return state;
    },
  };
};
