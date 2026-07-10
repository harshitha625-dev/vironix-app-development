import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { ThemeProvider, useTheme } from './src/theme/ThemeProvider';
import { RootNavigator } from './src/navigation/RootNavigator';

function Root() {
  const { theme, mode } = useTheme();
  const navTheme = {
    ...(mode === 'light' ? DefaultTheme : DarkTheme),
    colors: {
      ...(mode === 'light' ? DefaultTheme.colors : DarkTheme.colors),
      background: theme.bg,
      card: theme.bgElevated,
      text: theme.textPrimary,
      border: theme.border,
      primary: theme.accentAlt,
    },
  };
  return (
    <NavigationContainer theme={navTheme}>
      <StatusBar style={mode === 'light' ? 'dark' : 'light'} />
      <RootNavigator />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <Root />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
