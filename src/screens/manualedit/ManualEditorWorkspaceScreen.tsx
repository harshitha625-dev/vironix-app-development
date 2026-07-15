import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../theme/ThemeProvider';
import { TopBar } from './components/top-bar/TopBar';
import { VideoPreview } from './components/video-preview/VideoPreview';
import { PlaybackControls } from './components/playback-controls/PlaybackControls';
import { TimelineLayout } from './components/timeline/TimelineLayout';
import { BottomToolbar } from './components/bottom-toolbar/BottomToolbar';
import { useEditorState } from './hooks/useEditorState';
import { useShallow } from 'zustand/react/shallow';
import { TrimPanel } from './features/trim/TrimPanel';
import { SpeedPanel } from './features/speed/SpeedPanel';
import { VolumePanel } from './features/volume/VolumePanel';
import { TransformPanel } from './features/transform/TransformPanel';
import { BackendRequiredPanel } from './features/backend-required/BackendRequiredPanel';
import { ComingSoonPanel } from './features/coming-soon/ComingSoonPanel';
import { useAIManualEditStore } from '../../store/aiManualEditStore';
import { useVideoPlayer } from 'expo-video';
import { EditorPlayerProvider } from './context/EditorPlayerContext';
import { TimelinePlaybackSync } from './playback/TimelinePlaybackSync';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { CreateStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<CreateStackParamList, 'ManualEditorWorkspace'>;

export function ManualEditorWorkspaceScreen({ navigation, route }: Props) {
  const { theme } = useTheme();
  const { selectedToolId, initTracksFromMetadata } = useEditorState(useShallow(s => ({
    selectedToolId: s.selectedToolId,
    initTracksFromMetadata: s.initTracksFromMetadata
  })));
  const { selectedVideo, metadata } = useAIManualEditStore();

  const player = useVideoPlayer(selectedVideo ?? null, (p) => {
    p.loop = false;
    p.muted = false;
  });

  useEffect(() => {
    if (metadata && selectedVideo) {
      initTracksFromMetadata(selectedVideo, metadata);
    }
  }, [metadata, selectedVideo]);

  return (
    <EditorPlayerProvider player={player}>
      <TimelinePlaybackSync />
      <SafeAreaView style={[styles.root, { backgroundColor: theme.bg }]}>
        <StatusBar style="light" />

        {/* ── Top bar (back, title, export) ── */}
        <TopBar />

        {/* ── Video Preview — full width now that the left toolbar is gone ── */}
        <View style={styles.previewContainer}>
          <VideoPreview />
        </View>

        {/*
         * ── Playback controls strip ──
         * Sits directly above the timeline, just like VN Editor / CapCut.
         */}
        <PlaybackControls />

        {/*
         * ── Timeline (left toolbar + multi-track rows + playhead) ──
         * Taller flex so thumbnails are clearly visible.
         */}
        <View style={[styles.timelineContainer, { borderTopColor: theme.border }]}>
          <TimelineLayout />
        </View>

        {/* ── Bottom editing toolbar — UNTOUCHED ── */}
        <BottomToolbar />

        {/* ── Conditional feature panels ── */}
        {selectedToolId === 'trim' && <TrimPanel />}
        {selectedToolId === 'speed' && <SpeedPanel />}
        {selectedToolId === 'volume' && <VolumePanel />}
        {selectedToolId === 'mute' && <VolumePanel />}
        {selectedToolId === 'rotate' && <TransformPanel />}

        {['audio', 'text', 'stickers'].includes(selectedToolId || '') && (
          <ComingSoonPanel />
        )}

        {['ai-edit', 'filters', 'effects', 'adjust', 'background', 'replace', 'reverse', 'freeze', 'pip'].includes(selectedToolId || '') && (
          <BackendRequiredPanel />
        )}
      </SafeAreaView>
    </EditorPlayerProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  /**
   * Preview occupies roughly the top 40% of the available space.
   * With the left-side toolbar gone, it can use the full screen width.
   */
  previewContainer: {
    flex: 4,
    backgroundColor: '#000',
  },
  /**
   * Timeline gets flex: 3 — restored so timeline tracks aren't cut off.
   */
  timelineContainer: {
    flex: 3,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
});
