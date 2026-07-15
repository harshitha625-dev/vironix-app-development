import React, { useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, Text, Pressable } from 'react-native';
import { Volume2, VolumeX } from 'lucide-react-native';
import { Gesture, GestureDetector, GestureHandlerRootView, ScrollView as RNGHScrollView } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  SharedValue,
  useAnimatedStyle,
  useAnimatedScrollHandler,
  runOnJS,
} from 'react-native-reanimated';
import { useTheme } from '../../../../theme/ThemeProvider';
import { useEditorState } from '../../hooks/useEditorState';
import { useShallow } from 'zustand/react/shallow';
import { safePausePlayer } from '../../utils/safeVideoPlayer';
import { TrackLayer } from './TrackLayer';
import { Playhead } from './Playhead';
import { useEditorPlayer } from '../../context/EditorPlayerContext';

const AnimatedRNGHScrollView = Animated.createAnimatedComponent(RNGHScrollView);

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/** Extra padding so the start and end of the timeline can center under the playhead */
const TIMELINE_PADDING = SCREEN_WIDTH / 2;

/** Height of the time-ruler strip at the top of the scrollable area */
const RULER_HEIGHT = 20;

// ─── Time Ruler ──────────────────────────────────────────────────────────────

function TimeRuler({ duration, scale }: { duration: number; scale: SharedValue<number> }) {
  const { theme } = useTheme();

  // We build tick marks every second (or every 5s when zoomed out)
  const totalSeconds = Math.ceil(duration);
  const ticks = Array.from({ length: totalSeconds + 1 }, (_, i) => i);

  const animStyle = useAnimatedStyle(() => ({
    width: duration * scale.value + TIMELINE_PADDING * 2,
  }));

  const formatLabel = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <Animated.View style={[styles.ruler, animStyle]}>
      {ticks.map((s) => {
        // Show label every 5 seconds, tick every second
        const showLabel = s % 5 === 0;
        return (
          <Animated.View
            key={s}
            style={[
              styles.rulerTick,
              {
                left: TIMELINE_PADDING + s * (scale as any).value,
                height: showLabel ? 10 : 5,
                backgroundColor: showLabel ? theme.textMuted : theme.border,
              },
            ]}
          >
            {showLabel && (
              <Text style={[styles.rulerLabel, { color: theme.textMuted }]}>
                {formatLabel(s)}
              </Text>
            )}
          </Animated.View>
        );
      })}
    </Animated.View>
  );
}

// ─── Video Mute Track ────────────────────────────────────────────────────────

function VideoMuteTrack({ duration, scale, padding }: { duration: number; scale: SharedValue<number>; padding: number }) {
  const { player } = useEditorPlayer();
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    if (player) setIsMuted(player.muted);
  }, [player]);

  const toggleMute = () => {
    if (player) {
      player.muted = !player.muted;
      setIsMuted(player.muted);
    }
  };

  const animStyle = useAnimatedStyle(() => ({
    width: duration * scale.value,
  }));

  return (
    <View style={{ height: 28, marginBottom: 2, width: '100%', position: 'relative' }}>
      {/* Polished badge icon attached to the left of the track (scrolls with timeline) */}
      <View style={{
        position: 'absolute',
        left: padding - 32, // 32px to the left of playhead
        top: 2, // Vertically centered in 28px height
        height: 24,
        width: 24,
        borderRadius: 6,
        backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.2)' : 'rgba(74, 222, 128, 0.2)',
        borderWidth: 1,
        borderColor: isMuted ? 'rgba(239, 68, 68, 0.4)' : 'rgba(74, 222, 128, 0.4)',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        {isMuted ? <VolumeX color="#EF4444" size={14} strokeWidth={2} /> : <Volume2 color="#4ADE80" size={14} strokeWidth={2} />}
      </View>

      {/* The full-length button */}
      <Pressable onPress={toggleMute} style={{ position: 'absolute', left: padding, top: 0, height: 28 }}>
        <Animated.View style={[
          {
            height: '100%',
            backgroundColor: isMuted ? 'rgba(239, 68, 68, 0.15)' : 'rgba(74, 222, 128, 0.15)',
            borderWidth: 1,
            borderColor: isMuted ? 'rgba(239, 68, 68, 0.3)' : 'rgba(74, 222, 128, 0.3)',
            borderRadius: 4,
            flexDirection: 'row',
            alignItems: 'center',
            paddingLeft: 8,
            overflow: 'hidden'
          },
          animStyle
        ]}>
          {isMuted ? (
            <VolumeX color="#EF4444" size={14} style={{ marginRight: 6 }} />
          ) : (
            <Volume2 color="#4ADE80" size={14} style={{ marginRight: 6 }} />
          )}
          <Text style={{ color: isMuted ? '#EF4444' : '#4ADE80', fontSize: 10, fontWeight: '500' }}>
            {isMuted ? 'Video Muted' : 'Video Audio'}
          </Text>
        </Animated.View>
      </Pressable>
    </View>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function TimelineLayout() {
  const { theme } = useTheme();
  const { tracks, duration } = useEditorState(useShallow(s => ({
    tracks: s.tracks,
    duration: s.duration,
  })));
  const { player } = useEditorPlayer();

  const scrollViewRef = useRef<any>(null);
  const currentTimeRef = useRef(useEditorState.getState().currentTime);
  const isPlayingRef = useRef(useEditorState.getState().isPlaying);
  const rafRef = useRef<number | null>(null);

  const isDragging = useSharedValue(false);
  const scale = useSharedValue(50); // pixels per second
  const savedScale = useSharedValue(50);
  const scrollX = useSharedValue(0);

  // Reset zoom on mount
  useEffect(() => {
    scale.value = 50;
    savedScale.value = 50;
  }, []);

  useEffect(() => {
    if (!player) return;

    const stopLoop = () => {
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };

    const startLoop = () => {
      if (rafRef.current != null) return;

      const loop = () => {
        if (isPlayingRef.current && !isDragging.value) {
          scrollViewRef.current?.scrollTo({ x: useEditorState.getState().currentTime * scale.value, animated: false });
        }
        rafRef.current = requestAnimationFrame(loop);
      };

      rafRef.current = requestAnimationFrame(loop);
    };

    const scrollToCurrentTime = (animated: boolean) => {
      if (isDragging.value) return;
      scrollViewRef.current?.scrollTo({ x: currentTimeRef.current * scale.value, animated });
    };

    const unsub = useEditorState.subscribe((state, prevState) => {
      if (state.currentTime !== prevState.currentTime) {
        currentTimeRef.current = state.currentTime;
        if (!state.isPlaying && !isDragging.value && Math.abs(state.currentTime - prevState.currentTime) > 0.05) {
          scrollToCurrentTime(true);
        }
      }

      if (state.isPlaying !== prevState.isPlaying) {
        isPlayingRef.current = state.isPlaying;
        if (state.isPlaying) {
          startLoop();
        } else {
          stopLoop();
          scrollToCurrentTime(true);
        }
      }
    });

    if (isPlayingRef.current) {
      startLoop();
    }

    return () => {
      stopLoop();
      unsub();
    };
  }, [player]);

  const updatePlayerTime = (offsetX: number, currentScale: number) => {
    if (player && isDragging.value) {
      const timelineTime = Math.max(0, offsetX / currentScale);
      // Just update the store. useTimelinePlayback will handle native seeking.
      useEditorState.getState().setCurrentTime(timelineTime);
    }
  };

  const pausePlayerIfNeeded = () => {
    if (player?.playing) safePausePlayer(player);
  };

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollX.value = event.contentOffset.x;
      if (isDragging.value) {
        runOnJS(updatePlayerTime)(event.contentOffset.x, scale.value);
      }
    },
    onBeginDrag: () => {
      isDragging.value = true;
      runOnJS(pausePlayerIfNeeded)();
    },
    onEndDrag: () => { isDragging.value = false; },
    onMomentumBegin: () => { isDragging.value = true; },
    onMomentumEnd: () => { isDragging.value = false; },
  });

  const pinchGesture = Gesture.Pinch()
    .onStart(() => { savedScale.value = scale.value; })
    .onUpdate((event) => {
      const newScale = savedScale.value * event.scale;
      if (newScale >= 10 && newScale <= 400) {
        scale.value = newScale;
      }
    });

  // Total scrollable width
  const contentStyle = useAnimatedStyle(() => ({
    width: duration * scale.value + TIMELINE_PADDING * 2,
  }));

  // Sort tracks: audio/subtitle/sticker first, video last
  const orderedTracks = [
    ...tracks.filter(t => t.type !== 'video'),
    ...tracks.filter(t => t.type === 'video'),
  ];

  return (
    <View style={[styles.outerContainer, { backgroundColor: theme.bg }]}>
      {/* ── Scrollable track area ── */}
      <View style={styles.trackArea}>
        {/* Fixed playhead (centered over the scroll area) */}
        <Playhead />

        <GestureHandlerRootView style={StyleSheet.absoluteFillObject}>
          <GestureDetector gesture={pinchGesture}>
            <Animated.View style={StyleSheet.absoluteFillObject}>
              <AnimatedRNGHScrollView
                ref={scrollViewRef}
                horizontal
                showsHorizontalScrollIndicator={false}
                scrollEventThrottle={16}
                onScroll={scrollHandler}
                contentContainerStyle={{ paddingHorizontal: 0 }}
              >
                <Animated.View style={contentStyle}>
                  {/* Time ruler */}
                  <View style={styles.rulerContainer}>
                    <TimeRuler duration={duration} scale={scale} />
                  </View>

                  {/* Track rows */}
                  {orderedTracks.map(track => (
                    <TrackLayer
                      key={track.id}
                      track={track}
                      scale={scale}
                      timelinePadding={TIMELINE_PADDING}
                      duration={duration}
                    />
                  ))}

                  {/* Video Mute Track right below the video track */}
                  <VideoMuteTrack duration={duration} scale={scale} padding={TIMELINE_PADDING} />
                </Animated.View>
              </AnimatedRNGHScrollView>
            </Animated.View>
          </GestureDetector>
        </GestureHandlerRootView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  trackArea: {
    flex: 1,
    position: 'relative',
    overflow: 'hidden',
  },
  rulerContainer: {
    height: RULER_HEIGHT,
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  ruler: {
    height: RULER_HEIGHT,
    position: 'absolute',
    top: 0,
    left: 0,
  },
  rulerTick: {
    position: 'absolute',
    bottom: 0,
    width: 1,
  },
  rulerLabel: {
    position: 'absolute',
    bottom: 12,
    fontSize: 8,
    fontWeight: '500',
    // Center the label on the tick
    transform: [{ translateX: -10 }],
  },
});
