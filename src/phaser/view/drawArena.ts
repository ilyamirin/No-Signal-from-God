import Phaser from "phaser";
import type { ArenaState, Rect } from "../../game/simulation/types";

type Box = Pick<Rect, "x" | "y" | "width" | "height">;

type DrawRect = Box & {
  fill: number;
  alpha?: number;
};

const strokeRect = (
  graphics: Phaser.GameObjects.Graphics,
  rect: Box,
  color = 0x090607,
  width = 4,
): void => {
  graphics.lineStyle(width, color, 1);
  graphics.strokeRect(rect.x, rect.y, rect.width, rect.height);
};

const fillRoom = (
  graphics: Phaser.GameObjects.Graphics,
  room: DrawRect,
  pattern: "brick" | "grid" | "checker" | "stripe",
): void => {
  graphics.fillStyle(room.fill, room.alpha ?? 1);
  graphics.fillRect(room.x, room.y, room.width, room.height);

  if (pattern === "brick") {
    graphics.lineStyle(2, 0x120606, 0.55);
    for (let y = room.y + 16; y < room.y + room.height; y += 16) {
      graphics.lineBetween(room.x, y, room.x + room.width, y);
    }
    for (let y = room.y; y < room.y + room.height; y += 32) {
      for (let x = room.x + ((y / 32) % 2) * 28; x < room.x + room.width; x += 56) {
        graphics.lineBetween(x, y, x, Math.min(y + 16, room.y + room.height));
      }
    }
    return;
  }

  if (pattern === "checker") {
    for (let x = room.x; x < room.x + room.width; x += 34) {
      for (let y = room.y; y < room.y + room.height; y += 34) {
        graphics.fillStyle((x + y) % 68 === 0 ? 0x25231f : 0x7a443c, 1);
        graphics.fillRect(x, y, 32, 32);
      }
    }
    return;
  }

  if (pattern === "stripe") {
    graphics.lineStyle(3, 0xff38d4, 0.25);
    for (let y = room.y + 8; y < room.y + room.height; y += 11) {
      graphics.lineBetween(room.x, y, room.x + room.width, y);
    }
    return;
  }

  graphics.lineStyle(1, 0x06090d, 0.7);
  for (let x = room.x; x < room.x + room.width; x += 32) {
    graphics.lineBetween(x, room.y, x, room.y + room.height);
  }
  for (let y = room.y; y < room.y + room.height; y += 32) {
    graphics.lineBetween(room.x, y, room.x + room.width, y);
  }
};

const drawWall = (graphics: Phaser.GameObjects.Graphics, rect: Box): void => {
  graphics.fillStyle(0x0b0908, 1);
  graphics.fillRect(rect.x - 3, rect.y - 3, rect.width + 6, rect.height + 6);
  graphics.fillStyle(0xd8d0b7, 1);
  graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
  graphics.lineStyle(2, 0x7c1b24, 1);
  graphics.strokeRect(rect.x + 3, rect.y + 3, Math.max(1, rect.width - 6), Math.max(1, rect.height - 6));
  graphics.lineStyle(2, 0x53f6e7, 0.85);
  if (rect.width > rect.height) {
    graphics.lineBetween(rect.x + 5, rect.y + rect.height - 4, rect.x + rect.width - 5, rect.y + rect.height - 4);
  } else {
    graphics.lineBetween(rect.x + rect.width - 4, rect.y + 5, rect.x + rect.width - 4, rect.y + rect.height - 5);
  }
};

const drawDoorGap = (graphics: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number): void => {
  graphics.fillStyle(0x090607, 1);
  graphics.fillRect(x, y, width, height);
  graphics.lineStyle(3, 0xf5d8a6, 0.9);
  graphics.strokeRect(x + 2, y + 2, width - 4, height - 4);
};

const drawDesk = (graphics: Phaser.GameObjects.Graphics, rect: Box): void => {
  graphics.fillStyle(0x090607, 1);
  graphics.fillRect(rect.x - 4, rect.y - 4, rect.width + 8, rect.height + 8);
  graphics.fillStyle(0xa65c2f, 1);
  graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
  graphics.lineStyle(3, 0x351611, 1);
  graphics.strokeRect(rect.x + 5, rect.y + 5, rect.width - 10, rect.height - 10);
  graphics.fillStyle(0x26e8ff, 0.9);
  graphics.fillRect(rect.x + 20, rect.y + rect.height - 20, rect.width - 40, 8);
  for (let x = rect.x + 18; x < rect.x + rect.width - 16; x += 38) {
    graphics.fillStyle(0xe8d8bc, 1);
    graphics.fillRect(x, rect.y + 12, 18, 10);
  }
};

const drawServerBank = (graphics: Phaser.GameObjects.Graphics, rect: Box): void => {
  graphics.fillStyle(0x050607, 1);
  graphics.fillRect(rect.x - 4, rect.y - 4, rect.width + 8, rect.height + 8);
  for (let x = rect.x; x < rect.x + rect.width; x += 50) {
    graphics.fillStyle(0x172025, 1);
    graphics.fillRect(x, rect.y, 44, rect.height);
    strokeRect(graphics, { x, y: rect.y, width: 44, height: rect.height }, 0x050607, 3);
    for (let y = rect.y + 12; y < rect.y + rect.height - 8; y += 14) {
      graphics.fillStyle((x + y) % 3 === 0 ? 0x40ff69 : 0xff4bc1, 1);
      graphics.fillRect(x + 9, y, 20, 4);
      graphics.fillStyle(0xfff3a8, 1);
      graphics.fillRect(x + 33, y, 4, 4);
    }
  }
};

const drawGreenScreen = (graphics: Phaser.GameObjects.Graphics, rect: Box): void => {
  graphics.fillStyle(0x041006, 1);
  graphics.fillRect(rect.x - 6, rect.y - 6, rect.width + 12, rect.height + 12);
  graphics.fillStyle(0x12ef42, 1);
  graphics.fillRect(rect.x, rect.y, rect.width, rect.height);
  graphics.lineStyle(2, 0x0a5d1a, 1);
  for (let y = rect.y + 10; y < rect.y + rect.height; y += 10) {
    graphics.lineBetween(rect.x, y, rect.x + rect.width, y);
  }
};

const drawCamera = (graphics: Phaser.GameObjects.Graphics, rect: Box): void => {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  graphics.lineStyle(5, 0x050607, 1);
  graphics.lineBetween(centerX, centerY + 6, centerX - 28, centerY + 40);
  graphics.lineBetween(centerX, centerY + 6, centerX + 28, centerY + 40);
  graphics.lineBetween(centerX, centerY + 6, centerX, centerY + 45);
  graphics.fillStyle(0x2f3b3e, 1);
  graphics.fillRect(centerX - 29, centerY - 18, 58, 36);
  graphics.fillStyle(0x75f8ff, 1);
  graphics.fillRect(centerX + 15, centerY - 10, 15, 20);
  strokeRect(graphics, { x: centerX - 29, y: centerY - 18, width: 58, height: 36 }, 0x050607, 3);
};

const drawBlood = (graphics: Phaser.GameObjects.Graphics, x: number, y: number, scale = 1): void => {
  graphics.fillStyle(0xc30016, 0.95);
  graphics.fillCircle(x, y, 18 * scale);
  graphics.fillCircle(x + 18 * scale, y - 8 * scale, 10 * scale);
  graphics.fillCircle(x - 14 * scale, y + 10 * scale, 8 * scale);
  graphics.lineStyle(5 * scale, 0xc30016, 0.9);
  graphics.lineBetween(x - 30 * scale, y + 4 * scale, x - 72 * scale, y + 18 * scale);
  graphics.lineBetween(x + 6 * scale, y - 20 * scale, x + 42 * scale, y - 42 * scale);
  for (let index = 0; index < 7; index += 1) {
    graphics.fillCircle(
      x - 48 * scale + index * 15 * scale,
      y + ((index % 3) - 1) * 22 * scale,
      (3 + (index % 3)) * scale,
    );
  }
};

const drawBody = (
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  rotation: number,
  suitColor: number,
): void => {
  graphics.save();
  graphics.translateCanvas(x, y);
  graphics.rotateCanvas(rotation);
  graphics.fillStyle(0x050607, 1);
  graphics.fillRect(-14, -30, 28, 58);
  graphics.fillStyle(suitColor, 1);
  graphics.fillRect(-11, -27, 22, 52);
  graphics.fillStyle(0xf0b48a, 1);
  graphics.fillCircle(0, -39, 12);
  graphics.fillStyle(0x111111, 1);
  graphics.fillRect(-5, 22, 5, 28);
  graphics.fillRect(3, 22, 5, 28);
  graphics.restore();
};

const drawDroppedGun = (graphics: Phaser.GameObjects.Graphics, x: number, y: number, rotation: number): void => {
  graphics.save();
  graphics.translateCanvas(x, y);
  graphics.rotateCanvas(rotation);
  graphics.fillStyle(0x050607, 1);
  graphics.fillRect(-21, -4, 42, 8);
  graphics.fillRect(8, 1, 8, 17);
  graphics.fillStyle(0xc6c0b2, 1);
  graphics.fillRect(-18, -2, 28, 4);
  graphics.restore();
};

const drawGlass = (graphics: Phaser.GameObjects.Graphics, x: number, y: number): void => {
  graphics.fillStyle(0x50f4ff, 0.85);
  for (let index = 0; index < 12; index += 1) {
    const px = x + ((index * 23) % 100) - 50;
    const py = y + ((index * 17) % 70) - 35;
    graphics.fillTriangle(px, py - 5, px + 9, py + 3, px - 3, py + 6);
  }
};

const drawShells = (graphics: Phaser.GameObjects.Graphics, x: number, y: number): void => {
  graphics.fillStyle(0xffd46c, 1);
  for (let index = 0; index < 10; index += 1) {
    graphics.fillRect(x + index * 9, y + (index % 3) * 7, 5, 9);
  }
};

const drawObstacle = (graphics: Phaser.GameObjects.Graphics, obstacle: Rect): void => {
  if (obstacle.id.includes("wall") || obstacle.id.includes("divider")) {
    drawWall(graphics, obstacle);
    return;
  }
  if (obstacle.id.includes("desk")) {
    drawDesk(graphics, obstacle);
    return;
  }
  if (obstacle.id.includes("server")) {
    drawServerBank(graphics, obstacle);
    return;
  }
  if (obstacle.id.includes("green-screen")) {
    drawGreenScreen(graphics, obstacle);
    return;
  }
  if (obstacle.id.includes("camera")) {
    drawCamera(graphics, obstacle);
    return;
  }
  graphics.fillStyle(0x202226, 1);
  graphics.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  strokeRect(graphics, obstacle);
};

export const drawArena = (
  scene: Phaser.Scene,
  arena: ArenaState,
): Phaser.GameObjects.Container => {
  const container = scene.add.container(0, 0);
  const graphics = scene.add.graphics();
  container.add(graphics);

  graphics.fillStyle(0x050406, 1);
  graphics.fillRect(0, 0, arena.width, arena.height);

  fillRoom(graphics, { x: 90, y: 70, width: 260, height: 628, fill: 0x8f004b }, "stripe");
  fillRoom(graphics, { x: 368, y: 70, width: 446, height: 222, fill: 0x4c0d10 }, "brick");
  fillRoom(graphics, { x: 368, y: 310, width: 446, height: 388, fill: 0x2f1114 }, "brick");
  fillRoom(graphics, { x: 832, y: 70, width: 434, height: 222, fill: 0xd00585 }, "stripe");
  fillRoom(graphics, { x: 832, y: 310, width: 434, height: 388, fill: 0x26211d }, "checker");
  fillRoom(graphics, { x: 368, y: 310, width: 446, height: 110, fill: 0xe5d7b5, alpha: 0.95 }, "grid");
  fillRoom(graphics, { x: 986, y: 168, width: 280, height: 124, fill: 0xb88c35 }, "grid");

  drawDoorGap(graphics, 350, 302, 18, 118);
  drawDoorGap(graphics, 814, 298, 18, 116);
  drawDoorGap(graphics, 648, 292, 68, 18);

  drawBlood(graphics, 234, 518, 1.4);
  drawBlood(graphics, 610, 238, 1.1);
  drawBlood(graphics, 930, 238, 1.25);
  drawBlood(graphics, 1135, 532, 1.35);
  drawBlood(graphics, 620, 612, 0.9);
  drawBody(graphics, 236, 526, -0.55, 0xd8d8cf);
  drawBody(graphics, 612, 242, 0.3, 0xf0efe3);
  drawBody(graphics, 1145, 538, 1.6, 0xd8d8cf);
  drawDroppedGun(graphics, 675, 300, -0.25);
  drawDroppedGun(graphics, 1000, 356, 0.55);
  drawDroppedGun(graphics, 246, 300, 1.1);
  drawGlass(graphics, 850, 338);
  drawShells(graphics, 592, 372);
  drawShells(graphics, 1030, 530);

  for (const obstacle of arena.obstacles) {
    drawObstacle(graphics, obstacle);
  }

  graphics.lineStyle(5, 0x050607, 1);
  graphics.strokeRect(26, 24, arena.width - 52, arena.height - 48);
  graphics.lineStyle(3, 0xff25cc, 0.95);
  graphics.strokeRect(31, 29, arena.width - 62, arena.height - 58);

  return container;
};
