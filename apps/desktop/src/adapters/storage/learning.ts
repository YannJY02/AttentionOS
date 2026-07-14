import {
  type AttentionState,
  analyzeBehaviorPatterns,
  type BehaviorPatternReport,
  createWorkflowOptimizationSuggestions,
  estimateAttentionState,
  type ReportedForegroundCategory,
  suggestCalibrationCadence,
  type V2AttentionObservationRecord,
  type WorkflowOptimizationSuggestion,
} from '@attentionos/guidance';
import { readAISuggestions, saveWorkflowOptimizationSuggestion } from './aiSuggestions';
import { readExecutionAuditEntries } from './audit';
import { readUserHierarchyEntities } from './hierarchy';
import { queuePersistAppState } from './persistence';
import { recordMalformedStorageEntry } from './storageRecovery';

export const LEARNING_OBSERVATIONS_STORAGE_KEY = 'attentionos.learning.observations.v1';

export interface AttentionCalibrationInput {
  readonly appSwitchesLast15Min: number;
  readonly clarity: number;
  readonly correctedState?: AttentionState;
  readonly distractibility: number;
  readonly energy: number;
  readonly foregroundCategory: ReportedForegroundCategory;
  readonly fragmentedSessionCount: number;
  readonly inhibitionErrorRate: number;
  readonly reactionTimeMs: number;
}

export interface AttentionCalibrationResult {
  readonly correctedFrom?: AttentionState;
  readonly observation: V2AttentionObservationRecord;
  readonly calibrationCadence: ReturnType<typeof suggestCalibrationCadence>;
}

const DEFAULT_WINDOW = {
  endedAt: '2026-12-31T23:59:59.999Z',
  startedAt: '2026-01-01T00:00:00.000Z',
};

const LEGACY_SYNTHETIC_OBSERVATION_IDS = new Set(['obs-focus-default', 'obs-overload-default']);

interface ParsedObservations {
  readonly changed: boolean;
  readonly observations: readonly V2AttentionObservationRecord[];
}

interface LegacyStoredAttentionObservation
  extends Omit<V2AttentionObservationRecord, 'breakdown' | 'source'> {
  readonly source?: V2AttentionObservationRecord['source'];
  readonly breakdown: {
    readonly behavioralScore?: number;
    readonly passiveScore?: number;
    readonly reportedBehaviorScore?: number;
    readonly reportedPerformanceScore?: number;
    readonly subjectiveScore: number;
  };
}

function normalizeStoredObservation(
  observation: LegacyStoredAttentionObservation,
): V2AttentionObservationRecord | null {
  if (LEGACY_SYNTHETIC_OBSERVATION_IDS.has(observation.id)) {
    return null;
  }

  const {
    behavioralScore,
    passiveScore,
    reportedBehaviorScore,
    reportedPerformanceScore,
    ...breakdown
  } = observation.breakdown;
  return {
    ...observation,
    breakdown: {
      ...breakdown,
      reportedBehaviorScore: reportedBehaviorScore ?? passiveScore ?? 0.5,
      reportedPerformanceScore: reportedPerformanceScore ?? behavioralScore ?? 0.5,
    },
    source: observation.source ?? 'legacy_manual_calibration',
  };
}

function parseObservations(raw: string | null): ParsedObservations | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      const observations = (parsed as LegacyStoredAttentionObservation[])
        .map(normalizeStoredObservation)
        .filter((observation): observation is V2AttentionObservationRecord => observation !== null);

      return {
        changed: JSON.stringify(observations) !== raw,
        observations,
      };
    }

    recordMalformedStorageEntry({
      error: new Error('Learning observations are not an array.'),
      fallback: 'Ignoring attention outcomes until a manual calibration is recorded.',
      payload: raw,
      storageKey: LEARNING_OBSERVATIONS_STORAGE_KEY,
    });
    return null;
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Ignoring attention outcomes until a manual calibration is recorded.',
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
  const raw = localStorage.getItem(LEARNING_OBSERVATIONS_STORAGE_KEY);
  if (!raw) return [];

  const parsed = parseObservations(raw);
  if (!parsed) {
    localStorage.removeItem(LEARNING_OBSERVATIONS_STORAGE_KEY);
    queuePersistAppState();
    return [];
  }

  if (parsed.changed) {
    if (parsed.observations.length > 0) {
      localStorage.setItem(LEARNING_OBSERVATIONS_STORAGE_KEY, JSON.stringify(parsed.observations));
    } else {
      localStorage.removeItem(LEARNING_OBSERVATIONS_STORAGE_KEY);
    }
    queuePersistAppState();
  }

  return [...parsed.observations];
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
      reportedBehavior: {
        appSwitchesLast15Min: Math.max(0, input.appSwitchesLast15Min),
        foregroundCategory: input.foregroundCategory,
        fragmentedSessionCount: Math.max(0, input.fragmentedSessionCount),
        hourOfDay: now.getHours(),
        timestamp,
      },
      source: 'manual',
      subjective: {
        clarity: input.clarity,
        distractibility: input.distractibility,
        energy: input.energy,
      },
      timestamp,
    },
    reportedPerformance: {
      inhibitionErrorRate: clampUnit(input.inhibitionErrorRate),
      reactionTimeMs: Math.max(0, input.reactionTimeMs),
      timestamp,
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
    source: 'manual_calibration',
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
    calibrationCadence: suggestCalibrationCadence(state),
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
      entities: readUserHierarchyEntities(),
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
