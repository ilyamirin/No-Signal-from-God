import Phaser from "phaser";
import type { GameState } from "../../game/simulation/types";

export type LevelBackgroundRig = {
  city?: Phaser.GameObjects.TileSprite;
  towerGlass?: Phaser.GameObjects.Graphics;
};

export const parallaxPosition = (cameraScroll: number, factor: number): number =>
  -cameraScroll * factor;

export const createLevelBackgroundRig = (scene: Phaser.Scene, state: GameState): LevelBackgroundRig => {
  const rig: LevelBackgroundRig = {};
  if (state.arena.background?.cityTextureKey) {
    rig.city = scene.add
      .tileSprite(0, 0, state.arena.width * 1.4, state.arena.height * 1.4, state.arena.background.cityTextureKey)
      .setOrigin(0)
      .setScrollFactor(0)
      .setDepth(-100)
      .setAlpha(0.78);
  }

  rig.towerGlass = scene.add.graphics().setDepth(-50).setScrollFactor(1);
  rig.towerGlass.fillStyle(0x08111a, 0.22);
  rig.towerGlass.fillEllipse(state.arena.width / 2, state.arena.height / 2, state.arena.width * 0.9, state.arena.height * 0.8);
  rig.towerGlass.lineStyle(18, 0x6dd7ff, 0.18);
  rig.towerGlass.strokeEllipse(state.arena.width / 2, state.arena.height / 2, state.arena.width * 0.86, state.arena.height * 0.78);
  rig.towerGlass.lineStyle(5, 0xffffff, 0.12);
  rig.towerGlass.strokeEllipse(state.arena.width / 2, state.arena.height / 2, state.arena.width * 0.78, state.arena.height * 0.68);

  return rig;
};

export const syncLevelBackgroundRig = (
  rig: LevelBackgroundRig,
  camera: Phaser.Cameras.Scene2D.Camera,
  state: GameState,
): void => {
  if (!rig.city) {
    return;
  }
  const factor = state.arena.background?.cityParallax ?? 0.35;
  rig.city.tilePositionX = parallaxPosition(camera.scrollX, factor);
  rig.city.tilePositionY = parallaxPosition(camera.scrollY, factor);
};
