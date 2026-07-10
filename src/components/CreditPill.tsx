import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Zap } from 'lucide-react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography } from '../theme/tokens';

export function CreditPill({ credits, onPress }: { credits: number; onPress?: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pill, { backgroundColor: theme.surface, borderColor: theme.border }]}
    >
      <Zap size={14} color={theme.credit} fill={theme.credit} />
      <Text style={[styles.text, { color: theme.textPrimary }]}>{credits}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 7,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  text: { ...typography.bodyMedium },
});
