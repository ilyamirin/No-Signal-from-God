import { createReceptionHubLevel } from "./receptionHubLevel";
import { createRingTowerLevel } from "./ringTowerLevel";
import type { LevelId } from "../../simulation/types";
import type { LevelDefinition } from "./types";

export const DEFAULT_LEVEL_ID: LevelId = "ring-tower";

export const levelIds: LevelId[] = ["ring-tower", "reception-hub"];

export const resolveLevelId = (value: string | null | undefined): LevelId => {
  if (value === "reception-hub" || value === "ring-tower") {
    return value;
  }
  return DEFAULT_LEVEL_ID;
};

export const getLevelDefinition = (value?: string | null): LevelDefinition => {
  const levelId = resolveLevelId(value);
  return levelId === "reception-hub" ? createReceptionHubLevel() : createRingTowerLevel();
};
