import Phaser from "phaser";
import type { DecalState, FxState } from "../../game/simulation/types";

export type ScifiFxRig = {
  decals: Map<string, Phaser.GameObjects.Sprite>;
  particles: Map<string, Phaser.GameObjects.Sprite>;
};

export const createScifiFxRig = (): ScifiFxRig => ({
  decals: new Map(),
  particles: new Map(),
});

const decalTexture = (decal: DecalState): string =>
  decal.kind === "player-blood" ? "scifi-player-blood-floor" : "scifi-blood-floor";

const particleTexture = (fx: FxState): string | undefined => {
  if (fx.kind === "bullet-puff") return "scifi-bullet-puff";
  if (fx.kind === "blood-death") return "scifi-monster-blood-death";
  if (fx.kind === "blood") return "scifi-monster-blood-splash";
  return undefined;
};

export const syncScifiFxRig = (
  scene: Phaser.Scene,
  rig: ScifiFxRig,
  decals: DecalState[],
  fx: FxState[],
): void => {
  const decalIds = new Set(decals.map((decal) => decal.id));
  for (const [id, sprite] of rig.decals) {
    if (!decalIds.has(id)) {
      sprite.destroy();
      rig.decals.delete(id);
    }
  }

  for (const decal of decals) {
    const existing = rig.decals.get(decal.id);
    if (existing) {
      continue;
    }
    const sprite = scene.add
      .sprite(decal.position.x, decal.position.y, decalTexture(decal), decal.frame)
      .setOrigin(0.5)
      .setScale(decal.scale)
      .setRotation(decal.rotation)
      .setDepth(14)
      .setAlpha(0.9);
    rig.decals.set(decal.id, sprite);
  }

  const particleIds = new Set(fx.map((item) => item.id));
  for (const [id, sprite] of rig.particles) {
    if (!particleIds.has(id)) {
      sprite.destroy();
      rig.particles.delete(id);
    }
  }

  for (const item of fx) {
    const texture = particleTexture(item);
    if (!texture || rig.particles.has(item.id)) {
      continue;
    }
    const sprite = scene.add
      .sprite(item.position.x, item.position.y, texture, item.frame ?? 0)
      .setOrigin(0.5)
      .setScale(item.kind === "blood-death" ? 1.7 : 1.15)
      .setRotation(item.rotation)
      .setDepth(31);
    sprite.play(texture);
    rig.particles.set(item.id, sprite);
  }
};
