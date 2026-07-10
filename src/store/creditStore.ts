import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { useAuthStore } from './authStore';
import type { CreditTransaction } from '../types';

interface CreditState {
  transactions: CreditTransaction[];
  loading: boolean;
  fetchTransactions: (userId: string) => Promise<void>;
  spend: (userId: string, amount: number, description: string) => Promise<{ error: string | null }>;
  recharge: (userId: string, amount: number, description: string) => Promise<{ error: string | null }>;
}

export const useCreditStore = create<CreditState>((set, get) => ({
  transactions: [],
  loading: false,

  fetchTransactions: async (userId) => {
    if (!isSupabaseConfigured) return;
    set({ loading: true });
    const { data } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    set({
      loading: false,
      transactions: (data ?? []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        amount: row.amount,
        balanceAfter: row.balance_after,
        description: row.description,
        createdAt: row.created_at,
      })),
    });
  },

  spend: async (userId, amount, description) => {
    const user = useAuthStore.getState().user;
    if (!user) return { error: 'Not signed in' };
    if (user.credits < amount) return { error: 'Not enough credits' };

    if (!isSupabaseConfigured) {
      const balanceAfter = user.credits - amount;
      useAuthStore.setState({ user: { ...user, credits: balanceAfter } });
      set({
        transactions: [
          { id: `tx-${Date.now()}`, userId, type: 'spend', amount: -amount, balanceAfter, description, createdAt: new Date().toISOString() },
          ...get().transactions,
        ],
      });
      return { error: null };
    }
    // Real deployment: call an atomic Postgres RPC so concurrent generations
    // can't double-spend the same balance (see backend architecture doc).
    const { error } = await supabase.rpc('deduct_credits', { p_user_id: userId, p_amount: amount, p_description: description });
    if (error) return { error: error.message };
    await useAuthStore.getState().refreshProfile();
    await get().fetchTransactions(userId);
    return { error: null };
  },

  recharge: async (userId, amount, description) => {
    const user = useAuthStore.getState().user;
    if (!user) return { error: 'Not signed in' };

    if (!isSupabaseConfigured) {
      const balanceAfter = user.credits + amount;
      useAuthStore.setState({ user: { ...user, credits: balanceAfter } });
      set({
        transactions: [
          { id: `tx-${Date.now()}`, userId, type: 'recharge', amount, balanceAfter, description, createdAt: new Date().toISOString() },
          ...get().transactions,
        ],
      });
      return { error: null };
    }
    const { error } = await supabase.rpc('add_credits', { p_user_id: userId, p_amount: amount, p_description: description });
    if (error) return { error: error.message };
    await useAuthStore.getState().refreshProfile();
    await get().fetchTransactions(userId);
    return { error: null };
  },
}));
