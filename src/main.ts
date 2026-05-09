import Phaser from "phaser";
import type { GameState } from "./game/simulation/types";
import { GameScene } from "./phaser/scenes/GameScene";
import { createHud } from "./ui/hud/createHud";
import "./styles.css";

const gameRoot = document.querySelector<HTMLDivElement>("#game-root");
const hudRoot = document.querySelector<HTMLDivElement>("#hud-root");

if (!gameRoot) {
  throw new Error("Missing #game-root");
}

if (!hudRoot) {
  throw new Error("Missing #hud-root");
}

const hud = createHud(hudRoot);
window.addEventListener("game-state-change", (event) => {
  hud.update((event as CustomEvent<GameState>).detail);
});

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
