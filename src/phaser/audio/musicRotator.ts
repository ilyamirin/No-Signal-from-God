import Phaser from "phaser";

import godDoesntRespond1Url from "../../assets/music/god-doesnt-respond-1.mp3?url";
import godDoesntRespond2Url from "../../assets/music/god-doesnt-respond-2.mp3?url";
import godDoesntRespond3Url from "../../assets/music/god-doesnt-respond-3.mp3?url";
import godDoesntRespondUrl from "../../assets/music/god-doesnt-respond.mp3?url";
import noSignalFromGodUrl from "../../assets/music/no-signal-from-god.mp3?url";
import { pickNextMusicTrack } from "./musicSelection";

export type MusicTrack = {
  key: string;
  label: string;
  url: string;
};

export const musicTracks = [
  { key: "music-god-doesnt-respond", label: "God doesn't respond", url: godDoesntRespondUrl },
  { key: "music-god-doesnt-respond-1", label: "God doesn't respond 1", url: godDoesntRespond1Url },
  { key: "music-god-doesnt-respond-2", label: "God doesn't respond 2", url: godDoesntRespond2Url },
  { key: "music-god-doesnt-respond-3", label: "God doesn't respond 3", url: godDoesntRespond3Url },
  { key: "music-no-signal-from-god", label: "No signal from god", url: noSignalFromGodUrl },
] satisfies MusicTrack[];

export const backgroundMusicVolume = 0.12;

export type MusicRotator = {
  start: () => void;
  stop: () => void;
};

type MusicRotatorOptions = {
  random?: () => number;
  volume?: number;
};

export const createMusicRotator = (
  scene: Phaser.Scene,
  tracks: readonly MusicTrack[] = musicTracks,
  options: MusicRotatorOptions = {},
): MusicRotator => {
  const random = options.random ?? Math.random;
  const volume = options.volume ?? backgroundMusicVolume;
  let currentSound: Phaser.Sound.BaseSound | undefined;
  let currentTrackKey: string | undefined;
  let loadToken = 0;
  let stopped = false;

  const removeCurrentSound = (): void => {
    if (!currentSound) {
      return;
    }

    currentSound.removeAllListeners();
    currentSound.stop();
    currentSound.destroy();
    currentSound = undefined;
  };

  const playLoadedTrack = (track: MusicTrack, token: number): void => {
    if (stopped || token !== loadToken) {
      return;
    }

    removeCurrentSound();
    const sound = scene.sound.add(track.key, { volume, loop: false });
    currentSound = sound;

    sound.once(Phaser.Sound.Events.COMPLETE, () => {
      if (currentSound === sound) {
        sound.destroy();
        currentSound = undefined;
      }
      queueNextTrack(track.key);
    });

    const startPlayback = (): void => {
      if (stopped || currentSound !== sound) {
        return;
      }

      if (scene.sound.locked) {
        scene.sound.once(Phaser.Sound.Events.UNLOCKED, startPlayback);
        return;
      }

      sound.play({ volume, loop: false });
    };

    startPlayback();
  };

  const loadAndPlayTrack = (track: MusicTrack, token: number): void => {
    currentTrackKey = track.key;

    if (scene.cache.audio.exists(track.key)) {
      playLoadedTrack(track, token);
      return;
    }

    const completeEvent = `filecomplete-audio-${track.key}`;
    const cleanupLoaderListeners = (): void => {
      scene.load.off(completeEvent, onComplete);
      scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);
    };
    const onComplete = (): void => {
      cleanupLoaderListeners();
      playLoadedTrack(track, token);
    };
    const onLoadError = (file: { key?: string }): void => {
      if (file.key !== track.key) {
        return;
      }

      cleanupLoaderListeners();
      queueNextTrack(track.key);
    };

    scene.load.on(completeEvent, onComplete);
    scene.load.on(Phaser.Loader.Events.FILE_LOAD_ERROR, onLoadError);
    scene.load.audio(track.key, track.url);

    if (!scene.load.isLoading()) {
      scene.load.start();
    }
  };

  function queueNextTrack(previousKey?: string): void {
    if (stopped) {
      return;
    }

    const track = pickNextMusicTrack(tracks, previousKey, random);
    loadAndPlayTrack(track, ++loadToken);
  }

  const stop = (): void => {
    stopped = true;
    loadToken += 1;
    removeCurrentSound();
    if (currentTrackKey) {
      scene.load.off(`filecomplete-audio-${currentTrackKey}`);
      scene.load.off(Phaser.Loader.Events.FILE_LOAD_ERROR);
    }
  };

  scene.events.once(Phaser.Scenes.Events.SHUTDOWN, stop);
  scene.events.once(Phaser.Scenes.Events.DESTROY, stop);

  return {
    start: () => {
      stopped = false;
      queueNextTrack(currentTrackKey);
    },
    stop,
  };
};
