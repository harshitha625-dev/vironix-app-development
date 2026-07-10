import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography } from '../theme/tokens';

interface Props<T extends string> {
  label: string;
  options: readonly T[];
  value: T;
  onChange: (v: T) => void;
}

export function ChipSelector<T extends string>({ label, options, value, onChange }: Props<T>) {
  const { theme } = useTheme();
  return (
    <View style={{ gap: spacing.sm }}>
      <Text style={[typography.caption, { color: theme.textMuted }]}>{label}</Text>
      <View style={styles.row}>
        {options.map((opt) => {
          const active = opt === value;
          return (
            <Pressable
              key={opt}
              onPress={() => onChange(opt)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? theme.accent : theme.surface,
                  borderColor: active ? theme.accent : theme.border,
                },
              ]}
            >
              <Text style={[typography.bodyMedium, { color: active ? '#fff' : theme.textPrimary }]}>{opt}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1 },
});
