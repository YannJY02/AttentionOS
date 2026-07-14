import { queuePersistAppState } from './persistence';
import { recordMalformedStorageEntry } from './storageRecovery';

export const TASK_RUNTIME_STORAGE_KEY = 'attentionos.execution.taskRuntime.v1';

export type PersistedTaskRuntimeState =
  | 'planning'
  | 'executing'
  | 'reviewing'
  | 'paused'
  | 'done'
  | 'cancelled';

export interface PersistedTaskRuntime {
  readonly actualMinutes: number;
  readonly state: PersistedTaskRuntimeState;
  readonly taskId: string;
  readonly updatedAt: string;
}

function isRuntimeState(value: unknown): value is PersistedTaskRuntimeState {
  return (
    value === 'planning' ||
    value === 'executing' ||
    value === 'reviewing' ||
    value === 'paused' ||
    value === 'done' ||
    value === 'cancelled'
  );
}

function sanitizeActualMinutes(value: unknown): number {
  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return 0;
  }

  return Math.max(0, Math.round(parsed));
}

function parseRuntime(raw: string): PersistedTaskRuntime | null {
  const parsed = JSON.parse(raw) as Partial<PersistedTaskRuntime>;

  if (typeof parsed.taskId !== 'string' || !isRuntimeState(parsed.state)) {
    return null;
  }

  return {
    actualMinutes: sanitizeActualMinutes(parsed.actualMinutes),
    state: parsed.state,
    taskId: parsed.taskId,
    updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
  };
}

export function readCurrentPersistedTaskRuntime(): PersistedTaskRuntime | null {
  const raw = localStorage.getItem(TASK_RUNTIME_STORAGE_KEY);

  if (!raw) {
    return null;
  }

  try {
    return parseRuntime(raw);
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Starting Focus without restoring malformed runtime progress.',
      payload: raw,
      storageKey: TASK_RUNTIME_STORAGE_KEY,
    });
    return null;
  }
}

export function readPersistedTaskRuntime(taskId: string): PersistedTaskRuntime | null {
  const runtime = readCurrentPersistedTaskRuntime();

  return runtime?.taskId === taskId ? runtime : null;
}

export function savePersistedTaskRuntime(
  runtime: Omit<PersistedTaskRuntime, 'updatedAt'>,
): PersistedTaskRuntime {
  const nextRuntime: PersistedTaskRuntime = {
    actualMinutes: sanitizeActualMinutes(runtime.actualMinutes),
    state: runtime.state,
    taskId: runtime.taskId,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(TASK_RUNTIME_STORAGE_KEY, JSON.stringify(nextRuntime));
  queuePersistAppState();
  return nextRuntime;
}

export function clearPersistedTaskRuntime(taskId: string): void {
  const current = readPersistedTaskRuntime(taskId);

  if (!current) {
    return;
  }

  localStorage.removeItem(TASK_RUNTIME_STORAGE_KEY);
  queuePersistAppState();
}
