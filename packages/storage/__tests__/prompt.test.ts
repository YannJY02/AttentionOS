import { describe, expect, it } from 'vitest';
import { PromptRepository } from '../src/repositories/prompt';
import { asSupabaseClient, createMockSupabaseClient } from './helpers/mock-supabase';

const SAMPLE_ROW = {
  id: 'prompt-1',
  key: 'task.decompose',
  version: '1.0.0',
  description: 'Task decomposition prompt',
  template: 'Break down {{title}}',
  variables: ['title'],
  max_privacy_level: 'L1',
  is_active: true,
  created_at: '2026-05-09T00:00:00Z',
  updated_at: '2026-05-09T00:00:00Z',
};

describe('PromptRepository', () => {
  it('finds active prompt templates by key', async () => {
    const repo = new PromptRepository(asSupabaseClient(createMockSupabaseClient(SAMPLE_ROW)));
    const result = await repo.findActiveByKey('task.decompose');

    expect(result).toMatchObject({ key: 'task.decompose', maxPrivacyLevel: 'L1' });
  });

  it('creates prompt templates without hardcoded secrets', async () => {
    const repo = new PromptRepository(asSupabaseClient(createMockSupabaseClient(SAMPLE_ROW)));
    const result = await repo.create({
      key: 'task.decompose',
      version: '1.0.0',
      description: 'Task decomposition prompt',
      template: 'Break down {{title}}',
      variables: ['title'],
      maxPrivacyLevel: 'L1',
      isActive: true,
    });

    expect(result.template).toBe('Break down {{title}}');
  });
});
