import Phaser from "phaser";
import type { ArenaState, DecorItem, Rect } from "../../game/simulation/types";

const drawObstacle = (
  graphics: Phaser.GameObjects.Graphics,
  rect: Rect,
  fill: number,
  stroke = 0xe2c7a8,
): void => {
  graphics.fillStyle(fill, 1);
  graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
  graphics.lineStyle(4, 0x0b0808, 1);
  graphics.strokeRect(rect.x, rect.y, rect.width, rect.height);
  graphics.lineStyle(2, stroke, 1);
  graphics.strokeRect(rect.x + 3, rect.y + 3, rect.width - 6, rect.height - 6);
};

const drawCable = (graphics: Phaser.GameObjects.Graphics, item: DecorItem): void => {
  const { x, y } = item.position;
  graphics.lineStyle(8, 0x050505, 1);
  graphics.beginPath();
  graphics.moveTo(x - 82, y + 6);
  graphics.lineTo(x - 36, y - 24);
  graphics.lineTo(x + 26, y + 30);
  graphics.lineTo(x + 84, y - 8);
  graphics.strokePath();
  graphics.lineStyle(3, 0x2be87c, 1);
  graphics.strokePath();
};

const drawCrtWall = (graphics: Phaser.GameObjects.Graphics, item: DecorItem): void => {
  const { x, y } = item.position;
  for (let index = 0; index < 5; index += 1) {
    const monitorX = x - 184 + index * 76;
    graphics.fillStyle(0x141923, 1);
    graphics.fillRect(monitorX, y - 26, 64, 44);
    graphics.lineStyle(4, 0x050505, 1);
    graphics.strokeRect(monitorX, y - 26, 64, 44);
    graphics.fillStyle(index % 2 === 0 ? 0xb9fbff : 0xd8d8d8, 0.72);
    graphics.fillRect(monitorX + 9, y - 17, 46, 27);
    graphics.lineStyle(1, 0xffffff, 0.4);
    graphics.lineBetween(monitorX + 12, y - 8, monitorX + 52, y - 13);
  }
};

const drawDecor = (graphics: Phaser.GameObjects.Graphics, item: DecorItem): void => {
  const { x, y } = item.position;

  if (item.kind === "green-screen") {
    graphics.fillStyle(0x10ed66, 1);
    graphics.fillRect(x - 55, y - 118, 110, 236);
    graphics.lineStyle(5, 0x051007, 1);
    graphics.strokeRect(x - 55, y - 118, 110, 236);
    return;
  }

  if (item.kind === "crt-wall") {
    drawCrtWall(graphics, item);
    return;
  }

  if (item.kind === "cable") {
    drawCable(graphics, item);
    return;
  }

  if (item.kind === "studio-light") {
    graphics.fillStyle(0x23262d, 1);
    graphics.fillRect(x - 19, y - 17, 38, 34);
    graphics.fillStyle(0xffe99d, 1);
    graphics.fillRect(x - 12, y - 10, 24, 20);
    graphics.lineStyle(3, 0x050505, 1);
    graphics.strokeRect(x - 19, y - 17, 38, 34);
    graphics.lineBetween(x, y + 17, x - 24, y + 54);
    graphics.lineBetween(x, y + 17, x + 24, y + 54);
    return;
  }

  if (item.kind === "camera") {
    graphics.fillStyle(0x2c3237, 1);
    graphics.fillRect(x - 28, y - 17, 56, 34);
    graphics.fillStyle(0x59646d, 1);
    graphics.fillRect(x + 17, y - 10, 28, 20);
    graphics.lineStyle(3, 0x080808, 1);
    graphics.strokeRect(x - 28, y - 17, 56, 34);
    graphics.lineBetween(x, y + 17, x - 24, y + 54);
    graphics.lineBetween(x, y + 17, x + 24, y + 54);
    return;
  }

  if (item.kind === "server-rack") {
    graphics.fillStyle(0x11171d, 1);
    graphics.fillRect(x - 40, y - 92, 80, 184);
    graphics.lineStyle(4, 0x050505, 1);
    graphics.strokeRect(x - 40, y - 92, 80, 184);
    for (let index = 0; index < 9; index += 1) {
      graphics.fillStyle(index % 2 === 0 ? 0x2df09a : 0x57dcff, 1);
      graphics.fillRect(x - 25, y - 74 + index * 18, 50, 6);
    }
    return;
  }

  if (item.kind === "control-panel") {
    graphics.fillStyle(0x181a16, 1);
    graphics.fillRect(x - 120, y - 28, 240, 56);
    graphics.lineStyle(4, 0x050505, 1);
    graphics.strokeRect(x - 120, y - 28, 240, 56);
    for (let index = 0; index < 14; index += 1) {
      graphics.fillStyle(index % 3 === 0 ? 0x40f29a : 0xffe28a, 1);
      graphics.fillRect(x - 105 + index * 15, y - 12, 8, 7);
    }
  }
};

export const drawArena = (
  scene: Phaser.Scene,
  arena: ArenaState,
): Phaser.GameObjects.Container => {
  const container = scene.add.container(0, 0);
  const graphics = scene.add.graphics();
  container.add(graphics);

  graphics.fillStyle(0x060911, 1);
  graphics.fillRect(0, 0, arena.width, arena.height);

  graphics.fillStyle(0x172d4c, 1);
  graphics.fillRect(250, 72, 860, 220);
  graphics.fillStyle(0x202330, 1);
  graphics.fillRect(90, 292, 1140, 380);

  for (let x = 90; x < 1230; x += 48) {
    for (let y = 292; y < 672; y += 48) {
      graphics.fillStyle((x + y) % 96 === 0 ? 0x2a5775 : 0x1b3448, 1);
      graphics.fillRect(x, y, 46, 46);
    }
  }

  graphics.fillStyle(0x8f6d77, 0.95);
  graphics.fillRect(486, 292, 150, 380);
  graphics.fillStyle(0x1e3c66, 1);
  graphics.fillRect(426, 94, 340, 170);
  graphics.fillStyle(0xded0c7, 0.85);
  graphics.fillRect(542, 205, 116, 45);

  for (const obstacle of arena.obstacles) {
    const fill = obstacle.id.includes("desk") ? 0xb8794f : 0x232831;
    drawObstacle(graphics, obstacle, fill);
  }

  for (const item of arena.decor) {
    drawDecor(graphics, item);
  }

  graphics.lineStyle(8, 0xd4c1ac, 1);
  graphics.strokeRect(82, 64, 1180, 640);
  graphics.lineStyle(5, 0xa0183e, 1);
  graphics.strokeRect(68, 50, 1208, 668);
  graphics.fillStyle(0x050505, 1);
  graphics.fillRect(0, 0, arena.width, 34);
  graphics.fillRect(0, arena.height - 34, arena.width, 34);

  return container;
};
