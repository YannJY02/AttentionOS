import type { V2WorkflowStage } from './v2-types';

export const PRIVACY_LEVELS = ['L0', 'L1', 'L2', 'L3'] as const;
export type PrivacyLevel = (typeof PRIVACY_LEVELS)[number];

export const PRIVACY_LEVEL_RANK: Record<PrivacyLevel, number> = {
  L0: 0,
  L1: 1,
  L2: 2,
  L3: 3,
};

export const SUGGESTION_STATUSES = ['pending', 'approved', 'rejected', 'applied'] as const;
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];

export type ModelCapability = 'text' | 'tool-calling' | 'embedding' | 'reranking';
export type ModelPrivacyScope = 'external' | 'local';
export type ModelCostTier = 'low' | 'medium' | 'high';

export interface AIModelConfig {
  readonly id: string;
  readonly provider: string;
  readonly model: string;
  readonly privacyScope: ModelPrivacyScope;
  readonly capabilities: readonly ModelCapability[];
  readonly costTier: ModelCostTier;
  readonly modelVersion?: string;
  readonly maxInputTokens?: number;
}

export interface PromptTemplate {
  readonly id: string;
  readonly key: string;
  readonly version: string;
  readonly description?: string;
  readonly template: string;
  readonly variables: readonly string[];
  readonly maxPrivacyLevel: PrivacyLevel;
  readonly isActive: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type CreatePromptTemplateInput = Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>;

export interface EmbeddingRecord {
  readonly id: string;
  readonly entityId?: string;
  readonly contentHash: string;
  readonly content: string;
  readonly embedding: readonly number[];
  readonly metadata: Record<string, unknown>;
  readonly modelId: string;
  readonly modelVersion: string;
  readonly modelDimensions: number;
  readonly privacyLevel: PrivacyLevel;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type CreateEmbeddingInput = Omit<EmbeddingRecord, 'id' | 'createdAt' | 'updatedAt'>;

export interface ContextSearchResult {
  readonly id: string;
  readonly entityId?: string;
  readonly text: string;
  readonly score: number;
  readonly metadata?: Record<string, unknown>;
  readonly modelId?: string;
  readonly modelVersion?: string;
  readonly privacyLevel: PrivacyLevel;
}

export type AISuggestionKind = 'task_decomposition' | 'context_link' | 'workflow_transition';

export interface TaskDecompositionStep {
  readonly title: string;
  readonly rationale?: string;
  readonly estimatedMinutes?: number;
  readonly dependsOn?: readonly string[];
}

export interface TaskDecompositionPayload {
  readonly steps: readonly TaskDecompositionStep[];
}

export interface AISuggestion<TPayload extends object = Record<string, unknown>> {
  readonly id: string;
  readonly kind: AISuggestionKind;
  readonly status: SuggestionStatus;
  readonly targetId?: string;
  readonly title: string;
  readonly rationale: string;
  readonly payload: TPayload;
  readonly context: readonly ContextSearchResult[];
  readonly createdBy: string;
  readonly modelId?: string;
  readonly modelVersion?: string;
  readonly approvalRequired: boolean;
  readonly reviewedBy?: string;
  readonly reviewedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type CreateAISuggestionInput<TPayload extends object = Record<string, unknown>> = Omit<
  AISuggestion<TPayload>,
  'id' | 'createdAt' | 'updatedAt' | 'reviewedAt' | 'reviewedBy'
>;

export type TaskDecompositionSuggestion = AISuggestion<TaskDecompositionPayload> & {
  readonly kind: 'task_decomposition';
  readonly payload: TaskDecompositionPayload;
};

export type AgentToolName = 'task.decompose' | 'context.search' | 'suggestion.approve';

export interface AgentToolCall {
  readonly id: string;
  readonly toolName: AgentToolName;
  readonly input: Record<string, unknown>;
  readonly privacyLevel: PrivacyLevel;
  readonly approvalRequired: boolean;
  readonly status: 'requested' | 'approved' | 'rejected' | 'executed' | 'failed';
  readonly createdAt: string;
}

export interface AgentWorkflowEventRequest {
  readonly stage: V2WorkflowStage;
  readonly event: Record<string, unknown> & { readonly type: string };
  readonly rationale: string;
}
