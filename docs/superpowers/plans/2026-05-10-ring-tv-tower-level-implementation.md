# Ring TV Tower Level Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the new default `ring-tower` level with a central elevator, nearly-linear TV-studio ring route, unarmed start, parallax city background, final lift victory, and preserve the old `reception-hub` level behind `?level=reception-hub`.

**Architecture:** Introduce a `LevelDefinition` registry so simulation state is created from a selected level instead of hardcoded global content. Keep existing simulation systems mostly intact, adding small level-state and unarmed handling where needed. Phaser reads the selected level from the URL, draws optional level background/parallax layers, and continues to use the existing asset-pack rendering patterns.

**Tech Stack:** TypeScript, Vite, Phaser 3, Vitest, existing Valentint sci-fi asset pack, Replicate Nano Banana 2 HTTP for final stylized city background generation.

---

## File Structure

Create or modify these files:

- Create `src/game/content/levels/types.ts`: `LevelDefinition`, `LevelId`, `LevelVictoryRule`, `LevelRuntimeState`.
- Create `src/game/content/levels/receptionHubLevel.ts`: wraps the current reception-hub content without changing behavior.
- Create `src/game/content/levels/ringTowerLayout.ts`: ring tower arena rectangles, route targets, authored zones, exit trigger.
- Create `src/game/content/levels/ringTowerLevel.ts`: ring tower doors, props, enemies, dropped weapons, weapons, player loadout, victory rule.
- Create `src/game/content/levels/levelRegistry.ts`: default level id, URL-safe level lookup, level list.
- Create `src/game/content/levels/levelRegistry.test.ts`: registry/default/fallback tests.
- Create `src/game/content/levels/ringTowerLevel.test.ts`: ring layout, unarmed start, first pistol, route and trigger tests.
- Modify `src/game/simulation/types.ts`: support nullable `player.weaponId`, add `GameState.level`, `GameState.levelState`, and optional `ArenaState.background`.
- Modify `src/game/simulation/state.ts`: accept `{ levelId?: LevelId }`, hydrate state from `LevelDefinition`.
- Modify `src/game/simulation/update.ts`: skip firing when unarmed, call level victory update.
- Modify `src/game/simulation/systems/weapons.ts`: accept `weaponId: string | undefined`.
- Modify `src/game/simulation/systems/animation.ts`: idle/run animation should use fallback pistol visuals when unarmed.
- Modify `src/game/simulation/systems/combat.ts`: keep old all-enemies-dead victory only for old level; use ring tower lift trigger for new level.
- Modify `src/game/simulation/interactions.ts` and `src/game/simulation/systems/droppedWeapons.ts` only if nullable `weaponId` requires pickup/drop adjustment.
- Modify `src/phaser/adapters/sceneBridge.ts`: accept selected level id.
- Modify `src/phaser/scenes/GameScene.ts`: pass selected level id, draw parallax/background layer before arena, reset scene rig maps cleanly when reset changes level.
- Create `src/phaser/view/drawLevelBackground.ts`: city and tower-glass parallax rendering.
- Modify `src/phaser/view/scifiAssets.ts`: load final city background and any unused Valentint props needed by ring tower.
- Create `src/phaser/view/drawLevelBackground.test.ts`: pure parallax math tests.
- Create `src/assets/level-art/README.md`: records final committed image constraints and source prompt.
- Add final generated asset `src/assets/level-art/ring-tower-city.webp` only after the generation task succeeds.

Do not delete existing `src/game/content/receptionHubLayout.ts`, `doors.ts`, `props.ts`, `enemies.ts`, `droppedWeapons.ts`, or `weapons.ts`. They become inputs to `receptionHubLevel.ts`.

---

### Task 1: Add Level Definition Types And Registry

**Files:**
- Create: `src/game/content/levels/types.ts`
- Create: `src/game/content/levels/levelRegistry.ts`
- Create: `src/game/content/levels/levelRegistry.test.ts`

- [ ] **Step 1: Write the failing registry tests**

Create `src/game/content/levels/levelRegistry.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_LEVEL_ID, getLevelDefinition, levelIds, resolveLevelId } from "./levelRegistry";

describe("level registry", () => {
  it("uses ring tower as the default level", () => {
    expect(DEFAULT_LEVEL_ID).toBe("ring-tower");
    expect(resolveLevelId(undefined)).toBe("ring-tower");
    expect(resolveLevelId("")).toBe("ring-tower");
  });

  it("keeps the old reception hub level available by id", () => {
    expect(levelIds).toEqual(expect.arrayContaining(["ring-tower", "reception-hub"]));
    expect(getLevelDefinition("reception-hub").id).toBe("reception-hub");
  });

  it("falls unknown level ids back to ring tower", () => {
    expect(resolveLevelId("missing-level")).toBe("ring-tower");
    expect(getLevelDefinition("missing-level").id).toBe("ring-tower");
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test -- src/game/content/levels/levelRegistry.test.ts
```

Expected: FAIL because `./levelRegistry` does not exist.

- [ ] **Step 3: Add level type definitions**

Create `src/game/content/levels/types.ts`:

```ts
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
```

- [ ] **Step 4: Add the registry skeleton**

Create `src/game/content/levels/levelRegistry.ts`:

```ts
import { createReceptionHubLevel } from "./receptionHubLevel";
import { createRingTowerLevel } from "./ringTowerLevel";
import type { LevelDefinition, LevelId } from "./types";

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
```

Also create temporary minimal files so imports compile:

`src/game/content/levels/receptionHubLevel.ts`:

```ts
import type { LevelDefinition } from "./types";

export const createReceptionHubLevel = (): LevelDefinition => {
  throw new Error("createReceptionHubLevel is implemented in Task 2");
};
```

`src/game/content/levels/ringTowerLevel.ts`:

```ts
import type { LevelDefinition } from "./types";

export const createRingTowerLevel = (): LevelDefinition => {
  throw new Error("createRingTowerLevel is implemented in Task 3");
};
```

- [ ] **Step 5: Run the registry test**

Run:

```bash
npm run test -- src/game/content/levels/levelRegistry.test.ts
```

Expected: FAIL because the stub level creators throw. That is acceptable for this task only if the registry id behavior test is blocked by stubs. If Vitest reports thrown errors, proceed to Task 2 before expecting green.

- [ ] **Step 6: Commit**

```bash
git add src/game/content/levels
git commit -m "Add level registry types"
```

---

### Task 2: Wrap The Existing Reception Hub As A LevelDefinition

**Files:**
- Modify: `src/game/content/levels/receptionHubLevel.ts`
- Modify: `src/game/simulation/types.ts`
- Modify: `src/game/simulation/state.ts`
- Test: `src/game/content/levels/levelRegistry.test.ts`
- Test: existing `src/game/simulation/state.test.ts`

- [ ] **Step 1: Add failing state test for selecting the old level**

Modify `src/game/simulation/state.test.ts` by adding:

```ts
it("can create the old reception hub level explicitly", () => {
  const state = createInitialGameState({ levelId: "reception-hub" });

  expect(state.level.id).toBe("reception-hub");
  expect(state.arena.width).toBe(2200);
  expect(state.player.weaponId).toBe("service-pistol");
  expect(state.doors.length).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test -- src/game/simulation/state.test.ts src/game/content/levels/levelRegistry.test.ts
```

Expected: FAIL because `createInitialGameState` does not accept options and `GameState.level` does not exist.

- [ ] **Step 3: Extend simulation types**

Modify `src/game/simulation/types.ts`:

```ts
import type { LevelId, LevelRuntimeState, LevelVictoryRule } from "../content/levels/types";
```

Change `PlayerState`:

```ts
export type PlayerState = ActorBase & {
  head: "crt";
  outfit: "suit";
  weaponId?: string;
  invulnerableMs: number;
  animation: ActorAnimationState;
};
```

Change `ArenaState`:

```ts
export type ArenaBackground = {
  cityTextureKey?: string;
  cityParallax?: number;
  towerParallax?: number;
};

export type ArenaState = {
  width: number;
  height: number;
  floorRegions: FloorRegion[];
  obstacles: Rect[];
  decor: DecorItem[];
  background?: ArenaBackground;
};
```

Change `GameState` by adding:

```ts
  level: {
    id: LevelId;
    victory: LevelVictoryRule;
  };
  levelState: LevelRuntimeState;
```

- [ ] **Step 4: Implement reception hub wrapper**

Replace `src/game/content/levels/receptionHubLevel.ts`:

```ts
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
```

- [ ] **Step 5: Update state creation**

Replace `src/game/simulation/state.ts`:

```ts
import { getLevelDefinition } from "../content/levels/levelRegistry";
import type { LevelId } from "../content/levels/types";
import { rectToCollider } from "./collision";
import { doorToCollider } from "./systems/doors";
import type { GameState } from "./types";

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
    level: {
      id: level.id,
      victory: level.victory,
    },
    levelState: {
      finalFightComplete: false,
      exitActive: false,
    },
  };
};
```

- [ ] **Step 6: Run tests**

Run:

```bash
npm run test -- src/game/simulation/state.test.ts src/game/content/levels/levelRegistry.test.ts
```

Expected: registry still fails only for `ring-tower` stub. State test for `reception-hub` should pass.

- [ ] **Step 7: Commit**

```bash
git add src/game/content/levels/receptionHubLevel.ts src/game/simulation/types.ts src/game/simulation/state.ts src/game/simulation/state.test.ts
git commit -m "Wrap reception hub as selectable level"
```

---

### Task 3: Add Ring Tower Layout And Content

**Files:**
- Create: `src/game/content/levels/ringTowerLayout.ts`
- Modify: `src/game/content/levels/ringTowerLevel.ts`
- Create: `src/game/content/levels/ringTowerLevel.test.ts`

- [ ] **Step 1: Write failing ring tower content tests**

Create `src/game/content/levels/ringTowerLevel.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createRingTowerLevel } from "./ringTowerLevel";
import { ringTowerLayout } from "./ringTowerLayout";

describe("ring tower level", () => {
  it("defines a larger ring tower map with authored route targets", () => {
    const level = createRingTowerLevel();

    expect(level.id).toBe("ring-tower");
    expect(level.arena.width).toBe(2600);
    expect(level.arena.height).toBe(1900);
    expect(Object.keys(ringTowerLayout.routeTargets)).toEqual([
      "lobby",
      "reception",
      "talkStudio",
      "controlRoom",
      "backstage",
      "finalStudio",
      "exitLift",
    ]);
  });

  it("starts unarmed and places the first pistol in reception", () => {
    const level = createRingTowerLevel();

    expect(level.playerLoadout).toEqual({ kind: "unarmed" });
    expect(level.droppedWeapons).toContainEqual(
      expect.objectContaining({
        id: "ring-drop-first-pistol",
        weaponId: "ring-floor-first-pistol",
        kind: "pistol",
      }),
    );
    expect(level.weapons["ring-floor-first-pistol"]?.kind).toBe("pistol");
  });

  it("uses final fight then exit victory", () => {
    const level = createRingTowerLevel();

    expect(level.victory.kind).toBe("finalFightThenExit");
    if (level.victory.kind === "finalFightThenExit") {
      expect(level.victory.finalEnemyIds.length).toBeGreaterThanOrEqual(3);
      expect(level.victory.exitTrigger).toEqual(ringTowerLayout.exitLiftTrigger);
    }
  });

  it("contains every required zone as floor regions", () => {
    const floorIds = createRingTowerLevel().arena.floorRegions.map((region) => region.id);

    expect(floorIds).toEqual(
      expect.arrayContaining([
        "ring-lobby-floor",
        "ring-reception-floor",
        "ring-talk-studio-floor",
        "ring-control-floor",
        "ring-backstage-floor",
        "ring-final-studio-floor",
      ]),
    );
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run:

```bash
npm run test -- src/game/content/levels/ringTowerLevel.test.ts
```

Expected: FAIL because `ringTowerLayout` does not exist and `createRingTowerLevel` is still a stub.

- [ ] **Step 3: Add ring tower layout constants**

Create `src/game/content/levels/ringTowerLayout.ts`:

```ts
import type { FloorRegion, Rect, Vec2 } from "../../simulation/types";

type ZoneId =
  | "lift"
  | "lobby"
  | "reception"
  | "talkStudio"
  | "controlRoom"
  | "backstage"
  | "finalStudio"
  | "exitLift";

type ZoneRect = {
  id: ZoneId;
  x: number;
  y: number;
  width: number;
  height: number;
};

const wall = (id: string, x: number, y: number, width: number, height: number): Rect => ({
  id,
  x,
  y,
  width,
  height,
  blocksMovement: true,
  blocksBullets: true,
});

const floor = (id: string, zone: Omit<ZoneRect, "id">, frames: number[]): FloorRegion => ({
  id,
  x: zone.x,
  y: zone.y,
  width: zone.width,
  height: zone.height,
  frames,
});

const lift: ZoneRect = { id: "lift", x: 1210, y: 820, width: 180, height: 150 };
const lobby: ZoneRect = { id: "lobby", x: 1040, y: 650, width: 520, height: 480 };
const reception: ZoneRect = { id: "reception", x: 320, y: 650, width: 620, height: 420 };
const talkStudio: ZoneRect = { id: "talkStudio", x: 300, y: 190, width: 850, height: 410 };
const controlRoom: ZoneRect = { id: "controlRoom", x: 1180, y: 190, width: 700, height: 410 };
const backstage: ZoneRect = { id: "backstage", x: 1660, y: 660, width: 620, height: 460 };
const finalStudio: ZoneRect = { id: "finalStudio", x: 760, y: 1230, width: 1040, height: 470 };
const exitLift: ZoneRect = { id: "exitLift", x: 1218, y: 845, width: 164, height: 118 };

export const ringTowerLayout = {
  size: { width: 2600, height: 1900 },
  zones: {
    lift,
    lobby,
    reception,
    talkStudio,
    controlRoom,
    backstage,
    finalStudio,
    exitLift,
  },
  playerSpawn: { x: 1300, y: 910 } satisfies Vec2,
  exitLiftTrigger: { x: exitLift.x, y: exitLift.y, width: exitLift.width, height: exitLift.height },
  routeTargets: {
    lobby: { x: 1300, y: 1040 } satisfies Vec2,
    reception: { x: 610, y: 850 } satisfies Vec2,
    talkStudio: { x: 720, y: 390 } satisfies Vec2,
    controlRoom: { x: 1510, y: 400 } satisfies Vec2,
    backstage: { x: 1960, y: 890 } satisfies Vec2,
    finalStudio: { x: 1280, y: 1470 } satisfies Vec2,
    exitLift: { x: 1300, y: 910 } satisfies Vec2,
  },
  floorRegions: [
    floor("ring-lift-floor", lift, [2, 3]),
    floor("ring-lobby-floor", lobby, [0, 2]),
    floor("ring-reception-floor", reception, [1, 2]),
    floor("ring-talk-studio-floor", talkStudio, [3, 4]),
    floor("ring-control-floor", controlRoom, [2, 4]),
    floor("ring-backstage-floor", backstage, [1, 3]),
    floor("ring-final-studio-floor", finalStudio, [4, 5]),
    floor("ring-lobby-reception-corridor-floor", { x: 930, y: 805, width: 110, height: 120 }, [0, 2]),
    floor("ring-reception-studio-corridor-floor", { x: 560, y: 600, width: 150, height: 60 }, [1, 3]),
    floor("ring-studio-control-corridor-floor", { x: 1150, y: 340, width: 80, height: 120 }, [2, 4]),
    floor("ring-control-backstage-corridor-floor", { x: 1880, y: 520, width: 110, height: 160 }, [1, 4]),
    floor("ring-backstage-final-corridor-floor", { x: 1660, y: 1120, width: 160, height: 120 }, [3, 5]),
    floor("ring-final-lobby-return-floor", { x: 1180, y: 1130, width: 230, height: 100 }, [0, 4]),
  ],
  obstacles: [
    wall("ring-outer-north", 240, 130, 2100, 32),
    wall("ring-outer-south", 240, 1740, 2100, 32),
    wall("ring-outer-west", 240, 130, 32, 1642),
    wall("ring-outer-east", 2308, 130, 32, 1642),

    wall("ring-lobby-inner-north-left", 1040, 650, 170, 26),
    wall("ring-lobby-inner-north-right", 1390, 650, 170, 26),
    wall("ring-lobby-inner-south-left", 1040, 1110, 170, 26),
    wall("ring-lobby-inner-south-right", 1390, 1110, 170, 26),
    wall("ring-lobby-west-upper", 1040, 650, 26, 155),
    wall("ring-lobby-west-lower", 1040, 925, 26, 205),
    wall("ring-lobby-east-upper", 1534, 650, 26, 155),
    wall("ring-lobby-east-lower", 1534, 925, 26, 205),

    wall("ring-reception-north", 320, 650, 620, 26),
    wall("ring-reception-south", 320, 1070, 620, 26),
    wall("ring-reception-west", 320, 650, 26, 446),
    wall("ring-reception-east-upper", 914, 650, 26, 155),
    wall("ring-reception-east-lower", 914, 925, 26, 171),

    wall("ring-talk-north", 300, 190, 850, 26),
    wall("ring-talk-west", 300, 190, 26, 410),
    wall("ring-talk-east-upper", 1124, 190, 26, 150),
    wall("ring-talk-east-lower", 1124, 460, 26, 140),
    wall("ring-talk-south-left", 300, 574, 260, 26),
    wall("ring-talk-south-right", 710, 574, 440, 26),

    wall("ring-control-north", 1180, 190, 700, 26),
    wall("ring-control-south-left", 1180, 574, 500, 26),
    wall("ring-control-south-right", 1990, 574, 0, 26),
    wall("ring-control-west-upper", 1180, 190, 26, 150),
    wall("ring-control-west-lower", 1180, 460, 26, 140),
    wall("ring-control-east-upper", 1854, 190, 26, 330),

    wall("ring-backstage-north-left", 1660, 660, 220, 26),
    wall("ring-backstage-north-right", 1990, 660, 290, 26),
    wall("ring-backstage-east", 2254, 660, 26, 460),
    wall("ring-backstage-west-upper", 1660, 660, 26, 200),
    wall("ring-backstage-west-lower", 1660, 980, 26, 140),
    wall("ring-backstage-south-left", 1660, 1094, 160, 26),
    wall("ring-backstage-south-right", 1960, 1094, 320, 26),

    wall("ring-final-north-left", 760, 1230, 420, 26),
    wall("ring-final-north-right", 1410, 1230, 390, 26),
    wall("ring-final-south", 760, 1700, 1040, 26),
    wall("ring-final-west", 760, 1230, 26, 496),
    wall("ring-final-east", 1774, 1230, 26, 496),
  ],
};
```

- [ ] **Step 4: Implement ring tower level definition**

Replace `src/game/content/levels/ringTowerLevel.ts`:

```ts
import type { DoorState, DroppedWeaponState, EnemyState, PropEntity, WeaponState } from "../../simulation/types";
import { createWeapon } from "../weapons";
import { ringTowerLayout } from "./ringTowerLayout";
import type { LevelDefinition } from "./types";

const animation = { intent: "idle" as const, weaponKind: undefined, moving: false, speed: 0, lastShotMs: 0 };

const door = (
  id: string,
  hinge: { x: number; y: number },
  closedAngle: number,
  minAngle: number,
  maxAngle: number,
): DoorState => ({
  id,
  assetKey: "scifi-door",
  hinge,
  length: 56,
  thickness: 7,
  closedAngle,
  openAngle: 0,
  minAngle,
  maxAngle,
  angle: closedAngle,
  targetAngle: closedAngle,
  angularVelocity: 0,
  state: "closed",
  blocksBullets: true,
});

const enemy = (
  id: string,
  archetype: EnemyState["archetype"],
  x: number,
  y: number,
  weaponId?: string,
): EnemyState => ({
  id,
  kind: archetype === "monster_melee" ? "rush" : "ranged",
  archetype,
  head: id.includes("crt") ? "crt" : "human",
  position: { x, y },
  velocity: { x: 0, y: 0 },
  radius: archetype === "monster_melee" ? 17 : 18,
  facing: Math.PI,
  health: 1,
  alive: true,
  weaponId,
  attackCooldownMs: archetype === "monster_melee" ? 0 : 1000,
  animation: { ...animation, weaponKind: weaponId?.includes("rifle") ? "rifle" : weaponId ? "pistol" : undefined },
});

const dropped = (id: string, weaponId: string, kind: "pistol" | "rifle", x: number, y: number): DroppedWeaponState => ({
  id,
  weaponId,
  kind,
  position: { x, y },
  velocity: { x: 0, y: 0 },
  rotation: kind === "rifle" ? -0.35 : 0.25,
  angularVelocity: 0,
  pickupCooldownMs: 0,
});

const prop = (
  id: string,
  catalogKey: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: { frame?: number; scale?: number; rotation?: number; collider?: boolean } = {},
): PropEntity => {
  const soft = { movement: true, bullets: false, vision: false, sound: false };
  const hard = { movement: true, bullets: true, vision: true, sound: true };
  const visual = { movement: false, bullets: false, vision: false, sound: false };
  const hardKeys = new Set(["laboratory_device", "display_1", "display_2"]);
  const visualKeys = new Set(["keyboard_mouse", "wall_lamp", "lamps", "tv_remote"]);
  const channels = visualKeys.has(catalogKey) ? visual : hardKeys.has(catalogKey) ? hard : soft;
  const collider = options.collider === false || !channels.movement
    ? undefined
    : {
        id: `prop-${id}`,
        kind: "rect" as const,
        rect: { x: x - width / 2, y: y - height / 2, width, height },
        channels,
      };

  return {
    id,
    catalogKey,
    position: { x, y },
    rotation: options.rotation ?? 0,
    frame: options.frame ?? 0,
    scale: options.scale ?? 1,
    collider,
  };
};

export const createRingTowerLevel = (): LevelDefinition => {
  const weapons: Record<string, WeaponState> = {
    "ring-floor-first-pistol": createWeapon("ring-floor-first-pistol", "pistol"),
    "ring-talk-guard-pistol": createWeapon("ring-talk-guard-pistol", "pistol"),
    "ring-control-rifle": createWeapon("ring-control-rifle", "rifle"),
    "ring-backstage-pistol": createWeapon("ring-backstage-pistol", "pistol"),
    "ring-final-left-rifle": createWeapon("ring-final-left-rifle", "rifle"),
    "ring-final-right-pistol": createWeapon("ring-final-right-pistol", "pistol"),
    "ring-floor-control-rifle": createWeapon("ring-floor-control-rifle", "rifle"),
  };

  const finalEnemyIds = ["ring-final-left-crt", "ring-final-right", "ring-final-melee-a", "ring-final-melee-b"];

  return {
    id: "ring-tower",
    label: "Ring TV Tower",
    arena: {
      width: ringTowerLayout.size.width,
      height: ringTowerLayout.size.height,
      floorRegions: ringTowerLayout.floorRegions,
      obstacles: ringTowerLayout.obstacles,
      decor: [],
      background: {
        cityTextureKey: "ring-tower-city",
        cityParallax: 0.35,
        towerParallax: 0.65,
      },
    },
    playerSpawn: { ...ringTowerLayout.playerSpawn },
    playerLoadout: { kind: "unarmed" },
    weapons,
    doors: [
      door("ring-lift-door-left", { x: 1244, y: 820 }, Math.PI / 2, 0, Math.PI),
      door("ring-lift-door-right", { x: 1356, y: 820 }, Math.PI / 2, 0, Math.PI),
      door("ring-lobby-reception-upper", { x: 1040, y: 805 }, Math.PI, Math.PI / 2, Math.PI),
      door("ring-lobby-reception-lower", { x: 1040, y: 917 }, Math.PI, Math.PI / 2, Math.PI),
      door("ring-reception-studio-left", { x: 560, y: 600 }, Math.PI / 2, 0, Math.PI),
      door("ring-reception-studio-right", { x: 672, y: 600 }, Math.PI / 2, 0, Math.PI),
      door("ring-studio-control-upper", { x: 1150, y: 340 }, 0, -Math.PI / 2, Math.PI / 2),
      door("ring-studio-control-lower", { x: 1150, y: 452 }, 0, -Math.PI / 2, Math.PI / 2),
      door("ring-backstage-final-left", { x: 1660, y: 1120 }, Math.PI / 2, 0, Math.PI),
      door("ring-backstage-final-right", { x: 1772, y: 1120 }, Math.PI / 2, 0, Math.PI),
    ],
    props: [
      prop("ring-reception-desk", "table_1", 500, 735, 210, 70, { frame: 1, scale: 2.55 }),
      prop("ring-reception-couch-a", "couch_1", 440, 980, 118, 52, { frame: 1, scale: 1.85 }),
      prop("ring-reception-couch-b", "couch_2", 720, 980, 118, 52, { scale: 1.85 }),
      prop("ring-reception-cooler", "cooler", 850, 735, 38, 62, { scale: 1.4 }),
      prop("ring-reception-guard-body-table", "table_4", 650, 850, 84, 48, { scale: 1.8 }),
      prop("ring-talk-host-desk", "table_5", 720, 350, 176, 64, { scale: 2.25 }),
      prop("ring-talk-guest-couch", "couch_1", 740, 465, 118, 52, { frame: 1, scale: 2.0 }),
      prop("ring-talk-camera-left", "display_1", 435, 505, 94, 46, { scale: 1.8, rotation: 0.3 }),
      prop("ring-talk-camera-right", "display_1", 1040, 500, 94, 46, { scale: 1.8, rotation: -0.4 }),
      prop("ring-talk-light-a", "lamps", 450, 270, 40, 40, { frame: 1, scale: 1.4, collider: false }),
      prop("ring-talk-light-b", "lamps", 1010, 270, 40, 40, { frame: 2, scale: 1.4, collider: false }),
      prop("ring-control-main-console", "table_10", 1510, 360, 180, 64, { scale: 2.0 }),
      prop("ring-control-monitor-a", "tv", 1340, 255, 84, 48, { frame: 1, scale: 1.75 }),
      prop("ring-control-monitor-b", "tv", 1460, 255, 84, 48, { scale: 1.75 }),
      prop("ring-control-monitor-c", "tv", 1580, 255, 84, 48, { frame: 1, scale: 1.75 }),
      prop("ring-control-server-a", "laboratory_device", 1740, 430, 62, 62, { scale: 1.85 }),
      prop("ring-control-server-b", "laboratory_device", 1740, 520, 62, 62, { scale: 1.85 }),
      prop("ring-backstage-box-a", "box_big", 1800, 820, 58, 58, { scale: 1.05, rotation: 0.2 }),
      prop("ring-backstage-box-b", "box_small", 1900, 980, 34, 34, { scale: 1.1, rotation: -0.25 }),
      prop("ring-backstage-fake-wall", "display_2", 2080, 820, 94, 46, { scale: 1.8, rotation: Math.PI / 2 }),
      prop("ring-backstage-crt-prop", "tv", 2020, 1010, 84, 48, { scale: 1.6, rotation: -0.45 }),
      prop("ring-final-round-stage", "table_11", 1280, 1470, 200, 80, { scale: 2.5 }),
      prop("ring-final-host-desk", "table_5", 1280, 1370, 176, 64, { scale: 2.25 }),
      prop("ring-final-screen-left", "tv", 930, 1305, 84, 48, { frame: 1, scale: 1.9 }),
      prop("ring-final-screen-right", "tv", 1640, 1305, 84, 48, { scale: 1.9 }),
      prop("ring-final-camera-left", "display_1", 970, 1600, 94, 46, { scale: 1.8, rotation: -0.2 }),
      prop("ring-final-camera-right", "display_1", 1600, 1600, 94, 46, { scale: 1.8, rotation: 0.25 }),
    ],
    enemies: [
      enemy("ring-talk-guard", "humanoid_ranged", 980, 390, "ring-talk-guard-pistol"),
      enemy("ring-talk-melee", "monster_melee", 540, 500),
      enemy("ring-control-rifle-crt", "humanoid_ranged", 1690, 380, "ring-control-rifle"),
      enemy("ring-control-melee", "monster_melee", 1390, 525),
      enemy("ring-backstage-pistol", "humanoid_ranged", 2120, 925, "ring-backstage-pistol"),
      enemy("ring-backstage-melee", "monster_melee", 1800, 1000),
      enemy("ring-final-left-crt", "humanoid_ranged", 1010, 1385, "ring-final-left-rifle"),
      enemy("ring-final-right", "humanoid_ranged", 1590, 1390, "ring-final-right-pistol"),
      enemy("ring-final-melee-a", "monster_melee", 1040, 1600),
      enemy("ring-final-melee-b", "monster_melee", 1540, 1605),
    ],
    droppedWeapons: [
      dropped("ring-drop-first-pistol", "ring-floor-first-pistol", "pistol", 650, 850),
      dropped("ring-drop-control-rifle", "ring-floor-control-rifle", "rifle", 1510, 535),
    ],
    victory: {
      kind: "finalFightThenExit",
      finalEnemyIds,
      exitTrigger: ringTowerLayout.exitLiftTrigger,
    },
  };
};
```

- [ ] **Step 5: Run ring tower tests**

Run:

```bash
npm run test -- src/game/content/levels/ringTowerLevel.test.ts src/game/content/levels/levelRegistry.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/content/levels/ringTowerLayout.ts src/game/content/levels/ringTowerLevel.ts src/game/content/levels/ringTowerLevel.test.ts src/game/content/levels/levelRegistry.test.ts
git commit -m "Add ring tower level content"
```

---

### Task 4: Support Unarmed Player State

**Files:**
- Modify: `src/game/simulation/systems/weapons.ts`
- Modify: `src/game/simulation/update.ts`
- Modify: `src/game/simulation/systems/animation.ts`
- Modify: `src/phaser/view/drawActors.ts`
- Test: `src/game/simulation/update.test.ts`

- [ ] **Step 1: Add failing unarmed behavior tests**

Modify `src/game/simulation/update.test.ts` by adding:

```ts
it("does not fire when the selected level starts unarmed", () => {
  const state = createInitialGameState({ levelId: "ring-tower" });
  const next = updateGame(
    state,
    {
      move: { x: 0, y: 0 },
      aimWorld: { x: state.player.position.x + 100, y: state.player.position.y },
      firing: true,
      restart: false,
      kick: false,
      interact: false,
    },
    16,
  );

  expect(state.player.weaponId).toBeUndefined();
  expect(next.bullets).toHaveLength(0);
  expect(next.fx.some((fx) => fx.kind === "muzzle")).toBe(false);
});

it("can pick up the first ring tower pistol from an unarmed start", () => {
  const state = createInitialGameState({ levelId: "ring-tower" });
  const firstDrop = state.droppedWeapons.find((weapon) => weapon.id === "ring-drop-first-pistol")!;
  state.player.position = { ...firstDrop.position };

  const next = updateGame(
    state,
    {
      move: { x: 0, y: 0 },
      aimWorld: { x: firstDrop.position.x + 100, y: firstDrop.position.y },
      firing: false,
      restart: false,
      kick: false,
      interact: true,
    },
    16,
  );

  expect(next.player.weaponId).toBe("ring-floor-first-pistol");
  expect(next.droppedWeapons.some((weapon) => weapon.id === "ring-drop-first-pistol")).toBe(false);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
npm run test -- src/game/simulation/update.test.ts
```

Expected: FAIL from nullable `weaponId` type and current firing assumptions.

- [ ] **Step 3: Update weapon firing signature**

Modify `src/game/simulation/systems/weapons.ts`:

```ts
export const tryFireWeapon = (
  state: GameState,
  ownerId: string,
  weaponId: string | undefined,
  origin: Vec2,
  angle: number,
): BulletState | undefined => {
  if (!weaponId) {
    return undefined;
  }
  const weapon = state.weapons[weaponId];
  if (!weapon || weapon.cooldownRemainingMs > 0 || weapon.reloadRemainingMs > 0) {
    return undefined;
  }
  // keep the existing body below this line unchanged
```

Keep the existing body after the guard.

- [ ] **Step 4: Update player firing in update loop**

In `src/game/simulation/update.ts`, keep the existing call but allow undefined:

```ts
if (input.firing && state.player.alive) {
  tryFireWeapon(state, state.player.id, state.player.weaponId, state.player.position, state.player.facing);
}
```

No runtime guard is needed after Task 4 Step 3.

- [ ] **Step 5: Update animation fallback**

In `src/game/simulation/systems/animation.ts`, change:

```ts
const playerWeapon = state.weapons[state.player.weaponId];
```

to:

```ts
const playerWeapon = state.player.weaponId ? state.weapons[state.player.weaponId] : undefined;
```

In `src/phaser/view/drawActors.ts`, existing `weapon?.kind` fallback to pistol is acceptable. Confirm there are no direct `state.weapons[state.player.weaponId]` errors in this file. If TypeScript complains in `GameScene.ts`, change:

```ts
state.weapons[state.player.weaponId]
```

to:

```ts
state.player.weaponId ? state.weapons[state.player.weaponId] : undefined
```

- [ ] **Step 6: Update pickup/drop logic if needed**

Open `src/game/simulation/systems/droppedWeapons.ts`. If it assumes `state.player.weaponId` is always defined when dropping the current weapon, wrap that block:

```ts
if (state.player.weaponId) {
  // existing current-weapon drop creation
}
state.player.weaponId = nearest.weaponId;
```

Expected behavior: unarmed pickup should not create a dropped "undefined" weapon.

- [ ] **Step 7: Run tests**

Run:

```bash
npm run test -- src/game/simulation/update.test.ts src/game/simulation/droppedWeapons.test.ts
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/game/simulation/systems/weapons.ts src/game/simulation/update.ts src/game/simulation/systems/animation.ts src/phaser/view/drawActors.ts src/phaser/scenes/GameScene.ts src/game/simulation/systems/droppedWeapons.ts src/game/simulation/update.test.ts
git commit -m "Support unarmed player starts"
```

---

### Task 5: Implement Level-Specific Victory Logic

**Files:**
- Create: `src/game/simulation/systems/levelObjectives.ts`
- Create: `src/game/simulation/systems/levelObjectives.test.ts`
- Modify: `src/game/simulation/systems/combat.ts`
- Modify: `src/game/simulation/update.ts`

- [ ] **Step 1: Write failing objective tests**

Create `src/game/simulation/systems/levelObjectives.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "../state";
import { updateLevelObjectives } from "./levelObjectives";

describe("level objectives", () => {
  it("does not immediately win ring tower when all final enemies die away from the lift", () => {
    const state = createInitialGameState({ levelId: "ring-tower" });
    if (state.level.victory.kind !== "finalFightThenExit") {
      throw new Error("Expected finalFightThenExit victory");
    }

    for (const enemy of state.enemies) {
      if (state.level.victory.finalEnemyIds.includes(enemy.id)) {
        enemy.alive = false;
      }
    }

    updateLevelObjectives(state);

    expect(state.levelState.finalFightComplete).toBe(true);
    expect(state.levelState.exitActive).toBe(true);
    expect(state.status).toBe("playing");
  });

  it("wins ring tower only after final fight and player enters the lift trigger", () => {
    const state = createInitialGameState({ levelId: "ring-tower" });
    if (state.level.victory.kind !== "finalFightThenExit") {
      throw new Error("Expected finalFightThenExit victory");
    }

    for (const enemy of state.enemies) {
      if (state.level.victory.finalEnemyIds.includes(enemy.id)) {
        enemy.alive = false;
      }
    }
    state.player.position = {
      x: state.level.victory.exitTrigger.x + state.level.victory.exitTrigger.width / 2,
      y: state.level.victory.exitTrigger.y + state.level.victory.exitTrigger.height / 2,
    };

    updateLevelObjectives(state);

    expect(state.status).toBe("victory");
  });

  it("keeps reception hub all-enemies-dead victory behavior", () => {
    const state = createInitialGameState({ levelId: "reception-hub" });
    state.enemies.forEach((enemy) => {
      enemy.alive = false;
    });

    updateLevelObjectives(state);

    expect(state.status).toBe("victory");
  });
});
```

- [ ] **Step 2: Run objective tests to verify failure**

Run:

```bash
npm run test -- src/game/simulation/systems/levelObjectives.test.ts
```

Expected: FAIL because module does not exist.

- [ ] **Step 3: Implement objective system**

Create `src/game/simulation/systems/levelObjectives.ts`:

```ts
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
```

- [ ] **Step 4: Replace old status update**

Modify `src/game/simulation/systems/combat.ts`:

Remove `updateStatus` export entirely:

```ts
export const updateStatus = ...
```

Keep `updateBulletsAndHits` unchanged.

Modify `src/game/simulation/update.ts` imports:

```ts
import { updateBulletsAndHits } from "./systems/combat";
import { updateLevelObjectives } from "./systems/levelObjectives";
```

Change the end of `updateGame`:

```ts
updateCorpseMotion(state, deltaMs);
updateActorAnimations(state, deltaMs);
updateLevelObjectives(state);
```

- [ ] **Step 5: Run tests**

Run:

```bash
npm run test -- src/game/simulation/systems/levelObjectives.test.ts src/game/simulation/update.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/simulation/systems/levelObjectives.ts src/game/simulation/systems/levelObjectives.test.ts src/game/simulation/systems/combat.ts src/game/simulation/update.ts
git commit -m "Add level-specific victory objectives"
```

---

### Task 6: Select Level From URL In Phaser Bridge

**Files:**
- Modify: `src/phaser/adapters/sceneBridge.ts`
- Modify: `src/phaser/scenes/GameScene.ts`
- Create: `src/phaser/adapters/sceneBridge.test.ts`

- [ ] **Step 1: Write failing bridge tests**

Create `src/phaser/adapters/sceneBridge.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createSceneBridge, levelIdFromSearch } from "./sceneBridge";

describe("scene bridge level selection", () => {
  it("reads ring tower as the default level", () => {
    expect(levelIdFromSearch("")).toBe("ring-tower");
  });

  it("reads reception hub from URL query", () => {
    expect(levelIdFromSearch("?level=reception-hub")).toBe("reception-hub");
  });

  it("creates state for the selected level", () => {
    const bridge = createSceneBridge("reception-hub");

    expect(bridge.getState().level.id).toBe("reception-hub");
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm run test -- src/phaser/adapters/sceneBridge.test.ts
```

Expected: FAIL because `levelIdFromSearch` and `createSceneBridge(levelId)` do not exist.

- [ ] **Step 3: Update scene bridge**

Replace `src/phaser/adapters/sceneBridge.ts`:

```ts
import type { PlayerInput } from "../../game/input/actions";
import { resolveLevelId } from "../../game/content/levels/levelRegistry";
import type { LevelId } from "../../game/content/levels/types";
import { createInitialGameState } from "../../game/simulation/state";
import type { GameState } from "../../game/simulation/types";
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

export const createSceneBridge = (levelId: LevelId = levelIdFromSearch(window.location.search)): SceneBridge => {
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
```

- [ ] **Step 4: Confirm GameScene can keep existing call**

In `src/phaser/scenes/GameScene.ts`, this line can remain:

```ts
this.bridge = createSceneBridge();
```

It now uses `window.location.search`.

- [ ] **Step 5: Run tests**

Run:

```bash
npm run test -- src/phaser/adapters/sceneBridge.test.ts src/game/content/levels/levelRegistry.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/phaser/adapters/sceneBridge.ts src/phaser/adapters/sceneBridge.test.ts
git commit -m "Select game level from URL"
```

---

### Task 7: Generate And Add Stylized City Background Asset

**Files:**
- Create directory/file: `art/ring-tower/` for ignored intermediate files
- Create: `src/assets/level-art/README.md`
- Add: `src/assets/level-art/ring-tower-city.webp`

- [ ] **Step 1: Generate with Nano Banana 2**

Run from repo root:

```bash
mkdir -p art/ring-tower src/assets/level-art
/Users/ilyagmirin/PycharmProjects/codex_skills/skills/engineering/replicate-nano-banana-2-http/scripts/run-image.sh \
  --prompt "Top-down 2D game background for a browser top-down shooter level, stylized pixel-art inspired painted city far below a circular TV tower observation deck, late 1990s early 2000s mood, roads, rooftops, small parks, tiny traffic shapes, muted dark teal gray asphalt with small neon accents, designed as parallax background behind gameplay, not photorealistic, not a drone photo, not a satellite photo, not a realistic render, not 3D, not blurry, no text, no UI, no characters" \
  --image-input /Users/ilyagmirin/Downloads/replicate-prediction-s20ejrg0cnrmt0cy2dpvgqd70m.jpeg \
  --aspect-ratio 16:9 \
  --resolution 2K \
  --output-format png \
  --output art/ring-tower/ring-tower-city-source.png
```

Expected: script returns a local PNG path in `art/ring-tower/`.

- [ ] **Step 2: Convert final asset to committed WebP**

Run:

```bash
ffmpeg -y -i art/ring-tower/ring-tower-city-source.png -vf scale=2048:1152:flags=lanczos -c:v libwebp -lossless 0 -q:v 82 src/assets/level-art/ring-tower-city.webp
```

Expected: `src/assets/level-art/ring-tower-city.webp` exists and is under 1 MB.

- [ ] **Step 3: Add asset README**

Create `src/assets/level-art/README.md`:

```md
# Level Art

Final committed level-art assets only.

Intermediate AI generations, references, prompt experiments, and screenshots stay in ignored directories such as `art/`, `tmp/`, and `screenshots/`.

## ring-tower-city.webp

Generated for the ring TV tower level as a stylized top-down 2D game parallax background. It must not be replaced with photorealistic, drone-photo, satellite-photo, or realistic-render imagery.
```

- [ ] **Step 4: Inspect the asset manually**

Open or view `src/assets/level-art/ring-tower-city.webp`. Reject and regenerate if it looks photorealistic, satellite-like, or too visually busy behind gameplay.

- [ ] **Step 5: Commit**

```bash
git add src/assets/level-art/README.md src/assets/level-art/ring-tower-city.webp
git commit -m "Add stylized ring tower city background"
```

---

### Task 8: Render Parallax Background In Phaser

**Files:**
- Create: `src/phaser/view/drawLevelBackground.ts`
- Create: `src/phaser/view/drawLevelBackground.test.ts`
- Modify: `src/phaser/view/scifiAssets.ts`
- Modify: `src/phaser/scenes/GameScene.ts`

- [ ] **Step 1: Write failing parallax math tests**

Create `src/phaser/view/drawLevelBackground.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { parallaxPosition } from "./drawLevelBackground";

describe("parallaxPosition", () => {
  it("moves slower than camera scroll", () => {
    expect(parallaxPosition(1000, 0.35)).toBe(-350);
    expect(parallaxPosition(1000, 0.65)).toBe(-650);
  });
});
```

- [ ] **Step 2: Run test to verify failure**

Run:

```bash
npm run test -- src/phaser/view/drawLevelBackground.test.ts
```

Expected: FAIL because module does not exist.

- [ ] **Step 3: Implement background drawing**

Create `src/phaser/view/drawLevelBackground.ts`:

```ts
import Phaser from "phaser";
import type { GameState } from "../../game/simulation/types";

export type LevelBackgroundRig = {
  city?: Phaser.GameObjects.TileSprite;
  towerGlass?: Phaser.GameObjects.Graphics;
};

export const parallaxPosition = (cameraScroll: number, factor: number): number =>
  -cameraScroll * factor;

export const createLevelBackgroundRig = (scene: Phaser.Scene, state: GameState): LevelBackgroundRig => {
  const rig: LevelBackgroundRig = {};
  if (state.arena.background?.cityTextureKey) {
    rig.city = scene.add
      .tileSprite(0, 0, state.arena.width * 1.4, state.arena.height * 1.4, state.arena.background.cityTextureKey)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-100)
      .setAlpha(0.78);
  }

  rig.towerGlass = scene.add.graphics().setDepth(-50).setScrollFactor(1);
  rig.towerGlass.lineStyle(18, 0x6dd7ff, 0.18);
  rig.towerGlass.strokeEllipse(state.arena.width / 2, state.arena.height / 2, state.arena.width * 0.86, state.arena.height * 0.78);
  rig.towerGlass.lineStyle(5, 0xffffff, 0.12);
  rig.towerGlass.strokeEllipse(state.arena.width / 2, state.arena.height / 2, state.arena.width * 0.78, state.arena.height * 0.68);

  return rig;
};

export const syncLevelBackgroundRig = (
  rig: LevelBackgroundRig,
  camera: Phaser.Cameras.Scene2D.Camera,
  state: GameState,
): void => {
  if (!rig.city) {
    return;
  }
  const factor = state.arena.background?.cityParallax ?? 0.35;
  rig.city.tilePositionX = parallaxPosition(camera.scrollX, factor);
  rig.city.tilePositionY = parallaxPosition(camera.scrollY, factor);
};
```

- [ ] **Step 4: Load final background asset**

Modify `src/phaser/view/scifiAssets.ts` imports:

```ts
import ringTowerCityUrl from "../../assets/level-art/ring-tower-city.webp?url";
```

Add to `images`:

```ts
  {
    key: "ring-tower-city",
    url: ringTowerCityUrl,
  },
```

- [ ] **Step 5: Integrate in GameScene**

Modify `src/phaser/scenes/GameScene.ts` imports:

```ts
import {
  createLevelBackgroundRig,
  syncLevelBackgroundRig,
  type LevelBackgroundRig,
} from "../view/drawLevelBackground";
```

Add field:

```ts
private background!: LevelBackgroundRig;
```

In `create()`, after `configureGameplayCamera` and before `drawArena`:

```ts
this.background = createLevelBackgroundRig(this, state);
```

In `update()`, before `updateCameraFeedback` or immediately after it:

```ts
syncLevelBackgroundRig(this.background, this.cameras.main, state);
```

- [ ] **Step 6: Run tests and build**

Run:

```bash
npm run test -- src/phaser/view/drawLevelBackground.test.ts
npm run build
```

Expected: PASS and build includes `ring-tower-city`.

- [ ] **Step 7: Commit**

```bash
git add src/phaser/view/drawLevelBackground.ts src/phaser/view/drawLevelBackground.test.ts src/phaser/view/scifiAssets.ts src/phaser/scenes/GameScene.ts
git commit -m "Render ring tower parallax background"
```

---

### Task 9: Preserve And Test Both Level Routes End-To-End

**Files:**
- Modify: `src/game/content/receptionHubLayout.test.ts` or create `src/game/content/levels/levelReachability.test.ts`
- Modify: any tests broken by default level switch

- [ ] **Step 1: Add level reachability tests**

Create `src/game/content/levels/levelReachability.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { blocksMovementAtCircle } from "../../simulation/collision";
import { createInitialGameState } from "../../simulation/state";
import { ringTowerLayout } from "./ringTowerLayout";

const canStand = (levelId: "ring-tower" | "reception-hub", position: { x: number; y: number }) => {
  const state = createInitialGameState({ levelId });
  return !blocksMovementAtCircle(state.colliders, position, state.player.radius);
};

describe("level reachability anchors", () => {
  it("keeps authored ring tower route targets walkable", () => {
    for (const target of Object.values(ringTowerLayout.routeTargets)) {
      expect(canStand("ring-tower", target)).toBe(true);
    }
  });

  it("keeps old reception hub spawn walkable", () => {
    const state = createInitialGameState({ levelId: "reception-hub" });
    expect(blocksMovementAtCircle(state.colliders, state.player.position, state.player.radius)).toBe(false);
  });
});
```

- [ ] **Step 2: Run tests**

Run:

```bash
npm run test -- src/game/content/levels/levelReachability.test.ts src/game/content/receptionHubLayout.test.ts
```

Expected: PASS. If a route target is blocked, move only that route target or the nearby wall segment. Do not widen the whole map casually.

- [ ] **Step 3: Run full suite**

Run:

```bash
npm test
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/game/content/levels/levelReachability.test.ts src/game/content/receptionHubLayout.test.ts src/game/content/levels/ringTowerLayout.ts
git commit -m "Verify ring tower and reception hub reachability"
```

---

### Task 10: Full Browser QA In Large Viewport

**Files:**
- No code files unless QA finds issues.
- Screenshots go to ignored `screenshots/`.

- [ ] **Step 1: Start dev server**

Run:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite serves `http://127.0.0.1:5173/`.

- [ ] **Step 2: Test default ring tower URL**

Open:

```text
http://127.0.0.1:5173/?level=ring-tower
```

Set viewport to `1920x1080`.

Check:

- player starts in elevator/lobby area
- HUD handles unarmed state without broken text
- city background is stylized, not photorealistic
- parallax does not distract from gameplay
- reception has pistol pickup
- doors appear as thin leaves with handles
- no missing textures
- no console errors from game code

- [ ] **Step 3: Test old level URL**

Open:

```text
http://127.0.0.1:5173/?level=reception-hub
```

Check:

- old level loads
- player starts with pistol
- old HUD ammo display still works
- old victory behavior still works by tests

- [ ] **Step 4: Run production build**

Run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit QA fixes if needed**

If QA required code changes:

```bash
git add <changed-files>
git commit -m "Polish ring tower level QA issues"
```

If no code changes were needed, do not create an empty commit.

---

## Self-Review Notes

Spec coverage:

- Central elevator and almost-linear ring route: Tasks 3 and 9.
- Old level preserved by URL: Tasks 1, 2, 6, and 10.
- Unarmed start and first pistol pickup: Tasks 3 and 4.
- Final victory only after returning to elevator: Task 5.
- Stylized non-photorealistic city parallax: Tasks 7 and 8.
- Valentint asset-pack usage and richer TV spaces: Task 3.
- Tests and browser QA: Tasks 1-10.

No dynamic zoom, procedural generation, dialogue, minimap, save/load, or stealth work is included.
