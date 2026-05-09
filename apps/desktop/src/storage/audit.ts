import type { V2AuditLogEntry } from '@attentionos/core';

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

interface WorkflowOptimizationReviewedInput {
  readonly actionCount: number;
  readonly status: 'approved' | 'rejected';
  readonly suggestionId: string;
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
    return Array.isArray(parsed) ? parsed : [];
  } catch {
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

  return entry;
}
