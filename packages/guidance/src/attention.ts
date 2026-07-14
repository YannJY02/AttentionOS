import type {
  ActiveProbeResult,
  AttentionEstimate,
  AttentionObservation,
  AttentionState,
  PassiveSignal,
} from './types';

export interface EstimatorInput {
  observation?: AttentionObservation;
  passiveSignal?: PassiveSignal;
  probe?: ActiveProbeResult;
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

function scorePassive(signal?: PassiveSignal): number {
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

function scoreBehavior(probe?: ActiveProbeResult): number {
  if (!probe) {
    return 0.5;
  }

  const rtScore = clamp((1800 - probe.reactionTimeMs) / 1400);
  const inhibitionScore = clamp(1 - probe.inhibitionErrorRate);
  const difficultyPenalty = probe.selfReportedDifficulty
    ? clamp(normalizeLikertToUnit(probe.selfReportedDifficulty)) * 0.2
    : 0;

  return clamp(0.6 * rtScore + 0.4 * inhibitionScore - difficultyPenalty);
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
  const passiveScore = scorePassive(input.passiveSignal ?? input.observation?.passive);
  const behavioralScore = scoreBehavior(input.probe);

  const score = clamp(0.45 * subjectiveScore + 0.3 * passiveScore + 0.25 * behavioralScore);

  const availableSignals = [
    input.observation,
    input.passiveSignal ?? input.observation?.passive,
    input.probe,
  ].filter(Boolean).length;

  const confidence = clamp(0.4 + availableSignals * 0.2);
  const uncertainty = clamp(1 - confidence + Math.abs(subjectiveScore - passiveScore) * 0.2);

  const state = classifyState(score, input.observation?.subjective.energy);
  const reasons: string[] = [];

  if (passiveScore < 0.45) {
    reasons.push('High switching or fragmented sessions detected.');
  }

  if (subjectiveScore < 0.45) {
    reasons.push('Self-report indicates low energy or high distractibility.');
  }

  if (behavioralScore < 0.45) {
    reasons.push('Probe suggests slower reaction or inhibition strain.');
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
      passiveScore,
      behavioralScore,
    },
  };
}

export function suggestProbeCadence(state: AttentionState): {
  recommendedInMinutes: number;
  reason: string;
} {
  switch (state) {
    case 'focused':
      return {
        recommendedInMinutes: 180,
        reason: 'User is stable; keep probe cadence low to avoid interruptions.',
      };
    case 'drifting':
      return {
        recommendedInMinutes: 90,
        reason: 'Mild drift detected; medium cadence helps early correction.',
      };
    case 'overloaded':
      return {
        recommendedInMinutes: 60,
        reason: 'Overload risk is elevated; check again after short intervention.',
      };
    case 'fatigued':
      return {
        recommendedInMinutes: 120,
        reason: 'Fatigue state; avoid over-testing and prioritize recovery.',
      };
  }
}
