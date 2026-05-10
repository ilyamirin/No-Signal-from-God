import Phaser from "phaser";
import type { DoorState } from "../../game/simulation/types";

export type DoorRig = {
  container: Phaser.GameObjects.Container;
  sprite: Phaser.GameObjects.Image;
};

const handleShouldFlip = (door: DoorState): boolean =>
  door.id.includes("-lower") || door.id.includes("-right");

export const createDoorRig = (scene: Phaser.Scene, door: DoorState): DoorRig => {
  const sprite = scene.add
    .image(door.length / 2, 0, door.assetKey)
    .setOrigin(0.5)
    .setRotation(-Math.PI / 2)
    .setFlipY(handleShouldFlip(door));

  const container = scene.add
    .container(door.hinge.x, door.hinge.y, [sprite])
    .setRotation(door.angle)
    .setDepth(22);

  return { container, sprite };
};

export const syncDoorRig = (rig: DoorRig, door: DoorState): void => {
  rig.container.setPosition(door.hinge.x, door.hinge.y);
  rig.container.setRotation(door.angle);
  rig.sprite.setTexture(door.assetKey);
  rig.sprite.setPosition(door.length / 2, 0);
  rig.sprite.setFlipY(handleShouldFlip(door));
};
