# TV Studio Shooter Design

## Goal

Build a first playable browser-game slice inspired by top-down neon room-clear shooters and the provided TV-studio references. The target is a 2-3 minute arena prototype that verifies movement, mouse aiming, shooting, enemy pressure, score, restart flow, and the visual mood before expanding into more mechanics.

The game should feel like a compact, violent TV-studio shootout: dark broadcast rooms, blue and magenta lighting, green-screen accents, cameras, studio lights, cables, server panels, news desks, blood decals, shell casings, and a black pixel HUD with pink score text. The result should be visually original and must not reuse copyrighted game assets.

## References

- `/Users/ilyagmirin/Downloads/replicate-prediction-3acrj365jdrmw0cy08vbyc9w7m.jpeg`
- `/Users/ilyagmirin/Downloads/replicate-prediction-3acrj365jdrmw0cy08vbyc9w7m (1).jpeg`
- `/Users/ilyagmirin/Downloads/replicate-prediction-k50tnff449rmy0cy1s9aa8m7mm.jpeg`
- `/Users/ilyagmirin/Downloads/replicate-prediction-51qwra49knrmy0cy1s99p9e6nr.jpeg`

## Gameplay Scope

The first version is a single open TV-studio arena, not a multi-room level. The chosen layout is an open studio with two news desks, a central fight space, tile and carpet zones, side equipment clusters, monitor walls, cables, cameras, studio lights, control panels, and a green-screen corner.

The player objective is to clear all enemies and maximize score. All enemies are present from the start; there are no waves and no stealth system in the first slice. Death and victory should both lead to an immediate restart option so the player can replay quickly.

## Controls

- `WASD`: move
- Mouse position: aim direction
- Left mouse button: fire equipped weapon
- `R`: restart after death or victory

Kick is explicitly out of scope for the first implementation, but the input/action model must leave a clear `kick` action extension point.

## Player And Weapon Model

The player always has exactly one weapon in hand, matching the room-clear shooter fantasy. There is no inventory. The first slice starts the player with one configured weapon, such as a pistol or shotgun.

The first slice has no manual reload key. Use a simple weapon model with a visible loaded-round count and an automatic short reload delay when the magazine is empty. This keeps the first control scheme focused on movement, aim, and firing while preserving the ammo pressure shown in the references.

Future weapon pickup should follow a replacement model: picking up a new weapon swaps the current weapon and drops the old one. The first slice only needs the equipped-weapon abstraction and ammo display.

## Combat

Combat should be fast, readable, and lethal. The player dies from one or two hits. Enemies die quickly. Shots need clear feedback: muzzle flash, bullet trail or projectile readability, blood impact, shell casing or debris, short hit-stop, and modest screen shake.

Enemy set:

- Ranged enemies: keep distance when possible, aim at the player, and fire when line of sight is available.
- Rush enemies: close distance quickly and punish standing still.

The first slice uses simple enemy behavior rather than pathfinding-heavy stealth. Obstacles can block movement and line of fire, but the arena remains open enough for immediate play.

## Score And HUD

Use a DOM HUD over the Phaser canvas. HUD content:

- Score in a black top-right panel with pink pixel-style text, e.g. `31500pts`.
- Enemy counter such as `4/6 enemies`.
- Ammo for the equipped weapon.
- Death and victory overlays with restart prompt.

The HUD must not cover the main fight area or overlap canvas content in a broken way at common desktop viewports.

## Technical Architecture

Use `Phaser + TypeScript + Vite`.

Recommended structure:

```text
src/
  game/
    simulation/
      state.ts
      systems/
      rules/
    content/
      arena.ts
      enemies.ts
      weapons.ts
    input/
      actions.ts
      bindings.ts
    assets/
      manifest.ts
  phaser/
    scenes/
      BootScene.ts
      GameScene.ts
    view/
      sprites/
      fx/
      camera/
    adapters/
      sceneBridge.ts
  ui/
    hud/
```

Rules and saveable state belong in `game/simulation`, not directly inside Phaser scene update loops. Phaser scenes adapt simulation state into sprites, effects, camera, and input actions.

The bridge boundary should let the scene submit actions such as movement, aim, fire, restart, and later kick. The simulation owns health, ammo, bullet hits, enemy states, score, death, and victory.

## Visual Asset Plan

Start with procedural or code-drawn pixel-art-like assets so the prototype is playable quickly:

- Player body and weapon silhouette
- TV-head ranged enemies
- Rush enemies with a distinct silhouette
- News desks and monitor walls
- Cameras, tripods, studio lights, cables, control panels, server racks, green screen
- Blood decals, bullet impacts, casing/debris

If the procedural assets do not reach the intended mood, use `replicate-nano-banana-2-http` to generate bitmap reference sheets or sprite textures from the provided images. When using Replicate, use the raw HTTP helper workflow, pass the local reference images as `--image-input`, keep fields inside the published `google/nano-banana-2` schema, and download outputs immediately.

## Visual QA Requirement

Visual QA is mandatory before calling the slice done. The implementation pass must run the game locally, open it in a browser, capture screenshots, and compare them against the references for:

- Overall TV-studio mood and top-down readability
- No blank canvas or missing assets
- No holes in the arena floor or walls
- No broken HUD positioning or unreadable HUD text
- No obvious sprite alignment or layering errors
- No important enemies, bullets, or player state hidden under UI
- No incorrect scaling, excessive blur, or broken pixel rendering
- Game still looks coherent after blood, bullets, and enemy deaths accumulate

Use Playwright or the in-app browser where practical. Capture representative screenshots for start state, active combat, death or victory, and a resized viewport sanity check.

## Test Plan

Functional checks:

- `npm install`
- `npm run dev`
- Confirm the game boots to the arena.
- Confirm `WASD` moves the player.
- Confirm mouse aim rotates the weapon/player direction.
- Confirm left click fires the equipped weapon.
- Confirm ammo/HUD updates.
- Confirm bullets hit enemies and enemies die.
- Confirm ranged and rush enemy behaviors both appear.
- Confirm player death works.
- Confirm victory works when all enemies are cleared.
- Confirm `R` restarts after death or victory.

Visual checks:

- Capture screenshots from the browser.
- Inspect HUD, playfield composition, object layering, floor/wall fill, and reference-style mood.
- Iterate until the first screen is visually presentable, not merely functional.

## Out Of Scope For First Slice

- Multi-room level progression
- Stealth patrol and alert system
- Weapon pickup and dropping
- Kick implementation
- Final hand-authored sprite animations
- Mobile controls
- Save system
- Soundtrack and full audio pass
