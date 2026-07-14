export const STORAGE_RECOVERY_ISSUES_STORAGE_KEY = 'attentionos.storageRecovery.issues.v1';
export const STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY = 'attentionos.storageRecovery.payloads.v1';
export const STORAGE_RECOVERY_UPDATED_EVENT = 'attentionos-storage-recovery-updated';

export interface StorageRecoveryIssue {
  readonly detectedAt: string;
  readonly fallback: string;
  readonly message: string;
  readonly originalBytes: number;
  readonly preserved: boolean;
  readonly storageKey: string;
}

interface RecordMalformedStorageEntryInput {
  readonly error: unknown;
  readonly fallback: string;
  readonly payload: string;
  readonly storageKey: string;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown local storage parse error.';
}

function parseIssueMap(raw: string | null): Record<string, StorageRecoveryIssue> {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => {
        const issue = value as Partial<StorageRecoveryIssue>;
        return typeof issue.storageKey === 'string' && typeof issue.message === 'string';
      }),
    ) as Record<string, StorageRecoveryIssue>;
  } catch {
    return {};
  }
}

function parsePayloadMap(raw: string | null): Record<string, string> {
  if (!raw) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => typeof value === 'string'),
    ) as Record<string, string>;
  } catch {
    return {};
  }
}

function notifyStorageRecoveryUpdated(): void {
  window.dispatchEvent(new Event(STORAGE_RECOVERY_UPDATED_EVENT));
}

export function readStorageRecoveryIssues(): StorageRecoveryIssue[] {
  return Object.values(parseIssueMap(localStorage.getItem(STORAGE_RECOVERY_ISSUES_STORAGE_KEY)))
    .filter((issue) => issue.preserved)
    .sort((left, right) => right.detectedAt.localeCompare(left.detectedAt));
}

export function clearStorageRecoveryIssue(storageKey: string): void {
  const issues = parseIssueMap(localStorage.getItem(STORAGE_RECOVERY_ISSUES_STORAGE_KEY));
  const payloads = parsePayloadMap(localStorage.getItem(STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY));

  delete issues[storageKey];
  delete payloads[storageKey];

  localStorage.setItem(STORAGE_RECOVERY_ISSUES_STORAGE_KEY, JSON.stringify(issues));
  localStorage.setItem(STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY, JSON.stringify(payloads));
  notifyStorageRecoveryUpdated();
}

export function clearAllStorageRecoveryIssues(): void {
  localStorage.removeItem(STORAGE_RECOVERY_ISSUES_STORAGE_KEY);
  localStorage.removeItem(STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY);
  notifyStorageRecoveryUpdated();
}

export function recordMalformedStorageEntry({
  error,
  fallback,
  payload,
  storageKey,
}: RecordMalformedStorageEntryInput): StorageRecoveryIssue {
  const issues = parseIssueMap(localStorage.getItem(STORAGE_RECOVERY_ISSUES_STORAGE_KEY));
  const payloads = parsePayloadMap(localStorage.getItem(STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY));
  const message = errorMessage(error);
  const existing = issues[storageKey];
  const detectedAt =
    existing?.originalBytes === payload.length && existing.message === message
      ? existing.detectedAt
      : new Date().toISOString();
  const issue: StorageRecoveryIssue = {
    detectedAt,
    fallback,
    message,
    originalBytes: payload.length,
    preserved: true,
    storageKey,
  };

  issues[storageKey] = issue;
  payloads[storageKey] = payload;
  localStorage.setItem(STORAGE_RECOVERY_ISSUES_STORAGE_KEY, JSON.stringify(issues));
  localStorage.setItem(STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY, JSON.stringify(payloads));
  notifyStorageRecoveryUpdated();

  return issue;
}
