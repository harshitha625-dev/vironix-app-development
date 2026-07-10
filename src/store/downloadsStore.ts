import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface DownloadsState {
  downloadedIds: string[];
  hydrate: () => Promise<void>;
  markDownloaded: (projectId: string) => Promise<void>;
  removeDownload: (projectId: string) => Promise<void>;
}

const STORAGE_KEY = 'veytrix:downloaded-ids';

export const useDownloadsStore = create<DownloadsState>((set, get) => ({
  downloadedIds: [],

  hydrate: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    set({ downloadedIds: raw ? JSON.parse(raw) : [] });
  },

  markDownloaded: async (projectId) => {
    const next = Array.from(new Set([...get().downloadedIds, projectId]));
    set({ downloadedIds: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },

  removeDownload: async (projectId) => {
    const next = get().downloadedIds.filter((id) => id !== projectId);
    set({ downloadedIds: next });
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  },
}));
