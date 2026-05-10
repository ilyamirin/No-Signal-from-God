import Phaser from "phaser";
import type { GameState, Vec2 } from "../../game/simulation/types";
import { CAMERA_ZOOM, FOLLOW_LERP, calculateCameraTarget, lerp } from "./cameraMath";

export const configureGameplayCamera = (
  camera: Phaser.Cameras.Scene2D.Camera,
  state: GameState,
): void => {
  camera.setZoom(CAMERA_ZOOM);
  camera.setBounds(0, 0, state.arena.width, state.arena.height);
  camera.centerOn(state.player.position.x, state.player.position.y);
};

export const updateCameraFeedback = (
  camera: Phaser.Cameras.Scene2D.Camera,
  state: GameState,
  previousBulletCount: number,
  aimWorld: Vec2,
): void => {
  const target = calculateCameraTarget(
    state.player.position,
    aimWorld,
    { width: state.arena.width, height: state.arena.height },
    { width: camera.width, height: camera.height },
    camera.zoom,
  );

  const current = camera.midPoint;
  camera.centerOn(
    lerp(current.x, target.x, FOLLOW_LERP),
    lerp(current.y, target.y, FOLLOW_LERP),
  );

  if (state.bullets.length > previousBulletCount) {
    camera.shake(55, 0.0035);
  }
};
