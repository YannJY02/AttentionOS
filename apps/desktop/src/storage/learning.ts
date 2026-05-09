import {
  analyzeBehaviorPatterns,
  createWorkflowOptimizationSuggestions,
} from '@attentionos/ai/src/browser';
import type {
  BehaviorPatternReport,
  V2AttentionObservationRecord,
  WorkflowOptimizationSuggestion,
} from '@attentionos/core';
import { readAISuggestions, saveWorkflowOptimizationSuggestion } from './aiSuggestions';
import { readExecutionAuditEntries } from './audit';
import { readHierarchyEntities } from './hierarchy';

export const LEARNING_OBSERVATIONS_STORAGE_KEY = 'attentionos.learning.observations.v1';

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
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readLearningObservations(): V2AttentionObservationRecord[] {
  const parsed = parseObservations(localStorage.getItem(LEARNING_OBSERVATIONS_STORAGE_KEY));
  if (parsed) return parsed;

  const defaults = [...DEFAULT_ATTENTION_OBSERVATIONS];
  localStorage.setItem(LEARNING_OBSERVATIONS_STORAGE_KEY, JSON.stringify(defaults));
  return defaults;
}

export interface LearningSnapshot {
  readonly pendingOptimizationCount: number;
  readonly report: BehaviorPatternReport;
}

export function getLearningSnapshot(): LearningSnapshot {
  const report = analyzeBehaviorPatterns({
    attention: readLearningObservations(),
    audit: readExecutionAuditEntries(),
    suggestions: readAISuggestions(),
    tasks: readHierarchyEntities(),
    window: DEFAULT_WINDOW,
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
