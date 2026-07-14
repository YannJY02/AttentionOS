import type { AttentionState } from './types';

export type {
  CreateAuditLogInput,
  CreateEdgeInput,
  CreateEntityInput,
  EntityStatus,
  EntityType,
  HierarchyLayer,
  ProposedTaskStep,
  RelationType,
  TaskDecompositionProposal,
  UpdateEntityInput,
  V2AuditLogEntry,
  V2Edge,
  V2Entity,
  V2WorkflowStage,
  WorkflowFacts,
} from '@attentionos/workflow';

export interface V2AttentionObservationRecord {
  readonly id: string;
  readonly state: AttentionState;
  readonly score: number;
  readonly confidence: number;
  readonly breakdown: {
    readonly subjectiveScore: number;
    readonly passiveScore: number;
    readonly behavioralScore: number;
  };
  readonly reasons: readonly string[];
  readonly observedAt: string;
}
