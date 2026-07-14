import { queuePersistAppState } from './persistence';
import { recordMalformedStorageEntry } from './storageRecovery';

export const CONTEXT_CAPTURE_STORAGE_KEY = 'attentionos.contextCaptures.v1';

export type ContextCaptureChannel = 'idea' | 'task' | 'project' | 'calendar';

export interface ContextCaptureRecord {
  readonly calendarIntentAt?: string;
  readonly channels: readonly ContextCaptureChannel[];
  readonly content: string;
  readonly createdAt: string;
  readonly id: string;
}

export interface SaveContextCaptureInput {
  readonly calendarIntentAt?: string;
  readonly channels: readonly ContextCaptureChannel[];
  readonly content: string;
}

const CHANNELS: readonly ContextCaptureChannel[] = ['idea', 'task', 'project', 'calendar'];

function createCaptureId(): string {
  if (globalThis.crypto && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `context-capture-${Date.now().toString(36)}`;
}

function normalizeChannels(channels: readonly ContextCaptureChannel[]): ContextCaptureChannel[] {
  return [...new Set(channels)].filter((channel): channel is ContextCaptureChannel =>
    CHANNELS.includes(channel),
  );
}

function parseCaptures(raw: string | null): ContextCaptureRecord[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is ContextCaptureRecord => {
        return (
          item &&
          typeof item === 'object' &&
          typeof item.id === 'string' &&
          typeof item.content === 'string' &&
          Array.isArray(item.channels)
        );
      });
    }

    recordMalformedStorageEntry({
      error: new Error('Context captures are not an array.'),
      fallback: 'Hiding malformed context captures until the payload is reviewed.',
      payload: raw,
      storageKey: CONTEXT_CAPTURE_STORAGE_KEY,
    });
    return [];
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Hiding malformed context captures until the payload is reviewed.',
      payload: raw,
      storageKey: CONTEXT_CAPTURE_STORAGE_KEY,
    });
    return [];
  }
}

export function readContextCaptures(): ContextCaptureRecord[] {
  return parseCaptures(localStorage.getItem(CONTEXT_CAPTURE_STORAGE_KEY)).sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export function listContextCapturePlanningInputs(): ContextCaptureRecord[] {
  return readContextCaptures().filter((capture) =>
    capture.channels.some((channel) => channel === 'task' || channel === 'project'),
  );
}

export function saveContextCapture(input: SaveContextCaptureInput): ContextCaptureRecord {
  const content = input.content.trim();
  const channels = normalizeChannels(input.channels);

  if (!content) {
    throw new Error('Capture text is required.');
  }

  if (channels.length === 0) {
    throw new Error('Choose at least one capture channel.');
  }

  const record: ContextCaptureRecord = {
    ...(input.calendarIntentAt?.trim() ? { calendarIntentAt: input.calendarIntentAt.trim() } : {}),
    channels,
    content,
    createdAt: new Date().toISOString(),
    id: createCaptureId(),
  };

  localStorage.setItem(
    CONTEXT_CAPTURE_STORAGE_KEY,
    JSON.stringify([record, ...readContextCaptures()]),
  );
  queuePersistAppState();

  return record;
}
