import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProfileScreen } from '../screens/profile/ProfileScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { WalletScreen } from '../screens/wallet/WalletScreen';
import { PricingScreen } from '../screens/pricing/PricingScreen';
import { NotificationsScreen } from '../screens/notifications/NotificationsScreen';
import { useTheme } from '../theme/ThemeProvider';
import type { ProfileStackParamList } from './types';

const Stack = createNativeStackNavigator<ProfileStackParamList>();

export function ProfileStackNavigator() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: theme.textPrimary, headerStyle: { backgroundColor: theme.bg }, contentStyle: { backgroundColor: theme.bg } }}>
      <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Settings" component={SettingsScreen} options={{ title: '' }} />
      <Stack.Screen name="Wallet" component={WalletScreen} options={{ title: '' }} />
      <Stack.Screen name="Pricing" component={PricingScreen} options={{ title: '' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}
