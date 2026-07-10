import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Copy, Trash2, Wand2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { StatusBadge } from '../../components/StatusBadge';
import { useProjectStore } from '../../store/projectStore';
import type { ProjectsStackParamList, MainTabParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<ProjectsStackParamList, 'ProjectDetail'>,
  BottomTabScreenProps<MainTabParamList>
>;

export function ProjectDetailScreen({ route, navigation }: Props) {
  const { projectId } = route.params;
  const { theme } = useTheme();
  const project = useProjectStore((s) => s.projects.find((p) => p.id === projectId));
  const duplicateProject = useProjectStore((s) => s.duplicateProject);
  const removeProject = useProjectStore((s) => s.removeProject);

  if (!project) {
    return (
      <Screen>
        <Text style={{ color: theme.textMuted }}>This project is no longer available.</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={[styles.preview, { backgroundColor: theme.surfaceAlt }]} />
      <View style={styles.headerRow}>
        <Text style={[typography.h1, { color: theme.textPrimary, flex: 1 }]} numberOfLines={2}>
          {project.prompt || 'Untitled project'}
        </Text>
        <StatusBadge status={project.status} />
      </View>

      <View style={[styles.metaCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[typography.caption, { color: theme.textMuted }]}>Type</Text>
        <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>{project.type.replace(/_/g, ' ')}</Text>
        <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing.sm }]}>Credits spent</Text>
        <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>{project.creditsCost}</Text>
        {project.errorMessage && (
          <>
            <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing.sm }]}>Error</Text>
            <Text style={[typography.bodyMedium, { color: theme.danger }]}>{project.errorMessage}</Text>
          </>
        )}
      </View>

      {(project.status === 'draft' || project.type === 'manual_edit') && (
        <Button label="Continue editing" icon={<Wand2 size={16} color="#0b0c10" />} onPress={() => navigation.getParent()?.navigate('CreateTab', { screen: 'ManualEdit', params: { projectId: project.id } } as never)} />
      )}
      <Button label="Duplicate" variant="secondary" icon={<Copy size={16} color={theme.textPrimary} />} onPress={() => duplicateProject(project.id)} />
      <Button
        label="Delete"
        variant="danger"
        icon={<Trash2 size={16} color={theme.danger} />}
        onPress={() => { removeProject(project.id); navigation.goBack(); }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  preview: { height: 220, borderRadius: radius.lg },
  headerRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  metaCard: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg },
});
