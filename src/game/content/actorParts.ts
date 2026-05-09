import type { HeadType } from "../simulation/types";

export type ActorPartSlot = "legs" | "torso" | "head" | "arms" | "weapon";
export type ActorPartTag =
  | "human"
  | "crt"
  | "robot"
  | "suit"
  | "broadcast"
  | "ranged"
  | "rush"
  | "pistol"
  | "shotgun";

export type PartAnchor = {
  x: number;
  y: number;
};

export type ActorPartDefinition = {
  id: string;
  slot: ActorPartSlot;
  label: string;
  spriteKey: string;
  tags: ActorPartTag[];
  anchor: PartAnchor;
};

export type WeaponPoseDefinition = {
  id: string;
  weaponIds: string[];
  label: string;
  armsPartId: string;
  weaponPartId: string;
  gripOffset: PartAnchor;
  recoilDistance: number;
  recoilDegrees: number;
};

export type ActorRigPreset = {
  id: string;
  label: string;
  legsPartId: string;
  torsoPartId: string;
  headPartId: string;
  defaultWeaponPoseId?: string;
  tags: ActorPartTag[];
};

export const actorParts: ActorPartDefinition[] = [
  {
    id: "legs-suit-runner",
    slot: "legs",
    label: "Suit runner legs",
    spriteKey: "part-legs-suit-runner",
    tags: ["human", "suit"],
    anchor: { x: 0, y: 10 },
  },
  {
    id: "legs-broadcast-guard",
    slot: "legs",
    label: "Broadcast guard legs",
    spriteKey: "part-legs-broadcast-guard",
    tags: ["human", "broadcast"],
    anchor: { x: 0, y: 10 },
  },
  {
    id: "torso-suit",
    slot: "torso",
    label: "Dark suit torso",
    spriteKey: "part-torso-suit",
    tags: ["human", "suit"],
    anchor: { x: 0, y: 0 },
  },
  {
    id: "torso-broadcast-guard",
    slot: "torso",
    label: "Broadcast guard torso",
    spriteKey: "part-torso-broadcast-guard",
    tags: ["human", "broadcast"],
    anchor: { x: 0, y: 0 },
  },
  {
    id: "head-crt-90s",
    slot: "head",
    label: "1990s CRT head",
    spriteKey: "part-head-crt-90s",
    tags: ["crt"],
    anchor: { x: 0, y: -22 },
  },
  {
    id: "head-human-short-hair",
    slot: "head",
    label: "Human short hair head",
    spriteKey: "part-head-human-short-hair",
    tags: ["human"],
    anchor: { x: 0, y: -22 },
  },
  {
    id: "head-robot-monitor",
    slot: "head",
    label: "Robot monitor head",
    spriteKey: "part-head-robot-monitor",
    tags: ["robot"],
    anchor: { x: 0, y: -22 },
  },
  {
    id: "arms-suit-pistol",
    slot: "arms",
    label: "Suit pistol arms",
    spriteKey: "part-arms-suit-pistol",
    tags: ["human", "suit", "pistol"],
    anchor: { x: 0, y: -2 },
  },
  {
    id: "arms-broadcast-pistol",
    slot: "arms",
    label: "Broadcast guard pistol arms",
    spriteKey: "part-arms-broadcast-pistol",
    tags: ["human", "broadcast", "pistol"],
    anchor: { x: 0, y: -2 },
  },
  {
    id: "weapon-service-pistol",
    slot: "weapon",
    label: "Service pistol",
    spriteKey: "part-weapon-service-pistol",
    tags: ["pistol"],
    anchor: { x: 0, y: -34 },
  },
  {
    id: "weapon-short-shotgun",
    slot: "weapon",
    label: "Short shotgun",
    spriteKey: "part-weapon-short-shotgun",
    tags: ["shotgun"],
    anchor: { x: 0, y: -42 },
  },
];

export const weaponPoseCatalog: WeaponPoseDefinition[] = [
  {
    id: "pose-suit-service-pistol",
    weaponIds: ["service-pistol"],
    label: "Suit service-pistol pose",
    armsPartId: "arms-suit-pistol",
    weaponPartId: "weapon-service-pistol",
    gripOffset: { x: 0, y: -28 },
    recoilDistance: 6,
    recoilDegrees: 3,
  },
  {
    id: "pose-broadcast-service-pistol",
    weaponIds: [
      "enemy-ranged-anchor-pistol",
      "enemy-ranged-control-pistol",
      "enemy-ranged-green-pistol",
    ],
    label: "Broadcast guard service-pistol pose",
    armsPartId: "arms-broadcast-pistol",
    weaponPartId: "weapon-service-pistol",
    gripOffset: { x: 0, y: -28 },
    recoilDistance: 5,
    recoilDegrees: 2,
  },
];

export const actorRigPresets: ActorRigPreset[] = [
  {
    id: "rig-player-crt-suit",
    label: "Player CRT suit",
    legsPartId: "legs-suit-runner",
    torsoPartId: "torso-suit",
    headPartId: "head-crt-90s",
    defaultWeaponPoseId: "pose-suit-service-pistol",
    tags: ["human", "crt", "suit", "pistol"],
  },
  {
    id: "rig-enemy-human-ranged",
    label: "Human ranged enemy",
    legsPartId: "legs-broadcast-guard",
    torsoPartId: "torso-broadcast-guard",
    headPartId: "head-human-short-hair",
    defaultWeaponPoseId: "pose-broadcast-service-pistol",
    tags: ["human", "broadcast", "ranged", "pistol"],
  },
  {
    id: "rig-enemy-crt-ranged",
    label: "CRT ranged enemy",
    legsPartId: "legs-broadcast-guard",
    torsoPartId: "torso-broadcast-guard",
    headPartId: "head-crt-90s",
    defaultWeaponPoseId: "pose-broadcast-service-pistol",
    tags: ["human", "crt", "broadcast", "ranged", "pistol"],
  },
  {
    id: "rig-enemy-human-rush",
    label: "Human rush enemy",
    legsPartId: "legs-broadcast-guard",
    torsoPartId: "torso-broadcast-guard",
    headPartId: "head-human-short-hair",
    tags: ["human", "broadcast", "rush"],
  },
  {
    id: "rig-robot-monitor-ranged",
    label: "Robot monitor ranged enemy",
    legsPartId: "legs-broadcast-guard",
    torsoPartId: "torso-broadcast-guard",
    headPartId: "head-robot-monitor",
    defaultWeaponPoseId: "pose-broadcast-service-pistol",
    tags: ["robot", "broadcast", "ranged", "pistol"],
  },
];

export const rigPresetForHead = (head: HeadType, kind: "player" | "ranged" | "rush"): string => {
  if (kind === "player") {
    return "rig-player-crt-suit";
  }
  if (kind === "rush") {
    return "rig-enemy-human-rush";
  }
  return head === "crt" ? "rig-enemy-crt-ranged" : "rig-enemy-human-ranged";
};
