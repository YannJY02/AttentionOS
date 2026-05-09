import type { TaskDecompositionSuggestion, V2AuditLogEntry, V2Entity } from '@attentionos/core';
import { markTaskDecompositionApplied } from '../storage/aiSuggestions';
import { logAISuggestionApproved } from '../storage/audit';
import { applyTaskDecompositionSuggestion } from '../storage/hierarchy';

interface ApproveTaskDecompositionInput {
  readonly reviewer?: string;
  readonly suggestion: TaskDecompositionSuggestion;
  readonly task: V2Entity;
}

interface ApproveTaskDecompositionResult {
  readonly appliedSuggestion: TaskDecompositionSuggestion;
  readonly auditEntry: V2AuditLogEntry;
  readonly createdTasks: readonly V2Entity[];
}

export function approveTaskDecompositionSuggestion({
  reviewer = 'user',
  suggestion,
  task,
}: ApproveTaskDecompositionInput): ApproveTaskDecompositionResult {
  if (suggestion.targetId !== task.id) {
    throw new Error(`Suggestion ${suggestion.id} does not target task ${task.id}`);
  }

  if (suggestion.status !== 'pending') {
    throw new Error(`Suggestion ${suggestion.id} is not pending`);
  }

  const createdTasks = applyTaskDecompositionSuggestion(task, suggestion);
  const appliedSuggestion = markTaskDecompositionApplied(suggestion, reviewer);
  const auditEntry = logAISuggestionApproved({
    createdTaskIds: createdTasks.map((createdTask) => createdTask.id),
    stepCount: createdTasks.length,
    suggestionId: suggestion.id,
    targetId: task.id,
  });

  return { appliedSuggestion, auditEntry, createdTasks };
}
