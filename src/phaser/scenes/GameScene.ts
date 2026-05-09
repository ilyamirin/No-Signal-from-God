import Phaser from "phaser";
import {
  createInputBindings,
  readPlayerInput,
  type InputBindingState,
} from "../../game/input/bindings";
import { createSceneBridge, type SceneBridge } from "../adapters/sceneBridge";

export class GameScene extends Phaser.Scene {
  private bridge!: SceneBridge;
  private bindings!: InputBindingState;
  private player!: Phaser.GameObjects.Arc;
  private enemies = new Map<string, Phaser.GameObjects.Arc>();

  constructor() {
    super("game");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#07101a");
    this.bridge = createSceneBridge();
    this.bindings = createInputBindings(this);

    const state = this.bridge.getState();
    this.player = this.add.circle(
      state.player.position.x,
      state.player.position.y,
      18,
      0xd7f6cf,
    );

    for (const enemy of state.enemies) {
      this.enemies.set(
        enemy.id,
        this.add.circle(
          enemy.position.x,
          enemy.position.y,
          18,
          enemy.kind === "ranged" ? 0x75e9ff : 0xff4c77,
        ),
      );
    }
  }

  update(_time: number, delta: number): void {
    const input = readPlayerInput(this, this.bindings, { x: 0, y: 0 });
    const state = this.bridge.step(input, Math.min(delta, 50));

    this.player.setPosition(state.player.position.x, state.player.position.y);
    this.player.setRotation(state.player.facing);

    for (const enemy of state.enemies) {
      const sprite = this.enemies.get(enemy.id);
      if (!sprite) {
        continue;
      }
      sprite.setPosition(enemy.position.x, enemy.position.y);
      sprite.setVisible(enemy.alive);
    }
  }
}
