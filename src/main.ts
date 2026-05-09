import Phaser from "phaser";
import { GameScene } from "./phaser/scenes/GameScene";
import "./styles.css";

const gameRoot = document.querySelector<HTMLDivElement>("#game-root");

if (!gameRoot) {
  throw new Error("Missing #game-root");
}

new Phaser.Game({
  type: Phaser.AUTO,
  parent: gameRoot,
  width: 1366,
  height: 768,
  backgroundColor: "#05070b",
  pixelArt: true,
  roundPixels: true,
  scene: [GameScene],
  physics: {
    default: "arcade",
    arcade: {
      debug: false,
    },
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
