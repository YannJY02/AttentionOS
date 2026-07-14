import { describe, expect, it } from 'vitest';
import { estimateAttentionState, suggestProbeCadence } from '../src/attention';

describe('attention guidance', () => {
  it('combines available signals without performing I/O', () => {
    const estimate = estimateAttentionState({
      now: new Date('2026-05-09T10:00:00.000Z'),
      observation: {
        id: 'observation-1',
        passive: {
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
      probe: {
        id: 'probe-1',
        inhibitionErrorRate: 0.05,
        reactionTimeMs: 500,
        timestamp: '2026-05-09T10:00:00.000Z',
        trialCount: 12,
      },
    });

    expect(estimate).toMatchObject({
      confidence: 1,
      state: 'focused',
      timestamp: '2026-05-09T10:00:00.000Z',
    });
    expect(estimate.score).toBeGreaterThan(0.75);
    expect(suggestProbeCadence(estimate.state).recommendedInMinutes).toBe(180);
  });
});
