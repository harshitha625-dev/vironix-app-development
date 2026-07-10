import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DownloadsScreen } from '../screens/downloads/DownloadsScreen';
import { useTheme } from '../theme/ThemeProvider';
import type { DownloadsStackParamList } from './types';

const Stack = createNativeStackNavigator<DownloadsStackParamList>();

export function DownloadsStackNavigator() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: theme.bg } }}>
      <Stack.Screen name="DownloadsMain" component={DownloadsScreen} />
    </Stack.Navigator>
  );
}
