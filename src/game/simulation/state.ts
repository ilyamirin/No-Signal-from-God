import { getLevelDefinition } from "../content/levels/levelRegistry";
import { rectToCollider } from "./collision";
import { doorToCollider } from "./systems/doors";
import type { GameState, LevelId } from "./types";

type CreateGameStateOptions = {
  levelId?: LevelId | string | null;
};

export const createInitialGameState = (options: CreateGameStateOptions = {}): GameState => {
  const level = getLevelDefinition(options.levelId);
  const colliders = [
    ...level.arena.obstacles.map((obstacle) => rectToCollider(obstacle.id, obstacle, obstacle.blocksBullets)),
    ...level.props.flatMap((prop) => (prop.collider ? [prop.collider] : [])),
    ...level.doors.map(doorToCollider),
  ];

  return {
    arena: level.arena,
    level: {
      id: level.id,
      victory: level.victory,
    },
    levelState: {
      finalFightComplete: false,
      exitActive: false,
    },
    player: {
      id: "player",
      head: "crt",
      outfit: "suit",
      position: { ...level.playerSpawn },
      velocity: { x: 0, y: 0 },
      radius: 18,
      facing: -Math.PI / 2,
      health: 8,
      alive: true,
      weaponId: level.playerLoadout.kind === "weapon" ? level.playerLoadout.weaponId : undefined,
      invulnerableMs: 0,
      animation: { intent: "idle", weaponKind: "pistol", moving: false, speed: 0, lastShotMs: 0 },
    },
    enemies: level.enemies,
    bullets: [],
    fx: [],
    decals: [],
    soundEvents: [],
    props: level.props,
    doors: level.doors,
    droppedWeapons: level.droppedWeapons,
    colliders,
    interaction: undefined,
    weapons: level.weapons,
    score: 0,
    status: "playing",
    engaged: false,
    elapsedMs: 0,
    nextId: 1,
  };
};
