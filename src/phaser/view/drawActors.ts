import Phaser from "phaser";
import type { EnemyState, PlayerState } from "../../game/simulation/types";

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
): Phaser.GameObjects.Image => scene.add.image(x, y, textureKey).setOrigin(0.5).setScale(0.22);

export const syncPlayerSprite = (
  sprite: Phaser.GameObjects.Image,
  player: PlayerState,
): void => {
  sprite.setPosition(player.position.x, player.position.y);
  sprite.setRotation(player.facing - Math.PI / 2);
  sprite.setAlpha(player.alive ? 1 : 0.45);
};

export const syncEnemySprite = (
  sprite: Phaser.GameObjects.Image,
  enemy: EnemyState,
): void => {
  sprite.setPosition(enemy.position.x, enemy.position.y);
  sprite.setRotation(enemy.alive ? enemy.facing - Math.PI / 2 : enemy.facing - Math.PI / 2 + 0.75);
  sprite.setVisible(true);
  sprite.setAlpha(enemy.alive ? 1 : 0.45);
  if (enemy.alive) {
    sprite.clearTint();
  } else {
    sprite.setTint(0x7f2a2a);
  }
};
