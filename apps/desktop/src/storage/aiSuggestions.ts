import type { TaskDecompositionSuggestion } from '@attentionos/core';

export const AI_SUGGESTIONS_STORAGE_KEY = 'attentionos.ai.suggestions.v1';

function parseSuggestions(raw: string | null): TaskDecompositionSuggestion[] {
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

export function readAISuggestions(): TaskDecompositionSuggestion[] {
  return parseSuggestions(localStorage.getItem(AI_SUGGESTIONS_STORAGE_KEY));
}

function suggestionTimestamp(suggestion: TaskDecompositionSuggestion): number {
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
      .sort((left, right) => suggestionTimestamp(right) - suggestionTimestamp(left))[0] ?? null
  );
}

export function saveTaskDecompositionSuggestion(
  suggestion: TaskDecompositionSuggestion,
): TaskDecompositionSuggestion {
  const suggestions = readAISuggestions();
  const nextSuggestions = suggestions.some((item) => item.id === suggestion.id)
    ? suggestions.map((item) => (item.id === suggestion.id ? suggestion : item))
    : [...suggestions, suggestion];

  localStorage.setItem(AI_SUGGESTIONS_STORAGE_KEY, JSON.stringify(nextSuggestions));
  return suggestion;
}

export function markTaskDecompositionApplied(
  suggestion: TaskDecompositionSuggestion,
  reviewer = 'user',
): TaskDecompositionSuggestion {
  const now = new Date().toISOString();
  return saveTaskDecompositionSuggestion({
    ...suggestion,
    status: 'applied',
    reviewedBy: reviewer,
    reviewedAt: now,
    updatedAt: now,
  });
}
