import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography } from '../theme/tokens';

interface Props {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export function Button({ label, onPress, variant = 'primary', disabled, loading, icon, fullWidth = true }: Props) {
  const { theme } = useTheme();
  const isDisabled = disabled || loading;

  const content = (
    <View style={styles.inner}>
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? '#0b0c10' : theme.textPrimary} />
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.label,
              { color: variant === 'primary' ? '#0b0c10' : variant === 'danger' ? theme.danger : theme.textPrimary },
            ]}
          >
            {label}
          </Text>
        </>
      )}
    </View>
  );

  if (variant === 'primary') {
    return (
      <Pressable onPress={onPress} disabled={isDisabled} style={[fullWidth && styles.full, isDisabled && styles.disabled]}>
        <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.base}>
          {content}
        </LinearGradient>
      </Pressable>
    );
  }

  const borderColor = variant === 'danger' ? theme.danger : theme.border;
  const bg = variant === 'ghost' ? 'transparent' : theme.surface;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.base,
        { backgroundColor: bg, borderWidth: 1, borderColor },
        fullWidth && styles.full,
        isDisabled && styles.disabled,
      ]}
    >
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.lg, paddingVertical: 14, paddingHorizontal: spacing.xl, alignItems: 'center', justifyContent: 'center' },
  full: { width: '100%' },
  inner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  label: { ...typography.bodyMedium },
  disabled: { opacity: 0.5 },
});
