import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Film, Minus, Plus, Scissors, Sparkles, Wand2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { CREDIT_COSTS } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { startGeneration } from '../../services/projectService';
import type { CreateStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<CreateStackParamList, 'ManualEdit'>;

const FILTERS = ['None', 'Cinematic', 'Vintage', 'Noir', 'Vivid'] as const;
const TRANSITIONS = ['Cut', 'Fade', 'Zoom'] as const;

export function ManualEditScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [trimStart, setTrimStart] = useState(0);
  const [trimEnd, setTrimEnd] = useState(10);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>('None');
  const [transition, setTransition] = useState<(typeof TRANSITIONS)[number]>('Cut');
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const player = useVideoPlayer(videoUri ?? null);

  const pickVideo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 1 });
    if (!result.canceled) setVideoUri(result.assets[0].uri);
  };

  const onExport = async () => {
    if (!user || !videoUri) return;
    setError(null);
    setLoading(true);
    const res = await startGeneration({
      userId: user.id,
      type: 'manual_edit',
      prompt: caption || null,
      mediaUri: videoUri,
      creditsCost: CREDIT_COSTS.manual_edit_export,
      options: { trimStart, trimEnd, filter, transition, caption },
    });
    setLoading(false);
    if (res.error || !res.projectId) { setError(res.error ?? 'Could not start export'); return; }
    navigation.navigate('GenerationProgress', { projectId: res.projectId, type: 'manual_edit' });
  };

  return (
    <Screen>
      <View>
        <Text style={[typography.display, { color: theme.textPrimary }]}>Manual Edit</Text>
        <Text style={[typography.body, { color: theme.textMuted, marginTop: 6 }]}>
          Quick trim, filter and export. Need layers, masking, or advanced grading? Open the full editor on veytrix.com.
        </Text>
      </View>

      {videoUri ? (
        <View style={[styles.previewFrame, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="contain" />
        </View>
      ) : (
        <Pressable onPress={pickVideo} style={[styles.uploadBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Film size={22} color={theme.accentAlt} />
          <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 6 }]}>Upload video</Text>
        </Pressable>
      )}

      {videoUri && (
        <>
          <View style={{ gap: spacing.sm }}>
            <View style={styles.rowBetween}>
              <Text style={[typography.caption, { color: theme.textMuted }]}>
                <Scissors size={12} color={theme.textMuted} /> Trim
              </Text>
              <Text style={[typography.caption, { color: theme.textSecondary }]}>{trimStart}s → {trimEnd}s</Text>
            </View>
            <View style={styles.trimRow}>
              <Stepper label="Start" value={trimStart} onDec={() => setTrimStart((v) => Math.max(0, v - 1))} onInc={() => setTrimStart((v) => Math.min(trimEnd - 1, v + 1))} />
              <Stepper label="End" value={trimEnd} onDec={() => setTrimEnd((v) => Math.max(trimStart + 1, v - 1))} onInc={() => setTrimEnd((v) => v + 1)} />
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.caption, { color: theme.textMuted }]}>Filter</Text>
            <View style={styles.chipRow}>
              {FILTERS.map((f) => (
                <Button key={f} label={f} variant={f === filter ? 'primary' : 'secondary'} fullWidth={false} onPress={() => setFilter(f)} />
              ))}
            </View>
          </View>

          <View style={{ gap: spacing.sm }}>
            <Text style={[typography.caption, { color: theme.textMuted }]}>Transition</Text>
            <View style={styles.chipRow}>
              {TRANSITIONS.map((t) => (
                <Button key={t} label={t} variant={t === transition ? 'primary' : 'secondary'} fullWidth={false} onPress={() => setTransition(t)} />
              ))}
            </View>
          </View>

          <TextInput
            style={[styles.captionBox, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
            placeholder="Optional caption text…"
            placeholderTextColor={theme.textMuted}
            value={caption}
            onChangeText={setCaption}
          />

          {error && <Text style={{ color: theme.danger, ...typography.caption }}>{error}</Text>}

          <Button label={`Export (${CREDIT_COSTS.manual_edit_export} credits)`} icon={<Wand2 size={16} color="#0b0c10" />} onPress={onExport} loading={loading} />
        </>
      )}
    </Screen>
  );
}

function Stepper({ label, value, onDec, onInc }: { label: string; value: number; onDec: () => void; onInc: () => void }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.stepper, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      <Text style={[typography.tiny, { color: theme.textMuted }]}>{label}</Text>
      <View style={styles.stepperRow}>
        <Pressable onPress={onDec} style={[styles.stepBtn, { borderColor: theme.border }]}><Minus size={14} color={theme.textPrimary} /></Pressable>
        <Text style={[typography.bodyMedium, { color: theme.textPrimary, minWidth: 32, textAlign: 'center' }]}>{value}s</Text>
        <Pressable onPress={onInc} style={[styles.stepBtn, { borderColor: theme.border }]}><Plus size={14} color={theme.textPrimary} /></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  uploadBox: { aspectRatio: 1.9, borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  previewFrame: { aspectRatio: 1.7, borderRadius: radius.lg, borderWidth: 1, overflow: 'hidden' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between' },
  trimRow: { flexDirection: 'row', gap: spacing.md },
  stepper: { flex: 1, borderRadius: radius.md, borderWidth: 1, padding: spacing.sm, gap: 6 },
  stepperRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: { width: 28, height: 28, borderRadius: radius.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  captionBox: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, fontSize: 14 },
});
