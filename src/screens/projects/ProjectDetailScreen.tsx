import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, Alert } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ChevronLeft, MoreVertical, Play, Clock, Video, FileVideo, Calendar, History, RotateCcw } from 'lucide-react-native';

import { useTheme } from '../../theme/ThemeProvider';
import { typography, spacing, radius } from '../../theme/tokens';
import type { CreateStackParamList } from '../../navigation/types';
import { useProjectStore } from '../../store/projectStore';
import { useHomeStore } from '../../store/homeStore';
import { ProjectService } from '../../services/projectService';

type Props = NativeStackScreenProps<CreateStackParamList, 'ProjectDetail'>;

export function ProjectDetailScreen({ route, navigation }: Props) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { projectId } = route.params;

  const projects = useProjectStore(state => state.projects);
  const project = useMemo(() => projects.find(p => p.id === projectId), [projects, projectId]);
  const homeProject = useHomeStore((state) => state.recentProjects.find((p) => p.id === projectId)) ?? null;
  const detailStatus = project?.status ?? homeProject?.status ?? 'draft';
  const detailTitle = project?.name ?? homeProject?.prompt ?? 'Untitled Project';
  const detailPrompt = project?.aiPrompt || homeProject?.prompt || 'No prompt provided.';
  const detailDuration = project?.duration ?? '00:00';
  const detailResolution = project?.resolution ?? '1080p';
  const detailFileSize = project?.fileSize ?? '0 MB';
  const detailUpdatedAt = project?.updatedAt ?? homeProject?.updatedAt ?? new Date().toISOString();

  if (!project && !homeProject) {
    return (
      <View style={[styles.container, { backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' }]}>
        <Text style={[typography.body, { color: '#EF4444' }]}>Project not found.</Text>
        <Pressable onPress={() => navigation.goBack()} style={{ marginTop: 20 }}>
          <Text style={{ color: '#38DDF8' }}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const handleRestore = (versionId: string) => {
    Alert.alert(
      "Restore Version",
      "Are you sure you want to restore this version? This will become your active draft.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Restore", 
          onPress: async () => {
            await ProjectService.restoreVersion(project.id, versionId);
            Alert.alert("Restored", "Version has been restored successfully.");
          }
        }
      ]
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg, paddingTop: insets.top }]}>
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.iconBtn}>
          <ChevronLeft size={24} color={theme.textPrimary} />
        </Pressable>
        <Text style={[typography.h2, { color: theme.textPrimary }]} numberOfLines={1}>
          Project Details
        </Text>
        <Pressable style={styles.iconBtn}>
          <MoreVertical size={24} color={theme.textPrimary} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        
        {/* Large Thumbnail */}
        <View style={styles.thumbnailContainer}>
          <View style={[styles.thumbnail, { backgroundColor: theme.surfaceAlt }]}>
            <Play size={48} color={theme.textMuted} />
          </View>
          <View style={[styles.statusBadge, { backgroundColor: detailStatus === 'completed' ? 'rgba(56, 221, 248, 0.2)' : 'rgba(139, 92, 246, 0.2)' }]}> 
            <Text style={[typography.caption, { color: detailStatus === 'completed' ? '#38DDF8' : '#8B5CF6', fontWeight: 'bold' }]}> 
              {detailStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Info Box */}
        <View style={styles.section}>
          <Text style={[typography.h2, { color: theme.textPrimary, marginBottom: spacing.xs }]}>{detailTitle}</Text>
          
          <View style={[styles.infoGrid, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Clock size={16} color={theme.textMuted} />
                <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 8 }]}>Duration</Text>
              </View>
              <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>{detailDuration}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Video size={16} color={theme.textMuted} />
                <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 8 }]}>Resolution</Text>
              </View>
              <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>{detailResolution}</Text>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <FileVideo size={16} color={theme.textMuted} />
                <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 8 }]}>File Size</Text>
              </View>
              <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>{detailFileSize}</Text>
            </View>

            <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
              <View style={styles.infoItem}>
                <Calendar size={16} color={theme.textMuted} />
                <Text style={[typography.caption, { color: theme.textSecondary, marginLeft: 8 }]}>Last Modified</Text>
              </View>
              <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>
                {new Date(detailUpdatedAt).toLocaleDateString()}
              </Text>
            </View>

          </View>
        </View>

        {/* AI Prompt */}
        <View style={styles.section}>
          <Text style={[typography.h2, { color: theme.textPrimary, marginBottom: spacing.md }]}>AI Prompt</Text>
          <View style={[styles.promptBox, { backgroundColor: 'rgba(56, 221, 248, 0.05)', borderColor: 'rgba(56, 221, 248, 0.2)' }]}>
            <Text style={[typography.body, { color: theme.textPrimary }]}>
              {detailPrompt}
            </Text>
          </View>
        </View>

        {project ? (
          <View style={styles.section}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md }}>
              <History size={20} color={theme.textPrimary} />
              <Text style={[typography.h2, { color: theme.textPrimary }]}>Version History</Text>
            </View>

            {project.versionHistory.map((version) => (
              <View key={version.id} style={[styles.versionRow, { backgroundColor: theme.surfaceAlt, borderColor: theme.border }]}> 
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>Version {version.versionNumber}</Text>
                  <Text style={[typography.caption, { color: theme.textSecondary }]}>{version.description}</Text>
                  <Text style={[typography.tiny, { color: theme.textMuted, marginTop: 4 }]}> 
                    {new Date(version.createdAt).toLocaleString()}
                  </Text>
                </View>
                
                <Pressable onPress={() => handleRestore(version.id)} style={[styles.restoreBtn, { backgroundColor: 'rgba(56, 221, 248, 0.1)' }]}> 
                  <RotateCcw size={16} color="#38DDF8" />
                  <Text style={[typography.caption, { color: '#38DDF8', marginLeft: 6 }]}>Restore</Text>
                </Pressable>
              </View>
            ))}
          </View>
        ) : null}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  iconBtn: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thumbnailContainer: {
    position: 'relative',
    margin: spacing.xl,
    marginTop: spacing.sm,
  },
  thumbnail: {
    width: '100%',
    aspectRatio: 16/9,
    borderRadius: radius.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    bottom: spacing.md,
    left: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: 6,
  },
  section: {
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.xl,
  },
  infoGrid: {
    borderRadius: radius.md,
    borderWidth: 1,
    overflow: 'hidden',
    marginTop: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  promptBox: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  versionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  restoreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  }
});
