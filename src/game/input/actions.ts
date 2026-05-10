import type { Vec2 } from "../simulation/types";

export type PlayerInput = {
  move: Vec2;
  aimWorld: Vec2;
  firing: boolean;
  restart: boolean;
  kick: boolean;
  interact: boolean;
};
