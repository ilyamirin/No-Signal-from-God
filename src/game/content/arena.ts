import type { ArenaState } from "../simulation/types";

export const createArena = (): ArenaState => ({
  width: 1366,
  height: 768,
  obstacles: [
    { id: "left-news-desk", x: 215, y: 210, width: 275, height: 170, blocksMovement: true, blocksBullets: true },
    { id: "center-news-desk", x: 590, y: 220, width: 245, height: 92, blocksMovement: true, blocksBullets: true },
    { id: "server-wall", x: 920, y: 66, width: 398, height: 254, blocksMovement: true, blocksBullets: true },
    { id: "green-screen", x: 1040, y: 310, width: 280, height: 292, blocksMovement: true, blocksBullets: true },
    { id: "camera-tripod-center", x: 835, y: 495, width: 84, height: 100, blocksMovement: true, blocksBullets: false },
    { id: "bottom-control-desk", x: 238, y: 676, width: 278, height: 74, blocksMovement: true, blocksBullets: true },
  ],
  decor: [
    { id: "crt-wall-top", kind: "crt-wall", position: { x: 600, y: 72 }, rotation: 0 },
    { id: "green-screen-right", kind: "green-screen", position: { x: 1245, y: 385 }, rotation: 0 },
    { id: "floor-cable-left", kind: "cable", position: { x: 235, y: 430 }, rotation: 0.2 },
    { id: "floor-cable-right", kind: "cable", position: { x: 925, y: 310 }, rotation: -0.35 },
    { id: "studio-light-left", kind: "studio-light", position: { x: 190, y: 280 }, rotation: 0.75 },
    { id: "studio-light-right", kind: "studio-light", position: { x: 1160, y: 220 }, rotation: -0.75 },
    { id: "camera-floor-left", kind: "camera", position: { x: 252, y: 365 }, rotation: 0.5 },
    { id: "camera-floor-right", kind: "camera", position: { x: 976, y: 498 }, rotation: -1.2 },
    { id: "server-rack-main", kind: "server-rack", position: { x: 1096, y: 340 }, rotation: 0 },
    { id: "control-panel-bottom", kind: "control-panel", position: { x: 260, y: 660 }, rotation: 0 },
  ],
});
