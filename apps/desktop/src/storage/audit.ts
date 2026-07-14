import type { V2AuditLogEntry } from '@attentionos/workflow';
import { queuePersistAppState } from './persistence';
import { recordMalformedStorageEntry } from './storageRecovery';

export const EXECUTION_AUDIT_STORAGE_KEY = 'attentionos.execution.audit.v1';

interface TaskLifecycleTransitionInput {
  readonly event: string;
  readonly from: string;
  readonly targetId: string;
  readonly to: string;
}

interface AISuggestionApprovedInput {
  readonly createdTaskIds?: readonly string[];
  readonly stepCount: number;
  readonly suggestionId: string;
  readonly targetId: string;
}

interface AISuggestionRejectedInput {
  readonly suggestionId: string;
  readonly targetId: string;
}

interface AISuggestionRollbackInput {
  readonly archivedTaskIds: readonly string[];
  readonly archivedTaskSnapshots: readonly unknown[];
  readonly skippedTaskIds: readonly string[];
  readonly suggestionId: string;
  readonly targetId: string;
}

interface AISuggestionRollbackRestoredInput {
  readonly restoredTaskIds: readonly string[];
  readonly skippedTaskIds: readonly string[];
  readonly suggestionId: string;
  readonly targetId: string;
}

interface WorkflowOptimizationReviewedInput {
  readonly actionCount: number;
  readonly status: 'approved' | 'rejected';
  readonly suggestionId: string;
}

interface ExecutionPlanEntityCreatedInput {
  readonly entityId: string;
  readonly entityType: string;
  readonly parentId?: string;
  readonly role?: string;
}

interface ExecutionPlanRoleChangedInput {
  readonly role: string;
  readonly targetId: string;
}

interface ReminderIntegrationSettingsChangedInput {
  readonly auditTrailEnabled: boolean;
  readonly channels: readonly string[];
  readonly dailyPromptLimit: number;
  readonly enabled: boolean;
  readonly permissionStatementAccepted: boolean;
}

function createAuditId(): string {
  if (globalThis.crypto && 'randomUUID' in globalThis.crypto) {
    return globalThis.crypto.randomUUID();
  }

  return `audit-${Date.now().toString(36)}`;
}

export function readExecutionAuditEntries(): V2AuditLogEntry[] {
  const raw = localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY);

  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }

    recordMalformedStorageEntry({
      error: new Error('Execution audit entries are not an array.'),
      fallback: 'Hiding malformed audit entries until the payload is reviewed.',
      payload: raw,
      storageKey: EXECUTION_AUDIT_STORAGE_KEY,
    });
    return [];
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Hiding malformed audit entries until the payload is reviewed.',
      payload: raw,
      storageKey: EXECUTION_AUDIT_STORAGE_KEY,
    });
    return [];
  }
}

export function logTaskLifecycleTransition({
  event,
  from,
  targetId,
  to,
}: TaskLifecycleTransitionInput): V2AuditLogEntry {
  const entry: V2AuditLogEntry = {
    id: createAuditId(),
    actor: 'user',
    action: 'task.lifecycle.transition',
    targetId,
    details: {
      event,
      from,
      to,
    },
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    EXECUTION_AUDIT_STORAGE_KEY,
    JSON.stringify([...readExecutionAuditEntries(), entry]),
  );
  queuePersistAppState();

  return entry;
}

export function logAISuggestionApproved({
  createdTaskIds = [],
  stepCount,
  suggestionId,
  targetId,
}: AISuggestionApprovedInput): V2AuditLogEntry {
  const entry: V2AuditLogEntry = {
    id: createAuditId(),
    actor: 'user',
    action: 'ai.suggestion.approved',
    targetId,
    details: {
      createdTaskIds,
      kind: 'task_decomposition',
      stepCount,
      suggestionId,
    },
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    EXECUTION_AUDIT_STORAGE_KEY,
    JSON.stringify([...readExecutionAuditEntries(), entry]),
  );
  queuePersistAppState();

  return entry;
}

export function logAISuggestionRejected({
  suggestionId,
  targetId,
}: AISuggestionRejectedInput): V2AuditLogEntry {
  const entry: V2AuditLogEntry = {
    id: createAuditId(),
    actor: 'user',
    action: 'ai.suggestion.rejected',
    targetId,
    details: {
      kind: 'task_decomposition',
      suggestionId,
    },
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    EXECUTION_AUDIT_STORAGE_KEY,
    JSON.stringify([...readExecutionAuditEntries(), entry]),
  );
  queuePersistAppState();

  return entry;
}

export function logAISuggestionRollback({
  archivedTaskIds,
  archivedTaskSnapshots,
  skippedTaskIds,
  suggestionId,
  targetId,
}: AISuggestionRollbackInput): V2AuditLogEntry {
  const entry: V2AuditLogEntry = {
    id: createAuditId(),
    actor: 'user',
    action: 'ai.suggestion.rollback',
    targetId,
    details: {
      archivedTaskIds,
      archivedTaskSnapshots,
      kind: 'task_decomposition',
      skippedTaskIds,
      suggestionId,
    },
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    EXECUTION_AUDIT_STORAGE_KEY,
    JSON.stringify([...readExecutionAuditEntries(), entry]),
  );
  queuePersistAppState();

  return entry;
}

export function logAISuggestionRollbackRestored({
  restoredTaskIds,
  skippedTaskIds,
  suggestionId,
  targetId,
}: AISuggestionRollbackRestoredInput): V2AuditLogEntry {
  const entry: V2AuditLogEntry = {
    id: createAuditId(),
    actor: 'user',
    action: 'ai.suggestion.rollback.restored',
    targetId,
    details: {
      kind: 'task_decomposition',
      restoredTaskIds,
      skippedTaskIds,
      suggestionId,
    },
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    EXECUTION_AUDIT_STORAGE_KEY,
    JSON.stringify([...readExecutionAuditEntries(), entry]),
  );
  queuePersistAppState();

  return entry;
}

export function logWorkflowOptimizationReviewed({
  actionCount,
  status,
  suggestionId,
}: WorkflowOptimizationReviewedInput): V2AuditLogEntry {
  const entry: V2AuditLogEntry = {
    id: createAuditId(),
    actor: 'user',
    action: `learning.suggestion.${status}`,
    details: {
      actionCount,
      kind: 'workflow_optimization',
      suggestionId,
    },
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    EXECUTION_AUDIT_STORAGE_KEY,
    JSON.stringify([...readExecutionAuditEntries(), entry]),
  );
  queuePersistAppState();

  return entry;
}

export function logExecutionPlanEntityCreated({
  entityId,
  entityType,
  parentId,
  role,
}: ExecutionPlanEntityCreatedInput): V2AuditLogEntry {
  const entry: V2AuditLogEntry = {
    id: createAuditId(),
    actor: 'user',
    action: 'execution.plan.entity.created',
    targetId: entityId,
    details: {
      entityType,
      parentId,
      role,
    },
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    EXECUTION_AUDIT_STORAGE_KEY,
    JSON.stringify([...readExecutionAuditEntries(), entry]),
  );
  queuePersistAppState();

  return entry;
}

export function logExecutionPlanRoleChanged({
  role,
  targetId,
}: ExecutionPlanRoleChangedInput): V2AuditLogEntry {
  const entry: V2AuditLogEntry = {
    id: createAuditId(),
    actor: 'user',
    action: 'execution.plan.role.changed',
    targetId,
    details: {
      role,
    },
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    EXECUTION_AUDIT_STORAGE_KEY,
    JSON.stringify([...readExecutionAuditEntries(), entry]),
  );
  queuePersistAppState();

  return entry;
}

export function logReminderIntegrationSettingsChanged({
  auditTrailEnabled,
  channels,
  dailyPromptLimit,
  enabled,
  permissionStatementAccepted,
}: ReminderIntegrationSettingsChangedInput): V2AuditLogEntry {
  const entry: V2AuditLogEntry = {
    id: createAuditId(),
    actor: 'user',
    action: 'reminder.integration.settings.changed',
    details: {
      auditTrailEnabled,
      channels,
      dailyPromptLimit,
      enabled,
      permissionStatementAccepted,
    },
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(
    EXECUTION_AUDIT_STORAGE_KEY,
    JSON.stringify([...readExecutionAuditEntries(), entry]),
  );
  queuePersistAppState();

  return entry;
}
