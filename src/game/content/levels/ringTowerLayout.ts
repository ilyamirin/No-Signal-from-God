import type { FloorRegion, Rect, Vec2 } from "../../simulation/types";

type ZoneId =
  | "lift"
  | "lobby"
  | "reception"
  | "talkStudio"
  | "controlRoom"
  | "backstage"
  | "finalStudio"
  | "exitLift";

type ZoneRect = {
  id: ZoneId;
  x: number;
  y: number;
  width: number;
  height: number;
};

const wall = (id: string, x: number, y: number, width: number, height: number): Rect => ({
  id,
  x,
  y,
  width,
  height,
  blocksMovement: true,
  blocksBullets: true,
});

const floor = (id: string, zone: Omit<ZoneRect, "id">, frames: number[]): FloorRegion => ({
  id,
  x: zone.x,
  y: zone.y,
  width: zone.width,
  height: zone.height,
  frames,
});

const lift: ZoneRect = { id: "lift", x: 1210, y: 820, width: 180, height: 150 };
const lobby: ZoneRect = { id: "lobby", x: 1040, y: 650, width: 520, height: 480 };
const reception: ZoneRect = { id: "reception", x: 320, y: 650, width: 620, height: 420 };
const talkStudio: ZoneRect = { id: "talkStudio", x: 300, y: 190, width: 850, height: 410 };
const controlRoom: ZoneRect = { id: "controlRoom", x: 1180, y: 190, width: 700, height: 410 };
const backstage: ZoneRect = { id: "backstage", x: 1660, y: 660, width: 620, height: 460 };
const finalStudio: ZoneRect = { id: "finalStudio", x: 760, y: 1230, width: 1040, height: 470 };
const exitLift: ZoneRect = { id: "exitLift", x: 1218, y: 845, width: 164, height: 118 };

export const ringTowerLayout = {
  size: { width: 2600, height: 1900 },
  zones: {
    lift,
    lobby,
    reception,
    talkStudio,
    controlRoom,
    backstage,
    finalStudio,
    exitLift,
  },
  playerSpawn: { x: 1300, y: 910 } satisfies Vec2,
  exitLiftTrigger: { x: exitLift.x, y: exitLift.y, width: exitLift.width, height: exitLift.height },
  routeTargets: {
    lobby: { x: 1300, y: 1040 } satisfies Vec2,
    reception: { x: 555, y: 850 } satisfies Vec2,
    talkStudio: { x: 620, y: 500 } satisfies Vec2,
    controlRoom: { x: 1510, y: 480 } satisfies Vec2,
    backstage: { x: 1960, y: 890 } satisfies Vec2,
    finalStudio: { x: 1280, y: 1600 } satisfies Vec2,
    exitLift: { x: 1300, y: 910 } satisfies Vec2,
  },
  floorRegions: [
    floor("ring-lift-floor", lift, [2, 3]),
    floor("ring-lobby-floor", lobby, [0, 2]),
    floor("ring-reception-floor", reception, [1, 2]),
    floor("ring-talk-studio-floor", talkStudio, [3, 4]),
    floor("ring-control-floor", controlRoom, [2, 4]),
    floor("ring-backstage-floor", backstage, [1, 3]),
    floor("ring-final-studio-floor", finalStudio, [4, 5]),
    floor("ring-lobby-reception-corridor-floor", { x: 930, y: 805, width: 110, height: 120 }, [0, 2]),
    floor("ring-reception-studio-corridor-floor", { x: 560, y: 600, width: 150, height: 60 }, [1, 3]),
    floor("ring-studio-control-corridor-floor", { x: 1150, y: 340, width: 80, height: 120 }, [2, 4]),
    floor("ring-control-backstage-corridor-floor", { x: 1880, y: 520, width: 110, height: 160 }, [1, 4]),
    floor("ring-backstage-final-corridor-floor", { x: 1660, y: 1120, width: 160, height: 120 }, [3, 5]),
    floor("ring-final-lobby-return-floor", { x: 1180, y: 1130, width: 230, height: 100 }, [0, 4]),
  ],
  obstacles: [
    wall("ring-outer-north", 240, 130, 2100, 32),
    wall("ring-outer-south", 240, 1740, 2100, 32),
    wall("ring-outer-west", 240, 130, 32, 1642),
    wall("ring-outer-east", 2308, 130, 32, 1642),

    wall("ring-lobby-inner-north-left", 1040, 650, 170, 26),
    wall("ring-lobby-inner-north-right", 1390, 650, 170, 26),
    wall("ring-lobby-inner-south-left", 1040, 1110, 170, 26),
    wall("ring-lobby-inner-south-right", 1390, 1110, 170, 26),
    wall("ring-lobby-west-upper", 1040, 650, 26, 155),
    wall("ring-lobby-west-lower", 1040, 925, 26, 205),
    wall("ring-lobby-east-upper", 1534, 650, 26, 155),
    wall("ring-lobby-east-lower", 1534, 925, 26, 205),

    wall("ring-reception-north", 320, 650, 620, 26),
    wall("ring-reception-south", 320, 1070, 620, 26),
    wall("ring-reception-west", 320, 650, 26, 446),
    wall("ring-reception-east-upper", 914, 650, 26, 155),
    wall("ring-reception-east-lower", 914, 925, 26, 171),

    wall("ring-talk-north", 300, 190, 850, 26),
    wall("ring-talk-west", 300, 190, 26, 410),
    wall("ring-talk-east-upper", 1124, 190, 26, 150),
    wall("ring-talk-east-lower", 1124, 460, 26, 140),
    wall("ring-talk-south-left", 300, 574, 260, 26),
    wall("ring-talk-south-right", 710, 574, 440, 26),

    wall("ring-control-north", 1180, 190, 700, 26),
    wall("ring-control-south-left", 1180, 574, 500, 26),
    wall("ring-control-west-upper", 1180, 190, 26, 150),
    wall("ring-control-west-lower", 1180, 460, 26, 140),
    wall("ring-control-east-upper", 1854, 190, 26, 330),

    wall("ring-backstage-north-left", 1660, 660, 220, 26),
    wall("ring-backstage-north-right", 1990, 660, 290, 26),
    wall("ring-backstage-east", 2254, 660, 26, 460),
    wall("ring-backstage-west-upper", 1660, 660, 26, 200),
    wall("ring-backstage-west-lower", 1660, 980, 26, 140),
    wall("ring-backstage-south-left", 1660, 1094, 160, 26),
    wall("ring-backstage-south-right", 1960, 1094, 320, 26),

    wall("ring-final-north-left", 760, 1230, 420, 26),
    wall("ring-final-north-right", 1410, 1230, 390, 26),
    wall("ring-final-south", 760, 1700, 1040, 26),
    wall("ring-final-west", 760, 1230, 26, 496),
    wall("ring-final-east", 1774, 1230, 26, 496),
  ],
};
