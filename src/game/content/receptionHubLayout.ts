import type { FloorRegion, Rect, Vec2 } from "../simulation/types";

type RoomId = "reception" | "security" | "newsroom" | "serverArchive" | "broadcastControl";

type RoomRect = {
  id: RoomId;
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

const roomFloor = (id: string, room: RoomRect, frames: number[]): FloorRegion => ({
  id,
  x: room.x,
  y: room.y,
  width: room.width,
  height: room.height,
  frames,
});

const reception: RoomRect = { id: "reception", x: 120, y: 820, width: 600, height: 430 };
const security: RoomRect = { id: "security", x: 820, y: 820, width: 420, height: 350 };
const newsroom: RoomRect = { id: "newsroom", x: 240, y: 260, width: 900, height: 500 };
const serverArchive: RoomRect = { id: "serverArchive", x: 1240, y: 840, width: 650, height: 430 };
const broadcastControl: RoomRect = { id: "broadcastControl", x: 1220, y: 220, width: 760, height: 500 };

export const receptionHubLayout = {
  size: { width: 2200, height: 1500 },
  playerSpawn: { x: 330, y: 1040 } satisfies Vec2,
  rooms: {
    reception,
    security,
    newsroom,
    serverArchive,
    broadcastControl,
  },
  routeTargets: {
    security: { x: 930, y: 1040 } satisfies Vec2,
    newsroom: { x: 700, y: 620 } satisfies Vec2,
    serverArchive: { x: 1760, y: 1035 } satisfies Vec2,
    broadcastControl: { x: 1540, y: 560 } satisfies Vec2,
  },
  floorRegions: [
    roomFloor("reception-floor", reception, [0, 1]),
    roomFloor("security-floor", security, [2, 3]),
    roomFloor("newsroom-floor", newsroom, [4, 5]),
    roomFloor("server-archive-floor", serverArchive, [1, 2]),
    roomFloor("broadcast-control-floor", broadcastControl, [3, 4]),
    roomFloor("reception-security-corridor-floor", { id: "reception", x: 720, y: 950, width: 100, height: 118 }, [0, 2]),
    roomFloor("reception-newsroom-corridor-floor", { id: "reception", x: 350, y: 760, width: 130, height: 62 }, [0, 5]),
    roomFloor("security-server-corridor-floor", { id: "security", x: 1240, y: 950, width: 70, height: 118 }, [1, 3]),
    roomFloor("security-control-corridor-floor", { id: "security", x: 1120, y: 720, width: 512, height: 100 }, [2, 4]),
  ],
  obstacles: [
    wall("outer-top", 80, 160, 1960, 26),
    wall("outer-bottom", 80, 1290, 1960, 26),
    wall("outer-left", 80, 160, 26, 1156),
    wall("outer-right", 2014, 160, 26, 1156),

    wall("reception-top-left", 120, 800, 230, 22),
    wall("reception-top-right", 480, 800, 240, 22),
    wall("reception-bottom", 120, 1250, 600, 22),
    wall("reception-left", 120, 820, 22, 430),
    wall("reception-right-upper", 698, 820, 22, 130),
    wall("reception-right-lower", 698, 1068, 22, 182),

    wall("security-top-left", 820, 800, 300, 22),
    wall("security-bottom", 820, 1170, 420, 22),
    wall("security-left-upper", 820, 820, 22, 130),
    wall("security-left-lower", 820, 1068, 22, 102),
    wall("security-right-upper", 1240, 820, 22, 130),
    wall("security-right-lower", 1240, 1068, 22, 102),

    wall("newsroom-top", 240, 240, 900, 22),
    wall("newsroom-bottom-left", 240, 760, 110, 22),
    wall("newsroom-bottom-right", 480, 760, 660, 22),
    wall("newsroom-left", 240, 260, 22, 500),
    wall("newsroom-right", 1140, 260, 22, 500),

    wall("server-top-left", 1240, 820, 280, 22),
    wall("server-top-right", 1632, 820, 258, 22),
    wall("server-bottom", 1240, 1270, 650, 22),
    wall("server-left-upper", 1240, 840, 22, 110),
    wall("server-left-lower", 1240, 1068, 22, 202),
    wall("server-right", 1890, 840, 22, 430),

    wall("control-top", 1220, 200, 760, 22),
    wall("control-bottom-left", 1220, 720, 300, 22),
    wall("control-bottom-right", 1632, 720, 348, 22),
    wall("control-left", 1220, 220, 22, 500),
    wall("control-right", 1980, 220, 22, 500),

    wall("security-console-hard-cover", 940, 925, 150, 48),
    wall("server-rack-hard-a", 1380, 910, 52, 250),
    wall("server-rack-hard-b", 1510, 910, 52, 250),
    wall("server-rack-hard-c", 1640, 910, 52, 250),
    wall("control-main-console-hard", 1460, 330, 280, 60),
  ],
};
