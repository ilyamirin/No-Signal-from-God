import Phaser from "phaser";
import type { DoorState } from "../../game/simulation/types";

export type DoorRig = {
  container: Phaser.GameObjects.Container;
  graphics: Phaser.GameObjects.Graphics;
};

const drawDoorLeaf = (graphics: Phaser.GameObjects.Graphics, door: DoorState): void => {
  const bodyHeight = door.thickness;
  graphics.clear();

  graphics.fillStyle(0x090607, 1);
  graphics.fillRect(0, -bodyHeight / 2 - 3, door.length, bodyHeight + 6);
  graphics.fillStyle(0x8b5b35, 1);
  graphics.fillRect(2, -bodyHeight / 2, door.length - 4, bodyHeight);
  graphics.fillStyle(0x4a2b1d, 1);
  graphics.fillRect(7, -bodyHeight / 2 + 2, door.length - 18, bodyHeight - 4);
  graphics.lineStyle(2, 0xd8c0a0, 1);
  graphics.strokeRect(2, -bodyHeight / 2, door.length - 4, bodyHeight);

  // The handle is intentionally near the far edge, opposite the hinge.
  graphics.fillStyle(0xd6d0bf, 1);
  graphics.fillRect(door.length - 12, -bodyHeight / 2 - 2, 4, bodyHeight + 4);

  graphics.fillStyle(0x1b1510, 1);
  graphics.fillCircle(0, 0, 3);
};

export const createDoorRig = (scene: Phaser.Scene, door: DoorState): DoorRig => {
  const graphics = scene.add.graphics();
  drawDoorLeaf(graphics, door);
  const container = scene.add
    .container(door.hinge.x, door.hinge.y, [graphics])
    .setRotation(door.angle)
    .setDepth(22);

  return { container, graphics };
};

export const syncDoorRig = (rig: DoorRig, door: DoorState): void => {
  drawDoorLeaf(rig.graphics, door);
  rig.container.setPosition(door.hinge.x, door.hinge.y);
  rig.container.setRotation(door.angle);
};
