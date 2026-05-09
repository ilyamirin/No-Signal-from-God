import Phaser from "phaser";
import "./styles.css";

class PlaceholderScene extends Phaser.Scene {
  constructor() {
    super("placeholder");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#08111d");
    this.add.text(48, 48, "TV STUDIO SHOOTER", {
      fontFamily: "Courier New",
      fontSize: "32px",
      color: "#ffd2f1",
      backgroundColor: "#050505",
      padding: { x: 12, y: 8 },
    });
  }
}

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
  scene: [PlaceholderScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
});
