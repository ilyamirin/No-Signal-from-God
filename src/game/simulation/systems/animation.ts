import type { EnemyState, GameState, PlayerState, WeaponState } from "../types";

const speedOf = (actor: PlayerState | EnemyState): number => Math.hypot(actor.velocity.x, actor.velocity.y);

const playerIntent = (player: PlayerState, weapon: WeaponState | undefined): PlayerState["animation"]["intent"] => {
  if (!player.alive) {
    return "death";
  }
  if (weapon?.reloadRemainingMs && weapon.reloadRemainingMs > 0) {
    return "reload";
  }
  if (player.animation.lastShotMs > 0) {
    return "shoot";
  }
  return speedOf(player) > 8 ? "run" : "idle";
};

const enemyIntent = (enemy: EnemyState): EnemyState["animation"]["intent"] => {
  if (!enemy.alive) {
    return "death";
  }
  if (enemy.animation.lastShotMs > 0) {
    return enemy.archetype === "monster_melee" ? "attack" : "shoot";
  }
  return speedOf(enemy) > 8 ? (enemy.archetype === "monster_melee" ? "run" : "walk") : "idle";
};

export const markActorShot = (state: GameState, actorId: string): void => {
  const actor = actorId === state.player.id
    ? state.player
    : state.enemies.find((enemy) => enemy.id === actorId);
  if (actor) {
    actor.animation.lastShotMs = 130;
  }
};

export const updateActorAnimations = (state: GameState, deltaMs: number): void => {
  state.player.animation.lastShotMs = Math.max(0, state.player.animation.lastShotMs - deltaMs);
  const playerSpeed = speedOf(state.player);
  const playerWeapon = state.weapons[state.player.weaponId];
  state.player.animation = {
    ...state.player.animation,
    intent: playerIntent(state.player, playerWeapon),
    weaponKind: playerWeapon?.kind,
    moving: playerSpeed > 8,
    speed: playerSpeed,
  };

  for (const enemy of state.enemies) {
    enemy.animation.lastShotMs = Math.max(0, enemy.animation.lastShotMs - deltaMs);
    const speed = enemy.alive ? speedOf(enemy) : 0;
    const weapon = enemy.weaponId ? state.weapons[enemy.weaponId] : undefined;
    enemy.animation = {
      ...enemy.animation,
      intent: enemyIntent(enemy),
      weaponKind: weapon?.kind,
      moving: speed > 8,
      speed,
    };
  }
};
