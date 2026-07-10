import React, { useEffect } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Download, Share as ShareIcon, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { EmptyState } from '../../components/EmptyState';
import { useProjectStore } from '../../store/projectStore';
import { useDownloadsStore } from '../../store/downloadsStore';
import { analytics } from '../../services/analyticsService';

export function DownloadsScreen() {
  const { theme } = useTheme();
  const projects = useProjectStore((s) => s.projects);
  const downloadedIds = useDownloadsStore((s) => s.downloadedIds);
  const hydrate = useDownloadsStore((s) => s.hydrate);
  const markDownloaded = useDownloadsStore((s) => s.markDownloaded);
  const removeDownload = useDownloadsStore((s) => s.removeDownload);

  useEffect(() => { hydrate(); }, []);

  const downloaded = projects.filter((p) => downloadedIds.includes(p.id) && p.status === 'completed');

  const onDownloadAgain = async (outputUrl: string | null, id: string) => {
    if (!outputUrl || !outputUrl.startsWith('http')) return;
    try {
      await File.downloadFileAsync(outputUrl, new File(Paths.document, `${id}.mp4`), { idempotent: true });
      await markDownloaded(id);
    } catch (e) {
      analytics.recordError(e, 'downloadAgain');
    }
  };

  const onShare = async (localId: string) => {
    const file = new File(Paths.document, `${localId}.mp4`);
    const available = await Sharing.isAvailableAsync();
    if (available && file.exists) await Sharing.shareAsync(file.uri).catch(() => {});
  };

  return (
    <Screen scroll={false}>
      <Text style={[typography.display, { color: theme.textPrimary }]}>Downloads</Text>
      <FlatList
        data={downloaded}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.xxxl }}
        ListEmptyComponent={
          <EmptyState
            icon={<Download size={32} color={theme.textMuted} />}
            title="No downloads yet"
            body="Videos you download from a completed project will appear here for offline access."
          />
        }
        renderItem={({ item }) => (
          <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={[styles.thumb, { backgroundColor: theme.surfaceAlt }]} />
            <Text style={[typography.bodyMedium, { color: theme.textPrimary, flex: 1 }]} numberOfLines={2}>
              {item.prompt || item.type.replace(/_/g, ' ')}
            </Text>
            <Pressable onPress={() => onDownloadAgain(item.outputUrl, item.id)} style={styles.iconBtn}>
              <Download size={18} color={theme.textPrimary} />
            </Pressable>
            <Pressable onPress={() => onShare(item.id)} style={styles.iconBtn}>
              <ShareIcon size={18} color={theme.textPrimary} />
            </Pressable>
            <Pressable onPress={() => removeDownload(item.id)} style={styles.iconBtn}>
              <Trash2 size={18} color={theme.danger} />
            </Pressable>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radius.lg, padding: spacing.sm },
  thumb: { width: 48, height: 48, borderRadius: radius.md },
  iconBtn: { padding: 6 },
});
