# Black Suit Human Enemies Design

## Goal

Create a new human enemy asset pack by redrawing the current player-style assets into black-suited armed men. The enemies should read as professional human guards or agents: black suit, white shirt, tie, strict top-down silhouette, and clear pistol or rifle aim.

This is a design-only spec. Implementation should happen after a separate implementation plan is approved.

## Selected Approach

Use a full generated enemy sprite pack based on the player sheets.

This approach was selected over modular runtime assembly and quick recoloring because it gives the strongest visual match to the existing player animation set. It also keeps Phaser integration simple: each enemy state can use complete sprite sheets first, while the existing actor part catalog can remain available for later modular work.

## Visual Direction

The enemy body should look like a human version of the suited player:

- male human body
- black business suit
- white dress shirt
- dark tie
- strict overhead view
- readable shoulders, head, arms, and weapon direction at 48px game scale
- transparent background
- no scenery, labels, UI, poster framing, or angled perspective

The result should match the existing Valentint sci-fi pack's practical top-down scale more than a high-detail illustration. Clean silhouette and animation consistency matter more than facial detail.

## Head Variants

Generate five compatible human head variants that share the same body proportions and anchor point:

- short dark hair
- bald
- gray hair
- close-cropped blond or light brown hair
- security-agent face with dark glasses

Each head variant should be usable with both pistol and rifle sheets. Head differences should be readable in motion but subtle enough that enemy behavior remains readable from weapon, movement, and encounter placement.

## Weapon Coverage

The new enemies must support two weapon families:

- pistol
- rifle

Both weapon families should preserve the player's current animation vocabulary where possible:

- `idle`
- `walk`
- `run`
- `shoot`
- `reload`
- `death`

If generation budget or quality becomes a constraint, implementation may prioritize `idle`, `walk`, `run`, `shoot`, and `death` first, then add `reload` after the in-game result is verified.

## Generation Workflow

Use the `replicate-nano-banana-pro-http` skill and its `scripts/run-image.sh` helper.

Reference inputs should include the existing player sprite sheets for the same weapon family and animation type. Requests should ask for full strips at once, not individual frames, so proportions and anchors stay stable across a sheet.

Generation settings:

- model: `google/nano-banana-pro`
- `output_format`: `png`
- `allow_fallback_model`: `true`
- transparent background requested in the prompt
- immediate local download of every output

Outputs should go into a generated asset staging folder first, then only approved and normalized files should be wired into `src`.

## Asset Storage

The project should separate third-party packs, generated experiments, and approved first-party game assets.

Current source-controlled vendor packs belong under:

```text
src/assets/vendor/<vendor-or-pack-name>/
```

Generated experiments and raw Replicate downloads should stay out of source control under `output/`, which is already ignored:

```text
output/asset-pipeline/actors/enemy-black-suit-human/
  references/
  prompts/
  raw-replicate/
  normalized/
  previews/
```

Only approved, game-ready generated assets should move into a source-controlled first-party folder:

```text
src/assets/game/actors/enemy-black-suit-human/
  manifest.json
  head-short-dark/
    pistol/
      idle.png
      walk.png
      run.png
      shoot.png
      reload.png
      death.png
    rifle/
      idle.png
      walk.png
      run.png
      shoot.png
      reload.png
      death.png
  head-bald/
  head-gray/
  head-light-brown/
  head-dark-glasses/
```

Do not put final game assets in `src/assets/generated/`; that directory is currently ignored and is better treated as scratch or legacy generated output. New committed generated art should use `src/assets/game/`.

### Naming Rules

Use stable lowercase ids in paths and metadata:

- actor id: `enemy-black-suit-human`
- head ids: `head-short-dark`, `head-bald`, `head-gray`, `head-light-brown`, `head-dark-glasses`
- weapon ids: `pistol`, `rifle`
- animation ids: `idle`, `walk`, `run`, `shoot`, `reload`, `death`

File paths should encode exactly one actor, head, weapon, and animation. Avoid names like `final`, `new`, `v2`, or `best` in committed files. If a replacement is needed, replace the approved file and record the source prediction in `manifest.json`.

### Manifest

Each approved actor pack should include a small `manifest.json` that records:

- actor id and display label
- frame size and frame count for each animation
- head variant ids and labels
- weapon families covered
- source reference files
- Replicate prediction ids for approved images
- generation date
- short prompt label or prompt file path

The manifest should be the durable index. Phaser code can still import the PNG files directly, but humans should be able to inspect the folder and know what is approved, what each file represents, and which generated run produced it.

## Integration Design

Initial integration should use complete Phaser sprite sheets rather than runtime body/head composition.

Expected source changes:

- add generated black-suit enemy sheet imports in `src/phaser/view/scifiAssets.ts`
- register Phaser spritesheets and animations for pistol and rifle variants
- update `src/phaser/view/drawActors.ts` so ranged human enemies can select the new black-suit textures
- extend enemy visual metadata only as much as needed to choose head variant and weapon family
- update tests around actor heads, enemy creation, or animation selection if the type model changes

The existing `src/game/content/actorParts.ts` catalog should not be deleted. It can be expanded later if the project moves to fully modular actors.

## Data Model

The current `HeadType` only distinguishes `crt` and `human`. This pack needs more visual variants without turning every head into a new behavior type.

Preferred model:

- keep enemy behavior type separate from visual variant
- add a lightweight visual/head variant field for human enemies if needed
- preserve `head: "crt" | "human"` for broad gameplay category unless a smaller type change is cleaner during implementation

The implementation plan should inspect the current tests before choosing the exact type shape.

## Quality Gates

An approved result must pass these checks:

- strict top-down viewpoint
- black suit, white shirt, and tie remain visible at game scale
- body proportions do not drift between frames in the same sheet
- pistol and rifle silhouettes are distinct
- heads align consistently on the same body
- transparent background is preserved
- Phaser animations play without blank frames
- generated assets do not introduce unrelated scenery or text

## Verification

Implementation should verify with:

- `npm test`
- `npm run build`
- local browser smoke test of a combat room containing pistol and rifle black-suit enemies
- screenshot review at normal game zoom

The visual check should confirm that the new enemies read as human black-suit enemies and are not confused with the TV-headed player.
