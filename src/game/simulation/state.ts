import { createArena } from "../content/arena";
import { createDoors } from "../content/doors";
import { createDroppedWeapons } from "../content/droppedWeapons";
import { createEnemies } from "../content/enemies";
import { createProps } from "../content/props";
import { receptionHubLayout } from "../content/receptionHubLayout";
import { createStarterWeapons } from "../content/weapons";
import { rectToCollider } from "./collision";
import { doorToCollider } from "./systems/doors";
import type { GameState } from "./types";

export const createInitialGameState = (): GameState => {
  const arena = createArena();
  const props = createProps();
  const doors = createDoors();
  const colliders = [
    ...arena.obstacles.map((obstacle) => rectToCollider(obstacle.id, obstacle, obstacle.blocksBullets)),
    ...props.flatMap((prop) => (prop.collider ? [prop.collider] : [])),
    ...doors.map(doorToCollider),
  ];

  return {
    arena,
    player: {
    id: "player",
    head: "crt",
    outfit: "suit",
    position: { ...receptionHubLayout.playerSpawn },
    velocity: { x: 0, y: 0 },
    radius: 18,
    facing: -Math.PI / 2,
    health: 8,
    alive: true,
    weaponId: "service-pistol",
    invulnerableMs: 0,
    animation: { intent: "idle", weaponKind: "pistol", moving: false, speed: 0, lastShotMs: 0 },
  },
  enemies: createEnemies(),
  bullets: [],
  fx: [],
  decals: [],
  props,
  doors,
  droppedWeapons: createDroppedWeapons(),
  colliders,
  interaction: undefined,
  weapons: createStarterWeapons(),
  score: 0,
  status: "playing",
  engaged: false,
  elapsedMs: 0,
  nextId: 1,
  };
};
