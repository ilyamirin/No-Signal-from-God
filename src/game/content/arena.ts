import type { ArenaState } from "../simulation/types";
import { receptionHubLayout } from "./receptionHubLayout";

export const createArena = (): ArenaState => ({
  width: receptionHubLayout.size.width,
  height: receptionHubLayout.size.height,
  floorRegions: receptionHubLayout.floorRegions,
  obstacles: receptionHubLayout.obstacles,
  decor: [],
});
