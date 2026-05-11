import Phaser from "phaser";

import ringTowerCityUrl from "../../assets/level-art/ring-tower-city.webp?url";
import bloodFloorUrl from "../../assets/vendor/valentint-scifi/Decals/enemy_blood_floor_Sheet.png?url";
import playerBloodFloorUrl from "../../assets/vendor/valentint-scifi/Decals/player_blood_floor_Sheet.png?url";
import rubbishUrl from "../../assets/vendor/valentint-scifi/Decals/rubbish_Sheet.png?url";
import barrelUrl from "../../assets/vendor/valentint-scifi/Decorations/barrel_Sheet.png?url";
import boxBigUrl from "../../assets/vendor/valentint-scifi/Decorations/boxBig.png?url";
import boxSmallUrl from "../../assets/vendor/valentint-scifi/Decorations/boxSmall.png?url";
import chair1Url from "../../assets/vendor/valentint-scifi/Decorations/chair_1_Sheet.png?url";
import chair2Url from "../../assets/vendor/valentint-scifi/Decorations/chair_2_Sheet.png?url";
import coolerUrl from "../../assets/vendor/valentint-scifi/Decorations/cooler_Sheet.png?url";
import couch1Url from "../../assets/vendor/valentint-scifi/Decorations/couch_1_Sheet.png?url";
import couch2Url from "../../assets/vendor/valentint-scifi/Decorations/couch_2_Sheet.png?url";
import display1Url from "../../assets/vendor/valentint-scifi/Decorations/display_1_Sheet.png?url";
import display2Url from "../../assets/vendor/valentint-scifi/Decorations/display_2_Sheet.png?url";
import keyboardMouseUrl from "../../assets/vendor/valentint-scifi/Decorations/keyboardMouse.png?url";
import labDeviceUrl from "../../assets/vendor/valentint-scifi/Decorations/laboratoryDevice.png?url";
import lampsUrl from "../../assets/vendor/valentint-scifi/Decorations/lamps_Sheet.png?url";
import plantUrl from "../../assets/vendor/valentint-scifi/Decorations/plants_Sheet.png?url";
import table1Url from "../../assets/vendor/valentint-scifi/Decorations/table_1_Sheet.png?url";
import table2Url from "../../assets/vendor/valentint-scifi/Decorations/table_2_Sheet.png?url";
import table3Url from "../../assets/vendor/valentint-scifi/Decorations/table_3_Sheet.png?url";
import table4Url from "../../assets/vendor/valentint-scifi/Decorations/table_4_Sheet.png?url";
import table5Url from "../../assets/vendor/valentint-scifi/Decorations/table_5_Sheet.png?url";
import table8Url from "../../assets/vendor/valentint-scifi/Decorations/table_8_Sheet.png?url";
import table10Url from "../../assets/vendor/valentint-scifi/Decorations/table_10_Sheet.png?url";
import table11Url from "../../assets/vendor/valentint-scifi/Decorations/table_11_Sheet.png?url";
import trashCan2Url from "../../assets/vendor/valentint-scifi/Decorations/trashCan_2_Sheet.png?url";
import tvUrl from "../../assets/vendor/valentint-scifi/Decorations/tv_Sheet.png?url";
import enemyAttackUrl from "../../assets/vendor/valentint-scifi/NPCs/Enemy/enemy_attack_Sheet.png?url";
import enemyDeathUrl from "../../assets/vendor/valentint-scifi/NPCs/Enemy/enemy_death_Sheet.png?url";
import enemyIdleUrl from "../../assets/vendor/valentint-scifi/NPCs/Enemy/enemy_idle_Sheet.png?url";
import enemyRunUrl from "../../assets/vendor/valentint-scifi/NPCs/Enemy/enemy_run_Sheet.png?url";
import enemyWalkUrl from "../../assets/vendor/valentint-scifi/NPCs/Enemy/enemy_walk_Sheet.png?url";
import computerUrl from "../../assets/vendor/valentint-scifi/Objects/computer_sheet.png?url";
import doorUrl from "../../assets/vendor/valentint-scifi/Objects/door.png?url";
import doorHeavyUrl from "../../assets/vendor/valentint-scifi/Objects/doorHeavy.png?url";
import doorSmallUrl from "../../assets/vendor/valentint-scifi/Objects/doorSmall.png?url";
import healthBagUrl from "../../assets/vendor/valentint-scifi/Objects/healthBag.png?url";
import lampUrl from "../../assets/vendor/valentint-scifi/Objects/wall_lamp_sheet.png?url";
import weaponBagUrl from "../../assets/vendor/valentint-scifi/Objects/weaponBag.png?url";
import bulletPuffUrl from "../../assets/vendor/valentint-scifi/Particles/bulletPuff_Sheet.png?url";
import monsterBloodDeathUrl from "../../assets/vendor/valentint-scifi/Particles/monsterBloodDeath_Sheet.png?url";
import monsterBloodSplashUrl from "../../assets/vendor/valentint-scifi/Particles/monsterBloodSplash_Sheet.png?url";
import playerBloodDeathUrl from "../../assets/vendor/valentint-scifi/Particles/playerBloodDeath_Sheet.png?url";
import playerBloodSplashUrl from "../../assets/vendor/valentint-scifi/Particles/playerBloodSplash_Sheet.png?url";
import playerLegsIdleUrl from "../../assets/vendor/valentint-scifi/Legs/Player/player_legs_idle_Sheet.png?url";
import playerLegsRunUrl from "../../assets/vendor/valentint-scifi/Legs/Player/player_legs_run_Sheet.png?url";
import playerLegsWalkUrl from "../../assets/vendor/valentint-scifi/Legs/Player/player_legs_walk_Sheet.png?url";
import playerDeathUrl from "../../assets/vendor/valentint-scifi/Player/Death/player_death_Sheet.png?url";
import playerIdlePistolUrl from "../../assets/vendor/valentint-scifi/Player/Idle/player_idle_pistol_Sheet.png?url";
import playerIdleRifleUrl from "../../assets/vendor/valentint-scifi/Player/Idle/player_idle_rifle_Sheet.png?url";
import playerPainPistolUrl from "../../assets/vendor/valentint-scifi/Player/Pain/player_pain_pistol_Sheet.png?url";
import playerPainRifleUrl from "../../assets/vendor/valentint-scifi/Player/Pain/player_pain_rifle_Sheet.png?url";
import playerPunchPistolUrl from "../../assets/vendor/valentint-scifi/Player/Punch/player_punch_pistol_Sheet.png?url";
import playerReloadPistolUrl from "../../assets/vendor/valentint-scifi/Player/Reload/player_reload_pistol_Sheet.png?url";
import playerReloadRifleUrl from "../../assets/vendor/valentint-scifi/Player/Reload/player_reload_rifle_Sheet.png?url";
import playerRunPistolUrl from "../../assets/vendor/valentint-scifi/Player/Run/player_run_pistol_Sheet.png?url";
import playerRunRifleUrl from "../../assets/vendor/valentint-scifi/Player/Run/player_run_rifle_Sheet.png?url";
import playerShootPistolUrl from "../../assets/vendor/valentint-scifi/Player/Shoot/player_shoot_pistol_Sheet.png?url";
import playerShootRifleUrl from "../../assets/vendor/valentint-scifi/Player/Shoot/player_shoot_rifle_Sheet.png?url";
import playerUseUrl from "../../assets/vendor/valentint-scifi/Player/Use/player_use_Sheet.png?url";
import playerWalkPistolUrl from "../../assets/vendor/valentint-scifi/Player/Walk/player_walk_pistol_Sheet.png?url";
import playerWalkRifleUrl from "../../assets/vendor/valentint-scifi/Player/Walk/player_walk_rifle_Sheet.png?url";
import playerSwitchPistolUrl from "../../assets/vendor/valentint-scifi/Player/WeaponSwitch/player_switch_pistol_Sheet.png?url";
import playerSwitchRifleUrl from "../../assets/vendor/valentint-scifi/Player/WeaponSwitch/player_switch_rifle_Sheet.png?url";
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
    key: "scifi-player-idle-rifle",
    url: playerIdleRifleUrl,
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
    key: "scifi-player-walk-rifle",
    url: playerWalkRifleUrl,
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
    key: "scifi-player-run-rifle",
    url: playerRunRifleUrl,
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
    key: "scifi-player-shoot-rifle",
    url: playerShootRifleUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-player-use",
    url: playerUseUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-player-legs-idle",
    url: playerLegsIdleUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-player-legs-walk",
    url: playerLegsWalkUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-player-legs-run",
    url: playerLegsRunUrl,
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
    key: "scifi-player-reload-pistol",
    url: playerReloadPistolUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-player-reload-rifle",
    url: playerReloadRifleUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-player-switch-pistol",
    url: playerSwitchPistolUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-player-switch-rifle",
    url: playerSwitchRifleUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-player-pain-pistol",
    url: playerPainPistolUrl,
    frameWidth: 48,
    frameHeight: 48,
  },
  {
    key: "scifi-player-pain-rifle",
    url: playerPainRifleUrl,
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
    key: "scifi-player-blood-floor",
    url: playerBloodFloorUrl,
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
    key: "scifi-monster-blood-death",
    url: monsterBloodDeathUrl,
    frameWidth: 32,
    frameHeight: 32,
  },
  {
    key: "scifi-monster-blood-splash",
    url: monsterBloodSplashUrl,
    frameWidth: 16,
    frameHeight: 16,
  },
  {
    key: "scifi-player-blood-death",
    url: playerBloodDeathUrl,
    frameWidth: 32,
    frameHeight: 32,
  },
  {
    key: "scifi-player-blood-splash",
    url: playerBloodSplashUrl,
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
    key: "scifi-chair-2",
    url: chair2Url,
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
    key: "scifi-table-2",
    url: table2Url,
    frameWidth: 64,
    frameHeight: 32,
  },
  {
    key: "scifi-table-3",
    url: table3Url,
    frameWidth: 64,
    frameHeight: 32,
  },
  {
    key: "scifi-table-4",
    url: table4Url,
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
    key: "scifi-table-8",
    url: table8Url,
    frameWidth: 64,
    frameHeight: 32,
  },
  {
    key: "scifi-table-10",
    url: table10Url,
    frameWidth: 64,
    frameHeight: 32,
  },
  {
    key: "scifi-table-11",
    url: table11Url,
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
    key: "scifi-display-2",
    url: display2Url,
    frameWidth: 32,
    frameHeight: 32,
  },
  {
    key: "scifi-couch-1",
    url: couch1Url,
    frameWidth: 64,
    frameHeight: 32,
  },
  {
    key: "scifi-couch-2",
    url: couch2Url,
    frameWidth: 64,
    frameHeight: 32,
  },
  {
    key: "scifi-cooler",
    url: coolerUrl,
    frameWidth: 32,
    frameHeight: 32,
  },
  {
    key: "scifi-lamps",
    url: lampsUrl,
    frameWidth: 16,
    frameHeight: 16,
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
  {
    key: "scifi-trash-can-2",
    url: trashCan2Url,
    frameWidth: 32,
    frameHeight: 32,
  },
];

const images: ImageAsset[] = [
  {
    key: "ring-tower-city",
    url: ringTowerCityUrl,
  },
  {
    key: "scifi-door",
    url: doorUrl,
  },
  {
    key: "scifi-door-heavy",
    url: doorHeavyUrl,
  },
  {
    key: "scifi-door-small",
    url: doorSmallUrl,
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
  {
    key: "scifi-health-bag",
    url: healthBagUrl,
  },
  {
    key: "scifi-weapon-bag",
    url: weaponBagUrl,
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
  createAnimation(scene, "scifi-player-idle-rifle", "scifi-player-idle-rifle", 4, 7);
  createAnimation(scene, "scifi-player-walk-pistol", "scifi-player-walk-pistol", 6, 11);
  createAnimation(scene, "scifi-player-walk-rifle", "scifi-player-walk-rifle", 6, 11);
  createAnimation(scene, "scifi-player-run-pistol", "scifi-player-run-pistol", 6, 14);
  createAnimation(scene, "scifi-player-run-rifle", "scifi-player-run-rifle", 6, 14);
  createAnimation(scene, "scifi-player-shoot-pistol", "scifi-player-shoot-pistol", 2, 18, 0);
  createAnimation(scene, "scifi-player-shoot-rifle", "scifi-player-shoot-rifle", 2, 18, 0);
  createAnimation(scene, "scifi-player-use", "scifi-player-use", 3, 8);
  createAnimation(scene, "scifi-player-unarmed-idle", "scifi-player-use", 1, 1);
  createAnimation(scene, "scifi-player-legs-idle", "scifi-player-legs-idle", 1, 1);
  createAnimation(scene, "scifi-player-legs-walk", "scifi-player-legs-walk", 6, 9);
  createAnimation(scene, "scifi-player-legs-run", "scifi-player-legs-run", 6, 12);
  createAnimation(scene, "scifi-player-punch-pistol", "scifi-player-punch-pistol", 4, 14, 0);
  createAnimation(scene, "scifi-player-reload-pistol", "scifi-player-reload-pistol", 4, 12, 0);
  createAnimation(scene, "scifi-player-reload-rifle", "scifi-player-reload-rifle", 4, 12, 0);
  createAnimation(scene, "scifi-player-switch-pistol", "scifi-player-switch-pistol", 3, 14, 0);
  createAnimation(scene, "scifi-player-switch-rifle", "scifi-player-switch-rifle", 3, 14, 0);
  createAnimation(scene, "scifi-player-pain-pistol", "scifi-player-pain-pistol", 3, 12, 0);
  createAnimation(scene, "scifi-player-pain-rifle", "scifi-player-pain-rifle", 3, 12, 0);
  createAnimation(scene, "scifi-player-death", "scifi-player-death", 4, 8, 0);

  createAnimation(scene, "scifi-enemy-idle", "scifi-enemy-idle", 4, 6);
  createAnimation(scene, "scifi-enemy-walk", "scifi-enemy-walk", 6, 9);
  createAnimation(scene, "scifi-enemy-run", "scifi-enemy-run", 6, 12);
  createAnimation(scene, "scifi-enemy-attack", "scifi-enemy-attack", 7, 13);
  createAnimation(scene, "scifi-enemy-death", "scifi-enemy-death", 5, 8, 0);
  createAnimation(scene, "scifi-bullet-puff", "scifi-bullet-puff", 5, 18, 0);
  createAnimation(scene, "scifi-monster-blood-death", "scifi-monster-blood-death", 5, 18, 0);
  createAnimation(scene, "scifi-monster-blood-splash", "scifi-monster-blood-splash", 5, 18, 0);
  createAnimation(scene, "scifi-player-blood-death", "scifi-player-blood-death", 5, 18, 0);
  createAnimation(scene, "scifi-player-blood-splash", "scifi-player-blood-splash", 4, 18, 0);
};
