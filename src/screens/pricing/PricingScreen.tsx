import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { PLANS } from '../../constants';
import { useAuthStore } from '../../store/authStore';
import { startCheckout } from '../../services/paymentService';
import { analytics } from '../../services/analyticsService';
import type { PlanTier } from '../../types';

export function PricingScreen() {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const [busy, setBusy] = useState<PlanTier | null>(null);

  const onUpgrade = async (planId: PlanTier, priceInr: number) => {
    if (planId === 'free') return;
    setBusy(planId);
    const result = await startCheckout({ provider: 'razorpay', amountInr: priceInr, description: `${planId} plan` });
    if (result.success) {
      useAuthStore.setState((s) => (s.user ? { user: { ...s.user, plan: planId } } : s));
      analytics.logEvent('plan_upgraded', { plan: planId });
    }
    setBusy(null);
  };

  return (
    <Screen>
      <Text style={[typography.display, { color: theme.textPrimary }]}>Pricing</Text>
      <Text style={[typography.body, { color: theme.textMuted, marginTop: -spacing.sm }]}>Upgrade for more credits and faster generation.</Text>

      {PLANS.filter((p) => p.id !== 'free').map((plan) => {
        const isCurrent = user?.plan === plan.id;
        return (
          <View key={plan.id} style={[styles.card, { backgroundColor: theme.surface, borderColor: isCurrent ? theme.accentAlt : theme.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[typography.h1, { color: theme.textPrimary }]}>{plan.name}</Text>
              <Text style={[typography.h2, { color: theme.accentAlt }]}>₹{plan.priceInr}</Text>
            </View>
            <Text style={[typography.caption, { color: theme.textMuted }]}>{plan.creditsPerMonth} credits / month</Text>
            <View style={{ gap: 6, marginTop: spacing.sm }}>
              {plan.perks.map((perk) => (
                <View key={perk} style={styles.perkRow}>
                  <Check size={14} color={theme.success} />
                  <Text style={[typography.body, { color: theme.textSecondary }]}>{perk}</Text>
                </View>
              ))}
            </View>
            <View style={{ marginTop: spacing.md }}>
              <Button
                label={isCurrent ? 'Current plan' : 'Upgrade'}
                variant={isCurrent ? 'secondary' : 'primary'}
                disabled={isCurrent}
                loading={busy === plan.id}
                onPress={() => onUpgrade(plan.id, plan.priceInr)}
              />
            </View>
          </View>
        );
      })}
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: radius.xl, borderWidth: 1, padding: spacing.lg, gap: 4 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
});
