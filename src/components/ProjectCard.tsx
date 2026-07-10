import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Film, Image as ImageIcon, Sparkles, Wand2 } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography } from '../theme/tokens';
import { StatusBadge } from './StatusBadge';
import type { Project } from '../types';

const TYPE_ICON: Record<Project['type'], typeof Sparkles> = {
  text_to_video: Sparkles,
  image_to_video: ImageIcon,
  reference_video: Film,
  manual_edit: Wand2,
};

const TYPE_LABEL: Record<Project['type'], string> = {
  text_to_video: 'AI Video',
  image_to_video: 'Image to Video',
  reference_video: 'Reference Video',
  manual_edit: 'Manual Edit',
};

export function ProjectCard({ project, onPress }: { project: Project; onPress: () => void }) {
  const { theme } = useTheme();
  const Icon = TYPE_ICON[project.type];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <View style={[styles.thumb, { backgroundColor: theme.surfaceAlt }]}>
        <Icon size={22} color={theme.accentAlt} />
      </View>
      <View style={styles.meta}>
        <Text style={[styles.title, { color: theme.textPrimary }]} numberOfLines={1}>
          {project.prompt || TYPE_LABEL[project.type]}
        </Text>
        <Text style={[styles.subtitle, { color: theme.textMuted }]}>{TYPE_LABEL[project.type]}</Text>
        <StatusBadge status={project.status} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, alignItems: 'center' },
  thumb: { width: 56, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
  meta: { flex: 1, gap: 4 },
  title: { ...typography.bodyMedium },
  subtitle: { ...typography.caption },
});
