import {
  type AttentionState,
  analyzeBehaviorPatterns,
  type BehaviorPatternReport,
  createWorkflowOptimizationSuggestions,
  estimateAttentionState,
  type PassiveForegroundCategory,
  suggestProbeCadence,
  type V2AttentionObservationRecord,
  type WorkflowOptimizationSuggestion,
} from '@attentionos/guidance';
import { readAISuggestions, saveWorkflowOptimizationSuggestion } from './aiSuggestions';
import { readExecutionAuditEntries } from './audit';
import { readHierarchyEntities } from './hierarchy';
import { queuePersistAppState } from './persistence';
import { recordMalformedStorageEntry } from './storageRecovery';

export const LEARNING_OBSERVATIONS_STORAGE_KEY = 'attentionos.learning.observations.v1';

export interface AttentionCalibrationInput {
  readonly appSwitchesLast15Min: number;
  readonly clarity: number;
  readonly correctedState?: AttentionState;
  readonly distractibility: number;
  readonly energy: number;
  readonly foregroundCategory: PassiveForegroundCategory;
  readonly fragmentedSessionCount: number;
  readonly inhibitionErrorRate: number;
  readonly reactionTimeMs: number;
  readonly selfReportedDifficulty?: number;
  readonly stress?: number;
  readonly trialCount: number;
}

export interface AttentionCalibrationResult {
  readonly correctedFrom?: AttentionState;
  readonly observation: V2AttentionObservationRecord;
  readonly probeCadence: ReturnType<typeof suggestProbeCadence>;
}

const DEFAULT_WINDOW = {
  endedAt: '2026-12-31T23:59:59.999Z',
  startedAt: '2026-01-01T00:00:00.000Z',
};

const DEFAULT_ATTENTION_OBSERVATIONS: readonly V2AttentionObservationRecord[] = [
  {
    id: 'obs-focus-default',
    state: 'focused',
    score: 0.82,
    confidence: 0.88,
    breakdown: {
      behavioralScore: 0.82,
      passiveScore: 0.78,
      subjectiveScore: 0.86,
    },
    reasons: ['completed a bounded task block'],
    observedAt: '2026-05-09T08:30:00.000Z',
  },
  {
    id: 'obs-overload-default',
    state: 'overloaded',
    score: 0.36,
    confidence: 0.84,
    breakdown: {
      behavioralScore: 0.34,
      passiveScore: 0.4,
      subjectiveScore: 0.34,
    },
    reasons: ['rapid context switching'],
    observedAt: '2026-05-09T10:30:00.000Z',
  },
];

function parseObservations(raw: string | null): V2AttentionObservationRecord[] | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }

    recordMalformedStorageEntry({
      error: new Error('Learning observations are not an array.'),
      fallback: 'Using default attention observations until reviewed.',
      payload: raw,
      storageKey: LEARNING_OBSERVATIONS_STORAGE_KEY,
    });
    return null;
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Using default attention observations until reviewed.',
      payload: raw,
      storageKey: LEARNING_OBSERVATIONS_STORAGE_KEY,
    });
    return null;
  }
}

function createObservationId(): string {
  if (globalThis.crypto && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `obs-${Date.now().toString(36)}`;
}

function clampUnit(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(1, Math.max(0, value));
}

function correctedScore(state: AttentionState, estimatedScore: number): number {
  switch (state) {
    case 'focused':
      return Math.max(estimatedScore, 0.75);
    case 'drifting':
      return 0.55;
    case 'overloaded':
      return 0.42;
    case 'fatigued':
      return 0.28;
  }
}

export function readLearningObservations(): V2AttentionObservationRecord[] {
  const parsed = parseObservations(localStorage.getItem(LEARNING_OBSERVATIONS_STORAGE_KEY));
  if (parsed) return parsed;

  const defaults = [...DEFAULT_ATTENTION_OBSERVATIONS];
  localStorage.setItem(LEARNING_OBSERVATIONS_STORAGE_KEY, JSON.stringify(defaults));
  queuePersistAppState();
  return defaults;
}

export function getLatestAttentionObservation(): V2AttentionObservationRecord | null {
  return (
    [...readLearningObservations()].sort(
      (left, right) => Date.parse(right.observedAt) - Date.parse(left.observedAt),
    )[0] ?? null
  );
}

export function recordAttentionCalibration(
  input: AttentionCalibrationInput,
): AttentionCalibrationResult {
  const now = new Date();
  const timestamp = now.toISOString();
  const estimate = estimateAttentionState({
    now,
    observation: {
      id: createObservationId(),
      passive: {
        appSwitchesLast15Min: Math.max(0, input.appSwitchesLast15Min),
        foregroundCategory: input.foregroundCategory,
        fragmentedSessionCount: Math.max(0, input.fragmentedSessionCount),
        hourOfDay: now.getHours(),
        timestamp,
      },
      source: 'cli',
      subjective: {
        clarity: input.clarity,
        distractibility: input.distractibility,
        energy: input.energy,
        stress: input.stress,
      },
      timestamp,
    },
    probe: {
      id: createObservationId(),
      inhibitionErrorRate: clampUnit(input.inhibitionErrorRate),
      reactionTimeMs: Math.max(0, input.reactionTimeMs),
      selfReportedDifficulty: input.selfReportedDifficulty,
      timestamp,
      trialCount: Math.max(1, input.trialCount),
    },
  });

  const correctedFrom =
    input.correctedState && input.correctedState !== estimate.state ? estimate.state : undefined;
  const state = input.correctedState ?? estimate.state;
  const reasons = [...estimate.reasons];
  if (correctedFrom) {
    reasons.push(`User corrected estimate from ${correctedFrom} to ${state}.`);
  } else if (input.correctedState) {
    reasons.push(`User confirmed ${state} estimate.`);
  }

  const observation: V2AttentionObservationRecord = {
    id: createObservationId(),
    breakdown: estimate.breakdown,
    confidence: correctedFrom ? Math.min(estimate.confidence, 0.72) : estimate.confidence,
    observedAt: timestamp,
    reasons,
    score: input.correctedState ? correctedScore(state, estimate.score) : estimate.score,
    state,
  };

  localStorage.setItem(
    LEARNING_OBSERVATIONS_STORAGE_KEY,
    JSON.stringify([...readLearningObservations(), observation]),
  );
  queuePersistAppState();

  return {
    correctedFrom,
    observation,
    probeCadence: suggestProbeCadence(state),
  };
}

export interface LearningSnapshot {
  readonly pendingOptimizationCount: number;
  readonly report: BehaviorPatternReport;
}

export function getLearningSnapshot(): LearningSnapshot {
  const report = analyzeBehaviorPatterns({
    attention: readLearningObservations(),
    suggestions: readAISuggestions(),
    window: DEFAULT_WINDOW,
    workflow: {
      auditEntries: readExecutionAuditEntries(),
      entities: readHierarchyEntities(),
    },
  });

  return {
    pendingOptimizationCount: readAISuggestions().filter(
      (suggestion) =>
        suggestion.kind === 'workflow_optimization' && suggestion.status === 'pending',
    ).length,
    report,
  };
}

function createSuggestionId(): string {
  if (globalThis.crypto && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `workflow-opt-${Date.now().toString(36)}`;
}

export function generateWorkflowOptimizationSuggestion(): WorkflowOptimizationSuggestion | null {
  const snapshot = getLearningSnapshot();
  const candidate = createWorkflowOptimizationSuggestions(snapshot.report)[0];
  if (!candidate) return null;

  const now = new Date().toISOString();
  return saveWorkflowOptimizationSuggestion({
    ...candidate,
    createdAt: now,
    id: createSuggestionId(),
    updatedAt: now,
  });
}
