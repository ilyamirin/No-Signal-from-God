import Phaser from "phaser";
import type { EnemyState, PlayerState } from "../../game/simulation/types";

const actorShadows = new WeakMap<Phaser.GameObjects.Image, Phaser.GameObjects.Image>();

export const drawPlayerTexture = (_scene: Phaser.Scene): string => "actor-player-tv";

export const drawEnemyTexture = (
  _scene: Phaser.Scene,
  enemy: Pick<EnemyState, "kind" | "head">,
): string => {
  if (enemy.kind === "rush") {
    return "actor-enemy-rush-human";
  }
  return enemy.head === "crt" ? "actor-enemy-ranged-crt" : "actor-enemy-ranged-human";
};

export const createActorSprite = (
  scene: Phaser.Scene,
  textureKey: string,
  x: number,
  y: number,
): Phaser.GameObjects.Image => {
  const shadow = scene.add
    .image(x + 3, y + 5, textureKey)
    .setOrigin(0.5)
    .setScale(0.195)
    .setTint(0x030303)
    .setAlpha(0.78)
    .setDepth(18);
  const sprite = scene.add
    .image(x, y, textureKey)
    .setOrigin(0.5)
    .setScale(0.18)
    .setDepth(24);
  actorShadows.set(sprite, shadow);
  return sprite;
};

const syncActorShadow = (
  sprite: Phaser.GameObjects.Image,
  x: number,
  y: number,
  rotation: number,
  visible: boolean,
  alpha: number,
): void => {
  const shadow = actorShadows.get(sprite);
  if (!shadow) {
    return;
  }
  shadow.setPosition(x + 3, y + 5);
  shadow.setRotation(rotation);
  shadow.setVisible(visible);
  shadow.setAlpha(alpha * 0.78);
};

export const syncPlayerSprite = (
  sprite: Phaser.GameObjects.Image,
  player: PlayerState,
): void => {
  sprite.setPosition(player.position.x, player.position.y);
  const rotation = player.facing - Math.PI / 2;
  sprite.setRotation(rotation);
  sprite.setAlpha(player.alive ? 1 : 0.45);
  syncActorShadow(sprite, player.position.x, player.position.y, rotation, true, player.alive ? 1 : 0.45);
};

export const syncEnemySprite = (
  sprite: Phaser.GameObjects.Image,
  enemy: EnemyState,
): void => {
  sprite.setPosition(enemy.position.x, enemy.position.y);
  const rotation = enemy.alive ? enemy.facing - Math.PI / 2 : enemy.facing - Math.PI / 2 + 0.75;
  sprite.setRotation(rotation);
  sprite.setVisible(true);
  sprite.setAlpha(enemy.alive ? 1 : 0.45);
  syncActorShadow(sprite, enemy.position.x, enemy.position.y, rotation, true, enemy.alive ? 1 : 0.45);
  if (enemy.alive) {
    sprite.clearTint();
  } else {
    sprite.setTint(0x7f2a2a);
  }
};
