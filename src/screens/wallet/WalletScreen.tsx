import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { LinearGradient } from 'expo-linear-gradient';
import { Gift, Zap } from 'lucide-react-native';
import { useTheme } from '../../theme/ThemeProvider';
import { radius, spacing, typography } from '../../theme/tokens';
import { Screen } from '../../components/Screen';
import { Button } from '../../components/Button';
import { EmptyState } from '../../components/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { useCreditStore } from '../../store/creditStore';
import { startCheckout } from '../../services/paymentService';
import { analytics } from '../../services/analyticsService';
import type { ProfileStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Wallet'>;

const RECHARGE_PACKS = [
  { credits: 100, priceInr: 99 },
  { credits: 300, priceInr: 249 },
  { credits: 1000, priceInr: 699 },
];

export function WalletScreen({ navigation }: Props) {
  const { theme } = useTheme();
  const user = useAuthStore((s) => s.user);
  const transactions = useCreditStore((s) => s.transactions);
  const fetchTransactions = useCreditStore((s) => s.fetchTransactions);
  const recharge = useCreditStore((s) => s.recharge);
  const [promo, setPromo] = useState('');
  const [busyPack, setBusyPack] = useState<number | null>(null);

  useEffect(() => { if (user) fetchTransactions(user.id); }, [user?.id]);

  const onRecharge = async (pack: (typeof RECHARGE_PACKS)[number]) => {
    if (!user) return;
    setBusyPack(pack.priceInr);
    const result = await startCheckout({ provider: 'razorpay', amountInr: pack.priceInr, description: `${pack.credits} credits` });
    if (result.success) {
      await recharge(user.id, pack.credits, `Recharge — ₹${pack.priceInr}`);
      analytics.logEvent('credits_recharged', { credits: pack.credits });
    }
    setBusyPack(null);
  };

  const onApplyPromo = async () => {
    if (!user || !promo.trim()) return;
    await recharge(user.id, 20, `Promo code: ${promo.trim().toUpperCase()}`);
    setPromo('');
  };

  return (
    <Screen scroll={false}>
      <Text style={[typography.display, { color: theme.textPrimary }]}>Wallet</Text>

      <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.balanceCard}>
        <Zap size={20} color="#0b0c10" />
        <Text style={styles.balanceValue}>{user?.credits ?? 0}</Text>
        <Text style={styles.balanceLabel}>credits available</Text>
      </LinearGradient>

      <Text style={[typography.h2, { color: theme.textPrimary }]}>Recharge</Text>
      <View style={styles.packRow}>
        {RECHARGE_PACKS.map((pack) => (
          <View key={pack.priceInr} style={[styles.pack, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <Text style={[typography.h2, { color: theme.textPrimary }]}>{pack.credits}</Text>
            <Text style={[typography.caption, { color: theme.textMuted, marginBottom: spacing.sm }]}>credits</Text>
            <Button label={`₹${pack.priceInr}`} fullWidth loading={busyPack === pack.priceInr} onPress={() => onRecharge(pack)} />
          </View>
        ))}
      </View>

      <View style={[styles.promoRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        <Gift size={16} color={theme.textMuted} />
        <TextInput
          style={[styles.promoInput, { color: theme.textPrimary }]}
          placeholder="Promo code"
          placeholderTextColor={theme.textMuted}
          autoCapitalize="characters"
          value={promo}
          onChangeText={setPromo}
        />
        <Button label="Apply" fullWidth={false} onPress={onApplyPromo} disabled={!promo.trim()} />
      </View>

      <Text style={[typography.h2, { color: theme.textPrimary }]}>Transaction history</Text>
      <FlatList
        data={transactions}
        keyExtractor={(t) => t.id}
        contentContainerStyle={{ gap: spacing.xs, paddingBottom: spacing.xxxl }}
        ListEmptyComponent={<EmptyState icon={<Zap size={28} color={theme.textMuted} />} title="No transactions yet" body="Recharges and spends will show up here." />}
        renderItem={({ item }) => (
          <View style={[styles.txRow, { borderColor: theme.border }]}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.bodyMedium, { color: theme.textPrimary }]}>{item.description}</Text>
              <Text style={[typography.caption, { color: theme.textMuted }]}>{new Date(item.createdAt).toLocaleString()}</Text>
            </View>
            <Text style={[typography.bodyMedium, { color: item.amount >= 0 ? theme.success : theme.danger }]}>
              {item.amount >= 0 ? '+' : ''}{item.amount}
            </Text>
          </View>
        )}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  balanceCard: { borderRadius: radius.xl, padding: spacing.xl, alignItems: 'center', gap: 4 },
  balanceValue: { fontSize: 36, fontWeight: '800', color: '#0b0c10' },
  balanceLabel: { fontSize: 12, color: '#0b0c10cc' },
  packRow: { flexDirection: 'row', gap: spacing.sm },
  pack: { flex: 1, borderRadius: radius.lg, borderWidth: 1, padding: spacing.md, alignItems: 'center' },
  promoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderRadius: radius.lg, paddingHorizontal: spacing.md },
  promoInput: { flex: 1, paddingVertical: 12, fontSize: 14 },
  txRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1 },
});
