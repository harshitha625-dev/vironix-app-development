import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { createClient } from '@supabase/supabase-js';

/**
 * Fill these in from your Supabase project settings (Project Settings > API).
 * Never commit real keys — use app.config.ts + environment variables
 * (EXPO_PUBLIC_SUPABASE_URL / EXPO_PUBLIC_SUPABASE_ANON_KEY) in production.
 */
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? 'https://YOUR-PROJECT.supabase.co';
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? 'YOUR-ANON-KEY';

/** Secure, encrypted session storage (falls back to AsyncStorage on web). */
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: (globalThis as any).window !== undefined ? AsyncStorage : (ExpoSecureStoreAdapter as any),
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const isSupabaseConfigured =
  SUPABASE_URL !== 'https://YOUR-PROJECT.supabase.co' && SUPABASE_ANON_KEY !== 'YOUR-ANON-KEY';
