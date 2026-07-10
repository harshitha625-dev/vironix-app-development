import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ProjectsScreen } from '../screens/projects/ProjectsScreen';
import { ProjectDetailScreen } from '../screens/projects/ProjectDetailScreen';
import { useTheme } from '../theme/ThemeProvider';
import type { ProjectsStackParamList } from './types';

const Stack = createNativeStackNavigator<ProjectsStackParamList>();

export function ProjectsStackNavigator() {
  const { theme } = useTheme();
  return (
    <Stack.Navigator screenOptions={{ headerTintColor: theme.textPrimary, headerStyle: { backgroundColor: theme.bg }, contentStyle: { backgroundColor: theme.bg } }}>
      <Stack.Screen name="ProjectsMain" component={ProjectsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project' }} />
    </Stack.Navigator>
  );
}
