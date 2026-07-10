import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useVideoPlayer, VideoView } from 'expo-video';
import { CheckCircle2, Download, Pause, Play, Share2, Trash2, X } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { useRealtimeProject } from '../../hooks/useRealtimeProject';
import { useProjectStore } from '../../store/projectStore';
import { analytics } from '../../services/analyticsService';
import type { CreateStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<CreateStackParamList, 'GenerationProgress'>;

const STAGE_LABEL: Record<string, string> = {
  queued: 'Queued…',
  generating: 'AI Rendering…',
  processing: 'Uploading…',
  completed: 'Almost Ready…',
};

export function GenerationProgressScreen({ route, navigation }: Props) {
  const { projectId } = route.params;
  const { theme } = useTheme();
  const project = useRealtimeProject(projectId);
  const removeProject = useProjectStore((s) => s.removeProject);
  const reportedDone = useRef(false);
  const [paused, setPaused] = useState(false);

  const player = useVideoPlayer(project?.outputUrl && project.outputUrl !== 'demo://generated-video' ? project.outputUrl : null);

  useEffect(() => {
    if (project?.status === 'completed' && !reportedDone.current) {
      reportedDone.current = true;
      analytics.logEvent('generation_completed', { type: project.type });
    }
    if (project?.status === 'failed' && !reportedDone.current) {
      reportedDone.current = true;
      analytics.logEvent('generation_failed', { type: project.type, error: project.errorMessage ?? undefined });
    }
  }, [project?.status]);

  if (!project) {
    return (
      <Screen>
        <ActivityIndicator color={theme.accentAlt} />
      </Screen>
    );
  }

  const isDone = project.status === 'completed';
  const isFailed = project.status === 'failed';
  const isDemo = project.outputUrl === 'demo://generated-video';

  return (
    <Screen scroll={false}>
      <View style={styles.header}>
        <Text style={[typography.h1, { color: theme.textPrimary }]}>
          {isDone ? 'Your video is ready' : isFailed ? 'Generation failed' : 'Creating your video'}
        </Text>
        {!isDone && !isFailed && <Text style={[typography.body, { color: theme.textMuted, marginTop: 6 }]}>{STAGE_LABEL[project.status]}</Text>}
      </View>

      <View style={[styles.previewFrame, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {isDone ? (
          isDemo ? (
            <View style={styles.center}>
              <CheckCircle2 size={40} color={theme.success} />
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing.sm, textAlign: 'center' }]}>
                Demo mode — connect Supabase + an AI provider to see a real rendered video here.
              </Text>
            </View>
          ) : (
            <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" />
          )
        ) : isFailed ? (
          <View style={styles.center}>
            <X size={40} color={theme.danger} />
            <Text style={[typography.body, { color: theme.textPrimary, marginTop: spacing.sm }]}>{project.errorMessage ?? 'Something went wrong.'}</Text>
          </View>
        ) : (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={theme.accentAlt} />
            <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing.md }]}>{STAGE_LABEL[project.status]}</Text>
          </View>
        )}
      </View>

      {isDone && !isDemo && (
        <View style={styles.controls}>
          <Pressable onPress={() => { player.playing ? player.pause() : player.play(); setPaused(!paused); }} style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            {player.playing ? <Pause size={18} color={theme.textPrimary} /> : <Play size={18} color={theme.textPrimary} />}
          </Pressable>
        </View>
      )}

      <View style={styles.footer}>
        {isDone ? (
          <>
            <Button label="Download" icon={<Download size={16} color="#0b0c10" />} onPress={() => analytics.logEvent('export_completed', { type: project.type })} />
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Button label="Share" variant="secondary" icon={<Share2 size={16} color={theme.textPrimary} />} onPress={() => analytics.logEvent('share_completed')} />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  label="Delete"
                  variant="danger"
                  icon={<Trash2 size={16} color={theme.danger} />}
                  onPress={() => { removeProject(project.id); navigation.popToTop(); }}
                />
              </View>
            </View>
          </>
        ) : isFailed ? (
          <Button label="Back to Create" variant="secondary" onPress={() => navigation.popToTop()} />
        ) : (
          <Button label="Cancel generation" variant="danger" onPress={() => { removeProject(project.id); navigation.popToTop(); }} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.md },
  previewFrame: { flex: 1, borderRadius: radius.xl, borderWidth: 1, marginTop: spacing.lg, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  controls: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.md },
  iconBtn: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  footer: { gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.lg },
  row: { flexDirection: 'row', gap: spacing.sm },
});
