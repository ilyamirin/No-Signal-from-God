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
import { updateCameraFeedback } from "../view/camera";
import { drawBulletsAndFx } from "../view/drawFx";

export class GameScene extends Phaser.Scene {
  private bridge!: SceneBridge;
  private bindings!: InputBindingState;
  private player!: Phaser.GameObjects.Image;
  private enemies = new Map<string, Phaser.GameObjects.Image>();
  private fxGraphics!: Phaser.GameObjects.Graphics;
  private previousBulletCount = 0;

  constructor() {
    super("game");
  }

  preload(): void {
    this.load.image(
      "generated-tv-studio-arena",
      new URL("../../assets/generated/tv-studio-arena-bg.png", import.meta.url).href,
    );
    this.load.image(
      "actor-player-tv",
      new URL("../../assets/generated/actor-player-tv.png", import.meta.url).href,
    );
    this.load.image(
      "actor-enemy-ranged-crt",
      new URL("../../assets/generated/actor-enemy-ranged-crt.png", import.meta.url).href,
    );
    this.load.image(
      "actor-enemy-rush-human",
      new URL("../../assets/generated/actor-enemy-rush-human.png", import.meta.url).href,
    );
    this.load.image(
      "actor-enemy-ranged-human",
      new URL("../../assets/generated/actor-enemy-ranged-human.png", import.meta.url).href,
    );
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

    this.fxGraphics = this.add.graphics();
    this.emitState(state);
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

    drawBulletsAndFx(this.fxGraphics, state.bullets, state.fx);
    updateCameraFeedback(this.cameras.main, state, this.previousBulletCount);
    this.previousBulletCount = state.bullets.length;
    this.emitState(state);
  }

  private emitState(state: ReturnType<SceneBridge["getState"]>): void {
    window.dispatchEvent(new CustomEvent("game-state-change", { detail: state }));
  }
}
