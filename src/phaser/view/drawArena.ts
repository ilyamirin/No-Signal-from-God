import Phaser from "phaser";
import type { ArenaState, DecorItem, Rect } from "../../game/simulation/types";

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

const drawRingTowerFoundation = (graphics: Phaser.GameObjects.Graphics, arena: ArenaState): void => {
  const cx = arena.width / 2;
  const cy = arena.height / 2;

  graphics.fillStyle(0x05070a, 0.92);
  graphics.fillEllipse(cx, cy, arena.width * 0.88, arena.height * 0.88);

  graphics.lineStyle(44, 0x111923, 0.98);
  graphics.strokeEllipse(cx, cy, arena.width * 0.9, arena.height * 0.88);

  graphics.lineStyle(16, 0x66e6ff, 0.38);
  graphics.strokeEllipse(cx, cy, arena.width * 0.84, arena.height * 0.82);

  graphics.lineStyle(5, 0xf2fff8, 0.34);
  graphics.strokeEllipse(cx, cy, arena.width * 0.78, arena.height * 0.76);

  graphics.lineStyle(3, 0x5cf0ff, 0.18);
  for (let angle = -Math.PI * 0.92; angle <= Math.PI * 0.92; angle += Math.PI / 8) {
    const innerX = cx + Math.cos(angle) * 640;
    const innerY = cy + Math.sin(angle) * 540;
    const outerX = cx + Math.cos(angle) * 1320;
    const outerY = cy + Math.sin(angle) * 1110;
    graphics.lineBetween(innerX, innerY, outerX, outerY);
  }
};

const drawRingTowerOverlays = (graphics: Phaser.GameObjects.Graphics, arena: ArenaState): void => {
  const cx = arena.width / 2;
  const cy = arena.height / 2;

  graphics.lineStyle(28, 0x070708, 1);
  graphics.strokeEllipse(cx, cy, arena.width * 0.91, arena.height * 0.89);
  graphics.lineStyle(8, 0xd8d0b7, 0.9);
  graphics.strokeEllipse(cx, cy, arena.width * 0.87, arena.height * 0.84);
  graphics.lineStyle(3, 0x57f6eb, 0.9);
  graphics.strokeEllipse(cx, cy, arena.width * 0.82, arena.height * 0.79);

  drawGlass(graphics, 780, 1010);
  drawGlass(graphics, 2420, 1010);
  drawGlass(graphics, 1000, 2020);
  drawGlass(graphics, 2200, 2020);
  drawShells(graphics, 1365, 2225);
  drawShells(graphics, 1980, 2120);
};

const drawShells = (graphics: Phaser.GameObjects.Graphics, x: number, y: number): void => {
  graphics.fillStyle(0xffd46c, 1);
  for (let index = 0; index < 10; index += 1) {
    graphics.fillRect(x + index * 9, y + (index % 3) * 7, 5, 9);
  }
};

const drawCableDecor = (graphics: Phaser.GameObjects.Graphics, item: DecorItem): void => {
  const { x, y } = item.position;
  const angle = item.rotation;
  graphics.lineStyle(5, 0x050607, 0.95);
  for (let index = 0; index < 4; index += 1) {
    const offset = index * 16;
    const x1 = x + Math.cos(angle) * offset;
    const y1 = y + Math.sin(angle) * offset;
    const x2 = x + Math.cos(angle) * (offset + 34) - Math.sin(angle) * (index % 2 === 0 ? 14 : -14);
    const y2 = y + Math.sin(angle) * (offset + 34) + Math.cos(angle) * (index % 2 === 0 ? 14 : -14);
    graphics.lineBetween(x1, y1, x2, y2);
  }
  graphics.lineStyle(2, 0x38e7ff, 0.35);
  graphics.lineBetween(x, y, x + Math.cos(angle) * 88, y + Math.sin(angle) * 88);
};

const drawCableCoilDecor = (graphics: Phaser.GameObjects.Graphics, item: DecorItem): void => {
  const { x, y } = item.position;
  graphics.lineStyle(5, 0x050607, 0.95);
  for (let radius = 12; radius <= 34; radius += 7) {
    graphics.strokeCircle(x, y, radius);
  }
  graphics.lineStyle(2, 0x6ff7ff, 0.25);
  graphics.strokeCircle(x, y, 26);
};

const drawCrtWallDecor = (graphics: Phaser.GameObjects.Graphics, item: DecorItem): void => {
  const { x, y } = item.position;
  const cols = 3;
  const rows = 2;
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const px = x + col * 58;
      const py = y + row * 42;
      graphics.fillStyle(0x050607, 1);
      graphics.fillRect(px - 3, py - 3, 52, 34);
      graphics.fillStyle(0x1c242b, 1);
      graphics.fillRect(px, py, 46, 28);
      graphics.fillStyle((row + col) % 3 === 0 ? 0x8afff5 : (row + col) % 3 === 1 ? 0xff43c8 : 0xf6e46a, 0.92);
      for (let line = 0; line < 6; line += 1) {
        graphics.fillRect(px + 7, py + 6 + line * 3, 28 + ((line + col) % 3) * 3, 1);
      }
    }
  }
};

const drawNeonStripDecor = (graphics: Phaser.GameObjects.Graphics, item: DecorItem): void => {
  const { x, y } = item.position;
  const horizontal = Math.abs(Math.cos(item.rotation)) > Math.abs(Math.sin(item.rotation));
  graphics.lineStyle(9, 0x050607, 1);
  if (horizontal) {
    graphics.lineBetween(x - 58, y, x + 58, y);
    graphics.lineStyle(4, 0xff25cc, 0.95);
    graphics.lineBetween(x - 52, y, x + 52, y);
    graphics.lineStyle(2, 0x67f6ff, 0.85);
    graphics.lineBetween(x - 52, y + 6, x + 52, y + 6);
  } else {
    graphics.lineBetween(x, y - 58, x, y + 58);
    graphics.lineStyle(4, 0xff25cc, 0.95);
    graphics.lineBetween(x, y - 52, x, y + 52);
    graphics.lineStyle(2, 0x67f6ff, 0.85);
    graphics.lineBetween(x + 6, y - 52, x + 6, y + 52);
  }
};

const drawPaperStackDecor = (graphics: Phaser.GameObjects.Graphics, item: DecorItem): void => {
  const { x, y } = item.position;
  for (let index = 0; index < 4; index += 1) {
    graphics.fillStyle(0x050607, 0.8);
    graphics.fillRect(x + index * 5 - 13, y + index * 3 - 8, 24, 16);
    graphics.fillStyle(0xf3e3b8, 1);
    graphics.fillRect(x + index * 5 - 14, y + index * 3 - 9, 22, 14);
    graphics.lineStyle(1, 0x6b5744, 0.8);
    graphics.lineBetween(x + index * 5 - 10, y + index * 3 - 3, x + index * 5 + 3, y + index * 3 - 3);
    graphics.lineBetween(x + index * 5 - 10, y + index * 3 + 2, x + index * 5 + 1, y + index * 3 + 2);
  }
};

const drawDecorItem = (graphics: Phaser.GameObjects.Graphics, item: DecorItem): void => {
  if (item.kind === "cable") {
    drawCableDecor(graphics, item);
  } else if (item.kind === "cable-coil") {
    drawCableCoilDecor(graphics, item);
  } else if (item.kind === "crt-wall") {
    drawCrtWallDecor(graphics, item);
  } else if (item.kind === "neon-strip") {
    drawNeonStripDecor(graphics, item);
  } else if (item.kind === "paper-stack") {
    drawPaperStackDecor(graphics, item);
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

const tintForFloor = (id: string): { color: number; alpha: number } => {
  if (id.includes("lift")) {
    return { color: 0x243b55, alpha: 0.22 };
  }
  if (id.includes("lobby")) {
    return { color: 0x6f3e58, alpha: 0.25 };
  }
  if (id.includes("reception")) {
    if (id.includes("carpet")) {
      return { color: 0x9b315e, alpha: 0.32 };
    }
    if (id.includes("tech")) {
      return { color: 0x163848, alpha: 0.3 };
    }
    return { color: 0x8b7a68, alpha: 0.18 };
  }
  if (id.includes("talk-studio")) {
    return { color: 0x172d63, alpha: 0.28 };
  }
  if (id.includes("control") || id.includes("tech")) {
    return { color: 0x123544, alpha: 0.27 };
  }
  if (id.includes("backstage") || id.includes("equipment")) {
    return { color: 0x3b2c34, alpha: 0.28 };
  }
  if (id.includes("final")) {
    return { color: 0x7b164f, alpha: 0.3 };
  }
  return { color: 0x111217, alpha: 0.14 };
};

const addFloorTints = (
  scene: Phaser.Scene,
  container: Phaser.GameObjects.Container,
  arena: ArenaState,
): void => {
  const tint = scene.add.graphics();
  for (const region of arena.floorRegions) {
    const style = tintForFloor(region.id);
    tint.fillStyle(style.color, style.alpha);
    tint.fillRect(region.x, region.y, region.width, region.height);
  }
  container.add(tint);
};

export const drawArena = (
  scene: Phaser.Scene,
  arena: ArenaState,
): Phaser.GameObjects.Container => {
  const container = scene.add.container(0, 0);
  const graphics = scene.add.graphics();

  if (!arena.background) {
    graphics.fillStyle(0x050406, 1);
    graphics.fillRect(0, 0, arena.width, arena.height);
  } else {
    drawRingTowerFoundation(graphics, arena);
  }

  container.add(graphics);

  for (const region of arena.floorRegions) {
    addFloorTiles(scene, container, region, region.frames);
  }
  addFloorTints(scene, container, arena);

  const overlay = scene.add.graphics();
  container.add(overlay);

  if (arena.background) {
    drawRingTowerOverlays(overlay, arena);
  } else {
    drawGlass(overlay, 850, 338);
    drawShells(overlay, 592, 372);
    drawShells(overlay, 1030, 530);
  }

  for (const item of arena.decor) {
    drawDecorItem(overlay, item);
  }

  for (const obstacle of arena.obstacles) {
    drawObstacle(overlay, obstacle);
  }

  if (!arena.background) {
    overlay.lineStyle(5, 0x050607, 1);
    overlay.strokeRect(26, 24, arena.width - 52, arena.height - 48);
    overlay.lineStyle(3, 0xff25cc, 0.95);
    overlay.strokeRect(31, 29, arena.width - 62, arena.height - 58);
  }

  return container;
};
