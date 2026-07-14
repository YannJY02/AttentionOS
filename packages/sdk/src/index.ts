import type {
  AISuggestion,
  V2AttentionObservationRecord,
  V2AuditLogEntry,
  V2Edge,
  V2Entity,
  V2WorkflowStage,
} from '@attentionos/core';

export const ATTENTIONOS_READ_PROTOCOL_VERSION = 'attentionos.read.v1' as const;

export type AttentionOSReadProtocolVersion = typeof ATTENTIONOS_READ_PROTOCOL_VERSION;

export type AttentionOSProtocolCapabilityId =
  | 'attentionos.read.audit'
  | 'attentionos.read.attention'
  | 'attentionos.read.entities'
  | 'attentionos.read.execution'
  | 'attentionos.read.suggestions'
  | 'attentionos.read.workflow';

export type AttentionOSProtocolResourceKind =
  | 'ai-suggestions'
  | 'attention-observations'
  | 'audit-log'
  | 'entities'
  | 'execution-state'
  | 'hierarchy'
  | 'workflow-stage';

export interface AttentionOSProtocolCapability {
  readonly description: string;
  readonly id: AttentionOSProtocolCapabilityId;
  readonly mode: 'read';
  readonly requiresUserApproval: true;
  readonly scope: 'local-app-state';
}

export interface AttentionOSProtocolResource {
  readonly description: string;
  readonly kind: AttentionOSProtocolResourceKind;
  readonly mimeType: 'application/json';
  readonly readOnly: true;
  readonly uri: `attentionos://read/${AttentionOSProtocolResourceKind}`;
}

export interface AttentionOSReadContract {
  readonly capabilities: readonly AttentionOSProtocolCapability[];
  readonly generatedAt: string;
  readonly protocolVersion: AttentionOSReadProtocolVersion;
  readonly resources: readonly AttentionOSProtocolResource[];
}

export interface AttentionOSReadSnapshot {
  readonly aiSuggestions: readonly AISuggestion[];
  readonly attentionObservations: readonly V2AttentionObservationRecord[];
  readonly auditLog: readonly V2AuditLogEntry[];
  readonly edges: readonly V2Edge[];
  readonly entities: readonly V2Entity[];
  readonly exportedAt: string;
  readonly focusCandidateId?: string;
  readonly protocolVersion: AttentionOSReadProtocolVersion;
  readonly workflowStage?: V2WorkflowStage;
}

export interface CreateAttentionOSReadSnapshotInput {
  readonly aiSuggestions?: readonly AISuggestion[];
  readonly attentionObservations?: readonly V2AttentionObservationRecord[];
  readonly auditLog?: readonly V2AuditLogEntry[];
  readonly edges?: readonly V2Edge[];
  readonly entities?: readonly V2Entity[];
  readonly exportedAt?: string;
  readonly focusCandidateId?: string;
  readonly workflowStage?: V2WorkflowStage;
}

const READ_CAPABILITIES: readonly AttentionOSProtocolCapability[] = [
  {
    description: 'Read the current workflow stage and stage-level routing state.',
    id: 'attentionos.read.workflow',
    mode: 'read',
    requiresUserApproval: true,
    scope: 'local-app-state',
  },
  {
    description: 'Read local entity and hierarchy records without creating or editing them.',
    id: 'attentionos.read.entities',
    mode: 'read',
    requiresUserApproval: true,
    scope: 'local-app-state',
  },
  {
    description: 'Read the current execution focus candidate and resumable focus state.',
    id: 'attentionos.read.execution',
    mode: 'read',
    requiresUserApproval: true,
    scope: 'local-app-state',
  },
  {
    description: 'Read pending, approved, or rejected AI suggestions for human review surfaces.',
    id: 'attentionos.read.suggestions',
    mode: 'read',
    requiresUserApproval: true,
    scope: 'local-app-state',
  },
  {
    description: 'Read local attention observations and confidence evidence.',
    id: 'attentionos.read.attention',
    mode: 'read',
    requiresUserApproval: true,
    scope: 'local-app-state',
  },
  {
    description: 'Read audit-log entries for review and export without mutating durable state.',
    id: 'attentionos.read.audit',
    mode: 'read',
    requiresUserApproval: true,
    scope: 'local-app-state',
  },
] as const;

const READ_RESOURCES: readonly AttentionOSProtocolResource[] = [
  {
    description: 'Current workflow stage and route-mode state.',
    kind: 'workflow-stage',
    mimeType: 'application/json',
    readOnly: true,
    uri: 'attentionos://read/workflow-stage',
  },
  {
    description: 'Five-layer Vision, Area, Goal, Project, and Task hierarchy entities.',
    kind: 'hierarchy',
    mimeType: 'application/json',
    readOnly: true,
    uri: 'attentionos://read/hierarchy',
  },
  {
    description: 'All local V2 entities visible through the AttentionOS context model.',
    kind: 'entities',
    mimeType: 'application/json',
    readOnly: true,
    uri: 'attentionos://read/entities',
  },
  {
    description: 'Execution focus candidate and resumable focus metadata.',
    kind: 'execution-state',
    mimeType: 'application/json',
    readOnly: true,
    uri: 'attentionos://read/execution-state',
  },
  {
    description: 'Human-reviewed AI suggestion records.',
    kind: 'ai-suggestions',
    mimeType: 'application/json',
    readOnly: true,
    uri: 'attentionos://read/ai-suggestions',
  },
  {
    description: 'Local attention observations and confidence breakdowns.',
    kind: 'attention-observations',
    mimeType: 'application/json',
    readOnly: true,
    uri: 'attentionos://read/attention-observations',
  },
  {
    description: 'Audit records for durable workflow and AI actions.',
    kind: 'audit-log',
    mimeType: 'application/json',
    readOnly: true,
    uri: 'attentionos://read/audit-log',
  },
] as const;

export function createAttentionOSReadContract(
  generatedAt = new Date().toISOString(),
): AttentionOSReadContract {
  return {
    capabilities: READ_CAPABILITIES,
    generatedAt,
    protocolVersion: ATTENTIONOS_READ_PROTOCOL_VERSION,
    resources: READ_RESOURCES,
  };
}

export function createAttentionOSReadSnapshot(
  input: CreateAttentionOSReadSnapshotInput = {},
): AttentionOSReadSnapshot {
  return {
    aiSuggestions: input.aiSuggestions ?? [],
    attentionObservations: input.attentionObservations ?? [],
    auditLog: input.auditLog ?? [],
    edges: input.edges ?? [],
    entities: input.entities ?? [],
    exportedAt: input.exportedAt ?? new Date().toISOString(),
    focusCandidateId: input.focusCandidateId,
    protocolVersion: ATTENTIONOS_READ_PROTOCOL_VERSION,
    workflowStage: input.workflowStage,
  };
}

export function assertReadOnlyContract(contract: AttentionOSReadContract): void {
  if (contract.protocolVersion !== ATTENTIONOS_READ_PROTOCOL_VERSION) {
    throw new Error(`Unsupported AttentionOS protocol version: ${contract.protocolVersion}`);
  }

  for (const capability of contract.capabilities) {
    if (capability.mode !== 'read') {
      throw new Error(`Protocol capability ${capability.id} is not read-only.`);
    }

    if (capability.scope !== 'local-app-state') {
      throw new Error(`Protocol capability ${capability.id} is outside local app state.`);
    }

    if (!capability.requiresUserApproval) {
      throw new Error(`Protocol capability ${capability.id} must require user approval.`);
    }
  }

  for (const resource of contract.resources) {
    if (!resource.readOnly) {
      throw new Error(`Protocol resource ${resource.uri} is not read-only.`);
    }
  }
}
