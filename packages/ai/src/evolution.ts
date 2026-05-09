import type {
  AISuggestion,
  BehaviorPatternReport,
  CreateWorkflowOptimizationSuggestionInput,
  LearningWindow,
  SuggestionAdoptionSummary,
  V2AttentionObservationRecord,
  V2AuditLogEntry,
  V2Entity,
  WorkflowOptimizationAction,
} from '@attentionos/core';

export interface AnalyzeBehaviorPatternsInput {
  readonly attention: readonly V2AttentionObservationRecord[];
  readonly audit: readonly V2AuditLogEntry[];
  readonly suggestions: readonly AISuggestion<object>[];
  readonly tasks: readonly V2Entity[];
  readonly window: LearningWindow;
}

function isInsideWindow(timestamp: string | undefined, window: LearningWindow): boolean {
  if (!timestamp) return false;
  const time = Date.parse(timestamp);
  return time >= Date.parse(window.startedAt) && time <= Date.parse(window.endedAt);
}

function roundRatio(value: number): number {
  return Number.isFinite(value) ? Number(value.toFixed(4)) : 0;
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function dominantState(attention: readonly V2AttentionObservationRecord[]): string | null {
  const counts = new Map<string, number>();
  for (const observation of attention) {
    counts.set(observation.state, (counts.get(observation.state) ?? 0) + 1);
  }

  return [...counts.entries()].sort((left, right) => right[1] - left[1])[0]?.[0] ?? null;
}

function calculateVolatility(attention: readonly V2AttentionObservationRecord[]): number {
  if (attention.length < 2) return 0;
  const ordered = [...attention].sort(
    (left, right) => Date.parse(left.observedAt) - Date.parse(right.observedAt),
  );
  const deltas: number[] = [];
  for (let index = 1; index < ordered.length; index += 1) {
    const previous = ordered[index - 1];
    const current = ordered[index];
    if (previous && current) {
      deltas.push(Math.abs(current.score - previous.score));
    }
  }
  return roundRatio(average(deltas));
}

export function measureSuggestionAdoption(
  suggestions: readonly AISuggestion<object>[],
): SuggestionAdoptionSummary {
  const appliedSuggestions = suggestions.filter((item) => item.status === 'applied').length;
  const approvedSuggestions = suggestions.filter((item) => item.status === 'approved').length;
  const rejectedSuggestions = suggestions.filter((item) => item.status === 'rejected').length;
  const pendingSuggestions = suggestions.filter((item) => item.status === 'pending').length;
  const acceptedSuggestions = appliedSuggestions + approvedSuggestions;
  const reviewableSuggestions = acceptedSuggestions + rejectedSuggestions;

  return {
    acceptedSuggestions,
    adoptionRate:
      reviewableSuggestions === 0 ? 0 : roundRatio(acceptedSuggestions / reviewableSuggestions),
    appliedSuggestions,
    pendingSuggestions,
    rejectedSuggestions,
    reviewableSuggestions,
    totalSuggestions: suggestions.length,
  };
}

export function analyzeBehaviorPatterns({
  attention,
  audit,
  suggestions,
  tasks,
  window,
}: AnalyzeBehaviorPatternsInput): BehaviorPatternReport {
  const windowedAttention = attention.filter((item) => isInsideWindow(item.observedAt, window));
  const windowedTasks = tasks.filter((task) => {
    return isInsideWindow(task.createdAt, window) || isInsideWindow(task.updatedAt, window);
  });
  const windowedSuggestions = suggestions.filter((suggestion) => {
    return (
      isInsideWindow(suggestion.createdAt, window) || isInsideWindow(suggestion.updatedAt, window)
    );
  });
  const completedTransitionCount = audit.filter(
    (entry) =>
      isInsideWindow(entry.createdAt, window) &&
      entry.action === 'task.lifecycle.transition' &&
      entry.details.to === 'done',
  ).length;

  const scores = windowedAttention.map((item) => item.score);
  const completedTasks = windowedTasks.filter((task) => task.status === 'completed').length;
  const activeTasks = windowedTasks.filter((task) => task.status === 'active').length;
  const oversizedActiveTaskCount = windowedTasks.filter((task) => {
    if (task.status !== 'active') return false;
    const estimate = task.properties.estimatedMinutes;
    return typeof estimate === 'number' && estimate > 120;
  }).length;

  const evidence = [
    `${windowedAttention.length} attention observations analyzed`,
    `${completedTasks} completed task(s), ${activeTasks} active task(s)`,
    `${completedTransitionCount} completion transition(s) recorded`,
  ];

  return {
    adoption: measureSuggestionAdoption(windowedSuggestions),
    attention: {
      averageScore: roundRatio(average(scores)),
      dominantState: dominantState(windowedAttention),
      lowScoreRatio: roundRatio(
        windowedAttention.filter((observation) => observation.score < 0.5).length /
          Math.max(windowedAttention.length, 1),
      ),
      overloadedRatio: roundRatio(
        windowedAttention.filter(
          (observation) => observation.state === 'overloaded' || observation.state === 'fatigued',
        ).length / Math.max(windowedAttention.length, 1),
      ),
      sampleCount: windowedAttention.length,
      volatility: calculateVolatility(windowedAttention),
    },
    evidence,
    tasks: {
      activeTasks,
      completedTasks,
      completionRatio: roundRatio(completedTasks / Math.max(windowedTasks.length, 1)),
      oversizedActiveTaskCount,
      totalTasks: windowedTasks.length,
    },
    window,
  };
}

function confidenceFromReport(report: BehaviorPatternReport): number {
  const sampleWeight = Math.min(report.attention.sampleCount / 6, 1);
  const taskWeight = Math.min(report.tasks.totalTasks / 5, 1);
  return roundRatio(0.45 + sampleWeight * 0.3 + taskWeight * 0.25);
}

export function createWorkflowOptimizationSuggestions(
  report: BehaviorPatternReport,
): CreateWorkflowOptimizationSuggestionInput[] {
  const actions: WorkflowOptimizationAction[] = [];
  const evidence: string[] = [...report.evidence];

  if (report.tasks.oversizedActiveTaskCount > 0) {
    actions.push({
      label: 'Split oversized active tasks into next actions under 120 minutes.',
      metadata: { oversizedActiveTaskCount: report.tasks.oversizedActiveTaskCount },
      type: 'task.split',
    });
    evidence.push(
      `${report.tasks.oversizedActiveTaskCount} active task(s) exceed the size guardrail`,
    );
  }

  if (report.attention.overloadedRatio >= 0.33 || report.attention.averageScore < 0.6) {
    actions.push({
      label: 'Protect the next execution block from context switching.',
      metadata: {
        averageScore: report.attention.averageScore,
        overloadedRatio: report.attention.overloadedRatio,
      },
      type: 'schedule.focus_block',
    });
    evidence.push('attention signal shows overload or weak average score');
  }

  if (report.adoption.adoptionRate < 0.4 && report.adoption.reviewableSuggestions >= 3) {
    actions.push({
      label: 'Review rejected AI suggestions before increasing automation.',
      metadata: { adoptionRate: report.adoption.adoptionRate },
      type: 'workflow.review',
    });
    evidence.push('recent AI suggestion adoption is low');
  }

  if (actions.length === 0) return [];

  return [
    {
      approvalRequired: true,
      context: [],
      createdBy: 'agent:phase3',
      kind: 'workflow_optimization',
      payload: {
        actions,
        confidence: confidenceFromReport(report),
        evidence,
        privacyLevel: 'L1',
        targetStage: 'execution',
      },
      rationale: evidence.join('; '),
      status: 'pending',
      title: 'Adjust the next workflow cycle',
    },
  ];
}
