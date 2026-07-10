import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';
import { typography } from '../../theme/tokens';

export function SplashScreen() {
  const { theme } = useTheme();
  const scale = useRef(new Animated.Value(0.7)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, friction: 5, tension: 40, useNativeDriver: true }),
    ]).start();
    Animated.loop(
      Animated.timing(spin, { toValue: 1, duration: 1400, easing: Easing.linear, useNativeDriver: true })
    ).start();
  }, []);

  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={[styles.container, { backgroundColor: theme.bg }]}>
      <Animated.View style={{ opacity, transform: [{ scale }] }}>
        <LinearGradient colors={theme.gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.logo}>
          <Text style={styles.logoText}>V</Text>
        </LinearGradient>
      </Animated.View>
      <Animated.Text style={[typography.display, { color: theme.textPrimary, opacity, marginTop: 20 }]}>
        VEYTRIX
      </Animated.Text>
      <Text style={[typography.caption, { color: theme.textMuted, marginTop: 6 }]}>AI video, on the go</Text>
      <Animated.View style={[styles.spinner, { borderColor: theme.surfaceAlt, borderTopColor: theme.accentAlt, transform: [{ rotate }] }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 88, height: 88, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
  logoText: { fontSize: 40, fontWeight: '800', color: '#0b0c10' },
  spinner: { width: 28, height: 28, borderRadius: 14, borderWidth: 3, marginTop: 40 },
});
