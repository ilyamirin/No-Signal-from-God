import Phaser from "phaser";
import type { GameState } from "../../game/simulation/types";

export const updateCameraFeedback = (
  camera: Phaser.Cameras.Scene2D.Camera,
  state: GameState,
  previousBulletCount: number,
): void => {
  if (state.bullets.length > previousBulletCount) {
    camera.shake(55, 0.0035);
  }
};
