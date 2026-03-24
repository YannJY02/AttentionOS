import { beforeEach, describe, expect, it } from 'vitest';
import { AuditRepository } from '../src/repositories/audit';
import { asSupabaseClient, createMockSupabaseClient } from './helpers/mock-supabase';

const SAMPLE_LOG_ROW = {
  id: 'audit-001',
  actor: 'user',
  action: 'entity.create',
  target_id: 'ent-001',
  details: { title: 'New task' },
  created_at: '2026-03-24T00:00:00Z',
};

describe('AuditRepository', () => {
  let repo: AuditRepository;

  beforeEach(() => {
    const mock = createMockSupabaseClient([SAMPLE_LOG_ROW], null);
    repo = new AuditRepository(asSupabaseClient(mock));
  });

  it('log creates an audit entry', async () => {
    const mock = createMockSupabaseClient(SAMPLE_LOG_ROW, null);
    repo = new AuditRepository(asSupabaseClient(mock));
    const result = await repo.log({
      actor: 'user',
      action: 'entity.create',
      targetId: 'ent-001',
      details: { title: 'New task' },
    });
    expect(result).toMatchObject({ actor: 'user', action: 'entity.create' });
  });

  it('findByTarget returns entries for target', async () => {
    const results = await repo.findByTarget('ent-001');
    expect(Array.isArray(results)).toBe(true);
    expect(results[0]).toMatchObject({ targetId: 'ent-001' });
  });

  it('findByActor returns entries for actor', async () => {
    const results = await repo.findByActor('user');
    expect(Array.isArray(results)).toBe(true);
  });
});
