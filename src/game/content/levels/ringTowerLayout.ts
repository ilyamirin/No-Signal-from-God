import type { FloorRegion, Rect, Vec2 } from "../../simulation/types";

type ZoneId =
  | "lift"
  | "lobbyNorth"
  | "lobbyWest"
  | "lobbyEast"
  | "lobbySouth"
  | "reception"
  | "newsStudio"
  | "controlRoom"
  | "techRoom"
  | "backstage"
  | "equipmentStore"
  | "finalStudio"
  | "exitLift";

type ZoneRect = {
  id: ZoneId;
  x: number;
  y: number;
  width: number;
  height: number;
};

type WallSide = "north" | "south" | "west" | "east";

type WallOpening = {
  side: WallSide;
  from: number;
  to: number;
};

const WALL = 28;

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

const horizontalSegments = (
  id: string,
  x: number,
  y: number,
  width: number,
  side: WallSide,
  openings: WallOpening[],
): Rect[] => {
  const sorted = openings
    .filter((opening) => opening.side === side)
    .map((opening) => ({ from: Math.max(x, opening.from), to: Math.min(x + width, opening.to) }))
    .filter((opening) => opening.to > opening.from)
    .sort((a, b) => a.from - b.from);

  const segments: Rect[] = [];
  let cursor = x;
  for (const opening of sorted) {
    if (opening.from - cursor > 4) {
      segments.push(wall(`${id}-${side}-${segments.length}`, cursor, y, opening.from - cursor, WALL));
    }
    cursor = Math.max(cursor, opening.to);
  }
  if (x + width - cursor > 4) {
    segments.push(wall(`${id}-${side}-${segments.length}`, cursor, y, x + width - cursor, WALL));
  }
  return segments;
};

const verticalSegments = (
  id: string,
  x: number,
  y: number,
  height: number,
  side: WallSide,
  openings: WallOpening[],
): Rect[] => {
  const sorted = openings
    .filter((opening) => opening.side === side)
    .map((opening) => ({ from: Math.max(y, opening.from), to: Math.min(y + height, opening.to) }))
    .filter((opening) => opening.to > opening.from)
    .sort((a, b) => a.from - b.from);

  const segments: Rect[] = [];
  let cursor = y;
  for (const opening of sorted) {
    if (opening.from - cursor > 4) {
      segments.push(wall(`${id}-${side}-${segments.length}`, x, cursor, WALL, opening.from - cursor));
    }
    cursor = Math.max(cursor, opening.to);
  }
  if (y + height - cursor > 4) {
    segments.push(wall(`${id}-${side}-${segments.length}`, x, cursor, WALL, y + height - cursor));
  }
  return segments;
};

const wallsForBox = (
  id: string,
  zone: Omit<ZoneRect, "id">,
  openings: WallOpening[] = [],
): Rect[] => [
  ...horizontalSegments(id, zone.x, zone.y, zone.width, "north", openings),
  ...horizontalSegments(id, zone.x, zone.y + zone.height - WALL, zone.width, "south", openings),
  ...verticalSegments(id, zone.x, zone.y, zone.height, "west", openings),
  ...verticalSegments(id, zone.x + zone.width - WALL, zone.y, zone.height, "east", openings),
];

const lift: ZoneRect = { id: "lift", x: 1460, y: 1210, width: 280, height: 280 };
const lobbyNorth: ZoneRect = { id: "lobbyNorth", x: 540, y: 790, width: 620, height: 288 };
const lobbyWest: ZoneRect = { id: "lobbyWest", x: 780, y: 1240, width: 680, height: 420 };
const lobbyEast: ZoneRect = { id: "lobbyEast", x: 2020, y: 1320, width: 220, height: 590 };
const lobbySouth: ZoneRect = { id: "lobbySouth", x: 860, y: 1660, width: 1360, height: 250 };
const reception: ZoneRect = { id: "reception", x: 320, y: 1050, width: 460, height: 610 };
const newsStudio: ZoneRect = { id: "newsStudio", x: 700, y: 280, width: 760, height: 510 };
const controlRoom: ZoneRect = { id: "controlRoom", x: 1460, y: 280, width: 760, height: 510 };
const techRoom: ZoneRect = { id: "techRoom", x: 2220, y: 500, width: 480, height: 420 };
const backstage: ZoneRect = { id: "backstage", x: 2220, y: 1000, width: 480, height: 520 };
const equipmentStore: ZoneRect = { id: "equipmentStore", x: 520, y: 1910, width: 580, height: 430 };
const finalStudio: ZoneRect = { id: "finalStudio", x: 1180, y: 1910, width: 1040, height: 520 };
const exitLift: ZoneRect = { id: "exitLift", x: 1490, y: 1240, width: 220, height: 220 };

export const ringTowerLayout = {
  size: { width: 3200, height: 2700 },
  center: { x: 1600, y: 1350 } satisfies Vec2,
  zones: {
    lift,
    lobbyNorth,
    lobbyWest,
    lobbyEast,
    lobbySouth,
    reception,
    newsStudio,
    controlRoom,
    techRoom,
    backstage,
    equipmentStore,
    finalStudio,
    exitLift,
  },
  playerSpawn: { x: 1600, y: 1350 } satisfies Vec2,
  exitLiftTrigger: { x: exitLift.x, y: exitLift.y, width: exitLift.width, height: exitLift.height },
  routeTargets: {
    lobby: { x: 1010, y: 1350 } satisfies Vec2,
    reception: { x: 555, y: 1350 } satisfies Vec2,
    newsStudio: { x: 1080, y: 560 } satisfies Vec2,
    controlRoom: { x: 1810, y: 560 } satisfies Vec2,
    techRoom: { x: 2460, y: 720 } satisfies Vec2,
    backstage: { x: 2460, y: 1260 } satisfies Vec2,
    equipmentStore: { x: 860, y: 2130 } satisfies Vec2,
    finalStudio: { x: 1700, y: 2350 } satisfies Vec2,
    exitLift: { x: 1600, y: 1350 } satisfies Vec2,
  },
  floorRegions: [
    floor("ring-lift-floor", lift, [2, 3]),
    floor("ring-lobby-floor", lobbyNorth, [0, 2]),
    floor("ring-lobby-west-floor", lobbyWest, [0, 2]),
    floor("ring-lobby-east-floor", lobbyEast, [0, 2]),
    floor("ring-lobby-south-floor", lobbySouth, [0, 2]),
    floor("ring-reception-floor", reception, [1, 2]),
    floor("ring-reception-tech-floor", { x: reception.x, y: reception.y, width: reception.width, height: 220 }, [0, 2]),
    floor("ring-reception-carpet-floor", { x: 350, y: 1388, width: 400, height: 236 }, [3, 5]),
    floor("ring-talk-studio-floor", newsStudio, [3, 4]),
    floor("ring-control-floor", controlRoom, [2, 4]),
    floor("ring-tech-floor", techRoom, [1, 3]),
    floor("ring-backstage-floor", backstage, [1, 3]),
    floor("ring-equipment-floor", equipmentStore, [1, 5]),
    floor("ring-final-studio-floor", finalStudio, [4, 5]),
  ],
  obstacles: [
    ...wallsForBox("ring-lift-core", lift, [{ side: "west", from: 1280, to: 1392 }]),
    ...wallsForBox("ring-lobby-news-corridor", lobbyNorth, [
      { side: "north", from: 1040, to: 1152 },
      { side: "south", from: 540, to: 652 },
    ]),
    ...wallsForBox("ring-lift-vestibule", lobbyWest, [
      { side: "west", from: 1258, to: 1414 },
      { side: "east", from: 1280, to: 1392 },
      { side: "south", from: 1180, to: 1460 },
    ]),
    ...wallsForBox("ring-return-corridor", lobbySouth, [
      { side: "north", from: 1180, to: 1460 },
      { side: "south", from: 910, to: 1022 },
      { side: "south", from: 1520, to: 1632 },
      { side: "east", from: 1660, to: 1882 },
    ]),
    ...wallsForBox("ring-east-service-corridor", lobbyEast, [
      { side: "west", from: 1660, to: 1882 },
      { side: "east", from: 1320, to: 1432 },
    ]),
    ...wallsForBox("ring-reception", reception, [
      { side: "north", from: 540, to: 652 },
      { side: "east", from: 1258, to: 1414 },
    ]),
    ...wallsForBox("ring-news-studio", newsStudio, [
      { side: "south", from: 1040, to: 1152 },
      { side: "east", from: 500, to: 612 },
    ]),
    ...wallsForBox("ring-control-room", controlRoom, [
      { side: "west", from: 500, to: 612 },
      { side: "east", from: 520, to: 632 },
    ]),
    ...wallsForBox("ring-tech-room", techRoom, [
      { side: "west", from: 520, to: 632 },
      { side: "south", from: 2380, to: 2492 },
    ]),
    ...wallsForBox("ring-backstage", backstage, [
      { side: "north", from: 2380, to: 2492 },
      { side: "west", from: 1320, to: 1432 },
    ]),
    ...wallsForBox("ring-equipment-store", equipmentStore, [{ side: "north", from: 910, to: 1022 }]),
    ...wallsForBox("ring-final-studio", finalStudio, [{ side: "north", from: 1520, to: 1632 }]),

    wall("ring-outer-service-west", 280, 1000, WALL, 740),
    wall("ring-outer-service-east", 2892, 760, WALL, 1180),
    wall("ring-outer-north-cap", 640, 240, 1640, WALL),
    wall("ring-outer-south-cap", 500, 2430, 1760, WALL),
  ],
};
