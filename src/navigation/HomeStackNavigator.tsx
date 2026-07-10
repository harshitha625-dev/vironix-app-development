import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { HomeScreen } from '../screens/home/HomeScreen';
import { ProjectDetailScreen } from '../screens/projects/ProjectDetailScreen';
import { useTheme } from '../theme/ThemeProvider';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export function HomeStackNavigator() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: theme.textPrimary, headerStyle: { backgroundColor: theme.bg }, contentStyle: { backgroundColor: theme.bg } }}>
      <Stack.Screen name="HomeMain" component={HomeScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project' }} />
    </Stack.Navigator>
  );
}
