import type {
  DataGovernancePolicy,
  DataGovernancePreset,
  ExecutionGuardrailConfig,
  ExtensionRuntimePolicy,
  MRTEnrollment,
  NudgeAction,
  NudgeType,
  PlanningLevel,
  PolicyCenterConfig,
  PriorityPreemptionConfig,
  PrivacySettings,
  RouteContext,
  WorkflowRoute,
} from './types.js';

export const DEFAULT_NUDGE_ACTIONS: NudgeAction[] = [
  'continue_focus',
  'shorten_goal',
  'switch_single_task',
  'short_recovery',
  'defer_low_priority',
];

export const DEFAULT_NUDGE_TYPE_BY_ACTION: Record<NudgeAction, NudgeType> = {
  continue_focus: 'stuck_chain',
  shorten_goal: 'deadline_risk',
  switch_single_task: 'switch_overload',
  short_recovery: 'energy_drop',
  defer_low_priority: 'overfocus',
};

export const DEFAULT_GUARDRAILS: ExecutionGuardrailConfig = {
  allowlistedActions: ['collect_context', 'open_app', 'summarize_notes', 'create_next_step'],
  quietHours: {
    startHour: 22,
    endHour: 7,
  },
  dailyNudgeLimit: 6,
  minNudgeIntervalMinutes: 20,
  autoLaunchAllowlist: ['Calendar', 'Notes', 'Reminders', 'Notion', 'Obsidian'],
};

export const DEFAULT_PRIORITY_PREEMPTION_CONFIG: PriorityPreemptionConfig = {
  enabled: true,
  requireHighPriorityTask: true,
  requireDeadlineHigh: true,
};

export const DEFAULT_WORKFLOW_CONSTRAINTS = {
  maxTaskMinutes: 120,
  maxPendingCandidatesPerProject: 3,
};

export const DEFAULT_POLICY_CENTER_CONFIG: PolicyCenterConfig = {
  id: 'default',
  updatedAt: new Date(0).toISOString(),
  guardrails: DEFAULT_GUARDRAILS,
  priorityPreemption: DEFAULT_PRIORITY_PREEMPTION_CONFIG,
  workflowConstraints: DEFAULT_WORKFLOW_CONSTRAINTS,
};

export const DEFAULT_PRIVACY_SETTINGS: PrivacySettings = {
  id: 'default',
  updatedAt: new Date(0).toISOString(),
  sensitiveCollection: {
    integrationEnabled: false,
    pluginEnabled: false,
    cliEnabled: true,
  },
  consent: {
    version: 'v1',
  },
};

export const DEFAULT_DATA_GOVERNANCE_PRESETS: Record<
  DataGovernancePreset,
  DataGovernancePolicy['domains']
> = {
  long_term: {
    core_content: { retentionDays: null },
    sensitive_raw: { retentionDays: 365 },
    ops_audit: { retentionDays: 365 },
    metric_rollups_daily: { retentionDays: null },
  },
  balanced: {
    core_content: { retentionDays: null },
    sensitive_raw: { retentionDays: 90 },
    ops_audit: { retentionDays: 180 },
    metric_rollups_daily: { retentionDays: null },
  },
  minimal: {
    core_content: { retentionDays: null },
    sensitive_raw: { retentionDays: 30 },
    ops_audit: { retentionDays: 90 },
    metric_rollups_daily: { retentionDays: 180 },
  },
};

export const DEFAULT_DATA_GOVERNANCE_POLICY: DataGovernancePolicy = {
  id: 'default',
  updatedAt: new Date(0).toISOString(),
  preset: 'long_term',
  domains: DEFAULT_DATA_GOVERNANCE_PRESETS.long_term,
};

export const DEFAULT_EXTENSION_RUNTIME_POLICY: ExtensionRuntimePolicy = {
  maxRequestsPerMinute: 20,
  maxInputChars: 4000,
  maxOutputChars: 4000,
  timeoutMs: 8000,
  failureThreshold: 3,
  coolDownSeconds: 60,
};

export const DEFAULT_MRT_ENROLLMENT: MRTEnrollment = {
  userId: 'default',
  timestamp: new Date(0).toISOString(),
  active: true,
  probabilities: [
    { action: 'continue_focus', weight: 1 },
    { action: 'shorten_goal', weight: 1 },
    { action: 'switch_single_task', weight: 1 },
    { action: 'short_recovery', weight: 1 },
    { action: 'defer_low_priority', weight: 1 },
  ],
};

export const DEFAULT_WORKFLOW_ROUTE: WorkflowRoute = 'ritual';
export const DEFAULT_PLANNING_LEVEL: PlanningLevel = 'vision';

export const DEFAULT_ROUTE_CONTEXT: RouteContext = {
  id: 'default',
  workflowSuiteId: 'default_familiar',
  workflowRoute: DEFAULT_WORKFLOW_ROUTE,
  planningLevel: DEFAULT_PLANNING_LEVEL,
  updatedAt: new Date(0).toISOString(),
};
