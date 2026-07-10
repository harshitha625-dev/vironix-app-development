import React, { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { Bell, Film, ImageIcon, Sparkles, TrendingUp, Wallet, Wand2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { CreditPill } from '../../components/CreditPill';
import { BigActionCard } from '../../components/BigActionCard';
import { ProjectCard } from '../../components/ProjectCard';
import { EmptyState } from '../../components/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { useProjectStore } from '../../store/projectStore';
import type { HomeStackParamList, MainTabParamList, CreateStackParamList } from '../../navigation/types';

type Props = CompositeScreenProps<
  NativeStackScreenProps<HomeStackParamList, 'HomeMain'>,
  BottomTabScreenProps<MainTabParamList>
>;

const TRENDING = [
  { id: 't1', title: 'Cinematic product reveal', type: 'text_to_video' as const },
  { id: 't2', title: 'Photo to motion portrait', type: 'image_to_video' as const },
  { id: 't3', title: 'Anime style restyle', type: 'reference_video' as const },
];

export function HomeScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const projects = useProjectStore((s) => s.projects);
  const fetchProjects = useProjectStore((s) => s.fetchProjects);

  useEffect(() => {
    if (user) fetchProjects(user.id);
  }, [user?.id]);

  const goCreate = (screen: keyof CreateStackParamList) => {
    navigation.getParent()?.navigate('CreateTab', { screen } as never);
  };

  return (
    <Screen>
      <View style={styles.headerRow}>
        <View>
          <Text style={[typography.caption, { color: theme.textMuted }]}>Welcome back</Text>
          <Text style={[typography.h1, { color: theme.textPrimary }]}>{user?.displayName ?? 'Creator'}</Text>
        </View>
        <View style={styles.headerActions}>
          <CreditPill credits={user?.credits ?? 0} onPress={() => navigation.getParent()?.navigate('ProfileTab', { screen: 'Wallet' } as never)} />
          <Pressable
            onPress={() => navigation.getParent()?.navigate('ProfileTab', { screen: 'Notifications' } as never)}
            style={[styles.iconBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <Bell size={16} color={theme.textPrimary} />
          </Pressable>
        </View>
      </View>

      <View style={styles.actionsGrid}>
        <BigActionCard
          title="Generate Video"
          subtitle="Prompt to video"
          icon={<Sparkles size={20} color="#0b0c10" />}
          featured
          onPress={() => goCreate('AIVideoGeneration')}
        />
        <BigActionCard
          title="Image to Video"
          subtitle="Animate a photo"
          icon={<ImageIcon size={18} color={theme.accentAlt} />}
          onPress={() => goCreate('ImageToVideo')}
        />
        <BigActionCard
          title="Reference Video"
          subtitle="Restyle a clip"
          icon={<Film size={18} color={theme.accentAlt} />}
          onPress={() => goCreate('ReferenceVideo')}
        />
        <BigActionCard
          title="Manual Edit"
          subtitle="Trim, filter, export"
          icon={<Wand2 size={18} color={theme.accentAlt} />}
          onPress={() => goCreate('ManualEdit')}
        />
      </View>

      <View style={styles.sectionHeader}>
        <Text style={[typography.h2, { color: theme.textPrimary }]}>Recent creations</Text>
        <Pressable onPress={() => navigation.getParent()?.navigate('ProjectsTab', { screen: 'ProjectsMain' } as never)}>
          <Text style={[typography.caption, { color: theme.accentAlt }]}>See all</Text>
        </Pressable>
      </View>
      {projects.length === 0 ? (
        <EmptyState
          icon={<Sparkles size={32} color={theme.textMuted} />}
          title="Nothing yet"
          body="Your generated videos will show up here once you create your first one."
        />
      ) : (
        <View style={{ gap: spacing.sm }}>
          {projects.slice(0, 3).map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onPress={() => navigation.navigate('ProjectDetail', { projectId: p.id })}
            />
          ))}
        </View>
      )}

      <View style={styles.sectionHeader}>
        <Text style={[typography.h2, { color: theme.textPrimary }]}>Trending templates</Text>
        <TrendingUp size={16} color={theme.accentAlt} />
      </View>
      <FlatList
        data={TRENDING}
        keyExtractor={(t) => t.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => goCreate(item.type === 'text_to_video' ? 'AIVideoGeneration' : item.type === 'image_to_video' ? 'ImageToVideo' : 'ReferenceVideo')}
            style={[styles.templateCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            <View style={[styles.templateThumb, { backgroundColor: theme.surfaceAlt }]} />
            <Text style={[typography.bodyMedium, { color: theme.textPrimary, marginTop: spacing.sm }]} numberOfLines={2}>
              {item.title}
            </Text>
          </Pressable>
        )}
      />

      <View style={[styles.announcement, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>✨ New: Reference Video restyling is live</Text>
        <Text style={[typography.caption, { color: theme.textMuted, marginTop: 4 }]}>
          Upload any clip and let AI restyle it while keeping the original motion.
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  iconBtn: { width: 34, height: 34, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1 },
  actionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md, justifyContent: 'space-between', alignItems: 'flex-start' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.sm },
  templateCard: { width: 160, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md },
  templateThumb: { height: 80, borderRadius: radius.md },
  announcement: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.lg },
});
