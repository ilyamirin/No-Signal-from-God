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
const security: RoomRect = { id: "security", x: 760, y: 820, width: 420, height: 350 };
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
  floorRegions: [
    roomFloor("reception-floor", reception, [0, 1]),
    roomFloor("security-floor", security, [2, 3]),
    roomFloor("newsroom-floor", newsroom, [4, 5]),
    roomFloor("server-archive-floor", serverArchive, [1, 2]),
    roomFloor("broadcast-control-floor", broadcastControl, [3, 4]),
    roomFloor("reception-security-corridor-floor", { id: "reception", x: 700, y: 950, width: 80, height: 118 }, [0, 2]),
    roomFloor("reception-newsroom-corridor-floor", { id: "reception", x: 350, y: 760, width: 130, height: 62 }, [0, 5]),
    roomFloor("security-server-corridor-floor", { id: "security", x: 1180, y: 1010, width: 82, height: 96 }, [1, 3]),
    roomFloor("security-control-corridor-floor", { id: "security", x: 1180, y: 720, width: 340, height: 122 }, [2, 4]),
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

    wall("security-top", 760, 800, 420, 22),
    wall("security-bottom", 760, 1170, 420, 22),
    wall("security-left-upper", 760, 820, 22, 120),
    wall("security-left-lower", 760, 1060, 22, 110),
    wall("security-right", 1180, 820, 22, 350),

    wall("newsroom-top", 240, 240, 900, 22),
    wall("newsroom-bottom-left", 240, 760, 390, 22),
    wall("newsroom-bottom-right", 770, 760, 370, 22),
    wall("newsroom-left", 240, 260, 22, 500),
    wall("newsroom-right", 1140, 260, 22, 500),

    wall("server-top", 1240, 820, 650, 22),
    wall("server-bottom", 1240, 1270, 650, 22),
    wall("server-left", 1240, 840, 22, 430),
    wall("server-right", 1890, 840, 22, 430),

    wall("control-top", 1220, 200, 760, 22),
    wall("control-bottom-left", 1220, 720, 300, 22),
    wall("control-bottom-right", 1650, 720, 330, 22),
    wall("control-left", 1220, 220, 22, 500),
    wall("control-right", 1980, 220, 22, 500),

    wall("security-console-hard-cover", 940, 925, 150, 48),
    wall("server-rack-hard-a", 1380, 910, 52, 250),
    wall("server-rack-hard-b", 1510, 910, 52, 250),
    wall("server-rack-hard-c", 1640, 910, 52, 250),
    wall("control-main-console-hard", 1460, 330, 280, 60),
  ],
};
