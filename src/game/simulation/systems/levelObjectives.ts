import { pointInRect } from "../geometry";
import type { GameState } from "../types";

export const updateLevelObjectives = (state: GameState): void => {
  if (state.player.health <= 0) {
    state.player.alive = false;
    state.status = "dead";
    return;
  }

  if (state.level.victory.kind === "allEnemiesDead") {
    if (state.enemies.every((enemy) => !enemy.alive)) {
      state.status = "victory";
    }
    return;
  }

  const finalFightComplete = state.level.victory.finalEnemyIds.every((enemyId) => {
    const enemy = state.enemies.find((candidate) => candidate.id === enemyId);
    return !enemy || !enemy.alive;
  });

  state.levelState.finalFightComplete = state.levelState.finalFightComplete || finalFightComplete;
  state.levelState.exitActive = state.levelState.exitActive || state.levelState.finalFightComplete;

  if (state.levelState.exitActive && pointInRect(state.player.position, state.level.victory.exitTrigger)) {
    state.status = "victory";
  }
};
