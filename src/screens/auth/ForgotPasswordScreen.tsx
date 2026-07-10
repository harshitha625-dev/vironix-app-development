import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Mail } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/authStore';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const sendPasswordReset = useAuthStore((s) => s.sendPasswordReset);
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSend = async () => {
    setLoading(true);
    await sendPasswordReset(email.trim());
    setLoading(false);
    setSent(true);
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[typography.display, { color: theme.textPrimary }]}>Reset your password</Text>
        <Text style={[typography.body, { color: theme.textMuted, marginTop: 6 }]}>
          Enter the email on your account and we'll send a reset link.
        </Text>
      </View>

      {sent ? (
        <View style={[styles.notice, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Text style={{ color: theme.textPrimary }}>Check your inbox — if that email is registered, a reset link is on its way.</Text>
        </View>
      ) : (
        <View style={styles.form}>
          <View style={[styles.inputWrap, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Mail size={16} color={theme.textMuted} />
            <TextInput
              style={[styles.input, { color: theme.textPrimary }]}
              placeholder="Email"
              placeholderTextColor={theme.textMuted}
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>
          <Button label="Send reset link" onPress={onSend} loading={loading} disabled={!email} />
        </View>
      )}

      <Button label="Back to login" variant="ghost" onPress={() => navigation.navigate('Login')} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: { marginTop: spacing.xl },
  form: { gap: spacing.md },
  inputWrap: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: spacing.md },
  input: { flex: 1, paddingVertical: 14, fontSize: 14 },
  notice: { padding: spacing.lg, borderRadius: radius.lg, borderWidth: 1 },
});
