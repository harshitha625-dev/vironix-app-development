import React, { useEffect } from 'react';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Dimensions, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withSpring,
  withTiming,
  interpolate,
  Easing,
  SharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Download, Home, Sparkles, User, Video } from 'lucide-react-native';
import { HomeStackNavigator } from './HomeStackNavigator';
import { ProjectsStackNavigator } from './ProjectsStackNavigator';
import { CreateStackNavigator } from './CreateStackNavigator';
import { DownloadsStackNavigator } from './DownloadsStackNavigator';
import { ProfileStackNavigator } from './ProfileStackNavigator';
import { useTheme } from '../theme/ThemeProvider';
import { radius, spacing, typography, palette } from '../theme/tokens';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();
const { width } = Dimensions.get('window');
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Configurable animation parameters
const TAB_BAR_CONFIG = {
  animationType: 'spring' as 'spring' | 'timing',
  duration: 300,
  easing: Easing.bezier(0.25, 0.1, 0.25, 1),
  springConfig: {
    damping: 15,
    stiffness: 120,
    mass: 0.8,
  },
  iconSize: 18,
  btnSize: 44,
  btnIconSize: 20,
};

const ROUTE_ICONS: Record<string, any> = {
  HomeTab: Home,
  ProjectsTab: Video,
  CreateTab: Sparkles,
  DownloadsTab: Download,
  ProfileTab: User,
};

const ROUTE_LABELS: Record<string, string> = {
  HomeTab: 'Home',
  ProjectsTab: 'Projects',
  CreateTab: 'Create',
  DownloadsTab: 'Downloads',
  ProfileTab: 'Profile',
};

interface TabBarBackgroundProps {
  width: number;
  height: number;
  activeIndexValue: SharedValue<number>;
  theme: any;
}

function TabBarBackground({ width, height, activeIndexValue, theme }: TabBarBackgroundProps) {
  // Animated SVG Path properties running on the UI thread
  const animatedProps = useAnimatedProps(() => {
    const tabWidth = width / 5;
    // Notch center X moves dynamically matching activeIndexValue
    const X = tabWidth * activeIndexValue.value + tabWidth / 2;
    const r_dip = 30; // Radius of dip curve
    const d_dip = 18; // Depth of dip curve
    const x1 = X - r_dip - 10;
    const x2 = X + r_dip + 10;

    // Flat-edged path — no corner rounding, straight top edges, dip only in center
    const path = `
      M 0 0
      L ${x1} 0
      C ${X - r_dip} 0, ${X - r_dip + 6} ${d_dip}, ${X} ${d_dip}
      C ${X + r_dip - 6} ${d_dip}, ${X + r_dip} 0, ${x2} 0
      L ${width} 0
      L ${width} ${height}
      L 0 ${height}
      Z
    `;
    return { d: path };
  });

  return (
    <View style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <AnimatedPath
          animatedProps={animatedProps}
          fill={theme.mode === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(18, 19, 27, 0.95)'}
          stroke={theme.border}
          strokeWidth={1.2}
        />
      </Svg>
    </View>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { theme, mode } = useTheme();
  const insets = useSafeAreaInsets();

  const containerWidth = width;
  const tabWidth = containerWidth / 5;
  const bottomPadding = insets.bottom;
  const barHeight = 56 + bottomPadding;

  // Shared value to track horizontal sliding index
  const activeIndexValue = useSharedValue(state.index);

  // Sync state index to shared value
  useEffect(() => {
    if (TAB_BAR_CONFIG.animationType === 'spring') {
      activeIndexValue.value = withSpring(state.index, TAB_BAR_CONFIG.springConfig);
    } else {
      activeIndexValue.value = withTiming(state.index, {
        duration: TAB_BAR_CONFIG.duration,
        easing: TAB_BAR_CONFIG.easing,
      });
    }
  }, [state.index]);

  // Animated sliding style for the center bubble button
  const uasCenterButton = useAnimatedStyle(() => {
    const translateX = tabWidth * activeIndexValue.value;
    return {
      transform: [{ translateX }],
    };
  });

  return (
    <View style={[styles.container, { height: barHeight }]}>
      {/* Background with Morphing Curved Notch */}
      <TabBarBackground width={containerWidth} height={barHeight} activeIndexValue={activeIndexValue} theme={theme} />

      {/* Floating Circular Action Bubble (slides horizontally to active slot) */}
      <Animated.View
        style={[
          styles.centerButton,
          uasCenterButton,
          {
            left: tabWidth / 2 - TAB_BAR_CONFIG.btnSize / 2,
            shadowColor: mode === 'light' ? '#000' : theme.accent,
          },
        ]}
      >
        {state.routes.map((route, i) => {
          const Icon = ROUTE_ICONS[route.name];

          // Cross-fade opacity of the icon inside the bubble based on slide progress
          const uasBubbleIcon = useAnimatedStyle(() => {
            const opacity = interpolate(
              activeIndexValue.value,
              [i - 0.5, i, i + 0.5],
              [0, 1, 0],
              'clamp'
            );
            const scale = interpolate(
              activeIndexValue.value,
              [i - 0.5, i, i + 0.5],
              [0.5, 1, 0.5],
              'clamp'
            );
            return {
              position: 'absolute',
              opacity,
              transform: [{ scale }],
            };
          });

          return (
            <Animated.View key={`bubble-icon-${route.key}`} style={[uasBubbleIcon, styles.bubbleIconWrapper]}>
              {mode === 'light' ? (
                <Icon size={TAB_BAR_CONFIG.btnIconSize} color="#ffffff" />
              ) : (
                <LinearGradient
                  colors={theme.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.gradientWrapper}
                >
                  <Icon size={TAB_BAR_CONFIG.btnIconSize} color={palette.ink950} />
                </LinearGradient>
              )}
            </Animated.View>
          );
        })}
      </Animated.View>

      {/* Interactive Tabs */}
      <View style={styles.buttonsContainer}>
        {state.routes.map((route, index) => {
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const Icon = ROUTE_ICONS[route.name];
          const label = ROUTE_LABELS[route.name];

          // Fade out and scale down regular slot elements as the bubble slides over it
          const uasTabContent = useAnimatedStyle(() => {
            const opacity = interpolate(
              activeIndexValue.value,
              [index - 0.5, index, index + 0.5],
              [1, 0, 1],
              'clamp'
            );
            const scale = interpolate(
              activeIndexValue.value,
              [index - 0.5, index, index + 0.5],
              [1, 0.7, 1],
              'clamp'
            );
            const translateY = interpolate(
              activeIndexValue.value,
              [index - 0.5, index, index + 0.5],
              [0, 12, 0],
              'clamp'
            );
            return {
              opacity,
              transform: [{ scale }, { translateY }],
            };
          });

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={({ pressed }) => [
                styles.tabButton,
                { opacity: pressed ? 0.7 : 1 },
              ]}
            >
              <Animated.View style={[styles.tabContent, uasTabContent]}>
                <Icon size={TAB_BAR_CONFIG.iconSize} color={theme.textMuted} />
                <Text style={[styles.tabLabel, { color: theme.textMuted }]}>
                  {label}
                </Text>
              </Animated.View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStackNavigator}
        options={{ title: 'Home' }}
      />
      <Tab.Screen
        name="ProjectsTab"
        component={ProjectsStackNavigator}
        options={{ title: 'Projects' }}
      />
      <Tab.Screen
        name="CreateTab"
        component={CreateStackNavigator}
        options={{ title: 'Create' }}
      />
      <Tab.Screen
        name="DownloadsTab"
        component={DownloadsStackNavigator}
        options={{ title: 'Downloads' }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileStackNavigator}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    zIndex: 100,
  },
  buttonsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 56,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabButton: {
    flex: 1,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabContent: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 9,
    fontWeight: '600',
  },
  centerButton: {
    position: 'absolute',
    top: -16, // raised slightly above the tab bar top
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0a0b10',
    alignItems: 'center',
    justifyContent: 'center',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.35,
    shadowRadius: 7,
    elevation: 6,
    zIndex: 110,
  },
  bubbleIconWrapper: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gradientWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
