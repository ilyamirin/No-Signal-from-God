import Phaser from "phaser";
import type { ArenaState } from "../../game/simulation/types";

export const drawArena = (
  scene: Phaser.Scene,
  arena: ArenaState,
): Phaser.GameObjects.Container => {
  const container = scene.add.container(0, 0);
  const generatedBackground = scene.add
    .image(arena.width / 2, arena.height / 2, "generated-tv-studio-arena")
    .setDisplaySize(arena.width, arena.height);
  container.add(generatedBackground);

  const graphics = scene.add.graphics();
  container.add(graphics);

  graphics.fillStyle(0x030406, 0.18);
  graphics.fillRect(0, 0, arena.width, arena.height);
  graphics.lineStyle(8, 0x050505, 1);
  graphics.strokeRect(10, 10, arena.width - 20, arena.height - 20);
  graphics.lineStyle(4, 0xff38d4, 0.58);
  graphics.strokeRect(22, 22, arena.width - 44, arena.height - 44);
  graphics.fillStyle(0x050505, 1);
  graphics.fillRect(0, 0, arena.width, 12);
  graphics.fillRect(0, arena.height - 12, arena.width, 12);

  return container;
};
