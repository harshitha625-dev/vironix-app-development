import { supabase, isSupabaseConfigured } from '../services/supabase';
import type { ProjectType } from '../types';

/**
 * Calls a Supabase Edge Function that: debits credits atomically, calls the
 * relevant AI provider (text-to-video / image-to-video / reference-video),
 * and flips the project row to "generating"/"processing"/"completed" as the
 * provider reports back (webhook or the function's own polling loop). The
 * client just watches the row via Realtime — see hooks/useRealtimeProject.ts.
 */
export async function invokeGeneration(params: {
  projectId: string;
  type: ProjectType;
  prompt: string | null;
  mediaUri?: string | null;
  options: Record<string, unknown>;
}): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) {
    // Demo mode: projectStore's simulateDemoGeneration already drives the
    // status machine locally, so there's nothing to invoke.
    return { error: null };
  }
  const { error } = await supabase.functions.invoke('generate-video', { body: params });
  return { error: error?.message ?? null };
}

export async function invokeManualEditExport(params: {
  projectId: string;
  edlJson: Record<string, unknown>;
}): Promise<{ error: string | null }> {
  if (!isSupabaseConfigured) return { error: null };
  const { error } = await supabase.functions.invoke('render-manual-edit', { body: params });
  return { error: error?.message ?? null };
}
