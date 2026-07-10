import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, typography } from '../theme/tokens';
import type { ProjectStatus } from '../types';

const LABELS: Record<ProjectStatus, string> = {
  draft: 'Draft',
  queued: 'Queued',
  generating: 'Generating',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const { theme } = useTheme();
  const color =
    status === 'completed' ? theme.success : status === 'failed' ? theme.danger : status === 'draft' ? theme.textMuted : theme.accentAlt;
  return (
    <View style={[styles.badge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={[styles.text, { color }]}>{LABELS[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill, borderWidth: 1 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  text: { ...typography.tiny, textTransform: 'uppercase' as const },
});
