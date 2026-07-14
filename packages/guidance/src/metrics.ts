import type { V2AuditLogEntry, V2Entity, WorkflowFacts } from '@attentionos/workflow';
import type { BehaviorPatternReport } from './evolution-types';
import { calculateReminderPromptBudget, type ReminderPolicySettings } from './reminders';
import type { SuggestionStatus, V2AttentionObservationRecord } from './types';

export type ReleaseMetricStatus = 'steady' | 'watch' | 'review' | 'no-data';

export interface ReleaseMetric {
  readonly detail: string;
  readonly id: string;
  readonly label: string;
  readonly status: ReleaseMetricStatus;
  readonly value: string;
}

export interface ReleaseMetricsSnapshot {
  readonly generatedAt: string;
  readonly guardrailMetrics: readonly ReleaseMetric[];
  readonly outcomeMetrics: readonly ReleaseMetric[];
}

export interface ReminderMetricSettings extends ReminderPolicySettings {
  readonly integration: ReminderPolicySettings['integration'] & {
    readonly channels: readonly string[];
  };
}

export interface ReleaseMetricsInput {
  readonly generatedAt: string;
  readonly learningReport: BehaviorPatternReport;
  readonly manualReflectionCount: number;
  readonly observations: readonly V2AttentionObservationRecord[];
  readonly reminderSettings: ReminderMetricSettings;
  readonly suggestions: readonly { readonly status: SuggestionStatus }[];
  readonly workflow: WorkflowFacts;
}

function ratio(numerator: number, denominator: number): number {
  return denominator <= 0 ? 0 : numerator / denominator;
}

function formatPercent(value: number): string {
  return `${Math.round(value * 100)}%`;
}

function formatDecimal(value: number): string {
  return Number.isInteger(value) ? value.toString() : value.toFixed(1);
}

function isTask(entity: V2Entity): boolean {
  return entity.hierarchyLayer === 'task';
}

function isCompletedTransition(entry: V2AuditLogEntry): boolean {
  return entry.action === 'task.lifecycle.transition' && entry.details.to === 'done';
}

function isStartTransition(entry: V2AuditLogEntry): boolean {
  return entry.action === 'task.lifecycle.transition' && entry.details.event === 'START_EXECUTION';
}

function isRecoveryTransition(entry: V2AuditLogEntry): boolean {
  return (
    entry.action === 'task.lifecycle.transition' &&
    (entry.details.event === 'RESUME' || entry.details.from === 'paused')
  );
}

function hasSwitchingReason(reasons: readonly string[]): boolean {
  return reasons.some((reason) => /switch|context/i.test(reason));
}

export function createReleaseMetricsSnapshot({
  generatedAt,
  learningReport,
  manualReflectionCount,
  observations,
  reminderSettings,
  suggestions,
  workflow,
}: ReleaseMetricsInput): ReleaseMetricsSnapshot {
  const auditEntries = workflow.auditEntries;
  const hierarchyTasks = workflow.entities.filter(isTask);
  const focusedSampleCount = observations.filter(
    (observation) => observation.state === 'focused',
  ).length;
  const switchingSignalCount = observations.filter((observation) =>
    hasSwitchingReason(observation.reasons),
  ).length;
  const lowConfidenceSampleCount = observations.filter(
    (observation) => observation.confidence < 0.6,
  ).length;
  const startCount = auditEntries.filter(isStartTransition).length;
  const completionCount = auditEntries.filter(isCompletedTransition).length;
  const recoveryCueCount = auditEntries.filter(isRecoveryTransition).length;
  const completedTaskCount = hierarchyTasks.filter((task) => task.status === 'completed').length;
  const manualCaptureCount =
    manualReflectionCount +
    auditEntries.filter((entry) => entry.action === 'execution.plan.entity.created').length;
  const reviewableSuggestionCount = suggestions.filter(
    (suggestion) => suggestion.status === 'approved' || suggestion.status === 'rejected',
  ).length;
  const rejectedSuggestionCount = suggestions.filter(
    (suggestion) => suggestion.status === 'rejected',
  ).length;
  const autoAppliedSuggestionCount = suggestions.filter(
    (suggestion) => suggestion.status === 'applied',
  ).length;
  const reminderPromptBudget = calculateReminderPromptBudget(reminderSettings);
  const manualCapturePerCompletion = ratio(manualCaptureCount, Math.max(completionCount, 1));
  const misjudgmentRatio = ratio(rejectedSuggestionCount, reviewableSuggestionCount);
  const hasAttentionObservations = observations.length > 0;
  const hasFocusStarts = startCount > 0;
  const hasTasks = hierarchyTasks.length > 0;
  const hasSuggestionReviews = reviewableSuggestionCount > 0;

  return {
    generatedAt,
    outcomeMetrics: [
      {
        detail: hasAttentionObservations
          ? `${focusedSampleCount} focused / ${observations.length} user-provided calibration samples; average score ${formatPercent(learningReport.attention.averageScore)}`
          : 'No user-provided attention observations.',
        id: 'attention-ratio',
        label: 'Attention ratio',
        status: hasAttentionObservations
          ? learningReport.attention.averageScore >= 0.7
            ? 'steady'
            : 'watch'
          : 'no-data',
        value: hasAttentionObservations
          ? formatPercent(ratio(focusedSampleCount, observations.length))
          : 'No data',
      },
      {
        detail: hasAttentionObservations
          ? `${switchingSignalCount} user-reported switching signal${switchingSignalCount === 1 ? '' : 's'}; volatility ${formatPercent(learningReport.attention.volatility)}`
          : 'No user-provided attention observations.',
        id: 'switching-pressure',
        label: 'Switching pressure',
        status: hasAttentionObservations
          ? switchingSignalCount > 0 || learningReport.attention.volatility >= 0.25
            ? 'watch'
            : 'steady'
          : 'no-data',
        value: hasAttentionObservations
          ? formatPercent(ratio(switchingSignalCount, observations.length))
          : 'No data',
      },
      {
        detail: `${recoveryCueCount} resume cue${recoveryCueCount === 1 ? '' : 's'} after pause or interruption`,
        id: 'recovery-cues',
        label: 'Recovery cues',
        status: recoveryCueCount > 0 ? 'steady' : 'watch',
        value: recoveryCueCount.toString(),
      },
      {
        detail: hasFocusStarts
          ? `${completionCount} completed focus transition${completionCount === 1 ? '' : 's'} / ${startCount} start${startCount === 1 ? '' : 's'}`
          : 'No focus starts recorded yet.',
        id: 'focus-success',
        label: 'Focus success',
        status: hasFocusStarts
          ? ratio(completionCount, startCount) >= 0.5
            ? 'steady'
            : 'watch'
          : 'no-data',
        value: hasFocusStarts ? formatPercent(ratio(completionCount, startCount)) : 'No data',
      },
      {
        detail: hasTasks
          ? `${completedTaskCount} completed / ${hierarchyTasks.length} task-layer item${hierarchyTasks.length === 1 ? '' : 's'}`
          : 'No task-layer items recorded yet.',
        id: 'plan-fulfillment',
        label: 'Plan fulfillment',
        status: hasTasks
          ? ratio(completedTaskCount, hierarchyTasks.length) >= 0.25
            ? 'steady'
            : 'watch'
          : 'no-data',
        value: hasTasks
          ? formatPercent(ratio(completedTaskCount, hierarchyTasks.length))
          : 'No data',
      },
    ],
    guardrailMetrics: [
      {
        detail: reminderSettings.remindersEnabled
          ? `${reminderSettings.frequencyMinutes} min cadence outside quiet hours${
              reminderSettings.integration.enabled
                ? `; integration cap ${reminderSettings.integration.dailyPromptLimit}/day across ${reminderSettings.integration.channels.length} channel${reminderSettings.integration.channels.length === 1 ? '' : 's'}`
                : ''
            }`
          : 'Native reminders are off; no scheduled prompt load',
        id: 'reminder-fatigue',
        label: 'Reminder load',
        status: reminderPromptBudget > 16 ? 'review' : 'steady',
        value: `${reminderPromptBudget}/day`,
      },
      {
        detail: `${manualCaptureCount} manual capture/audit input${manualCaptureCount === 1 ? '' : 's'}; ${formatDecimal(manualCapturePerCompletion)} per completed focus`,
        id: 'recording-friction',
        label: 'Recording friction',
        status: manualCapturePerCompletion > 3 ? 'review' : 'steady',
        value: formatDecimal(manualCapturePerCompletion),
      },
      {
        detail: `${reviewableSuggestionCount} human-reviewed AI suggestion${reviewableSuggestionCount === 1 ? '' : 's'}; ${autoAppliedSuggestionCount} auto-applied`,
        id: 'autonomy',
        label: 'Autonomy kept',
        status: autoAppliedSuggestionCount > 0 ? 'review' : 'steady',
        value: `${autoAppliedSuggestionCount} auto`,
      },
      {
        detail: hasSuggestionReviews
          ? `${rejectedSuggestionCount} rejected / ${reviewableSuggestionCount} reviewed; ${lowConfidenceSampleCount} low-confidence manual calibration sample${lowConfidenceSampleCount === 1 ? '' : 's'}`
          : `No reviewed AI suggestions; ${lowConfidenceSampleCount} low-confidence manual calibration sample${lowConfidenceSampleCount === 1 ? '' : 's'}`,
        id: 'misjudgment',
        label: 'Misjudgment signal',
        status: hasSuggestionReviews
          ? misjudgmentRatio >= 0.5 || lowConfidenceSampleCount > 0
            ? 'watch'
            : 'steady'
          : 'no-data',
        value: hasSuggestionReviews ? formatPercent(misjudgmentRatio) : 'No data',
      },
    ],
  };
}
