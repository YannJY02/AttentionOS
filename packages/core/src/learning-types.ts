import type {
  AISuggestion,
  CreateAISuggestionInput,
  PrivacyLevel,
  SuggestionStatus,
} from './ai-types.js';
import type { V2WorkflowStage } from './v2-types.js';

export interface LearningWindow {
  readonly startedAt: string;
  readonly endedAt: string;
}

export interface AttentionTrendSummary {
  readonly averageScore: number;
  readonly dominantState: string | null;
  readonly lowScoreRatio: number;
  readonly overloadedRatio: number;
  readonly sampleCount: number;
  readonly volatility: number;
}

export interface TaskCompletionSummary {
  readonly activeTasks: number;
  readonly completedTasks: number;
  readonly completionRatio: number;
  readonly oversizedActiveTaskCount: number;
  readonly totalTasks: number;
}

export interface SuggestionAdoptionSummary {
  readonly acceptedSuggestions: number;
  readonly adoptionRate: number;
  readonly appliedSuggestions: number;
  readonly pendingSuggestions: number;
  readonly rejectedSuggestions: number;
  readonly reviewableSuggestions: number;
  readonly totalSuggestions: number;
}

export interface BehaviorPatternReport {
  readonly adoption: SuggestionAdoptionSummary;
  readonly attention: AttentionTrendSummary;
  readonly evidence: readonly string[];
  readonly tasks: TaskCompletionSummary;
  readonly window: LearningWindow;
}

export type WorkflowOptimizationActionType =
  | 'task.split'
  | 'workflow.review'
  | 'schedule.focus_block'
  | 'ritual.recover';

export interface WorkflowOptimizationAction {
  readonly type: WorkflowOptimizationActionType;
  readonly label: string;
  readonly targetId?: string;
  readonly metadata?: Record<string, unknown>;
}

export interface WorkflowOptimizationPayload {
  readonly actions: readonly WorkflowOptimizationAction[];
  readonly confidence: number;
  readonly evidence: readonly string[];
  readonly privacyLevel: PrivacyLevel;
  readonly targetStage?: V2WorkflowStage;
}

export type WorkflowOptimizationSuggestion = AISuggestion<WorkflowOptimizationPayload> & {
  readonly kind: 'workflow_optimization';
  readonly payload: WorkflowOptimizationPayload;
};

export type CreateWorkflowOptimizationSuggestionInput =
  CreateAISuggestionInput<WorkflowOptimizationPayload> & {
    readonly kind: 'workflow_optimization';
    readonly status: Extract<SuggestionStatus, 'pending'>;
  };
