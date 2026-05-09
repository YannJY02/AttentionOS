import { describe, expect, it } from 'vitest';
import { SuggestionRepository } from '../src/repositories/suggestion';
import { asSupabaseClient, createMockSupabaseClient } from './helpers/mock-supabase';

const SAMPLE_ROW = {
  id: 'sug-1',
  kind: 'task_decomposition',
  status: 'pending',
  target_id: 'task-1',
  title: 'Break down task',
  rationale: 'Needs smaller steps',
  payload: { steps: [{ title: 'Draft', estimatedMinutes: 20 }] },
  context: [{ id: 'ctx-1', score: 0.9 }],
  created_by: 'agent:phase2',
  model_id: 'openai/gpt-4o-mini',
  model_version: '2026-05-09',
  approval_required: true,
  reviewed_by: null,
  reviewed_at: null,
  created_at: '2026-05-09T00:00:00Z',
  updated_at: '2026-05-09T00:00:00Z',
};

describe('SuggestionRepository', () => {
  it('creates pending HITL suggestions', async () => {
    const repo = new SuggestionRepository(asSupabaseClient(createMockSupabaseClient(SAMPLE_ROW)));
    const result = await repo.create({
      kind: 'task_decomposition',
      status: 'pending',
      targetId: 'task-1',
      title: 'Break down task',
      rationale: 'Needs smaller steps',
      payload: { steps: [{ title: 'Draft', estimatedMinutes: 20 }] },
      context: [{ id: 'ctx-1', score: 0.9 }],
      createdBy: 'agent:phase2',
      modelId: 'openai/gpt-4o-mini',
      modelVersion: '2026-05-09',
      approvalRequired: true,
    });

    expect(result).toMatchObject({ id: 'sug-1', status: 'pending', approvalRequired: true });
  });

  it('approves suggestions with reviewer metadata', async () => {
    const approved = { ...SAMPLE_ROW, status: 'approved', reviewed_by: 'user' };
    const repo = new SuggestionRepository(asSupabaseClient(createMockSupabaseClient(approved)));
    const result = await repo.approve('sug-1', 'user');

    expect(result?.status).toBe('approved');
    expect(result?.reviewedBy).toBe('user');
  });
});
