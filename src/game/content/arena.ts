import type { ArenaState } from "../simulation/types";

export const createArena = (): ArenaState => ({
  width: 1366,
  height: 768,
  obstacles: [
    { id: "top-news-desk", x: 420, y: 126, width: 350, height: 74, blocksMovement: true, blocksBullets: true },
    { id: "lower-news-desk", x: 318, y: 520, width: 360, height: 74, blocksMovement: true, blocksBullets: true },
    { id: "server-bank", x: 1050, y: 250, width: 92, height: 180, blocksMovement: true, blocksBullets: true },
    { id: "control-console", x: 130, y: 624, width: 260, height: 72, blocksMovement: true, blocksBullets: true },
    { id: "camera-tripod-left", x: 226, y: 340, width: 54, height: 54, blocksMovement: true, blocksBullets: false },
    { id: "camera-tripod-right", x: 948, y: 470, width: 56, height: 56, blocksMovement: true, blocksBullets: false },
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
