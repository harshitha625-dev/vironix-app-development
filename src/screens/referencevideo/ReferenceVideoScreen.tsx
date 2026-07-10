import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Clock, Film, Sparkles, Zap } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { DURATIONS_SEC, CREDIT_COSTS } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { startGeneration } from '../../services/projectService';
import type { CreateStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<CreateStackParamList, 'ReferenceVideo'>;

export function ReferenceVideoScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [videoUri, setVideoUri] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [strength, setStrength] = useState(0.6);
  const [duration, setDuration] = useState<(typeof DURATIONS_SEC)[number]>(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creditsRequired = useMemo(() => Math.round(CREDIT_COSTS.reference_video * (duration / 8)), [duration]);

  const pickVideo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos'], quality: 1 });
    if (!result.canceled) setVideoUri(result.assets[0].uri);
  };

  const onGenerate = async () => {
    if (!user || !videoUri) return;
    setError(null);
    setLoading(true);
    const res = await startGeneration({
      userId: user.id,
      type: 'reference_video',
      prompt,
      mediaUri: videoUri,
      creditsCost: creditsRequired,
      options: { strength, duration },
    });
    setLoading(false);
    if (res.error || !res.projectId) { setError(res.error ?? 'Could not start generation'); return; }
    navigation.navigate('GenerationProgress', { projectId: res.projectId, type: 'reference_video' });
  };

  const strengthSteps = [0.2, 0.4, 0.6, 0.8, 1.0];

  return (
    <Screen>
      <View>
        <Text style={[typography.display, { color: theme.textPrimary }]}>Reference Video</Text>
        <Text style={[typography.body, { color: theme.textMuted, marginTop: 6 }]}>Upload a clip and let AI restyle it while keeping the motion.</Text>
      </View>

      <Pressable onPress={pickVideo} style={[styles.uploadBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Film size={22} color={theme.accentAlt} />
        <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 6 }]}>
          {videoUri ? 'Video selected — tap to change' : 'Upload reference video'}
        </Text>
      </Pressable>

      <TextInput
        style={[styles.promptBox, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
        placeholder="Describe the new style (e.g. anime, claymation, cinematic noir)…"
        placeholderTextColor={theme.textMuted}
        multiline
        value={prompt}
        onChangeText={setPrompt}
      />

      <View style={{ gap: spacing.sm }}>
        <Text style={[typography.caption, { color: theme.textMuted }]}>Reference strength — how closely to keep the original structure</Text>
        <View style={styles.durationRow}>
          {strengthSteps.map((s) => (
            <Button key={s} label={`${Math.round(s * 100)}%`} variant={s === strength ? 'primary' : 'secondary'} fullWidth={false} onPress={() => setStrength(s)} />
          ))}
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        <Text style={[typography.caption, { color: theme.textMuted }]}>Duration</Text>
        <View style={styles.durationRow}>
          {DURATIONS_SEC.map((d) => (
            <Button key={d} label={`${d}s`} variant={d === duration ? 'primary' : 'secondary'} fullWidth={false} onPress={() => setDuration(d)} />
          ))}
        </View>
      </View>

      <View style={[styles.summary, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.summaryRow}>
          <Zap size={14} color={theme.credit} />
          <Text style={[typography.caption, { color: theme.textSecondary }]}>{creditsRequired} credits required</Text>
        </View>
        <View style={styles.summaryRow}>
          <Clock size={14} color={theme.textMuted} />
          <Text style={[typography.caption, { color: theme.textSecondary }]}>~{25 + duration * 4}s estimated</Text>
        </View>
      </View>

      {error && <Text style={{ color: theme.danger, ...typography.caption }}>{error}</Text>}

      <Button label="Generate" icon={<Sparkles size={16} color="#0b0c10" />} onPress={onGenerate} loading={loading} disabled={!videoUri} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  uploadBox: { aspectRatio: 1.9, borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  promptBox: { minHeight: 90, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, fontSize: 14, textAlignVertical: 'top' },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summary: { flexDirection: 'row', gap: spacing.lg, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
