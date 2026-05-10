import Phaser from "phaser";
import {
  createInputBindings,
  readPlayerInput,
  type InputBindingState,
} from "../../game/input/bindings";
import { createSceneBridge, type SceneBridge } from "../adapters/sceneBridge";
import { createGameAudio, loadGameAudio, type GameAudioController } from "../audio/gameAudio";
import {
  createEnemyRig,
  createPlayerRig,
  syncActorRig,
  type ActorRig,
} from "../view/drawActors";
import { drawArena } from "../view/drawArena";
import { configureGameplayCamera, updateCameraFeedback } from "../view/camera";
import {
  createDoorRig,
  syncDoorRig,
  type DoorRig,
} from "../view/drawDoors";
import {
  createDroppedWeaponRig,
  syncDroppedWeaponRig,
  type DroppedWeaponRig,
} from "../view/drawDroppedWeapons";
import { drawBulletsAndFx } from "../view/drawFx";
import {
  createLevelBackgroundRig,
  syncLevelBackgroundRig,
  type LevelBackgroundRig,
} from "../view/drawLevelBackground";
import {
  createPropRig,
  syncPropRig,
  type PropRig,
} from "../view/drawProps";
import {
  createScifiFxRig,
  syncScifiFxRig,
  type ScifiFxRig,
} from "../view/drawScifiFx";
import { ensureScifiAnimations, loadScifiAssets } from "../view/scifiAssets";
import type { GameState } from "../../game/simulation/types";

export class GameScene extends Phaser.Scene {
  private bridge!: SceneBridge;
  private bindings!: InputBindingState;
  private player!: ActorRig;
  private enemies = new Map<string, ActorRig>();
  private props = new Map<string, PropRig>();
  private doors = new Map<string, DoorRig>();
  private droppedWeapons = new Map<string, DroppedWeaponRig>();
  private scifiFx!: ScifiFxRig;
  private audio!: GameAudioController;
  private background!: LevelBackgroundRig;
  private fxGraphics!: Phaser.GameObjects.Graphics;
  private previousBulletCount = 0;
  private previousState?: GameState;

  constructor() {
    super("game");
  }

  preload(): void {
    loadScifiAssets(this);
    loadGameAudio(this);
  }

  create(): void {
    this.cameras.main.setBackgroundColor("#07101a");
    ensureScifiAnimations(this);
    this.bridge = createSceneBridge();
    this.bindings = createInputBindings(this);

    const state = this.bridge.getState();
    configureGameplayCamera(this.cameras.main, state);
    this.background = createLevelBackgroundRig(this, state);
    drawArena(this, state.arena);

    for (const prop of state.props) {
      this.props.set(prop.id, createPropRig(this, prop));
    }

    for (const door of state.doors) {
      this.doors.set(door.id, createDoorRig(this, door));
    }

    for (const weapon of state.droppedWeapons) {
      this.droppedWeapons.set(weapon.id, createDroppedWeaponRig(this, weapon));
    }

    this.player = createPlayerRig(this, state.player);

    for (const enemy of state.enemies) {
      this.enemies.set(enemy.id, createEnemyRig(this, enemy));
    }

    this.fxGraphics = this.add.graphics();
    this.scifiFx = createScifiFxRig();
    this.audio = createGameAudio(this);
    this.previousState = state;
    this.emitState(state);
  }

  update(_time: number, delta: number): void {
    const input = readPlayerInput(this, this.bindings, { x: 0, y: 0 });
    const state = this.bridge.step(input, Math.min(delta, 50));
    if (this.previousState) {
      this.audio.sync(this.previousState, state);
    }

    syncActorRig(
      this.player,
      state.player,
      state.player.weaponId ? state.weapons[state.player.weaponId] : undefined,
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

    for (const prop of state.props) {
      const rig = this.props.get(prop.id);
      if (rig) {
        syncPropRig(rig, prop);
      }
    }

    for (const door of state.doors) {
      const rig = this.doors.get(door.id);
      if (rig) {
        syncDoorRig(rig, door);
      }
    }

    const liveDroppedIds = new Set(state.droppedWeapons.map((weapon) => weapon.id));
    for (const [id, rig] of this.droppedWeapons) {
      if (!liveDroppedIds.has(id)) {
        rig.sprite.destroy();
        this.droppedWeapons.delete(id);
      }
    }
    for (const weapon of state.droppedWeapons) {
      const rig = this.droppedWeapons.get(weapon.id);
      if (rig) {
        syncDroppedWeaponRig(rig, weapon);
      } else {
        this.droppedWeapons.set(weapon.id, createDroppedWeaponRig(this, weapon));
      }
    }

    drawBulletsAndFx(this.fxGraphics, state.bullets, state.fx);
    syncScifiFxRig(this, this.scifiFx, state.decals, state.fx);
    updateCameraFeedback(this.cameras.main, state, this.previousBulletCount, input.aimWorld);
    syncLevelBackgroundRig(this.background, this.cameras.main, state);
    this.previousBulletCount = state.bullets.length;
    this.previousState = state;
    this.emitState(state);
  }

  private emitState(state: ReturnType<SceneBridge["getState"]>): void {
    window.dispatchEvent(new CustomEvent("game-state-change", { detail: state }));
  }
}
