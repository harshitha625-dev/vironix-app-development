import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Search, Sparkles } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { ProjectCard } from '../../components/ProjectCard';
import { EmptyState } from '../../components/EmptyState';
import { ChipSelector } from '../../components/ChipSelector';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import type { ProjectsStackParamList } from '../../navigation/types';
import type { ProjectStatus } from '../../types';

type Props = NativeStackScreenProps<ProjectsStackParamList, 'ProjectsMain'>;

const FILTERS = ['All', 'Draft', 'Processing', 'Completed', 'Failed'] as const;
const FILTER_TO_STATUS: Record<(typeof FILTERS)[number], ProjectStatus[] | null> = {
  All: null,
  Draft: ['draft'],
  Processing: ['queued', 'generating', 'processing'],
  Completed: ['completed'],
  Failed: ['failed'],
};

export function ProjectsScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const projects = useProjectStore((s) => s.projects);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('All');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (user) fetchProjects(user.id);
  }, [user?.id]);

  const filtered = useMemo(() => {
    const statuses = FILTER_TO_STATUS[filter];
    return projects.filter((p) => {
      const matchesStatus = !statuses || statuses.includes(p.status);
      const matchesQuery = !query || (p.prompt ?? '').toLowerCase().includes(query.toLowerCase());
      return matchesStatus && matchesQuery;
    });
  }, [projects, filter, query]);

  return (
    <Screen scroll={false} style={{ gap: spacing.md }}>
      <Text style={[typography.display, { color: theme.textPrimary }]}>Projects</Text>

      <View style={[styles.searchWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Search size={16} color={theme.textMuted} />
        <TextInput
          style={[styles.searchInput, { color: theme.textPrimary }]}
          placeholder="Search projects"
          placeholderTextColor={theme.textMuted}
          value={query}
          onChangeText={setQuery}
        />
      </View>

      <ChipSelector label="Status" options={FILTERS} value={filter} onChange={setFilter} />

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ gap: spacing.sm, paddingBottom: spacing.xxxl }}
        ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        ListEmptyComponent={
          <EmptyState
            icon={<Sparkles size={32} color={theme.textMuted} />}
            title="No projects found"
            body="Try a different filter, or start a new creation from the Create tab."
          />
        }
        renderItem={({ item }) => (
          <ProjectCard project={item} onPress={() => navigation.navigate('ProjectDetail', { projectId: item.id })} />
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: spacing.md },
  searchInput: { flex: 1, paddingVertical: 12, fontSize: 14 },
});
