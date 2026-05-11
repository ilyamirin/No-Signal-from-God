# Enemy AI v2 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build cinematic tactical arcade enemy AI with posts, patrols, conversations, perception, room-level alerts, enemy door traversal, and smart friendly fire.

**Architecture:** Keep the simulation deterministic and testable by adding focused AI helpers around the existing enemy system. The plan extends `EnemyState` with an `ai` object, separates perception and alert propagation from combat actions, and keeps first-pass navigation authored through patrol points and door pressure rather than full pathfinding.

**Tech Stack:** TypeScript, Phaser 3 rendering, Vite, Vitest, existing simulation systems under `src/game/simulation`.

---

## File Structure

- Modify `src/game/simulation/types.ts`: add AI state, perception, sound event, and alert group types.
- Modify `src/game/simulation/geometry.ts`: add reusable angle and segment-distance helpers for vision cones and friendly-fire corridor checks.
- Create `src/game/simulation/systems/perception.ts`: compute enemy sight, hearing, and shot-safety checks.
- Test `src/game/simulation/perception.test.ts`: cover vision cones, blocked vision, hearing, and friendly-fire blocking.
- Modify `src/game/simulation/systems/enemies.ts`: state machine, alert propagation, patrol/post/talk behavior, enemy door pressure, and combat gating.
- Test `src/game/simulation/enemyAi.test.ts`: cover alert groups, patrol through doors, cooldown return, and conversation interruption.
- Modify `src/game/simulation/systems/combat.ts`: allow enemy bullets to damage other enemies without awarding player score.
- Test `src/game/simulation/combat.test.ts`: cover enemy-on-enemy bullet damage and player score rules.
- Modify `src/game/content/enemies.ts`: author alert groups, posts, patrols, and conversations for the reception hub enemies.
- Modify `src/game/simulation/update.ts`: produce frame sound events and pass them into enemy updates.
- Update existing tests in `src/game/simulation/enemies.test.ts` and `src/game/simulation/update.test.ts` only where the new AI startup behavior changes expectations.

---

### Task 1: Add AI Types And Geometry Helpers

**Files:**
- Modify: `src/game/simulation/types.ts`
- Modify: `src/game/simulation/geometry.ts`
- Modify: `src/game/content/enemies.ts`
- Modify: `src/game/simulation/state.ts`
- Test: `src/game/simulation/geometry.test.ts`
- Test: `src/game/simulation/state.test.ts`

- [ ] **Step 1: Add focused geometry tests**

Append these tests to `src/game/simulation/geometry.test.ts`:

```ts
import { angleDelta, distanceToSegment } from "./geometry";

describe("angleDelta", () => {
  it("returns the smallest signed angle difference", () => {
    expect(angleDelta(Math.PI - 0.1, -Math.PI + 0.1)).toBeCloseTo(-0.2);
    expect(angleDelta(-Math.PI + 0.1, Math.PI - 0.1)).toBeCloseTo(0.2);
  });
});

describe("distanceToSegment", () => {
  it("measures the closest distance to a finite line segment", () => {
    expect(distanceToSegment({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(3);
    expect(distanceToSegment({ x: 14, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 })).toBeCloseTo(5);
  });
});
```

- [ ] **Step 2: Run geometry tests and verify they fail**

Run: `npm test -- src/game/simulation/geometry.test.ts`

Expected: FAIL with TypeScript or runtime errors that `angleDelta` and `distanceToSegment` are not exported.

- [ ] **Step 3: Implement geometry helpers**

Add these exports to `src/game/simulation/geometry.ts`:

```ts
export const angleDelta = (from: number, to: number): number =>
  Math.atan2(Math.sin(to - from), Math.cos(to - from));

export const distanceToSegment = (point: Vec2, start: Vec2, end: Vec2): number => {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;

  if (lengthSquared === 0) {
    return distance(point, start);
  }

  const t = Math.max(
    0,
    Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared),
  );
  const projected = { x: start.x + t * dx, y: start.y + t * dy };
  return distance(point, projected);
};
```

- [ ] **Step 4: Add AI types**

Add these type exports to `src/game/simulation/types.ts` near the existing enemy-related types:

```ts
export type EnemyAiStateName =
  | "posted"
  | "patrolling"
  | "talking"
  | "suspicious"
  | "investigating"
  | "combat"
  | "coolingDown";

export type EnemyPerceptionState = {
  visionRange: number;
  visionAngle: number;
  hearingRange: number;
};

export type EnemyPostState = {
  position: Vec2;
  facing: number;
  lookAngles?: number[];
};

export type EnemyAiState = {
  state: EnemyAiStateName;
  alertGroupId: string;
  route?: Vec2[];
  routeIndex?: number;
  post?: EnemyPostState;
  perception: EnemyPerceptionState;
  knownPlayerPosition?: Vec2;
  suspicionMs: number;
  cooldownMs: number;
  conversationId?: string;
};

export type SoundEventKind = "gunshot" | "door" | "impact" | "movement";

export type SoundEvent = {
  id: string;
  kind: SoundEventKind;
  position: Vec2;
  radius: number;
  sourceId?: string;
};
```

Then add this field to `EnemyState`:

```ts
  ai: EnemyAiState;
```

Add this field to `GameState`:

```ts
  soundEvents: SoundEvent[];
```

- [ ] **Step 5: Add default AI metadata to existing enemies**

In `src/game/content/enemies.ts`, update the import:

```ts
import type { EnemyAiState, EnemyState } from "../simulation/types";
```

Add this helper above `createEnemies`:

```ts
const defaultAi = (alertGroupId: string): EnemyAiState => ({
  state: "posted",
  alertGroupId,
  perception: {
    visionRange: 520,
    visionAngle: Math.PI * 0.62,
    hearingRange: 560,
  },
  suspicionMs: 0,
  cooldownMs: 0,
});
```

Add an `ai` field to each existing enemy object. Use these alert groups:

```ts
"enemy-security-guard": defaultAi("security")
"enemy-newsroom-guard-left": defaultAi("newsroom")
"enemy-newsroom-guard-right": defaultAi("newsroom")
"enemy-server-rifle": defaultAi("serverArchive")
"enemy-control-pistol": defaultAi("broadcastControl")
"enemy-control-rifle": defaultAi("broadcastControl")
"enemy-newsroom-melee": defaultAi("newsroom")
"enemy-server-melee": defaultAi("serverArchive")
```

- [ ] **Step 6: Initialize soundEvents**

In `src/game/simulation/state.ts`, add `soundEvents: []` to the object returned from `createInitialGameState`.

- [ ] **Step 7: Run tests and typecheck**

Run: `npm test -- src/game/simulation/geometry.test.ts src/game/simulation/state.test.ts`

Expected: PASS for both files.

- [ ] **Step 8: Commit**

```bash
git add src/game/simulation/types.ts src/game/simulation/geometry.ts src/game/simulation/geometry.test.ts src/game/simulation/state.ts src/game/content/enemies.ts
git commit -m "Add enemy AI state types"
```

---

### Task 2: Add Perception And Fire-Safety Helpers

**Files:**
- Create: `src/game/simulation/systems/perception.ts`
- Test: `src/game/simulation/perception.test.ts`

- [ ] **Step 1: Create perception tests**

Create `src/game/simulation/perception.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import type { EnemyState, SoundEvent } from "./types";
import { canEnemyHearSound, canEnemySeePlayer, hasFriendlyInLineOfFire } from "./systems/perception";

const firstEnemy = (): { state: ReturnType<typeof createInitialGameState>; enemy: EnemyState } => {
  const state = createInitialGameState();
  const enemy = state.enemies[0];
  state.enemies.forEach((candidate) => {
    candidate.alive = candidate.id === enemy.id;
    candidate.health = candidate.id === enemy.id ? 1 : 0;
  });
  enemy.position = { x: 100, y: 100 };
  enemy.facing = 0;
  enemy.ai.perception = { visionRange: 300, visionAngle: Math.PI / 2, hearingRange: 260 };
  state.player.position = { x: 220, y: 100 };
  return { state, enemy };
};

describe("enemy perception", () => {
  it("sees the player inside range, cone, and line of sight", () => {
    const { state, enemy } = firstEnemy();

    expect(canEnemySeePlayer(state, enemy)).toBe(true);
  });

  it("does not see the player outside the vision cone", () => {
    const { state, enemy } = firstEnemy();
    state.player.position = { x: 100, y: 220 };

    expect(canEnemySeePlayer(state, enemy)).toBe(false);
  });

  it("does not see through a vision-blocking collider", () => {
    const { state, enemy } = firstEnemy();
    state.colliders.push({
      id: "vision-wall",
      kind: "rect",
      rect: { x: 150, y: 70, width: 20, height: 80 },
      channels: { movement: true, bullets: true, vision: true, sound: true },
    });

    expect(canEnemySeePlayer(state, enemy)).toBe(false);
  });

  it("hears an unblocked sound inside hearing range", () => {
    const { state, enemy } = firstEnemy();
    const sound: SoundEvent = {
      id: "sound-test",
      kind: "gunshot",
      position: { x: 180, y: 100 },
      radius: 400,
      sourceId: "player",
    };

    expect(canEnemyHearSound(state, enemy, sound)).toBe(true);
  });

  it("does not hear through a sound-blocking collider", () => {
    const { state, enemy } = firstEnemy();
    state.colliders.push({
      id: "sound-wall",
      kind: "rect",
      rect: { x: 140, y: 70, width: 20, height: 80 },
      channels: { movement: true, bullets: true, vision: true, sound: true },
    });
    const sound: SoundEvent = {
      id: "sound-test",
      kind: "gunshot",
      position: { x: 200, y: 100 },
      radius: 400,
      sourceId: "player",
    };

    expect(canEnemyHearSound(state, enemy, sound)).toBe(false);
  });
});

describe("friendly fire safety", () => {
  it("detects a friendly enemy between shooter and player", () => {
    const state = createInitialGameState();
    const [shooter, friendly] = state.enemies;
    state.enemies.forEach((enemy) => {
      enemy.alive = enemy.id === shooter.id || enemy.id === friendly.id;
      enemy.health = enemy.alive ? 1 : 0;
      enemy.ai.alertGroupId = "test-room";
    });
    shooter.position = { x: 100, y: 100 };
    friendly.position = { x: 180, y: 100 };
    friendly.radius = 18;
    state.player.position = { x: 260, y: 100 };

    expect(hasFriendlyInLineOfFire(state, shooter, state.player.position)).toBe(true);
  });
});
```

- [ ] **Step 2: Run perception tests and verify they fail**

Run: `npm test -- src/game/simulation/perception.test.ts`

Expected: FAIL because `src/game/simulation/systems/perception.ts` does not exist.

- [ ] **Step 3: Implement perception helpers**

Create `src/game/simulation/systems/perception.ts`:

```ts
import { angleDelta, angleTo, distance, distanceToSegment } from "../geometry";
import { hasLineOfSightThroughColliders } from "../collision";
import type { EnemyState, GameState, SoundEvent, Vec2 } from "../types";

export const canEnemySeePlayer = (state: GameState, enemy: EnemyState): boolean => {
  if (!state.player.alive) {
    return false;
  }

  const playerDistance = distance(enemy.position, state.player.position);
  if (playerDistance > enemy.ai.perception.visionRange) {
    return false;
  }

  const toPlayer = angleTo(enemy.position, state.player.position);
  if (Math.abs(angleDelta(enemy.facing, toPlayer)) > enemy.ai.perception.visionAngle / 2) {
    return false;
  }

  return hasLineOfSightThroughColliders(state.colliders, enemy.position, state.player.position, "vision");
};

export const canEnemyHearSound = (state: GameState, enemy: EnemyState, sound: SoundEvent): boolean => {
  if (sound.sourceId === enemy.id) {
    return false;
  }

  const effectiveRange = Math.min(enemy.ai.perception.hearingRange, sound.radius);
  if (distance(enemy.position, sound.position) > effectiveRange) {
    return false;
  }

  return hasLineOfSightThroughColliders(state.colliders, enemy.position, sound.position, "sound");
};

export const nearestHeardSound = (state: GameState, enemy: EnemyState): SoundEvent | undefined =>
  state.soundEvents.find((sound) => canEnemyHearSound(state, enemy, sound));

export const hasFriendlyInLineOfFire = (
  state: GameState,
  shooter: EnemyState,
  target: Vec2,
): boolean => {
  const targetDistance = distance(shooter.position, target);

  return state.enemies.some((candidate) => {
    if (!candidate.alive || candidate.id === shooter.id) {
      return false;
    }

    const candidateDistance = distance(shooter.position, candidate.position);
    if (candidateDistance >= targetDistance) {
      return false;
    }

    return distanceToSegment(candidate.position, shooter.position, target) <= candidate.radius + 6;
  });
};
```

- [ ] **Step 4: Run perception tests**

Run: `npm test -- src/game/simulation/perception.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/game/simulation/systems/perception.ts src/game/simulation/perception.test.ts
git commit -m "Add enemy perception helpers"
```

---

### Task 3: Add Alert Group Propagation

**Files:**
- Modify: `src/game/simulation/systems/enemies.ts`
- Test: `src/game/simulation/enemyAi.test.ts`

- [ ] **Step 1: Create alert group tests**

Create `src/game/simulation/enemyAi.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { updateEnemies } from "./systems/enemies";

describe("enemy alert groups", () => {
  it("alerts enemies in the same group without waking the whole map", () => {
    const state = createInitialGameState();
    const [spotter, sameGroup, otherGroup] = state.enemies;
    state.enemies.forEach((enemy) => {
      enemy.alive = enemy.id === spotter.id || enemy.id === sameGroup.id || enemy.id === otherGroup.id;
      enemy.health = enemy.alive ? 1 : 0;
      enemy.ai.state = "posted";
      enemy.attackCooldownMs = 12000;
    });
    spotter.ai.alertGroupId = "security";
    sameGroup.ai.alertGroupId = "security";
    otherGroup.ai.alertGroupId = "newsroom";
    spotter.position = { x: 100, y: 100 };
    spotter.facing = 0;
    spotter.ai.perception = { visionRange: 500, visionAngle: Math.PI, hearingRange: 300 };
    sameGroup.position = { x: 140, y: 130 };
    otherGroup.position = { x: 180, y: 130 };
    state.player.position = { x: 220, y: 100 };

    updateEnemies(state, 16);

    expect(spotter.ai.state).toBe("combat");
    expect(sameGroup.ai.state).toBe("investigating");
    expect(sameGroup.ai.knownPlayerPosition).toEqual(state.player.position);
    expect(otherGroup.ai.state).toBe("posted");
  });
});
```

- [ ] **Step 2: Run the alert test and verify it fails**

Run: `npm test -- src/game/simulation/enemyAi.test.ts`

Expected: FAIL because `updateEnemies` does not yet inspect `ai` state or propagate alert groups.

- [ ] **Step 3: Add alert helpers to enemy system**

In `src/game/simulation/systems/enemies.ts`, add imports:

```ts
import { canEnemySeePlayer, nearestHeardSound, hasFriendlyInLineOfFire } from "./perception";
```

Then add these helpers above `updateRushEnemy`:

```ts
const enterCombat = (state: GameState, enemy: EnemyState, knownPosition = state.player.position): void => {
  enemy.ai.state = "combat";
  enemy.ai.knownPlayerPosition = { ...knownPosition };

  for (const ally of state.enemies) {
    if (!ally.alive || ally.id === enemy.id || ally.ai.alertGroupId !== enemy.ai.alertGroupId) {
      continue;
    }

    ally.ai.knownPlayerPosition = { ...knownPosition };
    if (canEnemySeePlayer(state, ally)) {
      ally.ai.state = "combat";
    } else if (ally.ai.state !== "combat") {
      ally.ai.state = "investigating";
    }
  }
};

const updatePerceptionAndAlerts = (state: GameState, enemy: EnemyState): void => {
  if (canEnemySeePlayer(state, enemy)) {
    enterCombat(state, enemy, state.player.position);
    return;
  }

  const sound = nearestHeardSound(state, enemy);
  if (sound && enemy.ai.state !== "combat") {
    enemy.ai.knownPlayerPosition = { ...sound.position };
    enemy.ai.state = "suspicious";
  }
};
```

- [ ] **Step 4: Gate combat updates by AI state**

Replace the body of `updateEnemies` with this structure:

```ts
export const updateEnemies = (state: GameState, deltaMs: number): void => {
  for (const enemy of state.enemies) {
    if (!enemy.alive) {
      continue;
    }

    enemy.attackCooldownMs = reduceTimer(enemy.attackCooldownMs, deltaMs);
    updatePerceptionAndAlerts(state, enemy);

    if (enemy.ai.state !== "combat") {
      enemy.velocity = { x: 0, y: 0 };
      continue;
    }

    if (enemy.archetype === "monster_melee") {
      updateRushEnemy(state, enemy, deltaMs);
    } else if (enemy.archetype === "humanoid_ranged") {
      updateRangedEnemy(state, enemy, deltaMs);
    }
  }
};
```

The import of `hasFriendlyInLineOfFire` is unused until Task 6. If TypeScript flags it, omit that import in this task and add it in Task 6.

- [ ] **Step 5: Run the alert test**

Run: `npm test -- src/game/simulation/enemyAi.test.ts`

Expected: PASS for the alert group test.

- [ ] **Step 6: Commit**

```bash
git add src/game/simulation/systems/enemies.ts src/game/simulation/enemyAi.test.ts
git commit -m "Add enemy alert group propagation"
```

---

### Task 4: Add Posted, Patrol, Talking, Suspicion, Investigation, And Cooldown Behavior

**Files:**
- Modify: `src/game/simulation/systems/enemies.ts`
- Test: `src/game/simulation/enemyAi.test.ts`

- [ ] **Step 1: Add non-combat AI tests**

Append to `src/game/simulation/enemyAi.test.ts`:

```ts
describe("non-combat enemy AI states", () => {
  it("keeps talking enemies facing each other until alerted", () => {
    const state = createInitialGameState();
    const [left, right] = state.enemies;
    state.enemies.forEach((enemy) => {
      enemy.alive = enemy.id === left.id || enemy.id === right.id;
      enemy.health = enemy.alive ? 1 : 0;
    });
    left.position = { x: 100, y: 100 };
    right.position = { x: 180, y: 100 };
    left.ai = { ...left.ai, state: "talking", conversationId: "test-chat", alertGroupId: "test" };
    right.ai = { ...right.ai, state: "talking", conversationId: "test-chat", alertGroupId: "test" };
    state.player.position = { x: 1000, y: 1000 };

    updateEnemies(state, 16);

    expect(left.facing).toBeCloseTo(0);
    expect(right.facing).toBeCloseTo(Math.PI);
  });

  it("moves a patrolling enemy toward its next route point", () => {
    const state = createInitialGameState();
    const enemy = state.enemies[0];
    state.enemies.forEach((candidate) => {
      candidate.alive = candidate.id === enemy.id;
      candidate.health = candidate.alive ? 1 : 0;
    });
    enemy.position = { x: 100, y: 100 };
    enemy.ai = {
      ...enemy.ai,
      state: "patrolling",
      route: [{ x: 100, y: 100 }, { x: 200, y: 100 }],
      routeIndex: 1,
    };
    state.player.position = { x: 1000, y: 1000 };

    updateEnemies(state, 250);

    expect(enemy.position.x).toBeGreaterThan(100);
  });

  it("returns a cooling enemy to its post after the cooldown expires", () => {
    const state = createInitialGameState();
    const enemy = state.enemies[0];
    state.enemies.forEach((candidate) => {
      candidate.alive = candidate.id === enemy.id;
      candidate.health = candidate.alive ? 1 : 0;
    });
    enemy.position = { x: 120, y: 100 };
    enemy.ai = {
      ...enemy.ai,
      state: "coolingDown",
      cooldownMs: 10,
      post: { position: { x: 100, y: 100 }, facing: Math.PI / 2 },
    };
    state.player.position = { x: 1000, y: 1000 };

    updateEnemies(state, 20);

    expect(enemy.ai.state).toBe("posted");
    expect(enemy.facing).toBeCloseTo(Math.PI / 2);
  });
});
```

- [ ] **Step 2: Run non-combat tests and verify they fail**

Run: `npm test -- src/game/simulation/enemyAi.test.ts`

Expected: FAIL for talking/patrol/cooldown behavior.

- [ ] **Step 3: Add non-combat constants and helper**

In `src/game/simulation/systems/enemies.ts`, add constants near movement speeds:

```ts
const PATROL_SPEED = 95;
const INVESTIGATE_SPEED = 120;
const ROUTE_POINT_DISTANCE = 16;
const SUSPICION_DELAY_MS = 260;
const DEFAULT_COOLDOWN_MS = 950;
```

Add this helper:

```ts
const moveTowardPoint = (state: GameState, enemy: EnemyState, target: Vec2, speed: number, deltaMs: number): boolean => {
  enemy.facing = angleTo(enemy.position, target);
  const toTarget = normalize({ x: target.x - enemy.position.x, y: target.y - enemy.position.y });
  moveEnemy(state, enemy, scale(toTarget, speed), deltaMs);
  return distance(enemy.position, target) <= ROUTE_POINT_DISTANCE;
};
```

- [ ] **Step 4: Implement non-combat state update**

Add this function above `updateEnemies`:

```ts
const updateNonCombatEnemy = (state: GameState, enemy: EnemyState, deltaMs: number): void => {
  if (enemy.ai.state === "posted") {
    enemy.velocity = { x: 0, y: 0 };
    if (enemy.ai.post) {
      enemy.facing = enemy.ai.post.facing;
    }
    return;
  }

  if (enemy.ai.state === "talking") {
    enemy.velocity = { x: 0, y: 0 };
    const partner = state.enemies.find(
      (candidate) =>
        candidate.alive &&
        candidate.id !== enemy.id &&
        candidate.ai.conversationId === enemy.ai.conversationId,
    );
    if (partner) {
      enemy.facing = angleTo(enemy.position, partner.position);
    }
    return;
  }

  if (enemy.ai.state === "patrolling") {
    const route = enemy.ai.route;
    if (!route || route.length === 0) {
      enemy.velocity = { x: 0, y: 0 };
      return;
    }

    const routeIndex = enemy.ai.routeIndex ?? 0;
    const target = route[routeIndex % route.length];
    if (moveTowardPoint(state, enemy, target, PATROL_SPEED, deltaMs)) {
      enemy.ai.routeIndex = (routeIndex + 1) % route.length;
    }
    return;
  }

  if (enemy.ai.state === "suspicious") {
    enemy.velocity = { x: 0, y: 0 };
    enemy.ai.suspicionMs += deltaMs;
    if (enemy.ai.knownPlayerPosition) {
      enemy.facing = angleTo(enemy.position, enemy.ai.knownPlayerPosition);
    }
    if (enemy.ai.suspicionMs >= SUSPICION_DELAY_MS) {
      enemy.ai.suspicionMs = 0;
      enemy.ai.state = "investigating";
    }
    return;
  }

  if (enemy.ai.state === "investigating") {
    if (!enemy.ai.knownPlayerPosition) {
      enemy.ai.state = "coolingDown";
      enemy.ai.cooldownMs = DEFAULT_COOLDOWN_MS;
      return;
    }

    if (moveTowardPoint(state, enemy, enemy.ai.knownPlayerPosition, INVESTIGATE_SPEED, deltaMs)) {
      enemy.ai.state = "coolingDown";
      enemy.ai.cooldownMs = DEFAULT_COOLDOWN_MS;
    }
    return;
  }

  if (enemy.ai.state === "coolingDown") {
    enemy.velocity = { x: 0, y: 0 };
    enemy.ai.cooldownMs = reduceTimer(enemy.ai.cooldownMs, deltaMs);
    if (enemy.ai.cooldownMs === 0) {
      if (enemy.ai.post) {
        enemy.position = { ...enemy.ai.post.position };
        enemy.facing = enemy.ai.post.facing;
        enemy.ai.state = "posted";
      } else if (enemy.ai.route && enemy.ai.route.length > 0) {
        enemy.ai.state = "patrolling";
      } else {
        enemy.ai.state = "posted";
      }
    }
  }
};
```

- [ ] **Step 5: Wire non-combat update into updateEnemies**

In `updateEnemies`, replace the current non-combat branch with:

```ts
    if (enemy.ai.state !== "combat") {
      updateNonCombatEnemy(state, enemy, deltaMs);
      continue;
    }
```

- [ ] **Step 6: Run enemy AI tests**

Run: `npm test -- src/game/simulation/enemyAi.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/game/simulation/systems/enemies.ts src/game/simulation/enemyAi.test.ts
git commit -m "Add non-combat enemy AI states"
```

---

### Task 5: Let Enemies Push Through Doors

**Files:**
- Modify: `src/game/simulation/systems/enemies.ts`
- Test: `src/game/simulation/enemyAi.test.ts`

- [ ] **Step 1: Add door traversal test**

Append to `src/game/simulation/enemyAi.test.ts`:

```ts
describe("enemy door traversal", () => {
  it("applies door pressure while a patrolling enemy moves through a doorway", () => {
    const state = createInitialGameState();
    const enemy = state.enemies[0];
    const door = state.doors[0];
    state.enemies.forEach((candidate) => {
      candidate.alive = candidate.id === enemy.id;
      candidate.health = candidate.alive ? 1 : 0;
    });
    enemy.position = { x: door.hinge.x + 16, y: door.hinge.y + 28 };
    enemy.ai = {
      ...enemy.ai,
      state: "patrolling",
      route: [
        { x: door.hinge.x + 16, y: door.hinge.y + 28 },
        { x: door.hinge.x + 16, y: door.hinge.y + 100 },
      ],
      routeIndex: 1,
    };
    state.player.position = { x: 1000, y: 1000 };
    const initialAngle = door.angle;

    for (let frame = 0; frame < 8; frame += 1) {
      updateEnemies(state, 80);
    }

    expect(door.angle).not.toBe(initialAngle);
    expect(enemy.position.y).toBeGreaterThan(door.hinge.y + 28);
  });
});
```

- [ ] **Step 2: Run door traversal test and verify it fails**

Run: `npm test -- src/game/simulation/enemyAi.test.ts`

Expected: FAIL because enemy movement does not call `applyDoorPressure`.

- [ ] **Step 3: Apply door pressure from enemy movement**

In `src/game/simulation/systems/enemies.ts`, import:

```ts
import { applyDoorPressure } from "./doors";
```

In `tryMoveEnemy`, before `if (canStandAt(state, enemy, nextPosition))`, add:

```ts
  applyDoorPressure(state, nextPosition, enemy.radius);
```

The helper mutates door angular velocity. `updateDoors` already syncs door colliders in the main update loop, and direct enemy-system tests can observe the door angle after repeated enemy updates if `updateDoors` is also called in the test loop. If the test does not observe angle changes, update the test loop to call `updateDoors(state, 80)` after `updateEnemies(state, 80)`.

- [ ] **Step 4: Run door traversal test**

Run: `npm test -- src/game/simulation/enemyAi.test.ts`

Expected: PASS.

- [ ] **Step 5: Run door regression tests**

Run: `npm test -- src/game/simulation/doors.test.ts src/game/simulation/enemyAi.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/game/simulation/systems/enemies.ts src/game/simulation/enemyAi.test.ts
git commit -m "Let enemies push through doors"
```

---

### Task 6: Add Smart Friendly Fire

**Files:**
- Modify: `src/game/simulation/systems/enemies.ts`
- Modify: `src/game/simulation/systems/combat.ts`
- Test: `src/game/simulation/combat.test.ts`
- Test: `src/game/simulation/perception.test.ts`

- [ ] **Step 1: Add enemy bullet damage tests**

Create `src/game/simulation/combat.test.ts` with:

```ts
import { describe, expect, it } from "vitest";
import { createInitialGameState } from "./state";
import { updateBulletsAndHits } from "./systems/combat";

describe("combat friendly fire", () => {
  it("lets enemy bullets damage another enemy", () => {
    const state = createInitialGameState();
    const [shooter, target] = state.enemies;
    state.enemies.forEach((enemy) => {
      enemy.alive = enemy.id === shooter.id || enemy.id === target.id;
      enemy.health = enemy.alive ? 1 : 0;
    });
    target.position = { x: 200, y: 100 };
    state.bullets.push({
      id: "enemy-bullet",
      ownerId: shooter.id,
      position: { ...target.position },
      velocity: { x: 100, y: 0 },
      damage: 1,
      ttlMs: 100,
    });
    const scoreBefore = state.score;

    updateBulletsAndHits(state, 16);

    expect(target.alive).toBe(false);
    expect(state.score).toBe(scoreBefore);
  });
});
```

- [ ] **Step 2: Add fire withholding test**

Append to `src/game/simulation/perception.test.ts`:

```ts
it("does not flag a friendly behind the player as blocking fire", () => {
  const state = createInitialGameState();
  const [shooter, friendly] = state.enemies;
  state.enemies.forEach((enemy) => {
    enemy.alive = enemy.id === shooter.id || enemy.id === friendly.id;
    enemy.health = enemy.alive ? 1 : 0;
  });
  shooter.position = { x: 100, y: 100 };
  friendly.position = { x: 320, y: 100 };
  friendly.radius = 18;
  state.player.position = { x: 260, y: 100 };

  expect(hasFriendlyInLineOfFire(state, shooter, state.player.position)).toBe(false);
});
```

- [ ] **Step 3: Run friendly-fire tests and verify they fail**

Run: `npm test -- src/game/simulation/combat.test.ts src/game/simulation/perception.test.ts`

Expected: `combat.test.ts` FAILS because enemy bullets do not damage enemies. The perception test for friendly behind the player should PASS if Task 2 was implemented correctly.

- [ ] **Step 4: Allow enemy bullets to hit enemies other than owner**

In `src/game/simulation/systems/combat.ts`, replace the player-owned-only enemy hit branch:

```ts
    if (bullet.ownerId === state.player.id) {
      const enemy = state.enemies.find((candidate) => candidate.alive && distance(candidate.position, bullet.position) <= candidate.radius);
      if (enemy) {
        enemy.health -= bullet.damage;
        addFx(state, "blood", enemy.position, Math.atan2(bullet.velocity.y, bullet.velocity.x));
        if (enemy.health <= 0) {
          killEnemy(state, enemy, bullet.velocity);
          state.score += killScore(enemy.kind);
        }
        continue;
      }
    } else if (
```

with:

```ts
    const hitEnemy = state.enemies.find(
      (candidate) =>
        candidate.alive &&
        candidate.id !== bullet.ownerId &&
        distance(candidate.position, bullet.position) <= candidate.radius,
    );
    if (hitEnemy) {
      hitEnemy.health -= bullet.damage;
      addFx(state, "blood", hitEnemy.position, Math.atan2(bullet.velocity.y, bullet.velocity.x));
      if (hitEnemy.health <= 0) {
        killEnemy(state, hitEnemy, bullet.velocity);
        if (bullet.ownerId === state.player.id) {
          state.score += killScore(hitEnemy.kind);
        }
      }
      continue;
    }

    if (
      bullet.ownerId !== state.player.id &&
```

Keep the existing player-hit body after the condition.

- [ ] **Step 5: Gate ranged enemy firing by fire-safety**

In `src/game/simulation/systems/enemies.ts`, import `hasFriendlyInLineOfFire` from `./perception`.

In `updateRangedEnemy`, update the fire condition from:

```ts
    hasLineOfSightThroughColliders(state.colliders, enemy.position, state.player.position, "vision")
```

to:

```ts
    hasLineOfSightThroughColliders(state.colliders, enemy.position, state.player.position, "vision") &&
    !hasFriendlyInLineOfFire(state, enemy, state.player.position)
```

- [ ] **Step 6: Add ranged firing regression**

Append to `src/game/simulation/enemyAi.test.ts`:

```ts
describe("ranged enemy fire safety", () => {
  it("withholds fire when a friendly blocks the shot", () => {
    const state = createInitialGameState();
    const [shooter, friendly] = state.enemies;
    state.enemies.forEach((enemy) => {
      enemy.alive = enemy.id === shooter.id || enemy.id === friendly.id;
      enemy.health = enemy.alive ? 1 : 0;
      enemy.ai.state = enemy.id === shooter.id ? "combat" : "posted";
    });
    shooter.archetype = "humanoid_ranged";
    shooter.weaponId = "security-guard-pistol";
    shooter.attackCooldownMs = 0;
    shooter.position = { x: 100, y: 100 };
    friendly.position = { x: 180, y: 100 };
    state.player.position = { x: 260, y: 100 };

    updateEnemies(state, 16);

    expect(state.bullets.filter((bullet) => bullet.ownerId === shooter.id)).toHaveLength(0);
  });
});
```

- [ ] **Step 7: Run friendly-fire suite**

Run: `npm test -- src/game/simulation/combat.test.ts src/game/simulation/perception.test.ts src/game/simulation/enemyAi.test.ts`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add src/game/simulation/systems/combat.ts src/game/simulation/systems/enemies.ts src/game/simulation/combat.test.ts src/game/simulation/perception.test.ts src/game/simulation/enemyAi.test.ts
git commit -m "Add smart enemy friendly fire"
```

---

### Task 7: Author Reception Hub Enemy AI Content

**Files:**
- Modify: `src/game/content/enemies.ts`
- Test: `src/game/simulation/state.test.ts`

- [ ] **Step 1: Add state test for authored AI**

Append to `src/game/simulation/state.test.ts`:

```ts
it("authors every enemy with AI state and alert group metadata", () => {
  const state = createInitialGameState();

  expect(state.enemies.every((enemy) => enemy.ai.alertGroupId.length > 0)).toBe(true);
  expect(state.enemies.every((enemy) => enemy.ai.perception.visionRange > 0)).toBe(true);
  expect(state.enemies.some((enemy) => enemy.ai.state === "patrolling")).toBe(true);
  expect(state.enemies.some((enemy) => enemy.ai.state === "talking")).toBe(true);
  expect(state.enemies.some((enemy) => enemy.ai.state === "posted")).toBe(true);
});
```

- [ ] **Step 2: Run authored AI test and verify it fails**

Run: `npm test -- src/game/simulation/state.test.ts`

Expected: FAIL because Task 1 only added default posted AI metadata, and this test requires authored patrol and conversation states.

- [ ] **Step 3: Replace the default AI helper with authored AI helpers**

In `src/game/content/enemies.ts`, update imports:

```ts
import type { EnemyAiState, EnemyAiStateName, EnemyState, Vec2 } from "../simulation/types";
```

Replace the `defaultAi` helper from Task 1 with these helpers above `createEnemies`:

```ts
const defaultPerception = {
  visionRange: 520,
  visionAngle: Math.PI * 0.62,
  hearingRange: 560,
};

const ai = (
  state: EnemyAiStateName,
  alertGroupId: string,
  options: Partial<EnemyAiState> = {},
): EnemyAiState => ({
  state,
  alertGroupId,
  perception: defaultPerception,
  suspicionMs: 0,
  cooldownMs: 0,
  ...options,
});

const post = (position: Vec2, facing: number) => ({
  position,
  facing,
});
```

- [ ] **Step 4: Add AI data to each enemy**

Update each enemy object in `createEnemies()` with an `ai` field:

```ts
ai: ai("posted", "security", { post: post({ x: 1040, y: 1020 }, Math.PI) })
```

Use these assignments:

```ts
"enemy-security-guard": ai("posted", "security", { post: post({ x: 1040, y: 1020 }, Math.PI) })
"enemy-newsroom-guard-left": ai("talking", "newsroom", { conversationId: "newsroom-floor-chat" })
"enemy-newsroom-guard-right": ai("talking", "newsroom", { conversationId: "newsroom-floor-chat" })
"enemy-server-rifle": ai("patrolling", "serverArchive", {
  route: [{ x: 1815, y: 1000 }, { x: 1500, y: 1000 }, { x: 1815, y: 1000 }],
  routeIndex: 1,
})
"enemy-control-pistol": ai("posted", "broadcastControl", { post: post({ x: 1710, y: 455 }, Math.PI) })
"enemy-control-rifle": ai("posted", "broadcastControl", { post: post({ x: 1870, y: 610 }, Math.PI) })
"enemy-newsroom-melee": ai("patrolling", "newsroom", {
  route: [{ x: 760, y: 665 }, { x: 620, y: 665 }, { x: 760, y: 665 }],
  routeIndex: 1,
  perception: { visionRange: 420, visionAngle: Math.PI * 0.72, hearingRange: 620 },
})
"enemy-server-melee": ai("posted", "serverArchive", {
  post: post({ x: 1325, y: 1180 }, -Math.PI / 2),
  perception: { visionRange: 390, visionAngle: Math.PI * 0.72, hearingRange: 620 },
})
```

- [ ] **Step 5: Run authored AI and existing enemy tests**

Run: `npm test -- src/game/simulation/state.test.ts src/game/simulation/enemies.test.ts`

Expected: PASS. If existing melee tests depend on immediate combat, set isolated test enemies to `enemy.ai.state = "combat"` inside those tests.

- [ ] **Step 6: Commit**

```bash
git add src/game/content/enemies.ts src/game/simulation/state.test.ts src/game/simulation/enemies.test.ts
git commit -m "Author reception hub enemy AI states"
```

---

### Task 8: Add Frame Sound Events And Update Integration

**Files:**
- Modify: `src/game/simulation/update.ts`
- Modify: `src/game/simulation/systems/weapons.ts`
- Test: `src/game/simulation/update.test.ts`
- Test: `src/game/simulation/enemyAi.test.ts`

- [ ] **Step 1: Add sound event tests**

Append to `src/game/simulation/update.test.ts`:

```ts
it("emits a player gunshot sound event when the player fires", () => {
  const state = createInitialGameState();
  const next = updateGame(state, { ...neutralInput, firing: true }, 16);

  expect(next.soundEvents.some((sound) => sound.kind === "gunshot" && sound.sourceId === "player")).toBe(true);
});
```

Append to `src/game/simulation/enemyAi.test.ts`:

```ts
describe("enemy hearing integration", () => {
  it("moves a posted enemy to suspicious after hearing a gunshot sound", () => {
    const state = createInitialGameState();
    const enemy = state.enemies[0];
    state.enemies.forEach((candidate) => {
      candidate.alive = candidate.id === enemy.id;
      candidate.health = candidate.alive ? 1 : 0;
    });
    enemy.ai.state = "posted";
    enemy.position = { x: 100, y: 100 };
    state.player.position = { x: 1000, y: 1000 };
    state.soundEvents.push({
      id: "test-gunshot",
      kind: "gunshot",
      position: { x: 180, y: 100 },
      radius: 500,
      sourceId: "player",
    });

    updateEnemies(state, 16);

    expect(enemy.ai.state).toBe("suspicious");
    expect(enemy.ai.knownPlayerPosition).toEqual({ x: 180, y: 100 });
  });
});
```

- [ ] **Step 2: Run sound tests and verify they fail**

Run: `npm test -- src/game/simulation/update.test.ts src/game/simulation/enemyAi.test.ts`

Expected: update test FAILS because weapon firing does not create sound events yet.

- [ ] **Step 3: Emit gunshot sound events from weapons**

In `src/game/simulation/systems/weapons.ts`, after pushing muzzle and casing fx in `tryFireWeapon`, add:

```ts
  state.soundEvents.push({
    id: nextId(state, "sound"),
    kind: "gunshot",
    position: { ...origin },
    radius: weapon.kind === "rifle" ? 760 : 620,
    sourceId: ownerId,
  });
```

- [ ] **Step 4: Clear stale sound events at frame start**

In `src/game/simulation/update.ts`, after cloning and status guard but before systems update, add:

```ts
  state.soundEvents = [];
```

This keeps sound events frame-local. The current frame then fills the array through weapon fire and other event sources.

- [ ] **Step 5: Preserve test-injected sound events for direct enemy tests**

No code change is needed for direct `updateEnemies` tests because they bypass `updateGame` and can push `state.soundEvents` directly before calling `updateEnemies`.

- [ ] **Step 6: Run sound tests**

Run: `npm test -- src/game/simulation/update.test.ts src/game/simulation/enemyAi.test.ts`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add src/game/simulation/update.ts src/game/simulation/systems/weapons.ts src/game/simulation/update.test.ts src/game/simulation/enemyAi.test.ts
git commit -m "Emit sound events for enemy hearing"
```

---

### Task 9: Full Verification And Browser Smoke Test

**Files:**
- Modify only files needed to fix failures discovered by verification.

- [ ] **Step 1: Run the full test suite**

Run: `npm test`

Expected: PASS with all Vitest files passing.

- [ ] **Step 2: Run the production build**

Run: `npm run build`

Expected: PASS with TypeScript compilation and Vite build completed.

- [ ] **Step 3: Start the dev server**

Run: `npm run dev`

Expected: Vite prints a local URL such as `http://127.0.0.1:5173/`.

- [ ] **Step 4: Browser smoke test**

Open the local URL in the in-app browser. Verify these behaviors manually:

- guards hold posts, patrol, or face conversation partners before combat
- entering a room alerts the local room group, not every enemy on the map
- a patrolling enemy can push through a hinged door
- enemy gunfire can hit another enemy
- ranged enemies withhold fire when another enemy stands directly in the shot path
- existing movement, pickup, doors, melee, ranged combat, and victory state still work

- [ ] **Step 5: Fix any verification failures**

For each failure, make the smallest local fix, then re-run the command that failed. If a browser smoke issue is visual or behavioral, add or adjust a simulation test that captures the rule before patching it.

- [ ] **Step 6: Final status check**

Run: `git status --short`

Expected: no unstaged changes after final commit, or only intentional uncommitted changes that are explicitly reported.

- [ ] **Step 7: Commit verification fixes**

If verification required fixes:

```bash
git add src/game/simulation src/game/content
git commit -m "Stabilize enemy AI v2"
```

If no fixes were needed, do not create an empty commit.

---

## Spec Coverage Checklist

- Visibility: Task 2 implements vision cones and line-of-sight checks.
- Hearing: Task 2 adds hearing checks; Task 8 emits gunshot sounds.
- Patrol: Task 4 implements patrol movement; Task 7 authors patrols.
- Posts: Task 4 implements posted behavior; Task 7 authors posts.
- Conversations: Task 4 implements conversation facing; Task 7 authors a newsroom conversation.
- Suspicion, investigation, cooldown: Task 4 implements state transitions.
- Room-level alert: Task 3 implements alert propagation by `alertGroupId`.
- Doors: Task 5 applies enemy door pressure.
- Friendly fire: Task 6 updates bullet damage and ranged fire safety.
- Testing: Tasks 1-8 add focused Vitest coverage; Task 9 runs full verification and browser smoke testing.
