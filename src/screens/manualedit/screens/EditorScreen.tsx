import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useTheme } from '../../../theme/ThemeProvider';
import { TopBar } from '../components/top-bar/TopBar';
import { VideoPreview } from '../components/video-preview/VideoPreview';
import { PlaybackControls } from '../components/playback-controls/PlaybackControls';
import { TimelineLayout } from '../components/timeline/TimelineLayout';
import { BottomToolbar } from '../components/bottom-toolbar/BottomToolbar';
import { LeftQuickActions } from '../components/left-actions/LeftQuickActions';
import { useEditorState } from '../hooks/useEditorState';
import { TrimPanel } from '../features/trim/TrimPanel';
import { TimelinePlaybackSync } from '../playback/TimelinePlaybackSync';

export function EditorScreen() {
  const { theme } = useTheme();
  const selectedToolId = useEditorState(s => s.selectedToolId);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.bg }]}>
      <StatusBar style="light" />
      <TimelinePlaybackSync />
      
      <TopBar />
      
      <View style={styles.workspace}>
        {/* Left Floating Actions */}
        <LeftQuickActions />

        {/* Video Preview */}
        <View style={styles.previewContainer}>
          <VideoPreview />
        </View>

        {/* Playback Controls */}
        <PlaybackControls />

        {/* Timeline Area */}
        <View style={styles.timelineContainer}>
          <TimelineLayout />
        </View>
      </View>

      {/* Bottom Editor Toolbar */}
      <BottomToolbar />

      {/* Conditionally Render Active Tool Panel (Mock) */}
      {selectedToolId === 'trim' && <TrimPanel />}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  workspace: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
  },
  previewContainer: {
    flex: 4, // Takes up more space
    backgroundColor: '#000',
  },
  timelineContainer: {
    flex: 3, // Takes up bottom space
  }
});
