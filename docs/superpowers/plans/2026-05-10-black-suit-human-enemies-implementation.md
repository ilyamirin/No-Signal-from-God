# Black Suit Human Enemies Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a first complete black-suit human enemy asset pipeline and wire pistol/rifle black-suit enemies into the Phaser game without losing track of generated assets.

**Architecture:** Keep raw Replicate work in ignored `output/asset-pipeline/`, and commit only approved game-ready PNG sheets under `src/assets/game/actors/enemy-black-suit-human/` with a durable manifest. Runtime integration stays simple: complete Phaser spritesheets are loaded from a small typed registry, and enemy state gets a lightweight visual variant field for head selection.

**Tech Stack:** TypeScript, Phaser 3, Vite asset imports, Vitest, Replicate `google/nano-banana-pro` through `/Users/ilyagmirin/PycharmProjects/codex_skills/skills/engineering/replicate-nano-banana-pro-http/scripts/run-image.sh`.

---

## File Structure

- Create `src/game/content/blackSuitEnemyAssets.ts`: typed asset manifest and helpers for head/weapon/animation ids.
- Create `src/game/content/blackSuitEnemyAssets.test.ts`: unit tests for manifest completeness, stable paths, and lookup behavior.
- Modify `src/game/simulation/types.ts`: add a human enemy visual variant field without changing behavior categories.
- Modify `src/game/content/enemies.ts`: assign black-suit visual variants to ranged human enemies.
- Modify `src/game/content/actorParts.test.ts` only if broad head typing needs an expectation update.
- Modify `src/phaser/view/scifiAssets.ts`: import approved PNG sheets and register their Phaser spritesheets and animations.
- Modify `src/phaser/view/drawActors.ts`: select black-suit textures for human ranged enemies when approved assets exist.
- Create `src/assets/game/actors/enemy-black-suit-human/manifest.json`: durable index for approved generated files.
- Create `src/assets/game/actors/enemy-black-suit-human/<head>/<weapon>/<animation>.png`: approved generated sheets.
- Use ignored staging folders under `output/asset-pipeline/actors/enemy-black-suit-human/`.

## Task 1: Asset Manifest API

**Files:**
- Create: `src/game/content/blackSuitEnemyAssets.ts`
- Create: `src/game/content/blackSuitEnemyAssets.test.ts`

- [ ] **Step 1: Write the failing manifest tests**

```ts
import { describe, expect, it } from "vitest";
import {
  blackSuitEnemyAnimations,
  blackSuitEnemyHeads,
  blackSuitEnemyWeapons,
  getBlackSuitEnemySheet,
  listBlackSuitEnemySheets,
} from "./blackSuitEnemyAssets";

describe("black suit enemy asset manifest", () => {
  it("defines five heads, two weapons, and six animations", () => {
    expect(blackSuitEnemyHeads).toEqual([
      "head-short-dark",
      "head-bald",
      "head-gray",
      "head-light-brown",
      "head-dark-glasses",
    ]);
    expect(blackSuitEnemyWeapons).toEqual(["pistol", "rifle"]);
    expect(blackSuitEnemyAnimations).toEqual(["idle", "walk", "run", "shoot", "reload", "death"]);
  });

  it("builds stable source asset paths for approved sheets", () => {
    expect(getBlackSuitEnemySheet("head-short-dark", "pistol", "idle")).toMatchObject({
      textureKey: "enemy-black-suit-human-head-short-dark-pistol-idle",
      animationKey: "enemy-black-suit-human-head-short-dark-pistol-idle",
      path: "src/assets/game/actors/enemy-black-suit-human/head-short-dark/pistol/idle.png",
      frameWidth: 48,
      frameHeight: 48,
      frames: 4,
    });
  });

  it("lists every approved sheet combination exactly once", () => {
    const sheets = listBlackSuitEnemySheets();
    expect(sheets).toHaveLength(60);
    expect(new Set(sheets.map((sheet) => sheet.textureKey)).size).toBe(60);
  });
});
```

- [ ] **Step 2: Run the failing tests**

Run: `npm test -- src/game/content/blackSuitEnemyAssets.test.ts`

Expected: FAIL because `blackSuitEnemyAssets.ts` does not exist.

- [ ] **Step 3: Implement the manifest helper**

```ts
export const blackSuitEnemyHeads = [
  "head-short-dark",
  "head-bald",
  "head-gray",
  "head-light-brown",
  "head-dark-glasses",
] as const;

export const blackSuitEnemyWeapons = ["pistol", "rifle"] as const;
export const blackSuitEnemyAnimations = ["idle", "walk", "run", "shoot", "reload", "death"] as const;

export type BlackSuitEnemyHead = (typeof blackSuitEnemyHeads)[number];
export type BlackSuitEnemyWeapon = (typeof blackSuitEnemyWeapons)[number];
export type BlackSuitEnemyAnimation = (typeof blackSuitEnemyAnimations)[number];

export type BlackSuitEnemySheet = {
  head: BlackSuitEnemyHead;
  weapon: BlackSuitEnemyWeapon;
  animation: BlackSuitEnemyAnimation;
  textureKey: string;
  animationKey: string;
  path: string;
  frameWidth: number;
  frameHeight: number;
  frames: number;
  frameRate: number;
  repeat: number;
};

const frameCounts: Record<BlackSuitEnemyAnimation, number> = {
  idle: 4,
  walk: 6,
  run: 6,
  shoot: 2,
  reload: 4,
  death: 4,
};

const frameRates: Record<BlackSuitEnemyAnimation, number> = {
  idle: 7,
  walk: 11,
  run: 14,
  shoot: 18,
  reload: 12,
  death: 8,
};

const repeatingAnimations = new Set<BlackSuitEnemyAnimation>(["idle", "walk", "run"]);

export const getBlackSuitEnemySheet = (
  head: BlackSuitEnemyHead,
  weapon: BlackSuitEnemyWeapon,
  animation: BlackSuitEnemyAnimation,
): BlackSuitEnemySheet => {
  const key = `enemy-black-suit-human-${head}-${weapon}-${animation}`;
  return {
    head,
    weapon,
    animation,
    textureKey: key,
    animationKey: key,
    path: `src/assets/game/actors/enemy-black-suit-human/${head}/${weapon}/${animation}.png`,
    frameWidth: 48,
    frameHeight: 48,
    frames: frameCounts[animation],
    frameRate: frameRates[animation],
    repeat: repeatingAnimations.has(animation) ? -1 : 0,
  };
};

export const listBlackSuitEnemySheets = (): BlackSuitEnemySheet[] =>
  blackSuitEnemyHeads.flatMap((head) =>
    blackSuitEnemyWeapons.flatMap((weapon) =>
      blackSuitEnemyAnimations.map((animation) => getBlackSuitEnemySheet(head, weapon, animation)),
    ),
  );
```

- [ ] **Step 4: Run the tests**

Run: `npm test -- src/game/content/blackSuitEnemyAssets.test.ts`

Expected: PASS.

## Task 2: Enemy Visual Variant Model

**Files:**
- Modify: `src/game/simulation/types.ts`
- Modify: `src/game/content/enemies.ts`
- Create or modify: `src/game/content/enemies.test.ts`

- [ ] **Step 1: Write the failing enemy visual test**

```ts
import { describe, expect, it } from "vitest";
import { createEnemies } from "./enemies";
import { blackSuitEnemyHeads } from "./blackSuitEnemyAssets";

describe("enemy content visuals", () => {
  it("assigns reusable black-suit head variants to ranged human enemies", () => {
    const humanRanged = createEnemies().filter(
      (enemy) => enemy.kind === "ranged" && enemy.head === "human",
    );

    expect(humanRanged.length).toBeGreaterThan(0);
    for (const enemy of humanRanged) {
      expect(enemy.visualPack).toBe("enemy-black-suit-human");
      expect(blackSuitEnemyHeads).toContain(enemy.headVariant);
    }
  });

  it("does not assign black-suit human variants to CRT-headed enemies", () => {
    const crtEnemies = createEnemies().filter((enemy) => enemy.head === "crt");
    expect(crtEnemies.length).toBeGreaterThan(0);
    for (const enemy of crtEnemies) {
      expect(enemy.visualPack).toBeUndefined();
      expect(enemy.headVariant).toBeUndefined();
    }
  });
});
```

- [ ] **Step 2: Run the failing test**

Run: `npm test -- src/game/content/enemies.test.ts`

Expected: FAIL because `visualPack` and `headVariant` do not exist.

- [ ] **Step 3: Add visual metadata types**

In `src/game/simulation/types.ts`, import the type:

```ts
import type { BlackSuitEnemyHead } from "../content/blackSuitEnemyAssets";
```

Then extend `EnemyState`:

```ts
export type EnemyState = ActorBase & {
  kind: EnemyKind;
  archetype: ActorArchetype;
  head: HeadType;
  headVariant?: BlackSuitEnemyHead;
  visualPack?: "enemy-black-suit-human";
  weaponId?: string;
  attackCooldownMs: number;
  animation: ActorAnimationState;
};
```

- [ ] **Step 4: Assign variants in enemy content**

In `src/game/content/enemies.ts`, add `visualPack: "enemy-black-suit-human"` and a stable `headVariant` to each ranged human enemy. Use different variants across the existing humans:

```ts
visualPack: "enemy-black-suit-human",
headVariant: "head-short-dark",
```

Use `head-bald` and `head-dark-glasses` for the other existing ranged human enemies.

- [ ] **Step 5: Run the test**

Run: `npm test -- src/game/content/enemies.test.ts`

Expected: PASS.

## Task 3: Replicate Generation and Approved Asset Layout

**Files:**
- Create folders under: `output/asset-pipeline/actors/enemy-black-suit-human/`
- Create: `src/assets/game/actors/enemy-black-suit-human/manifest.json`
- Create: approved PNG sheets under `src/assets/game/actors/enemy-black-suit-human/`

- [ ] **Step 1: Prepare staging directories**

Run:

```bash
mkdir -p output/asset-pipeline/actors/enemy-black-suit-human/{references,prompts,raw-replicate,normalized,previews}
mkdir -p src/assets/game/actors/enemy-black-suit-human
```

Expected: directories exist. `output/` remains ignored.

- [ ] **Step 2: Write prompt files**

Create prompt files under `output/asset-pipeline/actors/enemy-black-suit-human/prompts/` for the first approved vertical slice:

- `head-short-dark-pistol-idle.md`
- `head-short-dark-pistol-run.md`
- `head-short-dark-pistol-shoot.md`
- `head-short-dark-pistol-death.md`
- `head-short-dark-rifle-idle.md`
- `head-dark-glasses-rifle-idle.md`

Each prompt must specify strict overhead view, transparent PNG, exact horizontal row layout, black suit, white shirt, tie, and no scenery or labels.

- [ ] **Step 3: Generate the first approved vertical slice**

Use the Replicate helper with local player sheets as references. Example:

```bash
/Users/ilyagmirin/PycharmProjects/codex_skills/skills/engineering/replicate-nano-banana-pro-http/scripts/run-image.sh \
  --prompt "$(cat output/asset-pipeline/actors/enemy-black-suit-human/prompts/head-short-dark-pistol-idle.md)" \
  --image-input src/assets/vendor/valentint-scifi/Player/Idle/player_idle_pistol_Sheet.png \
  --output output/asset-pipeline/actors/enemy-black-suit-human/raw-replicate/head-short-dark-pistol-idle.png \
  --aspect-ratio 4:1 \
  --resolution 2K \
  --output-format png \
  --safety-filter-level block_only_high \
  --allow-fallback-model true
```

Expected: command prints `prediction_id=...` and `output_file=...`.

- [ ] **Step 4: Normalize or approve generated sheets**

If a generated file is not exactly a 48px-high horizontal sheet with the expected frame count, normalize it into fixed 48x48 frames before moving it into `src/assets/game/actors/enemy-black-suit-human/<head>/<weapon>/<animation>.png`.

If normalization cannot produce a readable 48px sheet, keep the file in `output/` and regenerate with a tighter prompt.

- [ ] **Step 5: Create `manifest.json`**

Write `src/assets/game/actors/enemy-black-suit-human/manifest.json` with:

```json
{
  "actorId": "enemy-black-suit-human",
  "label": "Black Suit Human Enemy",
  "frameWidth": 48,
  "frameHeight": 48,
  "heads": [
    { "id": "head-short-dark", "label": "Short dark hair" },
    { "id": "head-bald", "label": "Bald" },
    { "id": "head-gray", "label": "Gray hair" },
    { "id": "head-light-brown", "label": "Light brown hair" },
    { "id": "head-dark-glasses", "label": "Dark glasses" }
  ],
  "weapons": ["pistol", "rifle"],
  "animations": {
    "idle": { "frames": 4, "frameRate": 7, "repeat": -1 },
    "walk": { "frames": 6, "frameRate": 11, "repeat": -1 },
    "run": { "frames": 6, "frameRate": 14, "repeat": -1 },
    "shoot": { "frames": 2, "frameRate": 18, "repeat": 0 },
    "reload": { "frames": 4, "frameRate": 12, "repeat": 0 },
    "death": { "frames": 4, "frameRate": 8, "repeat": 0 }
  },
  "sourceModel": "google/nano-banana-pro",
  "generatedOn": "2026-05-10",
  "approvedSheets": []
}
```

Add every approved sheet to `approvedSheets` with `head`, `weapon`, `animation`, `path`, and `predictionId`.

## Task 4: Phaser Asset Registration

**Files:**
- Modify: `src/phaser/view/scifiAssets.ts`
- Modify: `src/phaser/view/drawActors.ts`
- Create: `src/phaser/view/drawActors.test.ts` if a pure helper is extracted

- [ ] **Step 1: Write a failing texture-selection test**

Extract a pure helper from `drawActors.ts`:

```ts
export const enemyTextureKeyFor = (enemy: Pick<EnemyState, "archetype" | "visualPack" | "headVariant" | "animation">): string => {
  if (enemy.visualPack === "enemy-black-suit-human" && enemy.headVariant) {
    const weapon = enemy.animation.weaponKind === "rifle" ? "rifle" : "pistol";
    return `enemy-black-suit-human-${enemy.headVariant}-${weapon}-idle`;
  }
  if (enemy.archetype === "monster_melee") {
    return "scifi-enemy-run";
  }
  return "scifi-enemy-idle";
};
```

Test:

```ts
import { describe, expect, it } from "vitest";
import { enemyTextureKeyFor } from "./drawActors";

describe("enemyTextureKeyFor", () => {
  it("selects black-suit pistol idle texture for black-suit human enemies", () => {
    expect(
      enemyTextureKeyFor({
        archetype: "humanoid_ranged",
        visualPack: "enemy-black-suit-human",
        headVariant: "head-short-dark",
        animation: { intent: "idle", weaponKind: "pistol", moving: false, speed: 0, lastShotMs: 0 },
      }),
    ).toBe("enemy-black-suit-human-head-short-dark-pistol-idle");
  });
});
```

- [ ] **Step 2: Run failing test**

Run: `npm test -- src/phaser/view/drawActors.test.ts`

Expected: FAIL until the helper is exported and implemented.

- [ ] **Step 3: Register approved image imports**

In `src/phaser/view/scifiAssets.ts`, import only approved PNG files. For each approved file:

```ts
import blackSuitShortDarkPistolIdleUrl from "../../assets/game/actors/enemy-black-suit-human/head-short-dark/pistol/idle.png?url";
```

Add matching `spriteSheets` entries with the texture key from `blackSuitEnemyAssets.ts` and `frameWidth: 48`, `frameHeight: 48`.

- [ ] **Step 4: Register animations**

In `ensureScifiAnimations`, create animations only for approved sheets. Example:

```ts
createAnimation(scene, "enemy-black-suit-human-head-short-dark-pistol-idle", "enemy-black-suit-human-head-short-dark-pistol-idle", 4, 7);
```

- [ ] **Step 5: Use black-suit animation keys**

Update `animationFor` so black-suit enemies use the same animation vocabulary:

```ts
if (actor.visualPack === "enemy-black-suit-human" && actor.headVariant) {
  const weapon = actor.animation?.weaponKind === "rifle" ? "rifle" : "pistol";
  const action = !actor.alive ? "death" : shooting ? "shoot" : moving ? "run" : "idle";
  return `enemy-black-suit-human-${actor.headVariant}-${weapon}-${action}`;
}
```

If an action sheet is not approved yet, fall back to the closest approved idle sheet instead of playing a missing animation.

- [ ] **Step 6: Run the texture-selection test**

Run: `npm test -- src/phaser/view/drawActors.test.ts`

Expected: PASS.

## Task 5: Verification

**Files:**
- No new files unless verification screenshots are written under ignored `output/playwright/`.

- [ ] **Step 1: Run content and view tests**

Run:

```bash
npm test -- src/game/content/blackSuitEnemyAssets.test.ts src/game/content/enemies.test.ts src/phaser/view/drawActors.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run full tests**

Run: `npm test`

Expected: PASS, unless unrelated pre-existing dirty work has introduced failures. If failures occur, identify whether they are from this change or pre-existing files.

- [ ] **Step 3: Run production build**

Run: `npm run build`

Expected: PASS.

- [ ] **Step 4: Browser smoke test**

Run the Vite dev server and inspect the game in the browser. Confirm at least one pistol and one rifle black-suit human enemy appears with a generated sheet and no blank frames.

- [ ] **Step 5: Commit implementation**

Stage only files from this feature:

```bash
git add docs/superpowers/plans/2026-05-10-black-suit-human-enemies-implementation.md \
  src/game/content/blackSuitEnemyAssets.ts \
  src/game/content/blackSuitEnemyAssets.test.ts \
  src/game/content/enemies.ts \
  src/game/content/enemies.test.ts \
  src/game/simulation/types.ts \
  src/phaser/view/drawActors.ts \
  src/phaser/view/drawActors.test.ts \
  src/phaser/view/scifiAssets.ts \
  src/assets/game/actors/enemy-black-suit-human
git commit -m "Add black suit human enemy assets"
```

Expected: commit includes the plan, manifest, approved PNG assets, and code integration only.

