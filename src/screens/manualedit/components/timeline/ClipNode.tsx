import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Pressable, Image, PanResponder } from 'react-native';
import * as VideoThumbnails from 'expo-video-thumbnails';
import Animated, { useAnimatedStyle, SharedValue } from 'react-native-reanimated';
import { useTheme } from '../../../../theme/ThemeProvider';
import { radius } from '../../../../theme/tokens';
import { Clip } from '../../types/editor.types';
import { useEditorState } from '../../hooks/useEditorState';
import { useShallow } from 'zustand/react/shallow';
import { useEditorPlayer } from '../../context/EditorPlayerContext';
import { safePausePlayer } from '../../utils/safeVideoPlayer';

export const TRACK_HEIGHTS: Record<string, number> = {
  video: 60,
  audio: 40,
  text: 30,
  effect: 30,
  sticker: 40,
};

interface Props {
  clip: Clip;
  scale: SharedValue<number>;
  timelinePadding: number;
}

export function ClipNode({ clip, scale, timelinePadding }: Props) {
  const { theme } = useTheme();
  const { selectedClipId, setSelectedClipId, updateClipTrim } = useEditorState(useShallow(s => ({
    selectedClipId: s.selectedClipId,
    setSelectedClipId: s.setSelectedClipId,
    updateClipTrim: s.updateClipTrim
  })));
  const { player } = useEditorPlayer();
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [dragOffsets, setDragOffsets] = useState({ left: 0, right: 0 });

  const isSelected = selectedClipId === clip.id;
  const trackHeight = TRACK_HEIGHTS[clip.type] ?? 36;

  // ── Trim handles (left / right drag) ──────────────────────────────────────

  const leftPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const baseWidth = clip.duration * scale.value;
        setDragOffsets(prev => ({ ...prev, left: Math.min(gesture.dx, baseWidth - 20) }));
      },
      onPanResponderRelease: (_, gesture) => {
        const baseWidth = clip.duration * scale.value;
        const finalLeftOffset = Math.min(gesture.dx, baseWidth - 20);
        const timeDelta = finalLeftOffset / scale.value;
        const newStartTime = clip.startTime + timeDelta;
        const newSourceStartTime = (clip.sourceStartTime ?? 0) + timeDelta;
        const newDuration = clip.duration - timeDelta;
        
        updateClipTrim(clip.id, { 
          startTime: newStartTime, 
          sourceStartTime: newSourceStartTime,
          duration: newDuration 
        });
        setDragOffsets({ left: 0, right: 0 });
        if (player) {
          safePausePlayer(player);
          useEditorState.getState().setCurrentTime(newStartTime);
        }
      },
    })
  ).current;

  const rightPanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        const baseWidth = clip.duration * scale.value;
        setDragOffsets(prev => ({ ...prev, right: Math.max(gesture.dx, -baseWidth + 20) }));
      },
      onPanResponderRelease: (_, gesture) => {
        const baseWidth = clip.duration * scale.value;
        const finalRightOffset = Math.max(gesture.dx, -baseWidth + 20);
        const newDuration = clip.duration + (finalRightOffset / scale.value);
        
        updateClipTrim(clip.id, { duration: newDuration });
        setDragOffsets({ left: 0, right: 0 });
        if (player) {
          safePausePlayer(player);
          useEditorState.getState().setCurrentTime(clip.startTime + newDuration - 0.1);
        }
      },
    })
  ).current;

  // ── Thumbnails (video clips only) ─────────────────────────────────────────

  const THUMBNAIL_INTERVAL = 3; // Generate a thumbnail every 3 seconds
  const numThumbs = Math.max(1, Math.ceil(clip.duration / THUMBNAIL_INTERVAL));
  const prevStartTime = useRef(clip.startTime);

  useEffect(() => {
    if (!clip.uri || clip.type !== 'video') return;
    let isMounted = true;

    const generateThumbnails = async () => {
      try {
        // If start time changed, we need new frames. Otherwise, check if we have enough.
        const startTimeChanged = prevStartTime.current !== clip.startTime;
        if (!startTimeChanged && thumbnails.length >= numThumbs) return;

        if (startTimeChanged) {
          prevStartTime.current = clip.startTime;
          // We can optionally clear here, but keeping old ones until new ones load is less flickery
        }

        const resolvedThumbs: string[] = startTimeChanged ? [] : [...thumbnails];
        const startingIndex = resolvedThumbs.length;

        // Generate sequentially
        for (let i = startingIndex; i < numThumbs; i++) {
          if (!isMounted) break;
          
          const timeMs = ((clip.sourceStartTime ?? 0) + i * THUMBNAIL_INTERVAL) * 1000;
          try {
            const res = await VideoThumbnails.getThumbnailAsync(clip.uri!, {
              time: timeMs,
              quality: 0.2,
            });
            resolvedThumbs.push(res.uri);
            
            if (isMounted) {
              setThumbnails([...resolvedThumbs]);
            }
            await new Promise(resolve => setTimeout(resolve, 50));
          } catch (e) {
            // Silently skip
          }
        }
      } catch (e) {
        // Silently skip
      }
    };

    generateThumbnails();
    return () => { isMounted = false; };
  }, [clip.uri, clip.duration, clip.startTime]);

  // ── Animated position / width ──────────────────────────────────────────────

  const animatedStyle = useAnimatedStyle(() => {
    const baseWidth = clip.duration * scale.value;
    const baseLeft = timelinePadding + clip.startTime * scale.value;
    return {
      width: Math.max(20, baseWidth + dragOffsets.right - dragOffsets.left),
      left: baseLeft + dragOffsets.left,
      height: trackHeight,
    };
  });

  const thumbnailContainerStyle = useAnimatedStyle(() => {
    return {
      width: numThumbs * THUMBNAIL_INTERVAL * scale.value,
      flexDirection: 'row' as const,
      height: '100%',
    };
  });

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <Animated.View
      style={[
        styles.container,
        animatedStyle,
        {
          backgroundColor: clip.color + '35',
          borderColor: isSelected ? '#FFF' : clip.color + '99',
          borderWidth: isSelected ? 2 : 1,
        },
      ]}
    >
      {/* Pressable fill — tap to select */}
      <Pressable
        onPress={() => {
          setSelectedClipId(clip.id);
          if (player) {
            safePausePlayer(player);
            useEditorState.getState().setCurrentTime(clip.startTime);
          }
        }}
        style={StyleSheet.absoluteFillObject}
      >
        {/* Filmstrip thumbnails for video clips */}
        {clip.type === 'video' && thumbnails.length > 0 && (
          <Animated.View style={thumbnailContainerStyle}>
            {thumbnails.map((uri, index) => (
              <Image
                key={index}
                source={{ uri }}
                style={styles.thumbnail}
                resizeMode="cover"
              />
            ))}
          </Animated.View>
        )}

        {/* Colored tint bar at the top of non-video clips */}
        {clip.type !== 'video' && (
          <View style={[styles.colorBar, { backgroundColor: clip.color }]} />
        )}
      </Pressable>

      {/* Trim handles — only visible when selected */}
      {isSelected && (
        <>
          <View style={[styles.handle, styles.leftHandle]} {...leftPanResponder.panHandlers}>
            <View style={styles.handleLine} />
          </View>
          <View style={[styles.handle, styles.rightHandle]} {...rightPanResponder.panHandlers}>
            <View style={styles.handleLine} />
          </View>
        </>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  thumbnailRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  thumbnail: {
    flex: 1,
    height: '100%',
  },
  colorBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 3,
    opacity: 0.9,
  },
  handle: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 16,
    backgroundColor: 'rgba(255,255,255,0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  leftHandle: {
    left: 0,
    borderTopLeftRadius: radius.sm,
    borderBottomLeftRadius: radius.sm,
  },
  rightHandle: {
    right: 0,
    borderTopRightRadius: radius.sm,
    borderBottomRightRadius: radius.sm,
  },
  handleLine: {
    width: 2,
    height: 14,
    backgroundColor: '#333',
    borderRadius: 1,
  },
});
