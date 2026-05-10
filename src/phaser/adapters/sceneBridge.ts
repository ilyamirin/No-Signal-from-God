import type { PlayerInput } from "../../game/input/actions";
import { resolveLevelId } from "../../game/content/levels/levelRegistry";
import { createInitialGameState } from "../../game/simulation/state";
import type { GameState, LevelId } from "../../game/simulation/types";
import { updateGame } from "../../game/simulation/update";

export type SceneBridge = {
  getState: () => GameState;
  reset: () => GameState;
  step: (input: PlayerInput, deltaMs: number) => GameState;
};

export const levelIdFromSearch = (search: string): LevelId => {
  const params = new URLSearchParams(search);
  return resolveLevelId(params.get("level"));
};

export const createSceneBridge = (
  levelId: LevelId = levelIdFromSearch(window.location.search),
): SceneBridge => {
  let state = createInitialGameState({ levelId });

  return {
    getState: () => state,
    reset: () => {
      state = createInitialGameState({ levelId });
      return state;
    },
    step: (input, deltaMs) => {
      state = updateGame(state, input, deltaMs);
      return state;
    },
  };
};
