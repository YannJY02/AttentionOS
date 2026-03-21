export type AttentionState = "focused" | "drifting" | "overloaded" | "fatigued";

export type NudgeAction =
  | "continue_focus"
  | "shorten_goal"
  | "switch_single_task"
  | "short_recovery"
  | "defer_low_priority";

export type NudgeType =
  | "switch_overload"
  | "overfocus"
  | "energy_drop"
  | "deadline_risk"
  | "stuck_chain";

export type TriggerType = "time_window" | "event_signal";

export type PluginKind = "source" | "sensor" | "intervention" | "executor";

export type PluginPermission =
  | "read_calendar"
  | "read_tasks"
  | "read_notes"
  | "read_messages"
  | "launch_app"
  | "network_access";

export interface SubjectiveEMA {
  clarity: number;
  energy: number;
  distractibility: number;
  stress?: number;
}

export type PassiveForegroundCategory = "work" | "communication" | "social" | "learning" | "other";

export interface TimingIntegrationPayload {
  source: "timing";
  activityId?: string;
  project?: string;
  task?: string;
  tags?: string[];
  durationSeconds?: number;
  isRunning?: boolean;
  startedAt?: string;
  endedAt?: string;
  raw?: Record<string, unknown>;
}

export interface PassiveSignal {
  timestamp: string;
  appSwitchesLast15Min: number;
  fragmentedSessionCount: number;
  foregroundCategory: PassiveForegroundCategory;
  hourOfDay: number;
  timing?: TimingIntegrationPayload;
}

export interface AttentionObservation {
  id: string;
  timestamp: string;
  subjective: SubjectiveEMA;
  passive?: PassiveSignal;
  source: "cli" | "integration" | "plugin";
}

export interface ActiveProbeResult {
  id: string;
  timestamp: string;
  reactionTimeMs: number;
  inhibitionErrorRate: number;
  trialCount: number;
  selfReportedDifficulty?: number;
}

export interface AttentionFeatureBreakdown {
  subjectiveScore: number;
  passiveScore: number;
  behavioralScore: number;
}

export interface AttentionStateEstimate {
  id: string;
  timestamp: string;
  state: AttentionState;
  score: number;
  confidence: number;
  uncertainty: number;
  reasons: string[];
  breakdown: AttentionFeatureBreakdown;
}

export interface NudgeDecisionContext {
  id: string;
  timestamp: string;
  trigger: TriggerType;
  stateEstimate: AttentionStateEstimate;
  minutesInCurrentTask: number;
  switchesInLast30Min: number;
  deadlineRisk: "low" | "medium" | "high";
  highPriorityTaskAvailable: boolean;
}

export interface NudgeDecision {
  id: string;
  timestamp: string;
  allowed: boolean;
  action: NudgeAction;
  type: NudgeType;
  message: string;
  reason: string;
  interventionId?: string;
}

export interface MRTProbability {
  action: NudgeAction;
  weight: number;
}

export interface MRTEnrollment {
  userId: string;
  timestamp: string;
  active: boolean;
  probabilities: MRTProbability[];
}

export interface MRTAssignment {
  id: string;
  userId: string;
  timestamp: string;
  contextId: string;
  action: NudgeAction;
  probability: number;
}

export interface InterventionOutcome {
  id: string;
  userId: string;
  timestamp: string;
  assignmentId: string;
  accepted: boolean;
  focusMinutesAfterNudge: number;
  switchReduction: number;
  reward: number;
}

export interface ExecutionGuardrailConfig {
  allowlistedActions: string[];
  quietHours: {
    startHour: number;
    endHour: number;
  };
  dailyNudgeLimit: number;
  minNudgeIntervalMinutes: number;
  autoLaunchAllowlist: string[];
}

export interface PriorityPreemptionConfig {
  enabled: boolean;
  requireHighPriorityTask: boolean;
  requireDeadlineHigh: boolean;
}

export interface WorkflowConstraintConfig {
  maxTaskMinutes: number;
  maxPendingCandidatesPerProject: number;
}

export interface PolicyCenterConfig {
  id: string;
  updatedAt: string;
  guardrails: ExecutionGuardrailConfig;
  priorityPreemption: PriorityPreemptionConfig;
  workflowConstraints: WorkflowConstraintConfig;
}

export interface SensitiveCollectionSettings {
  integrationEnabled: boolean;
  pluginEnabled: boolean;
  cliEnabled: boolean;
}

export interface PrivacyConsentState {
  grantedAt?: string;
  version: string;
}

export interface PrivacySettings {
  id: string;
  updatedAt: string;
  sensitiveCollection: SensitiveCollectionSettings;
  consent: PrivacyConsentState;
}

export type DataGovernancePreset = "long_term" | "balanced" | "minimal";

export type DataGovernanceDomain =
  | "core_content"
  | "sensitive_raw"
  | "ops_audit"
  | "metric_rollups_daily";

export interface RetentionDomainPolicy {
  retentionDays: number | null;
}

export interface DataGovernancePolicy {
  id: string;
  updatedAt: string;
  preset: DataGovernancePreset;
  domains: Record<DataGovernanceDomain, RetentionDomainPolicy>;
}

export interface NudgeStatsSnapshot {
  nudgesToday: number;
  lastNudgeAt?: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  kind: PluginKind;
  permissions: PluginPermission[];
  description: string;
  entry: string;
}

export interface PluginRegistration {
  manifest: PluginManifest;
  registeredAt: string;
  enabled: boolean;
}

export interface CaptureEntry {
  id: string;
  timestamp: string;
  text: string;
  projectTier: "P0" | "P1" | "P2" | "P3";
  nextStep?: string;
}

export type CaptureQuadrant = "q1_do_now" | "q2_plan" | "q3_delegate" | "q4_eliminate";

export interface CaptureCalendarIntent {
  intent: "none" | "focus_block" | "timebox" | "deadline" | "meeting";
  startAt?: string;
  endAt?: string;
  timezone?: string;
  note?: string;
}

export interface CaptureHubProject {
  id: string;
  name: string;
  status: "active" | "paused" | "done";
  createdAt: string;
  updatedAt: string;
}

export interface CaptureHubTask {
  id: string;
  title: string;
  done: boolean;
  projectId?: string;
  quadrant: CaptureQuadrant;
  calendarIntent?: CaptureCalendarIntent;
  createdAt: string;
  updatedAt: string;
}

export interface CaptureHubState {
  id: string;
  updatedAt: string;
  aiPlanningEnabled: boolean;
  quadrants: Record<CaptureQuadrant, string[]>;
  projects: CaptureHubProject[];
  tasks: CaptureHubTask[];
}

export type ControlMode = "auto" | "manual" | "hybrid";

export type WorkItemSource = "capture_hub" | "planner" | "manual" | "timing";

export type WorkItemStatus = "pending" | "active" | "completed" | "deferred";

export interface WorkItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  source: WorkItemSource;
  title: string;
  note?: string;
  project: string;
  quadrant: CaptureQuadrant;
  status: WorkItemStatus;
  estimatedMinutes: number;
  trackedMinutes: number;
  priorityScore: number;
  recoveryCue?: string;
}

export interface CurrentStepSnapshot {
  controlMode: ControlMode;
  workItem?: WorkItem;
  suggestion: string;
}

export type WorkflowStage = "ritual" | "capture" | "decompose" | "current_step" | "focus" | "review";

export interface WorkflowSession {
  id: string;
  activeStage: WorkflowStage;
  lastCompletedStage?: WorkflowStage;
  resumeHint: string;
  resumedWorkItemId?: string;
  updatedAt: string;
}

export type WorkflowSuiteId = "default_familiar";

export type WorkflowRoute = "ritual" | "overview" | "execution";

export type ExecutionMode = "plan" | "focus";

export type PlanningLevel = "vision" | "area" | "goal" | "project" | "task";

export interface RouteContext {
  id: string;
  workflowSuiteId: WorkflowSuiteId;
  workflowRoute: WorkflowRoute;
  executionMode?: ExecutionMode;
  planningLevel: PlanningLevel;
  entityId?: string;
  filters?: Record<string, string>;
  updatedAt: string;
}

export interface OverviewMetricCard {
  id: string;
  title: string;
  valueText: string;
  trendText?: string;
  status: "good" | "neutral" | "warning";
}

export interface OverviewBridgeAction {
  id: string;
  title: string;
  targetLevel: PlanningLevel;
  prefillFilters?: Record<string, string>;
}

export interface OverviewPageModel {
  level: PlanningLevel;
  generatedAt: string;
  metrics: OverviewMetricCard[];
  bridgeActions: OverviewBridgeAction[];
  notes: string[];
}

export interface PlanningActionItem {
  id: string;
  title: string;
  kind: "create" | "update" | "split" | "prioritize";
}

export interface PlanningEntitySummary {
  id: string;
  title: string;
  subtitle?: string;
  status?: string;
}

export interface ExecutionPageModel {
  level: PlanningLevel;
  generatedAt: string;
  constraints: string[];
  entities: PlanningEntitySummary[];
  actions: PlanningActionItem[];
  fulfillment: {
    plannedWeight: number;
    completedWeight: number;
    completionRatio: number;
    delayedTaskCount: number;
  };
}

export type ConstraintViolationCode =
  | "task_duration_exceeded"
  | "current_step_limit_exceeded"
  | "candidate_limit_exceeded";

export interface ConstraintViolation {
  code: ConstraintViolationCode;
  message: string;
  hint: string;
  context?: Record<string, unknown>;
}

export interface UsabilityReport {
  generatedAt: string;
  windowDays: number;
  easeOfUseScore: number;
  usefulnessScore: number;
  usabilityScore: number;
  summary: string;
  signals: {
    totalWorkItems: number;
    activeWorkItems: number;
    completedWorkItems: number;
    recentCaptureCount: number;
    recentNudgeCount: number;
    latestEstimateUncertainty?: number;
  };
}

export type ReleaseGateRecommendationSource = "historical_window" | "derived_from_current" | "seed_defaults";

export type ReleaseGateRecommendationConfidence = "high" | "medium" | "low";

export interface ReleaseGateUsabilityEvidencePoint {
  steps: number;
  durationMs: number;
  misTapRate: number;
  sampleCount: number;
}

export interface ReleaseGateEvidenceRecommendation {
  capabilityId: string;
  route: WorkflowRoute;
  level: PlanningLevel;
  thresholdVersion: string;
  baseline: ReleaseGateUsabilityEvidencePoint;
  current: ReleaseGateUsabilityEvidencePoint;
  source: ReleaseGateRecommendationSource;
  confidence: ReleaseGateRecommendationConfidence;
  generatedAt: string;
}

export type WorkflowUsabilityRuleKey = "steps" | "durationMs" | "misTapRate";

export interface WorkflowUsabilityReviewBurden {
  stepsMedian: number;
  durationMedianSeconds: number;
  misTapRate: number;
  signalSampleCount: number;
  feedbackSampleCount: number;
  autonomyScoreAverage?: number;
  autonomySampleCount: number;
  subjectiveLoad?: number;
}

export interface WorkflowUsabilityProjectedGate {
  passed: boolean;
  failedRules: WorkflowUsabilityRuleKey[];
  rules: Record<WorkflowUsabilityRuleKey, boolean>;
}

export interface WorkflowUsabilityReviewReport {
  capabilityId: string;
  route: WorkflowRoute;
  level: PlanningLevel;
  thresholdVersion: string;
  generatedAt: string;
  windowDays: number;
  burden: WorkflowUsabilityReviewBurden;
  recommendation: {
    source: ReleaseGateRecommendationSource;
    confidence: ReleaseGateRecommendationConfidence;
    baseline: ReleaseGateUsabilityEvidencePoint;
    current: ReleaseGateUsabilityEvidencePoint;
  };
  projectedGate: WorkflowUsabilityProjectedGate;
  summary: string;
  nextAction: string;
}

export interface ActivityLogEntry {
  id: string;
  timestamp: string;
  type: string;
  source: string;
  message: string;
  payload?: Record<string, unknown>;
}

export interface ActivityAggregate {
  total: number;
  byType: Array<{
    key: string;
    count: number;
  }>;
  bySource: Array<{
    key: string;
    count: number;
  }>;
  since: string;
  until: string;
}

export type ActionRiskLevel = "low" | "medium" | "high" | "critical";
export type ActionRollbackStrategy = "none" | "direct_undo" | "compensating_action";

export type ActionExecutionState =
  | "draft"
  | "pending_confirmation"
  | "confirmed"
  | "running"
  | "succeeded"
  | "failed"
  | "rolled_back";

export interface ActionActorRef {
  type: "user" | "system" | "agent" | "plugin";
  id: string;
}

export interface ActionResourceRef {
  type: string;
  id?: string;
  external?: boolean;
}

export interface ActionRecord {
  id: string;
  correlationId: string;
  actionType: string;
  riskLevel: ActionRiskLevel;
  requiresConfirmation: boolean;
  rollbackStrategy: ActionRollbackStrategy;
  state: ActionExecutionState;
  source: string;
  actor: ActionActorRef;
  resource?: ActionResourceRef;
  payload?: Record<string, unknown>;
  decisionReason?: string;
  createdAt: string;
  updatedAt: string;
  confirmedAt?: string;
  completedAt?: string;
  failedAt?: string;
  rolledBackAt?: string;
}

export interface ActionAuditEnvelope {
  id: string;
  eventId: string;
  eventType: string;
  occurredAt: string;
  source: string;
  actionId?: string;
  correlationId: string;
  actor: ActionActorRef;
  resource?: ActionResourceRef;
  result?: "allowed" | "blocked" | "succeeded" | "failed" | "rolled_back";
  decisionReason?: string;
  payload?: Record<string, unknown>;
}

export type ActionExecutionOutcome = "succeeded" | "failed" | "rolled_back";

export type ActionRollbackOutcome =
  | "not_needed"
  | "rolled_back"
  | "compensated"
  | "skipped"
  | "missing_handler"
  | "failed";

export interface ActionExecutionAttempt {
  id: string;
  actionId: string;
  correlationId: string;
  startedAt: string;
  finishedAt: string;
  executor: ActionActorRef;
  outcome: ActionExecutionOutcome;
  rollbackOutcome: ActionRollbackOutcome;
  error?: string;
  warning?: string;
  payload?: Record<string, unknown>;
}

export type PlannerMode = "rule" | "placeholder_llm";

export interface PlannerTask {
  id: string;
  title: string;
  estimateMinutes: number;
  status: "todo" | "in_progress" | "done";
  projectId?: string;
  quadrant?: CaptureQuadrant;
  calendarIntent?: CaptureCalendarIntent;
}

export interface PlannerCalendarBlock {
  id: string;
  taskId: string;
  title: string;
  startAt: string;
  endAt: string;
}

export interface PlannerPlan {
  id: string;
  goal: string;
  createdAt: string;
  updatedAt: string;
  version: number;
  mode: PlannerMode;
  model: string;
  aiPlanned: boolean;
  tasks: PlannerTask[];
  calendarBlocks: PlannerCalendarBlock[];
  calendarCommittedAt?: string;
}

export interface PlannerPatchOperation {
  op: "add" | "update" | "remove";
  taskId?: string;
  task?: Partial<PlannerTask>;
}

export interface ProviderModelMetadata {
  id: string;
  displayName?: string;
  capabilities?: string[];
}

export interface ProviderSetting {
  provider: string;
  enabled: boolean;
  apiKeyConfigured: boolean;
  apiKeyLast4?: string;
  baseUrl?: string;
  defaultModel?: string;
  models?: ProviderModelMetadata[];
  extra?: Record<string, string | number | boolean>;
  updatedAt: string;
}

export interface ProviderSettingsState {
  updatedAt: string;
  activeProvider?: string;
  providers: ProviderSetting[];
}

export interface IntegrationSyncStatus {
  provider: string;
  degraded: boolean;
  retryCount: number;
  message: string;
  updatedAt: string;
  importedCount?: number;
  committedCount?: number;
  lastError?: string;
}

export interface AppleIntegrationStatus {
  bridgeUrl: string;
  available: boolean;
  autoStartEnabled: boolean;
  timeoutMs: number;
  retries: number;
  lastCheckedAt?: string;
  lastError?: string;
  lastCalendarSync?: IntegrationSyncStatus;
  lastTasksSync?: IntegrationSyncStatus;
}

export type ExtensionStatus = "built" | "installed" | "failed";

export type ExtensionCircuitState = "closed" | "open" | "half_open";

export interface ExtensionRuntimePolicy {
  maxRequestsPerMinute: number;
  maxInputChars: number;
  maxOutputChars: number;
  timeoutMs: number;
  failureThreshold: number;
  coolDownSeconds: number;
}

export interface ExtensionRuntimeHealth {
  consecutiveFailures: number;
  circuitState: ExtensionCircuitState;
  circuitOpenedAt?: string;
  lastFailureAt?: string;
  lastSuccessAt?: string;
}

export interface ExtensionRecord {
  id: string;
  name: string;
  version: string;
  status: ExtensionStatus;
  source: "generated" | "local";
  prompt?: string;
  permissions?: PluginPermission[];
  runtimePolicy?: ExtensionRuntimePolicy;
  runtimeHealth?: ExtensionRuntimeHealth;
  createdAt: string;
  updatedAt: string;
  installedAt?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface ExtensionAuditEntry {
  id: string;
  extensionId?: string;
  timestamp: string;
  action: "chat" | "build" | "install";
  actor: "cli" | "daemon";
  requestSummary: string;
  responseSummary: string;
  payload?: Record<string, unknown>;
}

export interface AttentionSnapshot {
  latestObservation?: AttentionObservation;
  latestProbe?: ActiveProbeResult;
  latestEstimate?: AttentionStateEstimate;
}

export type FocusEventType = "interruption" | "recovery";

export type FocusEventSource = "cli" | "integration" | "plugin" | "daemon";

export interface FocusEvent {
  id: string;
  type: FocusEventType;
  taskContextId: string;
  correlationId: string;
  timestamp: string;
  source: FocusEventSource;
  payload?: Record<string, unknown>;
}

export interface MetricPoint {
  metricId: "NS_001" | "OUT_001" | "OUT_002" | "OUT_003" | "OUT_004" | "GR_001" | "GR_002" | "GR_003" | "GR_004";
  value: number;
  unit: string;
  windowDays: number;
  computedAt: string;
  details?: Record<string, unknown>;
}

export interface MetricSummarySnapshot {
  generatedAt: string;
  windowDays: number;
  metrics: MetricPoint[];
}
