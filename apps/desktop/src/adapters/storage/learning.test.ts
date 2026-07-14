import { beforeEach, describe, expect, it } from 'vitest';
import {
  getLatestAttentionObservation,
  LEARNING_OBSERVATIONS_STORAGE_KEY,
  readLearningObservations,
  recordAttentionCalibration,
} from './learning';

describe('attention calibration storage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('starts with zero observations without persisting synthetic evidence', () => {
    expect(readLearningObservations()).toEqual([]);
    expect(getLatestAttentionObservation()).toBeNull();
    expect(localStorage.getItem(LEARNING_OBSERVATIONS_STORAGE_KEY)).toBeNull();
  });

  it('removes known legacy synthetic seeds and labels retained legacy manual evidence', () => {
    localStorage.setItem(
      LEARNING_OBSERVATIONS_STORAGE_KEY,
      JSON.stringify([
        {
          breakdown: {
            behavioralScore: 0.82,
            passiveScore: 0.78,
            subjectiveScore: 0.86,
          },
          confidence: 0.88,
          id: 'obs-focus-default',
          observedAt: '2026-05-09T08:30:00.000Z',
          reasons: ['completed a bounded task block'],
          score: 0.82,
          state: 'focused',
        },
        {
          breakdown: {
            behavioralScore: 0.6,
            passiveScore: 0.58,
            subjectiveScore: 0.62,
          },
          confidence: 0.7,
          id: 'obs-user-legacy',
          observedAt: '2026-05-10T08:30:00.000Z',
          reasons: ['User confirmed drifting estimate.'],
          score: 0.6,
          state: 'drifting',
        },
      ]),
    );

    expect(readLearningObservations()).toEqual([
      expect.objectContaining({
        breakdown: {
          reportedBehaviorScore: 0.58,
          reportedPerformanceScore: 0.6,
          subjectiveScore: 0.62,
        },
        id: 'obs-user-legacy',
        source: 'legacy_manual_calibration',
      }),
    ]);
    expect(localStorage.getItem(LEARNING_OBSERVATIONS_STORAGE_KEY)).not.toContain(
      'obs-focus-default',
    );
    expect(localStorage.getItem(LEARNING_OBSERVATIONS_STORAGE_KEY)).not.toContain('passiveScore');
    expect(localStorage.getItem(LEARNING_OBSERVATIONS_STORAGE_KEY)).not.toContain(
      'behavioralScore',
    );
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
    });

    expect(result.observation).toMatchObject({
      breakdown: expect.objectContaining({
        reportedBehaviorScore: expect.any(Number),
        reportedPerformanceScore: expect.any(Number),
        subjectiveScore: expect.any(Number),
      }),
      confidence: expect.any(Number),
      source: 'manual_calibration',
      state: 'focused',
    });
    expect(result.calibrationCadence.recommendedInMinutes).toBeGreaterThan(0);
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
