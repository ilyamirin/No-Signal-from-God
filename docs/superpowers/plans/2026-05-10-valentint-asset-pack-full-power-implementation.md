# Valentint Asset Pack Full-Power Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the current demo around data-driven entities so the Valentint Sci-Fi asset pack powers weapons, doors, props, actors, projectiles, blood, decals, and room dressing.

**Architecture:** Keep game rules in `src/game/**` and Phaser as a renderer/input adapter in `src/phaser/**`. Introduce typed entity collections, collision channels, actor archetypes, dropped weapons, hinged doors, prop catalog entries, and animation state derived from simulation. Keep every task shippable: tests pass, game builds, and the browser scene remains playable.

**Tech Stack:** TypeScript, Vite, Phaser 3, Vitest, existing DOM HUD.

---

## File Structure

Create:

- `src/game/content/assetCatalog.ts` - stable asset keys, frame metadata, and animation names for the Valentint pack.
- `src/game/content/props.ts` - prop catalog with collision/perception channels and room theme tags.
- `src/game/content/doors.ts` - initial hinged door definitions for the starter level.
- `src/game/content/droppedWeapons.ts` - initial floor weapon placements.
- `src/game/simulation/collision.ts` - channel-aware collision queries for movement, bullets, vision, and sound.
- `src/game/simulation/interactions.ts` - `E`/`У` interaction resolution for pickup and doors.
- `src/game/simulation/systems/doors.ts` - door angle/state/collider updates.
- `src/game/simulation/systems/droppedWeapons.ts` - thrown weapon movement, spin, friction, and pickup.
- `src/game/simulation/systems/animation.ts` - simulation-side animation state selection.
- `src/game/simulation/systems/death.ts` - death impulse, corpse state, blood/decal emission.
- `src/game/simulation/collision.test.ts`
- `src/game/simulation/interactions.test.ts`
- `src/game/simulation/doors.test.ts`
- `src/game/simulation/droppedWeapons.test.ts`
- `src/game/simulation/animation.test.ts`
- `src/game/simulation/death.test.ts`
- `src/phaser/view/drawDoors.ts`
- `src/phaser/view/drawDroppedWeapons.ts`
- `src/phaser/view/drawProps.ts`
- `src/phaser/view/drawScifiFx.ts`

Modify:

- `src/game/simulation/types.ts` - add entity, channel, prop, door, dropped weapon, animation, and decal types.
- `src/game/simulation/state.ts` - initialize new entity collections.
- `src/game/simulation/update.ts` - update interactions, doors, dropped weapons, projectiles, FX, decals, actors.
- `src/game/simulation/systems/combat.ts` - use collision channels, death impulse, richer blood.
- `src/game/simulation/systems/enemies.ts` - split frog melee and humanoid gunner behavior.
- `src/game/simulation/systems/weapons.ts` - weapon definitions, held/dropped behavior, rifle branch.
- `src/game/input/actions.ts` - add `interact`.
- `src/game/input/bindings.ts` - bind `E` and Cyrillic `У`.
- `src/game/content/arena.ts` - move static obstacles toward entity-backed props/doors.
- `src/game/content/enemies.ts` - use actor archetypes.
- `src/game/content/weapons.ts` - add pistol/rifle definitions and dropped weapon factory helpers.
- `src/phaser/scenes/GameScene.ts` - create/sync new entity renderers.
- `src/phaser/view/scifiAssets.ts` - load remaining pack sheets and animations.
- `src/phaser/view/drawActors.ts` - use animation state, weapon branch, actor archetype.
- `src/phaser/view/drawArena.ts` - reduce one-off prop placement as prop renderer takes over.
- `src/phaser/view/drawFx.ts` - either delegate to `drawScifiFx` or become wrapper.
- `src/ui/hud/createHud.ts` - show current weapon only, ammo, reload, interact prompt.

## Task 1: Entity And Collision Types

**Files:**
- Modify: `src/game/simulation/types.ts`
- Create: `src/game/simulation/collision.ts`
- Create: `src/game/simulation/collision.test.ts`

- [ ] **Step 1: Add failing collision-channel tests**

Add `src/game/simulation/collision.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { blocksChannelAtPoint, blocksMovementAtCircle } from "./collision";
import type { Collider } from "./types";

const softCover: Collider = {
  id: "table-soft-cover",
  kind: "rect",
  rect: { x: 10, y: 10, width: 40, height: 20 },
  channels: {
    movement: true,
    bullets: false,
    vision: false,
    sound: false,
  },
};

const column: Collider = {
  id: "column-hard-cover",
  kind: "rect",
  rect: { x: 100, y: 100, width: 30, height: 30 },
  channels: {
    movement: true,
    bullets: true,
    vision: true,
    sound: true,
  },
};

describe("channel-aware collision", () => {
  it("soft cover blocks movement but not bullets, vision, or sound", () => {
    expect(blocksMovementAtCircle([softCover], { x: 20, y: 20 }, 8)).toBe(true);
    expect(blocksChannelAtPoint([softCover], "bullets", { x: 20, y: 20 })).toBe(false);
    expect(blocksChannelAtPoint([softCover], "vision", { x: 20, y: 20 })).toBe(false);
    expect(blocksChannelAtPoint([softCover], "sound", { x: 20, y: 20 })).toBe(false);
  });

  it("hard cover blocks movement, bullets, vision, and sound", () => {
    expect(blocksMovementAtCircle([column], { x: 112, y: 112 }, 8)).toBe(true);
    expect(blocksChannelAtPoint([column], "bullets", { x: 112, y: 112 })).toBe(true);
    expect(blocksChannelAtPoint([column], "vision", { x: 112, y: 112 })).toBe(true);
    expect(blocksChannelAtPoint([column], "sound", { x: 112, y: 112 })).toBe(true);
  });
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm run test -- src/game/simulation/collision.test.ts
```

Expected: TypeScript/test failure because `Collider`, `blocksMovementAtCircle`, and `blocksChannelAtPoint` do not exist.

- [ ] **Step 3: Add types**

In `src/game/simulation/types.ts`, add:

```ts
export type CollisionChannel = "movement" | "bullets" | "vision" | "sound";

export type CollisionChannels = Record<CollisionChannel, boolean>;

export type Collider =
  | {
      id: string;
      kind: "rect";
      rect: Rect;
      channels: CollisionChannels;
    }
  | {
      id: string;
      kind: "door-segment";
      start: Vec2;
      end: Vec2;
      thickness: number;
      channels: CollisionChannels;
    };

export type PropCollisionClass =
  | "softCover"
  | "hardCover"
  | "visualDecor"
  | "interactivePickup"
  | "thinBarrier";
```

- [ ] **Step 4: Implement collision helpers**

Create `src/game/simulation/collision.ts`:

```ts
import { circleIntersectsRect, pointInRect } from "./geometry";
import type { Collider, CollisionChannel, Vec2 } from "./types";

const distanceToSegment = (point: Vec2, start: Vec2, end: Vec2): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) {
    return Math.hypot(point.x - start.x, point.y - start.y);
  }
  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  const projected = { x: start.x + t * dx, y: start.y + t * dy };
  return Math.hypot(point.x - projected.x, point.y - projected.y);
};

export const blocksChannelAtPoint = (
  colliders: Collider[],
  channel: CollisionChannel,
  point: Vec2,
): boolean =>
  colliders.some((collider) => {
    if (!collider.channels[channel]) {
      return false;
    }
    if (collider.kind === "rect") {
      return pointInRect(point, collider.rect);
    }
    return distanceToSegment(point, collider.start, collider.end) <= collider.thickness / 2;
  });

export const blocksMovementAtCircle = (
  colliders: Collider[],
  center: Vec2,
  radius: number,
): boolean =>
  colliders.some((collider) => {
    if (!collider.channels.movement) {
      return false;
    }
    if (collider.kind === "rect") {
      return circleIntersectsRect(center, radius, collider.rect);
    }
    return distanceToSegment(center, collider.start, collider.end) <= radius + collider.thickness / 2;
  });
```

- [ ] **Step 5: Verify tests pass**

Run:

```bash
npm run test -- src/game/simulation/collision.test.ts
npm run build
```

Expected: collision tests pass and production build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/game/simulation/types.ts src/game/simulation/collision.ts src/game/simulation/collision.test.ts
git commit -m "Add channel-aware collision model"
```

## Task 2: Entity Collections In Game State

**Files:**
- Modify: `src/game/simulation/types.ts`
- Modify: `src/game/simulation/state.ts`
- Create: `src/game/content/props.ts`
- Create: `src/game/content/doors.ts`
- Create: `src/game/content/droppedWeapons.ts`
- Test: `src/game/simulation/state.test.ts`

- [ ] **Step 1: Add failing state initialization test**

Extend `src/game/simulation/state.test.ts`:

```ts
it("initializes prop, door, dropped weapon, decal, and collider collections", () => {
  const state = createInitialGameState();

  expect(state.props.length).toBeGreaterThan(0);
  expect(state.doors.length).toBeGreaterThan(0);
  expect(state.droppedWeapons.length).toBeGreaterThan(0);
  expect(state.decals).toEqual([]);
  expect(state.colliders.length).toBeGreaterThan(state.arena.obstacles.length);
});
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm run test -- src/game/simulation/state.test.ts
```

Expected: fail because new collections do not exist.

- [ ] **Step 3: Add entity types**

Add to `src/game/simulation/types.ts`:

```ts
export type WeaponKind = "pistol" | "rifle";
export type WeaponLocation = "held" | "dropped" | "flyingDrop";
export type DoorState = "closed" | "opening" | "open" | "closing";
export type HingeSide = "left" | "right" | "top" | "bottom";
export type ActorArchetype = "player" | "monster_melee" | "humanoid_ranged" | "scientist_npc";
export type AnimationState =
  | "idle"
  | "walk"
  | "run"
  | "shoot"
  | "reload"
  | "pain"
  | "death"
  | "weaponSwitch"
  | "use"
  | "punch"
  | "grenade";

export type DroppedWeaponState = {
  id: string;
  weaponId: string;
  kind: WeaponKind;
  position: Vec2;
  velocity: Vec2;
  rotation: number;
  angularVelocity: number;
  location: WeaponLocation;
};

export type DoorEntity = {
  id: string;
  position: Vec2;
  width: number;
  height: number;
  hinge: Vec2;
  hingeSide: HingeSide;
  state: DoorState;
  angle: number;
  targetAngle: number;
  openSpeed: number;
};

export type PropEntity = {
  id: string;
  catalogKey: string;
  position: Vec2;
  rotation: number;
  collisionClass: PropCollisionClass;
  collider?: Collider;
};

export type DecalState = {
  id: string;
  kind: "blood-floor" | "rubbish" | "scorch";
  position: Vec2;
  rotation: number;
  frame: number;
  ttlMs?: number;
};
```

Extend `GameState`:

```ts
props: PropEntity[];
doors: DoorEntity[];
droppedWeapons: DroppedWeaponState[];
decals: DecalState[];
colliders: Collider[];
```

- [ ] **Step 4: Add content factories**

Create `src/game/content/props.ts`:

```ts
import type { PropEntity } from "../simulation/types";

export const createStarterProps = (): PropEntity[] => [
  {
    id: "soft-table-left",
    catalogKey: "table_5",
    position: { x: 238, y: 205 },
    rotation: 0,
    collisionClass: "softCover",
    collider: {
      id: "soft-table-left",
      kind: "rect",
      rect: { id: "soft-table-left", x: 150, y: 165, width: 175, height: 74, blocksMovement: true, blocksBullets: false },
      channels: { movement: true, bullets: false, vision: false, sound: false },
    },
  },
  {
    id: "hard-column-green-room",
    catalogKey: "column",
    position: { x: 1266, y: 52 },
    rotation: 0,
    collisionClass: "hardCover",
    collider: {
      id: "hard-column-green-room",
      kind: "rect",
      rect: { id: "hard-column-green-room", x: 1266, y: 52, width: 18, height: 664, blocksMovement: true, blocksBullets: true },
      channels: { movement: true, bullets: true, vision: true, sound: true },
    },
  },
];
```

Create `src/game/content/doors.ts`:

```ts
import type { DoorEntity } from "../simulation/types";

export const createStarterDoors = (): DoorEntity[] => [
  {
    id: "door-left-hall",
    position: { x: 360, y: 358 },
    width: 18,
    height: 86,
    hinge: { x: 360, y: 315 },
    hingeSide: "top",
    state: "closed",
    angle: 0,
    targetAngle: 0,
    openSpeed: Math.PI * 3,
  },
  {
    id: "door-right-hall",
    position: { x: 824, y: 356 },
    width: 18,
    height: 86,
    hinge: { x: 824, y: 313 },
    hingeSide: "top",
    state: "closed",
    angle: 0,
    targetAngle: 0,
    openSpeed: Math.PI * 3,
  },
];
```

Create `src/game/content/droppedWeapons.ts`:

```ts
import type { DroppedWeaponState } from "../simulation/types";

export const createStarterDroppedWeapons = (): DroppedWeaponState[] => [
  {
    id: "dropped-rifle-center",
    weaponId: "floor-rifle-center",
    kind: "rifle",
    position: { x: 1010, y: 356 },
    velocity: { x: 0, y: 0 },
    rotation: 0.55,
    angularVelocity: 0,
    location: "dropped",
  },
];
```

- [ ] **Step 5: Initialize collections**

Modify `src/game/simulation/state.ts`:

```ts
import { createStarterDoors } from "../content/doors";
import { createStarterDroppedWeapons } from "../content/droppedWeapons";
import { createStarterProps } from "../content/props";

const props = createStarterProps();
const doors = createStarterDoors();

export const createInitialGameState = (): GameState => ({
  arena: createArena(),
  player: { /* keep existing player fields */ },
  enemies: createEnemies(),
  bullets: [],
  fx: [],
  weapons: createStarterWeapons(),
  props,
  doors,
  droppedWeapons: createStarterDroppedWeapons(),
  decals: [],
  colliders: [
    ...createArena().obstacles.map((obstacle) => ({
      id: obstacle.id,
      kind: "rect" as const,
      rect: obstacle,
      channels: {
        movement: obstacle.blocksMovement,
        bullets: obstacle.blocksBullets,
        vision: obstacle.blocksBullets,
        sound: obstacle.blocksMovement,
      },
    })),
    ...props.flatMap((prop) => (prop.collider ? [prop.collider] : [])),
  ],
  score: 0,
  status: "playing",
  engaged: false,
  elapsedMs: 0,
  nextId: 1,
});
```

When editing, avoid calling `createArena()` twice in final code by assigning `const arena = createArena()` inside a helper factory.

- [ ] **Step 6: Verify**

Run:

```bash
npm run test -- src/game/simulation/state.test.ts
npm run build
```

Expected: state tests and build pass.

- [ ] **Step 7: Commit**

```bash
git add src/game/simulation/types.ts src/game/simulation/state.ts src/game/content/props.ts src/game/content/doors.ts src/game/content/droppedWeapons.ts src/game/simulation/state.test.ts
git commit -m "Add level entity collections"
```

## Task 3: Interaction Input For E And Cyrillic У

**Files:**
- Modify: `src/game/input/actions.ts`
- Modify: `src/game/input/bindings.ts`
- Modify: `src/game/simulation/update.ts`
- Test: `src/game/simulation/update.test.ts`

- [ ] **Step 1: Add input type**

Modify `src/game/input/actions.ts`:

```ts
export type PlayerInput = {
  move: Vec2;
  aimWorld: Vec2;
  firing: boolean;
  restart: boolean;
  kick: boolean;
  interact: boolean;
};
```

- [ ] **Step 2: Bind E and Cyrillic У**

Modify `src/game/input/bindings.ts`:

```ts
export type InputBindingState = {
  keys: Record<"w" | "a" | "s" | "d" | "r" | "e" | "cyrillicU", Phaser.Input.Keyboard.Key>;
};
```

In `createInputBindings`:

```ts
e: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
cyrillicU: scene.input.keyboard.addKey("У"),
```

In `readPlayerInput`:

```ts
interact:
  Phaser.Input.Keyboard.JustDown(bindings.keys.e) ||
  Phaser.Input.Keyboard.JustDown(bindings.keys.cyrillicU),
```

- [ ] **Step 3: Update tests using `PlayerInput` fixtures**

Where tests construct `PlayerInput`, add `interact: false`.

- [ ] **Step 4: Verify**

Run:

```bash
npm run test -- src/game/simulation/update.test.ts
npm run build
```

Expected: tests/build pass.

- [ ] **Step 5: Commit**

```bash
git add src/game/input/actions.ts src/game/input/bindings.ts src/game/simulation/update.test.ts
git commit -m "Bind interact input"
```

## Task 4: Dropped Weapon Pickup And Throw-Off

**Files:**
- Create: `src/game/simulation/systems/droppedWeapons.ts`
- Create: `src/game/simulation/interactions.ts`
- Create: `src/game/simulation/droppedWeapons.test.ts`
- Create: `src/game/simulation/interactions.test.ts`
- Modify: `src/game/simulation/update.ts`
- Modify: `src/game/content/weapons.ts`

- [ ] **Step 1: Add failing dropped weapon tests**

Create `src/game/simulation/interactions.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { resolveInteraction } from "./interactions";

describe("weapon pickup interaction", () => {
  it("picks up one nearby floor weapon and throws the previous weapon aside", () => {
    const state = createInitialGameState();
    state.player.position = { x: 1010, y: 356 };
    state.player.weaponId = "service-pistol";

    resolveInteraction(state);

    expect(state.player.weaponId).toBe("floor-rifle-center");
    const thrown = state.droppedWeapons.find((weapon) => weapon.weaponId === "service-pistol");
    expect(thrown).toBeDefined();
    expect(thrown?.location).toBe("flyingDrop");
    expect(Math.hypot(thrown?.velocity.x ?? 0, thrown?.velocity.y ?? 0)).toBeGreaterThan(180);
  });
});
```

Create `src/game/simulation/droppedWeapons.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { updateDroppedWeapons } from "./systems/droppedWeapons";
import { createInitialGameState } from "./state";

describe("dropped weapon physics", () => {
  it("slows a flying dropped weapon and settles it on the floor", () => {
    const state = createInitialGameState();
    state.droppedWeapons = [{
      id: "drop-test",
      weaponId: "service-pistol",
      kind: "pistol",
      position: { x: 100, y: 100 },
      velocity: { x: 300, y: 0 },
      rotation: 0,
      angularVelocity: 8,
      location: "flyingDrop",
    }];

    updateDroppedWeapons(state, 1000);

    expect(state.droppedWeapons[0].position.x).toBeGreaterThan(100);
    expect(Math.abs(state.droppedWeapons[0].velocity.x)).toBeLessThan(300);
    expect(state.droppedWeapons[0].location).toBe("dropped");
  });
});
```

- [ ] **Step 2: Run failing tests**

Run:

```bash
npm run test -- src/game/simulation/interactions.test.ts src/game/simulation/droppedWeapons.test.ts
```

Expected: fail because interaction and dropped weapon systems do not exist.

- [ ] **Step 3: Add rifle weapon definition**

Modify `src/game/content/weapons.ts`:

```ts
const createRifle = (id: string): WeaponState => ({
  id,
  label: "24rnd compact rifle",
  loadedRounds: 24,
  magazineSize: 24,
  reserveRounds: 72,
  fireCooldownMs: 82,
  reloadDelayMs: 920,
  cooldownRemainingMs: 0,
  reloadRemainingMs: 0,
  bulletSpeed: 930,
  damage: 1,
});

export const createStarterWeapons = (): Record<string, WeaponState> => ({
  "service-pistol": createPistol("service-pistol"),
  "floor-rifle-center": createRifle("floor-rifle-center"),
  "enemy-ranged-anchor-pistol": createPistol("enemy-ranged-anchor-pistol"),
  "enemy-ranged-control-pistol": createPistol("enemy-ranged-control-pistol"),
  "enemy-ranged-green-pistol": createPistol("enemy-ranged-green-pistol"),
});
```

- [ ] **Step 4: Implement interaction**

Create `src/game/simulation/interactions.ts`:

```ts
import { distance, fromAngle, scale } from "./geometry";
import type { DroppedWeaponState, GameState } from "./types";

const PICKUP_RADIUS = 44;
const DROP_IMPULSE = 260;
const DROP_SIDE_ANGLE = Math.PI / 2;

export const resolveInteraction = (state: GameState): void => {
  const candidate = state.droppedWeapons.find((weapon) =>
    weapon.location === "dropped" &&
    distance(weapon.position, state.player.position) <= PICKUP_RADIUS
  );
  if (!candidate) {
    return;
  }

  const previousWeaponId = state.player.weaponId;
  state.player.weaponId = candidate.weaponId;
  state.droppedWeapons = state.droppedWeapons.filter((weapon) => weapon.id !== candidate.id);

  const throwDirection = fromAngle(state.player.facing + DROP_SIDE_ANGLE);
  const thrown: DroppedWeaponState = {
    id: `dropped-${previousWeaponId}-${state.nextId++}`,
    weaponId: previousWeaponId,
    kind: previousWeaponId.includes("rifle") ? "rifle" : "pistol",
    position: { ...state.player.position },
    velocity: scale(throwDirection, DROP_IMPULSE),
    rotation: state.player.facing,
    angularVelocity: 11,
    location: "flyingDrop",
  };
  state.droppedWeapons.push(thrown);
};
```

- [ ] **Step 5: Implement thrown weapon physics**

Create `src/game/simulation/systems/droppedWeapons.ts`:

```ts
import type { GameState } from "../types";

const FRICTION_PER_SECOND = 0.08;
const SETTLE_SPEED = 35;

export const updateDroppedWeapons = (state: GameState, deltaMs: number): void => {
  const seconds = deltaMs / 1000;
  const damping = Math.pow(FRICTION_PER_SECOND, seconds);

  for (const weapon of state.droppedWeapons) {
    if (weapon.location !== "flyingDrop") {
      continue;
    }
    weapon.position.x += weapon.velocity.x * seconds;
    weapon.position.y += weapon.velocity.y * seconds;
    weapon.rotation += weapon.angularVelocity * seconds;
    weapon.velocity.x *= damping;
    weapon.velocity.y *= damping;
    weapon.angularVelocity *= damping;

    if (Math.hypot(weapon.velocity.x, weapon.velocity.y) < SETTLE_SPEED) {
      weapon.velocity = { x: 0, y: 0 };
      weapon.angularVelocity = 0;
      weapon.location = "dropped";
    }
  }
};
```

- [ ] **Step 6: Wire into update**

In `src/game/simulation/update.ts`:

```ts
import { resolveInteraction } from "./interactions";
import { updateDroppedWeapons } from "./systems/droppedWeapons";
```

Inside `updateGame` after movement/facing:

```ts
if (input.interact && state.player.alive) {
  resolveInteraction(state);
}
updateDroppedWeapons(state, deltaMs);
```

- [ ] **Step 7: Verify**

Run:

```bash
npm run test -- src/game/simulation/interactions.test.ts src/game/simulation/droppedWeapons.test.ts
npm run test
npm run build
```

Expected: all tests and build pass.

- [ ] **Step 8: Commit**

```bash
git add src/game/content/weapons.ts src/game/simulation/interactions.ts src/game/simulation/systems/droppedWeapons.ts src/game/simulation/update.ts src/game/simulation/interactions.test.ts src/game/simulation/droppedWeapons.test.ts
git commit -m "Add weapon pickup and thrown drops"
```

## Task 5: Hinged Doors That Block Bullets

**Files:**
- Create: `src/game/simulation/systems/doors.ts`
- Create: `src/game/simulation/doors.test.ts`
- Modify: `src/game/simulation/update.ts`
- Modify: `src/game/simulation/interactions.ts`
- Modify: `src/game/simulation/systems/combat.ts`

- [ ] **Step 1: Add failing door tests**

Create `src/game/simulation/doors.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { doorCollider, toggleNearestDoor, updateDoors } from "./systems/doors";
import { blocksChannelAtPoint } from "./collision";

describe("hinged doors", () => {
  it("closed doors block bullets and movement", () => {
    const state = createInitialGameState();
    const collider = doorCollider(state.doors[0]);

    expect(blocksChannelAtPoint([collider], "bullets", state.doors[0].position)).toBe(true);
    expect(collider.channels.movement).toBe(true);
  });

  it("interaction opens the nearest door around its hinge", () => {
    const state = createInitialGameState();
    state.player.position = { ...state.doors[0].position };

    toggleNearestDoor(state);
    updateDoors(state, 250);

    expect(state.doors[0].state).toBe("opening");
    expect(state.doors[0].angle).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run failing test**

```bash
npm run test -- src/game/simulation/doors.test.ts
```

Expected: fail because door system does not exist.

- [ ] **Step 3: Implement door system**

Create `src/game/simulation/systems/doors.ts`:

```ts
import { distance, fromAngle, scale } from "../geometry";
import type { Collider, DoorEntity, GameState, Vec2 } from "../types";

const DOOR_INTERACT_RADIUS = 48;
const OPEN_ANGLE = Math.PI / 2;

const doorLength = (door: DoorEntity): number =>
  door.hingeSide === "top" || door.hingeSide === "bottom" ? door.height : door.width;

const doorDirection = (door: DoorEntity): Vec2 => {
  const baseAngle = door.hingeSide === "top" ? Math.PI / 2 :
    door.hingeSide === "bottom" ? -Math.PI / 2 :
    door.hingeSide === "left" ? 0 : Math.PI;
  return fromAngle(baseAngle + door.angle);
};

export const doorCollider = (door: DoorEntity): Collider => {
  const end = {
    x: door.hinge.x + doorDirection(door).x * doorLength(door),
    y: door.hinge.y + doorDirection(door).y * doorLength(door),
  };
  const blocking = door.state !== "open";
  return {
    id: door.id,
    kind: "door-segment",
    start: door.hinge,
    end,
    thickness: Math.min(door.width, door.height),
    channels: {
      movement: blocking,
      bullets: blocking,
      vision: blocking,
      sound: blocking,
    },
  };
};

export const rebuildDoorColliders = (state: GameState): void => {
  const nonDoorColliders = state.colliders.filter((collider) => !collider.id.startsWith("door-"));
  state.colliders = [...nonDoorColliders, ...state.doors.map(doorCollider)];
};

export const toggleNearestDoor = (state: GameState): void => {
  const door = state.doors.find((candidate) => distance(candidate.position, state.player.position) <= DOOR_INTERACT_RADIUS);
  if (!door) {
    return;
  }
  if (door.state === "closed" || door.state === "closing") {
    door.state = "opening";
    door.targetAngle = OPEN_ANGLE;
  } else {
    door.state = "closing";
    door.targetAngle = 0;
  }
};

export const updateDoors = (state: GameState, deltaMs: number): void => {
  const seconds = deltaMs / 1000;
  for (const door of state.doors) {
    if (door.state !== "opening" && door.state !== "closing") {
      continue;
    }
    const direction = Math.sign(door.targetAngle - door.angle);
    door.angle += direction * door.openSpeed * seconds;
    if ((direction > 0 && door.angle >= door.targetAngle) || (direction < 0 && door.angle <= door.targetAngle)) {
      door.angle = door.targetAngle;
      door.state = door.angle === 0 ? "closed" : "open";
    }
  }
  rebuildDoorColliders(state);
};
```

Remove unused imports while implementing if TypeScript flags them.

- [ ] **Step 4: Wire door interaction**

In `src/game/simulation/interactions.ts`, after no weapon pickup candidate is found:

```ts
toggleNearestDoor(state);
```

Import:

```ts
import { toggleNearestDoor } from "./systems/doors";
```

In `src/game/simulation/update.ts`, call:

```ts
updateDoors(state, deltaMs);
```

before bullet collision is resolved.

- [ ] **Step 5: Use colliders for bullets**

In `src/game/simulation/systems/combat.ts`, replace obstacle bullet blocking:

```ts
const blockerHit = blocksChannelAtPoint(state.colliders, "bullets", bullet.position);
if (blockerHit) {
  addFx(state, "impact", bullet.position, Math.atan2(bullet.velocity.y, bullet.velocity.x));
  continue;
}
```

- [ ] **Step 6: Verify**

Run:

```bash
npm run test -- src/game/simulation/doors.test.ts
npm run test
npm run build
```

Expected: all tests and build pass.

- [ ] **Step 7: Commit**

```bash
git add src/game/simulation/systems/doors.ts src/game/simulation/doors.test.ts src/game/simulation/interactions.ts src/game/simulation/update.ts src/game/simulation/systems/combat.ts
git commit -m "Add hinged bullet-blocking doors"
```

## Task 6: Enemy Archetypes And Melee-Only Monsters

**Files:**
- Modify: `src/game/simulation/types.ts`
- Modify: `src/game/content/enemies.ts`
- Modify: `src/game/simulation/systems/enemies.ts`
- Create: `src/game/simulation/enemyArchetypes.test.ts`

- [ ] **Step 1: Add failing archetype tests**

Create `src/game/simulation/enemyArchetypes.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { updateEnemies } from "./systems/enemies";

describe("enemy archetypes", () => {
  it("monster melee enemies never fire bullets even if a weapon id is present", () => {
    const state = createInitialGameState();
    state.engaged = true;
    state.enemies = [{
      id: "monster-test",
      archetype: "monster_melee",
      kind: "rush",
      head: "human",
      position: { x: state.player.position.x + 80, y: state.player.position.y },
      velocity: { x: 0, y: 0 },
      radius: 17,
      facing: 0,
      health: 1,
      alive: true,
      weaponId: "enemy-ranged-anchor-pistol",
      attackCooldownMs: 0,
    }];

    updateEnemies(state, 600);

    expect(state.bullets).toHaveLength(0);
  });

  it("humanoid ranged enemies can fire when line of sight is clear", () => {
    const state = createInitialGameState();
    state.engaged = true;
    state.enemies = [{
      id: "gunner-test",
      archetype: "humanoid_ranged",
      kind: "ranged",
      head: "human",
      position: { x: state.player.position.x + 260, y: state.player.position.y },
      velocity: { x: 0, y: 0 },
      radius: 18,
      facing: Math.PI,
      health: 1,
      alive: true,
      weaponId: "enemy-ranged-anchor-pistol",
      attackCooldownMs: 0,
    }];
    state.colliders = [];

    updateEnemies(state, 600);

    expect(state.bullets.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Add archetype to enemy state**

In `src/game/simulation/types.ts`, add `archetype: ActorArchetype` to `EnemyState`.

- [ ] **Step 3: Update enemy content**

In `src/game/content/enemies.ts`:

- ranged enemies get `archetype: "humanoid_ranged"`;
- rush enemies get `archetype: "monster_melee"`;
- monster enemies have no `weaponId`.

- [ ] **Step 4: Gate ranged behavior by archetype**

In `src/game/simulation/systems/enemies.ts`, update loop:

```ts
if (enemy.archetype === "monster_melee") {
  updateRushEnemy(state, enemy, deltaMs);
} else if (enemy.archetype === "humanoid_ranged") {
  updateRangedEnemy(state, enemy, deltaMs);
}
```

Replace any rectangle-only ranged visibility check with:

```ts
const canSeePlayer = hasLineOfSightThroughColliders(
  state.colliders,
  enemy.position,
  state.player.position,
  "vision",
);
```

`hasLineOfSightThroughColliders` samples the segment every 8 pixels and returns false when `blocksChannelAtPoint(state.colliders, "vision", point)` is true. Ranged humanoids use this visibility result before shooting; melee monsters ignore weapon logic entirely.

- [ ] **Step 5: Verify**

Run:

```bash
npm run test -- src/game/simulation/enemyArchetypes.test.ts
npm run test
npm run build
```

Expected: all tests and build pass.

- [ ] **Step 6: Commit**

```bash
git add src/game/simulation/types.ts src/game/content/enemies.ts src/game/simulation/systems/enemies.ts src/game/simulation/enemyArchetypes.test.ts
git commit -m "Split monster and humanoid enemy archetypes"
```

## Task 7: Animation State Graph

**Files:**
- Create: `src/game/simulation/systems/animation.ts`
- Create: `src/game/simulation/animation.test.ts`
- Modify: `src/game/simulation/types.ts`
- Modify: `src/phaser/view/scifiAssets.ts`
- Modify: `src/phaser/view/drawActors.ts`

- [ ] **Step 1: Add failing animation tests**

Create `src/game/simulation/animation.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { actorAnimationState } from "./systems/animation";
import type { EnemyState, PlayerState, WeaponState } from "./types";

const weapon: WeaponState = {
  id: "service-pistol",
  label: "pistol",
  loadedRounds: 5,
  magazineSize: 6,
  reserveRounds: 12,
  fireCooldownMs: 150,
  reloadDelayMs: 680,
  cooldownRemainingMs: 0,
  reloadRemainingMs: 0,
  bulletSpeed: 780,
  damage: 1,
};

const player: PlayerState = {
  id: "player",
  head: "crt",
  outfit: "suit",
  position: { x: 0, y: 0 },
  velocity: { x: 260, y: 0 },
  radius: 18,
  facing: 0,
  health: 2,
  alive: true,
  weaponId: "service-pistol",
  invulnerableMs: 0,
};

describe("actor animation state", () => {
  it("uses reload while weapon is reloading", () => {
    expect(actorAnimationState(player, { ...weapon, reloadRemainingMs: 200 }, false)).toBe("reload");
  });

  it("uses death when actor is dead", () => {
    expect(actorAnimationState({ ...player, alive: false }, weapon, false)).toBe("death");
  });

  it("uses run for moving actors", () => {
    expect(actorAnimationState(player, weapon, false)).toBe("run");
  });
});
```

- [ ] **Step 2: Implement animation state**

Create `src/game/simulation/systems/animation.ts`:

```ts
import type { ActorBase, AnimationState, WeaponState } from "../types";

const RUN_SPEED = 140;

export const actorAnimationState = (
  actor: ActorBase,
  weapon: WeaponState | undefined,
  shooting: boolean,
): AnimationState => {
  if (!actor.alive) {
    return "death";
  }
  if (weapon?.reloadRemainingMs && weapon.reloadRemainingMs > 0) {
    return "reload";
  }
  if (shooting) {
    return "shoot";
  }
  const speed = Math.hypot(actor.velocity.x, actor.velocity.y);
  if (speed >= RUN_SPEED) {
    return "run";
  }
  if (speed > 8) {
    return "walk";
  }
  return "idle";
};
```

- [ ] **Step 3: Load remaining player rifle/reload/switch/pain sheets**

In `src/phaser/view/scifiAssets.ts`, add imports and sheet entries for:

- `Player/Idle/player_idle_rifle_Sheet.png`
- `Player/Walk/player_walk_rifle_Sheet.png`
- `Player/Run/player_run_rifle_Sheet.png`
- `Player/Shoot/player_shoot_rifle_Sheet.png`
- `Player/Reload/player_reload_pistol_Sheet.png`
- `Player/Reload/player_reload_rifle_Sheet.png`
- `Player/WeaponSwitch/player_switch_pistol_Sheet.png`
- `Player/WeaponSwitch/player_switch_rifle_Sheet.png`
- `Player/Pain/player_pain_pistol_Sheet.png`
- `NPCs/Enemy/enemy_pain_Sheet.png`
- `NPCs/NPC_Scientist/*.png`

Add corresponding `createAnimation` calls with the frame counts from file widths:

```ts
createAnimation(scene, "scifi-player-reload-pistol", "scifi-player-reload-pistol", 4, 10, 0);
createAnimation(scene, "scifi-player-reload-rifle", "scifi-player-reload-rifle", 4, 10, 0);
createAnimation(scene, "scifi-player-switch-pistol", "scifi-player-switch-pistol", 3, 12, 0);
createAnimation(scene, "scifi-player-switch-rifle", "scifi-player-switch-rifle", 3, 12, 0);
```

- [ ] **Step 4: Use animation state in renderer**

In `src/phaser/view/drawActors.ts`, replace local `animationFor` with one that maps simulation `AnimationState` and weapon kind to loaded animation keys. Use rifle keys when `weapon.id.includes("rifle")`.

Core mapping:

```ts
const playerAnimationKey = (state: AnimationState, weaponId: string): string => {
  const branch = weaponId.includes("rifle") ? "rifle" : "pistol";
  if (state === "reload") return `scifi-player-reload-${branch}`;
  if (state === "shoot") return `scifi-player-shoot-${branch}`;
  if (state === "run") return `scifi-player-run-${branch}`;
  if (state === "walk") return `scifi-player-walk-${branch}`;
  if (state === "death") return "scifi-player-death";
  return `scifi-player-idle-${branch}`;
};
```

- [ ] **Step 5: Verify**

Run:

```bash
npm run test -- src/game/simulation/animation.test.ts
npm run test
npm run build
```

Expected: all tests and build pass.

- [ ] **Step 6: Commit**

```bash
git add src/game/simulation/systems/animation.ts src/game/simulation/animation.test.ts src/game/simulation/types.ts src/phaser/view/scifiAssets.ts src/phaser/view/drawActors.ts
git commit -m "Add actor animation state graph"
```

## Task 8: Death Knockback And Blood-Heavy FX

**Files:**
- Create: `src/game/simulation/systems/death.ts`
- Create: `src/game/simulation/death.test.ts`
- Modify: `src/game/simulation/types.ts`
- Modify: `src/game/simulation/systems/combat.ts`
- Modify: `src/game/simulation/update.ts`

- [ ] **Step 1: Add failing death test**

Create `src/game/simulation/death.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { applyFatalHitImpulse, updateCorpseMotion } from "./systems/death";
import { createInitialGameState } from "./state";

describe("death knockback", () => {
  it("pushes dead enemies opposite incoming bullet direction and emits blood decals", () => {
    const state = createInitialGameState();
    const enemy = state.enemies[0];
    enemy.position = { x: 400, y: 400 };

    applyFatalHitImpulse(state, enemy, { x: 600, y: 0 });

    expect(enemy.alive).toBe(false);
    expect(enemy.velocity.x).toBeLessThan(0);
    expect(state.decals.some((decal) => decal.kind === "blood-floor")).toBe(true);
    expect(state.fx.filter((fx) => fx.kind === "blood").length).toBeGreaterThanOrEqual(3);

    const startX = enemy.position.x;
    updateCorpseMotion(state, 100);
    expect(enemy.position.x).toBeLessThan(startX);
  });
});
```

- [ ] **Step 2: Extend FX kind**

In `src/game/simulation/types.ts`, extend `FxState.kind`:

```ts
kind: "muzzle" | "blood" | "casing" | "impact" | "blood-death" | "bullet-puff";
```

- [ ] **Step 3: Implement death system**

Create `src/game/simulation/systems/death.ts`:

```ts
import { normalize, scale } from "../geometry";
import type { EnemyState, GameState, Vec2 } from "../types";

const DEATH_IMPULSE = 360;
const CORPSE_FRICTION_PER_SECOND = 0.05;

export const applyFatalHitImpulse = (
  state: GameState,
  enemy: EnemyState,
  incomingVelocity: Vec2,
): void => {
  const opposite = scale(normalize({ x: -incomingVelocity.x, y: -incomingVelocity.y }), DEATH_IMPULSE);
  enemy.alive = false;
  enemy.velocity = opposite;

  for (let index = 0; index < 4; index += 1) {
    state.fx.push({
      id: `fx-${state.nextId++}`,
      kind: "blood",
      position: {
        x: enemy.position.x + opposite.x * 0.018 * index,
        y: enemy.position.y + opposite.y * 0.018 * index,
      },
      rotation: Math.atan2(opposite.y, opposite.x),
      ttlMs: 900 + index * 220,
    });
  }

  state.decals.push({
    id: `decal-${state.nextId++}`,
    kind: "blood-floor",
    position: { ...enemy.position },
    rotation: Math.atan2(opposite.y, opposite.x),
    frame: enemy.archetype === "monster_melee" ? 0 : 1,
  });
};

export const updateCorpseMotion = (state: GameState, deltaMs: number): void => {
  const seconds = deltaMs / 1000;
  const damping = Math.pow(CORPSE_FRICTION_PER_SECOND, seconds);
  for (const enemy of state.enemies) {
    if (enemy.alive) {
      continue;
    }
    enemy.position.x += enemy.velocity.x * seconds;
    enemy.position.y += enemy.velocity.y * seconds;
    enemy.velocity.x *= damping;
    enemy.velocity.y *= damping;
    if (Math.hypot(enemy.velocity.x, enemy.velocity.y) < 8) {
      enemy.velocity = { x: 0, y: 0 };
    }
  }
};
```

- [ ] **Step 4: Wire into combat**

In `src/game/simulation/systems/combat.ts`, replace direct enemy death:

```ts
if (enemy.health <= 0) {
  applyFatalHitImpulse(state, enemy, bullet.velocity);
  state.score += killScore(enemy.kind);
}
```

Import `applyFatalHitImpulse`.

- [ ] **Step 5: Update corpse motion**

In `src/game/simulation/update.ts`, call `updateCorpseMotion(state, deltaMs)` every playing frame after combat/enemies.

- [ ] **Step 6: Verify**

Run:

```bash
npm run test -- src/game/simulation/death.test.ts
npm run test
npm run build
```

Expected: all tests and build pass.

- [ ] **Step 7: Commit**

```bash
git add src/game/simulation/systems/death.ts src/game/simulation/death.test.ts src/game/simulation/types.ts src/game/simulation/systems/combat.ts src/game/simulation/update.ts
git commit -m "Add death knockback and blood decals"
```

## Task 9: Phaser Renderers For Doors, Drops, Props, FX

**Files:**
- Create: `src/phaser/view/drawDoors.ts`
- Create: `src/phaser/view/drawDroppedWeapons.ts`
- Create: `src/phaser/view/drawProps.ts`
- Create: `src/phaser/view/drawScifiFx.ts`
- Modify: `src/phaser/scenes/GameScene.ts`
- Modify: `src/phaser/view/scifiAssets.ts`

- [ ] **Step 1: Add remaining asset loads**

In `src/phaser/view/scifiAssets.ts`, load:

- `Projectiles/bullet.png` as `scifi-bullet`
- `Projectiles/grenade_Sheet.png` as `scifi-grenade`
- all `Particles/*.png`
- `Objects/weaponBag.png`
- `Objects/healthBag.png`

Add animations:

```ts
createAnimation(scene, "scifi-explosion", "scifi-explosion", 5, 16, 0);
createAnimation(scene, "scifi-monster-blood-splash", "scifi-monster-blood-splash", 5, 18, 0);
createAnimation(scene, "scifi-player-blood-splash", "scifi-player-blood-splash", 5, 18, 0);
```

- [ ] **Step 2: Create prop renderer**

Create `src/phaser/view/drawProps.ts`:

```ts
import Phaser from "phaser";
import { propCatalog } from "../../game/content/props";
import type { PropEntity } from "../../game/simulation/types";

export type PropRig = {
  sprite: Phaser.GameObjects.Sprite;
};

const propTexture = (prop: PropEntity): string =>
  propCatalog[prop.catalogKey].assetKey;

export const createPropRig = (scene: Phaser.Scene, prop: PropEntity): PropRig => ({
  sprite: scene.add.sprite(prop.position.x, prop.position.y, propTexture(prop), 0)
    .setOrigin(0.5)
    .setRotation(prop.rotation)
    .setDepth(20),
});

export const syncPropRig = (rig: PropRig, prop: PropEntity): void => {
  rig.sprite.setPosition(prop.position.x, prop.position.y);
  rig.sprite.setRotation(prop.rotation);
};
```

The renderer resolves every prop through `propCatalog[prop.catalogKey].assetKey`; do not use substring-based texture fallbacks.

- [ ] **Step 3: Create dropped weapon renderer**

Create `src/phaser/view/drawDroppedWeapons.ts`:

```ts
import Phaser from "phaser";
import type { DroppedWeaponState } from "../../game/simulation/types";

export type DroppedWeaponRig = {
  sprite: Phaser.GameObjects.Sprite;
};

const textureForWeapon = (weapon: DroppedWeaponState): string =>
  weapon.kind === "rifle" ? "scifi-player-idle-rifle" : "scifi-player-idle-pistol";

export const createDroppedWeaponRig = (scene: Phaser.Scene, weapon: DroppedWeaponState): DroppedWeaponRig => ({
  sprite: scene.add.sprite(weapon.position.x, weapon.position.y, textureForWeapon(weapon), 0)
    .setOrigin(0.5)
    .setScale(0.8)
    .setRotation(weapon.rotation)
    .setDepth(18),
});

export const syncDroppedWeaponRig = (rig: DroppedWeaponRig, weapon: DroppedWeaponState): void => {
  rig.sprite.setPosition(weapon.position.x, weapon.position.y);
  rig.sprite.setRotation(weapon.rotation);
};
```

- [ ] **Step 4: Create door renderer**

Create `src/phaser/view/drawDoors.ts`:

```ts
import Phaser from "phaser";
import type { DoorEntity } from "../../game/simulation/types";

export type DoorRig = {
  sprite: Phaser.GameObjects.Sprite;
};

export const createDoorRig = (scene: Phaser.Scene, door: DoorEntity): DoorRig => ({
  sprite: scene.add.sprite(door.hinge.x, door.hinge.y, "scifi-door-heavy", 0)
    .setOrigin(0.5, 0)
    .setRotation(door.angle)
    .setDepth(22),
});

export const syncDoorRig = (rig: DoorRig, door: DoorEntity): void => {
  rig.sprite.setPosition(door.hinge.x, door.hinge.y);
  rig.sprite.setRotation(door.angle);
};
```

- [ ] **Step 5: Wire scene maps**

In `src/phaser/scenes/GameScene.ts`, add maps for doors, dropped weapons, and props. Create rigs in `create()`, sync them in `update()`, and remove rigs whose entities disappear.

Use the existing enemy rig map pattern as the model.

- [ ] **Step 6: Verify in browser**

Run:

```bash
npm run build
npm run test
npm run dev
```

Open fullscreen browser at `http://127.0.0.1:5173`, verify no console warnings/errors, and capture:

```bash
/Users/ilyagmirin/.codex/skills/playwright/scripts/playwright_cli.sh screenshot
```

Expected: doors and dropped weapons render, scene remains playable.

- [ ] **Step 7: Commit**

```bash
git add src/phaser/view/drawDoors.ts src/phaser/view/drawDroppedWeapons.ts src/phaser/view/drawProps.ts src/phaser/view/drawScifiFx.ts src/phaser/scenes/GameScene.ts src/phaser/view/scifiAssets.ts
git commit -m "Render entity-backed pack objects"
```

## Task 10: Prop Catalog And Room Themes

**Files:**
- Create: `src/game/content/assetCatalog.ts`
- Modify: `src/game/content/props.ts`
- Modify: `src/phaser/view/drawProps.ts`
- Test: `src/game/content/actorParts.test.ts` or new `src/game/content/props.test.ts`

- [ ] **Step 1: Add prop catalog test**

Create `src/game/content/props.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { propCatalog } from "./props";

describe("prop catalog", () => {
  it("classifies tables and plants as soft cover", () => {
    expect(propCatalog.table_1.collisionClass).toBe("softCover");
    expect(propCatalog.plants.collisionClass).toBe("softCover");
    expect(propCatalog.table_1.channels.bullets).toBe(false);
  });

  it("classifies columns as hard cover", () => {
    expect(propCatalog.column.channels.movement).toBe(true);
    expect(propCatalog.column.channels.bullets).toBe(true);
    expect(propCatalog.column.channels.vision).toBe(true);
    expect(propCatalog.column.channels.sound).toBe(true);
  });
});
```

- [ ] **Step 2: Implement catalog**

In `src/game/content/props.ts`, export:

```ts
export const propCatalog = {
  table_1: {
    assetKey: "scifi-table-1",
    collisionClass: "softCover",
    channels: { movement: true, bullets: false, vision: false, sound: false },
    themes: ["tvStudio", "office", "lab"],
  },
  plants: {
    assetKey: "scifi-plant",
    collisionClass: "softCover",
    channels: { movement: true, bullets: false, vision: false, sound: false },
    themes: ["office", "tvStudio"],
  },
  column: {
    assetKey: "scifi-wall-tiles",
    collisionClass: "hardCover",
    channels: { movement: true, bullets: true, vision: true, sound: true },
    themes: ["server", "lab", "tvStudio"],
  },
} as const;
```

Add catalog entries for every key in this list, using exact asset keys from `src/phaser/view/scifiAssets.ts` after Task 10 extends that loader:

```ts
[
  "barrel", "bed_sheets", "box_big", "box_small", "cafeteria", "chair_1", "chair_2",
  "cooler", "couch_1", "couch_2", "display_1", "display_2", "fridge",
  "hospital_bed", "hospital_light", "hospital_surgery_bed", "iv", "kitchen_items",
  "laboratory_device", "laboratory_glass", "lamps", "microwave", "microscope",
  "plants", "printer", "shelf_hospital", "shelf_laboratory", "sink", "soap",
  "stove", "surgery_instruments", "table_1", "table_2", "table_3", "table_4",
  "table_5", "table_6", "table_7", "table_8", "table_9", "table_10",
  "table_11", "tablet_pen", "toilet", "toilet_door", "toilet_paper",
  "toilet_table", "toilet_wall", "trash_can_1", "trash_can_2", "trash_can_3",
  "tv", "tv_remote", "keyboard_mouse", "wall_lamp", "computer", "door_small",
  "door_heavy", "health_bag", "weapon_bag"
]
```

Soft-cover entries set `{ movement: true, bullets: false, vision: false, sound: false }`. Hard-cover entries set `{ movement: true, bullets: true, vision: true, sound: true }`. Decorative floor decals are not props and stay out of this catalog.

- [ ] **Step 3: Verify**

Run:

```bash
npm run test -- src/game/content/props.test.ts
npm run test
npm run build
```

Expected: all tests and build pass.

- [ ] **Step 4: Commit**

```bash
git add src/game/content/props.ts src/game/content/props.test.ts src/phaser/view/drawProps.ts
git commit -m "Catalog sci-fi props by gameplay class"
```

## Task 11: HUD And Interaction Prompt

**Files:**
- Modify: `src/ui/hud/createHud.ts`
- Modify: `src/phaser/scenes/GameScene.ts`
- Test: existing tests if HUD has no unit coverage; rely on build and browser QA.

- [ ] **Step 1: Show current weapon only**

Update HUD render so it displays:

- `weapon.label`
- `loadedRounds / reserveRounds`
- `RELOADING` when `reloadRemainingMs > 0`
- `E / У` prompt when player is near dropped weapon or door

Use state data dispatched by `GameScene.emitState`.

- [ ] **Step 2: Verify browser**

Run:

```bash
npm run build
npm run test
```

Then Playwright fullscreen check:

```bash
/Users/ilyagmirin/.codex/skills/playwright/scripts/playwright_cli.sh goto http://127.0.0.1:5173
/Users/ilyagmirin/.codex/skills/playwright/scripts/playwright_cli.sh console warning
/Users/ilyagmirin/.codex/skills/playwright/scripts/playwright_cli.sh screenshot
```

Expected: no console errors/warnings, HUD text fits, prompt appears near usable items.

- [ ] **Step 3: Commit**

```bash
git add src/ui/hud/createHud.ts src/phaser/scenes/GameScene.ts
git commit -m "Show weapon and interaction HUD"
```

## Task 12: Full-System QA And Tuning

**Files:**
- Modify only files needed for bugs found during QA.
- Save screenshots under ignored `output/playwright/`.

- [ ] **Step 1: Run full automated verification**

```bash
npm run test
npm run build
```

Expected: all tests pass, build succeeds.

- [ ] **Step 2: Run fullscreen browser smoke**

```bash
npm run dev
/Users/ilyagmirin/.codex/skills/playwright/scripts/playwright_cli.sh resize 1920 1080
/Users/ilyagmirin/.codex/skills/playwright/scripts/playwright_cli.sh goto http://127.0.0.1:5173
/Users/ilyagmirin/.codex/skills/playwright/scripts/playwright_cli.sh console warning
```

Expected: 0 errors, 0 warnings.

- [ ] **Step 3: Manual gameplay checklist**

Verify:

- Player moves with WASD.
- Mouse aim rotates actor.
- Left click fires current weapon.
- `E` picks up a floor weapon.
- `У` picks up a floor weapon on Russian layout.
- Old weapon flies/skids aside.
- Player has exactly one held weapon.
- Closed doors stop movement and bullets.
- Open doors allow passage unless the open panel physically blocks.
- Soft cover blocks movement but bullets pass through.
- Hard cover blocks movement and bullets.
- Frog/monster enemies never shoot.
- Humanoid enemies shoot.
- Death impulse pushes enemies opposite incoming bullet direction.
- More blood appears on hits/deaths.
- HUD remains readable and does not overlap play-critical information.

- [ ] **Step 4: Capture proof screenshots**

Save screenshots:

- `output/playwright/full-pack-pickup.png`
- `output/playwright/full-pack-door-bullet-block.png`
- `output/playwright/full-pack-blood-death.png`
- `output/playwright/full-pack-hud.png`

- [ ] **Step 5: Commit final tuning**

```bash
git status --short
git add <only files changed for QA fixes>
git commit -m "Tune full asset pack integration"
```

Only commit this task if QA fixes changed tracked source files.

## Self-Review

Spec coverage:

- One held weapon: Task 4.
- Pickup with `E` and `У`: Task 3 and Task 4.
- Old weapon thrown aside: Task 4.
- Frog/monster enemies cannot shoot: Task 6.
- Humanoid ranged enemies can shoot: Task 6.
- More blood: Task 8 and Task 12.
- Death knockback opposite bullet direction: Task 8.
- Doors with hinges: Task 5 and Task 9.
- Doors block bullets: Task 5.
- Soft cover blocks movement but not bullets/vision/sound: Task 1 and Task 10.
- Hard cover blocks movement and bullets/vision/sound: Task 1 and Task 10.
- Asset pack breadth: Task 7, Task 9, Task 10, Task 11.

Placeholder scan:

- This plan intentionally contains no unresolved placeholder tasks.

Type consistency:

- `Collider`, `CollisionChannels`, `DoorEntity`, `DroppedWeaponState`, `PropEntity`, `DecalState`, `AnimationState`, and `ActorArchetype` are introduced before tasks depend on them.
- Interaction and rendering tasks depend on entity collections introduced in Task 2.
