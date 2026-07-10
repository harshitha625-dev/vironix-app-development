import React, { useEffect } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { AlertCircle, Bell, CreditCard, Megaphone, ShieldCheck, Wrench } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { EmptyState } from '../../components/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { useUiStore } from '../../store/uiStore';
import type { NotificationCategory } from '../../types';

const CATEGORY_ICON: Record<NotificationCategory, typeof Bell> = {
  generation: Bell,
  credits: CreditCard,
  updates: Megaphone,
  security: ShieldCheck,
  maintenance: Wrench,
};

export function NotificationsScreen() {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const notifications = useUiStore((s) => s.notifications);
  const fetchNotifications = useUiStore((s) => s.fetchNotifications);
  const markAllRead = useUiStore((s) => s.markAllRead);

  useEffect(() => { if (user) fetchNotifications(user.id); }, [user?.id]);
  useEffect(() => { if (user) markAllRead(user.id); }, []);

  return (
    <Screen scroll={false}>
      <Text style={[typography.display, { color: theme.textPrimary }]}>Notifications</Text>
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        contentContainerStyle={{ gap: spacing.sm, paddingTop: spacing.md, paddingBottom: spacing.xxxl }}
        ListEmptyComponent={
          <EmptyState icon={<AlertCircle size={28} color={theme.textMuted} />} title="You're all caught up" body="Generation updates, credit alerts, and announcements will appear here." />
        }
        renderItem={({ item }) => {
          const Icon = CATEGORY_ICON[item.category];
          return (
            <View style={[styles.row, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={[styles.iconWrap, { backgroundColor: theme.surfaceAlt }]}>
                <Icon size={16} color={theme.accentAlt} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>{item.title}</Text>
                <Text style={[typography.caption, { color: theme.textMuted }]}>{item.body}</Text>
                <Text style={[typography.tiny, { color: theme.textMuted, marginTop: 4 }]}>{new Date(item.createdAt).toLocaleString()}</Text>
              </View>
            </View>
          );
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm, borderWidth: 1, borderRadius: radius.lg, padding: spacing.md },
  iconWrap: { width: 34, height: 34, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center' },
});
