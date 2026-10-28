import { z } from 'zod';
import { promptProjectSchema, type PromptProject } from './schema';

export const STORAGE_KEY = 'image-prompt.projects.v1';
const projectListSchema = z.array(promptProjectSchema).max(100);

/** Read failures (private mode, corrupt storage, version drift) must never crash the editor. */
export function loadProjects(storage: Pick<Storage, 'getItem'>): PromptProject[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = projectListSchema.safeParse(JSON.parse(raw));
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

export function saveProjects(storage: Pick<Storage, 'setItem'>, projects: PromptProject[]): boolean {
  const parsed = projectListSchema.safeParse(projects);
  if (!parsed.success) return false;
  try {
    storage.setItem(STORAGE_KEY, JSON.stringify(parsed.data));
    return true;
  } catch {
    return false;
  }
}
