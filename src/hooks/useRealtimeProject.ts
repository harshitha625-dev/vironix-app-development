import { useEffect, useState } from 'react';
import { useProjectStore } from '../store/projectStore';
import type { Project } from '../types';

export function useRealtimeProject(projectId: string) {
  const initial = useProjectStore((s) => s.projects.find((p) => p.id === projectId)) ?? null;
  const [project, setProject] = useState<Project | null>(initial);

  useEffect(() => {
    setProject(useProjectStore.getState().projects.find((p) => p.id === projectId) ?? null);
    const unsubscribe = useProjectStore.getState().subscribeToProject(projectId, (p) => setProject(p));
    return unsubscribe;
  }, [projectId]);

  return project;
}
