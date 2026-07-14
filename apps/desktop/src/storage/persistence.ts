import { invoke, isTauri } from '@tauri-apps/api/core';
import { validateHierarchySnapshotPayload } from './taskValidation';

export const APP_STATE_SNAPSHOT_STORAGE_KEY = 'attentionos.persistence.snapshot.v1';
export const APP_STATE_BACKUP_STORAGE_KEY = 'attentionos.persistence.backups.v1';
export const APP_STATE_CORRUPT_BACKUP_STORAGE_KEY = 'attentionos.persistence.corruptBackups.v1';
export const APP_STATE_RECOVERY_STORAGE_KEY = 'attentionos.persistence.recovery.v1';

const APP_VERSION = '0.1.0';
const APP_STATE_SCHEMA_VERSION = 1;

const PERSISTED_STORAGE_KEYS = [
  'attentionos.hierarchy.v1',
  'attentionos.execution.focusCandidate.v1',
  'attentionos.reflections.v1',
  'attentionos.onboarding.v1',
  'attentionos.ritualCopy.v1',
  'attentionos.ritualMeditationSettings.v1',
  'attentionos.ritualScheduleSettings.v1',
  'attentionos.privacySettings.v1',
  'attentionos.reminderSettings.v1',
  'attentionos.execution.taskRuntime.v1',
  'attentionos.ai.suggestions.v1',
  'attentionos.learning.observations.v1',
  'attentionos.execution.audit.v1',
  'attentionos.contextCaptures.v1',
] as const;

type PersistedStorageKey = (typeof PERSISTED_STORAGE_KEYS)[number];
type PersistenceBackend = 'native' | 'browser';

export interface PersistedAppState {
  readonly appVersion: string;
  readonly entries: Partial<Record<PersistedStorageKey, string>>;
  readonly exportedAt: string;
  readonly schemaVersion: typeof APP_STATE_SCHEMA_VERSION;
}

export interface PersistenceWriteResult {
  readonly backend: PersistenceBackend;
  readonly bytes: number;
  readonly path?: string;
  readonly writtenAtMs: number;
}

export interface PersistenceInitializationResult {
  readonly backend: PersistenceBackend;
  readonly recoveryIssue?: PersistenceRecoveryIssue;
  readonly restored: boolean;
  readonly snapshotFound: boolean;
}

export interface AppStateExportResult extends PersistenceWriteResult {
  readonly payload?: string;
}

export interface PersistenceRecoveryIssue {
  readonly backend: PersistenceBackend;
  readonly detectedAt: string;
  readonly message: string;
  readonly originalBytes: number;
  readonly quarantinePath?: string;
  readonly quarantined: boolean;
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

const JSON_ENTRY_KEYS = new Set<PersistedStorageKey>([
  'attentionos.hierarchy.v1',
  'attentionos.reflections.v1',
  'attentionos.onboarding.v1',
  'attentionos.ritualCopy.v1',
  'attentionos.ritualMeditationSettings.v1',
  'attentionos.ritualScheduleSettings.v1',
  'attentionos.privacySettings.v1',
  'attentionos.reminderSettings.v1',
  'attentionos.execution.taskRuntime.v1',
  'attentionos.ai.suggestions.v1',
  'attentionos.learning.observations.v1',
  'attentionos.execution.audit.v1',
  'attentionos.contextCaptures.v1',
]);

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown persistence error.';
}

function isPersistedStorageKey(key: string): key is PersistedStorageKey {
  return PERSISTED_STORAGE_KEYS.includes(key as PersistedStorageKey);
}

function validateSnapshotEntries(
  entries: Partial<Record<PersistedStorageKey, string>>,
): Partial<Record<PersistedStorageKey, string>> {
  for (const [key, value] of Object.entries(entries)) {
    if (!isPersistedStorageKey(key)) {
      throw new Error(`Backup includes an unknown storage entry: ${key}`);
    }

    if (typeof value !== 'string') {
      throw new Error(`Backup entry ${key} is not a string payload.`);
    }

    if (JSON_ENTRY_KEYS.has(key)) {
      JSON.parse(value);
    }

    if (key === 'attentionos.hierarchy.v1') {
      validateHierarchySnapshotPayload(value);
    }
  }

  return entries;
}

function parsePersistedAppState(payload: string): PersistedAppState {
  const parsed = JSON.parse(payload) as Partial<PersistedAppState>;

  if (parsed.schemaVersion !== APP_STATE_SCHEMA_VERSION) {
    throw new Error('Unsupported AttentionOS backup schema version.');
  }

  if (!parsed.entries || typeof parsed.entries !== 'object') {
    throw new Error('Backup is missing storage entries.');
  }

  return {
    appVersion: typeof parsed.appVersion === 'string' ? parsed.appVersion : 'unknown',
    entries: validateSnapshotEntries(
      parsed.entries as Partial<Record<PersistedStorageKey, string>>,
    ),
    exportedAt:
      typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
    schemaVersion: APP_STATE_SCHEMA_VERSION,
  };
}

function hasLocalApplicationState(): boolean {
  return PERSISTED_STORAGE_KEYS.some((key) => localStorage.getItem(key) !== null);
}

function browserWriteSnapshot(snapshot: string): PersistenceWriteResult {
  localStorage.setItem(APP_STATE_SNAPSHOT_STORAGE_KEY, snapshot);
  return {
    backend: 'browser',
    bytes: snapshot.length,
    writtenAtMs: Date.now(),
  };
}

function browserReadSnapshot(): string | null {
  return localStorage.getItem(APP_STATE_SNAPSHOT_STORAGE_KEY);
}

function browserRecordBackup(snapshot: string): PersistenceWriteResult {
  const raw = localStorage.getItem(APP_STATE_BACKUP_STORAGE_KEY);
  const backups = raw ? (JSON.parse(raw) as string[]) : [];
  localStorage.setItem(APP_STATE_BACKUP_STORAGE_KEY, JSON.stringify([...backups, snapshot]));

  return {
    backend: 'browser',
    bytes: snapshot.length,
    writtenAtMs: Date.now(),
  };
}

function browserRecordCorruptSnapshot(payload: string): PersistenceWriteResult {
  const raw = localStorage.getItem(APP_STATE_CORRUPT_BACKUP_STORAGE_KEY);
  const backups = raw ? (JSON.parse(raw) as string[]) : [];
  localStorage.setItem(APP_STATE_CORRUPT_BACKUP_STORAGE_KEY, JSON.stringify([...backups, payload]));
  localStorage.removeItem(APP_STATE_SNAPSHOT_STORAGE_KEY);

  return {
    backend: 'browser',
    bytes: payload.length,
    writtenAtMs: Date.now(),
  };
}

function savePersistenceRecoveryIssue(issue: PersistenceRecoveryIssue): PersistenceRecoveryIssue {
  localStorage.setItem(APP_STATE_RECOVERY_STORAGE_KEY, JSON.stringify(issue));
  return issue;
}

export function readPersistenceRecoveryIssue(): PersistenceRecoveryIssue | null {
  const raw = localStorage.getItem(APP_STATE_RECOVERY_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as PersistenceRecoveryIssue;
    return typeof parsed.message === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export function clearPersistenceRecoveryIssue(): void {
  localStorage.removeItem(APP_STATE_RECOVERY_STORAGE_KEY);
}

async function quarantineCorruptSnapshot(
  backend: PersistenceBackend,
  payload: string,
  error: unknown,
): Promise<PersistenceRecoveryIssue> {
  let result: PersistenceWriteResult | null = null;
  const message = errorMessage(error);

  if (backend === 'native' && isTauri()) {
    try {
      const nativeResult = await invoke<Omit<PersistenceWriteResult, 'backend'>>(
        'quarantine_app_state',
        {
          snapshot: payload,
        },
      );
      result = { ...nativeResult, backend: 'native' };
    } catch (quarantineError) {
      console.error('Native AttentionOS quarantine failed.', quarantineError);
    }
  }

  if (!result) {
    result = browserRecordCorruptSnapshot(payload);
  }

  return savePersistenceRecoveryIssue({
    backend,
    detectedAt: new Date().toISOString(),
    message,
    originalBytes: payload.length,
    quarantinePath: result.path,
    quarantined: Boolean(result),
  });
}

export function shouldWaitForNativePersistence(): boolean {
  return isTauri();
}

export function shouldWaitForBrowserPersistenceRestore(): boolean {
  return !isTauri() && Boolean(browserReadSnapshot()) && !hasLocalApplicationState();
}

export function shouldWaitForPersistenceRestore(): boolean {
  return shouldWaitForNativePersistence() || shouldWaitForBrowserPersistenceRestore();
}

export function createAppStateSnapshot(): PersistedAppState {
  const entries = PERSISTED_STORAGE_KEYS.reduce<Partial<Record<PersistedStorageKey, string>>>(
    (snapshotEntries, key) => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        snapshotEntries[key] = value;
      }
      return snapshotEntries;
    },
    {},
  );

  return {
    appVersion: APP_VERSION,
    entries,
    exportedAt: new Date().toISOString(),
    schemaVersion: APP_STATE_SCHEMA_VERSION,
  };
}

export function serializeAppStateSnapshot(): string {
  return JSON.stringify(createAppStateSnapshot(), null, 2);
}

export function restoreAppStateSnapshot(payload: string): PersistedAppState {
  const snapshot = parsePersistedAppState(payload);

  for (const key of PERSISTED_STORAGE_KEYS) {
    const value = snapshot.entries[key];
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  }

  localStorage.setItem(APP_STATE_SNAPSHOT_STORAGE_KEY, JSON.stringify(snapshot));
  return snapshot;
}

export async function persistCurrentAppState(): Promise<PersistenceWriteResult> {
  const snapshot = serializeAppStateSnapshot();

  if (isTauri()) {
    try {
      const result = await invoke<Omit<PersistenceWriteResult, 'backend'>>('write_app_state', {
        snapshot,
      });
      return { ...result, backend: 'native' };
    } catch (error) {
      console.error('Native AttentionOS persistence failed; using browser fallback.', error);
    }
  }

  return browserWriteSnapshot(snapshot);
}

export function queuePersistAppState(): void {
  if (persistTimer) {
    clearTimeout(persistTimer);
  }

  persistTimer = setTimeout(() => {
    persistTimer = null;
    void persistCurrentAppState();
  }, 0);
}

export async function initializeAppPersistence(): Promise<PersistenceInitializationResult> {
  let payload: string | null = null;
  let backend: PersistenceBackend = 'browser';
  let recoveryIssue: PersistenceRecoveryIssue | undefined;
  let restored = false;

  if (isTauri()) {
    try {
      payload = await invoke<string | null>('read_app_state');
      backend = 'native';
    } catch (error) {
      console.error('Native AttentionOS persistence read failed; using browser fallback.', error);
    }
  }

  if (!payload) {
    payload = browserReadSnapshot();
  }

  const snapshotFound = typeof payload === 'string' && payload.trim().length > 0;
  const shouldRestore = snapshotFound && !hasLocalApplicationState();

  if (payload && shouldRestore) {
    try {
      restoreAppStateSnapshot(payload);
      clearPersistenceRecoveryIssue();
      restored = true;
    } catch (error) {
      recoveryIssue = await quarantineCorruptSnapshot(backend, payload, error);
    }
  }

  await persistCurrentAppState();

  return {
    backend,
    recoveryIssue,
    restored,
    snapshotFound,
  };
}

export async function recordNativeQaReady(label: string): Promise<void> {
  if (!isTauri()) {
    return;
  }

  try {
    await invoke('record_qa_ready', { label });
  } catch (error) {
    console.error('Native AttentionOS QA readiness marker failed.', error);
  }
}

export async function createAppStateBackup(): Promise<PersistenceWriteResult> {
  const snapshot = serializeAppStateSnapshot();

  if (isTauri()) {
    try {
      const result = await invoke<Omit<PersistenceWriteResult, 'backend'>>('export_app_state', {
        snapshot,
      });
      return { ...result, backend: 'native' };
    } catch (error) {
      console.error('Native AttentionOS backup failed; using browser fallback.', error);
    }
  }

  return browserRecordBackup(snapshot);
}

export function exportAppStateAsDownload(): string {
  return serializeAppStateSnapshot();
}

export async function exportAppStateAsPortableFile(): Promise<AppStateExportResult> {
  const snapshot = serializeAppStateSnapshot();

  if (isTauri()) {
    try {
      const result = await invoke<Omit<PersistenceWriteResult, 'backend'>>(
        'save_app_state_export',
        {
          snapshot,
        },
      );
      return { ...result, backend: 'native' };
    } catch (error) {
      console.error('Native AttentionOS export failed; using browser fallback.', error);
    }
  }

  return {
    backend: 'browser',
    bytes: snapshot.length,
    payload: snapshot,
    writtenAtMs: Date.now(),
  };
}

export async function importAppStateFromPayload(payload: string): Promise<PersistedAppState> {
  const snapshot = restoreAppStateSnapshot(payload);
  await persistCurrentAppState();
  return snapshot;
}
