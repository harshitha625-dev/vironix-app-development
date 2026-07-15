import React, { useCallback, useEffect, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Dimensions,
  ActivityIndicator,
  Alert,
  Modal
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { UploadCloud, Video, FileVideo, Clock, Maximize, Scissors, Sparkles } from 'lucide-react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { useAIManualEditStore } from '../../store/aiManualEditStore';
import { AIManualEditService } from '../../services/aiManualEditService';
import { useProjectStore } from '../../store/projectStore';
import { safePausePlayer } from './utils/safeVideoPlayer';
import type { CreateStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<CreateStackParamList, 'ManualEdit'>;

const SUGGESTIONS = [
  '🎬 Cinematic',
  '✨ Luxury',
  '🎨 Color Grade',
  '😊 Face Enhance',
  '📝 Auto Captions',
  '🎵 Sync to Music',
  '⚡ Fast Edit',
  '🌅 Travel Vlog'
];

export function ManualEditScreen({ navigation }: Props) {
  const { theme } = useTheme();

  const {
    selectedVideo,
    metadata,
    projectName,
    prompt,
    loading,
    setProjectName,
    setPrompt,
    appendPrompt,
    setSelectedVideo,
    setLoading,
    reset
  } = useAIManualEditStore();

  const projects = useProjectStore(state => state.projects);
  const drafts = projects.filter(p => p.status === 'draft');

  useEffect(() => {
    // Check for draft recovery on mount
    if (drafts.length > 0) {
      Alert.alert(
        "Recover Draft",
        "You have an unsaved draft. Would you like to continue editing?",
        [
          { text: "Discard", style: "destructive", onPress: () => reset() },
          {
            text: "Continue",
            style: "default",
            onPress: () => {
              // Simulate loading draft state then navigating
              navigation.navigate('ManualEditorWorkspace');
            }
          }
        ]
      );
    } else {
      reset();
    }
  }, []);

  const player = useVideoPlayer(selectedVideo ?? null, (p) => {
    p.loop = true;
    p.muted = true;
    if (selectedVideo) p.play();
  });

  // Fix: Pause this preview player when user navigates to the editor.
  // Without this, two native video players are alive simultaneously,
  // fighting over the same video file and causing the editor to glitch.
  useFocusEffect(
    useCallback(() => {
      // Screen gained focus — resume preview if video is selected
      if (player && selectedVideo) {
        player.play();
      }
      return () => {
        // Screen lost focus (editor pushed on top) — stop the preview player
        safePausePlayer(player);
      };
    }, [player, selectedVideo])
  );

  const [realDuration, setRealDuration] = useState<string | null>(null);

  useEffect(() => {
    if (!player) { setRealDuration(null); return; }
    const interval = setInterval(() => {
      if (player.duration > 0) {
        const total = Math.floor(player.duration);
        const h = Math.floor(total / 3600);
        const m = Math.floor((total % 3600) / 60);
        const s = total % 60;
        setRealDuration(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`);
        clearInterval(interval);
      }
    }, 200);
    return () => clearInterval(interval);
  }, [player]);

  const [showMediaModal, setShowMediaModal] = useState(false);

  useEffect(() => {
    // Reset state when mounting screen
    reset();
  }, []);

  const handleMediaOptions = () => {
    setShowMediaModal(true);
  };

  const handlePickMedia = async (source: 'camera_photo' | 'camera_video' | 'gallery') => {
    console.log('[ManualEdit] handlePickMedia called with source:', source);
    setShowMediaModal(false);

    // Wait for modal dismissal animation to complete on iOS before launching ImagePicker
    setTimeout(async () => {
      try {
        console.log('[ManualEdit] setTimeout fired, launching picker...');
        let uri: string | null = null;
        if (source === 'camera_photo') {
          console.log('[ManualEdit] calling captureMedia(photo)');
          uri = await AIManualEditService.captureMedia('photo');
        } else if (source === 'camera_video') {
          console.log('[ManualEdit] calling captureMedia(video)');
          uri = await AIManualEditService.captureMedia('video');
        } else {
          console.log('[ManualEdit] calling pickMediaFromGallery');
          uri = await AIManualEditService.pickMediaFromGallery();
        }

        console.log('[ManualEdit] picker returned uri:', uri);

        if (uri) {
          setLoading(true);
          const meta = await AIManualEditService.analyzeVideo(uri);
          setSelectedVideo(uri, meta);
          setLoading(false);
        }
      } catch (error: any) {
        console.error('[ManualEdit] Error in handlePickMedia:', error);
        Alert.alert('Error', `Failed to pick media: ${error?.message || String(error)}`);
      }
    }, 600);
  };

  const handleRemoveMedia = () => {
    setShowMediaModal(false);
    reset();
  };

  const handleContinue = () => {
    if (!selectedVideo) return;
    navigation.navigate('ManualEditorWorkspace');
  };



  return (
    <Screen style={{ padding: spacing.xl, paddingBottom: 100 }}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={[typography.h1, { color: theme.textPrimary }]}>AI Manual Edit</Text>
        <Text style={[typography.body, { color: theme.textMuted, marginTop: spacing.xs }]}>
          Upload a video and let AI help you edit professionally.
        </Text>
      </View>

      {/* Hero Upload / Preview Area */}
      {loading ? (
        <View style={[styles.uploadCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
          <ActivityIndicator size="large" color="#38DDF8" />
          <Text style={[typography.bodyMedium, { color: theme.textSecondary, marginTop: spacing.md }]}>Analyzing video...</Text>
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing.xs }]}>Reading metadata & generating preview</Text>
        </View>
      ) : selectedVideo && metadata ? (
        <View style={[styles.previewCard, { borderColor: theme.border, backgroundColor: theme.surfaceAlt }]}>
          <View style={styles.previewVideoWrapper}>
            <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={StyleSheet.absoluteFillObject}
            />
            <View style={styles.previewOverlay}>
              <Text style={[typography.h2, { color: '#FFF' }]} numberOfLines={1}>{metadata.name}</Text>
              <View style={styles.metaRow}>
                <View style={styles.metaBadge}><FileVideo size={12} color="#A1A1AA" /><Text style={styles.metaText}>{metadata.size}</Text></View>
                <View style={styles.metaBadge}><Clock size={12} color="#A1A1AA" /><Text style={styles.metaText}>{realDuration ?? metadata.duration}</Text></View>
                <View style={styles.metaBadge}><Maximize size={12} color="#A1A1AA" /><Text style={styles.metaText}>{metadata.resolution}</Text></View>
              </View>
            </View>
          </View>

          <Pressable style={styles.reselectBtn} onPress={handleMediaOptions}>
            <Text style={[typography.caption, { color: theme.textSecondary }]}>Change Media</Text>
          </Pressable>
        </View>
      ) : (
        <View>
          <Pressable onPress={handleMediaOptions} style={styles.uploadCardWrapper}>
            <LinearGradient
              colors={['rgba(56, 221, 248, 0.15)', 'rgba(139, 92, 246, 0.15)']}
              style={styles.uploadCardGlow}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            />
            <BlurView intensity={20} tint="dark" style={[styles.uploadCard, { borderColor: 'rgba(255,255,255,0.1)' }]}>
              <View style={[styles.iconCircle]}>
                <UploadCloud size={32} color="#38DDF8" strokeWidth={1.5} />
              </View>
              <Text style={[typography.h2, { color: theme.textPrimary, marginBottom: spacing.md }]}>
                Upload Media</Text>
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: spacing.xs }]}>Supported: Photos & Videos Only</Text>
              <Text style={[typography.caption, { color: theme.textMuted, marginTop: 2 }]}>Maximum file size 5 GB</Text>

              <View style={styles.uploadBtnRow}>
                <View style={styles.uploadBtn}>
                  <Text style={[typography.bodyMedium, { color: '#FFF' }]}>Select Options</Text>
                </View>
              </View>
            </BlurView>
          </Pressable>
        </View>
      )}

      {/* Project Configuration */}
      <View style={styles.formSection}>

        <View style={styles.inputGroup}>
          <Text style={[typography.caption, { color: theme.textMuted, marginBottom: spacing.xs, marginLeft: 4 }]}>Project Name</Text>
          <TextInput
            style={[styles.input, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
            value={projectName}
            onChangeText={setProjectName}
            placeholderTextColor={theme.textMuted}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={[typography.caption, { color: theme.textMuted, marginBottom: spacing.xs, marginLeft: 4 }]}>AI Prompt</Text>
          <TextInput
            style={[styles.textArea, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
            value={prompt}
            onChangeText={setPrompt}
            placeholder="Describe what you want AI to do... (e.g. Make this cinematic, improve colors)"
            placeholderTextColor={theme.textMuted}
            multiline
            textAlignVertical="top"
          />
        </View>

        <View style={styles.suggestionsContainer}>
          <Text style={[typography.caption, { color: theme.textMuted, marginBottom: spacing.sm, marginLeft: 4 }]}>Quick Suggestions</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipScroll}>
            {SUGGESTIONS.map((sug, idx) => (
              <Pressable
                key={idx}
                onPress={() => appendPrompt(sug.split(' ')[1] ?? sug)}
                style={({ pressed }) => [
                  styles.chip,
                  { backgroundColor: theme.surfaceAlt, borderColor: theme.border },
                  pressed && { opacity: 0.7 }
                ]}
              >
                <Text style={[typography.caption, { color: theme.textSecondary }]}>{sug}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View>

      </View>

      {/* Continue Button */}
      <View style={styles.footer}>
        <Pressable
          onPress={handleContinue}
          disabled={!selectedVideo || loading}
          style={({ pressed }) => [
            styles.continueBtnWrapper,
            (!selectedVideo || loading) && { opacity: 0.5 },
          ]}
        >
          <LinearGradient
            colors={['#38DDF8', '#8B5CF6']}
            style={StyleSheet.absoluteFillObject}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          />
          <View style={styles.continueBtnInner}>
            <Text style={[typography.h2, { color: '#FFF' }]}>Continue to Editor</Text>
            <Sparkles size={18} color="#FFF" />
          </View>
        </Pressable>
      </View>

      {/* Custom Media Selection Modal */}
      <MediaSelectionModal
        visible={showMediaModal}
        onClose={() => setShowMediaModal(false)}
        onSelect={handlePickMedia}
        onRemove={handleRemoveMedia}
        hasMedia={!!selectedVideo}
      />
    </Screen>
  );
}

// Media Selection Modal Component (Inlined for simplicity)
function MediaSelectionModal({ visible, onClose, onSelect, onRemove, hasMedia }: any) {
  const { theme } = useTheme();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <Pressable style={[styles.modalContent, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={(e) => e.stopPropagation()}>
          <View style={styles.modalHeader}>
            <Text style={[typography.h2, { color: theme.textPrimary }]}>Select Media</Text>
          </View>
          <View style={{ gap: spacing.md, paddingVertical: spacing.md }}>
            <Pressable style={[styles.modalOption, { backgroundColor: theme.surfaceAlt }]} onPress={() => onSelect('gallery')}>
              <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>Choose from Gallery</Text>
            </Pressable>
            <Pressable style={[styles.modalOption, { backgroundColor: theme.surfaceAlt }]} onPress={() => onSelect('camera_photo')}>
              <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>Take Photo</Text>
            </Pressable>
            <Pressable style={[styles.modalOption, { backgroundColor: theme.surfaceAlt }]} onPress={() => onSelect('camera_video')}>
              <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>Record Video</Text>
            </Pressable>
            {hasMedia && (
              <Pressable style={[styles.modalOption, { backgroundColor: theme.danger + '33' }]} onPress={onRemove}>
                <Text style={[typography.bodyMedium, { color: theme.danger }]}>Remove Media</Text>
              </Pressable>
            )}
            <Pressable style={[styles.modalOption, { backgroundColor: 'transparent', borderWidth: 1, borderColor: theme.border }]} onPress={onClose}>
              <Text style={[typography.bodyMedium, { color: theme.textMuted, textAlign: 'center' }]}>Cancel</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    padding: spacing.xl,
    paddingBottom: spacing.xxxl,
  },
  header: {
    marginBottom: spacing.xl,
  },
  uploadCardWrapper: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: radius.xl,
    marginBottom: spacing.xl,
  },
  uploadCardGlow: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
    opacity: 0.8,
  },
  uploadCard: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    overflow: 'hidden',
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(56, 221, 248, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 221, 248, 0.3)',
  },
  uploadBtnRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    gap: spacing.sm,
  },
  uploadBtn: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  previewCard: {
    width: '100%',
    aspectRatio: 1.2,
    borderRadius: radius.xl,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: spacing.xl,
  },
  previewVideoWrapper: {
    flex: 1,
    position: 'relative',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radius.sm,
  },
  metaText: {
    color: '#A1A1AA',
    fontSize: 10,
    fontWeight: '500',
  },
  reselectBtn: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  formSection: {
    gap: spacing.lg,
  },
  inputGroup: {
    width: '100%',
  },
  input: {
    height: 52,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    fontSize: 16,
  },
  textArea: {
    height: 120,
    borderRadius: radius.lg,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    fontSize: 16,
  },
  suggestionsContainer: {
    marginTop: spacing.xs,
  },
  chipScroll: {
    gap: spacing.sm,
    paddingRight: spacing.xl,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  footer: {
    marginTop: spacing.xxl,
  },
  continueBtnWrapper: {
    width: '100%',
    height: 60,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  continueBtnInner: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    padding: spacing.xl,
    paddingBottom: 40,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderTopWidth: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  modalOption: {
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
  },
});
