import type {
  AISuggestion,
  TaskDecompositionSuggestion,
  WorkflowOptimizationSuggestion,
} from '@attentionos/core';

export const AI_SUGGESTIONS_STORAGE_KEY = 'attentionos.ai.suggestions.v1';

type StoredAISuggestion = AISuggestion<object>;

function parseSuggestions(raw: string | null): StoredAISuggestion[] {
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
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

export function findWorkflowOptimizationSuggestions(): WorkflowOptimizationSuggestion[] {
  return readAISuggestions()
    .filter((suggestion) => suggestion.kind === 'workflow_optimization')
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
