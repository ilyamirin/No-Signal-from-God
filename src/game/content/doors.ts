import type { DoorState, Vec2 } from "../simulation/types";

const LEAF_LENGTH = 56;
const LEAF_THICKNESS = 7;

const door = (
  id: string,
  hinge: Vec2,
  closedAngle: number,
  openAngle: number,
  minAngle: number,
  maxAngle: number,
): DoorState => ({
  id,
  assetKey: "scifi-door",
  hinge,
  length: LEAF_LENGTH,
  thickness: LEAF_THICKNESS,
  closedAngle,
  openAngle,
  minAngle,
  maxAngle,
  angle: closedAngle,
  targetAngle: closedAngle,
  angularVelocity: 0,
  state: "closed",
  blocksBullets: true,
});

export const createDoors = (): DoorState[] => [
  door("reception-security-double-upper", { x: 720, y: 950 }, Math.PI / 2, 0, 0, Math.PI),
  door("reception-security-double-lower", { x: 720, y: 1062 }, -Math.PI / 2, 0, -Math.PI, 0),

  door("reception-newsroom-double-left", { x: 350, y: 800 }, 0, -Math.PI / 2, -Math.PI / 2, Math.PI / 2),
  door("reception-newsroom-double-right", { x: 462, y: 800 }, Math.PI, -Math.PI / 2, Math.PI / 2, Math.PI),

  door("security-server-double-upper", { x: 1240, y: 950 }, Math.PI / 2, Math.PI, 0, Math.PI),
  door("security-server-double-lower", { x: 1240, y: 1062 }, -Math.PI / 2, Math.PI, -Math.PI, 0),

  door("control-entry-double-left", { x: 1520, y: 720 }, 0, Math.PI / 2, -Math.PI / 2, Math.PI / 2),
  door("control-entry-double-right", { x: 1632, y: 720 }, Math.PI, Math.PI / 2, Math.PI / 2, Math.PI),
];
