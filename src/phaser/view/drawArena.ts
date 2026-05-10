import Phaser from "phaser";
import type { ArenaState, Rect } from "../../game/simulation/types";

type Box = Pick<Rect, "x" | "y" | "width" | "height">;

type AssetSprite = {
  key: string;
  x: number;
  y: number;
  frame?: number;
  scale?: number;
  rotation?: number;
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
  if (obstacle.id.includes("green-screen")) {
    drawGreenScreen(graphics, obstacle);
    return;
  }
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
  if (obstacle.id.includes("camera")) {
    drawCamera(graphics, obstacle);
    return;
  }
  graphics.fillStyle(0x202226, 1);
  graphics.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
  strokeRect(graphics, obstacle);
};

const addSprite = (
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  item: AssetSprite,
): Phaser.GameObjects.Sprite | undefined => {
  if (!scene.textures.exists(item.key)) {
    return undefined;
  }

  const sprite = scene.add
    .sprite(item.x, item.y, item.key, item.frame ?? 0)
    .setOrigin(0.5)
    .setScale(item.scale ?? 1)
    .setRotation(item.rotation ?? 0)
    .setAlpha(item.alpha ?? 1);
  container.add(sprite);
  return sprite;
};

const addFloorTiles = (
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  room: Box,
  frames: number[],
): void => {
  const tileSize = 32;
  for (let y = room.y; y < room.y + room.height; y += tileSize) {
    for (let x = room.x; x < room.x + room.width; x += tileSize) {
      const frame = frames[Math.abs(Math.floor(x / tileSize) + Math.floor(y / tileSize)) % frames.length];
      const sprite = addSprite(scene, container, {
        key: "scifi-floor-tiles",
        x: x + tileSize / 2,
        y: y + tileSize / 2,
        frame,
      });
      sprite?.setDisplaySize(tileSize, tileSize);
    }
  }
};

export const drawArena = (
  scene: Phaser.Scene,
  arena: ArenaState,
): Phaser.GameObjects.Container => {
  const container = scene.add.container(0, 0);
  const graphics = scene.add.graphics();

  graphics.fillStyle(0x050406, 1);
  graphics.fillRect(0, 0, arena.width, arena.height);

  container.add(graphics);

  addFloorTiles(scene, container, { x: 90, y: 70, width: 260, height: 628 }, [0, 1]);
  addFloorTiles(scene, container, { x: 368, y: 70, width: 446, height: 222 }, [4]);
  addFloorTiles(scene, container, { x: 368, y: 310, width: 446, height: 388 }, [1, 2]);
  addFloorTiles(scene, container, { x: 832, y: 70, width: 434, height: 222 }, [2, 3]);
  addFloorTiles(scene, container, { x: 832, y: 310, width: 434, height: 388 }, [0, 3]);
  addFloorTiles(scene, container, { x: 368, y: 310, width: 446, height: 110 }, [5, 6]);
  addFloorTiles(scene, container, { x: 986, y: 168, width: 280, height: 124 }, [4, 5]);

  const overlay = scene.add.graphics();
  container.add(overlay);

  drawDoorGap(overlay, 350, 302, 18, 118);
  drawDoorGap(overlay, 814, 298, 18, 116);
  drawDoorGap(overlay, 648, 292, 68, 18);

  drawGlass(overlay, 850, 338);
  drawShells(overlay, 592, 372);
  drawShells(overlay, 1030, 530);

  for (const obstacle of arena.obstacles) {
    drawObstacle(overlay, obstacle);
  }

  overlay.lineStyle(5, 0x050607, 1);
  overlay.strokeRect(26, 24, arena.width - 52, arena.height - 48);
  overlay.lineStyle(3, 0xff25cc, 0.95);
  overlay.strokeRect(31, 29, arena.width - 62, arena.height - 58);

  return container;
};
