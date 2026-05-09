import { describe, expect, it } from 'vitest';
import { EmbeddingRepository } from '../src/repositories/embedding';
import { asSupabaseClient, createMockSupabaseClient } from './helpers/mock-supabase';

const SAMPLE_ROW = {
  id: 'emb-1',
  entity_id: 'ent-1',
  content_hash: 'hash-1',
  content: 'Write thesis',
  embedding: [1, 0, 0],
  metadata: { source: 'test' },
  model_id: 'text-embedding-3-small',
  model_version: '2026-05-09',
  model_dimensions: 3,
  privacy_level: 'L0',
  created_at: '2026-05-09T00:00:00Z',
  updated_at: '2026-05-09T00:00:00Z',
};

describe('EmbeddingRepository', () => {
  it('creates mapped embedding records', async () => {
    const repo = new EmbeddingRepository(asSupabaseClient(createMockSupabaseClient(SAMPLE_ROW)));
    const result = await repo.create({
      entityId: 'ent-1',
      contentHash: 'hash-1',
      content: 'Write thesis',
      embedding: [1, 0, 0],
      metadata: { source: 'test' },
      modelId: 'text-embedding-3-small',
      modelVersion: '2026-05-09',
      modelDimensions: 3,
      privacyLevel: 'L0',
    });

    expect(result).toMatchObject({ id: 'emb-1', entityId: 'ent-1', privacyLevel: 'L0' });
  });

  it('calls semantic match RPC for vector search', async () => {
    const repo = new EmbeddingRepository(asSupabaseClient(createMockSupabaseClient([SAMPLE_ROW])));
    const result = await repo.search({
      embedding: [1, 0, 0],
      matchCount: 3,
      matchThreshold: 0.7,
      maxPrivacyLevel: 'L1',
    });

    expect(result[0]?.id).toBe('emb-1');
  });
});
