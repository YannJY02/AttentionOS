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

export function findTaskDecompositionSuggestion(
  targetId: string,
): TaskDecompositionSuggestion | null {
  return (
    readAISuggestions().find(
      (suggestion) => suggestion.targetId === targetId && suggestion.kind === 'task_decomposition',
    ) ?? null
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
): TaskDecompositionSuggestion {
  return saveTaskDecompositionSuggestion({
    ...suggestion,
    status: 'applied',
    reviewedBy: 'user',
    reviewedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });
}
