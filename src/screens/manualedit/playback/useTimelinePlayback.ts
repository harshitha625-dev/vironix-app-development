import { useEffect, useRef } from 'react';
import { useEditorPlayer } from '../context/EditorPlayerContext';
import { useEditorState } from '../hooks/useEditorState';
import { useShallow } from 'zustand/react/shallow';
import { safePausePlayer } from '../utils/safeVideoPlayer';

export const useTimelinePlayback = () => {
  const { player } = useEditorPlayer();
  const { tracks, currentTime, duration, setCurrentTime, isPlaying } = useEditorState(useShallow(s => ({
    tracks: s.tracks,
    currentTime: s.currentTime,
    duration: s.duration,
    setCurrentTime: s.setCurrentTime,
    isPlaying: s.isPlaying
  })));
  const lastTimeRef = useRef(currentTime);

  // Sync native play state
  useEffect(() => {
    if (!player) return;
    const sub = player.addListener('playingChange', (payload) => {
      if (payload.isPlaying !== useEditorState.getState().isPlaying) {
        useEditorState.setState({ isPlaying: payload.isPlaying });
      }
    });
    return () => sub.remove();
  }, [player]);

  // Handle Play/Pause commands from state
  useEffect(() => {
    if (!player) return;
    if (isPlaying) {
      if (currentTime >= duration - 0.1) {
        // Restart from beginning
        setCurrentTime(0);
        lastTimeRef.current = 0;
        const videoTrack = tracks.find(t => t.type === 'video');
        if (videoTrack && videoTrack.clips.length > 0) {
          player.currentTime = videoTrack.clips[0].sourceStartTime ?? 0;
        }
      }
      player.play();
    } else {
      safePausePlayer(player);
    }
  }, [isPlaying, player]);

  // Master Playback Loop (Driven by native player clock)
  useEffect(() => {
    if (!player || !isPlaying) return;

    let reqId: number;
    let lastStoreUpdate = 0; // timestamp of last Zustand update

    const loop = () => {
      const videoTrack = tracks.find(t => t.type === 'video');

      // Find the clip we think we are currently in based on last known timeline time
      // We add a tiny buffer (0.05) to avoid floating point misses right on the boundary
      let currentClip = videoTrack?.clips.find(c => lastTimeRef.current >= c.startTime && lastTimeRef.current <= c.startTime + c.duration + 0.05);

      if (!currentClip && videoTrack?.clips.length) {
        // Fallback if somehow lost, find based on player's raw time
        currentClip = videoTrack.clips[0];
      }

      if (currentClip) {
        const clipProgress = player.currentTime - (currentClip.sourceStartTime ?? 0);
        let newTimelineTime = currentClip.startTime + Math.max(0, clipProgress);

        // Have we reached or crossed the end of this clip natively?
        if (clipProgress >= currentClip.duration) {
          // We crossed the boundary! Find the next contiguous clip on the timeline
          const nextClip = videoTrack?.clips.find(c => c.startTime >= currentClip.startTime + currentClip.duration - 0.01);

          if (nextClip) {
            // Determine if we need to seek. If the source times are continuous, we don't need to seek!
            const expectedNextSourceStart = (currentClip.sourceStartTime ?? 0) + currentClip.duration;
            const actualNextSourceStart = nextClip.sourceStartTime ?? 0;

            if (Math.abs(expectedNextSourceStart - actualNextSourceStart) > 0.1) {
              // Not contiguous in the source file, force a seek!
              player.currentTime = actualNextSourceStart;
            }

            newTimelineTime = nextClip.startTime;
          } else {
            // Reached end of the entire timeline
            newTimelineTime = duration;
            useEditorState.setState({ isPlaying: false });
          }
        }

        if (Math.abs(newTimelineTime - lastTimeRef.current) > 0.01) {
          lastTimeRef.current = newTimelineTime;
          // Throttle Zustand state updates to ~4x/sec instead of 60x/sec
          // This prevents 5+ subscribed components from re-rendering every frame
          const now = Date.now();
          if (now - lastStoreUpdate > 250) {
            lastStoreUpdate = now;
            setCurrentTime(newTimelineTime);
          }
        }
      }

      reqId = requestAnimationFrame(loop);
    };

    reqId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqId);
  }, [isPlaying, player, tracks, duration]);

  // Handle manual scrubbing (when timelineTime jumps externally)
  useEffect(() => {
    if (Math.abs(currentTime - lastTimeRef.current) > 0.1) {
      lastTimeRef.current = currentTime;
      if (player) {
        const videoTrack = tracks.find(t => t.type === 'video');
        const currentClip = videoTrack?.clips.find(c => currentTime >= c.startTime && currentTime <= c.startTime + c.duration);
        if (currentClip) {
          player.currentTime = (currentClip.sourceStartTime ?? 0) + (currentTime - currentClip.startTime);
        }
      }
    }
  }, [currentTime, player, tracks]);

  const togglePlay = () => {
    useEditorState.setState(s => ({ isPlaying: !s.isPlaying }));
  };

  return { isPlaying, togglePlay };
};
