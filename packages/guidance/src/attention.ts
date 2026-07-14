import type {
  AttentionEstimate,
  AttentionObservation,
  AttentionState,
  ReportedBehaviorSignal,
  ReportedPerformanceSignal,
} from './types';

export interface EstimatorInput {
  observation?: AttentionObservation;
  reportedBehaviorSignal?: ReportedBehaviorSignal;
  reportedPerformance?: ReportedPerformanceSignal;
  now?: Date;
}

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function normalizeLikertToUnit(value: number, min = 1, max = 5): number {
  return max <= min ? 0 : clamp((value - min) / (max - min));
}

function createEstimateId(): string {
  const randomPart =
    globalThis.crypto && 'randomUUID' in globalThis.crypto
      ? globalThis.crypto.randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;

  return `est_${randomPart.replace(/-/g, '').slice(0, 12)}`;
}

function scoreSubjective(observation?: AttentionObservation): number {
  if (!observation) {
    return 0.5;
  }

  const clarity = normalizeLikertToUnit(observation.subjective.clarity);
  const energy = normalizeLikertToUnit(observation.subjective.energy);
  const distractibility = 1 - normalizeLikertToUnit(observation.subjective.distractibility);
  const stress = observation.subjective.stress
    ? 1 - normalizeLikertToUnit(observation.subjective.stress)
    : 0.5;

  return clamp(0.35 * clarity + 0.3 * energy + 0.25 * distractibility + 0.1 * stress);
}

function scoreReportedBehavior(signal?: ReportedBehaviorSignal): number {
  if (!signal) {
    return 0.5;
  }

  const switchPenalty = clamp(signal.appSwitchesLast15Min / 20);
  const fragmentPenalty = clamp(signal.fragmentedSessionCount / 8);

  const circadianBoost = signal.hourOfDay >= 9 && signal.hourOfDay <= 12 ? 0.1 : 0;
  const categoryPenalty = signal.foregroundCategory === 'social' ? 0.15 : 0;

  return clamp(
    1 - 0.45 * switchPenalty - 0.35 * fragmentPenalty - categoryPenalty + circadianBoost,
  );
}

function scoreReportedPerformance(signal?: ReportedPerformanceSignal): number {
  if (!signal) {
    return 0.5;
  }

  const rtScore = clamp((1800 - signal.reactionTimeMs) / 1400);
  const inhibitionScore = clamp(1 - signal.inhibitionErrorRate);

  return clamp(0.6 * rtScore + 0.4 * inhibitionScore);
}

function classifyState(score: number, subjectiveEnergy?: number): AttentionState {
  if (score >= 0.75) {
    return 'focused';
  }

  if (score >= 0.55) {
    return 'drifting';
  }

  if (subjectiveEnergy !== undefined && subjectiveEnergy <= 2) {
    return 'fatigued';
  }

  return score >= 0.35 ? 'overloaded' : 'fatigued';
}

export function estimateAttentionState(input: EstimatorInput): AttentionEstimate {
  const subjectiveScore = scoreSubjective(input.observation);
  const reportedBehaviorScore = scoreReportedBehavior(
    input.reportedBehaviorSignal ?? input.observation?.reportedBehavior,
  );
  const reportedPerformanceScore = scoreReportedPerformance(input.reportedPerformance);

  const score = clamp(
    0.45 * subjectiveScore + 0.3 * reportedBehaviorScore + 0.25 * reportedPerformanceScore,
  );

  const availableSignals = [
    input.observation,
    input.reportedBehaviorSignal ?? input.observation?.reportedBehavior,
    input.reportedPerformance,
  ].filter(Boolean).length;

  const confidence = clamp(0.4 + availableSignals * 0.2);
  const uncertainty = clamp(
    1 - confidence + Math.abs(subjectiveScore - reportedBehaviorScore) * 0.2,
  );

  const state = classifyState(score, input.observation?.subjective.energy);
  const reasons: string[] = [];

  if (reportedBehaviorScore < 0.45) {
    reasons.push('User-reported switching or fragmented sessions are high.');
  }

  if (subjectiveScore < 0.45) {
    reasons.push('Self-report indicates low energy or high distractibility.');
  }

  if (reportedPerformanceScore < 0.45) {
    reasons.push('User-reported reaction or inhibition measures indicate strain.');
  }

  if (reasons.length === 0) {
    reasons.push('Signals are stable and support sustained focus.');
  }

  return {
    id: createEstimateId(),
    timestamp: (input.now ?? new Date()).toISOString(),
    state,
    score,
    confidence,
    uncertainty,
    reasons,
    breakdown: {
      subjectiveScore,
      reportedBehaviorScore,
      reportedPerformanceScore,
    },
  };
}

export function suggestCalibrationCadence(state: AttentionState): {
  recommendedInMinutes: number;
  reason: string;
} {
  switch (state) {
    case 'focused':
      return {
        recommendedInMinutes: 180,
        reason: 'User is stable; keep calibration check-ins infrequent to avoid interruptions.',
      };
    case 'drifting':
      return {
        recommendedInMinutes: 90,
        reason: 'Mild drift detected; a later calibration check-in may support correction.',
      };
    case 'overloaded':
      return {
        recommendedInMinutes: 60,
        reason: 'Overload risk is elevated; calibrate again after a short intervention.',
      };
    case 'fatigued':
      return {
        recommendedInMinutes: 120,
        reason: 'Fatigue state; avoid repeated check-ins and prioritize recovery.',
      };
  }
}
