import Phaser from "phaser";
import {
  createInputBindings,
  readPlayerInput,
  type InputBindingState,
} from "../../game/input/bindings";
import { createSceneBridge, type SceneBridge } from "../adapters/sceneBridge";
import {
  createEnemyRig,
  createPlayerRig,
  loadBakedActorSheets,
  syncActorRig,
  type ActorRig,
} from "../view/drawActors";
import { drawArena } from "../view/drawArena";
import { updateCameraFeedback } from "../view/camera";
import { drawBulletsAndFx } from "../view/drawFx";

export class GameScene extends Phaser.Scene {
  private bridge!: SceneBridge;
  private bindings!: InputBindingState;
  private player!: ActorRig;
  private enemies = new Map<string, ActorRig>();
  private fxGraphics!: Phaser.GameObjects.Graphics;
  private previousBulletCount = 0;

  constructor() {
    super("game");
  }

  preload(): void {
    loadBakedActorSheets(this);
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#07101a");
    this.bridge = createSceneBridge();
    this.bindings = createInputBindings(this);

    const state = this.bridge.getState();
    drawArena(this, state.arena);

    this.player = createPlayerRig(this, state.player);

    for (const enemy of state.enemies) {
      this.enemies.set(enemy.id, createEnemyRig(this, enemy));
    }

    this.fxGraphics = this.add.graphics();
    this.emitState(state);
  }

  update(_time: number, delta: number): void {
    const input = readPlayerInput(this, this.bindings, { x: 0, y: 0 });
    const state = this.bridge.step(input, Math.min(delta, 50));

    syncActorRig(
      this.player,
      state.player,
      state.weapons[state.player.weaponId],
      Math.min(delta, 50),
    );

    for (const enemy of state.enemies) {
      const rig = this.enemies.get(enemy.id);
      if (rig) {
        syncActorRig(
          rig,
          enemy,
          enemy.weaponId ? state.weapons[enemy.weaponId] : undefined,
          Math.min(delta, 50),
        );
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
