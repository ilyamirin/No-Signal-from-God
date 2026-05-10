import Phaser from "phaser";
import { propCatalog } from "../../game/content/props";
import type { PropEntity } from "../../game/simulation/types";

export type PropRig = {
  sprite: Phaser.GameObjects.Sprite;
};

const textureForProp = (prop: PropEntity): string => propCatalog[prop.catalogKey].assetKey;

export const createPropRig = (scene: Phaser.Scene, prop: PropEntity): PropRig => ({
  sprite: scene.add
    .sprite(prop.position.x, prop.position.y, textureForProp(prop), prop.frame)
    .setOrigin(0.5)
    .setScale(prop.scale)
    .setRotation(prop.rotation)
    .setDepth(20),
});

export const syncPropRig = (rig: PropRig, prop: PropEntity): void => {
  rig.sprite.setPosition(prop.position.x, prop.position.y);
  rig.sprite.setRotation(prop.rotation);
  rig.sprite.setFrame(prop.frame);
  rig.sprite.setScale(prop.scale);
};
