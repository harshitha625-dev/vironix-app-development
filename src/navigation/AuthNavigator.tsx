import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { LoginScreen } from '../screens/auth/LoginScreen';
import { SignupScreen } from '../screens/auth/SignupScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { OtpVerificationScreen } from '../screens/auth/OtpVerificationScreen';
import { useTheme } from '../theme/ThemeProvider';
import type { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthNavigator() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        headerTitle: '',
        headerTintColor: theme.textPrimary,
        contentStyle: { backgroundColor: theme.bg },
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Signup" component={SignupScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ title: '' }} />
      <Stack.Screen name="OtpVerification" component={OtpVerificationScreen} options={{ title: '' }} />
    </Stack.Navigator>
  );
}
