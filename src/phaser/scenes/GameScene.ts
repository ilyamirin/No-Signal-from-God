import Phaser from "phaser";
import {
  createInputBindings,
  readPlayerInput,
  type InputBindingState,
} from "../../game/input/bindings";
import { createSceneBridge, type SceneBridge } from "../adapters/sceneBridge";
import {
  createActorSprite,
  drawEnemyTexture,
  drawPlayerTexture,
  syncEnemySprite,
  syncPlayerSprite,
} from "../view/drawActors";
import { drawArena } from "../view/drawArena";

export class GameScene extends Phaser.Scene {
  private bridge!: SceneBridge;
  private bindings!: InputBindingState;
  private player!: Phaser.GameObjects.Image;
  private enemies = new Map<string, Phaser.GameObjects.Image>();

  constructor() {
    super("game");
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#07101a");
    this.bridge = createSceneBridge();
    this.bindings = createInputBindings(this);

    const state = this.bridge.getState();
    drawArena(this, state.arena);

    const playerTexture = drawPlayerTexture(this);
    this.player = createActorSprite(
      this,
      playerTexture,
      state.player.position.x,
      state.player.position.y,
    );

    for (const enemy of state.enemies) {
      const texture = drawEnemyTexture(this, enemy);
      this.enemies.set(
        enemy.id,
        createActorSprite(this, texture, enemy.position.x, enemy.position.y),
      );
    }
  }

  update(_time: number, delta: number): void {
    const input = readPlayerInput(this, this.bindings, { x: 0, y: 0 });
    const state = this.bridge.step(input, Math.min(delta, 50));

    syncPlayerSprite(this.player, state.player);

    for (const enemy of state.enemies) {
      const sprite = this.enemies.get(enemy.id);
      if (sprite) {
        syncEnemySprite(sprite, enemy);
      }
    }
  }
}
