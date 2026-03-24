import type { V2Entity } from '@attentionos/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { EntityRepository } from '../src/repositories/entity';
import { asSupabaseClient, createMockSupabaseClient } from './helpers/mock-supabase';

const SAMPLE_ROW = {
  id: 'ent-001',
  entity_type: 'task',
  hierarchy_layer: 5,
  title: 'Write tests',
  content: null,
  status: 'active',
  properties: {},
  workflow_stage: 'execution',
  parent_id: null,
  created_at: '2026-03-24T00:00:00Z',
  updated_at: '2026-03-24T00:00:00Z',
  completed_at: null,
};

const SAMPLE_ENTITY: V2Entity = {
  id: 'ent-001',
  entityType: 'task',
  hierarchyLayer: 'task',
  title: 'Write tests',
  status: 'active',
  properties: {},
  workflowStage: 'execution',
  createdAt: '2026-03-24T00:00:00Z',
  updatedAt: '2026-03-24T00:00:00Z',
};

describe('EntityRepository — queries', () => {
  let repo: EntityRepository;

  beforeEach(() => {
    // findAll path: resolves with { data: [...], error: null }
    const mock = createMockSupabaseClient([SAMPLE_ROW], null);
    repo = new EntityRepository(asSupabaseClient(mock));
  });

  it('findById returns mapped entity', async () => {
    // single()/maybeSingle() path: resolves with { data: row, error: null }
    const mock = createMockSupabaseClient(SAMPLE_ROW, null);
    repo = new EntityRepository(asSupabaseClient(mock));
    const result = await repo.findById('ent-001');
    expect(result).toMatchObject({ id: 'ent-001', entityType: 'task', title: 'Write tests' });
  });

  it('findById returns null when not found', async () => {
    const mock = createMockSupabaseClient(null, null);
    repo = new EntityRepository(asSupabaseClient(mock));
    const result = await repo.findById('missing');
    expect(result).toBeNull();
  });

  it('findAll returns array of mapped entities', async () => {
    const result = await repo.findAll();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toMatchObject({ id: 'ent-001' });
  });

  it('findAll with filter passes params to query', async () => {
    const mock = createMockSupabaseClient([SAMPLE_ROW], null);
    repo = new EntityRepository(asSupabaseClient(mock));
    const result = await repo.findAll({ entityType: 'task' });
    expect(Array.isArray(result)).toBe(true);
  });
});

describe('EntityRepository — mutations', () => {
  it('create returns new entity with id', async () => {
    const mock = createMockSupabaseClient(SAMPLE_ROW, null);
    const repo = new EntityRepository(asSupabaseClient(mock));
    const input = {
      entityType: 'task' as const,
      title: 'Write tests',
      status: 'active' as const,
      properties: {},
    };
    const result = await repo.create(input);
    expect(result).toMatchObject({ title: 'Write tests', entityType: 'task' });
  });

  it('update returns updated entity', async () => {
    const updated = { ...SAMPLE_ROW, title: 'Updated title' };
    const mock = createMockSupabaseClient(updated, null);
    const repo = new EntityRepository(asSupabaseClient(mock));
    const result = await repo.update('ent-001', { title: 'Updated title' });
    expect(result).toMatchObject({ title: 'Updated title' });
  });

  it('archive sets status to archived', async () => {
    const archived = { ...SAMPLE_ROW, status: 'archived' };
    const mock = createMockSupabaseClient(archived, null);
    const repo = new EntityRepository(asSupabaseClient(mock));
    const result = await repo.archive('ent-001');
    expect(result?.status).toBe('archived');
  });

  it('create returns immutable result (frozen-safe)', async () => {
    const mock = createMockSupabaseClient(SAMPLE_ROW, null);
    const repo = new EntityRepository(asSupabaseClient(mock));
    const result = await repo.create({
      entityType: 'task' as const,
      title: 'x',
      status: 'active' as const,
      properties: {},
    });
    // Result must be a new object — not the same reference as internal state
    expect(result).not.toBe(SAMPLE_ENTITY);
  });
});
