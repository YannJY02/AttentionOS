import type { AISuggestion, TaskDecompositionSuggestion } from '@attentionos/core';
import type { WorkflowOptimizationSuggestion } from '@attentionos/guidance';
import type { V2WorkflowStage } from '@attentionos/workflow';
import { queuePersistAppState } from './persistence';
import { recordMalformedStorageEntry } from './storageRecovery';

export const AI_SUGGESTIONS_STORAGE_KEY = 'attentionos.ai.suggestions.v1';

type StoredAISuggestion = AISuggestion<object>;

function parseSuggestions(raw: string | null): StoredAISuggestion[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }

    recordMalformedStorageEntry({
      error: new Error('AI suggestions are not an array.'),
      fallback: 'Hiding malformed suggestions until the payload is reviewed.',
      payload: raw,
      storageKey: AI_SUGGESTIONS_STORAGE_KEY,
    });
    return [];
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Hiding malformed suggestions until the payload is reviewed.',
      payload: raw,
      storageKey: AI_SUGGESTIONS_STORAGE_KEY,
    });
    return [];
  }
}

export function readAISuggestions(): StoredAISuggestion[] {
  return parseSuggestions(localStorage.getItem(AI_SUGGESTIONS_STORAGE_KEY));
}

function suggestionTimestamp(suggestion: StoredAISuggestion): number {
  const updatedAt = Date.parse(suggestion.updatedAt);
  if (Number.isFinite(updatedAt)) {
    return updatedAt;
  }

  const createdAt = Date.parse(suggestion.createdAt);
  return Number.isFinite(createdAt) ? createdAt : 0;
}

export function findTaskDecompositionSuggestion(
  targetId: string,
): TaskDecompositionSuggestion | null {
  return (
    readAISuggestions()
      .filter(
        (suggestion) =>
          suggestion.targetId === targetId && suggestion.kind === 'task_decomposition',
      )
      .map((suggestion) => suggestion as unknown as TaskDecompositionSuggestion)
      .sort((left, right) => suggestionTimestamp(right) - suggestionTimestamp(left))[0] ?? null
  );
}

export function saveAISuggestion<TSuggestion extends StoredAISuggestion>(
  suggestion: TSuggestion,
): TSuggestion {
  const suggestions = readAISuggestions();
  const nextSuggestions = suggestions.some((item) => item.id === suggestion.id)
    ? suggestions.map((item) => (item.id === suggestion.id ? suggestion : item))
    : [...suggestions, suggestion];

  localStorage.setItem(AI_SUGGESTIONS_STORAGE_KEY, JSON.stringify(nextSuggestions));
  queuePersistAppState();
  return suggestion;
}

export function saveTaskDecompositionSuggestion(
  suggestion: TaskDecompositionSuggestion,
): TaskDecompositionSuggestion {
  return saveAISuggestion(suggestion);
}

export function markTaskDecompositionApplied(
  suggestion: TaskDecompositionSuggestion,
  reviewer = 'user',
): TaskDecompositionSuggestion {
  const now = new Date().toISOString();
  return saveAISuggestion({
    ...suggestion,
    status: 'applied',
    reviewedBy: reviewer,
    reviewedAt: now,
    updatedAt: now,
  });
}

export function markTaskDecompositionRejected(
  suggestion: TaskDecompositionSuggestion,
  reviewer = 'user',
): TaskDecompositionSuggestion {
  const now = new Date().toISOString();
  return saveAISuggestion({
    ...suggestion,
    status: 'rejected',
    reviewedBy: reviewer,
    reviewedAt: now,
    updatedAt: now,
  });
}

export function findWorkflowOptimizationSuggestions(
  targetStage?: V2WorkflowStage,
): WorkflowOptimizationSuggestion[] {
  return readAISuggestions()
    .filter((suggestion) => {
      if (suggestion.kind !== 'workflow_optimization') {
        return false;
      }

      if (!targetStage) {
        return true;
      }

      return (
        (suggestion as unknown as WorkflowOptimizationSuggestion).payload.targetStage ===
        targetStage
      );
    })
    .map((suggestion) => suggestion as unknown as WorkflowOptimizationSuggestion)
    .sort((left, right) => suggestionTimestamp(right) - suggestionTimestamp(left));
}

export function saveWorkflowOptimizationSuggestion(
  suggestion: WorkflowOptimizationSuggestion,
): WorkflowOptimizationSuggestion {
  return saveAISuggestion(suggestion);
}

export function markWorkflowOptimizationReviewed(
  suggestion: WorkflowOptimizationSuggestion,
  status: 'approved' | 'rejected',
  reviewer = 'user',
): WorkflowOptimizationSuggestion {
  const now = new Date().toISOString();
  return saveAISuggestion({
    ...suggestion,
    status,
    reviewedBy: reviewer,
    reviewedAt: now,
    updatedAt: now,
  });
}
