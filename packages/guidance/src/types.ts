export type AttentionState = 'focused' | 'drifting' | 'overloaded' | 'fatigued';

export interface SubjectiveAttentionReport {
  readonly clarity: number;
  readonly energy: number;
  readonly distractibility: number;
  readonly stress?: number;
}

export type PassiveForegroundCategory = 'work' | 'communication' | 'social' | 'learning' | 'other';

export interface PassiveSignal {
  readonly timestamp: string;
  readonly appSwitchesLast15Min: number;
  readonly fragmentedSessionCount: number;
  readonly foregroundCategory: PassiveForegroundCategory;
  readonly hourOfDay: number;
}

export interface AttentionObservation {
  readonly id: string;
  readonly timestamp: string;
  readonly subjective: SubjectiveAttentionReport;
  readonly passive?: PassiveSignal;
  readonly source: 'cli' | 'integration' | 'plugin';
}

export interface ActiveProbeResult {
  readonly id: string;
  readonly timestamp: string;
  readonly reactionTimeMs: number;
  readonly inhibitionErrorRate: number;
  readonly trialCount: number;
  readonly selfReportedDifficulty?: number;
}

export interface AttentionFeatureBreakdown {
  readonly subjectiveScore: number;
  readonly passiveScore: number;
  readonly behavioralScore: number;
}

export interface AttentionEstimate {
  readonly id: string;
  readonly timestamp: string;
  readonly state: AttentionState;
  readonly score: number;
  readonly confidence: number;
  readonly uncertainty: number;
  readonly reasons: readonly string[];
  readonly breakdown: AttentionFeatureBreakdown;
}

export interface V2AttentionObservationRecord {
  readonly id: string;
  readonly state: AttentionState;
  readonly score: number;
  readonly confidence: number;
  readonly breakdown: AttentionFeatureBreakdown;
  readonly reasons: readonly string[];
  readonly observedAt: string;
}

export const PRIVACY_LEVELS = ['L0', 'L1', 'L2', 'L3'] as const;
export type PrivacyLevel = (typeof PRIVACY_LEVELS)[number];

export type SuggestionStatus = 'pending' | 'approved' | 'rejected' | 'applied';

export interface GuidanceContextEvidence {
  readonly id: string;
  readonly entityId?: string;
  readonly text: string;
  readonly score: number;
  readonly privacyLevel: PrivacyLevel;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly modelId?: string;
  readonly modelVersion?: string;
}

export interface GuidanceSuggestion<TPayload extends object = Record<string, unknown>> {
  readonly id: string;
  readonly kind: string;
  readonly status: SuggestionStatus;
  readonly targetId?: string;
  readonly title: string;
  readonly rationale: string;
  readonly payload: TPayload;
  readonly context: readonly GuidanceContextEvidence[];
  readonly createdBy: string;
  readonly modelId?: string;
  readonly modelVersion?: string;
  readonly approvalRequired: boolean;
  readonly reviewedBy?: string;
  readonly reviewedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export type CreateGuidanceSuggestionInput<TPayload extends object> = Omit<
  GuidanceSuggestion<TPayload>,
  'id' | 'createdAt' | 'updatedAt' | 'reviewedAt' | 'reviewedBy'
>;

export interface TaskDecompositionStep {
  readonly title: string;
  readonly rationale?: string;
  readonly estimatedMinutes?: number;
  readonly dependsOn?: readonly string[];
}

export interface TaskDecompositionPayload {
  readonly steps: readonly TaskDecompositionStep[];
}

export type TaskDecompositionSuggestion = GuidanceSuggestion<TaskDecompositionPayload> & {
  readonly kind: 'task_decomposition';
  readonly payload: TaskDecompositionPayload;
};
