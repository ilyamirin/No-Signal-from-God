import Phaser from "phaser";

import type { GameState } from "../../game/simulation/types";
import doorOpenUrl from "../../assets/vendor/kenney-audio/door-open.ogg?url";
import footstep00Url from "../../assets/vendor/kenney-audio/footstep00.ogg?url";
import footstep01Url from "../../assets/vendor/kenney-audio/footstep01.ogg?url";
import monsterAttackUrl from "../../assets/vendor/kenney-audio/monster-attack.ogg?url";
import shotPistolUrl from "../../assets/vendor/kenney-audio/shot-pistol.mp3?url";
import shotRifleUrl from "../../assets/vendor/kenney-audio/shot-rifle.mp3?url";
import { createMusicRotator, type MusicRotator } from "./musicRotator";
import { collectSoundEvents, type SoundEvent } from "./soundEvents";

type SoundDef = {
  key: string;
  url: string;
  volume: number;
  cooldownMs: number;
};

const soundDefs = {
  "shot-pistol": { key: "audio-shot-pistol", url: shotPistolUrl, volume: 0.34, cooldownMs: 45 },
  "shot-rifle": { key: "audio-shot-rifle", url: shotRifleUrl, volume: 0.42, cooldownMs: 45 },
  footstep: { key: "audio-footstep-00", url: footstep00Url, volume: 0.16, cooldownMs: 120 },
  "door-move": { key: "audio-door-open", url: doorOpenUrl, volume: 0.22, cooldownMs: 280 },
  "monster-attack": { key: "audio-monster-attack", url: monsterAttackUrl, volume: 0.32, cooldownMs: 260 },
} satisfies Record<SoundEvent, SoundDef>;

const extraSoundDefs = [
  { key: "audio-footstep-01", url: footstep01Url },
];

export type GameAudioController = {
  sync: (previous: GameState, current: GameState) => void;
  music: MusicRotator;
};

export const loadGameAudio = (scene: Phaser.Scene): void => {
  for (const sound of Object.values(soundDefs)) {
    scene.load.audio(sound.key, sound.url);
  }
  for (const sound of extraSoundDefs) {
    scene.load.audio(sound.key, sound.url);
  }
};

export const createGameAudio = (scene: Phaser.Scene): GameAudioController => {
  const lastPlayedAt = new Map<SoundEvent, number>();
  const music = createMusicRotator(scene);
  let footstepIndex = 0;

  music.start();

  const playEvent = (event: SoundEvent): void => {
    const def = soundDefs[event];
    const now = scene.time.now;
    const previousPlayedAt = lastPlayedAt.get(event) ?? -Infinity;
    if (now - previousPlayedAt < def.cooldownMs) {
      return;
    }

    lastPlayedAt.set(event, now);
    const key =
      event === "footstep"
        ? footstepIndex++ % 2 === 0
          ? "audio-footstep-00"
          : "audio-footstep-01"
        : def.key;
    const detune = event === "footstep" ? Phaser.Math.Between(-45, 45) : Phaser.Math.Between(-25, 25);
    scene.sound.play(key, { volume: def.volume, detune });
  };

  return {
    music,
    sync: (previous, current) => {
      for (const event of collectSoundEvents(previous, current)) {
        playEvent(event);
      }
    },
  };
};
