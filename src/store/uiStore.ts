import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import type { AppNotification } from '../types';

interface UiState {
  notifications: AppNotification[];
  unreadCount: number;
  fetchNotifications: (userId: string) => Promise<void>;
  markAllRead: (userId: string) => void;
  pushDemoNotification: (n: Omit<AppNotification, 'id' | 'createdAt' | 'read' | 'userId'>) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async (userId) => {
    if (!isSupabaseConfigured) return;
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    const notifications = (data ?? []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      category: row.category,
      title: row.title,
      body: row.body,
      read: row.read,
      createdAt: row.created_at,
    }));
    set({ notifications, unreadCount: notifications.filter((n) => !n.read).length });
  },

  markAllRead: (userId) => {
    set({ notifications: get().notifications.map((n) => ({ ...n, read: true })), unreadCount: 0 });
    if (isSupabaseConfigured) {
      supabase.from('notifications').update({ read: true }).eq('user_id', userId).then(() => {});
    }
  },

  pushDemoNotification: (n) => {
    const notif: AppNotification = {
      id: `n-${Date.now()}`,
      userId: 'local-demo-user',
      read: false,
      createdAt: new Date().toISOString(),
      ...n,
    };
    set({ notifications: [notif, ...get().notifications], unreadCount: get().unreadCount + 1 });
  },
}));
