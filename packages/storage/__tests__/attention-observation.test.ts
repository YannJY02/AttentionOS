import { describe, expect, it } from 'vitest';
import { AttentionObservationRepository } from '../src/repositories/attention-observation';
import { asSupabaseClient, createMockSupabaseClient } from './helpers/mock-supabase';

const SAMPLE_ROW = {
  id: 'obs-1',
  state: 'focused',
  score: 0.84,
  confidence: 0.9,
  breakdown: {
    behavioralScore: 0.8,
    passiveScore: 0.82,
    subjectiveScore: 0.9,
  },
  reasons: ['timer completed'],
  observed_at: '2026-05-09T09:00:00.000Z',
};

describe('AttentionObservationRepository', () => {
  it('reads attention observation windows with V2 field names', async () => {
    const repo = new AttentionObservationRepository(
      asSupabaseClient(createMockSupabaseClient([SAMPLE_ROW])),
    );

    const results = await repo.findWindow({
      endedAt: '2026-05-09T10:00:00.000Z',
      startedAt: '2026-05-09T08:00:00.000Z',
    });

    expect(results).toEqual([
      expect.objectContaining({
        id: 'obs-1',
        observedAt: '2026-05-09T09:00:00.000Z',
        state: 'focused',
      }),
    ]);
  });
});
