import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, G, Circle } from 'react-native-svg';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { palette, radius, spacing, typography } from '../../theme/tokens';
import { Button } from '../../components/Button';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/authStore';
import { analytics } from '../../services/analyticsService';
import type { AuthStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

// ─── Google "G" logo ─────────────────────────────────────────────────────────
function GoogleLogo({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.4 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z" />
      <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.2 6.4 29.4 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z" />
      <Path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.4 35.5 26.8 36 24 36c-5.3 0-9.7-3.2-11.3-7.9l-6.6 5.1C9.4 39.4 16.2 44 24 44z" />
      <Path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.3 4.1-4.2 5.4l6.2 5.2c-.4.4 6.7-4.9 6.7-14.6 0-1.3-.1-2.6-.4-3.9z" />
    </Svg>
  );
}

// ─── GitHub logo ─────────────────────────────────────────────────────────────
function GitHubLogo({ size = 18, color = '#fff' }: { size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <Path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </Svg>
  );
}

// ─── Glowing gradient-border card ────────────────────────────────────────────
function GlowCard({ children, bg }: { children: React.ReactNode; bg: string }) {
  return (
    <View style={glow.root}>
      <View style={[glow.blob, glow.blobTopLeft]} />
      <View style={[glow.blob, glow.blobBottomRight]} />
      <LinearGradient
        colors={[palette.violet500, palette.cyan400, palette.violet500]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={glow.gradientBorder}
      >
        <View style={[glow.inner, { backgroundColor: bg }]}>
          {children}
        </View>
      </LinearGradient>
    </View>
  );
}

const glow = StyleSheet.create({
  root: { position: 'relative' },
  blob: { position: 'absolute', borderRadius: 999 },
  blobTopLeft: {
    width: 140, height: 140, top: -30, left: -30,
    backgroundColor: palette.violet500, opacity: 0.28,
    shadowColor: palette.violet500,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 40, elevation: 0,
  },
  blobBottomRight: {
    width: 120, height: 120, bottom: -24, right: -24,
    backgroundColor: palette.cyan400, opacity: 0.22,
    shadowColor: palette.cyan400,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9, shadowRadius: 36, elevation: 0,
  },
  gradientBorder: {
    borderRadius: 26, padding: 1.5,
    shadowColor: palette.violet500,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.45, shadowRadius: 24, elevation: 12,
  },
  inner: { borderRadius: 25, padding: 20, overflow: 'hidden' },
});
// ─────────────────────────────────────────────────────────────────────────────

export function LoginScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const signInWithEmail = useAuthStore((s) => s.signInWithEmail);
  const signInWithOAuth = useAuthStore((s) => s.signInWithOAuth);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onLogin = async () => {
    setError(null);
    setLoading(true);
    const res = await signInWithEmail(email.trim(), password);
    setLoading(false);
    if (res.error) setError(res.error);
    else analytics.logEvent('sign_in');
  };

  const inputBg     = 'rgba(255,255,255,0.07)';
  const inputBorder = 'rgba(255,255,255,0.14)';
  const glassBorder = 'rgba(255,255,255,0.10)';
  const cardBg      = theme.surface;

  return (
    <Screen scroll={false} style={styles.screenContent}>
      <View style={styles.center}>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[typography.display, { color: theme.textPrimary, textAlign: 'center' }]}>
            Welcome back
          </Text>
          <Text style={[typography.body, { color: theme.textMuted, marginTop: 6, textAlign: 'center' }]}>
            Sign in to keep creating with VEYTRIX.
          </Text>
        </View>

        {/* Glowing card — contains form + footer */}
        <GlowCard bg={cardBg}>
          <View style={styles.form}>

            {/* Email */}
            <View style={[styles.inputWrap, { backgroundColor: inputBg, borderColor: inputBorder }]}>
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

            {/* Password */}
            <View style={[styles.inputWrap, { backgroundColor: inputBg, borderColor: inputBorder }]}>
              <Lock size={16} color={theme.textMuted} />
              <TextInput
                style={[styles.input, { color: theme.textPrimary }]}
                placeholder="Password"
                placeholderTextColor={theme.textMuted}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
              />
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={8}>
                {showPassword
                  ? <EyeOff size={18} color={theme.textMuted} />
                  : <Eye size={18} color={theme.textMuted} />}
              </Pressable>
            </View>

            {error && (
              <Text style={{ color: theme.danger, ...typography.caption }}>{error}</Text>
            )}

            <Pressable onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={[typography.caption, { color: theme.accentAlt, alignSelf: 'flex-end' }]}>
                Forgot password?
              </Text>
            </Pressable>

            <Button label="Log In" onPress={onLogin} loading={loading} disabled={!email || !password} />

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.divider, { backgroundColor: glassBorder }]} />
              <Text style={[typography.caption, { color: theme.textMuted }]}>or continue with</Text>
              <View style={[styles.divider, { backgroundColor: glassBorder }]} />
            </View>

            {/* OAuth buttons with logos */}
            <View style={styles.oauthRow}>
              <Pressable
                style={({ pressed }) => [
                  styles.oauthBtn,
                  { backgroundColor: inputBg, borderColor: inputBorder, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => signInWithOAuth('google')}
              >
                <GoogleLogo size={18} />
                <Text style={[styles.oauthLabel, { color: theme.textPrimary }]}>Google</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.oauthBtn,
                  { backgroundColor: inputBg, borderColor: inputBorder, opacity: pressed ? 0.7 : 1 },
                ]}
                onPress={() => signInWithOAuth('github')}
              >
                <GitHubLogo size={18} color={theme.textPrimary} />
                <Text style={[styles.oauthLabel, { color: theme.textPrimary }]}>GitHub</Text>
              </Pressable>
            </View>

            {/* ── "New to VEYTRIX?" moved inside the card ── */}
            <View style={[styles.innerDivider, { backgroundColor: glassBorder }]} />
            <Pressable onPress={() => navigation.navigate('Signup')} style={styles.signupRow}>
              <Text style={[typography.caption, { color: theme.textMuted }]}>
                New to VEYTRIX?{'  '}
                <Text style={{ color: theme.accentAlt, fontWeight: '600' }}>Create an account</Text>
              </Text>
            </Pressable>

          </View>
        </GlowCard>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screenContent: {
    justifyContent: 'center',
    paddingBottom: 40,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.xl,
  },
  header: { alignItems: 'center' },

  form: { gap: spacing.md },

  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
  },
  input: { flex: 1, paddingVertical: 14, fontSize: 14 },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  divider: { flex: 1, height: 1 },

  // OAuth
  oauthRow: { flexDirection: 'row', gap: spacing.md },
  oauthBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: radius.lg,
    paddingVertical: 12,
  },
  oauthLabel: { fontSize: 13, fontWeight: '600' },

  // Signup footer inside card
  innerDivider: { height: 1, marginVertical: 2 },
  signupRow: { alignItems: 'center', paddingVertical: 4 },
});
