import { describe, expect, it } from "vitest";
import { propCatalog, createProps } from "./props";

const requiredKeys = [
  "barrel", "bed_sheets", "box_big", "box_small", "cafeteria", "chair_1", "chair_2",
  "cooler", "couch_1", "couch_2", "display_1", "display_2", "fridge",
  "hospital_bed", "hospital_light", "hospital_surgery_bed", "iv", "kitchen_items",
  "laboratory_device", "laboratory_glass", "lamps", "microwave", "microscope",
  "plants", "printer", "shelf_hospital", "shelf_laboratory", "sink", "soap",
  "stove", "surgery_instruments", "table_1", "table_2", "table_3", "table_4",
  "table_5", "table_6", "table_7", "table_8", "table_9", "table_10",
  "table_11", "tablet_pen", "toilet", "toilet_door", "toilet_paper",
  "toilet_table", "toilet_wall", "trash_can_1", "trash_can_2", "trash_can_3",
  "tv", "tv_remote", "keyboard_mouse", "wall_lamp", "computer", "door_small",
  "door_heavy", "health_bag", "weapon_bag",
];

describe("prop catalog", () => {
  it("covers the usable Valentint decoration and object catalog", () => {
    expect(Object.keys(propCatalog).sort()).toEqual([...requiredKeys].sort());
  });

  it("creates starter scene props with movement colliders for furniture", () => {
    const props = createProps();

    expect(props.length).toBeGreaterThan(20);
    expect(props.some((prop) => prop.catalogKey === "table_1" && prop.collider)).toBe(true);
    expect(props.some((prop) => prop.catalogKey === "keyboard_mouse" && !prop.collider)).toBe(true);
  });
});
