import { useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  listCanvases,
  createCanvas,
  updateCanvas,
  deleteCanvas,
  type CanvasRow,
} from '../lib/canvasService';

// ── Types ────────────────────────────────────────────────────────────────────

export interface CanvasData {
  [blockId: number]: string;
}

export interface Project {
  id: string;
  name: string;
  lastModified: number;
  data: CanvasData;
}

export interface UseCanvasesReturn {
  projects: Project[];
  loading: boolean;
  createProject: () => string;
  renameProject: (id: string, name: string) => void;
  deleteProject: (id: string) => void;
  clearProject: (id: string) => void;
  /** Updates a block locally and persists to Supabase. Returns the cloud-write promise so callers can handle errors. */
  updateBlock: (projectId: string, blockId: number, text: string) => Promise<void>;
  importProject: (name: string, data: CanvasData) => string;
}

// ── Storage keys ─────────────────────────────────────────────────────────────

const CACHE_KEY_PREFIX = 'lean-canvas-pro-cache-';
/** Legacy key written by the old `useLocalStorage` hook. Used for one-time migration. */
const LEGACY_PROJECTS_KEY = 'lean-canvas-pro-projects';
const MIGRATED_FLAG_PREFIX = 'lean-canvas-pro-migrated-';

// ── Helpers ───────────────────────────────────────────────────────────────────

function rowToProject(row: CanvasRow): Project {
  return {
    id: row.id,
    name: row.name,
    lastModified: new Date(row.updated_at).getTime(),
    // JSONB stores keys as strings; casting to CanvasData works at runtime
    // because JS coerces numeric property lookups (e.g. obj[1] === obj["1"]).
    data: row.data as unknown as CanvasData,
  };
}

function projectDataToRecord(data: CanvasData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(data)) {
    out[k] = v as string;
  }
  return out;
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useCanvases(): UseCanvasesReturn {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const cacheKey = user ? `${CACHE_KEY_PREFIX}${user.id}` : null;
  const migratedFlag = user ? `${MIGRATED_FLAG_PREFIX}${user.id}` : null;

  // Ref always points to the latest projects array for use in callbacks
  // without stale-closure issues.
  const projectsRef = useRef<Project[]>(projects);
  useEffect(() => {
    projectsRef.current = projects;
  }, [projects]);

  // Write-through to the per-user localStorage cache.
  const persist = useCallback(
    (next: Project[]) => {
      if (!cacheKey) return;
      try {
        localStorage.setItem(cacheKey, JSON.stringify(next));
      } catch {
        // Quota exceeded or private-browsing restriction – silently ignore.
      }
    },
    [cacheKey]
  );

  // ── Initial load: cache → Supabase ─────────────────────────────────────────

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    // 1. Seed immediately from localStorage cache so the UI is instant.
    if (cacheKey) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached) as Project[];
          if (parsed.length > 0) setProjects(parsed);
        }
      } catch {
        // Corrupted cache – ignore; Supabase fetch will recover below.
      }
    }

    // 2. Fetch authoritative data from Supabase.
    listCanvases()
      .then(async (rows) => {
        if (rows.length > 0) {
          // Cloud is the source of truth.
          const loaded = rows.map(rowToProject);
          setProjects(loaded);
          persist(loaded);
          return;
        }

        // No canvases in cloud yet – check whether migration is needed.
        if (migratedFlag && !localStorage.getItem(migratedFlag)) {
          const legacyRaw = localStorage.getItem(LEGACY_PROJECTS_KEY);
          if (legacyRaw) {
            // Migrate legacy localStorage canvases to Supabase (new UUIDs).
            const legacy = JSON.parse(legacyRaw) as Project[];
            if (legacy.length > 0) {
              const results = await Promise.allSettled(
                legacy.map(async (p) => {
                  const newId = crypto.randomUUID();
                  await createCanvas(newId, p.name, projectDataToRecord(p.data));
                  return { ...p, id: newId } as Project;
                })
              );
              const migrated = results
                .filter((r): r is PromiseFulfilledResult<Project> => r.status === 'fulfilled')
                .map((r) => r.value);
              const failCount = results.filter((r) => r.status === 'rejected').length;
              if (failCount > 0) {
                console.error(`[useCanvases] Migration: ${failCount} canvas(es) failed to upload.`);
              }
              if (migrated.length > 0) {
                setProjects(migrated);
                persist(migrated);
              }
              // Always set the flag to prevent infinite retry loops.
              localStorage.setItem(migratedFlag, '1');
              return;
            }
          }
        }

        // No cloud data and no legacy data – create a default canvas.
        const defaultId = crypto.randomUUID();
        const defaultProject: Project = {
          id: defaultId,
          name: 'Mi Primer Canvas',
          lastModified: Date.now(),
          data: {},
        };
        await createCanvas(defaultId, 'Mi Primer Canvas').catch(console.error);
        setProjects([defaultProject]);
        persist([defaultProject]);
        if (migratedFlag) localStorage.setItem(migratedFlag, '1');
      })
      .catch((err) => {
        // Network error: fall back to the cache that was seeded above.
        console.error('[useCanvases] Failed to load from cloud:', err);
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // ── Shared state updater ───────────────────────────────────────────────────

  const updateProjects = useCallback(
    (updater: (prev: Project[]) => Project[]) => {
      setProjects((prev) => {
        const next = updater(prev);
        persist(next);
        return next;
      });
    },
    [persist]
  );

  // ── Public actions ─────────────────────────────────────────────────────────

  const createProject = useCallback((): string => {
    const newId = crypto.randomUUID();
    // Derive the next numeric suffix to avoid duplicates when canvases are deleted.
    const existingNums = projectsRef.current.map((p) => {
      const m = p.name.match(/^Lienzo (\d+)$/);
      return m ? parseInt(m[1], 10) : 0;
    });
    const nextNum = existingNums.length > 0 ? Math.max(0, ...existingNums) + 1 : 1;
    const name = `Lienzo ${nextNum}`;
    updateProjects((prev) => [
      ...prev,
      { id: newId, name, lastModified: Date.now(), data: {} },
    ]);
    createCanvas(newId, name).catch(console.error);
    return newId;
  }, [updateProjects]);

  const renameProject = useCallback(
    (id: string, name: string) => {
      updateProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, name, lastModified: Date.now() } : p))
      );
      updateCanvas(id, { name }).catch(console.error);
    },
    [updateProjects]
  );

  const deleteProject = useCallback(
    (id: string) => {
      updateProjects((prev) => prev.filter((p) => p.id !== id));
      deleteCanvas(id).catch(console.error);
    },
    [updateProjects]
  );

  const clearProject = useCallback(
    (id: string) => {
      updateProjects((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, data: {}, lastModified: Date.now() } : p
        )
      );
      updateCanvas(id, { data: {} }).catch(console.error);
    },
    [updateProjects]
  );

  const updateBlock = useCallback(
    (projectId: string, blockId: number, text: string): Promise<void> => {
      const project = projectsRef.current.find((p) => p.id === projectId);
      if (!project) return Promise.resolve();
      const newData = { ...project.data, [blockId]: text };
      updateProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? { ...p, data: newData, lastModified: Date.now() }
            : p
        )
      );
      return updateCanvas(projectId, {
        data: projectDataToRecord(newData),
      });
    },
    [updateProjects]
  );

  const importProject = useCallback(
    (name: string, data: CanvasData): string => {
      const newId = crypto.randomUUID();
      updateProjects((prev) => [
        ...prev,
        { id: newId, name, lastModified: Date.now(), data },
      ]);
      createCanvas(newId, name, projectDataToRecord(data)).catch(console.error);
      return newId;
    },
    [updateProjects]
  );

  return {
    projects,
    loading,
    createProject,
    renameProject,
    deleteProject,
    clearProject,
    updateBlock,
    importProject,
  };
}
