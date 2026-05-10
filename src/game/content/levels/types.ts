import type {
  ArenaState,
  Box,
  DoorState,
  DroppedWeaponState,
  EnemyState,
  PropEntity,
  Vec2,
  WeaponState,
} from "../../simulation/types";

export type LevelId = "reception-hub" | "ring-tower";

export type PlayerLoadout =
  | { kind: "unarmed" }
  | { kind: "weapon"; weaponId: string };

export type LevelVictoryRule =
  | { kind: "allEnemiesDead" }
  | {
      kind: "finalFightThenExit";
      finalEnemyIds: string[];
      exitTrigger: Box;
    };

export type LevelRuntimeState = {
  finalFightComplete: boolean;
  exitActive: boolean;
};

export type LevelDefinition = {
  id: LevelId;
  label: string;
  arena: ArenaState;
  playerSpawn: Vec2;
  playerLoadout: PlayerLoadout;
  weapons: Record<string, WeaponState>;
  enemies: EnemyState[];
  doors: DoorState[];
  props: PropEntity[];
  droppedWeapons: DroppedWeaponState[];
  victory: LevelVictoryRule;
};
