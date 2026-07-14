import type { V2Entity } from '@attentionos/core';
import { queuePersistAppState } from './persistence';

export const REFLECTION_STORAGE_KEY = 'attentionos.reflections.v1';
export const REFLECTION_CORRUPT_STORAGE_KEY = 'attentionos.reflections.corrupt.v1';
export const REFLECTION_RECOVERY_STORAGE_KEY = 'attentionos.reflections.recovery.v1';

export type RitualFollowUpTarget = 'project' | 'task';
export type RitualInputKind = 'dedication' | 'reflection';

export interface ReflectionRecoveryIssue {
  readonly detectedAt: string;
  readonly message: string;
  readonly originalBytes: number;
  readonly quarantined: boolean;
}

export interface SaveReflectionOptions {
  readonly followUpTargets?: readonly RitualFollowUpTarget[];
}

function createReflectionId(): string {
  if (globalThis.crypto && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `reflection-${Date.now().toString(36)}`;
}

export function readReflections(): V2Entity[] {
  const raw = localStorage.getItem(REFLECTION_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    quarantineMalformedReflectionStorage(raw, error);
    return [];
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Unknown reflection storage error.';
}

function quarantineMalformedReflectionStorage(
  payload: string,
  error: unknown,
): ReflectionRecoveryIssue {
  const rawCorruptBackups = localStorage.getItem(REFLECTION_CORRUPT_STORAGE_KEY);
  let corruptBackups: string[] = [];
  try {
    corruptBackups = rawCorruptBackups ? (JSON.parse(rawCorruptBackups) as string[]) : [];
  } catch {
    corruptBackups = [];
  }
  const issue: ReflectionRecoveryIssue = {
    detectedAt: new Date().toISOString(),
    message: errorMessage(error),
    originalBytes: payload.length,
    quarantined: true,
  };

  localStorage.setItem(
    REFLECTION_CORRUPT_STORAGE_KEY,
    JSON.stringify([...corruptBackups, payload]),
  );
  localStorage.setItem(REFLECTION_RECOVERY_STORAGE_KEY, JSON.stringify(issue));
  localStorage.removeItem(REFLECTION_STORAGE_KEY);
  queuePersistAppState();

  return issue;
}

export function readReflectionRecoveryIssue(): ReflectionRecoveryIssue | null {
  const raw = localStorage.getItem(REFLECTION_RECOVERY_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as ReflectionRecoveryIssue;
    return typeof parsed.message === 'string' ? parsed : null;
  } catch {
    return null;
  }
}

export function clearReflectionRecoveryIssue(): void {
  localStorage.removeItem(REFLECTION_RECOVERY_STORAGE_KEY);
}

function normalizeFollowUpTargets(
  targets: readonly RitualFollowUpTarget[] | undefined,
): RitualFollowUpTarget[] {
  return [...new Set(targets ?? [])].filter(
    (target): target is RitualFollowUpTarget => target === 'project' || target === 'task',
  );
}

export function getRitualFollowUpTargets(reflection: V2Entity): RitualFollowUpTarget[] {
  const targets = reflection.properties.ritualFollowUpTargets;

  if (!Array.isArray(targets)) {
    return [];
  }

  return normalizeFollowUpTargets(targets as RitualFollowUpTarget[]);
}

export function listRitualFollowUpInputs(): V2Entity[] {
  return readReflections().filter((reflection) => getRitualFollowUpTargets(reflection).length > 0);
}

function saveRitualInput(
  text: string,
  kind: RitualInputKind,
  options: SaveReflectionOptions = {},
): V2Entity {
  const content = text.trim();
  const followUpTargets = normalizeFollowUpTargets(options.followUpTargets);

  if (!content) {
    throw new Error('Reflection text is required');
  }

  const now = new Date().toISOString();
  const reflection: V2Entity = {
    id: createReflectionId(),
    entityType: 'reflection',
    title: kind === 'dedication' ? 'Ritual dedication' : 'Ritual reflection',
    content,
    status: 'completed',
    properties: {
      ...(followUpTargets.length > 0 ? { ritualFollowUpTargets: followUpTargets } : {}),
      ritualInputKind: kind,
      source: 'ritual',
    },
    workflowStage: 'ritual',
    createdAt: now,
    updatedAt: now,
    completedAt: now,
  };

  localStorage.setItem(REFLECTION_STORAGE_KEY, JSON.stringify([...readReflections(), reflection]));
  queuePersistAppState();
  return reflection;
}

export function saveReflection(text: string, options: SaveReflectionOptions = {}): V2Entity {
  return saveRitualInput(text, 'reflection', options);
}

export function saveDedicationInput(text: string, options: SaveReflectionOptions = {}): V2Entity {
  return saveRitualInput(text, 'dedication', options);
}
