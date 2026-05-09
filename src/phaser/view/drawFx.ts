import Phaser from "phaser";
import type { BulletState, FxState } from "../../game/simulation/types";

export const drawBulletsAndFx = (
  graphics: Phaser.GameObjects.Graphics,
  bullets: BulletState[],
  fx: FxState[],
): void => {
  graphics.clear();

  for (const item of fx) {
    if (item.kind === "blood") {
      graphics.fillStyle(0xb50817, Math.min(0.95, item.ttlMs / 1200));
      graphics.fillCircle(item.position.x, item.position.y, 18);
      graphics.fillCircle(item.position.x + 16, item.position.y - 8, 6);
      graphics.fillCircle(item.position.x - 12, item.position.y + 10, 7);
      graphics.fillCircle(item.position.x + 4, item.position.y + 20, 4);
    }
  }

  for (const bullet of bullets) {
    graphics.fillStyle(bullet.ownerId === "player" ? 0xfff0a6 : 0xff516e, 1);
    graphics.fillCircle(bullet.position.x, bullet.position.y, 4);
  }

  for (const item of fx) {
    if (item.kind === "muzzle") {
      graphics.fillStyle(0xfff2a0, item.ttlMs / 90);
      graphics.fillCircle(item.position.x, item.position.y, 12);
    } else if (item.kind === "casing") {
      graphics.fillStyle(0xd2ad62, Math.min(1, item.ttlMs / 300));
      graphics.fillRect(item.position.x - 3, item.position.y - 2, 9, 4);
    } else if (item.kind === "impact") {
      graphics.lineStyle(2, 0xffe2a4, Math.min(1, item.ttlMs / 120));
      graphics.strokeCircle(item.position.x, item.position.y, 10);
    }
  }
};
