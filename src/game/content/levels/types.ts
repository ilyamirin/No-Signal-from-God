import type {
  ArenaState,
  DoorState,
  DroppedWeaponState,
  EnemyState,
  LevelId,
  LevelVictoryRule,
  PropEntity,
  Vec2,
  WeaponState,
} from "../../simulation/types";

export type PlayerLoadout =
  | { kind: "unarmed" }
  | { kind: "weapon"; weaponId: string };

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
