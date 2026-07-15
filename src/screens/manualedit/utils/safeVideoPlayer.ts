import type { VideoPlayer } from 'expo-video';

export function safePausePlayer(player: VideoPlayer | null | undefined) {
  if (!player) return;

  try {
    player.pause();
  } catch {
    // Expo Video can release shared objects during navigation/unmount.
    // If that happens, pausing is no longer valid and should be ignored.
  }
}