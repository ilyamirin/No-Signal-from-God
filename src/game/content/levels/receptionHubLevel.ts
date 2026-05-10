import { createArena } from "../arena";
import { createDoors } from "../doors";
import { createDroppedWeapons } from "../droppedWeapons";
import { createEnemies } from "../enemies";
import { createProps } from "../props";
import { receptionHubLayout } from "../receptionHubLayout";
import { createStarterWeapons } from "../weapons";
import type { LevelDefinition } from "./types";

export const createReceptionHubLevel = (): LevelDefinition => ({
  id: "reception-hub",
  label: "Reception Hub",
  arena: createArena(),
  playerSpawn: { ...receptionHubLayout.playerSpawn },
  playerLoadout: { kind: "weapon", weaponId: "service-pistol" },
  weapons: createStarterWeapons(),
  enemies: createEnemies(),
  doors: createDoors(),
  props: createProps(),
  droppedWeapons: createDroppedWeapons(),
  victory: { kind: "allEnemiesDead" },
});
