import { useProjectStore } from '../store/projectStore';
import { useCreditStore } from '../store/creditStore';
import { invokeGeneration } from '../api/edgeFunctions';
import { analytics } from './analyticsService';
import type { ProjectType } from '../types';

export async function startGeneration(input: {
  userId: string;
  type: ProjectType;
  prompt: string | null;
  mediaUri?: string | null;
  creditsCost: number;
  options: Record<string, unknown>;
}): Promise<{ projectId: string | null; error: string | null }> {
  const spend = await useCreditStore.getState().spend(input.userId, input.creditsCost, `${input.type} generation`);
  if (spend.error) return { projectId: null, error: spend.error };

  try {
    const project = await useProjectStore.getState().createProject({
      userId: input.userId,
      type: input.type,
      prompt: input.prompt,
      params: { ...input.options, mediaUri: input.mediaUri ?? null },
      creditsCost: input.creditsCost,
    });

    const { error } = await invokeGeneration({
      projectId: project.id,
      type: input.type,
      prompt: input.prompt,
      mediaUri: input.mediaUri,
      options: input.options,
    });
    if (error) {
      useProjectStore.getState().updateProjectStatus(project.id, 'failed', { errorMessage: error });
      analytics.logEvent('generation_failed', { type: input.type, error });
      return { projectId: project.id, error };
    }

    analytics.logEvent('generation_started', { type: input.type });
    return { projectId: project.id, error: null };
  } catch (e: any) {
    analytics.recordError(e, 'startGeneration');
    return { projectId: null, error: e?.message ?? 'Could not start generation' };
  }
}
