import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Play, Pause, Undo, Redo, SkipBack, SkipForward } from 'lucide-react-native';
import { useTheme } from '../../../../theme/ThemeProvider';
import { typography, spacing } from '../../../../theme/tokens';
import { useEditorState } from '../../hooks/useEditorState';
import { useShallow } from 'zustand/react/shallow';
import { useEditorPlayer } from '../../context/EditorPlayerContext';

function CurrentTimeDisplay() {
  const { theme } = useTheme();
  const { currentTime, duration } = useEditorState(useShallow((s) => ({
    currentTime: s.currentTime,
    duration: s.duration,
  })));

  const formatTime = (secs: number) => {
    const totalSeconds = Math.floor(secs);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.timeGroup}>
      <Text style={[typography.caption, { color: theme.textPrimary, fontWeight: 'bold', fontSize: 10 }]}>
        {formatTime(currentTime)}
      </Text>
      <Text style={[typography.caption, { color: theme.textMuted, marginLeft: 2, fontSize: 10 }]}>
        / {formatTime(duration)}
      </Text>
    </View>
  );
}

export function PlaybackControls() {
  const { theme } = useTheme();
  const { duration, tracks, setCurrentTime } = useEditorState(useShallow(s => ({
    duration: s.duration,
    tracks: s.tracks,
    setCurrentTime: s.setCurrentTime
  })));
  const { player } = useEditorPlayer();
  const isPlaying = useEditorState(s => s.isPlaying);
  const togglePlay = useEditorState(s => s.togglePlay);

  const handleSkipBack = () => {
    if (!player) return;
    const currentTime = useEditorState.getState().currentTime;
    const allClips = tracks.filter(t => t.type === 'video').flatMap(t => t.clips);
    const actualDuration = duration;
    const boundaries = allClips.flatMap(c => [c.startTime, c.startTime + c.duration]);
    const times = Array.from(new Set([0, actualDuration, ...boundaries])).sort((a, b) => a - b);

    // Find the boundary strictly less than the current time
    const target = times.slice().reverse().find(t => t < currentTime - 0.01);
    if (target !== undefined) {
      setCurrentTime(target);
    } else {
      setCurrentTime(0);
    }
  };

  const handleSkipForward = () => {
    if (!player) return;
    const currentTime = useEditorState.getState().currentTime;
    const allClips = tracks.filter(t => t.type === 'video').flatMap(t => t.clips);
    const actualDuration = duration;
    const boundaries = allClips.flatMap(c => [c.startTime, c.startTime + c.duration]);
    const times = Array.from(new Set([0, actualDuration, ...boundaries])).sort((a, b) => a - b);

    // Find the boundary strictly greater than current time
    const target = times.find(t => t > currentTime + 0.01);
    if (target !== undefined) {
      setCurrentTime(target);
    } else {
      setCurrentTime(actualDuration);
    }
  };

  return (
    <View style={[styles.container, { borderBottomColor: theme.border, backgroundColor: theme.surface }]}>
      <CurrentTimeDisplay />

      <View style={styles.controlsGroup}>
        <Pressable onPress={handleSkipBack} style={styles.iconBtn}>
          <SkipBack color={theme.textPrimary} size={20} />
        </Pressable>
        <Pressable onPress={togglePlay} style={styles.iconBtn}>
          {isPlaying ? <Pause color={theme.textPrimary} size={24} /> : <Play fill={theme.textPrimary} color={theme.textPrimary} size={24} />}
        </Pressable>
        <Pressable onPress={handleSkipForward} style={styles.iconBtn}>
          <SkipForward color={theme.textPrimary} size={20} />
        </Pressable>
      </View>

      <View style={styles.rightGroup}>
        <Pressable style={styles.iconBtn}><Undo color={theme.textPrimary} size={20} /></Pressable>
        <Pressable style={styles.iconBtn}><Redo color={theme.textMuted} size={20} /></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  timeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  controlsGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.lg,
    flex: 1,
  },
  rightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: spacing.sm,
    flex: 1,
  },
  iconBtn: {
    padding: spacing.xs,
  },
  divider: {
    width: 1,
    height: 16,
    marginHorizontal: spacing.xs,
  }
});
