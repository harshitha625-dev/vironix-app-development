import React from 'react';
import { Dimensions, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography } from '../theme/tokens';

const { width } = Dimensions.get('window');
const cardWidth = (width - 40 - spacing.md) / 2 - 2;

interface Props {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  onPress: () => void;
  featured?: boolean;
}

export function BigActionCard({ title, subtitle, icon, onPress, featured }: Props) {
  const { theme } = useTheme();

  if (featured) {
    return (
      <Pressable onPress={onPress} style={styles.wrapper}>
        <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}>
          <View style={styles.iconWrap}>{icon}</View>
          <Text style={[styles.title, { color: '#0b0c10' }]}>{title}</Text>
          <Text style={[styles.subtitle, { color: '#0b0c10cc' }]}>{subtitle}</Text>
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={[styles.wrapper, styles.card, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
    >
      <View style={[styles.iconWrap, { backgroundColor: theme.surfaceAlt }]}>{icon}</View>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.subtitle, { color: theme.textMuted }]}>{subtitle}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrapper: { width: cardWidth },
  card: { borderRadius: radius.lg, padding: spacing.lg, gap: 6, minHeight: 120, justifyContent: 'flex-end' },
  iconWrap: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  title: { ...typography.h2 },
  subtitle: { ...typography.caption },
});
