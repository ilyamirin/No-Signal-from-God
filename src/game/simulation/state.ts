import { createArena } from "../content/arena";
import { createEnemies } from "../content/enemies";
import { createStarterWeapons } from "../content/weapons";
import type { GameState } from "./types";

export const createInitialGameState = (): GameState => ({
  arena: createArena(),
  player: {
    id: "player",
    head: "crt",
    outfit: "suit",
    position: { x: 690, y: 390 },
    velocity: { x: 0, y: 0 },
    radius: 18,
    facing: -Math.PI / 2,
    health: 2,
    alive: true,
    weaponId: "service-pistol",
    invulnerableMs: 0,
  },
  enemies: createEnemies(),
  bullets: [],
  fx: [],
  weapons: createStarterWeapons(),
  score: 0,
  status: "playing",
  engaged: false,
  elapsedMs: 0,
  nextId: 1,
});
