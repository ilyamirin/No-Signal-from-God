# Valentint Asset Pack Full-Power Design

Date: 2026-05-10

## Goal

Turn the Valentint Sci-Fi Top-Down Shooter asset pack from a visual skin into the content foundation of the game. The game should use the pack's player, enemy, scientist, weapon, prop, tile, projectile, particle, decal, and door assets through explicit gameplay systems rather than one-off drawing code.

The direction is a full level/entity model rebuild. The current TV-studio demo remains a playable reference, but the next architecture should support richer rooms, interactive doors, weapon pickup/drop, distinct enemy archetypes, blood-heavy combat feedback, and prop categories with different movement, bullet, visibility, and sound behavior.

## Current Context

The project currently has the full `src/assets/vendor/valentint-scifi` pack committed:

- `Player`: 20 sheets for pistol/rifle idle, walk, run, shoot, punch, reload, grenade, pain, death, weapon switch, and use.
- `NPCs/Enemy`: 6 frog/monster sheets for idle, walk, run, attack, pain, and death.
- `NPCs/NPC_Scientist`: 6 humanoid NPC sheets for idle, walk, run, use, pain, and death.
- `Legs`: 9 separate legs sheets for player, enemy, and scientist.
- `Decorations`: 54 decorative or cover-like assets.
- `Objects`: 7 functional objects, including doors and bags.
- `Particles`: 6 particle sheets.
- `Decals`: 3 floor decal sheets.
- `Projectiles`: 2 projectile assets.
- `Tile`: 3 tile sheets.

The current runtime uses only a subset: basic player pistol movement/shoot/death, basic monster movement/attack/death, some floors, and selected props. It does not yet use the rifle branch, reload, grenade, pain, weapon switch, scientist NPC, separate legs, projectile sprites, most particles, most decals, tile transitions, or the full prop catalog.

## Design Choice

Use approach C: rebuild around a level/entity model.

This is the right direction because the desired behavior now crosses rendering, simulation, input, collision, bullets, AI, and asset selection. Trying to patch these features into `drawArena` and the current static rectangle obstacle model would make doors, dropped weapons, prop classes, and death knockback fragile. A real entity model gives each object type a clear place to live.

## Entity Model

Introduce a single level entity layer. The first production shape should be simple, data-driven, and specific to this game rather than a generic ECS framework.

Entity categories:

- `ActorEntity`: player, frog/monster enemy, humanoid gunner, scientist NPC.
- `WeaponEntity`: held or dropped weapon.
- `DoorEntity`: hinged door with state and dynamic collider.
- `PropEntity`: table, chair, cabinet, plant pot, column, server rack, TV, bed, box, lamp, display, and similar world props.
- `ProjectileEntity`: bullets, grenades later.
- `FxEntity`: temporary particles such as muzzle flash, impact puff, blood splash, explosion.
- `DecalEntity`: persistent floor blood, rubbish, scorch marks, and corpse-adjacent decals.

The simulation remains the source of truth. Phaser renders entity state, plays animations, and runs tweens only for presentation where the simulation does not need exact persistence.

## Collision And Perception Classes

Replace the current binary obstacle thinking with separate channels:

- `blocksMovement`: whether actors can pass through.
- `blocksBullets`: whether bullets collide.
- `blocksVision`: whether AI/player line of sight is blocked.
- `blocksSound`: whether AI hearing is blocked or dampened.

Core prop classes:

- `softCover`: blocks movement, does not block bullets, does not block vision, does not block sound.
  Examples: tables, chairs, cabinets, low drawers, plant pots, couches, small counters.
- `hardCover`: blocks movement, blocks bullets, blocks vision, blocks or strongly dampens sound.
  Examples: columns, solid walls, heavy machinery, thick server stacks, closed heavy doors.
- `visualDecor`: does not block movement, bullets, vision, or sound.
  Examples: blood decals, rubbish, small papers, tiny floor details.
- `interactivePickup`: does not block movement or bullets unless explicitly marked.
  Examples: health bag, weapon bag, dropped weapons.
- `thinBarrier`: blocks movement and bullets but may not fully block sound.
  Examples: closed light doors, glass panels once added.

This distinction is required for the user's examples:

- Tables, chairs, cabinets, and plant pots are visible/audible/shoot-through obstacles but cannot be walked through.
- Columns are solid obstacles: cannot walk through them and bullets do not pass through.

## Doors

Doors are first-class entities.

Door state:

- `closed`
- `opening`
- `open`
- `closing`
- later: `jammed`, `broken`, `kicked`

Door data:

- position
- size
- hinge point
- hinge side
- current angle
- target angle
- open speed
- material class
- current collider

Rules:

- A closed door blocks movement and bullets.
- Closed doors block or dampen sound and vision according to material.
- Door collision is anchored at the hinge. The door rotates as a segment/rect around that hinge.
- During opening/closing, collision follows the current door angle.
- An open door only blocks movement/bullets where the physical open panel currently is.
- Bullets hitting a closed door spawn impact FX and stop.
- Doors can be interacted with by the player and later by humanoid enemies.
- Frog/monster enemies do not shoot; they may path around doors or later bash/kick doors if designed.

## Weapons

The player can hold exactly one weapon.

Weapon states:

- `held`
- `dropped`
- `flyingDrop`
- later: `empty`, `jammed`

Pickup rules:

- Press `E` or `У` near a dropped weapon to pick it up.
- The new weapon becomes the player's held weapon.
- The old held weapon is dropped into the world.
- The old weapon does not simply appear on the floor; it receives outward impulse, spin, and friction so it visibly flies/skids aside.
- The HUD shows only the currently held weapon and its ammo.

Weapon animation rules:

- Pistol uses pistol sheets.
- Rifle uses rifle sheets.
- Switching weapons plays `WeaponSwitch`.
- Reloading plays `Reload`.
- Shooting plays `Shoot`.
- Empty or reserve ammo states should be reflected in HUD and fire behavior.

## Actor Archetypes

Actor archetypes must encode capability, not just texture.

Player:

- humanoid
- can hold exactly one weapon
- can pick up/drop weapons
- can shoot, reload, switch, use, punch later, throw grenade later

Frog/monster enemy:

- non-humanoid
- melee only
- never shoots
- uses enemy idle/walk/run/attack/pain/death sheets
- can cause contact damage or melee attack damage

Humanoid gunner:

- humanoid
- can hold weapon
- can shoot
- should use player/scientist-like humanoid sheets or future generated humanoid gunner sheets
- required for ranged enemies because frog/monster enemies cannot shoot

Scientist NPC:

- humanoid non-combatant by default
- can run, use, take pain, die
- can later become rescue target, civilian, witness, or panic actor

## Animation Graph

The renderer should use an explicit animation state produced from gameplay state.

Animation states:

- `idle`
- `walk`
- `run`
- `shoot`
- `reload`
- `pain`
- `death`
- `weaponSwitch`
- `use`
- `punch`
- `grenade`

State rules:

- Death overrides everything.
- Pain briefly overrides movement unless death occurs.
- Shoot/reload/switch/use play as action windows.
- Movement chooses walk/run according to speed.
- Weapon branch selects pistol/rifle sheets.
- Monster and humanoid actors have separate animation graphs because their capabilities differ.

Separate legs sheets should not be forced into the first implementation if full-body sheets read better. They remain available for later experiments with modular animation.

## Blood, Impact, And Death Feedback

Combat must become bloodier and more physical.

Hit rules:

- Bullet impact on actor spawns blood splash in the bullet direction.
- Monster hits use green/monster blood particles.
- Humanoid/player hits use red/player blood particles.
- Pain animation plays if the actor survives and is eligible.

Death rules:

- Fatal hit creates death impulse opposite the incoming bullet direction.
- Enemy body slides/flies briefly in that direction with friction.
- Death animation plays during or immediately after the impulse.
- Blood burst and floor decals spawn along the impulse direction.
- Corpse state remains for the level.
- More floor blood should accumulate than in the current demo.

World impact rules:

- Bullets hitting doors, hard cover, columns, walls, or solid props spawn bullet puff/impact FX.
- Bullets passing through soft cover do not stop; optional debris can be added later.

## Prop Catalog

Create a data catalog for all pack props. Each prop should define:

- asset key and frame dimensions
- default scale and origin
- category
- collision channels
- z/depth behavior
- optional interaction
- optional break/death frames
- room themes where it fits

Initial prop categories:

- `softCover`: tables, chairs, cabinets, couches, plant pots, small drawers.
- `hardCover`: columns, walls, heavy server blocks, heavy machinery.
- `door`: normal and heavy doors.
- `pickup`: health bag, weapon bag, dropped weapons.
- `animatedScreen`: TV, display, computer.
- `light`: wall lamp, hospital light, lamps.
- `medical`: hospital beds, IV, surgery bed, instruments.
- `lab`: lab device, lab glass, microscope.
- `office`: desks, chairs, keyboard/mouse, printer.
- `kitchen`: cafeteria, stove, fridge, microwave, sink, kitchen items.
- `toilet`: toilet, toilet doors, paper, wall, table.
- `decorOnly`: rubbish, tiny floor details, remote, tablet, pencil-like objects.

## Room Themes

Use theme-driven room dressing so all asset groups can appear naturally.

Initial themes:

- `tvStudio`: TV screens, desks, cameras, lights, cables, green screen, control panels.
- `lab`: lab device, glass, microscope, computer, shelves.
- `medical`: hospital bed, IV, surgery bed, hospital lights.
- `server`: computers, server-like props, heavy cover, displays.
- `office`: tables, chairs, printer, keyboard/mouse, plants.
- `storage`: barrels, boxes, trash cans, weapon/health bags.
- `kitchen`: cafeteria, fridge, microwave, stove, sink.
- `bathroom`: toilet set, toilet door, paper, sink.

The current starter scene can remain TV-studio-like but should begin mixing lab/server rooms because this pack has stronger sci-fi/lab support than broadcast-studio support.

## Data Flow

Input:

- WASD movement.
- Mouse aim.
- Left click shoot.
- `E` or `У` interact/pick up/open.

Simulation:

- Reads input.
- Updates actors, weapons, doors, projectiles, props, FX, decals.
- Resolves movement collision by movement channel.
- Resolves bullets by bullet channel.
- Resolves line of sight by vision channel.
- Resolves future sound alerts by sound channel.

Rendering:

- Loads asset catalog.
- Instantiates sprites for entities.
- Plays animation from entity animation state.
- Renders dropped weapon spin/skid.
- Renders door angle from door state.
- Renders particles and decals from FX/decal entities.

HUD:

- Shows current weapon only.
- Shows ammo, reserve, reload state.
- Shows objective/enemy count.
- Later shows interact prompt near dropped weapon or door.

## Implementation Phases

Phase 1: Catalog and entity model

- Add data catalogs for assets, actor archetypes, weapon definitions, prop definitions, and door definitions.
- Add entity types for actors, dropped weapons, doors, props, projectiles, FX, and decals.
- Keep current scene layout working while introducing the new model.

Phase 2: Weapon pickup/drop

- Add dropped weapons to simulation.
- Add `E` and `У` interaction.
- Enforce one held weapon.
- Add old weapon throw/skid/spin on pickup.
- Render dropped weapon sprites.

Phase 3: Actor archetypes and animation graph

- Split frog/monster melee from humanoid ranged.
- Add humanoid gunner archetype.
- Add explicit animation state.
- Wire pistol/rifle, reload, pain, death, switch, and use sheets.

Phase 4: Doors

- Add hinged door entities.
- Add open/close interaction.
- Add dynamic door collision.
- Make closed doors stop bullets.
- Spawn impact FX when bullets hit doors.

Phase 5: Blood and projectile FX

- Convert bullets/projectiles to sprite-backed render.
- Add bullet puff, blood splash, blood death, floor decals.
- Add death knockback opposite bullet direction.
- Tune amount of blood upward.

Phase 6: Prop catalog and room themes

- Classify all props by collision/perception channels.
- Replace one-off set dressing with theme-based placement.
- Add soft cover and hard cover behavior.
- Expand the starter scene to use more decorations and objects.

Phase 7: QA and polish

- Fullscreen browser pass at 1920x1080.
- Verify no console errors/warnings.
- Verify pickup/drop, door bullet blocking, monster melee-only, humanoid shooting, death knockback, blood, HUD, and room readability.
- Screenshot each representative state.

## Non-Goals For This Design

- No multiplayer.
- No full generic ECS framework.
- No procedural level generation yet.
- No attempt to force separate legs unless full-body animation becomes a blocker.
- No permanent decision that the game must abandon the TV-studio identity; this design only acknowledges that the new pack's strongest native theme is sci-fi/lab.

## Open Follow-Up Decisions

- Exact humanoid gunner visual source: scientist recolor, player rifle/pistol sheets, or generated custom humanoid gunner.
- Whether player remains TV-head in this asset-pack phase or temporarily uses pack player sprite.
- Whether doors can be kicked later.
- Whether soft cover should visually react to bullets even when bullets pass through.
- Whether sound propagation is implemented immediately or only reserved in the data model.
