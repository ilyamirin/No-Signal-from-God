# Enemy AI v2 Design

## Goal

Replace the current always-aware enemy behavior with a cinematic tactical arcade AI model.

Enemies should feel like guards inside a live facility rather than simple projectile spawners. They should hold posts, patrol, talk, react to sight and sound, raise room-level alerts, move through hinged doors, and support real but avoidable friendly fire.

This is a design-only spec. Implementation should happen after a separate implementation plan is approved.

## Current Context

The project is a Phaser/Vite top-down shooter with simulation code separated from rendering.

Relevant current behavior:

- Enemy simulation lives mainly in `src/game/simulation/systems/enemies.ts`.
- Enemy content is authored in `src/game/content/enemies.ts`.
- The current enemy model has `monster_melee` and `humanoid_ranged` archetypes.
- Ranged enemies already use line-of-sight against the `vision` collision channel before firing.
- Collision channels already include `movement`, `bullets`, `vision`, and `sound`.
- Doors are physical hinged leaves and already expose `applyDoorPressure`.
- Player movement applies door pressure, but enemy movement does not yet do so.
- Combat currently treats player-owned bullets as enemy-damaging and enemy-owned bullets as player-damaging, so friendly fire needs explicit combat changes.

## Selected Approach

Use an explicit per-enemy state machine plus room-level alert groups.

This was selected over adding behavior flags to the current update logic because patrols, conversations, suspicion, investigation, combat, cooldown, doors, and friendly fire need clear boundaries. It was selected over a full squad director because the current game does not yet need complex tactical role assignment or cross-room coordination.

The target is readable tactical arcade behavior:

- living guards before contact
- quick and dramatic combat once contact happens
- local room/group escalation instead of instant whole-map aggression
- enough intelligence to avoid looking broken, but not enough complexity to slow implementation

## AI State Model

Extend `EnemyState` with a structured `ai` field.

Suggested shape:

```ts
export type EnemyAiStateName =
  | "posted"
  | "patrolling"
  | "talking"
  | "suspicious"
  | "investigating"
  | "combat"
  | "coolingDown";

export type EnemyAiState = {
  state: EnemyAiStateName;
  alertGroupId: string;
  route?: Vec2[];
  routeIndex?: number;
  post?: {
    position: Vec2;
    facing: number;
    lookAngles?: number[];
  };
  perception: {
    visionRange: number;
    visionAngle: number;
    hearingRange: number;
  };
  knownPlayerPosition?: Vec2;
  suspicionMs: number;
  cooldownMs: number;
  conversationId?: string;
};
```

Exact names can be adjusted during implementation, but the behavior fields should stay grouped so combat code does not become a pile of unrelated top-level enemy properties.

## Enemy States

### Posted

The enemy stands at a post and watches a stable direction. Optional `lookAngles` let the guard occasionally scan a doorway, corridor, or console without leaving the post.

This is the default state for guards that should hold a room entrance or cover angle.

### Patrolling

The enemy walks between authored route points. Route points should be placed through existing doorways rather than requiring general-purpose pathfinding in the first version.

At each route point, the enemy may pause briefly and face the next point or an authored direction.

### Talking

Two or more enemies share a `conversationId`. They stand near each other, face the conversation center or partner, and remain in place until perception or alert propagation interrupts them.

Conversations are gameplay-readable ambient behavior, not a dialogue system. The first version can use posture and occasional idle turns without rendered speech bubbles.

### Suspicious

The enemy saw a partial glimpse or heard a relevant sound. It turns toward the source and waits briefly before escalating.

Suspicion should be short enough to keep the game snappy. It exists to make reactions readable, not to create a slow stealth meter.

### Investigating

The enemy moves toward `knownPlayerPosition` or a sound source. If it sees the player during investigation, it enters `combat` and raises its alert group. If it reaches the point and finds nothing, it moves to `coolingDown`.

### Combat

The enemy is actively fighting. Existing ranged and melee behaviors remain the first combat baseline:

- ranged enemies keep useful distance and shoot when they have line of sight
- melee enemies close to hand reach and attack

The combat state adds friendly-fire-aware fire checks and uses the alert group model.

### Cooling Down

The enemy lost contact. It pauses, scans, and then returns to its authored post, patrol route, or conversation if the alert group stays quiet.

The first version can use a short fixed cooldown. It does not need persistent search patterns beyond checking the last known position.

## Perception

Perception should be a separate step from behavior selection.

### Vision

An enemy sees the player when all of these are true:

- player is alive
- distance is within `visionRange`
- player is inside the enemy's forward vision cone
- `hasLineOfSightThroughColliders(state.colliders, enemy.position, player.position, "vision")` passes

Closed doors and hard blockers should block vision through their existing collision channels. Soft props should not block vision unless authored otherwise.

### Hearing

Introduce short-lived sound events in simulation state or as a per-frame local collection.

Useful first sound events:

- player gunshot
- enemy gunshot
- door movement or door impact
- bullet impact
- player sprint or loud movement, if movement noise is already easy to derive

Each sound event should have:

- `position`
- `radius`
- `loudness` or priority
- source actor id, if available

An enemy hears a sound if it is within effective range and the sound path is not blocked by `sound` channel blockers. Hard walls should dampen or block sound. Soft blockers should not. Doors currently have `sound: false`, so they do not fully block sound; if that feels too permissive, a later pass can make closed doors dampen sound without fully muting it.

Gunshots should be strong enough to wake the local alert group unless separated by hard layout boundaries.

## Alert Groups

Use `alertGroupId` to model room-level escalation.

Initial groups should match the existing reception hub rooms:

- `security`
- `newsroom`
- `serverArchive`
- `broadcastControl`

The reception start room should remain safe and have no active enemy group.

When an enemy enters `combat`, all living enemies with the same `alertGroupId` should escalate:

- enemies with direct line of sight to the player enter `combat`
- enemies without direct line of sight enter `investigating` toward the last known player position or alert source
- enemies in `talking`, `posted`, or `patrolling` are interrupted

The first implementation should not globally alert every enemy on the map. Adjacent groups may be pulled in later by loud sound events or authored cross-group links, but room-level alerting is the first rule.

## Door Traversal

Enemies must be able to pass through hinged doors.

During enemy movement, apply door pressure using the same physical door system used by the player:

```ts
applyDoorPressure(state, nextEnemyPosition, enemy.radius);
```

This should happen before final movement collision resolution so an enemy pressing into a door can start opening it instead of freezing against the closed collider.

First-version navigation should stay authored:

- patrol points should lead through actual doorway openings
- investigation targets should be reachable within the same room or connected corridor
- enemies should not require arbitrary pathfinding around the full map yet

If a door blocks movement, the enemy keeps trying to move toward its target while the door opens. Once the collider rotates away enough, normal movement carries it through.

## Friendly Fire

Friendly fire should be real but not stupid.

Combat changes:

- enemy bullets can damage living enemies other than their owner
- player score should only increase for enemies killed by player-owned damage unless a deliberate bonus rule is added later
- blood, death, and corpse impulse should use the same visual path as player-caused hits

Ranged AI should check whether a friendly actor blocks the intended shot before firing.

The first version can model this as a corridor test from shooter to player:

- ignore the shooter
- inspect living enemies in the same or nearby alert group
- if a friendly circle intersects the shot corridor before the player, the shooter withholds fire

If fire is withheld, the enemy can either wait for a clearer shot or use existing movement rules to adjust distance. A later implementation can add explicit sidestep behavior, but the first version only needs to prevent obviously bad shots.

## Content Authoring

Enemy content should become more declarative.

Each authored enemy should define:

- spawn position
- archetype and weapon
- alert group id
- starting AI state
- post direction or patrol route
- optional conversation id
- perception values

Example intent:

```ts
{
  id: "enemy-newsroom-guard-left",
  archetype: "humanoid_ranged",
  ai: {
    state: "talking",
    alertGroupId: "newsroom",
    conversationId: "newsroom-floor-chat",
    perception: {
      visionRange: 520,
      visionAngle: Math.PI * 0.62,
      hearingRange: 560,
    },
    suspicionMs: 0,
    cooldownMs: 0,
  },
}
```

## Update Order

The enemy update should remain deterministic and testable.

Recommended order inside the engaged part of `updateGame`:

1. Build or update sound events from player input, weapon fire, bullet impacts, and doors.
2. Update enemy perception.
3. Propagate alert groups.
4. Update non-combat AI states.
5. Update combat movement and attacks.
6. Apply bullets and hit resolution.
7. Update status and animation state.

The exact placement may shift during implementation because weapon fire currently creates bullets inside player/enemy update paths. The important rule is that perception and alert propagation are separate from combat action.

## Rendering And Audio

No new sprites are required for the first AI pass.

The first version can express behavior using existing movement, facing, weapon animations, muzzle flashes, door motion, and sound effects.

Optional later visual polish:

- small alert marker above a guard
- conversation idle gestures
- head turns while posted
- short radio or bark sounds when a group alerts

These should not block the simulation implementation.

## Testing

Add focused simulation tests before or alongside implementation.

Required coverage:

- a posted enemy does not aggro through a closed vision-blocking door
- an enemy hears a loud sound when the sound path is not blocked
- one enemy entering combat alerts its own group but not every enemy on the map
- a patrol enemy applies door pressure and eventually passes through a doorway
- an enemy bullet can damage or kill another enemy
- a ranged enemy withholds fire when a friendly blocks its shot corridor
- an enemy that loses the player enters `coolingDown` and then returns to its post or route

Regression coverage should keep existing melee reach, ranged firing, doors, collision, and animation tests passing.

## Implementation Boundaries

The first implementation should avoid:

- full-map pathfinding
- squad role assignment
- stealth UI meters
- rendered dialogue bubbles
- complex cross-room reinforcement rules
- procedural patrol generation

Those can come after the basic state machine, room alerting, door traversal, and friendly-fire rules are proven in tests.

## Verification

Implementation should verify with:

- `npm test`
- `npm run build`
- browser smoke test in the reception hub

The playable check should confirm:

- guards look alive before combat
- a room reacts together once one guard detects the player
- other rooms do not instantly wake up
- enemies can pass through doors instead of bunching at thresholds
- enemy shots can hit allies, but ranged enemies avoid firing directly through a friendly
