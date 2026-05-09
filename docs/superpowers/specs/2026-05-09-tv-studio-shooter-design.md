# TV Studio Shooter Design

## Goal

Build a first playable browser-game slice inspired by top-down neon room-clear shooters and the provided TV-studio references. The target is a 2-3 minute arena prototype that verifies movement, mouse aiming, shooting, enemy pressure, score, restart flow, and the visual mood before expanding into more mechanics.

The game should feel like a compact, violent TV-studio shootout from the late 1990s to early 2000s: dark broadcast rooms, blue and magenta lighting, green-screen accents, CRT monitors, bulky cameras, studio lights, cables, server panels, news desks, blood decals, shell casings, and a black pixel HUD with pink score text. The result should be visually original and must not reuse copyrighted game assets.

The camera view is strictly top-down, matching the room-clear readability of classic overhead action games. Do not use angled isometric characters, side-view props, or perspective camera tilt in the first slice.

## References

- `/Users/ilyagmirin/Downloads/replicate-prediction-3acrj365jdrmw0cy08vbyc9w7m.jpeg`
- `/Users/ilyagmirin/Downloads/replicate-prediction-3acrj365jdrmw0cy08vbyc9w7m (1).jpeg`
- `/Users/ilyagmirin/Downloads/replicate-prediction-k50tnff449rmy0cy1s9aa8m7mm.jpeg`
- `/Users/ilyagmirin/Downloads/replicate-prediction-51qwra49knrmy0cy1s99p9e6nr.jpeg`
- `/Users/ilyagmirin/Downloads/Screen_Shot_2014-06-13_at_9.01.36_AM.0.0.avif`
- `/Users/ilyagmirin/Downloads/images (6).jpeg`
- `/Users/ilyagmirin/Downloads/MV5BM2UzZTVmYzAtZDEyNC00NTdkLTgzZWItYWY5YjEyMDkxYjkzXkEyXkFqcGc@._V1_.jpg`
- `/Users/ilyagmirin/Downloads/Hotline_Miami_Gameplay_(2012).png`

## Original-Game Visual Delta Notes

The current target is not a polished TV-studio illustration; it is a combat map with a violent, readable overhead language. The original-game references differ from the previous version in these seven ways, and future visual work should preserve all of them:

1. **Camera and perspective:** rooms, bodies, weapons, floors, and props read as a strict orthographic floor plan. Avoid side-view faces, isometric furniture, and perspective-heavy props.
2. **Palette:** use aggressive red, magenta, acid yellow, dirty white, black, and cyan accents. Avoid a calm blue-gray studio palette as the dominant look.
3. **Dirt, blood, and chaos:** add blood pools, trails, bodies, broken glass, dropped weapons, shell casings, and debris so the level looks like a fight already happened.
4. **Level structure:** build rooms, corridors, door gaps, wall segments, and sight-line blockers. A single open studio should be avoided when aiming for the room-clear feel.
5. **Gameplay readability:** interactive entities must pop first: player, enemies, guns, bodies, doors, and walls. Decorative studio detail should not bury actors or bullets.
6. **Actor silhouettes:** characters should be rougher, flatter, and more icon-like from above, with strong dark outlines and clear weapon direction.
7. **HUD attitude:** keep black panels and pink-white pixel text, but make them chunkier, dirtier, and closer to the reference proportions rather than clean UI cards.

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

The player character wears a suit and has a bulky 1990s CRT television for a head. The silhouette should read from directly above: suit body, clear shoulders, TV-box head, and one visible weapon direction.

The player always has exactly one weapon in hand, matching the room-clear shooter fantasy. There is no inventory. The first slice starts the player with one configured weapon, such as a pistol or shotgun.

The first slice has no manual reload key. Use a simple weapon model with a visible loaded-round count and an automatic short reload delay when the magazine is empty. This keeps the first control scheme focused on movement, aim, and firing while preserving the ammo pressure shown in the references.

Future weapon pickup should follow a replacement model: picking up a new weapon swaps the current weapon and drops the old one. The first slice only needs the equipped-weapon abstraction and ammo display.

## Combat

Combat should be fast, readable, and lethal. The player dies from one or two hits. Enemies die quickly. Shots need clear feedback: muzzle flash, bullet trail or projectile readability, blood impact, shell casing or debris, short hit-stop, and modest screen shake.

Enemy set:

- Ranged enemies: keep distance when possible, aim at the player, and fire when line of sight is available.
- Rush enemies: close distance quickly and punish standing still.

Enemy heads can vary: some enemies have normal human heads, and some have CRT television heads. This variation should support the TV-studio fantasy without making enemy type readability ambiguous. Enemy weapon and movement behavior must remain readable from the body, weapon pose, color accent, or movement pattern.

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

- Player in a suit with a bulky 1990s CRT television head and a clear weapon silhouette
- Ranged enemies with either normal human heads or CRT television heads
- Rush enemies with either normal human heads or CRT television heads, plus a distinct movement/body silhouette
- News desks and monitor walls
- CRT monitor walls, bulky cameras, tripods, studio lights, cables, control panels, server racks, green screen
- Blood decals, bullet impacts, casing/debris

If the procedural assets do not reach the intended mood, use `replicate-nano-banana-2-http` to generate bitmap reference sheets or sprite textures from the provided images. When using Replicate, use the raw HTTP helper workflow, pass the local reference images as `--image-input`, keep fields inside the published `google/nano-banana-2` schema, and download outputs immediately.

## Visual QA Requirement

Visual QA is mandatory before calling the slice done. The implementation pass must run the game locally, open it in a browser, capture screenshots, and compare them against the references for:

- Overall TV-studio mood and top-down readability
- Strict overhead camera: no accidental isometric or side-view character presentation
- Late 1990s to early 2000s broadcast-tech styling, including CRTs and bulky equipment
- Player reads as a suited character with a CRT television head
- Enemy head variation reads as intentional: normal heads and CRT television heads both appear without hiding enemy behavior
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
