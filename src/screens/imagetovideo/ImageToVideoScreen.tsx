import React, { useMemo, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as ImagePicker from 'expo-image-picker';
import { Clock, ImageIcon, Sparkles, Zap } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { ChipSelector } from '../../components/ChipSelector';
import { ASPECT_RATIOS, DURATIONS_SEC, CREDIT_COSTS, VIDEO_STYLES } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { startGeneration } from '../../services/projectService';
import type { CreateStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<CreateStackParamList, 'ImageToVideo'>;

export function ImageToVideoScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState<(typeof VIDEO_STYLES)[number]>('Cinematic');
  const [aspect, setAspect] = useState<(typeof ASPECT_RATIOS)[number]>('9:16');
  const [duration, setDuration] = useState<(typeof DURATIONS_SEC)[number]>(8);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const creditsRequired = useMemo(() => Math.round(CREDIT_COSTS.image_to_video * (duration / 8)), [duration]);

  const pickFromLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const pickFromCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const result = await ImagePicker.launchCameraAsync({ quality: 0.9 });
    if (!result.canceled) setImageUri(result.assets[0].uri);
  };

  const onGenerate = async () => {
    if (!user || !imageUri) return;
    setError(null);
    setLoading(true);
    const res = await startGeneration({
      userId: user.id,
      type: 'image_to_video',
      prompt,
      mediaUri: imageUri,
      creditsCost: creditsRequired,
      options: { style, aspect, duration },
    });
    setLoading(false);
    if (res.error || !res.projectId) { setError(res.error ?? 'Could not start generation'); return; }
    navigation.navigate('GenerationProgress', { projectId: res.projectId, type: 'image_to_video' });
  };

  return (
    <Screen>
      <View>
        <Text style={[typography.display, { color: theme.textPrimary }]}>Image to Video</Text>
        <Text style={[typography.body, { color: theme.textMuted, marginTop: 6 }]}>Bring a still photo to life.</Text>
      </View>

      {imageUri ? (
        <Pressable onPress={pickFromLibrary} style={styles.imagePreviewWrap}>
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        </Pressable>
      ) : (
        <View style={styles.uploadRow}>
          <Pressable onPress={pickFromLibrary} style={[styles.uploadBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <ImageIcon size={22} color={theme.accentAlt} />
            <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 6 }]}>Gallery</Text>
          </Pressable>
          <Pressable onPress={pickFromCamera} style={[styles.uploadBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Sparkles size={22} color={theme.accentAlt} />
            <Text style={[typography.caption, { color: theme.textSecondary, marginTop: 6 }]}>Camera</Text>
          </Pressable>
        </View>
      )}

      <TextInput
        style={[styles.promptBox, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
        placeholder="Optional: describe how it should move (e.g. slow zoom, wind blowing hair)…"
        placeholderTextColor={theme.textMuted}
        multiline
        value={prompt}
        onChangeText={setPrompt}
      />

      <ChipSelector label="Style" options={VIDEO_STYLES} value={style} onChange={setStyle} />
      <ChipSelector label="Aspect ratio" options={ASPECT_RATIOS} value={aspect} onChange={setAspect} />
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
          <Text style={[typography.caption, { color: theme.textSecondary }]}>~{20 + duration * 3}s estimated</Text>
        </View>
      </View>

      {error && <Text style={{ color: theme.danger, ...typography.caption }}>{error}</Text>}

      <Button label="Generate" icon={<Sparkles size={16} color="#0b0c10" />} onPress={onGenerate} loading={loading} disabled={!imageUri} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  uploadRow: { flexDirection: 'row', gap: spacing.md },
  uploadBox: { flex: 1, aspectRatio: 1.4, borderRadius: radius.lg, borderWidth: 1, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center' },
  imagePreviewWrap: { borderRadius: radius.lg, overflow: 'hidden' },
  imagePreview: { width: '100%', aspectRatio: 1.4 },
  promptBox: { minHeight: 90, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, fontSize: 14, textAlignVertical: 'top' },
  durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  summary: { flexDirection: 'row', gap: spacing.lg, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});
