import Phaser from "phaser";
import {
  actorParts,
  actorRigPresets,
  rigPresetForHead,
  weaponPoseCatalog,
  type ActorPartDefinition,
  type ActorRigPreset,
  type WeaponPoseDefinition,
} from "../../game/content/actorParts";
import type { EnemyState, PlayerState, Vec2, WeaponState } from "../../game/simulation/types";

type ActorState = Pick<
  PlayerState | EnemyState,
  "id" | "position" | "velocity" | "facing" | "alive" | "weaponId"
>;

export type ActorRig = {
  root: Phaser.GameObjects.Container;
  shadow: Phaser.GameObjects.Ellipse;
  legs: Phaser.GameObjects.Container;
  leftLeg: Phaser.GameObjects.Image;
  rightLeg: Phaser.GameObjects.Image;
  upperBody: Phaser.GameObjects.Container;
  torso: Phaser.GameObjects.Image;
  head: Phaser.GameObjects.Image;
  arms?: Phaser.GameObjects.Image;
  weapon?: Phaser.GameObjects.Image;
  presetId: string;
  weaponPoseId?: string;
  previousLoadedRounds?: number;
  recoilMs: number;
  walkPhase: number;
  legRotation: number;
};

const partById = new Map(actorParts.map((part) => [part.id, part]));
const presetById = new Map(actorRigPresets.map((preset) => [preset.id, preset]));
const poseById = new Map(weaponPoseCatalog.map((pose) => [pose.id, pose]));

const WALK_SPEED_THRESHOLD = 8;
const RECOIL_DURATION_MS = 110;

const velocityAngle = (velocity: Vec2): number | undefined => {
  if (Math.hypot(velocity.x, velocity.y) < WALK_SPEED_THRESHOLD) {
    return undefined;
  }
  return Math.atan2(velocity.y, velocity.x) + Math.PI / 2;
};

const ensureTexture = (scene: Phaser.Scene, key: string, draw: (graphics: Phaser.GameObjects.Graphics) => void, size = 96): void => {
  if (scene.textures.exists(key)) {
    return;
  }
  const graphics = scene.make.graphics({ x: 0, y: 0 }, false);
  draw(graphics);
  graphics.generateTexture(key, size, size);
  graphics.destroy();
};

const drawPixelRect = (
  graphics: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  height: number,
  fill: number,
  stroke = 0x050505,
): void => {
  graphics.fillStyle(stroke, 1);
  graphics.fillRect(x - 3, y - 3, width + 6, height + 6);
  graphics.fillStyle(fill, 1);
  graphics.fillRect(x, y, width, height);
};

const drawLegTexture = (scene: Phaser.Scene, part: ActorPartDefinition): void => {
  const fill = part.id.includes("suit") ? 0x171719 : 0x23342a;
  ensureTexture(scene, part.spriteKey, (graphics) => {
    graphics.fillStyle(0x050505, 1);
    graphics.fillEllipse(48, 48, 20, 60);
    graphics.fillEllipse(48, 72, 26, 16);
    graphics.fillStyle(fill, 1);
    graphics.fillEllipse(48, 47, 14, 52);
    graphics.fillEllipse(48, 70, 20, 11);
    graphics.fillStyle(part.id.includes("suit") ? 0x2c2d31 : 0x3f7850, 1);
    graphics.fillRect(45, 24, 6, 34);
    graphics.fillStyle(0x050505, 1);
    graphics.fillRect(39, 72, 18, 5);
  });
};

const drawTorsoTexture = (scene: Phaser.Scene, part: ActorPartDefinition): void => {
  const suit = part.id.includes("suit");
  ensureTexture(scene, part.spriteKey, (graphics) => {
    graphics.fillStyle(0x050505, 1);
    graphics.fillEllipse(48, 46, 66, 40);
    graphics.fillEllipse(48, 61, 42, 30);
    graphics.fillStyle(suit ? 0x151719 : 0x1b4d2d, 1);
    graphics.fillEllipse(48, 45, 58, 32);
    graphics.fillEllipse(48, 59, 34, 24);
    graphics.fillStyle(suit ? 0x2e3036 : 0x2d7245, 1);
    graphics.fillRect(23, 38, 50, 8);
    graphics.fillStyle(suit ? 0xece5d7 : 0xb7efbb, 1);
    graphics.fillRect(43, 31, 10, 13);
    graphics.fillStyle(suit ? 0x7e1639 : 0x0c2618, 1);
    graphics.fillRect(46, 40, 4, 18);
  });
};

const drawHeadTexture = (scene: Phaser.Scene, part: ActorPartDefinition): void => {
  ensureTexture(scene, part.spriteKey, (graphics) => {
    if (part.id.includes("crt")) {
      drawPixelRect(graphics, 20, 25, 56, 46, 0x8e9896);
      graphics.fillStyle(0xaeb8b7, 1);
      graphics.fillRect(28, 33, 40, 24);
      graphics.fillStyle(0xcbd5d4, 0.9);
      graphics.fillRect(32, 37, 32, 16);
      graphics.fillStyle(0x778785, 1);
      for (let y = 38; y < 53; y += 4) {
        graphics.fillRect(34, y, 28, 2);
      }
      graphics.fillStyle(0x050505, 1);
      graphics.fillRect(24, 20, 48, 6);
      graphics.fillRect(30, 70, 36, 5);
      graphics.lineStyle(3, 0x050505, 1);
      graphics.lineBetween(37, 25, 30, 14);
      graphics.lineBetween(59, 25, 66, 14);
      return;
    }

    if (part.id.includes("robot")) {
      drawPixelRect(graphics, 25, 25, 46, 42, 0x5f6e70);
      graphics.fillStyle(0x76f8ff, 1);
      graphics.fillRect(34, 38, 28, 12);
      graphics.fillStyle(0x3d484a, 1);
      graphics.fillRect(31, 29, 34, 7);
      return;
    }

    graphics.fillStyle(0x050505, 1);
    graphics.fillCircle(48, 48, 23);
    graphics.fillStyle(0xf1b184, 1);
    graphics.fillCircle(48, 49, 18);
    graphics.fillStyle(0x2c150b, 1);
    graphics.fillCircle(48, 43, 19);
    graphics.fillStyle(0xf1b184, 1);
    graphics.fillCircle(48, 53, 13);
    graphics.fillStyle(0x050505, 1);
    graphics.fillRect(39, 66, 18, 4);
  });
};

const drawArmsTexture = (scene: Phaser.Scene, part: ActorPartDefinition): void => {
  const sleeve = part.id.includes("suit") ? 0x171719 : 0x1d4f2e;
  ensureTexture(scene, part.spriteKey, (graphics) => {
    graphics.lineStyle(13, 0x050505, 1);
    graphics.lineBetween(31, 51, 42, 20);
    graphics.lineBetween(65, 51, 54, 20);
    graphics.lineStyle(8, sleeve, 1);
    graphics.lineBetween(31, 51, 42, 21);
    graphics.lineBetween(65, 51, 54, 21);
    graphics.fillStyle(0x050505, 1);
    graphics.fillCircle(42, 20, 7);
    graphics.fillCircle(54, 20, 7);
    graphics.fillStyle(0xf1b184, 1);
    graphics.fillCircle(42, 20, 4);
    graphics.fillCircle(54, 20, 4);
  });
};

const drawWeaponTexture = (scene: Phaser.Scene, part: ActorPartDefinition): void => {
  ensureTexture(scene, part.spriteKey, (graphics) => {
    const barrelLength = part.id.includes("shotgun") ? 52 : 34;
    graphics.fillStyle(0x050505, 1);
    graphics.fillRect(44, 11, 8, barrelLength);
    graphics.fillRect(38, 43, 22, 11);
    graphics.fillRect(52, 48, 8, 18);
    graphics.fillStyle(0xbec6c8, 1);
    graphics.fillRect(47, 14, 3, barrelLength - 4);
    graphics.fillStyle(0x5a5f63, 1);
    graphics.fillRect(42, 46, 13, 5);
  });
};

export const ensureActorPartTextures = (scene: Phaser.Scene): void => {
  for (const part of actorParts) {
    if (part.slot === "legs") {
      drawLegTexture(scene, part);
    } else if (part.slot === "torso") {
      drawTorsoTexture(scene, part);
    } else if (part.slot === "head") {
      drawHeadTexture(scene, part);
    } else if (part.slot === "arms") {
      drawArmsTexture(scene, part);
    } else {
      drawWeaponTexture(scene, part);
    }
  }
};

const requirePart = (partId: string): ActorPartDefinition => {
  const part = partById.get(partId);
  if (!part) {
    throw new Error(`Missing actor part: ${partId}`);
  }
  return part;
};

const requirePreset = (presetId: string): ActorRigPreset => {
  const preset = presetById.get(presetId);
  if (!preset) {
    throw new Error(`Missing actor rig preset: ${presetId}`);
  }
  return preset;
};

const poseForWeapon = (
  preset: ActorRigPreset,
  weaponId?: string,
): WeaponPoseDefinition | undefined => {
  if (weaponId) {
    const pose = weaponPoseCatalog.find((candidate) => candidate.weaponIds.includes(weaponId));
    if (pose) {
      return pose;
    }
  }
  return preset.defaultWeaponPoseId ? poseById.get(preset.defaultWeaponPoseId) : undefined;
};

const createPartImage = (
  scene: Phaser.Scene,
  part: ActorPartDefinition,
  scale = 0.62,
): Phaser.GameObjects.Image =>
  scene.add.image(part.anchor.x, part.anchor.y, part.spriteKey).setOrigin(0.5).setScale(scale);

export const createActorRig = (
  scene: Phaser.Scene,
  presetId: string,
  weaponId: string | undefined,
  x: number,
  y: number,
): ActorRig => {
  const preset = requirePreset(presetId);
  const legsPart = requirePart(preset.legsPartId);
  const torsoPart = requirePart(preset.torsoPartId);
  const headPart = requirePart(preset.headPartId);
  const weaponPose = poseForWeapon(preset, weaponId);

  const root = scene.add.container(x, y).setDepth(24);
  const shadow = scene.add.ellipse(0, 13, 54, 34, 0x030303, 0.72).setDepth(18);
  const legs = scene.add.container(0, 0);
  const upperBody = scene.add.container(0, 0);
  const leftLeg = scene.add.image(-8, 11, legsPart.spriteKey).setOrigin(0.5).setScale(0.42);
  const rightLeg = scene.add.image(8, 11, legsPart.spriteKey).setOrigin(0.5).setScale(0.42);
  const torso = createPartImage(scene, torsoPart, 0.58);
  const head = createPartImage(scene, headPart, 0.58);

  let arms: Phaser.GameObjects.Image | undefined;
  let weapon: Phaser.GameObjects.Image | undefined;
  if (weaponPose) {
    arms = createPartImage(scene, requirePart(weaponPose.armsPartId), 0.58);
    weapon = createPartImage(scene, requirePart(weaponPose.weaponPartId), 0.52);
  }

  legs.add([leftLeg, rightLeg]);
  upperBody.add([torso, head]);
  if (arms) {
    upperBody.add(arms);
  }
  if (weapon) {
    upperBody.add(weapon);
  }
  root.add([shadow, legs, upperBody]);

  return {
    root,
    shadow,
    legs,
    leftLeg,
    rightLeg,
    upperBody,
    torso,
    head,
    arms,
    weapon,
    presetId,
    weaponPoseId: weaponPose?.id,
    recoilMs: 0,
    walkPhase: 0,
    legRotation: 0,
  };
};

const syncWeaponPose = (rig: ActorRig, actor: ActorState): void => {
  const preset = requirePreset(rig.presetId);
  const nextPose = poseForWeapon(preset, actor.weaponId);
  if (nextPose?.id === rig.weaponPoseId) {
    return;
  }

  if (rig.arms) {
    rig.upperBody.remove(rig.arms, true);
    rig.arms = undefined;
  }
  if (rig.weapon) {
    rig.upperBody.remove(rig.weapon, true);
    rig.weapon = undefined;
  }

  if (nextPose) {
    rig.arms = createPartImage(rig.root.scene, requirePart(nextPose.armsPartId), 0.58);
    rig.weapon = createPartImage(rig.root.scene, requirePart(nextPose.weaponPartId), 0.52);
    rig.upperBody.add([rig.arms, rig.weapon]);
  }
  rig.weaponPoseId = nextPose?.id;
};

const syncRecoil = (
  rig: ActorRig,
  actor: ActorState,
  weapon: WeaponState | undefined,
  deltaMs: number,
): void => {
  if (weapon) {
    if (rig.previousLoadedRounds !== undefined && weapon.loadedRounds < rig.previousLoadedRounds) {
      rig.recoilMs = RECOIL_DURATION_MS;
    }
    rig.previousLoadedRounds = weapon.loadedRounds;
  }
  rig.recoilMs = Math.max(0, rig.recoilMs - deltaMs);
  const recoilProgress = rig.recoilMs / RECOIL_DURATION_MS;
  const preset = requirePreset(rig.presetId);
  const pose = poseForWeapon(preset, actor.weaponId);
  const recoilDistance = (pose?.recoilDistance ?? 0) * recoilProgress;
  const recoilRotation = Phaser.Math.DegToRad((pose?.recoilDegrees ?? 0) * recoilProgress);

  rig.upperBody.setPosition(0, recoilDistance);
  rig.upperBody.setRotation(actor.alive ? actor.facing + Math.PI / 2 - recoilRotation : 0);
};

const syncWalkCycle = (rig: ActorRig, actor: ActorState, deltaMs: number): void => {
  const nextLegRotation = velocityAngle(actor.velocity);
  const moving = nextLegRotation !== undefined && actor.alive;
  if (moving) {
    rig.legRotation = nextLegRotation;
    rig.walkPhase += deltaMs * 0.024;
  }

  const stride = moving ? Math.sin(rig.walkPhase) : 0;
  rig.legs.setRotation(actor.alive ? rig.legRotation : 0);
  rig.leftLeg.setPosition(-8, 11 - stride * 7);
  rig.rightLeg.setPosition(8, 11 + stride * 7);
  rig.leftLeg.setRotation(stride * 0.18);
  rig.rightLeg.setRotation(-stride * 0.18);
};

export const syncActorRig = (
  rig: ActorRig,
  actor: ActorState,
  weapon: WeaponState | undefined,
  deltaMs: number,
): void => {
  syncWeaponPose(rig, actor);

  rig.root.setPosition(actor.position.x, actor.position.y);
  rig.root.setRotation(actor.alive ? 0 : actor.facing + Math.PI / 2 + 0.75);
  rig.root.setAlpha(actor.alive ? 1 : 0.5);
  rig.shadow.setVisible(actor.alive);

  syncWalkCycle(rig, actor, deltaMs);
  syncRecoil(rig, actor, weapon, deltaMs);

  if (actor.alive) {
    rig.torso.clearTint();
    rig.head.clearTint();
    rig.leftLeg.clearTint();
    rig.rightLeg.clearTint();
    rig.arms?.clearTint();
    rig.weapon?.clearTint();
    return;
  }

  for (const part of [rig.torso, rig.head, rig.leftLeg, rig.rightLeg, rig.arms, rig.weapon]) {
    part?.setTint(0x8f1c24);
  }
};

export const createPlayerRig = (
  scene: Phaser.Scene,
  player: PlayerState,
): ActorRig =>
  createActorRig(
    scene,
    rigPresetForHead(player.head, "player"),
    player.weaponId,
    player.position.x,
    player.position.y,
  );

export const createEnemyRig = (
  scene: Phaser.Scene,
  enemy: EnemyState,
): ActorRig =>
  createActorRig(
    scene,
    rigPresetForHead(enemy.head, enemy.kind),
    enemy.weaponId,
    enemy.position.x,
    enemy.position.y,
  );
