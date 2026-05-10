import Phaser from "phaser";

import bloodFloorUrl from "../../assets/vendor/valentint-scifi/Decals/enemy_blood_floor_Sheet.png?url";
import rubbishUrl from "../../assets/vendor/valentint-scifi/Decals/rubbish_Sheet.png?url";
import barrelUrl from "../../assets/vendor/valentint-scifi/Decorations/barrel_Sheet.png?url";
import boxBigUrl from "../../assets/vendor/valentint-scifi/Decorations/boxBig.png?url";
import boxSmallUrl from "../../assets/vendor/valentint-scifi/Decorations/boxSmall.png?url";
import chair1Url from "../../assets/vendor/valentint-scifi/Decorations/chair_1_Sheet.png?url";
import couch1Url from "../../assets/vendor/valentint-scifi/Decorations/couch_1_Sheet.png?url";
import display1Url from "../../assets/vendor/valentint-scifi/Decorations/display_1_Sheet.png?url";
import keyboardMouseUrl from "../../assets/vendor/valentint-scifi/Decorations/keyboardMouse.png?url";
import labDeviceUrl from "../../assets/vendor/valentint-scifi/Decorations/laboratoryDevice.png?url";
import plantUrl from "../../assets/vendor/valentint-scifi/Decorations/plants_Sheet.png?url";
import table1Url from "../../assets/vendor/valentint-scifi/Decorations/table_1_Sheet.png?url";
import table5Url from "../../assets/vendor/valentint-scifi/Decorations/table_5_Sheet.png?url";
import tvUrl from "../../assets/vendor/valentint-scifi/Decorations/tv_Sheet.png?url";
import enemyAttackUrl from "../../assets/vendor/valentint-scifi/NPCs/Enemy/enemy_attack_Sheet.png?url";
import enemyDeathUrl from "../../assets/vendor/valentint-scifi/NPCs/Enemy/enemy_death_Sheet.png?url";
import enemyIdleUrl from "../../assets/vendor/valentint-scifi/NPCs/Enemy/enemy_idle_Sheet.png?url";
import enemyRunUrl from "../../assets/vendor/valentint-scifi/NPCs/Enemy/enemy_run_Sheet.png?url";
import enemyWalkUrl from "../../assets/vendor/valentint-scifi/NPCs/Enemy/enemy_walk_Sheet.png?url";
import computerUrl from "../../assets/vendor/valentint-scifi/Objects/computer_sheet.png?url";
import doorUrl from "../../assets/vendor/valentint-scifi/Objects/door.png?url";
import doorHeavyUrl from "../../assets/vendor/valentint-scifi/Objects/doorHeavy.png?url";
import lampUrl from "../../assets/vendor/valentint-scifi/Objects/wall_lamp_sheet.png?url";
import bulletPuffUrl from "../../assets/vendor/valentint-scifi/Particles/bulletPuff_Sheet.png?url";
import playerDeathUrl from "../../assets/vendor/valentint-scifi/Player/Death/player_death_Sheet.png?url";
import playerIdlePistolUrl from "../../assets/vendor/valentint-scifi/Player/Idle/player_idle_pistol_Sheet.png?url";
import playerPunchPistolUrl from "../../assets/vendor/valentint-scifi/Player/Punch/player_punch_pistol_Sheet.png?url";
import playerRunPistolUrl from "../../assets/vendor/valentint-scifi/Player/Run/player_run_pistol_Sheet.png?url";
import playerShootPistolUrl from "../../assets/vendor/valentint-scifi/Player/Shoot/player_shoot_pistol_Sheet.png?url";
import playerWalkPistolUrl from "../../assets/vendor/valentint-scifi/Player/Walk/player_walk_pistol_Sheet.png?url";
import floorTilesUrl from "../../assets/vendor/valentint-scifi/Tile/tile_background.png?url";
import wallTilesUrl from "../../assets/vendor/valentint-scifi/Tile/tile.png?url";

type SpriteSheetAsset = {
  key: string;
  url: string;
  frameWidth: number;
  frameHeight: number;
};

type ImageAsset = {
  key: string;
  url: string;
};

const spriteSheets: SpriteSheetAsset[] = [
  {
    key: "scifi-player-idle-pistol",
    url: playerIdlePistolUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-player-walk-pistol",
    url: playerWalkPistolUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-player-run-pistol",
    url: playerRunPistolUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-player-shoot-pistol",
    url: playerShootPistolUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-player-punch-pistol",
    url: playerPunchPistolUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-player-death",
    url: playerDeathUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-enemy-idle",
    url: enemyIdleUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-enemy-walk",
    url: enemyWalkUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-enemy-run",
    url: enemyRunUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-enemy-attack",
    url: enemyAttackUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-enemy-death",
    url: enemyDeathUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-floor-tiles",
    url: floorTilesUrl,
    frameWidth: 32,
    frameHeight: 32,
  },
  {
    key: "scifi-wall-tiles",
    url: wallTilesUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-tv-sheet",
    url: tvUrl,
    frameWidth: 64,
    frameHeight: 32,
  },
  {
    key: "scifi-computer-sheet",
    url: computerUrl,
    frameWidth: 32,
    frameHeight: 32,
  },
  {
    key: "scifi-blood-floor",
    url: bloodFloorUrl,
    frameWidth: 32,
    frameHeight: 32,
  },
  {
    key: "scifi-rubbish",
    url: rubbishUrl,
    frameWidth: 16,
    frameHeight: 16,
  },
  {
    key: "scifi-bullet-puff",
    url: bulletPuffUrl,
    frameWidth: 16,
    frameHeight: 16,
  },
  {
    key: "scifi-barrel",
    url: barrelUrl,
    frameWidth: 32,
    frameHeight: 32,
  },
  {
    key: "scifi-chair-1",
    url: chair1Url,
    frameWidth: 32,
    frameHeight: 32,
  },
  {
    key: "scifi-table-1",
    url: table1Url,
    frameWidth: 64,
    frameHeight: 32,
  },
  {
    key: "scifi-table-5",
    url: table5Url,
    frameWidth: 64,
    frameHeight: 32,
  },
  {
    key: "scifi-display-1",
    url: display1Url,
    frameWidth: 64,
    frameHeight: 32,
  },
  {
    key: "scifi-couch-1",
    url: couch1Url,
    frameWidth: 64,
    frameHeight: 32,
  },
  {
    key: "scifi-plant",
    url: plantUrl,
    frameWidth: 32,
    frameHeight: 32,
  },
  {
    key: "scifi-lamp",
    url: lampUrl,
    frameWidth: 16,
    frameHeight: 16,
  },
];

const images: ImageAsset[] = [
  {
    key: "scifi-door",
    url: doorUrl,
  },
  {
    key: "scifi-door-heavy",
    url: doorHeavyUrl,
  },
  {
    key: "scifi-box-big",
    url: boxBigUrl,
  },
  {
    key: "scifi-box-small",
    url: boxSmallUrl,
  },
  {
    key: "scifi-keyboard-mouse",
    url: keyboardMouseUrl,
  },
  {
    key: "scifi-lab-device",
    url: labDeviceUrl,
  },
];

export const loadScifiAssets = (scene: Phaser.Scene): void => {
  for (const sheet of spriteSheets) {
    scene.load.spritesheet(sheet.key, sheet.url, {
      frameWidth: sheet.frameWidth,
      frameHeight: sheet.frameHeight,
    });
  }

  for (const image of images) {
    scene.load.image(image.key, image.url);
  }
};

const createAnimation = (
  scene: Phaser.Scene,
  key: string,
  textureKey: string,
  frames: number,
  frameRate: number,
  repeat = -1,
): void => {
  if (scene.anims.exists(key)) {
    return;
  }

  scene.anims.create({
    key,
    frames: scene.anims.generateFrameNumbers(textureKey, { start: 0, end: frames - 1 }),
    frameRate,
    repeat,
  });
};

export const ensureScifiAnimations = (scene: Phaser.Scene): void => {
  createAnimation(scene, "scifi-player-idle-pistol", "scifi-player-idle-pistol", 4, 7);
  createAnimation(scene, "scifi-player-walk-pistol", "scifi-player-walk-pistol", 6, 11);
  createAnimation(scene, "scifi-player-run-pistol", "scifi-player-run-pistol", 6, 14);
  createAnimation(scene, "scifi-player-shoot-pistol", "scifi-player-shoot-pistol", 2, 18, 0);
  createAnimation(scene, "scifi-player-punch-pistol", "scifi-player-punch-pistol", 4, 14, 0);
  createAnimation(scene, "scifi-player-death", "scifi-player-death", 4, 8, 0);

  createAnimation(scene, "scifi-enemy-idle", "scifi-enemy-idle", 4, 6);
  createAnimation(scene, "scifi-enemy-walk", "scifi-enemy-walk", 6, 9);
  createAnimation(scene, "scifi-enemy-run", "scifi-enemy-run", 6, 12);
  createAnimation(scene, "scifi-enemy-attack", "scifi-enemy-attack", 7, 13);
  createAnimation(scene, "scifi-enemy-death", "scifi-enemy-death", 5, 8, 0);
  createAnimation(scene, "scifi-bullet-puff", "scifi-bullet-puff", 5, 18, 0);
};
