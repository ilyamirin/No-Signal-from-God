# Ring TV Tower Level Design

## Goal

Replace the current default demo map with a larger, more cinematic ring-shaped TV tower level while keeping the previous reception-hub map available through a URL parameter.

The new level should feel like the broad circular observation/broadcast deck of a television tower suspended high above a stylized city. It should be almost linear by dramaturgy, but the linearity must be explained by physical in-world causes: shutters, `ON AIR` lockdowns, emergency doors, and broadcast security systems.

This is a design-only spec. Implementation should happen after a separate implementation plan is approved.

## Selected Direction

The chosen structure is **central elevator plus ring route**.

The player starts unarmed inside a tiny elevator room at the center of the tower deck. The elevator doors open into a tense but safe circular lobby. From there, only the reception/waiting area is open. The rest of the ring is progressively reached through real spaces: reception, talk-show studio, control room, backstage storage, and the final apocalypse-show studio. After the final fight, an emergency route opens back to the lobby and the player wins by entering the elevator.

The route is:

```text
START LIFT
   |
   v
ROUND ELEVATOR LOBBY
   |
   v
RECEPTION / WAITING
   |
   v
TALK-SHOW STUDIO 1
   |
   v
CONTROL ROOM / DIRECTOR ROOM
   |
   v
BACKSTAGE / PROP STORAGE
   |
   v
FINAL APOCALYPSE SHOW STUDIO
   |
   v
ROUND ELEVATOR LOBBY
   |
   v
EXIT LIFT = VICTORY
```

## Level Shape

The level should be built as an irregular circular/ring floor, not as a rectangle. The playable spaces may still be represented internally by rectangles and colliders, but the visual composition should read as a wide circular TV tower deck.

High-level pseudo-map:

```text
                         [CITY PARALLAX BELOW]

        +-------------------------------------------------------+
        |                 RING TV TOWER DECK                    |
        |                                                       |
        |        +-------------------------------------+        |
        |        |      ROUND ELEVATOR LOBBY          |        |
        |        |                                     |        |
        |        |        +-------------------+        |        |
        |        |        |    START LIFT     |        |        |
        |        |        |  hero unarmed     |        |        |
        |        |        +-------------------+        |        |
        |        +----------------+--------------------+        |
        |                         |                             |
        |                         v                             |
        |        +-------------------------------------+        |
        |        |       RECEPTION / WAITING           |        |
        |        +----------------+--------------------+        |
        |                         |                             |
        |                         v                             |
        |        +-------------------------------------+        |
        |        |        TALK-SHOW STUDIO 1           |        |
        |        +----------------+--------------------+        |
        |                         |                             |
        |                         v                             |
        |        +-------------------------------------+        |
        |        |     CONTROL ROOM / DIRECTOR ROOM    |        |
        |        +----------------+--------------------+        |
        |                         |                             |
        |                         v                             |
        |        +-------------------------------------+        |
        |        |       BACKSTAGE / PROP STORAGE      |        |
        |        +----------------+--------------------+        |
        |                         |                             |
        |                         v                             |
        |        +-------------------------------------+        |
        |        |    FINAL APOCALYPSE SHOW STUDIO     |        |
        |        +----------------+--------------------+        |
        |                         |                             |
        |                         v                             |
        |        +-------------------------------------+        |
        |        |      RETURN TO ROUND LOBBY / LIFT   |        |
        |        +-------------------------------------+        |
        |                                                       |
        +-------------------------------------------------------+
```

The layout should not fit fully on one screen. The camera should stay close enough that characters and props read clearly, with smooth follow and a subtle aim offset.

## Area Design

### Start Lift Room

The player starts in a micro-room representing the elevator cabin.

Rules:

- Hero starts without a firearm.
- Lift doors open automatically at the start.
- The room is safe.
- The player exits into the circular lobby.

### Round Elevator Lobby

This is the central hub and the final return point.

Mood:

- Safe, but tense.
- Red emergency lighting.
- Broken CRT monitor or warning display.
- Blood near a locked shutter.
- `BROADCAST LOCKDOWN` / `ON AIR` signage.
- City visible below and around the deck through panoramic edges/windows.

Initial routing:

- Reception route is open.
- Final route is blocked.
- Exit lift trigger is inactive until the finale is complete.

### Reception / Waiting Area

The reception is a safe onboarding space.

Contents:

- Sofas or couches.
- Water coolers.
- Coffee tables.
- Reception desk.
- Plants.
- Dead security guard.
- First pistol on the floor near the dead guard, picked up with `E` / `У`.
- Glass or a wide view into the first studio.

Combat:

- No live enemies in the room.
- One enemy in the first studio is visible from reception but should not attack until the player enters or otherwise engages.

### Talk-Show Studio 1

This is the first real fight and the first strong television set piece.

Contents:

- Wider studio layout, not a tiny newsroom.
- Guest couch.
- Host desk.
- Cameras.
- Studio lights.
- Cables.
- Monitors and small set dressing.

Combat role:

- First readable fight.
- Limit pressure to about two enemies.
- Use furniture and studio equipment as cover and blockers.
- Teach shooting, enemy pressure, and moving around props without making the first combat room chaotic.

### Control Room / Director Room

This area changes the rhythm after the wider studio.

Contents:

- Control desks and consoles.
- Monitor wall.
- Server racks.
- Chairs.
- Trash/cables.

Combat role:

- Narrower lanes and stronger line-of-fire control.
- At least one ranged enemy.
- One melee enemy can pressure the player out of cover.
- Rifle or ammo reward is appropriate here.

### Backstage / Prop Storage

This is the messy transition from ordinary TV production to the final apocalyptic set.

Contents:

- Fake wall panels.
- Boxes.
- Spare lights.
- Broken CRT props.
- Cables.
- Disaster-show props and fake rubble.

Combat role:

- Melee-heavy area.
- One ranged enemy may use a prop wall or storage object as cover.
- Dropped weapons and ammo can support weapon swapping.

### Final Apocalypse Show Studio

This is the visual and combat climax.

Tone:

- Satirical TV show about the end of the world.
- Also slightly ritualistic and wrong.
- It should feel like a television set that is becoming something stranger.

Contents:

- Big screens with `END IS NEAR`, `LIVE`, `PLEASE STAND BY`, or similar broadcast text.
- Red light.
- Smoke-like visual dressing if cheap enough to render.
- Round stage.
- Host desk and microphones.
- Cable/lighting circle that reads almost ritualistic.
- Cameras and fake disaster props.

Combat role:

- Final mixed fight.
- Ranged enemies around stage/screens.
- Melee monsters entering from side aisles or prop gaps.
- After final enemies are defeated, the emergency return route opens.

### Return To Lift

The game does not end immediately when the final enemy dies.

Rules:

- Final fight completion unlocks the return path.
- Player returns to the round lobby.
- Entering the now-active lift trigger sets `status = victory`.

## Level Selection

The old reception-hub level must remain available.

Introduce a level registry instead of replacing the existing content globally.

Proposed structure:

```text
src/game/content/levels/
  receptionHubLevel.ts
  ringTowerLevel.ts
  levelRegistry.ts
```

Desired URL behavior:

```text
/?level=ring-tower      -> new default ring tower level
/?level=reception-hub   -> old level
```

If no `level` parameter is provided, default to `ring-tower`.

If an unknown `level` parameter is provided, fall back to `ring-tower`.

Tests should be able to call:

```text
createInitialGameState({ levelId: "ring-tower" })
createInitialGameState({ levelId: "reception-hub" })
```

## Player Loadout

The ring tower level starts with the player unarmed.

Implementation should prefer an explicit unarmed state over making shooting silently fail in unclear ways. A low-risk option is to introduce an `unarmed` weapon state or equivalent loadout flag so existing animation and weapon code can keep stable assumptions.

Rules:

- The player starts unable to shoot.
- The first pistol is a dropped weapon in reception.
- Pickup remains `E` / `У`.
- Existing one-weapon-at-a-time behavior remains unchanged.

## Victory Condition

The old level can keep the current victory condition: all enemies dead.

The ring tower level needs a new condition:

```text
victory = final fight complete AND player enters exit lift trigger
```

This implies some level-state tracking:

- final encounter complete
- return route open
- exit lift active
- player inside exit trigger

The first implementation can keep this simple and deterministic. It does not need a full quest system.

## Parallax City Background

The tower should feel high above a city.

Use 2-3 visual layers:

```text
city layer:            moves at about 0.35x camera scroll
tower/glass ring:      moves at about 0.65x camera scroll
gameplay layer:        normal 1.0x camera scroll
```

The city background must not be photorealistic.

Required style:

- 2D game background.
- Top-down or near top-down city far below a TV tower.
- Pixel-art inspired or painted game-art style.
- Late 90s / early 00s mood.
- Roads, rooftops, parks, tiny traffic shapes.
- Muted enough not to fight gameplay.
- No drone photo look.
- No satellite photo look.
- No realistic render.

Use the user's tower/city reference as composition guidance, not as final style.

Generation workflow:

- Keep intermediate generations in ignored directories such as `art/ring-tower/`.
- Commit only final optimized assets.
- A reasonable final asset path is `src/assets/level-art/ring-tower-city.webp`.

## Asset Use

Use the Valentint sci-fi top-down shooter pack for gameplay objects wherever possible.

Relevant existing assets include:

- couch assets for reception and talk-show sets
- cooler assets for waiting area
- cameras and display props from current scene systems
- tables and desks for host/reception/control surfaces
- wall lamps and light props
- boxes and barrels for backstage
- server/control-like props and displays
- existing doors, decals, blood, bullets, and character sheets

The level can add new catalog keys for pack assets that are present but not yet used, such as additional couches, coolers, lamps, and tables.

## Collision Rules

Keep existing collision categories:

- hard blockers: walls, columns, server racks, heavy consoles, structural props
- soft blockers: sofas, tables, plant pots, small cabinets
- visual-only props: cables, decals, some lights, small screens
- hinged doors: physical leaves, block movement and bullets while in the way

For television sets:

- Cameras/light stands may block bullets if they are visually substantial.
- Cables should usually be visual-only.
- Host desks, couches, and tables block movement.
- Some furniture can remain bullet-passable if it reads as soft cover.

## Testing Expectations

The implementation plan should include tests for:

- both levels can be created through the registry
- default level is `ring-tower`
- `reception-hub` remains available
- ring tower starts with no firearm capability
- first pistol exists in reception
- every authored ring tower zone is reachable in the intended order
- final victory requires entering the lift trigger after final fight completion
- old reception-hub victory behavior is not broken
- parallax assets load without breaking the Phaser scene

## Non-Goals For First Pass

Do not add:

- procedural map generation
- dynamic zoom
- complex quest scripting
- NPC dialogue
- multiple floors
- minimap
- save/load
- full stealth system

The first pass should deliver a beautiful, playable ring tower demo level with the old level preserved behind a URL parameter.
