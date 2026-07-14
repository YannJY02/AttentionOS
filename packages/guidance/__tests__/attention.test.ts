import { describe, expect, it } from 'vitest';
import { estimateAttentionState, suggestCalibrationCadence } from '../src/attention';

describe('attention guidance', () => {
  it('combines available signals without performing I/O', () => {
    const estimate = estimateAttentionState({
      now: new Date('2026-05-09T10:00:00.000Z'),
      observation: {
        id: 'observation-1',
        reportedBehavior: {
          appSwitchesLast15Min: 2,
          foregroundCategory: 'work',
          fragmentedSessionCount: 1,
          hourOfDay: 10,
          timestamp: '2026-05-09T10:00:00.000Z',
        },
        source: 'integration',
        subjective: {
          clarity: 5,
          distractibility: 1,
          energy: 5,
          stress: 1,
        },
        timestamp: '2026-05-09T10:00:00.000Z',
      },
      reportedPerformance: {
        inhibitionErrorRate: 0.05,
        reactionTimeMs: 500,
        timestamp: '2026-05-09T10:00:00.000Z',
      },
    });

    expect(estimate).toMatchObject({
      breakdown: expect.objectContaining({
        reportedBehaviorScore: expect.any(Number),
      }),
      confidence: 1,
      state: 'focused',
      timestamp: '2026-05-09T10:00:00.000Z',
    });
    expect(estimate.score).toBeGreaterThan(0.75);
    expect(estimate.breakdown.reportedPerformanceScore).toBeGreaterThan(0.8);
    expect(suggestCalibrationCadence(estimate.state).recommendedInMinutes).toBe(180);
  });

  it('labels explicitly reported switching without inventing subjective or performance input', () => {
    const estimate = estimateAttentionState({
      now: new Date('2026-05-09T20:00:00.000Z'),
      reportedBehaviorSignal: {
        appSwitchesLast15Min: 20,
        foregroundCategory: 'social',
        fragmentedSessionCount: 8,
        hourOfDay: 20,
        timestamp: '2026-05-09T20:00:00.000Z',
      },
    });

    expect(estimate.breakdown).toMatchObject({
      reportedPerformanceScore: 0.5,
      subjectiveScore: 0.5,
    });
    expect(estimate.reasons).toContain('User-reported switching or fragmented sessions are high.');
  });

  it('describes manually reported reaction and inhibition measures without claiming a probe', () => {
    const estimate = estimateAttentionState({
      now: new Date('2026-05-09T20:00:00.000Z'),
      reportedPerformance: {
        inhibitionErrorRate: 0.9,
        reactionTimeMs: 1700,
        timestamp: '2026-05-09T20:00:00.000Z',
      },
    });

    expect(estimate.reasons).toContain(
      'User-reported reaction or inhibition measures indicate strain.',
    );
    expect(estimate.reasons.join(' ')).not.toMatch(/probe/i);
  });
});
