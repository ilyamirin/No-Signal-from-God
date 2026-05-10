import Phaser from "phaser";
import type { Vec2 } from "../simulation/types";
import type { PlayerInput } from "./actions";

export type InputBindingState = {
  keys: Record<"w" | "a" | "s" | "d" | "r" | "e" | "cyrillicE", Phaser.Input.Keyboard.Key>;
};

export const createInputBindings = (scene: Phaser.Scene): InputBindingState => {
  if (!scene.input.keyboard) {
    throw new Error("Keyboard input is unavailable");
  }

  return {
    keys: {
      w: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
      a: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      s: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      d: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
      r: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
      e: scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
      cyrillicE: scene.input.keyboard.addKey("У"),
    },
  };
};

export const readPlayerInput = (
  scene: Phaser.Scene,
  bindings: InputBindingState,
  cameraOffset: Vec2,
): PlayerInput => {
  const pointer = scene.input.activePointer;
  const aimWorld = {
    x: pointer.worldX || pointer.x + cameraOffset.x,
    y: pointer.worldY || pointer.y + cameraOffset.y,
  };

  return {
    move: {
      x: Number(bindings.keys.d.isDown) - Number(bindings.keys.a.isDown),
      y: Number(bindings.keys.s.isDown) - Number(bindings.keys.w.isDown),
    },
    aimWorld,
    firing: pointer.isDown,
    restart: Phaser.Input.Keyboard.JustDown(bindings.keys.r),
    kick: false,
    interact: Phaser.Input.Keyboard.JustDown(bindings.keys.e) || Phaser.Input.Keyboard.JustDown(bindings.keys.cyrillicE),
  };
};
