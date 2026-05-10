import Phaser from "phaser";
import type { DoorState } from "../../game/simulation/types";

export type DoorRig = {
  sprite: Phaser.GameObjects.Image;
};

export const createDoorRig = (scene: Phaser.Scene, door: DoorState): DoorRig => ({
  sprite: scene.add
    .image(door.hinge.x, door.hinge.y, door.assetKey)
    .setOrigin(0, 0.5)
    .setDisplaySize(door.length, door.thickness * 3)
    .setRotation(door.angle)
    .setDepth(22),
});

export const syncDoorRig = (rig: DoorRig, door: DoorState): void => {
  rig.sprite.setPosition(door.hinge.x, door.hinge.y);
  rig.sprite.setRotation(door.angle);
  rig.sprite.setAlpha(door.state === "open" ? 0.92 : 1);
};
