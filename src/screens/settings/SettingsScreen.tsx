import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { ChevronRight, Globe, Lock, Moon, ShieldCheck, Sun, Trash2 } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/authStore';

function ToggleSwitch({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  const { theme } = useTheme();
  return (
    <Pressable
      onPress={onToggle}
      style={[styles.switchTrack, { backgroundColor: on ? theme.accent : theme.surfaceAlt }]}
    >
      <View style={[styles.switchThumb, { alignSelf: on ? 'flex-end' : 'flex-start', backgroundColor: '#fff' }]} />
    </Pressable>
  );
}

export function SettingsScreen() {
  const { theme, mode, setMode } = useTheme();
  const signOut = useAuthStore((s) => s.signOut);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Delete account',
      'This permanently deletes your account, projects, and credits. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  return (
    <Screen>
      <Text style={[typography.display, { color: theme.textPrimary }]}>Settings</Text>

      <Text style={[typography.caption, { color: theme.textMuted }]}>Appearance</Text>
      <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {mode === 'light' ? <Sun size={18} color={theme.textPrimary} /> : <Moon size={18} color={theme.textPrimary} />}
        <Text style={[typography.bodyMedium, { color: theme.textPrimary, flex: 1 }]}>Dark mode</Text>
        <ToggleSwitch on={mode !== 'light'} onToggle={() => setMode(mode === 'light' ? 'dark' : 'light')} />
      </View>

      <Text style={[typography.caption, { color: theme.textMuted }]}>Preferences</Text>
      <Pressable style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Globe size={18} color={theme.textPrimary} />
        <Text style={[typography.bodyMedium, { color: theme.textPrimary, flex: 1 }]}>Language</Text>
        <Text style={{ color: theme.textMuted }}>English</Text>
        <ChevronRight size={16} color={theme.textMuted} />
      </Pressable>
      <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[typography.bodyMedium, { color: theme.textPrimary, flex: 1 }]}>Push notifications</Text>
        <ToggleSwitch on={pushEnabled} onToggle={() => setPushEnabled((v) => !v)} />
      </View>
      <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[typography.bodyMedium, { color: theme.textPrimary, flex: 1 }]}>Share usage analytics</Text>
        <ToggleSwitch on={analyticsEnabled} onToggle={() => setAnalyticsEnabled((v) => !v)} />
      </View>

      <Text style={[typography.caption, { color: theme.textMuted }]}>Account & security</Text>
      <Pressable style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Lock size={18} color={theme.textPrimary} />
        <Text style={[typography.bodyMedium, { color: theme.textPrimary, flex: 1 }]}>Change password</Text>
        <ChevronRight size={16} color={theme.textMuted} />
      </Pressable>
      <Pressable style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <ShieldCheck size={18} color={theme.textPrimary} />
        <Text style={[typography.bodyMedium, { color: theme.textPrimary, flex: 1 }]}>Privacy & security</Text>
        <ChevronRight size={16} color={theme.textMuted} />
      </Pressable>
      <Pressable style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Text style={[typography.bodyMedium, { color: theme.textPrimary, flex: 1 }]}>About VEYTRIX</Text>
        <ChevronRight size={16} color={theme.textMuted} />
      </Pressable>

      <Pressable onPress={confirmDeleteAccount} style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.danger + '55' }]}>
        <Trash2 size={18} color={theme.danger} />
        <Text style={[typography.bodyMedium, { color: theme.danger, flex: 1 }]}>Delete account</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md },
  switchTrack: { width: 42, height: 24, borderRadius: 12, padding: 2, justifyContent: 'center' },
  switchThumb: { width: 20, height: 20, borderRadius: 10 },
});
