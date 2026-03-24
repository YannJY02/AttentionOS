import { beforeEach, describe, expect, it } from 'vitest';
import { EdgeRepository } from '../src/repositories/edge';
import { asSupabaseClient, createMockSupabaseClient } from './helpers/mock-supabase';

const SAMPLE_EDGE_ROW = {
  id: 'edge-001',
  source_id: 'ent-001',
  target_id: 'ent-002',
  relation_type: 'parent_of',
  weight: 1.0,
  metadata: {},
  created_at: '2026-03-24T00:00:00Z',
};

describe('EdgeRepository', () => {
  let repo: EdgeRepository;

  beforeEach(() => {
    const mock = createMockSupabaseClient([SAMPLE_EDGE_ROW], null);
    repo = new EdgeRepository(asSupabaseClient(mock));
  });

  it('findBySource returns edges for source entity', async () => {
    const results = await repo.findBySource('ent-001');
    expect(Array.isArray(results)).toBe(true);
    expect(results[0]).toMatchObject({ sourceId: 'ent-001', relationType: 'parent_of' });
  });

  it('findByTarget returns edges for target entity', async () => {
    const results = await repo.findByTarget('ent-002');
    expect(Array.isArray(results)).toBe(true);
  });

  it('create returns new edge', async () => {
    const mock = createMockSupabaseClient(SAMPLE_EDGE_ROW, null);
    repo = new EdgeRepository(asSupabaseClient(mock));
    const result = await repo.create({
      sourceId: 'ent-001',
      targetId: 'ent-002',
      relationType: 'parent_of',
      weight: 1.0,
      metadata: {},
    });
    expect(result).toMatchObject({ sourceId: 'ent-001', targetId: 'ent-002' });
  });

  it('delete calls through without error', async () => {
    const mock = createMockSupabaseClient(null, null);
    repo = new EdgeRepository(asSupabaseClient(mock));
    await expect(repo.delete('edge-001')).resolves.not.toThrow();
  });
});
