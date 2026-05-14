export type MusicTrackLike = {
  key: string;
};

export const pickNextMusicTrack = <Track extends MusicTrackLike>(
  tracks: readonly Track[],
  previousKey?: string,
  random = Math.random,
): Track => {
  if (tracks.length === 0) {
    throw new Error("Cannot pick a background music track from an empty list.");
  }

  const candidates =
    tracks.length > 1 ? tracks.filter((track) => track.key !== previousKey) : tracks;
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
  return candidates[index];
};
