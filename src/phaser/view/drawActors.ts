import Phaser from "phaser";
import type { EnemyState, PlayerState } from "../../game/simulation/types";

const drawCrtHead = (
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  size: number,
  tint: number,
): void => {
  graphics.fillStyle(0x20262b, 1);
  graphics.fillRect(x - size / 2, y - size / 2, size, size * 0.78);
  graphics.lineStyle(3, 0x050505, 1);
  graphics.strokeRect(x - size / 2, y - size / 2, size, size * 0.78);
  graphics.fillStyle(tint, 1);
  graphics.fillRect(x - size * 0.34, y - size * 0.3, size * 0.68, size * 0.42);
  graphics.lineStyle(2, 0xd5d7d8, 1);
  graphics.lineBetween(x - size * 0.16, y - size / 2, x - size * 0.28, y - size * 0.72);
  graphics.lineBetween(x + size * 0.16, y - size / 2, x + size * 0.28, y - size * 0.72);
};

const drawHumanHead = (graphics: Phaser.GameObjects.Graphics, x: number, y: number): void => {
  graphics.fillStyle(0xf0c6a0, 1);
  graphics.fillCircle(x, y, 8);
  graphics.lineStyle(2, 0x1a1010, 1);
  graphics.strokeCircle(x, y, 8);
};

export const drawPlayerTexture = (scene: Phaser.Scene): string => {
  const key = "actor-player-tv-suit";
  if (scene.textures.exists(key)) {
    return key;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  graphics.fillStyle(0xf4f0dc, 1);
  graphics.fillRect(19, 29, 28, 42);
  graphics.fillStyle(0x162230, 1);
  graphics.fillRect(12, 32, 40, 46);
  graphics.fillStyle(0xffffff, 1);
  graphics.fillTriangle(25, 34, 39, 34, 32, 52);
  drawCrtHead(graphics, 32, 22, 30, 0xbdf7ec);
  graphics.fillStyle(0x1e1e21, 1);
  graphics.fillRect(46, 48, 34, 8);
  graphics.lineStyle(3, 0x050505, 1);
  graphics.strokeRect(46, 48, 34, 8);
  graphics.generateTexture(key, 96, 96);
  graphics.destroy();
  return key;
};

export const drawEnemyTexture = (
  scene: Phaser.Scene,
  enemy: Pick<EnemyState, "kind" | "head">,
): string => {
  const key = `actor-enemy-${enemy.kind}-${enemy.head}`;
  if (scene.textures.exists(key)) {
    return key;
  }

  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  const body = enemy.kind === "ranged" ? 0x2e5541 : 0x673044;
  graphics.fillStyle(body, 1);
  graphics.fillRect(15, 30, 34, 44);
  graphics.lineStyle(3, 0x080808, 1);
  graphics.strokeRect(15, 30, 34, 44);
  if (enemy.head === "crt") {
    drawCrtHead(graphics, 32, 22, 28, enemy.kind === "ranged" ? 0x9af5ff : 0xff7cb0);
  } else {
    drawHumanHead(graphics, 32, 21);
  }
  if (enemy.kind === "ranged") {
    graphics.fillStyle(0x191919, 1);
    graphics.fillRect(47, 45, 28, 7);
  } else {
    graphics.fillStyle(0xbfc6c8, 1);
    graphics.fillRect(46, 42, 18, 5);
    graphics.fillRect(60, 39, 4, 12);
  }
  graphics.generateTexture(key, 88, 88);
  graphics.destroy();
  return key;
};

export const createActorSprite = (
  scene: Phaser.Scene,
  textureKey: string,
  x: number,
  y: number,
): Phaser.GameObjects.Image => scene.add.image(x, y, textureKey).setOrigin(0.5).setScale(1);

export const syncPlayerSprite = (
  sprite: Phaser.GameObjects.Image,
  player: PlayerState,
): void => {
  sprite.setPosition(player.position.x, player.position.y);
  sprite.setRotation(player.facing);
  sprite.setAlpha(player.alive ? 1 : 0.45);
};

export const syncEnemySprite = (
  sprite: Phaser.GameObjects.Image,
  enemy: EnemyState,
): void => {
  sprite.setPosition(enemy.position.x, enemy.position.y);
  sprite.setRotation(enemy.facing);
  sprite.setVisible(enemy.alive);
};
