import React, { useRef, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/authStore';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'OtpVerification'>;

export function OtpVerificationScreen({ route }: Props) {
  const { email } = route.params;
  const { theme } = useTheme();
  const verifyOtp = useAuthStore((s) => s.verifyOtp);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<Array<TextInput | null>>([]);

  const onChangeDigit = (value: string, index: number) => {
    const next = [...digits];
    next[index] = value.replace(/[^0-9]/g, '').slice(-1);
    setDigits(next);
    if (value && index < 5) inputs.current[index + 1]?.focus();
  };

  const onVerify = async () => {
    setError(null);
    setLoading(true);
    const res = await verifyOtp(email, digits.join(''));
    setLoading(false);
    if (res.error) setError(res.error);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[typography.display, { color: theme.textPrimary }]}>Verify your email</Text>
        <Text style={[typography.body, { color: theme.textMuted, marginTop: 6 }]}>Enter the 6-digit code sent to {email}.</Text>
      </View>

      <View style={styles.otpRow}>
        {digits.map((d, i) => (
          <TextInput
            key={i}
            ref={(r) => { inputs.current[i] = r; }}
            style={[styles.otpBox, { backgroundColor: theme.surface, borderColor: theme.border, color: theme.textPrimary }]}
            keyboardType="number-pad"
            maxLength={1}
            value={d}
            onChangeText={(v) => onChangeDigit(v, i)}
          />
        ))}
      </View>

      {error && <Text style={{ color: theme.danger, ...typography.caption }}>{error}</Text>}

      <Button label="Verify" onPress={onVerify} loading={loading} disabled={digits.join('').length !== 6} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xl },
  otpRow: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  otpBox: { width: 44, height: 54, borderRadius: radius.md, borderWidth: 1, textAlign: 'center', fontSize: 20 },
});
