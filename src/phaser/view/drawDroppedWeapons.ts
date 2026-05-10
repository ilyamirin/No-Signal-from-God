import Phaser from "phaser";
import type { DroppedWeaponState } from "../../game/simulation/types";

export type DroppedWeaponRig = {
  sprite: Phaser.GameObjects.Sprite;
};

const textureForWeapon = (weapon: DroppedWeaponState): string =>
  weapon.kind === "rifle" ? "scifi-player-idle-rifle" : "scifi-player-idle-pistol";

export const createDroppedWeaponRig = (
  scene: Phaser.Scene,
  weapon: DroppedWeaponState,
): DroppedWeaponRig => ({
  sprite: scene.add
    .sprite(weapon.position.x, weapon.position.y, textureForWeapon(weapon), 0)
    .setOrigin(0.5)
    .setScale(0.7)
    .setRotation(weapon.rotation)
    .setDepth(18),
});

export const syncDroppedWeaponRig = (rig: DroppedWeaponRig, weapon: DroppedWeaponState): void => {
  rig.sprite.setPosition(weapon.position.x, weapon.position.y);
  rig.sprite.setRotation(weapon.rotation);
  rig.sprite.setTexture(textureForWeapon(weapon), 0);
  rig.sprite.setAlpha(weapon.pickupCooldownMs > 0 ? 0.65 : 1);
};
