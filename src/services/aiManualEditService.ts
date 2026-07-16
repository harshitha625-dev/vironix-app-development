import * as ImagePicker from 'expo-image-picker';
import { Alert } from 'react-native';
import { VideoMetadata } from '../store/aiManualEditStore';

export const AIManualEditService = {
  async captureMedia(type: 'photo' | 'video'): Promise<{ uri: string, duration?: number } | null> {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Camera permission is required to capture media.');
      return null;
    }
    
    const mediaTypes: ImagePicker.MediaType[] = type === 'photo' 
      ? ['images'] 
      : ['videos'];

    const result = await ImagePicker.launchCameraAsync({ 
      mediaTypes,
      quality: 1 
    });
    
    if (result.canceled || !result.assets[0]) return null;
    return { uri: result.assets[0].uri, duration: result.assets[0].duration };
  },

  async pickMediaFromGallery(): Promise<{ uri: string, duration?: number } | null> {
    console.log('[ImagePicker] pickMediaFromGallery called');
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    console.log('[ImagePicker] media library permission:', JSON.stringify(perm));
    if (!perm.granted) {
      Alert.alert('Permission Required', 'Gallery permission is required to select media.');
      return null;
    }
    
    console.log('[ImagePicker] launching launchImageLibraryAsync...');
    const result = await ImagePicker.launchImageLibraryAsync({ 
      mediaTypes: ['images', 'videos'], 
      quality: 1 
    });
    console.log('[ImagePicker] result canceled:', result.canceled, 'assets:', result.assets?.length);
    
    if (result.canceled || !result.assets[0]) return null;
    return { uri: result.assets[0].uri, duration: result.assets[0].duration };
  },

  async analyzeVideo(media: { uri: string, duration?: number }): Promise<VideoMetadata> {
    // Simulate analyzing metadata and generating thumbnail
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Extract filename from URI roughly
    const uriParts = media.uri.split('/');
    const name = uriParts[uriParts.length - 1] || 'video.mp4';
    
    let durationStr = 'Loading...';
    if (media.duration) {
        // ImagePicker returns duration in milliseconds
        const totalSeconds = media.duration / 1000;
        const m = Math.floor(totalSeconds / 60);
        // keep up to 2 decimal places for precise editor track length, e.g. 10.52
        const s = (totalSeconds % 60).toFixed(2);
        durationStr = `${m.toString().padStart(2, '0')}:${s.padStart(5, '0')}`;
    }

    return {
      uri: media.uri,
      name,
      size: '24.5 MB',
      duration: durationStr,
      resolution: '1920x1080',
      fps: 60,
      lastModified: new Date().toLocaleDateString(),
      // We don't have a real thumbnail yet, we will just pass null 
      // and use the expo-video player to render the thumbnail visually
      thumbnailUrl: null 
    };
  },

  async createProject(data: any): Promise<{ success: boolean; projectId: string }> {
    // Simulate API call to create project
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
      success: true,
      projectId: 'proj_' + Date.now()
    };
  },

  async saveDraft(projectId: string, state: any): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 800)); // Simulate save
  },

  async applyTool(projectId: string, tool: string, config: any): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500)); 
  },

  async analyzePrompt(prompt: string, onProgress: (state: string) => void): Promise<void> {
    onProgress('analyzing_frames');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onProgress('understanding');
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    onProgress('finding_ops');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    onProgress('preparing');
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    onProgress('done');
  },

  async generateRecommendations(): Promise<any[]> {
    return [
      { id: '1', title: 'Remove 8 silent gaps', desc: 'Cuts 4.2s of dead air.', time: 'Est. 12s', selected: true },
      { id: '2', title: 'Stabilize shaky footage', desc: 'Applies AI stabilization.', time: 'Est. 45s', selected: false },
      { id: '3', title: 'Improve brightness', desc: 'Fixes underexposed scenes.', time: 'Est. 10s', selected: true },
      { id: '4', title: 'Enhance colors', desc: 'Applies cinematic LUT.', time: 'Est. 8s', selected: true },
      { id: '5', title: 'Generate subtitles', desc: 'Auto-transcribes audio.', time: 'Est. 20s', selected: true },
    ];
  },

  async applyRecommendations(projectId: string, recommendations: any[]): Promise<void> {
    // We will navigate away, so we just resolve immediately for now.
    await new Promise(resolve => setTimeout(resolve, 300));
  },

  // Task 4: Mock Full-Screen AI Processing
  async startProcessing(
    callbacks: {
      onProgress: (progress: number, estimatedTime: string) => void;
      onStageChange: (stageIndex: number) => void;
      onLog: (log: string) => void;
      onInsight: (insight: string) => void;
      onComplete: () => void;
    },
    abortSignal?: AbortSignal
  ): Promise<void> {
    const STAGES = 10;
    const totalTimeMs = 15000; // 15 seconds total mock time
    const intervalMs = totalTimeMs / 100;
    
    let progress = 0;
    
    const logs = [
      "Reading video metadata...",
      "Extracting keyframes...",
      "12 silent sections detected",
      "Analyzing lighting conditions...",
      "Lighting enhancement prepared",
      "Color profile optimized",
      "Building cinematic transitions...",
      "Timeline rebuilt",
      "Subtitles generated successfully",
      "Rendering final output...",
      "Final quality check passed"
    ];

    const insights = [
      "We found 12 moments that can be improved.",
      "Your lighting will be enhanced.",
      "Detected 3 faces.",
      "Cinematic color grading selected.",
      "Optimizing for vertical display."
    ];

    return new Promise((resolve, reject) => {
      let logIndex = 0;
      let insightIndex = 0;

      const timer = setInterval(() => {
        if (abortSignal?.aborted) {
          clearInterval(timer);
          reject(new Error("Cancelled"));
          return;
        }

        progress += 1;
        
        // Update progress and est time
        const remainingSecs = Math.ceil(((100 - progress) * intervalMs) / 1000);
        callbacks.onProgress(progress, `Est. ${remainingSecs}s`);
        
        // Update Stage (every 10%)
        if (progress % 10 === 0) {
          callbacks.onStageChange(progress / 10);
        }

        // Push logs occasionally
        if (progress % 8 === 0 && logIndex < logs.length) {
          callbacks.onLog(logs[logIndex]);
          logIndex++;
        }

        // Push insights occasionally
        if (progress % 20 === 0 && insightIndex < insights.length) {
          callbacks.onInsight(insights[insightIndex]);
          insightIndex++;
        }

        if (progress >= 100) {
          clearInterval(timer);
          callbacks.onComplete();
          resolve();
        }
      }, intervalMs);
    });
  },

  // Task 5: Mock Preview Data
  async loadPreview(projectId: string): Promise<{
    previewVideo: string;
    originalVideo: string;
    aiSummary: Array<{ id: string; icon: string; title: string; desc: string }>;
    qualityInfo: { resolution: string; fps: number; duration: string; estSize: string };
  }> {
    await new Promise(resolve => setTimeout(resolve, 800));

    return {
      // Mocking video URLs - using the same sample video for now
      previewVideo: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      originalVideo: 'https://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4',
      aiSummary: [
        { id: '1', icon: 'Scissor', title: 'Removed silent sections', desc: 'Cut 4.2s of dead air.' },
        { id: '2', icon: 'Sun', title: 'Enhanced lighting', desc: 'Fixed underexposed scenes.' },
        { id: '3', icon: 'Palette', title: 'Improved color grading', desc: 'Applied cinematic LUT.' },
        { id: '4', icon: 'Wand2', title: 'Added transitions', desc: 'Generated smooth cuts.' }
      ],
      qualityInfo: {
        resolution: '1080p',
        fps: 60,
        duration: '00:15',
        estSize: '24.5 MB'
      }
    };
  },

  async submitFeedback(feedback: string): Promise<void> {
    // Simulate sending feedback to backend
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log(`Feedback submitted: ${feedback}`);
  },

  async prepareExport(config: { quality: string }): Promise<void> {
    // Simulate export preparation
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log(`Export prepared with quality: ${config.quality}`);
  }
};
