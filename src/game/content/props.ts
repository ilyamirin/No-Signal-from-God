import type { Collider, PropCollisionClass, PropEntity, RoomTheme } from "../simulation/types";

type PropCatalogEntry = {
  assetKey: string;
  collisionClass: PropCollisionClass;
  channels: Collider["channels"];
  themes: RoomTheme[];
};

const soft = { movement: true, bullets: false, vision: false, sound: false };
const hard = { movement: true, bullets: true, vision: true, sound: true };
const visual = { movement: false, bullets: false, vision: false, sound: false };

export const propCatalog: Record<string, PropCatalogEntry> = {
  barrel: { assetKey: "scifi-barrel", collisionClass: "hardCover", channels: hard, themes: ["utility", "lab"] },
  bed_sheets: { assetKey: "scifi-bed-sheets", collisionClass: "softCover", channels: soft, themes: ["medical"] },
  box_big: { assetKey: "scifi-box-big", collisionClass: "softCover", channels: soft, themes: ["utility", "server"] },
  box_small: { assetKey: "scifi-box-small", collisionClass: "softCover", channels: soft, themes: ["utility", "server"] },
  cafeteria: { assetKey: "scifi-cafeteria", collisionClass: "softCover", channels: soft, themes: ["office"] },
  chair_1: { assetKey: "scifi-chair-1", collisionClass: "softCover", channels: soft, themes: ["office", "tvStudio"] },
  chair_2: { assetKey: "scifi-chair-2", collisionClass: "softCover", channels: soft, themes: ["office", "medical"] },
  cooler: { assetKey: "scifi-cooler", collisionClass: "softCover", channels: soft, themes: ["office", "medical"] },
  couch_1: { assetKey: "scifi-couch-1", collisionClass: "softCover", channels: soft, themes: ["office", "tvStudio"] },
  couch_2: { assetKey: "scifi-couch-2", collisionClass: "softCover", channels: soft, themes: ["office"] },
  display_1: { assetKey: "scifi-display-1", collisionClass: "thinBarrier", channels: soft, themes: ["tvStudio", "server"] },
  display_2: { assetKey: "scifi-display-2", collisionClass: "thinBarrier", channels: soft, themes: ["office", "server"] },
  fridge: { assetKey: "scifi-fridge", collisionClass: "hardCover", channels: hard, themes: ["utility", "medical"] },
  hospital_bed: { assetKey: "scifi-hospital-bed", collisionClass: "softCover", channels: soft, themes: ["medical"] },
  hospital_light: { assetKey: "scifi-hospital-light", collisionClass: "visualDecor", channels: visual, themes: ["medical"] },
  hospital_surgery_bed: { assetKey: "scifi-hospital-surgery-bed", collisionClass: "softCover", channels: soft, themes: ["medical"] },
  iv: { assetKey: "scifi-iv", collisionClass: "softCover", channels: soft, themes: ["medical"] },
  kitchen_items: { assetKey: "scifi-kitchen-items", collisionClass: "visualDecor", channels: visual, themes: ["utility"] },
  keyboard_mouse: { assetKey: "scifi-keyboard-mouse", collisionClass: "visualDecor", channels: visual, themes: ["office", "server"] },
  laboratory_device: { assetKey: "scifi-lab-device", collisionClass: "hardCover", channels: hard, themes: ["lab"] },
  laboratory_glass: { assetKey: "scifi-lab-glass", collisionClass: "thinBarrier", channels: soft, themes: ["lab"] },
  lamps: { assetKey: "scifi-lamps", collisionClass: "visualDecor", channels: visual, themes: ["office", "tvStudio"] },
  microwave: { assetKey: "scifi-microwave", collisionClass: "softCover", channels: soft, themes: ["utility", "office"] },
  microscope: { assetKey: "scifi-microscope", collisionClass: "visualDecor", channels: visual, themes: ["lab"] },
  plants: { assetKey: "scifi-plant", collisionClass: "softCover", channels: soft, themes: ["office", "tvStudio"] },
  printer: { assetKey: "scifi-printer", collisionClass: "softCover", channels: soft, themes: ["office"] },
  shelf_hospital: { assetKey: "scifi-shelf-hospital", collisionClass: "hardCover", channels: hard, themes: ["medical"] },
  shelf_laboratory: { assetKey: "scifi-shelf-laboratory", collisionClass: "hardCover", channels: hard, themes: ["lab"] },
  sink: { assetKey: "scifi-sink", collisionClass: "hardCover", channels: hard, themes: ["utility", "medical"] },
  soap: { assetKey: "scifi-soap", collisionClass: "visualDecor", channels: visual, themes: ["utility", "medical"] },
  stove: { assetKey: "scifi-stove", collisionClass: "hardCover", channels: hard, themes: ["utility"] },
  surgery_instruments: { assetKey: "scifi-surgery-instruments", collisionClass: "visualDecor", channels: visual, themes: ["medical"] },
  table_1: { assetKey: "scifi-table-1", collisionClass: "softCover", channels: soft, themes: ["tvStudio", "office", "lab"] },
  table_2: { assetKey: "scifi-table-2", collisionClass: "softCover", channels: soft, themes: ["office", "lab"] },
  table_3: { assetKey: "scifi-table-3", collisionClass: "softCover", channels: soft, themes: ["office", "medical"] },
  table_4: { assetKey: "scifi-table-4", collisionClass: "softCover", channels: soft, themes: ["office"] },
  table_5: { assetKey: "scifi-table-5", collisionClass: "softCover", channels: soft, themes: ["tvStudio"] },
  table_6: { assetKey: "scifi-table-6", collisionClass: "softCover", channels: soft, themes: ["lab"] },
  table_7: { assetKey: "scifi-table-7", collisionClass: "softCover", channels: soft, themes: ["lab"] },
  table_8: { assetKey: "scifi-table-8", collisionClass: "softCover", channels: soft, themes: ["office"] },
  table_9: { assetKey: "scifi-table-9", collisionClass: "softCover", channels: soft, themes: ["lab"] },
  table_10: { assetKey: "scifi-table-10", collisionClass: "softCover", channels: soft, themes: ["office"] },
  table_11: { assetKey: "scifi-table-11", collisionClass: "softCover", channels: soft, themes: ["office"] },
  tablet_pen: { assetKey: "scifi-tablet-pen", collisionClass: "visualDecor", channels: visual, themes: ["office", "lab"] },
  toilet: { assetKey: "scifi-toilet", collisionClass: "hardCover", channels: hard, themes: ["utility"] },
  toilet_door: { assetKey: "scifi-toilet-door", collisionClass: "hardCover", channels: hard, themes: ["utility"] },
  toilet_paper: { assetKey: "scifi-toilet-paper", collisionClass: "visualDecor", channels: visual, themes: ["utility"] },
  toilet_table: { assetKey: "scifi-toilet-table", collisionClass: "softCover", channels: soft, themes: ["utility"] },
  toilet_wall: { assetKey: "scifi-toilet-wall", collisionClass: "hardCover", channels: hard, themes: ["utility"] },
  trash_can_1: { assetKey: "scifi-trash-can-1", collisionClass: "softCover", channels: soft, themes: ["office", "utility"] },
  trash_can_2: { assetKey: "scifi-trash-can-2", collisionClass: "softCover", channels: soft, themes: ["office", "utility"] },
  trash_can_3: { assetKey: "scifi-trash-can-3", collisionClass: "softCover", channels: soft, themes: ["office", "utility"] },
  tv: { assetKey: "scifi-tv-sheet", collisionClass: "softCover", channels: soft, themes: ["tvStudio", "office"] },
  tv_remote: { assetKey: "scifi-tv-remote", collisionClass: "visualDecor", channels: visual, themes: ["tvStudio", "office"] },
  wall_lamp: { assetKey: "scifi-lamp", collisionClass: "visualDecor", channels: visual, themes: ["tvStudio", "office"] },
  computer: { assetKey: "scifi-computer-sheet", collisionClass: "softCover", channels: soft, themes: ["server", "office"] },
  door_small: { assetKey: "scifi-door-small", collisionClass: "hardCover", channels: hard, themes: ["office", "server"] },
  door_heavy: { assetKey: "scifi-door-heavy", collisionClass: "hardCover", channels: hard, themes: ["server", "lab"] },
  health_bag: { assetKey: "scifi-health-bag", collisionClass: "interactivePickup", channels: visual, themes: ["medical"] },
  weapon_bag: { assetKey: "scifi-weapon-bag", collisionClass: "interactivePickup", channels: visual, themes: ["utility"] },
};

const prop = (
  id: string,
  catalogKey: string,
  x: number,
  y: number,
  width: number,
  height: number,
  options: { frame?: number; scale?: number; rotation?: number; collider?: boolean } = {},
): PropEntity => {
  const entry = propCatalog[catalogKey];
  const collider: Collider | undefined = options.collider === false || !entry.channels.movement
    ? undefined
    : {
        id: `prop-${id}`,
        kind: "rect",
        rect: { x: x - width / 2, y: y - height / 2, width, height },
        channels: entry.channels,
      };

  return {
    id,
    catalogKey,
    position: { x, y },
    rotation: options.rotation ?? 0,
    frame: options.frame ?? 0,
    scale: options.scale ?? 1,
    collider,
  };
};

export const createProps = (): PropEntity[] => [
  prop("reception-desk", "table_1", 285, 920, 210, 70, { frame: 1, scale: 2.55 }),
  prop("reception-couch-left", "couch_1", 205, 1140, 118, 52, { frame: 1, scale: 1.85, rotation: Math.PI / 2 }),
  prop("reception-chair-right", "chair_1", 520, 1120, 38, 36, { frame: 1, scale: 1.55, rotation: -Math.PI / 2 }),
  prop("reception-coffee-table", "table_4", 390, 1135, 84, 48, { scale: 1.8 }),
  prop("reception-plant-a", "plants", 170, 875, 38, 38, { frame: 2, scale: 1.45 }),
  prop("reception-plant-b", "plants", 650, 1215, 38, 38, { scale: 1.45 }),

  prop("security-counter", "table_8", 1008, 950, 160, 58, { scale: 1.9 }),
  prop("security-computer", "computer", 1030, 918, 46, 38, { frame: 5, scale: 1.7, collider: false }),
  prop("security-chair", "chair_2", 990, 1028, 38, 36, { scale: 1.55, rotation: Math.PI }),
  prop("security-display", "display_2", 1138, 890, 94, 46, { frame: 1, scale: 1.8, rotation: -0.2 }),

  prop("newsroom-anchor-desk", "table_5", 610, 420, 176, 64, { scale: 2.25 }),
  prop("newsroom-desk-left", "table_2", 390, 570, 128, 58, { scale: 1.9 }),
  prop("newsroom-desk-right", "table_3", 880, 575, 128, 58, { scale: 1.9 }),
  prop("newsroom-chair-a", "chair_1", 575, 350, 38, 36, { scale: 1.55, rotation: Math.PI }),
  prop("newsroom-chair-b", "chair_1", 650, 350, 38, 36, { frame: 1, scale: 1.55, rotation: Math.PI }),
  prop("newsroom-tv-wall-a", "tv", 370, 300, 84, 48, { frame: 1, scale: 1.65 }),
  prop("newsroom-tv-wall-b", "tv", 500, 300, 84, 48, { scale: 1.65 }),
  prop("newsroom-display-floor", "display_1", 950, 650, 94, 46, { frame: 1, scale: 1.8, rotation: 0.35 }),
  prop("newsroom-plant", "plants", 300, 700, 38, 38, { scale: 1.45 }),

  prop("server-rack-prop-a", "laboratory_device", 1410, 1035, 62, 62, { scale: 1.85 }),
  prop("server-rack-prop-b", "laboratory_device", 1540, 1035, 62, 62, { scale: 1.85 }),
  prop("server-box-big", "box_big", 1785, 1160, 58, 58, { scale: 1.05, rotation: 0.2 }),
  prop("server-box-small", "box_small", 1725, 1168, 34, 34, { scale: 1.1, rotation: -0.25 }),
  prop("server-computer-a", "computer", 1330, 910, 46, 38, { frame: 6, scale: 1.7 }),
  prop("server-trash", "trash_can_2", 1845, 900, 36, 36, { scale: 1.4 }),

  prop("control-main-desk", "table_1", 1600, 360, 210, 70, { frame: 1, scale: 2.55 }),
  prop("control-side-desk", "table_10", 1810, 560, 140, 58, { scale: 1.9 }),
  prop("control-tv-a", "tv", 1370, 280, 84, 48, { frame: 1, scale: 1.75 }),
  prop("control-tv-b", "tv", 1490, 280, 84, 48, { scale: 1.75 }),
  prop("control-tv-c", "tv", 1610, 280, 84, 48, { frame: 1, scale: 1.75 }),
  prop("control-keyboard", "keyboard_mouse", 1600, 330, 32, 32, { scale: 1.2, collider: false }),
  prop("control-fallen-display", "display_1", 1320, 625, 94, 46, { scale: 1.8, rotation: -0.65 }),
  prop("control-chair", "chair_1", 1705, 420, 38, 36, { frame: 1, scale: 1.55 }),
];
