import { beforeEach, describe, expect, it } from 'vitest';
import {
  getLatestAttentionObservation,
  LEARNING_OBSERVATIONS_STORAGE_KEY,
  recordAttentionCalibration,
} from './learning';

describe('attention calibration storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('records a local attention estimate from subjective and behavior signals', () => {
    const result = recordAttentionCalibration({
      appSwitchesLast15Min: 1,
      clarity: 5,
      distractibility: 1,
      energy: 5,
      foregroundCategory: 'work',
      fragmentedSessionCount: 0,
      inhibitionErrorRate: 0.02,
      reactionTimeMs: 520,
      selfReportedDifficulty: 1,
      stress: 1,
      trialCount: 8,
    });

    expect(result.observation).toMatchObject({
      breakdown: expect.objectContaining({
        behavioralScore: expect.any(Number),
        passiveScore: expect.any(Number),
        subjectiveScore: expect.any(Number),
      }),
      confidence: expect.any(Number),
      state: 'focused',
    });
    expect(result.probeCadence.recommendedInMinutes).toBeGreaterThan(0);
    expect(getLatestAttentionObservation()?.id).toBe(result.observation.id);
    expect(localStorage.getItem(LEARNING_OBSERVATIONS_STORAGE_KEY)).toContain(
      result.observation.id,
    );
  });

  it('stores user correction as calibration evidence without losing signal breakdown', () => {
    const result = recordAttentionCalibration({
      appSwitchesLast15Min: 0,
      clarity: 5,
      correctedState: 'overloaded',
      distractibility: 1,
      energy: 5,
      foregroundCategory: 'work',
      fragmentedSessionCount: 0,
      inhibitionErrorRate: 0.01,
      reactionTimeMs: 450,
      selfReportedDifficulty: 1,
      stress: 1,
      trialCount: 8,
    });

    expect(result.correctedFrom).toBe('focused');
    expect(result.observation).toMatchObject({
      confidence: 0.72,
      state: 'overloaded',
    });
    expect(result.observation.reasons).toEqual(
      expect.arrayContaining([expect.stringMatching(/user corrected estimate/i)]),
    );
    expect(result.observation.breakdown.subjectiveScore).toBeGreaterThan(0.8);
  });
});
