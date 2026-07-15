import React from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { Play, Maximize } from 'lucide-react-native';
import { useEditorState } from '../../hooks/useEditorState';
import { useShallow } from 'zustand/react/shallow';
import { useTheme } from '../../../../theme/ThemeProvider';
import { radius, spacing } from '../../../../theme/tokens';
import { VideoView } from 'expo-video';
import { useEditorPlayer } from '../../context/EditorPlayerContext';

export function VideoPreview() {
  const { theme } = useTheme();
  const { rotation, playbackRate, volume, isMuted } = useEditorState(useShallow(s => ({
    rotation: s.rotation,
    playbackRate: s.playbackRate,
    volume: s.volume,
    isMuted: s.isMuted
  })));
  const { player } = useEditorPlayer();
  const isPlaying = useEditorState(s => s.isPlaying);
  const togglePlay = useEditorState(s => s.togglePlay);

  // Sync playbackRate/volume changes to native player (these change infrequently)
  React.useEffect(() => {
    if (player) {
      player.playbackRate = playbackRate;
    }
  }, [player, playbackRate]);

  React.useEffect(() => {
    if (player) {
      player.volume = volume;
      player.muted = isMuted;
    }
  }, [player, volume, isMuted]);

  return (
    <View style={[styles.container, { backgroundColor: '#000' }]}>
      <View style={styles.videoArea}>
        {player ? (
          <VideoView
            player={player}
            style={{ width: '100%', height: '100%', transform: [{ rotate: `${rotation}deg` }] }}
            nativeControls={false}
          />
        ) : null}

        {!isPlaying && (
          <Pressable style={styles.playOverlay} onPress={togglePlay}>
            <View style={styles.playCircle}>
              <Play fill="#FFF" color="#FFF" size={32} />
            </View>
          </Pressable>
        )}
      </View>

      <Pressable style={styles.fullscreenBtn}>
        <Maximize color="#FFF" size={20} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
  },
  videoArea: {
    height: '100%',
    aspectRatio: 9 / 16,
    backgroundColor: '#111',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  playCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  fullscreenBtn: {
    position: 'absolute',
    bottom: spacing.md,
    right: spacing.md,
    padding: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radius.md,
  }
});
