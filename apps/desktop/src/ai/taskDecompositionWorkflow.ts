import type { TaskDecompositionSuggestion, V2AuditLogEntry, V2Entity } from '@attentionos/core';
import {
  markTaskDecompositionApplied,
  markTaskDecompositionRejected,
} from '../storage/aiSuggestions';
import {
  logAISuggestionApproved,
  logAISuggestionRejected,
  logAISuggestionRollback,
  logAISuggestionRollbackRestored,
  readExecutionAuditEntries,
} from '../storage/audit';
import {
  applyTaskDecompositionSuggestion,
  archiveAISuggestionCreatedTasks,
  restoreArchivedAISuggestionTasks,
} from '../storage/hierarchy';
import { validateTaskDecompositionSuggestion } from '../storage/taskValidation';

export { validateTaskDecompositionSuggestion } from '../storage/taskValidation';

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

interface RejectTaskDecompositionInput {
  readonly reviewer?: string;
  readonly suggestion: TaskDecompositionSuggestion;
  readonly task: V2Entity;
}

interface RejectTaskDecompositionResult {
  readonly auditEntry: V2AuditLogEntry;
  readonly rejectedSuggestion: TaskDecompositionSuggestion;
}

interface RollbackTaskDecompositionInput {
  readonly suggestion: TaskDecompositionSuggestion;
  readonly task: V2Entity;
}

interface RollbackTaskDecompositionResult {
  readonly archivedTasks: readonly V2Entity[];
  readonly auditEntry: V2AuditLogEntry;
  readonly skippedTaskIds: readonly string[];
}

interface RestoreTaskDecompositionRollbackInput {
  readonly suggestion: TaskDecompositionSuggestion;
  readonly task: V2Entity;
}

interface RestoreTaskDecompositionRollbackResult {
  readonly auditEntry: V2AuditLogEntry;
  readonly restoredTasks: readonly V2Entity[];
  readonly skippedTaskIds: readonly string[];
}

export interface TaskDecompositionRollbackState {
  readonly archivedTaskIds: readonly string[];
  readonly archivedTaskSnapshots: readonly V2Entity[];
  readonly rolledBack: boolean;
}

function assertTargetsTask(suggestion: TaskDecompositionSuggestion, task: V2Entity): void {
  if (suggestion.targetId !== task.id) {
    throw new Error(`Suggestion ${suggestion.id} does not target task ${task.id}`);
  }
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function isEntitySnapshot(value: unknown): value is V2Entity {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const snapshot = value as Partial<V2Entity>;
  return (
    typeof snapshot.id === 'string' &&
    snapshot.entityType === 'task' &&
    snapshot.hierarchyLayer === 'task' &&
    typeof snapshot.title === 'string' &&
    typeof snapshot.status === 'string' &&
    typeof snapshot.properties === 'object' &&
    snapshot.properties !== null &&
    typeof snapshot.createdAt === 'string' &&
    typeof snapshot.updatedAt === 'string'
  );
}

function entitySnapshots(value: unknown): V2Entity[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter(isEntitySnapshot);
}

function matchesSuggestionAudit(
  entry: V2AuditLogEntry,
  suggestion: TaskDecompositionSuggestion,
  task: V2Entity,
): boolean {
  return entry.details.suggestionId === suggestion.id && entry.targetId === task.id;
}

function findApprovalCreatedTaskIds(
  suggestion: TaskDecompositionSuggestion,
  task: V2Entity,
): string[] {
  const approval = [...readExecutionAuditEntries()]
    .reverse()
    .find(
      (entry) =>
        entry.action === 'ai.suggestion.approved' &&
        matchesSuggestionAudit(entry, suggestion, task),
    );

  return stringArray(approval?.details.createdTaskIds);
}

export function getTaskDecompositionRollbackState(
  suggestion: TaskDecompositionSuggestion,
  task: V2Entity,
): TaskDecompositionRollbackState {
  const rollbackEntries = readExecutionAuditEntries().filter(
    (entry) =>
      (entry.action === 'ai.suggestion.rollback' ||
        entry.action === 'ai.suggestion.rollback.restored') &&
      matchesSuggestionAudit(entry, suggestion, task),
  );
  const latestRollbackEntry = rollbackEntries[rollbackEntries.length - 1];

  if (latestRollbackEntry?.action !== 'ai.suggestion.rollback') {
    return {
      archivedTaskIds: [],
      archivedTaskSnapshots: [],
      rolledBack: false,
    };
  }

  return {
    archivedTaskIds: stringArray(latestRollbackEntry.details.archivedTaskIds),
    archivedTaskSnapshots: entitySnapshots(latestRollbackEntry.details.archivedTaskSnapshots),
    rolledBack: true,
  };
}

export function approveTaskDecompositionSuggestion({
  reviewer = 'user',
  suggestion,
  task,
}: ApproveTaskDecompositionInput): ApproveTaskDecompositionResult {
  assertTargetsTask(suggestion, task);

  if (suggestion.status !== 'pending') {
    throw new Error(`Suggestion ${suggestion.id} is not pending`);
  }

  const validationErrors = validateTaskDecompositionSuggestion(suggestion);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
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

export function rejectTaskDecompositionSuggestion({
  reviewer = 'user',
  suggestion,
  task,
}: RejectTaskDecompositionInput): RejectTaskDecompositionResult {
  assertTargetsTask(suggestion, task);

  if (suggestion.status !== 'pending') {
    throw new Error(`Suggestion ${suggestion.id} is not pending`);
  }

  const rejectedSuggestion = markTaskDecompositionRejected(suggestion, reviewer);
  const auditEntry = logAISuggestionRejected({
    suggestionId: suggestion.id,
    targetId: task.id,
  });

  return { auditEntry, rejectedSuggestion };
}

export function rollbackTaskDecompositionSuggestion({
  suggestion,
  task,
}: RollbackTaskDecompositionInput): RollbackTaskDecompositionResult {
  assertTargetsTask(suggestion, task);

  if (suggestion.status !== 'applied') {
    throw new Error(`Suggestion ${suggestion.id} has not been applied`);
  }

  if (getTaskDecompositionRollbackState(suggestion, task).rolledBack) {
    throw new Error(`Suggestion ${suggestion.id} has already been rolled back`);
  }

  const createdTaskIds = findApprovalCreatedTaskIds(suggestion, task);
  if (createdTaskIds.length === 0) {
    throw new Error(`Suggestion ${suggestion.id} has no audited created tasks`);
  }

  const { archivedTasks, skippedTaskIds } = archiveAISuggestionCreatedTasks({
    suggestionId: suggestion.id,
    taskIds: createdTaskIds,
  });

  if (archivedTasks.length === 0) {
    throw new Error('No active AI-created tasks are available to rollback.');
  }

  const auditEntry = logAISuggestionRollback({
    archivedTaskIds: archivedTasks.map((archivedTask) => archivedTask.id),
    archivedTaskSnapshots: archivedTasks,
    skippedTaskIds,
    suggestionId: suggestion.id,
    targetId: task.id,
  });

  return { archivedTasks, auditEntry, skippedTaskIds };
}

export function restoreTaskDecompositionRollback({
  suggestion,
  task,
}: RestoreTaskDecompositionRollbackInput): RestoreTaskDecompositionRollbackResult {
  assertTargetsTask(suggestion, task);

  if (suggestion.status !== 'applied') {
    throw new Error(`Suggestion ${suggestion.id} has not been applied`);
  }

  const rollbackState = getTaskDecompositionRollbackState(suggestion, task);
  if (!rollbackState.rolledBack) {
    throw new Error(`Suggestion ${suggestion.id} has no active rollback to restore`);
  }

  const { restoredTasks, skippedTaskIds } = restoreArchivedAISuggestionTasks({
    suggestionId: suggestion.id,
    taskSnapshots: rollbackState.archivedTaskSnapshots,
  });

  if (restoredTasks.length === 0) {
    throw new Error('No archived AI-created tasks are available to restore.');
  }

  const auditEntry = logAISuggestionRollbackRestored({
    restoredTaskIds: restoredTasks.map((restoredTask) => restoredTask.id),
    skippedTaskIds,
    suggestionId: suggestion.id,
    targetId: task.id,
  });

  return { auditEntry, restoredTasks, skippedTaskIds };
}
