import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, StyleSheet, Text, View } from 'react-native';
import { Film, ImageIcon, Sparkles, Wand2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { spacing, typography, radius } from '../../theme/tokens';
import { ONBOARDING_SLIDES } from '../../constants';
import { Button } from '../../components/Button';
import { useAuthStore } from '../../store/authStore';

const { width } = Dimensions.get('window');
const ICONS = { text_to_video: Sparkles, image_to_video: ImageIcon, reference_video: Film, manual_edit: Wand2 };

export function OnboardingScreen() {
  const { theme } = useTheme();
  const setOnboarded = useAuthStore((s) => s.setOnboarded);
  const [index, setIndex] = useState(0);
  const listRef = useRef<FlatList>(null);

  const next = () => {
    if (index < ONBOARDING_SLIDES.length - 1) {
      listRef.current?.scrollToIndex({ index: index + 1 });
    } else {
      setOnboarded(true);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <FlatList
        ref={listRef}
        data={ONBOARDING_SLIDES}
        keyExtractor={(s) => s.key}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        renderItem={({ item }) => {
          const Icon = ICONS[item.key as keyof typeof ICONS];
          return (
            <View style={[styles.slide, { width }]}>
              <View style={[styles.iconWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Icon size={40} color={theme.accentAlt} />
              </View>
              <Text style={[typography.display, { color: theme.textPrimary, textAlign: 'center' }]}>{item.title}</Text>
              <Text style={[typography.body, { color: theme.textMuted, textAlign: 'center', marginTop: spacing.sm }]}>
                {item.body}
              </Text>
            </View>
          );
        }}
      />
      <View style={styles.dots}>
        {ONBOARDING_SLIDES.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              { backgroundColor: i === index ? theme.accentAlt : theme.surfaceAlt, width: i === index ? 20 : 6 },
            ]}
          />
        ))}
      </View>
      <View style={styles.footer}>
        <Button label={index === ONBOARDING_SLIDES.length - 1 ? 'Start Creating' : 'Next'} onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: { alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  iconWrap: { width: 84, height: 84, borderRadius: radius.xl, alignItems: 'center', justifyContent: 'center', borderWidth: 1, marginBottom: spacing.xl },
  dots: { flexDirection: 'row', gap: 6, alignSelf: 'center', marginBottom: spacing.xl },
  dot: { height: 6, borderRadius: 3 },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xl },
});
