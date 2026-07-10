import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Bell, ChevronRight, CreditCard, LogOut, Settings as SettingsIcon, Sparkles, Wallet } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { useAuthStore } from '../../store/authStore';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'ProfileMain'>;

export function ProfileScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const items: Array<{ label: string; icon: React.ReactNode; onPress: () => void }> = [
    { label: 'Wallet & credits', icon: <Wallet size={18} color={theme.textPrimary} />, onPress: () => navigation.navigate('Wallet') },
    { label: 'Pricing plans', icon: <CreditCard size={18} color={theme.textPrimary} />, onPress: () => navigation.navigate('Pricing') },
    { label: 'Notifications', icon: <Bell size={18} color={theme.textPrimary} />, onPress: () => navigation.navigate('Notifications') },
    { label: 'Settings', icon: <SettingsIcon size={18} color={theme.textPrimary} />, onPress: () => navigation.navigate('Settings') },
  ];

  return (
    <Screen>
      <Text style={[typography.display, { color: theme.textPrimary }]}>Profile</Text>

      <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={[styles.avatar, { backgroundColor: theme.surfaceAlt }]}>
          <Text style={{ color: theme.textPrimary, fontSize: 22, fontWeight: '700' }}>
            {(user?.displayName ?? user?.email ?? '?').charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[typography.h2, { color: theme.textPrimary }]}>{user?.displayName ?? 'Creator'}</Text>
          <Text style={[typography.caption, { color: theme.textMuted }]}>{user?.email}</Text>
        </View>
      </View>

      <View style={[styles.planRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <View style={styles.planCell}>
          <Sparkles size={16} color={theme.accentAlt} />
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: 4 }]}>Plan</Text>
          <Text style={[typography.bodyMedium, { color: theme.textPrimary, textTransform: 'capitalize' }]}>{user?.plan}</Text>
        </View>
        <View style={[styles.divider, { backgroundColor: theme.border }]} />
        <View style={styles.planCell}>
          <CreditCard size={16} color={theme.credit} />
          <Text style={[typography.caption, { color: theme.textMuted, marginTop: 4 }]}>Credits</Text>
          <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>{user?.credits}</Text>
        </View>
      </View>

      <View style={{ gap: spacing.sm }}>
        {items.map((item) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            style={[styles.menuRow, { backgroundColor: theme.surface, borderColor: theme.border }]}
          >
            {item.icon}
            <Text style={[typography.bodyMedium, { color: theme.textPrimary, flex: 1 }]}>{item.label}</Text>
            <ChevronRight size={16} color={theme.textMuted} />
          </Pressable>
        ))}
      </View>

      <Pressable onPress={signOut} style={[styles.menuRow, { backgroundColor: theme.surface, borderColor: theme.danger + '55' }]}>
        <LogOut size={18} color={theme.danger} />
        <Text style={[typography.bodyMedium, { color: theme.danger, flex: 1 }]}>Log out</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  avatar: { width: 56, height: 56, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' },
  planRow: { flexDirection: 'row', borderWidth: 1, borderRadius: radius.lg, padding: spacing.lg },
  planCell: { flex: 1, alignItems: 'center' },
  divider: { width: 1 },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md },
});
