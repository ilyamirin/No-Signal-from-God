import Phaser from "phaser";
import type { DroppedWeaponState } from "../../game/simulation/types";

export type DroppedWeaponRig = {
  sprite: Phaser.GameObjects.Container;
  body: Phaser.GameObjects.Graphics;
};

const drawWeapon = (graphics: Phaser.GameObjects.Graphics, weapon: DroppedWeaponState): void => {
  graphics.clear();
  graphics.lineStyle(2, 0x050607, 1);
  graphics.fillStyle(0xd7dad8, 1);

  if (weapon.kind === "rifle") {
    graphics.fillRect(-22, -3, 34, 6);
    graphics.fillRect(11, -2, 17, 4);
    graphics.fillRect(-9, 2, 7, 13);
    graphics.strokeRect(-22, -3, 50, 6);
    graphics.strokeRect(-9, 2, 7, 13);
    graphics.fillStyle(0x2c3238, 1);
    graphics.fillRect(-24, -4, 8, 8);
    return;
  }

  graphics.fillRect(-10, -3, 18, 7);
  graphics.fillRect(7, -2, 10, 4);
  graphics.fillRect(-5, 3, 6, 9);
  graphics.strokeRect(-10, -3, 27, 7);
  graphics.strokeRect(-5, 3, 6, 9);
};

export const createDroppedWeaponRig = (
  scene: Phaser.Scene,
  weapon: DroppedWeaponState,
): DroppedWeaponRig => {
  const body = scene.add.graphics();
  drawWeapon(body, weapon);
  const sprite = scene.add
    .container(weapon.position.x, weapon.position.y, [body])
    .setRotation(weapon.rotation)
    .setDepth(18);

  return { sprite, body };
};

export const syncDroppedWeaponRig = (rig: DroppedWeaponRig, weapon: DroppedWeaponState): void => {
  rig.sprite.setPosition(weapon.position.x, weapon.position.y);
  rig.sprite.setRotation(weapon.rotation);
  rig.sprite.setAlpha(weapon.pickupCooldownMs > 0 ? 0.65 : 1);
  drawWeapon(rig.body, weapon);
};
