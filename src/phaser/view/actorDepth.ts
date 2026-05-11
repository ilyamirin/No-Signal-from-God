export const LIVE_ACTOR_DEPTH = 25;
export const CORPSE_ACTOR_DEPTH = 16;

export const actorDepthFor = (alive: boolean): number =>
  alive ? LIVE_ACTOR_DEPTH : CORPSE_ACTOR_DEPTH;
