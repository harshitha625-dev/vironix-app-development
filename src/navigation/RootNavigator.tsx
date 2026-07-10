import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SplashScreen } from '../screens/splash/SplashScreen';
import { OnboardingScreen } from '../screens/onboarding/OnboardingScreen';
import { AuthNavigator } from './AuthNavigator';
import { MainTabNavigator } from './MainTabNavigator';
import { useAuthStore } from '../store/authStore';
import { registerForPushNotifications } from '../services/notificationService';
import { analytics } from '../services/analyticsService';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const status = useAuthStore((s) => s.status);
  const user = useAuthStore((s) => s.user);
  const hasOnboarded = useAuthStore((s) => s.hasOnboarded);
  const init = useAuthStore((s) => s.init);
  const [minSplashElapsed, setMinSplashElapsed] = useState(false);

  useEffect(() => {
    init();
    analytics.logEvent('app_open');
    const t = setTimeout(() => setMinSplashElapsed(true), 1100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (status === 'signedIn' && user) {
      analytics.setUser(user.id);
      registerForPushNotifications(user.id).catch(() => {});
    }
  }, [status, user?.id]);

  const showSplash = status === 'checking' || !minSplashElapsed;

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {showSplash ? (
        <Stack.Screen name="Splash" component={SplashScreen} />
      ) : !hasOnboarded ? (
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
      ) : status === 'signedIn' ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
}
