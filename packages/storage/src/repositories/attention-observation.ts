import type { V2AttentionObservationRecord } from '@attentionos/core';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface AttentionObservationWindow {
  readonly endedAt: string;
  readonly limit?: number;
  readonly startedAt: string;
}

interface AttentionObservationRow {
  id: string;
  state: V2AttentionObservationRecord['state'];
  score: number;
  confidence: number;
  breakdown: V2AttentionObservationRecord['breakdown'];
  reasons: string[];
  observed_at: string;
}

function rowToAttentionObservation(row: AttentionObservationRow): V2AttentionObservationRecord {
  return {
    id: row.id,
    state: row.state,
    score: row.score,
    confidence: row.confidence,
    breakdown: row.breakdown,
    reasons: row.reasons ?? [],
    observedAt: row.observed_at,
  };
}

export class AttentionObservationRepository {
  constructor(private readonly db: SupabaseClient) {}

  async findWindow(window: AttentionObservationWindow): Promise<V2AttentionObservationRecord[]> {
    let query = this.db
      .from('attention_observations')
      .select('*')
      .gte('observed_at', window.startedAt)
      .lte('observed_at', window.endedAt)
      .order('observed_at', { ascending: true });

    if (window.limit) query = query.limit(window.limit);

    const { data, error } = await query;

    if (error) throw new Error(`AttentionObservationRepository.findWindow: ${error.message}`);
    return (data ?? []).map(rowToAttentionObservation);
  }
}
