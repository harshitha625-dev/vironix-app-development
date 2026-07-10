import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { spacing, typography } from '../theme/tokens';

export function EmptyState({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.wrap}>
      {icon}
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
      <Text style={[styles.body, { color: theme.textMuted }]}>{body}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.xxxl, gap: spacing.sm, paddingHorizontal: spacing.xl },
  title: { ...typography.h2 },
  body: { ...typography.body, textAlign: 'center' as const },
});
