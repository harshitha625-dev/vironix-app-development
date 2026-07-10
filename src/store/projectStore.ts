import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import type { Project, ProjectStatus, ProjectType } from '../types';

interface ProjectState {
  projects: Project[];
  loading: boolean;
  fetchProjects: (userId: string) => Promise<void>;
  createProject: (input: {
    userId: string;
    type: ProjectType;
    prompt: string | null;
    params: Record<string, unknown>;
    creditsCost: number;
  }) => Promise<Project>;
  updateProjectStatus: (id: string, status: ProjectStatus, patch?: Partial<Project>) => void;
  subscribeToProject: (id: string, onChange: (p: Project) => void) => () => void;
  removeProject: (id: string) => void;
  duplicateProject: (id: string) => void;
}

let demoCounter = 0;

export const useProjectStore = create<ProjectState>((set, get) => ({
  projects: [],
  loading: false,

  fetchProjects: async (userId) => {
    if (!isSupabaseConfigured) return; // demo mode keeps whatever is already in local state
    set({ loading: true });
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    set({
      loading: false,
      projects: (data ?? []).map((row: any) => ({
        id: row.id,
        userId: row.user_id,
        type: row.type,
        status: row.status,
        prompt: row.prompt,
        params: row.params ?? {},
        thumbnailUrl: row.thumbnail_url,
        outputUrl: row.output_url,
        creditsCost: row.credits_cost,
        errorMessage: row.error_message,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      })),
    });
  },

  createProject: async (input) => {
    const now = new Date().toISOString();

    if (!isSupabaseConfigured) {
      demoCounter += 1;
      const project: Project = {
        id: `demo-${demoCounter}-${Date.now()}`,
        userId: input.userId,
        type: input.type,
        status: 'queued',
        prompt: input.prompt,
        params: input.params,
        thumbnailUrl: null,
        outputUrl: null,
        creditsCost: input.creditsCost,
        errorMessage: null,
        createdAt: now,
        updatedAt: now,
      };
      set({ projects: [project, ...get().projects] });
      simulateDemoGeneration(project.id, get, set);
      return project;
    }

    const { data, error } = await supabase
      .from('projects')
      .insert({
        user_id: input.userId,
        type: input.type,
        status: 'queued',
        prompt: input.prompt,
        params: input.params,
        credits_cost: input.creditsCost,
      })
      .select('*')
      .single();
    if (error) throw error;
    const project: Project = {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      status: data.status,
      prompt: data.prompt,
      params: data.params ?? {},
      thumbnailUrl: data.thumbnail_url,
      outputUrl: data.output_url,
      creditsCost: data.credits_cost,
      errorMessage: data.error_message,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
    set({ projects: [project, ...get().projects] });
    // In production, an Edge Function trigger (DB webhook on insert) picks this
    // row up and calls the AI provider — see services/projectService.ts.
    return project;
  },

  updateProjectStatus: (id, status, patch = {}) => {
    set({
      projects: get().projects.map((p) => (p.id === id ? { ...p, status, ...patch, updatedAt: new Date().toISOString() } : p)),
    });
  },

  subscribeToProject: (id, onChange) => {
    if (!isSupabaseConfigured) {
      // Demo mode already mutates the store directly; poll local state instead.
      const interval = setInterval(() => {
        const p = get().projects.find((x) => x.id === id);
        if (p) onChange(p);
      }, 500);
      return () => clearInterval(interval);
    }
    const channel = supabase
      .channel(`project-${id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'projects', filter: `id=eq.${id}` }, (payload) => {
        const row: any = payload.new;
        onChange({
          id: row.id,
          userId: row.user_id,
          type: row.type,
          status: row.status,
          prompt: row.prompt,
          params: row.params ?? {},
          thumbnailUrl: row.thumbnail_url,
          outputUrl: row.output_url,
          creditsCost: row.credits_cost,
          errorMessage: row.error_message,
          createdAt: row.created_at,
          updatedAt: row.updated_at,
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  },

  removeProject: (id) => {
    set({ projects: get().projects.filter((p) => p.id !== id) });
    if (isSupabaseConfigured) supabase.from('projects').delete().eq('id', id).then(() => {});
  },

  duplicateProject: (id) => {
    const source = get().projects.find((p) => p.id === id);
    if (!source) return;
    const now = new Date().toISOString();
    const copy: Project = { ...source, id: `${source.id}-copy-${Date.now()}`, status: 'draft', createdAt: now, updatedAt: now };
    set({ projects: [copy, ...get().projects] });
  },
}));

/** Demo-mode generation simulator so the app is fully explorable without a
 * live backend: walks a project through the same status machine the real
 * Edge Function pipeline would drive. */
function simulateDemoGeneration(
  id: string,
  get: () => ProjectState,
  set: (partial: Partial<ProjectState>) => void
) {
  const steps: Array<{ status: ProjectStatus; delay: number }> = [
    { status: 'queued', delay: 400 },
    { status: 'generating', delay: 1800 },
    { status: 'processing', delay: 1800 },
    { status: 'completed', delay: 1200 },
  ];
  let t = 0;
  steps.forEach(({ status, delay }) => {
    t += delay;
    setTimeout(() => {
      const patch: Partial<Project> =
        status === 'completed'
          ? { outputUrl: 'demo://generated-video', thumbnailUrl: 'demo://thumb' }
          : {};
      set({
        projects: get().projects.map((p) => (p.id === id ? { ...p, status, ...patch, updatedAt: new Date().toISOString() } : p)),
      });
    }, t);
  });
}
