import {
  type ActionRiskLevel,
  clamp,
  createId,
  DEFAULT_GUARDRAILS,
  DEFAULT_NUDGE_TYPE_BY_ACTION,
  DEFAULT_PRIORITY_PREEMPTION_CONFIG,
  type ExecutionGuardrailConfig,
  type InterventionOutcome,
  type MRTAssignment,
  type MRTEnrollment,
  type MRTProbability,
  type NudgeAction,
  type NudgeDecision,
  type NudgeDecisionContext,
  type NudgeStatsSnapshot,
  type PriorityPreemptionConfig,
} from '@attentionos/core';

export interface PolicyEvaluation {
  allowed: boolean;
  reason: string;
}

function isQuietHours(now: Date, config: ExecutionGuardrailConfig): boolean {
  const hour = now.getHours();
  const { startHour, endHour } = config.quietHours;

  if (startHour === endHour) {
    return false;
  }

  if (startHour < endHour) {
    return hour >= startHour && hour < endHour;
  }

  return hour >= startHour || hour < endHour;
}

export function evaluateNudgePolicy(
  stats: NudgeStatsSnapshot,
  now = new Date(),
  config: ExecutionGuardrailConfig = DEFAULT_GUARDRAILS,
): PolicyEvaluation {
  if (isQuietHours(now, config)) {
    return {
      allowed: false,
      reason: 'Quiet hours active',
    };
  }

  if (stats.nudgesToday >= config.dailyNudgeLimit) {
    return {
      allowed: false,
      reason: 'Daily nudge limit reached',
    };
  }

  if (stats.lastNudgeAt) {
    const minsSinceLast = (now.getTime() - new Date(stats.lastNudgeAt).getTime()) / 60000;

    if (minsSinceLast < config.minNudgeIntervalMinutes) {
      return {
        allowed: false,
        reason: `Nudge interval guardrail active (${Math.ceil(config.minNudgeIntervalMinutes - minsSinceLast)}m left)`,
      };
    }
  }

  return {
    allowed: true,
    reason: 'Within guardrails',
  };
}

export function decideNudgeAction(context: NudgeDecisionContext): {
  action: NudgeAction;
  reason: string;
  message: string;
} {
  if (context.stateEstimate.state === 'fatigued') {
    return {
      action: 'short_recovery',
      reason: 'Fatigue pattern detected',
      message: 'Take a 7-minute reset break and resume with one short next step.',
    };
  }

  if (context.switchesInLast30Min >= 8 || context.stateEstimate.state === 'overloaded') {
    return {
      action: 'switch_single_task',
      reason: 'Context switching cost is increasing',
      message: 'Pick one current next step for the next 20 minutes and park the rest.',
    };
  }

  if (context.deadlineRisk === 'high' && context.highPriorityTaskAvailable) {
    return {
      action: 'shorten_goal',
      reason: 'Deadline risk is high',
      message: 'Shrink scope to a single deliverable checkpoint before context expands.',
    };
  }

  if (context.minutesInCurrentTask >= 110) {
    return {
      action: 'defer_low_priority',
      reason: 'Overfocus risk detected',
      message: 'Defer low-priority threads and protect recovery before deepening this block.',
    };
  }

  return {
    action: 'continue_focus',
    reason: 'Current load is manageable',
    message: 'Continue current focus block and log the next-step bridge now.',
  };
}

export function buildNudgeDecision(
  context: NudgeDecisionContext,
  stats: NudgeStatsSnapshot,
  now = new Date(),
  config: ExecutionGuardrailConfig = DEFAULT_GUARDRAILS,
): NudgeDecision {
  const policy = evaluateNudgePolicy(stats, now, config);
  const recommendation = decideNudgeAction(context);

  return {
    id: createId('nudge'),
    timestamp: now.toISOString(),
    allowed: policy.allowed,
    action: recommendation.action,
    type: DEFAULT_NUDGE_TYPE_BY_ACTION[recommendation.action],
    message: recommendation.message,
    reason: policy.allowed ? recommendation.reason : policy.reason,
  };
}

export function shouldApplyPriorityPreemption(
  context: Pick<NudgeDecisionContext, 'deadlineRisk' | 'highPriorityTaskAvailable'>,
  config: PriorityPreemptionConfig = DEFAULT_PRIORITY_PREEMPTION_CONFIG,
): boolean {
  if (!config.enabled) {
    return false;
  }

  if (config.requireHighPriorityTask && !context.highPriorityTaskAvailable) {
    return false;
  }

  if (config.requireDeadlineHigh && context.deadlineRisk !== 'high') {
    return false;
  }

  return true;
}

export function assignMRTIntervention(
  contextId: string,
  userId: string,
  enrollment: MRTEnrollment,
  random = Math.random,
  now = new Date(),
): MRTAssignment {
  const weights = enrollment.probabilities.filter((item) => item.weight > 0);

  const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0);
  if (totalWeight === 0 || weights.length === 0) {
    throw new Error('MRT probabilities are invalid; total weight is zero.');
  }

  let draw = random() * totalWeight;
  // Safe: weights.length > 0 guaranteed by the guard above
  // biome-ignore lint/style/noNonNullAssertion: length checked above
  let selected: MRTProbability = weights[weights.length - 1]!;

  for (const item of weights) {
    draw -= item.weight;
    if (draw <= 0) {
      selected = item;
      break;
    }
  }

  return {
    id: createId('mrt_assign'),
    userId,
    timestamp: now.toISOString(),
    contextId,
    action: selected.action,
    probability: selected.weight / totalWeight,
  };
}

export function calculateInterventionReward(outcome: {
  focusMinutesAfterNudge: number;
  switchReduction: number;
  accepted: boolean;
}): number {
  const focusComponent = clamp(outcome.focusMinutesAfterNudge / 40);
  const switchComponent = clamp(outcome.switchReduction / 6);
  const acceptanceBoost = outcome.accepted ? 0.1 : -0.1;

  return Number(
    clamp(0.55 * focusComponent + 0.45 * switchComponent + acceptanceBoost, 0, 1).toFixed(4),
  );
}

export function buildInterventionOutcome(
  payload: Omit<InterventionOutcome, 'id' | 'reward' | 'timestamp'>,
  now = new Date(),
): InterventionOutcome {
  const reward = calculateInterventionReward(payload);

  return {
    id: createId('mrt_outcome'),
    timestamp: now.toISOString(),
    reward,
    ...payload,
  };
}

export function isActionAllowlisted(
  action: string,
  config: ExecutionGuardrailConfig = DEFAULT_GUARDRAILS,
): boolean {
  return config.allowlistedActions.includes(action);
}

export function canAutoLaunchApp(
  appName: string,
  config: ExecutionGuardrailConfig = DEFAULT_GUARDRAILS,
): boolean {
  return config.autoLaunchAllowlist.includes(appName);
}

const HIGH_IMPACT_ACTION_TYPES = new Set<string>([
  'planner.commit_calendar',
  'external.calendar.write',
  'external.tasks.write',
  'external.message.send',
  'workitems.batch_update',
  'plugin.executor.run',
]);

export interface ActionConfirmationPolicyInput {
  actionType: string;
  payload?: Record<string, unknown>;
}

export interface ActionConfirmationPolicyResult {
  riskLevel: ActionRiskLevel;
  requiresConfirmation: boolean;
  reason: string;
}

export function evaluateActionConfirmationPolicy(
  input: ActionConfirmationPolicyInput,
): ActionConfirmationPolicyResult {
  const actionType = input.actionType.trim().toLowerCase();
  const payload = input.payload ?? {};

  const explicitRisk =
    typeof payload.riskLevel === 'string' ? payload.riskLevel.toLowerCase() : undefined;
  if (explicitRisk && ['low', 'medium', 'high', 'critical'].includes(explicitRisk)) {
    const riskLevel = explicitRisk as ActionRiskLevel;
    const requiresConfirmation = riskLevel === 'high' || riskLevel === 'critical';
    return {
      riskLevel,
      requiresConfirmation,
      reason: `Explicit risk level: ${riskLevel}`,
    };
  }

  const batchCount =
    typeof payload.batchCount === 'number' && Number.isFinite(payload.batchCount)
      ? Math.max(0, Math.floor(payload.batchCount))
      : 0;

  const isExternal = payload.external === true || payload.crossAppWrite === true;

  if (actionType.startsWith('external.') && actionType.endsWith('.send')) {
    return {
      riskLevel: 'critical',
      requiresConfirmation: true,
      reason: 'External outbound action requires explicit confirmation',
    };
  }

  if (HIGH_IMPACT_ACTION_TYPES.has(actionType)) {
    return {
      riskLevel: 'high',
      requiresConfirmation: true,
      reason: `High-impact action type: ${actionType}`,
    };
  }

  if (isExternal) {
    return {
      riskLevel: 'high',
      requiresConfirmation: true,
      reason: 'Cross-application write detected',
    };
  }

  if (batchCount >= 5) {
    return {
      riskLevel: 'high',
      requiresConfirmation: true,
      reason: `Batch mutation size ${batchCount} exceeds confirmation threshold`,
    };
  }

  if (actionType.includes('delete') || actionType.includes('remove')) {
    return {
      riskLevel: 'medium',
      requiresConfirmation: true,
      reason: 'Destructive intent requires confirmation',
    };
  }

  return {
    riskLevel: 'low',
    requiresConfirmation: false,
    reason: 'Low-risk action under default policy',
  };
}
