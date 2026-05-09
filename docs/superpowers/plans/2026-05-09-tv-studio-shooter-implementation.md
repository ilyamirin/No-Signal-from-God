# TV Studio Shooter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a playable Phaser browser-game slice: strict top-down late-90s/early-00s TV-studio room-clear shooter with WASD movement, mouse aiming, left-click shooting, one equipped weapon, mixed enemies, score/HUD, restart, and screenshot-based visual QA.

**Architecture:** Use a TypeScript/Vite app with Phaser as the canvas runtime and a DOM HUD layered above it. Keep rules in `src/game/simulation`, authored arena/enemy/weapon data in `src/game/content`, Phaser scene/rendering in `src/phaser`, and HUD in `src/ui`. Phaser sends input actions into the simulation and renders the resulting state; it does not own combat rules.

**Tech Stack:** TypeScript, Vite, Phaser, Vitest, Playwright CLI for browser smoke tests/screenshots. Use Vite for project dev server, production build, and preview operations; use Vitest for automated tests because it runs inside the same Vite toolchain. Do not introduce another application bundler.

---

## Source Design

Implement against `docs/superpowers/specs/2026-05-09-tv-studio-shooter-design.md`.

Required reference images:

- `/Users/ilyagmirin/Downloads/replicate-prediction-3acrj365jdrmw0cy08vbyc9w7m.jpeg`
- `/Users/ilyagmirin/Downloads/replicate-prediction-3acrj365jdrmw0cy08vbyc9w7m (1).jpeg`
- `/Users/ilyagmirin/Downloads/replicate-prediction-k50tnff449rmy0cy1s9aa8m7mm.jpeg`
- `/Users/ilyagmirin/Downloads/replicate-prediction-51qwra49knrmy0cy1s99p9e6nr.jpeg`

## File Map

- Create `package.json`: npm scripts and dependencies.
- Create `index.html`: root DOM shell.
- Create `tsconfig.json`: TypeScript config for Vite.
- Create `vite.config.ts`: Vite and Vitest config.
- Create `src/main.ts`: app bootstrap, Phaser config, HUD creation.
- Create `src/styles.css`: page layout, DOM HUD, pixel-style visual treatment.
- Create `src/game/simulation/types.ts`: shared simulation types and action contracts.
- Create `src/game/simulation/state.ts`: initial state factory and reset rules.
- Create `src/game/simulation/geometry.ts`: vector math, collisions, line checks.
- Create `src/game/simulation/systems/weapons.ts`: firing, ammo, reload delay.
- Create `src/game/simulation/systems/enemies.ts`: ranged and rush enemy decisions.
- Create `src/game/simulation/systems/combat.ts`: bullets, hits, scoring, win/death.
- Create `src/game/simulation/update.ts`: deterministic simulation tick entrypoint.
- Create `src/game/content/arena.ts`: arena size, obstacles, decor, spawn points.
- Create `src/game/content/enemies.ts`: six-enemy lineup.
- Create `src/game/content/weapons.ts`: equipped starter weapon.
- Create `src/game/input/actions.ts`: input action shape including `kick` extension point.
- Create `src/game/input/bindings.ts`: Phaser keyboard/pointer to action snapshot helpers.
- Create `src/phaser/scenes/GameScene.ts`: scene lifecycle, input collection, render sync.
- Create `src/phaser/view/drawArena.ts`: procedural TV-studio floor, walls, desks, CRTs, green screen, cables.
- Create `src/phaser/view/drawActors.ts`: strict top-down player/enemy graphics.
- Create `src/phaser/view/drawFx.ts`: bullets, muzzle flashes, blood, casings, hit feedback.
- Create `src/phaser/view/camera.ts`: fixed overhead camera and small shake helper.
- Create `src/phaser/adapters/sceneBridge.ts`: scene-to-simulation adapter.
- Create `src/ui/hud/createHud.ts`: DOM HUD creation and update methods.
- Create `src/game/simulation/*.test.ts`: Vitest coverage for weapons, enemy behavior, combat, restart.
- Create `output/playwright/`: screenshots generated during verification. This directory is ignored by `.gitignore`.

## Project Commands

- Install dependencies: `npm install`
- Start Vite dev server: `npm run dev`
- Run Vite production build through TypeScript: `npm run build`
- Preview Vite production build: `npm run preview`
- Run tests through Vitest: `npm run test`

## Task 1: Scaffold Vite, Phaser, Vitest, And App Shell

**Files:**

- Create: `package.json`
- Create: `index.html`
- Create: `tsconfig.json`
- Create: `vite.config.ts`
- Create: `src/main.ts`
- Create: `src/styles.css`

- [ ] **Step 1: Create `package.json`**

Write:

```json
{
  "name": "tv-studio-shooter",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite --host 127.0.0.1",
    "build": "tsc && vite build",
    "test": "vitest run",
    "test:watch": "vitest",
    "preview": "vite preview --host 127.0.0.1"
  },
  "dependencies": {
    "phaser": "^3.90.0"
  },
  "devDependencies": {
    "typescript": "^5.9.0",
    "vite": "^7.0.0",
    "vitest": "^3.2.0"
  }
}
```

- [ ] **Step 2: Create `index.html`**

Write:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>TV Studio Shooter</title>
  </head>
  <body>
    <div id="app">
      <div id="game-root"></div>
      <div id="hud-root"></div>
    </div>
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>
```

- [ ] **Step 3: Create TypeScript and Vite config**

Write `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "moduleResolution": "Bundler",
    "allowImportingTsExtensions": true,
    "isolatedModules": true,
    "moduleDetection": "force",
    "noEmit": true,
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src", "vite.config.ts"]
}
```

Write `vite.config.ts`:

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
  },
});
```

- [ ] **Step 4: Create shell CSS**

Write `src/styles.css`:

```css
html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  overflow: hidden;
  background: #05070b;
  font-family: "Courier New", Courier, monospace;
}

#app {
  position: relative;
  display: grid;
  place-items: center;
}

#game-root {
  width: min(100vw, 1366px);
  aspect-ratio: 16 / 9;
  background: #060911;
  image-rendering: pixelated;
}

#game-root canvas {
  display: block;
  width: 100%;
  height: 100%;
  image-rendering: pixelated;
}

#hud-root {
  position: absolute;
  inset: 0;
  pointer-events: none;
}
```

- [ ] **Step 5: Create temporary Phaser boot**

Write `src/main.ts`:

```ts
import Phaser from "phaser";
import "./styles.css";

class PlaceholderScene extends Phaser.Scene {
  constructor() {
    super("placeholder");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#08111d");
    this.add.text(48, 48, "TV STUDIO SHOOTER", {
      fontFamily: "Courier New",
      fontSize: "32px",
      color: "#ffd2f1",
      backgroundColor: "#050505",
      padding: { x: 12, y: 8 },
    });
  }
}

const gameRoot = document.querySelector<HTMLDivElement>("#game-root");

if (!gameRoot) {
  throw new Error("Missing #game-root");
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: gameRoot,
  width: 1366,
  height: 768,
  backgroundColor: "#05070b",
  pixelArt: true,
  roundPixels: true,
  scene: [PlaceholderScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
```

- [ ] **Step 6: Install dependencies**

Run: `npm install`

Expected: `package-lock.json` is created and npm exits with code 0.

- [ ] **Step 7: Verify build**

Run: `npm run build`

Expected: TypeScript and Vite build complete with no errors.

- [ ] **Step 8: Commit scaffold**

Run:

```bash
git add package.json package-lock.json index.html tsconfig.json vite.config.ts src/main.ts src/styles.css
git commit -m "feat: scaffold Phaser shooter app"
```

Expected: commit succeeds.

## Task 2: Build Deterministic Simulation State And Geometry

**Files:**

- Create: `src/game/simulation/types.ts`
- Create: `src/game/simulation/geometry.ts`
- Create: `src/game/simulation/state.ts`
- Create: `src/game/content/arena.ts`
- Create: `src/game/content/enemies.ts`
- Create: `src/game/content/weapons.ts`
- Test: `src/game/simulation/state.test.ts`

- [ ] **Step 1: Write failing state test**

Write `src/game/simulation/state.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";

describe("createInitialGameState", () => {
  it("creates one suited TV-head player with one equipped weapon and six enemies", () => {
    const state = createInitialGameState();

    expect(state.player.head).toBe("crt");
    expect(state.player.outfit).toBe("suit");
    expect(state.player.weaponId).toBe("service-pistol");
    expect(state.weapons[state.player.weaponId]?.loadedRounds).toBe(6);
    expect(state.enemies).toHaveLength(6);
    expect(state.enemies.some((enemy) => enemy.head === "human")).toBe(true);
    expect(state.enemies.some((enemy) => enemy.head === "crt")).toBe(true);
    expect(state.status).toBe("playing");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/game/simulation/state.test.ts`

Expected: FAIL because `./state` does not exist.

- [ ] **Step 3: Create simulation types**

Write `src/game/simulation/types.ts`:

```ts
export type Vec2 = {
  x: number;
  y: number;
};

export type HeadType = "crt" | "human";
export type EnemyKind = "ranged" | "rush";
export type GameStatus = "playing" | "dead" | "victory";

export type Rect = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  blocksMovement: boolean;
  blocksBullets: boolean;
};

export type ArenaDecor =
  | "news-desk"
  | "crt-wall"
  | "camera"
  | "studio-light"
  | "cable"
  | "server-rack"
  | "green-screen"
  | "control-panel";

export type DecorItem = {
  id: string;
  kind: ArenaDecor;
  position: Vec2;
  rotation: number;
};

export type WeaponState = {
  id: string;
  label: string;
  loadedRounds: number;
  magazineSize: number;
  reserveRounds: number;
  fireCooldownMs: number;
  reloadDelayMs: number;
  cooldownRemainingMs: number;
  reloadRemainingMs: number;
  bulletSpeed: number;
  damage: number;
};

export type ActorBase = {
  id: string;
  position: Vec2;
  velocity: Vec2;
  radius: number;
  facing: number;
  health: number;
  alive: boolean;
};

export type PlayerState = ActorBase & {
  head: "crt";
  outfit: "suit";
  weaponId: string;
  invulnerableMs: number;
};

export type EnemyState = ActorBase & {
  kind: EnemyKind;
  head: HeadType;
  weaponId?: string;
  attackCooldownMs: number;
};

export type BulletState = {
  id: string;
  ownerId: string;
  position: Vec2;
  velocity: Vec2;
  damage: number;
  ttlMs: number;
};

export type FxState = {
  id: string;
  kind: "muzzle" | "blood" | "casing" | "impact";
  position: Vec2;
  rotation: number;
  ttlMs: number;
};

export type ArenaState = {
  width: number;
  height: number;
  obstacles: Rect[];
  decor: DecorItem[];
};

export type GameState = {
  arena: ArenaState;
  player: PlayerState;
  enemies: EnemyState[];
  bullets: BulletState[];
  fx: FxState[];
  weapons: Record<string, WeaponState>;
  score: number;
  status: GameStatus;
  elapsedMs: number;
  nextId: number;
};
```

- [ ] **Step 4: Create geometry helpers**

Write `src/game/simulation/geometry.ts`:

```ts
import type { Rect, Vec2 } from "./types";

export const vec = (x = 0, y = 0): Vec2 => ({ x, y });

export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });

export const scale = (value: Vec2, amount: number): Vec2 => ({
  x: value.x * amount,
  y: value.y * amount,
});

export const length = (value: Vec2): number => Math.hypot(value.x, value.y);

export const normalize = (value: Vec2): Vec2 => {
  const magnitude = length(value);
  return magnitude === 0 ? vec(0, 0) : vec(value.x / magnitude, value.y / magnitude);
};

export const angleTo = (from: Vec2, to: Vec2): number => Math.atan2(to.y - from.y, to.x - from.x);

export const fromAngle = (angle: number): Vec2 => ({ x: Math.cos(angle), y: Math.sin(angle) });

export const distance = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);

export const clampToArena = (position: Vec2, radius: number, width: number, height: number): Vec2 => ({
  x: Math.max(radius, Math.min(width - radius, position.x)),
  y: Math.max(radius, Math.min(height - radius, position.y)),
});

export const pointInRect = (point: Vec2, rect: Rect): boolean =>
  point.x >= rect.x &&
  point.x <= rect.x + rect.width &&
  point.y >= rect.y &&
  point.y <= rect.y + rect.height;

export const circleIntersectsRect = (center: Vec2, radius: number, rect: Rect): boolean => {
  const closestX = Math.max(rect.x, Math.min(center.x, rect.x + rect.width));
  const closestY = Math.max(rect.y, Math.min(center.y, rect.y + rect.height));
  return Math.hypot(center.x - closestX, center.y - closestY) < radius;
};

export const hasLineOfSight = (from: Vec2, to: Vec2, blockers: Rect[]): boolean => {
  const steps = Math.max(8, Math.ceil(distance(from, to) / 18));
  for (let index = 1; index < steps; index += 1) {
    const t = index / steps;
    const probe = {
      x: from.x + (to.x - from.x) * t,
      y: from.y + (to.y - from.y) * t,
    };
    if (blockers.some((blocker) => blocker.blocksBullets && pointInRect(probe, blocker))) {
      return false;
    }
  }
  return true;
};
```

- [ ] **Step 5: Create content data**

Write `src/game/content/weapons.ts`:

```ts
import type { WeaponState } from "../simulation/types";

export const createStarterWeapons = (): Record<string, WeaponState> => ({
  "service-pistol": {
    id: "service-pistol",
    label: "6rnd service pistol",
    loadedRounds: 6,
    magazineSize: 6,
    reserveRounds: 24,
    fireCooldownMs: 150,
    reloadDelayMs: 680,
    cooldownRemainingMs: 0,
    reloadRemainingMs: 0,
    bulletSpeed: 780,
    damage: 1,
  },
});
```

Write `src/game/content/enemies.ts`:

```ts
import type { EnemyState } from "../simulation/types";

export const createEnemies = (): EnemyState[] => [
  {
    id: "enemy-ranged-anchor",
    kind: "ranged",
    head: "crt",
    position: { x: 1010, y: 210 },
    velocity: { x: 0, y: 0 },
    radius: 18,
    facing: Math.PI,
    health: 1,
    alive: true,
    weaponId: "service-pistol",
    attackCooldownMs: 350,
  },
  {
    id: "enemy-ranged-control",
    kind: "ranged",
    head: "human",
    position: { x: 380, y: 180 },
    velocity: { x: 0, y: 0 },
    radius: 18,
    facing: 0,
    health: 1,
    alive: true,
    weaponId: "service-pistol",
    attackCooldownMs: 550,
  },
  {
    id: "enemy-ranged-green",
    kind: "ranged",
    head: "crt",
    position: { x: 1140, y: 560 },
    velocity: { x: 0, y: 0 },
    radius: 18,
    facing: Math.PI,
    health: 1,
    alive: true,
    weaponId: "service-pistol",
    attackCooldownMs: 650,
  },
  {
    id: "enemy-rush-left",
    kind: "rush",
    head: "human",
    position: { x: 260, y: 540 },
    velocity: { x: 0, y: 0 },
    radius: 17,
    facing: 0,
    health: 1,
    alive: true,
    attackCooldownMs: 0,
  },
  {
    id: "enemy-rush-desk",
    kind: "rush",
    head: "crt",
    position: { x: 690, y: 210 },
    velocity: { x: 0, y: 0 },
    radius: 17,
    facing: Math.PI / 2,
    health: 1,
    alive: true,
    attackCooldownMs: 0,
  },
  {
    id: "enemy-rush-floor",
    kind: "rush",
    head: "human",
    position: { x: 820, y: 585 },
    velocity: { x: 0, y: 0 },
    radius: 17,
    facing: -Math.PI / 2,
    health: 1,
    alive: true,
    attackCooldownMs: 0,
  },
];
```

Write `src/game/content/arena.ts`:

```ts
import type { ArenaState } from "../simulation/types";

export const createArena = (): ArenaState => ({
  width: 1366,
  height: 768,
  obstacles: [
    { id: "top-news-desk", x: 420, y: 126, width: 350, height: 74, blocksMovement: true, blocksBullets: true },
    { id: "lower-news-desk", x: 318, y: 520, width: 360, height: 74, blocksMovement: true, blocksBullets: true },
    { id: "server-bank", x: 1050, y: 250, width: 92, height: 180, blocksMovement: true, blocksBullets: true },
    { id: "control-console", x: 130, y: 624, width: 260, height: 72, blocksMovement: true, blocksBullets: true },
    { id: "camera-tripod-left", x: 226, y: 340, width: 54, height: 54, blocksMovement: true, blocksBullets: false },
    { id: "camera-tripod-right", x: 948, y: 470, width: 56, height: 56, blocksMovement: true, blocksBullets: false },
  ],
  decor: [
    { id: "crt-wall-top", kind: "crt-wall", position: { x: 600, y: 72 }, rotation: 0 },
    { id: "green-screen-right", kind: "green-screen", position: { x: 1245, y: 385 }, rotation: 0 },
    { id: "floor-cable-left", kind: "cable", position: { x: 235, y: 430 }, rotation: 0.2 },
    { id: "floor-cable-right", kind: "cable", position: { x: 925, y: 310 }, rotation: -0.35 },
    { id: "studio-light-left", kind: "studio-light", position: { x: 190, y: 280 }, rotation: 0.75 },
    { id: "studio-light-right", kind: "studio-light", position: { x: 1160, y: 220 }, rotation: -0.75 },
    { id: "camera-floor-left", kind: "camera", position: { x: 252, y: 365 }, rotation: 0.5 },
    { id: "camera-floor-right", kind: "camera", position: { x: 976, y: 498 }, rotation: -1.2 },
    { id: "server-rack-main", kind: "server-rack", position: { x: 1096, y: 340 }, rotation: 0 },
    { id: "control-panel-bottom", kind: "control-panel", position: { x: 260, y: 660 }, rotation: 0 },
  ],
});
```

- [ ] **Step 6: Create state factory**

Write `src/game/simulation/state.ts`:

```ts
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
  elapsedMs: 0,
  nextId: 1,
});
```

- [ ] **Step 7: Run state test**

Run: `npm run test -- src/game/simulation/state.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit simulation state**

Run:

```bash
git add src/game
git commit -m "feat: add shooter simulation state"
```

Expected: commit succeeds.

## Task 3: Implement Weapon, Enemy, Combat, And Restart Rules With Tests

**Files:**

- Create: `src/game/input/actions.ts`
- Create: `src/game/simulation/systems/weapons.ts`
- Create: `src/game/simulation/systems/enemies.ts`
- Create: `src/game/simulation/systems/combat.ts`
- Create: `src/game/simulation/update.ts`
- Test: `src/game/simulation/update.test.ts`

- [ ] **Step 1: Write failing gameplay tests**

Write `src/game/simulation/update.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { updateGame } from "./update";
import type { PlayerInput } from "../input/actions";

const neutralInput: PlayerInput = {
  move: { x: 0, y: 0 },
  aimWorld: { x: 800, y: 390 },
  firing: false,
  restart: false,
  kick: false,
};

describe("updateGame", () => {
  it("moves the suited TV-head player with normalized WASD input", () => {
    const state = createInitialGameState();
    const next = updateGame(state, { ...neutralInput, move: { x: 1, y: 1 } }, 100);

    expect(next.player.position.x).toBeGreaterThan(state.player.position.x);
    expect(next.player.position.y).toBeGreaterThan(state.player.position.y);
    expect(Math.hypot(next.player.velocity.x, next.player.velocity.y)).toBeLessThanOrEqual(270);
  });

  it("fires one bullet from the single equipped weapon and consumes one round", () => {
    const state = createInitialGameState();
    const next = updateGame(state, { ...neutralInput, firing: true }, 16);

    expect(next.bullets).toHaveLength(1);
    expect(next.weapons["service-pistol"].loadedRounds).toBe(5);
    expect(next.fx.some((fx) => fx.kind === "muzzle")).toBe(true);
  });

  it("marks victory and awards score after the last enemy dies", () => {
    const state = createInitialGameState();
    state.enemies.forEach((enemy, index) => {
      enemy.alive = index === 0;
      enemy.health = index === 0 ? 1 : 0;
    });
    state.bullets.push({
      id: "test-bullet",
      ownerId: "player",
      position: { ...state.enemies[0].position },
      velocity: { x: 0, y: 0 },
      damage: 1,
      ttlMs: 100,
    });

    const next = updateGame(state, neutralInput, 16);

    expect(next.enemies.every((enemy) => !enemy.alive)).toBe(true);
    expect(next.status).toBe("victory");
    expect(next.score).toBeGreaterThanOrEqual(1000);
  });

  it("resets after death when restart is pressed", () => {
    const state = createInitialGameState();
    state.status = "dead";
    state.player.alive = false;
    state.score = 9000;

    const next = updateGame(state, { ...neutralInput, restart: true }, 16);

    expect(next.status).toBe("playing");
    expect(next.player.alive).toBe(true);
    expect(next.score).toBe(0);
  });
});
```

- [ ] **Step 2: Run tests to verify failure**

Run: `npm run test -- src/game/simulation/update.test.ts`

Expected: FAIL because `./update` and `../input/actions` do not exist.

- [ ] **Step 3: Create input action contract**

Write `src/game/input/actions.ts`:

```ts
import type { Vec2 } from "../simulation/types";

export type PlayerInput = {
  move: Vec2;
  aimWorld: Vec2;
  firing: boolean;
  restart: boolean;
  kick: boolean;
};
```

- [ ] **Step 4: Implement weapons**

Write `src/game/simulation/systems/weapons.ts`:

```ts
import { fromAngle, vec } from "../geometry";
import type { BulletState, FxState, GameState, Vec2, WeaponState } from "../types";

const nextEntityId = (state: GameState, prefix: string): string => {
  const id = `${prefix}-${state.nextId}`;
  state.nextId += 1;
  return id;
};

export const tickWeapon = (weapon: WeaponState, deltaMs: number): WeaponState => {
  const cooldownRemainingMs = Math.max(0, weapon.cooldownRemainingMs - deltaMs);
  const reloadRemainingMs = Math.max(0, weapon.reloadRemainingMs - deltaMs);
  const reloaded =
    weapon.reloadRemainingMs > 0 &&
    reloadRemainingMs === 0 &&
    weapon.loadedRounds === 0 &&
    weapon.reserveRounds > 0;

  if (!reloaded) {
    return { ...weapon, cooldownRemainingMs, reloadRemainingMs };
  }

  const roundsToLoad = Math.min(weapon.magazineSize, weapon.reserveRounds);
  return {
    ...weapon,
    loadedRounds: roundsToLoad,
    reserveRounds: weapon.reserveRounds - roundsToLoad,
    cooldownRemainingMs,
    reloadRemainingMs,
  };
};

export const tryFireWeapon = (
  state: GameState,
  ownerId: string,
  origin: Vec2,
  facing: number,
  weaponId: string,
): GameState => {
  const weapon = state.weapons[weaponId];
  if (!weapon || weapon.cooldownRemainingMs > 0 || weapon.reloadRemainingMs > 0) {
    return state;
  }

  if (weapon.loadedRounds <= 0) {
    state.weapons[weaponId] = {
      ...weapon,
      reloadRemainingMs: weapon.reserveRounds > 0 ? weapon.reloadDelayMs : 0,
    };
    return state;
  }

  const direction = fromAngle(facing);
  const bullet: BulletState = {
    id: nextEntityId(state, "bullet"),
    ownerId,
    position: vec(origin.x + direction.x * 26, origin.y + direction.y * 26),
    velocity: vec(direction.x * weapon.bulletSpeed, direction.y * weapon.bulletSpeed),
    damage: weapon.damage,
    ttlMs: 820,
  };
  const muzzle: FxState = {
    id: nextEntityId(state, "fx"),
    kind: "muzzle",
    position: { ...bullet.position },
    rotation: facing,
    ttlMs: 70,
  };
  const casing: FxState = {
    id: nextEntityId(state, "fx"),
    kind: "casing",
    position: vec(origin.x - direction.y * 10, origin.y + direction.x * 10),
    rotation: facing + Math.PI / 2,
    ttlMs: 1100,
  };

  state.bullets.push(bullet);
  state.fx.push(muzzle, casing);
  state.weapons[weaponId] = {
    ...weapon,
    loadedRounds: weapon.loadedRounds - 1,
    cooldownRemainingMs: weapon.fireCooldownMs,
    reloadRemainingMs: weapon.loadedRounds - 1 === 0 && weapon.reserveRounds > 0 ? weapon.reloadDelayMs : 0,
  };
  return state;
};
```

- [ ] **Step 5: Implement enemy behavior**

Write `src/game/simulation/systems/enemies.ts`:

```ts
import { angleTo, distance, hasLineOfSight, normalize, scale, vec } from "../geometry";
import type { EnemyState, GameState } from "../types";
import { tryFireWeapon } from "./weapons";

const RUSH_SPEED = 215;
const RANGED_SPEED = 115;
const RANGED_PREFERRED_DISTANCE = 330;

export const updateEnemies = (state: GameState, deltaMs: number): GameState => {
  const dt = deltaMs / 1000;
  const blockers = state.arena.obstacles.filter((obstacle) => obstacle.blocksBullets);

  for (const enemy of state.enemies) {
    if (!enemy.alive) {
      enemy.velocity = vec(0, 0);
      continue;
    }

    const toPlayer = {
      x: state.player.position.x - enemy.position.x,
      y: state.player.position.y - enemy.position.y,
    };
    const playerDistance = distance(enemy.position, state.player.position);
    const canSeePlayer = hasLineOfSight(enemy.position, state.player.position, blockers);
    enemy.facing = angleTo(enemy.position, state.player.position);
    enemy.attackCooldownMs = Math.max(0, enemy.attackCooldownMs - deltaMs);

    if (enemy.kind === "rush") {
      enemy.velocity = scale(normalize(toPlayer), RUSH_SPEED);
      enemy.position = {
        x: enemy.position.x + enemy.velocity.x * dt,
        y: enemy.position.y + enemy.velocity.y * dt,
      };
      if (playerDistance < enemy.radius + state.player.radius + 6 && state.player.invulnerableMs === 0) {
        state.player.health -= 1;
        state.player.invulnerableMs = 360;
        state.fx.push({
          id: `fx-${state.nextId++}`,
          kind: "blood",
          position: { ...state.player.position },
          rotation: enemy.facing,
          ttlMs: 1600,
        });
      }
      continue;
    }

    if (enemy.kind === "ranged") {
      const direction = normalize(toPlayer);
      const shouldBackUp = playerDistance < RANGED_PREFERRED_DISTANCE * 0.65;
      const shouldApproach = playerDistance > RANGED_PREFERRED_DISTANCE;
      enemy.velocity = shouldBackUp
        ? scale(direction, -RANGED_SPEED)
        : shouldApproach
          ? scale(direction, RANGED_SPEED)
          : vec(0, 0);
      enemy.position = {
        x: enemy.position.x + enemy.velocity.x * dt,
        y: enemy.position.y + enemy.velocity.y * dt,
      };

      if (canSeePlayer && enemy.weaponId && enemy.attackCooldownMs === 0) {
        tryFireWeapon(state, enemy.id, enemy.position, enemy.facing, enemy.weaponId);
        enemy.attackCooldownMs = 780;
      }
    }
  }

  return state;
};
```

- [ ] **Step 6: Implement combat and update loop**

Write `src/game/simulation/systems/combat.ts`:

```ts
import { circleIntersectsRect, distance } from "../geometry";
import type { GameState } from "../types";

export const updateBulletsAndHits = (state: GameState, deltaMs: number): GameState => {
  const dt = deltaMs / 1000;
  const remainingBullets = [];

  for (const bullet of state.bullets) {
    bullet.position.x += bullet.velocity.x * dt;
    bullet.position.y += bullet.velocity.y * dt;
    bullet.ttlMs -= deltaMs;

    const hitObstacle = state.arena.obstacles.some(
      (obstacle) => obstacle.blocksBullets && circleIntersectsRect(bullet.position, 3, obstacle),
    );
    if (hitObstacle) {
      state.fx.push({
        id: `fx-${state.nextId++}`,
        kind: "impact",
        position: { ...bullet.position },
        rotation: Math.atan2(bullet.velocity.y, bullet.velocity.x),
        ttlMs: 240,
      });
      continue;
    }

    if (bullet.ownerId === "player") {
      const target = state.enemies.find(
        (enemy) => enemy.alive && distance(enemy.position, bullet.position) <= enemy.radius + 4,
      );
      if (target) {
        target.health -= bullet.damage;
        state.fx.push({
          id: `fx-${state.nextId++}`,
          kind: "blood",
          position: { ...target.position },
          rotation: Math.atan2(bullet.velocity.y, bullet.velocity.x),
          ttlMs: 1800,
        });
        if (target.health <= 0) {
          target.alive = false;
          target.velocity = { x: 0, y: 0 };
          state.score += target.kind === "ranged" ? 1200 : 900;
        }
        continue;
      }
    } else if (state.player.alive && state.player.invulnerableMs === 0) {
      if (distance(state.player.position, bullet.position) <= state.player.radius + 4) {
        state.player.health -= bullet.damage;
        state.player.invulnerableMs = 420;
        state.fx.push({
          id: `fx-${state.nextId++}`,
          kind: "blood",
          position: { ...state.player.position },
          rotation: Math.atan2(bullet.velocity.y, bullet.velocity.x),
          ttlMs: 1800,
        });
        continue;
      }
    }

    if (bullet.ttlMs > 0) {
      remainingBullets.push(bullet);
    }
  }

  state.bullets = remainingBullets;
  return state;
};

export const updateStatus = (state: GameState): GameState => {
  if (state.player.health <= 0) {
    state.player.alive = false;
    state.status = "dead";
  } else if (state.enemies.every((enemy) => !enemy.alive)) {
    state.status = "victory";
  }
  return state;
};
```

Write `src/game/simulation/update.ts`:

```ts
import type { PlayerInput } from "../input/actions";
import { angleTo, clampToArena, normalize, scale } from "./geometry";
import { createInitialGameState } from "./state";
import type { GameState } from "./types";
import { updateBulletsAndHits, updateStatus } from "./systems/combat";
import { updateEnemies } from "./systems/enemies";
import { tickWeapon, tryFireWeapon } from "./systems/weapons";

const PLAYER_SPEED = 270;

const cloneGameState = (state: GameState): GameState => structuredClone(state) as GameState;

export const updateGame = (current: GameState, input: PlayerInput, deltaMs: number): GameState => {
  if (input.restart && current.status !== "playing") {
    return createInitialGameState();
  }

  const state = cloneGameState(current);
  state.elapsedMs += deltaMs;
  state.fx = state.fx
    .map((fx) => ({ ...fx, ttlMs: fx.ttlMs - deltaMs }))
    .filter((fx) => fx.ttlMs > 0);

  for (const [weaponId, weapon] of Object.entries(state.weapons)) {
    state.weapons[weaponId] = tickWeapon(weapon, deltaMs);
  }

  if (state.status !== "playing") {
    return state;
  }

  state.player.invulnerableMs = Math.max(0, state.player.invulnerableMs - deltaMs);
  state.player.facing = angleTo(state.player.position, input.aimWorld);

  const moveDirection = normalize(input.move);
  state.player.velocity = scale(moveDirection, PLAYER_SPEED);
  state.player.position = clampToArena(
    {
      x: state.player.position.x + state.player.velocity.x * (deltaMs / 1000),
      y: state.player.position.y + state.player.velocity.y * (deltaMs / 1000),
    },
    state.player.radius,
    state.arena.width,
    state.arena.height,
  );

  if (input.firing) {
    tryFireWeapon(state, "player", state.player.position, state.player.facing, state.player.weaponId);
  }

  updateEnemies(state, deltaMs);
  updateBulletsAndHits(state, deltaMs);
  updateStatus(state);

  return state;
};
```

- [ ] **Step 7: Run gameplay tests**

Run: `npm run test -- src/game/simulation/update.test.ts`

Expected: PASS.

- [ ] **Step 8: Run full test suite and build**

Run: `npm run test`

Expected: all tests PASS.

Run: `npm run build`

Expected: TypeScript and Vite build complete with no errors.

- [ ] **Step 9: Commit simulation systems**

Run:

```bash
git add src/game
git commit -m "feat: implement shooter simulation rules"
```

Expected: commit succeeds.

## Task 4: Add Phaser Scene, Input Bindings, And Render Bridge

**Files:**

- Modify: `src/main.ts`
- Create: `src/game/input/bindings.ts`
- Create: `src/phaser/adapters/sceneBridge.ts`
- Create: `src/phaser/scenes/GameScene.ts`

- [ ] **Step 1: Create input bindings**

Write `src/game/input/bindings.ts`:

```ts
import Phaser from "phaser";
import type { PlayerInput } from "./actions";
import type { Vec2 } from "../simulation/types";

export type InputBindingState = {
  keys: Record<"w" | "a" | "s" | "d" | "r", Phaser.Input.Keyboard.Key>;
};

export const createInputBindings = (scene: Phaser.Scene): InputBindingState => {
  if (!scene.input.keyboard) {
    throw new Error("Keyboard input is unavailable");
  }
  return {
    keys: {
      w: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      r: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
    },
  };
};

export const readPlayerInput = (
  scene: Phaser.Scene,
  bindings: InputBindingState,
  cameraOffset: Vec2,
): PlayerInput => {
  const pointer = scene.input.activePointer;
  const aimWorld = {
    x: pointer.worldX || pointer.x + cameraOffset.x,
    y: pointer.worldY || pointer.y + cameraOffset.y,
  };

  return {
    move: {
      x: Number(bindings.keys.d.isDown) - Number(bindings.keys.a.isDown),
      y: Number(bindings.keys.s.isDown) - Number(bindings.keys.w.isDown),
    },
    aimWorld,
    firing: pointer.isDown,
    restart: Phaser.Input.Keyboard.JustDown(bindings.keys.r),
    kick: false,
  };
};
```

- [ ] **Step 2: Create bridge**

Write `src/phaser/adapters/sceneBridge.ts`:

```ts
import { createInitialGameState } from "../../game/simulation/state";
import { updateGame } from "../../game/simulation/update";
import type { GameState } from "../../game/simulation/types";
import type { PlayerInput } from "../../game/input/actions";

export type SceneBridge = {
  getState: () => GameState;
  reset: () => GameState;
  step: (input: PlayerInput, deltaMs: number) => GameState;
};

export const createSceneBridge = (): SceneBridge => {
  let state = createInitialGameState();

  return {
    getState: () => state,
    reset: () => {
      state = createInitialGameState();
      return state;
    },
    step: (input, deltaMs) => {
      state = updateGame(state, input, deltaMs);
      return state;
    },
  };
};
```

- [ ] **Step 3: Create GameScene with temporary render**

Write `src/phaser/scenes/GameScene.ts`:

```ts
import Phaser from "phaser";
import { createInputBindings, readPlayerInput, type InputBindingState } from "../../game/input/bindings";
import { createSceneBridge, type SceneBridge } from "../adapters/sceneBridge";

export class GameScene extends Phaser.Scene {
  private bridge!: SceneBridge;
  private bindings!: InputBindingState;
  private player!: Phaser.GameObjects.Arc;
  private enemies = new Map<string, Phaser.GameObjects.Arc>();

  constructor() {
    super("game");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#07101a");
    this.bridge = createSceneBridge();
    this.bindings = createInputBindings(this);

    const state = this.bridge.getState();
    this.player = this.add.circle(state.player.position.x, state.player.position.y, 18, 0xd7f6cf);
    for (const enemy of state.enemies) {
      this.enemies.set(enemy.id, this.add.circle(enemy.position.x, enemy.position.y, 18, enemy.kind === "ranged" ? 0x75e9ff : 0xff4c77));
    }
  }

  update(_time: number, delta: number): void {
    const input = readPlayerInput(this, this.bindings, { x: 0, y: 0 });
    const state = this.bridge.step(input, Math.min(delta, 50));

    this.player.setPosition(state.player.position.x, state.player.position.y);
    this.player.setRotation(state.player.facing);

    for (const enemy of state.enemies) {
      const sprite = this.enemies.get(enemy.id);
      if (!sprite) {
        continue;
      }
      sprite.setPosition(enemy.position.x, enemy.position.y);
      sprite.setVisible(enemy.alive);
    }
  }
}
```

- [ ] **Step 4: Replace placeholder bootstrap**

Modify `src/main.ts` to:

```ts
import Phaser from "phaser";
import { GameScene } from "./phaser/scenes/GameScene";
import "./styles.css";

const gameRoot = document.querySelector<HTMLDivElement>("#game-root");

if (!gameRoot) {
  throw new Error("Missing #game-root");
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: gameRoot,
  width: 1366,
  height: 768,
  backgroundColor: "#05070b",
  pixelArt: true,
  roundPixels: true,
  scene: [GameScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
```

- [ ] **Step 5: Verify build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 6: Commit Phaser bridge**

Run:

```bash
git add src/main.ts src/game/input src/phaser
git commit -m "feat: connect Phaser scene to simulation"
```

Expected: commit succeeds.

## Task 5: Draw The TV-Studio Arena And Strict Top-Down Actors

**Files:**

- Create: `src/phaser/view/drawArena.ts`
- Create: `src/phaser/view/drawActors.ts`
- Modify: `src/phaser/scenes/GameScene.ts`

- [ ] **Step 1: Create arena renderer**

Write `src/phaser/view/drawArena.ts`:

```ts
import Phaser from "phaser";
import type { ArenaState, DecorItem, Rect } from "../../game/simulation/types";

const drawRect = (graphics: Phaser.GameObjects.Graphics, rect: Rect, fill: number, stroke = 0xe4c6a4): void => {
  graphics.fillStyle(fill, 1);
  graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
  graphics.lineStyle(3, stroke, 1);
  graphics.strokeRect(rect.x, rect.y, rect.width, rect.height);
};

const drawDecor = (graphics: Phaser.GameObjects.Graphics, item: DecorItem): void => {
  graphics.save();
  graphics.translateCanvas(item.position.x, item.position.y);
  graphics.rotateCanvas(item.rotation);

  if (item.kind === "green-screen") {
    graphics.fillStyle(0x10f068, 1);
    graphics.fillRect(-48, -110, 96, 220);
    graphics.lineStyle(4, 0x061509, 1);
    graphics.strokeRect(-48, -110, 96, 220);
  } else if (item.kind === "crt-wall") {
    for (let index = 0; index < 5; index += 1) {
      graphics.fillStyle(0x141923, 1);
      graphics.fillRect(-180 + index * 74, -24, 62, 42);
      graphics.lineStyle(3, 0x78808f, 1);
      graphics.strokeRect(-180 + index * 74, -24, 62, 42);
      graphics.fillStyle(0xcfd6d7, 0.65);
      graphics.fillRect(-172 + index * 74, -16, 46, 26);
    }
  } else if (item.kind === "cable") {
    graphics.lineStyle(8, 0x121212, 1);
    graphics.beginPath();
    graphics.moveTo(-80, 0);
    graphics.lineTo(-25, -26);
    graphics.lineTo(34, 28);
    graphics.lineTo(88, -8);
    graphics.strokePath();
    graphics.lineStyle(3, 0x27d771, 1);
    graphics.strokePath();
  } else if (item.kind === "studio-light") {
    graphics.fillStyle(0x23262d, 1);
    graphics.fillRect(-18, -18, 36, 36);
    graphics.fillStyle(0xfff0a8, 1);
    graphics.fillRect(-11, -9, 22, 18);
    graphics.lineStyle(2, 0x101010, 1);
    graphics.strokeRect(-18, -18, 36, 36);
  } else if (item.kind === "camera") {
    graphics.fillStyle(0x2c3237, 1);
    graphics.fillRect(-26, -16, 52, 32);
    graphics.fillStyle(0x59646d, 1);
    graphics.fillRect(16, -10, 26, 20);
    graphics.lineStyle(3, 0x111111, 1);
    graphics.strokeRect(-26, -16, 52, 32);
  } else if (item.kind === "server-rack") {
    graphics.fillStyle(0x11171d, 1);
    graphics.fillRect(-38, -88, 76, 176);
    for (let index = 0; index < 8; index += 1) {
      graphics.fillStyle(index % 2 === 0 ? 0x29e38a : 0x55d8ff, 1);
      graphics.fillRect(-24, -72 + index * 18, 48, 6);
    }
  } else if (item.kind === "control-panel") {
    graphics.fillStyle(0x191817, 1);
    graphics.fillRect(-120, -28, 240, 56);
    for (let index = 0; index < 14; index += 1) {
      graphics.fillStyle(index % 3 === 0 ? 0x40f29a : 0xffe28a, 1);
      graphics.fillRect(-105 + index * 15, -12, 8, 7);
    }
  }

  graphics.restore();
};

export const drawArena = (scene: Phaser.Scene, arena: ArenaState): Phaser.GameObjects.Container => {
  const container = scene.add.container(0, 0);
  const graphics = scene.add.graphics();
  container.add(graphics);

  graphics.fillStyle(0x09111b, 1);
  graphics.fillRect(0, 0, arena.width, arena.height);

  graphics.fillStyle(0x172d4c, 1);
  graphics.fillRect(250, 72, 860, 220);
  graphics.fillStyle(0x202330, 1);
  graphics.fillRect(90, 292, 1140, 380);
  graphics.fillStyle(0x24435d, 1);
  for (let x = 90; x < 1230; x += 48) {
    for (let y = 292; y < 672; y += 48) {
      graphics.fillStyle((x + y) % 96 === 0 ? 0x2a5775 : 0x1b3448, 1);
      graphics.fillRect(x, y, 46, 46);
    }
  }
  graphics.fillStyle(0x8f6d77, 0.95);
  graphics.fillRect(486, 292, 150, 380);

  for (const obstacle of arena.obstacles) {
    const fill = obstacle.id.includes("desk") ? 0xb7794f : 0x232831;
    drawRect(graphics, obstacle, fill);
  }

  for (const item of arena.decor) {
    drawDecor(graphics, item);
  }

  graphics.lineStyle(8, 0xd4c1ac, 1);
  graphics.strokeRect(82, 64, 1180, 640);
  graphics.lineStyle(5, 0xa0183e, 1);
  graphics.strokeRect(68, 50, 1208, 668);

  return container;
};
```

- [ ] **Step 2: Create actor renderer**

Write `src/phaser/view/drawActors.ts`:

```ts
import Phaser from "phaser";
import type { EnemyState, PlayerState } from "../../game/simulation/types";

const drawCrtHead = (graphics: Phaser.GameObjects.Graphics, x: number, y: number, size: number, tint: number): void => {
  graphics.fillStyle(0x20262b, 1);
  graphics.fillRect(x - size / 2, y - size / 2, size, size * 0.78);
  graphics.lineStyle(3, 0x050505, 1);
  graphics.strokeRect(x - size / 2, y - size / 2, size, size * 0.78);
  graphics.fillStyle(tint, 1);
  graphics.fillRect(x - size * 0.34, y - size * 0.3, size * 0.68, size * 0.42);
  graphics.lineStyle(2, 0xd5d7d8, 1);
  graphics.lineBetween(x - size * 0.16, y - size / 2, x - size * 0.28, y - size * 0.72);
  graphics.lineBetween(x + size * 0.16, y - size / 2, x + size * 0.28, y - size * 0.72);
};

const drawHumanHead = (graphics: Phaser.GameObjects.Graphics, x: number, y: number): void => {
  graphics.fillStyle(0xf0c6a0, 1);
  graphics.fillCircle(x, y, 8);
  graphics.lineStyle(2, 0x1a1010, 1);
  graphics.strokeCircle(x, y, 8);
};

export const drawPlayerTexture = (scene: Phaser.Scene): string => {
  const key = "actor-player-tv-suit";
  if (scene.textures.exists(key)) {
    return key;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.fillStyle(0xf4f0dc, 1);
  graphics.fillRect(18, 30, 28, 42);
  graphics.fillStyle(0x172331, 1);
  graphics.fillRect(12, 32, 40, 46);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillTriangle(25, 34, 39, 34, 32, 52);
  drawCrtHead(graphics, 32, 22, 30, 0xbdf7ec);
  graphics.fillStyle(0x1e1e21, 1);
  graphics.fillRect(46, 48, 34, 8);
  graphics.lineStyle(3, 0x050505, 1);
  graphics.strokeRect(46, 48, 34, 8);
  graphics.generateTexture(key, 96, 96);
  graphics.destroy();
  return key;
};

export const drawEnemyTexture = (scene: Phaser.Scene, enemy: Pick<EnemyState, "kind" | "head">): string => {
  const key = `actor-enemy-${enemy.kind}-${enemy.head}`;
  if (scene.textures.exists(key)) {
    return key;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  const body = enemy.kind === "ranged" ? 0x2e5541 : 0x673044;
  graphics.fillStyle(body, 1);
  graphics.fillRect(15, 30, 34, 44);
  graphics.lineStyle(3, 0x080808, 1);
  graphics.strokeRect(15, 30, 34, 44);
  if (enemy.head === "crt") {
    drawCrtHead(graphics, 32, 22, 28, enemy.kind === "ranged" ? 0x9af5ff : 0xff7cb0);
  } else {
    drawHumanHead(graphics, 32, 21);
  }
  if (enemy.kind === "ranged") {
    graphics.fillStyle(0x191919, 1);
    graphics.fillRect(47, 45, 28, 7);
  } else {
    graphics.fillStyle(0xbfc6c8, 1);
    graphics.fillRect(46, 42, 18, 5);
    graphics.fillRect(60, 39, 4, 12);
  }
  graphics.generateTexture(key, 88, 88);
  graphics.destroy();
  return key;
};

export const createActorSprite = (
  scene: Phaser.Scene,
  textureKey: string,
  x: number,
  y: number,
): Phaser.GameObjects.Image => scene.add.image(x, y, textureKey).setOrigin(0.5).setScale(1);

export const syncPlayerSprite = (sprite: Phaser.GameObjects.Image, player: PlayerState): void => {
  sprite.setPosition(player.position.x, player.position.y);
  sprite.setRotation(player.facing);
  sprite.setAlpha(player.alive ? 1 : 0.45);
};

export const syncEnemySprite = (sprite: Phaser.GameObjects.Image, enemy: EnemyState): void => {
  sprite.setPosition(enemy.position.x, enemy.position.y);
  sprite.setRotation(enemy.facing);
  sprite.setVisible(enemy.alive);
};
```

- [ ] **Step 3: Replace temporary scene render with arena and actor textures**

Modify `src/phaser/scenes/GameScene.ts` so `create()` uses `drawArena`, `drawPlayerTexture`, `drawEnemyTexture`, and `createActorSprite`, and `update()` uses `syncPlayerSprite`/`syncEnemySprite`.

The imports should be:

```ts
import { drawArena } from "../view/drawArena";
import {
  createActorSprite,
  drawEnemyTexture,
  drawPlayerTexture,
  syncEnemySprite,
  syncPlayerSprite,
} from "../view/drawActors";
```

The actor fields should become:

```ts
private player!: Phaser.GameObjects.Image;
private enemies = new Map<string, Phaser.GameObjects.Image>();
```

The render creation block should be:

```ts
const state = this.bridge.getState();
drawArena(this, state.arena);

const playerTexture = drawPlayerTexture(this);
this.player = createActorSprite(this, playerTexture, state.player.position.x, state.player.position.y);

for (const enemy of state.enemies) {
  const texture = drawEnemyTexture(this, enemy);
  this.enemies.set(enemy.id, createActorSprite(this, texture, enemy.position.x, enemy.position.y));
}
```

The actor sync block should be:

```ts
syncPlayerSprite(this.player, state.player);

for (const enemy of state.enemies) {
  const sprite = this.enemies.get(enemy.id);
  if (sprite) {
    syncEnemySprite(sprite, enemy);
  }
}
```

- [ ] **Step 4: Verify build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 5: Commit visual arena and actors**

Run:

```bash
git add src/phaser
git commit -m "feat: draw top-down TV studio arena"
```

Expected: commit succeeds.

## Task 6: Add Bullet/Fx Rendering, Camera Feedback, And DOM HUD

**Files:**

- Create: `src/phaser/view/drawFx.ts`
- Create: `src/phaser/view/camera.ts`
- Create: `src/ui/hud/createHud.ts`
- Modify: `src/phaser/scenes/GameScene.ts`
- Modify: `src/main.ts`
- Modify: `src/styles.css`

- [ ] **Step 1: Create HUD module**

Write `src/ui/hud/createHud.ts`:

```ts
import type { GameState } from "../../game/simulation/types";

export type HudController = {
  update: (state: GameState) => void;
};

export const createHud = (root: HTMLElement): HudController => {
  root.innerHTML = `
    <div class="hud-score" data-hud-score>0pts</div>
    <div class="hud-bottom">
      <div class="hud-chip" data-hud-enemies>0/6 enemies</div>
      <div class="hud-chip" data-hud-ammo>0/0 rnds</div>
    </div>
    <div class="hud-center" data-hud-center hidden></div>
  `;

  const score = root.querySelector<HTMLElement>("[data-hud-score]");
  const enemies = root.querySelector<HTMLElement>("[data-hud-enemies]");
  const ammo = root.querySelector<HTMLElement>("[data-hud-ammo]");
  const center = root.querySelector<HTMLElement>("[data-hud-center]");

  if (!score || !enemies || !ammo || !center) {
    throw new Error("HUD elements failed to initialize");
  }

  return {
    update: (state) => {
      const aliveEnemies = state.enemies.filter((enemy) => enemy.alive).length;
      const weapon = state.weapons[state.player.weaponId];
      score.textContent = `${state.score}pts`;
      enemies.textContent = `${state.enemies.length - aliveEnemies}/${state.enemies.length} enemies`;
      ammo.textContent = weapon.reloadRemainingMs > 0 ? "reload" : `${weapon.loadedRounds}/${weapon.reserveRounds} rnds`;

      if (state.status === "dead") {
        center.hidden = false;
        center.textContent = "DEAD - PRESS R";
      } else if (state.status === "victory") {
        center.hidden = false;
        center.textContent = "CLEAR - PRESS R";
      } else {
        center.hidden = true;
        center.textContent = "";
      }
    },
  };
};
```

- [ ] **Step 2: Extend CSS for HUD**

Append to `src/styles.css`:

```css
.hud-score {
  position: absolute;
  top: clamp(12px, 3vw, 32px);
  right: clamp(14px, 4vw, 70px);
  min-width: 220px;
  padding: 10px 18px;
  color: #ffd0f2;
  background: #030303;
  border: 3px solid #101010;
  text-align: center;
  font-size: clamp(24px, 3.6vw, 48px);
  font-weight: 900;
  text-shadow: 3px 3px 0 #743d67;
  line-height: 1;
}

.hud-bottom {
  position: absolute;
  left: clamp(14px, 6vw, 120px);
  bottom: clamp(16px, 4vw, 52px);
  display: flex;
  gap: 12px;
  align-items: center;
}

.hud-chip {
  padding: 8px 14px;
  color: #ffd0f2;
  background: #030303;
  border: 3px solid #101010;
  font-size: clamp(18px, 2.4vw, 34px);
  font-weight: 900;
  text-shadow: 2px 2px 0 #743d67;
  white-space: nowrap;
}

.hud-center {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  padding: 18px 28px;
  color: #ffd0f2;
  background: #030303;
  border: 4px solid #f0c1e5;
  font-size: clamp(24px, 4vw, 54px);
  font-weight: 900;
  text-shadow: 3px 3px 0 #743d67;
  white-space: nowrap;
}
```

- [ ] **Step 3: Create FX renderer**

Write `src/phaser/view/drawFx.ts`:

```ts
import Phaser from "phaser";
import type { BulletState, FxState } from "../../game/simulation/types";

export const drawBulletsAndFx = (
  graphics: Phaser.GameObjects.Graphics,
  bullets: BulletState[],
  fx: FxState[],
): void => {
  graphics.clear();

  for (const bullet of bullets) {
    graphics.fillStyle(bullet.ownerId === "player" ? 0xfff0a6 : 0xff516e, 1);
    graphics.fillCircle(bullet.position.x, bullet.position.y, 4);
  }

  for (const item of fx) {
    if (item.kind === "muzzle") {
      graphics.fillStyle(0xfff2a0, item.ttlMs / 70);
      graphics.fillCircle(item.position.x, item.position.y, 12);
    } else if (item.kind === "blood") {
      graphics.fillStyle(0xb50817, Math.min(1, item.ttlMs / 500));
      graphics.fillCircle(item.position.x, item.position.y, 18);
      graphics.fillCircle(item.position.x + 16, item.position.y - 8, 6);
      graphics.fillCircle(item.position.x - 12, item.position.y + 10, 7);
    } else if (item.kind === "casing") {
      graphics.fillStyle(0xd2ad62, Math.min(1, item.ttlMs / 300));
      graphics.fillRect(item.position.x - 3, item.position.y - 2, 9, 4);
    } else if (item.kind === "impact") {
      graphics.lineStyle(2, 0xffe2a4, Math.min(1, item.ttlMs / 120));
      graphics.strokeCircle(item.position.x, item.position.y, 10);
    }
  }
};
```

- [ ] **Step 4: Create camera feedback helper**

Write `src/phaser/view/camera.ts`:

```ts
import Phaser from "phaser";
import type { GameState } from "../../game/simulation/types";

export const updateCameraFeedback = (
  camera: Phaser.Cameras.Scene2D.Camera,
  state: GameState,
  previousBulletCount: number,
): void => {
  if (state.bullets.length > previousBulletCount) {
    camera.shake(55, 0.0035);
  }
};
```

- [ ] **Step 5: Wire HUD and FX into `GameScene`**

Modify `src/phaser/scenes/GameScene.ts`:

Add fields:

```ts
private fxGraphics!: Phaser.GameObjects.Graphics;
private previousBulletCount = 0;
```

In `create()` after actor creation:

```ts
this.fxGraphics = this.add.graphics();
```

In `update()` after actor sync:

```ts
drawBulletsAndFx(this.fxGraphics, state.bullets, state.fx);
updateCameraFeedback(this.cameras.main, state, this.previousBulletCount);
this.previousBulletCount = state.bullets.length;
this.events.emit("state-change", state);
```

Add imports:

```ts
import { drawBulletsAndFx } from "../view/drawFx";
import { updateCameraFeedback } from "../view/camera";
```

- [ ] **Step 6: Wire HUD from `main.ts`**

Replace `src/main.ts` with:

```ts
import Phaser from "phaser";
import { GameScene } from "./phaser/scenes/GameScene";
import { createHud } from "./ui/hud/createHud";
import "./styles.css";

const hudRoot = document.querySelector<HTMLDivElement>("#hud-root");
const gameRoot = document.querySelector<HTMLDivElement>("#game-root");

if (!hudRoot) {
  throw new Error("Missing #hud-root");
}

if (!gameRoot) {
  throw new Error("Missing #game-root");
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: gameRoot,
  width: 1366,
  height: 768,
  backgroundColor: "#05070b",
  pixelArt: true,
  roundPixels: true,
  scene: [GameScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});

const hud = createHud(hudRoot);

const connectHud = (): void => {
  const scene = game.scene.getScene("game");
  if (!scene) {
    window.setTimeout(connectHud, 50);
    return;
  }
  scene.events.on("state-change", hud.update);
};

connectHud();
```

Modify `src/phaser/scenes/GameScene.ts` so it emits the initial HUD state at the end of `create()`:

```ts
this.events.emit("state-change", this.bridge.getState());
```

Expected: the HUD updates on the first frame and every subsequent simulation update.

- [ ] **Step 7: Verify build and tests**

Run: `npm run test`

Expected: PASS.

Run: `npm run build`

Expected: PASS.

- [ ] **Step 8: Commit HUD and FX**

Run:

```bash
git add src
git commit -m "feat: add shooter HUD and feedback effects"
```

Expected: commit succeeds.

## Task 7: First Browser Run And Mechanical Smoke Test

**Files:**

- Modify only files required to fix defects found during the smoke test.

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

Expected: Vite prints a localhost URL, typically `http://127.0.0.1:5173/`. Keep the process running until screenshot QA is complete.

- [ ] **Step 2: Open the game in a browser**

Run:

```bash
/Users/ilyagmirin/.codex/skills/playwright/scripts/playwright_cli.sh open http://127.0.0.1:5173 --headed
```

Expected: browser opens to the game; canvas is visible and not blank.

- [ ] **Step 3: Capture initial screenshot**

Run:

```bash
/Users/ilyagmirin/.codex/skills/playwright/scripts/playwright_cli.sh screenshot --path output/playwright/initial-arena.png
```

Expected: `output/playwright/initial-arena.png` exists and shows the TV-studio arena, player, enemies, and HUD.

- [ ] **Step 4: Exercise controls**

Use the browser manually or Playwright key commands:

```bash
/Users/ilyagmirin/.codex/skills/playwright/scripts/playwright_cli.sh press KeyW
/Users/ilyagmirin/.codex/skills/playwright/scripts/playwright_cli.sh press KeyD
```

Expected: player moves; no console crash; HUD remains readable.

- [ ] **Step 5: Fire and capture combat screenshot**

Click inside the canvas toward an enemy, then run:

```bash
/Users/ilyagmirin/.codex/skills/playwright/scripts/playwright_cli.sh screenshot --path output/playwright/combat-arena.png
```

Expected: screenshot shows bullets or muzzle/blood/casing effects after firing.

- [ ] **Step 6: Fix any mechanical defects**

If movement, aim, firing, enemy damage, death, victory, restart, or HUD update fails, write a focused failing Vitest test for the broken rule when the defect is in `src/game/simulation`. Then fix the smallest relevant file and rerun:

```bash
npm run test
npm run build
```

Expected: tests and build pass after each fix.

- [ ] **Step 7: Commit smoke-test fixes**

If fixes were made, run:

```bash
git add src
git commit -m "fix: stabilize shooter smoke test"
```

Expected: commit succeeds. If no fixes were required, skip this commit.

## Task 8: Visual QA Against References And Polish Pass

**Files:**

- Modify: `src/phaser/view/drawArena.ts`
- Modify: `src/phaser/view/drawActors.ts`
- Modify: `src/phaser/view/drawFx.ts`
- Modify: `src/styles.css`
- Optional create: `src/assets/generated/` if `replicate-nano-banana-2-http` is used.

- [ ] **Step 1: Compare screenshots to references**

Open or inspect:

- `output/playwright/initial-arena.png`
- `output/playwright/combat-arena.png`
- `/Users/ilyagmirin/Downloads/replicate-prediction-3acrj365jdrmw0cy08vbyc9w7m.jpeg`
- `/Users/ilyagmirin/Downloads/replicate-prediction-k50tnff449rmy0cy1s9aa8m7mm.jpeg`
- `/Users/ilyagmirin/Downloads/replicate-prediction-51qwra49knrmy0cy1s99p9e6nr.jpeg`

Expected checklist:

- The camera is strict overhead, not isometric.
- The player reads as a suited character with a bulky CRT TV head.
- Enemies include both human heads and CRT TV heads.
- The era reads late 90s to early 00s through CRTs, bulky cameras, green screen, cables, control panels, and broadcast desks.
- HUD does not cover the player, enemies, or central fight space.
- No black holes, empty floor gaps, missing actors, or broken sprite layering.

- [ ] **Step 2: Polish procedural visuals when the screenshot checklist fails**

If screenshots look too flat, increase contrast and environmental density by editing only the render helpers:

- Add more floor-tile variation in `drawArena.ts`.
- Add black outlines and CRT screen highlights in `drawActors.ts`.
- Add persistent blood decals and brighter muzzle flashes in `drawFx.ts`.
- Tighten HUD text size or position in `src/styles.css`.

After edits, run:

```bash
npm run build
```

Expected: PASS.

- [ ] **Step 3: Use Replicate only if procedural visuals fail the mood check**

If procedural textures cannot deliver the requested style, generate a bitmap reference sheet using:

```bash
/Users/ilyagmirin/PycharmProjects/codex_skills/skills/engineering/replicate-nano-banana-2-http/scripts/run-image.sh \
  --prompt "Strict top-down pixel-art sprite sheet for an original late-1990s TV studio shooter browser game. A suited player with a bulky CRT television head, human-head enemies, CRT-head enemies, news desks, bulky broadcast cameras, CRT monitor walls, green-screen panels, studio lights, cables, server racks, blood decals, shell casings. Original assets, no copyrighted characters, orthographic overhead view, crisp pixel-art silhouettes." \
  --image-input "/Users/ilyagmirin/Downloads/replicate-prediction-3acrj365jdrmw0cy08vbyc9w7m.jpeg" \
  --image-input "/Users/ilyagmirin/Downloads/replicate-prediction-k50tnff449rmy0cy1s9aa8m7mm.jpeg" \
  --image-input "/Users/ilyagmirin/Downloads/replicate-prediction-51qwra49knrmy0cy1s99p9e6nr.jpeg" \
  --aspect-ratio "16:9" \
  --resolution "2K" \
  --output-format "png"
```

Expected: script returns a local output path. Move the chosen output into `src/assets/generated/` with a descriptive filename, wire it through Phaser texture loading, and rerun browser screenshots. If `REPLICATE_API_TOKEN` is missing or the API fails, surface the raw error and continue polishing procedural assets.

- [ ] **Step 4: Capture final screenshot set**

Run:

```bash
/Users/ilyagmirin/.codex/skills/playwright/scripts/playwright_cli.sh screenshot --path output/playwright/final-desktop.png
```

Resize the browser to a narrower viewport using the CLI if available, then run:

```bash
/Users/ilyagmirin/.codex/skills/playwright/scripts/playwright_cli.sh screenshot --path output/playwright/final-narrow.png
```

Expected: both screenshots show coherent rendering and unbroken HUD.

- [ ] **Step 5: Final verification**

Run:

```bash
npm run test
npm run build
```

Expected: both PASS.

- [ ] **Step 6: Commit visual polish**

Run:

```bash
git add src package.json package-lock.json
git commit -m "feat: polish TV studio shooter visuals"
```

Expected: commit succeeds. Do not force-add `output/playwright`; screenshots remain local QA artifacts and their paths are reported in the final response.

## Completion Criteria

- `npm run test` passes.
- `npm run build` passes.
- Local dev server boots and renders the game.
- Player moves with `WASD`.
- Mouse aim affects facing/weapon direction.
- Left click fires the one equipped weapon.
- Ammo, score, enemy count, death, victory, and restart update correctly.
- Ranged and rush enemies are present.
- Strict top-down TV-studio visuals are present.
- Screenshots are captured under `output/playwright/`.
- Visual QA confirms no blank canvas, floor holes, broken HUD, missing actors, wrong perspective, or obvious layering failures.
