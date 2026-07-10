import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Clock, Sparkles, Zap } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { ChipSelector } from '../../components/ChipSelector';
import { ASPECT_RATIOS, DURATIONS_SEC, QUALITY_TIERS, CREDIT_COSTS } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { startGeneration } from '../../services/projectService';
import type { CreateStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<CreateStackParamList, 'AIVideoGeneration'>;

const QUALITY_MULTIPLIER: Record<(typeof QUALITY_TIERS)[number], number> = { Standard: 1, High: 1.5, Ultra: 2.2 };

export function AIVideoGenerationScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [prompt, setPrompt] = useState('');
  const [aspect, setAspect] = useState<(typeof ASPECT_RATIOS)[number]>('9:16');
  const [duration, setDuration] = useState<(typeof DURATIONS_SEC)[number]>(8);
  const [quality, setQuality] = useState<(typeof QUALITY_TIERS)[number]>('Standard');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creditsRequired = useMemo(
    () => Math.round(CREDIT_COSTS.text_to_video * QUALITY_MULTIPLIER[quality] * (duration / 8)),
    [quality, duration]
  );
  const estimatedSeconds = Math.round(20 + duration * 3 * QUALITY_MULTIPLIER[quality]);

  const onGenerate = async () => {
    if (!user) return;
    setError(null);
    setLoading(true);
    const res = await startGeneration({
      userId: user.id,
      type: 'text_to_video',
      prompt,
      creditsCost: creditsRequired,
      options: { aspect, duration, quality },
    });
    setLoading(false);
    if (res.error || !res.projectId) { setError(res.error ?? 'Could not start generation'); return; }
    navigation.navigate('GenerationProgress', { projectId: res.projectId, type: 'text_to_video' });
  };

  return (
    <Screen>
      <View>
        <Text style={[typography.display, { color: theme.textPrimary }]}>Generate Video</Text>
        <Text style={[typography.body, { color: theme.textMuted, marginTop: 6 }]}>Describe the scene you want AI to create.</Text>
      </View>

      <TextInput
        style={[styles.promptBox, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
        placeholder="A neon-lit street in Tokyo at night, rain reflecting on the pavement, cinematic slow pan…"
        placeholderTextColor={theme.textMuted}
        multiline
        value={prompt}
        onChangeText={setPrompt}
      />

      <ChipSelector label="Aspect ratio" options={ASPECT_RATIOS} value={aspect} onChange={setAspect} />
      <View style={{ gap: spacing.sm }}>
        <Text style={[typography.caption, { color: theme.textMuted }]}>Duration</Text>
        <View style={styles.durationRow}>
          {DURATIONS_SEC.map((d) => {
            const active = d === duration;
            return (
              <Button
                key={d}
                label={`${d}s`}
                variant={active ? 'primary' : 'secondary'}
                fullWidth={false}
                onPress={() => setDuration(d)}
              />
            );
          })}
        </View>
      </View>
      <ChipSelector label="Quality" options={QUALITY_TIERS} value={quality} onChange={setQuality} />

      <View style={[styles.summary, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.summaryRow}>
          <Zap size={14} color={theme.credit} />
          <Text style={[typography.caption, { color: theme.textSecondary }]}>{creditsRequired} credits required</Text>
        </View>
        <View style={styles.summaryRow}>
          <Clock size={14} color={theme.textMuted} />
          <Text style={[typography.caption, { color: theme.textSecondary }]}>~{estimatedSeconds}s estimated</Text>
        </View>
      </View>

      {error && <Text style={{ color: theme.danger, ...typography.caption }}>{error}</Text>}

      <Button
        label="Generate"
        icon={<Sparkles size={16} color="#0b0c10" />}
        onPress={onGenerate}
        loading={loading}
        disabled={!prompt.trim() || (user ? user.credits < creditsRequired : false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  promptBox: { minHeight: 110, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, fontSize: 14, textAlignVertical: 'top' },
  summary: { flexDirection: 'row', gap: spacing.lg, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
