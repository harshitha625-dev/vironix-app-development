import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import type { UserProfile } from '../types';

interface AuthState {
  status: 'checking' | 'signedOut' | 'signedIn';
  user: UserProfile | null;
  hasOnboarded: boolean;
  init: () => Promise<void>;
  setOnboarded: (v: boolean) => void;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signUpWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<{ error: string | null }>;
  sendPasswordReset: (email: string) => Promise<{ error: string | null }>;
  verifyOtp: (email: string, token: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

function fallbackProfile(email: string): UserProfile {
  // Used when Supabase isn't configured yet, so the app is still explorable.
  return {
    id: 'local-demo-user',
    email,
    displayName: email.split('@')[0],
    avatarUrl: null,
    plan: 'free',
    credits: 20,
    createdAt: new Date().toISOString(),
  };
}

export const useAuthStore = create<AuthState>((set, get) => ({
  status: 'checking',
  user: null,
  hasOnboarded: false,

  init: async () => {
    if (!isSupabaseConfigured) {
      set({ status: 'signedOut' });
      return;
    }
    const { data } = await supabase.auth.getSession();
    if (data.session?.user) {
      await get().refreshProfile();
      set({ status: 'signedIn' });
    } else {
      set({ status: 'signedOut' });
    }
    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await get().refreshProfile();
        set({ status: 'signedIn' });
      } else {
        set({ status: 'signedOut', user: null });
      }
    });
  },

  setOnboarded: (v) => set({ hasOnboarded: v }),

  refreshProfile: async () => {
    const { data: authData } = await supabase.auth.getUser();
    if (!authData.user) return;
    const { data: row } = await supabase.from('users').select('*').eq('id', authData.user.id).maybeSingle();
    set({
      user: row
        ? {
            id: row.id,
            email: row.email,
            displayName: row.display_name,
            avatarUrl: row.avatar_url,
            plan: row.plan,
            credits: row.credits,
            createdAt: row.created_at,
          }
        : fallbackProfile(authData.user.email ?? ''),
    });
  },

  signInWithEmail: async (email, password) => {
    if (!isSupabaseConfigured) {
      set({ status: 'signedIn', user: fallbackProfile(email) });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    await get().refreshProfile();
    set({ status: 'signedIn' });
    return { error: null };
  },

  signUpWithEmail: async (email, password) => {
    if (!isSupabaseConfigured) {
      set({ status: 'signedIn', user: fallbackProfile(email) });
      return { error: null };
    }
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return { error: error.message };
    return { error: null };
  },

  signInWithOAuth: async (provider) => {
    if (!isSupabaseConfigured) {
      set({ status: 'signedIn', user: fallbackProfile(`demo+${provider}@veytrix.app`) });
      return { error: null };
    }
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) return { error: error.message };
    return { error: null };
  },

  sendPasswordReset: async (email) => {
    if (!isSupabaseConfigured) return { error: null };
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    return { error: error?.message ?? null };
  },

  verifyOtp: async (email, token) => {
    if (!isSupabaseConfigured) {
      set({ status: 'signedIn', user: fallbackProfile(email) });
      return { error: null };
    }
    const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
    if (error) return { error: error.message };
    await get().refreshProfile();
    set({ status: 'signedIn' });
    return { error: null };
  },

  signOut: async () => {
    if (isSupabaseConfigured) await supabase.auth.signOut();
    set({ status: 'signedOut', user: null });
  },
}));
