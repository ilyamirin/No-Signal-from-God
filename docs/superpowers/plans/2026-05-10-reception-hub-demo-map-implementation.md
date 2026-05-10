# Reception Hub Demo Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the current starter scene into a larger reception-hub corporate broadcast level with safe onboarding, standardized hinged doors, richer asset-pack dressing, deliberate combat zones, and closer smooth camera follow.

**Architecture:** Keep level data in `src/game/content/**`, simulation rules in `src/game/simulation/**`, Phaser rendering in `src/phaser/view/**`, and browser wiring in `src/phaser/scenes/GameScene.ts`. Introduce one shared reception-hub layout module so arena, props, doors, enemies, and dropped weapons use the same coordinates instead of drifting apart. Keep each task independently testable and commit after each green step.

**Tech Stack:** TypeScript, Vite, Phaser 3, Vitest, existing DOM HUD, existing Valentint sci-fi asset pack.

---

## File Structure

Create:

- `src/game/content/receptionHubLayout.ts` - shared map dimensions, room rectangles, wall helpers, door apertures, prop anchors, enemy anchors, and pickup anchors.
- `src/game/content/receptionHubLayout.test.ts` - validates map scale, safe spawn, room connectivity, and test-fixture anchors.
- `src/phaser/view/camera.test.ts` - validates smooth follow target math and map-bound clamping without Phaser runtime.

Modify:

- `src/game/simulation/types.ts` - add floor-region metadata to `ArenaState` so Phaser can draw room floors from data.
- `src/game/content/arena.ts` - replace the current 1366x768 arena with the reception-hub walls and floor regions.
- `src/game/content/props.ts` - move props into reception, security, newsroom, server/archive, and control-room zones using existing catalog entries.
- `src/game/content/props.test.ts` - assert soft/hard cover rules and zone coverage.
- `src/game/content/doors.ts` - replace current doors with standardized `X` single-leaf and `2X` double-leaf hinged doors using `scifi-door`.
- `src/game/simulation/doors.test.ts` - assert single/double door counts, bullet blocking, and push-open behavior.
- `src/game/content/enemies.ts` - place humanoid ranged enemies and frog-like melee monsters by zone.
- `src/game/content/weapons.ts` - add weapon IDs used by the new enemy and floor weapon placements.
- `src/game/content/droppedWeapons.ts` - move floor weapons into reception and server/archive test spots.
- `src/game/simulation/state.ts` - spawn the player in the safe reception room.
- `src/game/simulation/state.test.ts` - update enemy count and safe-room assertions.
- `src/phaser/view/drawArena.ts` - draw dynamic floor regions from `ArenaState` and remove old fixed 1366x768 room coordinates.
- `src/phaser/view/camera.ts` - keep shot shake and add smooth camera follow with fixed zoom, aim offset, and bounds clamping.
- `src/phaser/scenes/GameScene.ts` - initialize camera bounds/zoom and pass the current aim world point to camera update.

## Task 1: Shared Reception-Hub Layout

**Files:**
- Create: `src/game/content/receptionHubLayout.ts`
- Create: `src/game/content/receptionHubLayout.test.ts`
- Modify: `src/game/simulation/types.ts`
- Modify: `src/game/content/arena.ts`
- Test: `src/game/content/receptionHubLayout.test.ts`

- [ ] **Step 1: Write failing layout tests**

Create `src/game/content/receptionHubLayout.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createArena } from "./arena";
import { receptionHubLayout } from "./receptionHubLayout";

describe("reception hub layout", () => {
  it("is larger than the fixed 16:9 camera frame", () => {
    expect(receptionHubLayout.size.width).toBe(2200);
    expect(receptionHubLayout.size.height).toBe(1500);
    expect(receptionHubLayout.size.width).toBeGreaterThan(1366);
    expect(receptionHubLayout.size.height).toBeGreaterThan(768);
  });

  it("keeps the player spawn inside the safe reception room", () => {
    const { playerSpawn, rooms } = receptionHubLayout;
    expect(playerSpawn.x).toBeGreaterThan(rooms.reception.x);
    expect(playerSpawn.x).toBeLessThan(rooms.reception.x + rooms.reception.width);
    expect(playerSpawn.y).toBeGreaterThan(rooms.reception.y);
    expect(playerSpawn.y).toBeLessThan(rooms.reception.y + rooms.reception.height);
  });

  it("draws floor regions for each authored room", () => {
    const arena = createArena();
    expect(arena.floorRegions.map((region) => region.id).sort()).toEqual([
      "broadcast-control-floor",
      "newsroom-floor",
      "reception-floor",
      "security-floor",
      "server-archive-floor",
    ]);
  });

  it("does not put hard arena walls over the safe player spawn", () => {
    const arena = createArena();
    const { playerSpawn } = receptionHubLayout;
    const overlapping = arena.obstacles.filter((obstacle) =>
      playerSpawn.x >= obstacle.x &&
      playerSpawn.x <= obstacle.x + obstacle.width &&
      playerSpawn.y >= obstacle.y &&
      playerSpawn.y <= obstacle.y + obstacle.height,
    );

    expect(overlapping).toEqual([]);
  });
});
```

- [ ] **Step 2: Run the failing layout tests**

Run:

```bash
npm run test -- src/game/content/receptionHubLayout.test.ts
```

Expected: FAIL because `receptionHubLayout.ts` and `ArenaState.floorRegions` do not exist.

- [ ] **Step 3: Add floor-region type metadata**

In `src/game/simulation/types.ts`, add this type near `DecorItem`:

```ts
export type FloorRegion = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  frames: number[];
};
```

Then change `ArenaState` to:

```ts
export type ArenaState = {
  width: number;
  height: number;
  floorRegions: FloorRegion[];
  obstacles: Rect[];
  decor: DecorItem[];
};
```

- [ ] **Step 4: Create the shared layout module**

Create `src/game/content/receptionHubLayout.ts`:

```ts
import type { FloorRegion, Rect, Vec2 } from "../simulation/types";

type RoomId = "reception" | "security" | "newsroom" | "serverArchive" | "broadcastControl";

type RoomRect = {
  id: RoomId;
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

const roomFloor = (id: string, room: RoomRect, frames: number[]): FloorRegion => ({
  id,
  x: room.x,
  y: room.y,
  width: room.width,
  height: room.height,
  frames,
});

const reception: RoomRect = { id: "reception", x: 120, y: 820, width: 600, height: 430 };
const security: RoomRect = { id: "security", x: 760, y: 820, width: 420, height: 350 };
const newsroom: RoomRect = { id: "newsroom", x: 240, y: 260, width: 900, height: 500 };
const serverArchive: RoomRect = { id: "serverArchive", x: 1240, y: 840, width: 650, height: 430 };
const broadcastControl: RoomRect = { id: "broadcastControl", x: 1220, y: 220, width: 760, height: 500 };

export const receptionHubLayout = {
  size: { width: 2200, height: 1500 },
  playerSpawn: { x: 330, y: 1040 } satisfies Vec2,
  rooms: {
    reception,
    security,
    newsroom,
    serverArchive,
    broadcastControl,
  },
  floorRegions: [
    roomFloor("reception-floor", reception, [0, 1]),
    roomFloor("security-floor", security, [2, 3]),
    roomFloor("newsroom-floor", newsroom, [4, 5]),
    roomFloor("server-archive-floor", serverArchive, [1, 2]),
    roomFloor("broadcast-control-floor", broadcastControl, [3, 4]),
  ],
  obstacles: [
    wall("outer-top", 80, 160, 1960, 26),
    wall("outer-bottom", 80, 1290, 1960, 26),
    wall("outer-left", 80, 160, 26, 1156),
    wall("outer-right", 2014, 160, 26, 1156),

    wall("reception-top-left", 120, 800, 230, 22),
    wall("reception-top-right", 480, 800, 240, 22),
    wall("reception-bottom", 120, 1250, 600, 22),
    wall("reception-left", 120, 820, 22, 430),
    wall("reception-right-upper", 698, 820, 22, 130),
    wall("reception-right-lower", 698, 1068, 22, 182),

    wall("security-top", 760, 800, 420, 22),
    wall("security-bottom", 760, 1170, 420, 22),
    wall("security-left-upper", 760, 820, 22, 120),
    wall("security-left-lower", 760, 1060, 22, 110),
    wall("security-right", 1180, 820, 22, 350),

    wall("newsroom-top", 240, 240, 900, 22),
    wall("newsroom-bottom-left", 240, 760, 390, 22),
    wall("newsroom-bottom-right", 770, 760, 370, 22),
    wall("newsroom-left", 240, 260, 22, 500),
    wall("newsroom-right", 1140, 260, 22, 500),

    wall("server-top", 1240, 820, 650, 22),
    wall("server-bottom", 1240, 1270, 650, 22),
    wall("server-left", 1240, 840, 22, 430),
    wall("server-right", 1890, 840, 22, 430),

    wall("control-top", 1220, 200, 760, 22),
    wall("control-bottom-left", 1220, 720, 300, 22),
    wall("control-bottom-right", 1650, 720, 330, 22),
    wall("control-left", 1220, 220, 22, 500),
    wall("control-right", 1980, 220, 22, 500),

    wall("security-console-hard-cover", 940, 925, 150, 48),
    wall("server-rack-hard-a", 1380, 910, 52, 250),
    wall("server-rack-hard-b", 1510, 910, 52, 250),
    wall("server-rack-hard-c", 1640, 910, 52, 250),
    wall("control-main-console-hard", 1460, 330, 280, 60),
  ],
};
```

- [ ] **Step 5: Replace `createArena` with the shared layout**

Replace `src/game/content/arena.ts` with:

```ts
import type { ArenaState } from "../simulation/types";
import { receptionHubLayout } from "./receptionHubLayout";

export const createArena = (): ArenaState => ({
  width: receptionHubLayout.size.width,
  height: receptionHubLayout.size.height,
  floorRegions: receptionHubLayout.floorRegions,
  obstacles: receptionHubLayout.obstacles,
  decor: [],
});
```

- [ ] **Step 6: Verify Task 1**

Run:

```bash
npm run test -- src/game/content/receptionHubLayout.test.ts src/game/simulation/state.test.ts
npm run build
```

Expected: reception-hub layout tests pass. `state.test.ts` may fail on old spawn/enemy-count expectations; those failures are allowed until Task 5 updates initial state and enemy placement.

- [ ] **Step 7: Commit Task 1**

Run:

```bash
git add src/game/simulation/types.ts src/game/content/receptionHubLayout.ts src/game/content/receptionHubLayout.test.ts src/game/content/arena.ts
git commit -m "Add reception hub layout data"
```

## Task 2: Data-Driven Arena Floor Rendering

**Files:**
- Modify: `src/phaser/view/drawArena.ts`
- Test: `npm run build`

- [ ] **Step 1: Replace fixed floor rectangles with arena floor regions**

In `src/phaser/view/drawArena.ts`, keep `addFloorTiles`, but replace the fixed `addFloorTiles(scene, container, ...)` calls in `drawArena` with:

```ts
for (const region of arena.floorRegions) {
  addFloorTiles(scene, container, region, region.frames);
}
```

Remove the old fixed calls for `{ x: 90, y: 70, ... }`, `{ x: 368, y: 70, ... }`, and the other hardcoded 1366x768 floor areas.

- [ ] **Step 2: Remove old door-gap overlays tied to previous coordinates**

In `src/phaser/view/drawArena.ts`, remove these calls from `drawArena`:

```ts
drawDoorGap(overlay, 350, 302, 18, 118);
drawDoorGap(overlay, 814, 298, 18, 116);
drawDoorGap(overlay, 648, 292, 68, 18);
```

Keep the `drawDoorGap` helper only if it is still used by a later local call. If unused, delete the helper too.

- [ ] **Step 3: Keep arena border around the larger map**

Leave this existing border code in place because it already uses `arena.width` and `arena.height`:

```ts
overlay.lineStyle(5, 0x050607, 1);
overlay.strokeRect(26, 24, arena.width - 52, arena.height - 48);
overlay.lineStyle(3, 0xff25cc, 0.95);
overlay.strokeRect(31, 29, arena.width - 62, arena.height - 58);
```

- [ ] **Step 4: Verify Task 2**

Run:

```bash
npm run build
```

Expected: build succeeds with `ArenaState.floorRegions` rendered through the existing tile sprite sheet.

- [ ] **Step 5: Commit Task 2**

Run:

```bash
git add src/phaser/view/drawArena.ts
git commit -m "Render reception hub floor regions"
```

## Task 3: Standardized Doors For The Hub

**Files:**
- Modify: `src/game/content/doors.ts`
- Modify: `src/game/simulation/doors.test.ts`
- Test: `src/game/simulation/doors.test.ts`

- [ ] **Step 1: Add failing door layout assertions**

Append this test to `src/game/simulation/doors.test.ts`:

```ts
it("uses standardized single and double reception-hub doors", () => {
  const state = createInitialGameState();
  const singleDoors = state.doors.filter((door) => door.id.includes("single"));
  const doubleDoors = state.doors.filter((door) => door.id.includes("double"));

  expect(singleDoors).toHaveLength(2);
  expect(doubleDoors).toHaveLength(4);
  expect(state.doors.every((door) => door.assetKey === "scifi-door")).toBe(true);
  expect(state.doors.every((door) => door.length === 56)).toBe(true);
  expect(state.doors.every((door) => door.thickness === 7)).toBe(true);
  expect(state.doors.every((door) => door.blocksBullets)).toBe(true);
});
```

- [ ] **Step 2: Run the failing door test**

Run:

```bash
npm run test -- src/game/simulation/doors.test.ts
```

Expected: FAIL because current door IDs and coordinates are still from the old studio map.

- [ ] **Step 3: Replace the door definitions**

Replace `src/game/content/doors.ts` with:

```ts
import type { DoorState, Vec2 } from "../simulation/types";

const LEAF_LENGTH = 56;
const LEAF_THICKNESS = 7;

const door = (
  id: string,
  hinge: Vec2,
  closedAngle: number,
  openAngle: number,
  minAngle: number,
  maxAngle: number,
): DoorState => ({
  id,
  assetKey: "scifi-door",
  hinge,
  length: LEAF_LENGTH,
  thickness: LEAF_THICKNESS,
  closedAngle,
  openAngle,
  minAngle,
  maxAngle,
  angle: closedAngle,
  targetAngle: closedAngle,
  angularVelocity: 0,
  state: "closed",
  blocksBullets: true,
});

export const createDoors = (): DoorState[] => [
  door("reception-security-double-upper", { x: 720, y: 950 }, 0, -Math.PI / 2, -Math.PI / 2, Math.PI / 2),
  door("reception-security-double-lower", { x: 720, y: 1062 }, 0, Math.PI / 2, -Math.PI / 2, Math.PI / 2),

  door("reception-newsroom-double-left", { x: 350, y: 800 }, -Math.PI / 2, 0, -Math.PI, 0),
  door("reception-newsroom-double-right", { x: 462, y: 800 }, -Math.PI / 2, -Math.PI, -Math.PI, 0),

  door("security-control-single", { x: 1180, y: 1015 }, 0, -Math.PI / 2, -Math.PI / 2, Math.PI / 2),
  door("server-control-single", { x: 1520, y: 820 }, -Math.PI / 2, 0, -Math.PI, 0),
];
```

- [ ] **Step 4: Verify door physics still opens without key press**

Run:

```bash
npm run test -- src/game/simulation/doors.test.ts
npm run build
```

Expected: all door tests pass. Existing pressure tests still pass because doors remain `door-segment` colliders and block bullets.

- [ ] **Step 5: Commit Task 3**

Run:

```bash
git add src/game/content/doors.ts src/game/simulation/doors.test.ts
git commit -m "Standardize reception hub doors"
```

## Task 4: Props And Collision Classes By Zone

**Files:**
- Modify: `src/game/content/props.ts`
- Modify: `src/game/content/props.test.ts`
- Test: `src/game/content/props.test.ts`

- [ ] **Step 1: Add failing prop distribution tests**

Append this test to `src/game/content/props.test.ts`:

```ts
it("dresses every reception-hub zone with usable asset-pack props", () => {
  const props = createProps();

  expect(props.some((prop) => prop.id.startsWith("reception-"))).toBe(true);
  expect(props.some((prop) => prop.id.startsWith("security-"))).toBe(true);
  expect(props.some((prop) => prop.id.startsWith("newsroom-"))).toBe(true);
  expect(props.some((prop) => prop.id.startsWith("server-"))).toBe(true);
  expect(props.some((prop) => prop.id.startsWith("control-"))).toBe(true);
});

it("keeps soft blockers bullet-passable and hard blockers bullet-blocking", () => {
  const props = createProps();
  const soft = props.find((prop) => prop.id === "reception-coffee-table");
  const hard = props.find((prop) => prop.id === "server-rack-prop-a");

  expect(soft?.collider?.channels).toEqual({
    movement: true,
    bullets: false,
    vision: false,
    sound: false,
  });
  expect(hard?.collider?.channels).toEqual({
    movement: true,
    bullets: true,
    vision: true,
    sound: true,
  });
});
```

- [ ] **Step 2: Run the failing prop tests**

Run:

```bash
npm run test -- src/game/content/props.test.ts
```

Expected: FAIL because the new zone-prefixed prop IDs do not exist.

- [ ] **Step 3: Replace starter props with reception-hub placements**

In `src/game/content/props.ts`, replace the `createProps` array with this data. Keep the existing `propCatalog`, `soft`, `hard`, `visual`, and `prop` helper.

```ts
export const createProps = (): PropEntity[] => [
  prop("reception-desk", "table_1", 285, 920, 210, 70, { frame: 1, scale: 2.55 }),
  prop("reception-couch-left", "couch_1", 205, 1140, 118, 52, { frame: 1, scale: 1.85, rotation: Math.PI / 2 }),
  prop("reception-chair-right", "chair_1", 520, 1120, 38, 36, { frame: 1, scale: 1.55, rotation: -Math.PI / 2 }),
  prop("reception-coffee-table", "table_4", 390, 1135, 84, 48, { scale: 1.8 }),
  prop("reception-plant-a", "plants", 170, 875, 38, 38, { frame: 2, scale: 1.45 }),
  prop("reception-plant-b", "plants", 650, 1215, 38, 38, { scale: 1.45 }),

  prop("security-counter", "table_8", 1008, 950, 160, 58, { scale: 1.9 }),
  prop("security-computer", "computer", 1030, 918, 46, 38, { frame: 5, scale: 1.7, collider: false }),
  prop("security-chair", "chair_2", 990, 1028, 38, 36, { scale: 1.55, rotation: Math.PI }),
  prop("security-display", "display_2", 1138, 890, 94, 46, { frame: 1, scale: 1.8, rotation: -0.2 }),

  prop("newsroom-anchor-desk", "table_5", 610, 420, 176, 64, { scale: 2.25 }),
  prop("newsroom-desk-left", "table_2", 390, 570, 128, 58, { scale: 1.9 }),
  prop("newsroom-desk-right", "table_3", 880, 575, 128, 58, { scale: 1.9 }),
  prop("newsroom-chair-a", "chair_1", 575, 350, 38, 36, { scale: 1.55, rotation: Math.PI }),
  prop("newsroom-chair-b", "chair_1", 650, 350, 38, 36, { frame: 1, scale: 1.55, rotation: Math.PI }),
  prop("newsroom-tv-wall-a", "tv", 370, 300, 84, 48, { frame: 1, scale: 1.65 }),
  prop("newsroom-tv-wall-b", "tv", 500, 300, 84, 48, { scale: 1.65 }),
  prop("newsroom-display-floor", "display_1", 950, 650, 94, 46, { frame: 1, scale: 1.8, rotation: 0.35 }),
  prop("newsroom-plant", "plants", 300, 700, 38, 38, { scale: 1.45 }),

  prop("server-rack-prop-a", "laboratory_device", 1410, 1035, 62, 62, { scale: 1.85 }),
  prop("server-rack-prop-b", "laboratory_device", 1540, 1035, 62, 62, { scale: 1.85 }),
  prop("server-box-big", "box_big", 1785, 1160, 58, 58, { scale: 1.05, rotation: 0.2 }),
  prop("server-box-small", "box_small", 1725, 1168, 34, 34, { scale: 1.1, rotation: -0.25 }),
  prop("server-computer-a", "computer", 1330, 910, 46, 38, { frame: 6, scale: 1.7 }),
  prop("server-trash", "trash_can_2", 1845, 900, 36, 36, { scale: 1.4 }),

  prop("control-main-desk", "table_1", 1600, 360, 210, 70, { frame: 1, scale: 2.55 }),
  prop("control-side-desk", "table_10", 1810, 560, 140, 58, { scale: 1.9 }),
  prop("control-tv-a", "tv", 1370, 280, 84, 48, { frame: 1, scale: 1.75 }),
  prop("control-tv-b", "tv", 1490, 280, 84, 48, { scale: 1.75 }),
  prop("control-tv-c", "tv", 1610, 280, 84, 48, { frame: 1, scale: 1.75 }),
  prop("control-keyboard", "keyboard_mouse", 1600, 330, 32, 32, { scale: 1.2, collider: false }),
  prop("control-fallen-display", "display_1", 1320, 625, 94, 46, { scale: 1.8, rotation: -0.65 }),
  prop("control-chair", "chair_1", 1705, 420, 38, 36, { frame: 1, scale: 1.55 }),
];
```

- [ ] **Step 4: Verify prop tests**

Run:

```bash
npm run test -- src/game/content/props.test.ts
npm run build
```

Expected: prop tests pass and build succeeds.

- [ ] **Step 5: Commit Task 4**

Run:

```bash
git add src/game/content/props.ts src/game/content/props.test.ts
git commit -m "Dress reception hub with asset-pack props"
```

## Task 5: Player, Enemies, Weapons, And Safe Room Rules

**Files:**
- Modify: `src/game/content/enemies.ts`
- Modify: `src/game/content/weapons.ts`
- Modify: `src/game/content/droppedWeapons.ts`
- Modify: `src/game/simulation/state.ts`
- Modify: `src/game/simulation/state.test.ts`
- Test: `src/game/simulation/state.test.ts`

- [ ] **Step 1: Update state tests for the reception hub**

Replace the first test in `src/game/simulation/state.test.ts` with:

```ts
it("creates one suited TV-head player with one equipped weapon and six enemies", () => {
  const state = createInitialGameState();

  expect(state.player.head).toBe("crt");
  expect(state.player.outfit).toBe("suit");
  expect(state.player.weaponId).toBe("service-pistol");
  expect(state.weapons[state.player.weaponId]?.loadedRounds).toBe(6);
  expect(state.enemies).toHaveLength(6);
  expect(state.enemies.filter((enemy) => enemy.archetype === "humanoid_ranged")).toHaveLength(4);
  expect(state.enemies.filter((enemy) => enemy.archetype === "monster_melee")).toHaveLength(2);
  expect(state.enemies.some((enemy) => enemy.head === "human")).toBe(true);
  expect(state.enemies.some((enemy) => enemy.head === "crt")).toBe(true);
  expect(state.status).toBe("playing");
});
```

Append this test:

```ts
it("starts the player in the safe reception while enemies start outside it", () => {
  const state = createInitialGameState();
  const reception = { x: 120, y: 820, width: 600, height: 430 };

  expect(state.player.position.x).toBeGreaterThan(reception.x);
  expect(state.player.position.x).toBeLessThan(reception.x + reception.width);
  expect(state.player.position.y).toBeGreaterThan(reception.y);
  expect(state.player.position.y).toBeLessThan(reception.y + reception.height);

  for (const enemy of state.enemies) {
    const inReception =
      enemy.position.x > reception.x &&
      enemy.position.x < reception.x + reception.width &&
      enemy.position.y > reception.y &&
      enemy.position.y < reception.y + reception.height;
    expect(inReception, `${enemy.id} should not spawn in safe reception`).toBe(false);
  }
});
```

- [ ] **Step 2: Run the failing state tests**

Run:

```bash
npm run test -- src/game/simulation/state.test.ts
```

Expected: FAIL because player spawn, enemy count, and weapon IDs still match the old scene.

- [ ] **Step 3: Move floor weapons**

Replace `src/game/content/droppedWeapons.ts` with:

```ts
import type { DroppedWeaponState } from "../simulation/types";

export const createDroppedWeapons = (): DroppedWeaponState[] => [
  {
    id: "drop-pistol-reception",
    weaponId: "floor-pistol-reception",
    kind: "pistol",
    position: { x: 470, y: 1015 },
    velocity: { x: 0, y: 0 },
    rotation: 0.2,
    angularVelocity: 0,
    pickupCooldownMs: 0,
  },
  {
    id: "drop-rifle-server",
    weaponId: "floor-rifle-server",
    kind: "rifle",
    position: { x: 1750, y: 1035 },
    velocity: { x: 0, y: 0 },
    rotation: -0.35,
    angularVelocity: 0,
    pickupCooldownMs: 0,
  },
];
```

- [ ] **Step 4: Add weapon IDs used by the new scene**

Replace `createStarterWeapons` in `src/game/content/weapons.ts` with:

```ts
export const createStarterWeapons = (): Record<string, WeaponState> => ({
  "service-pistol": createPistol("service-pistol"),
  "security-guard-pistol": createPistol("security-guard-pistol"),
  "newsroom-guard-left-pistol": createPistol("newsroom-guard-left-pistol"),
  "newsroom-guard-right-pistol": createPistol("newsroom-guard-right-pistol"),
  "server-guard-rifle": createRifle("server-guard-rifle"),
  "control-guard-pistol": createPistol("control-guard-pistol"),
  "control-guard-rifle": createRifle("control-guard-rifle"),
  "floor-pistol-reception": createPistol("floor-pistol-reception"),
  "floor-rifle-server": createRifle("floor-rifle-server"),
});
```

- [ ] **Step 5: Replace enemy placements**

Replace `createEnemies` in `src/game/content/enemies.ts` with:

```ts
export const createEnemies = (): EnemyState[] => [
  { id: "enemy-security-guard", kind: "ranged", archetype: "humanoid_ranged", head: "human", position: { x: 1040, y: 1020 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "security-guard-pistol", attackCooldownMs: 12000, animation: { ...animation, weaponKind: "pistol" } },
  { id: "enemy-newsroom-guard-left", kind: "ranged", archetype: "humanoid_ranged", head: "crt", position: { x: 460, y: 610 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI / 2, health: 1, alive: true, weaponId: "newsroom-guard-left-pistol", attackCooldownMs: 12000, animation: { ...animation, weaponKind: "pistol" } },
  { id: "enemy-newsroom-guard-right", kind: "ranged", archetype: "humanoid_ranged", head: "human", position: { x: 955, y: 565 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "newsroom-guard-right-pistol", attackCooldownMs: 12000, animation: { ...animation, weaponKind: "pistol" } },
  { id: "enemy-server-rifle", kind: "ranged", archetype: "humanoid_ranged", head: "crt", position: { x: 1815, y: 1000 }, velocity: { x: 0, y: 0 }, radius: 18, facing: Math.PI, health: 1, alive: true, weaponId: "server-guard-rifle", attackCooldownMs: 12000, animation: { ...animation, weaponKind: "rifle" } },
  { id: "enemy-newsroom-melee", kind: "rush", archetype: "monster_melee", head: "human", position: { x: 760, y: 665 }, velocity: { x: 0, y: 0 }, radius: 17, facing: Math.PI / 2, health: 1, alive: true, attackCooldownMs: 12000, animation: { ...animation } },
  { id: "enemy-server-melee", kind: "rush", archetype: "monster_melee", head: "crt", position: { x: 1325, y: 1180 }, velocity: { x: 0, y: 0 }, radius: 17, facing: -Math.PI / 2, health: 1, alive: true, attackCooldownMs: 12000, animation: { ...animation } },
];
```

- [ ] **Step 6: Move the player spawn**

In `src/game/simulation/state.ts`, import the layout:

```ts
import { receptionHubLayout } from "../content/receptionHubLayout";
```

Then replace the player `position` field with:

```ts
position: { ...receptionHubLayout.playerSpawn },
```

- [ ] **Step 7: Verify Task 5**

Run:

```bash
npm run test -- src/game/simulation/state.test.ts src/game/simulation/droppedWeapons.test.ts
npm run build
```

Expected: state tests pass. If `droppedWeapons.test.ts` still expects the old rifle X coordinate, update that single assertion from `toBeGreaterThan(675)` to:

```ts
expect(weapon.position.x).toBeGreaterThan(1750);
```

- [ ] **Step 8: Commit Task 5**

Run:

```bash
git add src/game/content/enemies.ts src/game/content/weapons.ts src/game/content/droppedWeapons.ts src/game/simulation/state.ts src/game/simulation/state.test.ts src/game/simulation/droppedWeapons.test.ts
git commit -m "Place reception hub actors and weapons"
```

## Task 6: Smooth Close Camera

**Files:**
- Modify: `src/phaser/view/camera.ts`
- Create: `src/phaser/view/camera.test.ts`
- Modify: `src/phaser/scenes/GameScene.ts`
- Test: `src/phaser/view/camera.test.ts`

- [ ] **Step 1: Add failing camera math tests**

Create `src/phaser/view/camera.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { calculateCameraTarget } from "./camera";

describe("calculateCameraTarget", () => {
  it("adds a limited aim offset toward the mouse", () => {
    const target = calculateCameraTarget(
      { x: 500, y: 500 },
      { x: 900, y: 500 },
      { width: 2200, height: 1500 },
      { width: 1366, height: 768 },
      1.35,
    );

    expect(target.x).toBe(600);
    expect(target.y).toBe(500);
  });

  it("clamps the target so the camera does not show empty map edges", () => {
    const target = calculateCameraTarget(
      { x: 90, y: 80 },
      { x: 0, y: 0 },
      { width: 2200, height: 1500 },
      { width: 1366, height: 768 },
      1.35,
    );

    expect(target.x).toBeCloseTo(505.93, 1);
    expect(target.y).toBeCloseTo(284.44, 1);
  });
});
```

- [ ] **Step 2: Run the failing camera tests**

Run:

```bash
npm run test -- src/phaser/view/camera.test.ts
```

Expected: FAIL because `calculateCameraTarget` does not exist.

- [ ] **Step 3: Add camera target math and close-follow constants**

Replace `src/phaser/view/camera.ts` with:

```ts
import Phaser from "phaser";
import type { GameState, Vec2 } from "../../game/simulation/types";

const CAMERA_ZOOM = 1.35;
const AIM_OFFSET = 100;
const FOLLOW_LERP = 0.1;

type Size = {
  width: number;
  height: number;
};

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

export const calculateCameraTarget = (
  playerPosition: Vec2,
  aimWorld: Vec2,
  mapSize: Size,
  viewportSize: Size,
  zoom = CAMERA_ZOOM,
): Vec2 => {
  const dx = aimWorld.x - playerPosition.x;
  const dy = aimWorld.y - playerPosition.y;
  const length = Math.hypot(dx, dy) || 1;
  const desired = {
    x: playerPosition.x + (dx / length) * AIM_OFFSET,
    y: playerPosition.y + (dy / length) * AIM_OFFSET,
  };

  const halfWidth = viewportSize.width / zoom / 2;
  const halfHeight = viewportSize.height / zoom / 2;

  return {
    x: clamp(desired.x, halfWidth, mapSize.width - halfWidth),
    y: clamp(desired.y, halfHeight, mapSize.height - halfHeight),
  };
};

export const configureGameplayCamera = (
  camera: Phaser.Cameras.Scene2D.Camera,
  state: GameState,
): void => {
  camera.setZoom(CAMERA_ZOOM);
  camera.setBounds(0, 0, state.arena.width, state.arena.height);
  camera.centerOn(state.player.position.x, state.player.position.y);
};

export const updateCameraFeedback = (
  camera: Phaser.Cameras.Scene2D.Camera,
  state: GameState,
  previousBulletCount: number,
  aimWorld: Vec2,
): void => {
  const target = calculateCameraTarget(
    state.player.position,
    aimWorld,
    { width: state.arena.width, height: state.arena.height },
    { width: camera.width, height: camera.height },
    camera.zoom,
  );

  const current = camera.midPoint;
  camera.centerOn(
    Phaser.Math.Linear(current.x, target.x, FOLLOW_LERP),
    Phaser.Math.Linear(current.y, target.y, FOLLOW_LERP),
  );

  if (state.bullets.length > previousBulletCount) {
    camera.shake(55, 0.0035);
  }
};
```

- [ ] **Step 4: Wire camera config and aim point into the scene**

In `src/phaser/scenes/GameScene.ts`, update the import:

```ts
import { configureGameplayCamera, updateCameraFeedback } from "../view/camera";
```

In `create()`, after `const state = this.bridge.getState();`, add:

```ts
configureGameplayCamera(this.cameras.main, state);
```

In `update()`, replace the camera call with:

```ts
updateCameraFeedback(this.cameras.main, state, this.previousBulletCount, input.aimWorld);
```

- [ ] **Step 5: Verify Task 6**

Run:

```bash
npm run test -- src/phaser/view/camera.test.ts
npm run build
```

Expected: camera tests pass and production build succeeds.

- [ ] **Step 6: Commit Task 6**

Run:

```bash
git add src/phaser/view/camera.ts src/phaser/view/camera.test.ts src/phaser/scenes/GameScene.ts
git commit -m "Add smooth close gameplay camera"
```

## Task 7: Full Test Pass And Fullscreen Browser Review

**Files:**
- Modify only files needed to fix defects found during verification.
- Test: full unit suite, production build, fullscreen browser playtest.

- [ ] **Step 1: Run the full automated suite**

Run:

```bash
npm run test
npm run build
```

Expected: all Vitest tests pass and Vite production build succeeds.

- [ ] **Step 2: Start Vite in fullscreen review mode**

Run:

```bash
npm run dev
```

Expected: Vite prints a local URL on port `5173` or the next free port.

- [ ] **Step 3: Browser smoke test checklist**

Open the Vite URL in the in-app browser and use a large/fullscreen browser viewport.

Check:

- The player starts in the safe reception room.
- No enemies appear in the reception room.
- The scene is visibly closer than before.
- The camera follows smoothly and does not show empty outside-map space.
- The reception has one single-door test and one double-door route.
- Doors open when pushed by the player.
- Door sprites are slim and use the Valentint door asset.
- Door handles are visible enough to read orientation.
- Closed doors stop bullets.
- Security hard cover stops bullets.
- Reception/newsroom soft furniture blocks walking but does not stop bullets.
- `E` and Cyrillic `У` pick up floor weapons.
- Picking up a weapon leaves the old weapon flying/spinning away.
- Humanoid enemies shoot.
- Frog-like enemies rush and do not shoot.
- Dead enemies move away from shot direction.
- Blood splatter is visibly richer in combat rooms.
- HUD score, weapon, ammo, enemy count, and pickup prompt remain readable.

- [ ] **Step 4: Capture screenshots for visual comparison**

Use the existing browser/screenshot workflow for this project and save review images under ignored directories such as `.superpowers/brainstorm/**`, `screenshots/**`, or `tmp/**`.

Capture:

- Safe reception.
- First door push into security.
- Newsroom combat.
- Server/archive hard-cover corridor.
- Broadcast control room.

Expected: screenshots are not committed unless they are final optimized production assets.

- [ ] **Step 5: Fix visual or behavior defects found by review**

For each defect, make the smallest targeted change and rerun:

```bash
npm run test
npm run build
```

Expected: fixes preserve existing tests and do not introduce unrelated refactors.

- [ ] **Step 6: Commit final verification fixes**

Run:

```bash
git status --short
git add src docs
git commit -m "Polish reception hub demo map"
```

Only commit source/docs/final optimized assets. Keep experimental media, screenshots, and generated references ignored.

## Self-Review Notes

Spec coverage:

- Safe reception: Task 1, Task 4, Task 5, Task 7.
- Reception-hub branches: Task 1 and Task 4.
- Standardized doors using real assets: Task 3 and Task 7.
- Soft versus hard cover: Task 1, Task 4, Task 7.
- One weapon held, pickup/drop behavior: existing systems plus Task 5 and Task 7.
- Humanoid ranged and frog-like melee enemies: Task 5 and Task 7.
- More blood and death knockback: existing systems plus Task 7 visual verification.
- Smooth close camera with aim offset: Task 6 and Task 7.
- Fullscreen browser verification: Task 7.

Scope boundary:

- This plan does not add kick.
- This plan does not add dynamic zoom.
- This plan does not generate new AI sprites.
- This plan does not replace Valentint door sprites with procedural art.
