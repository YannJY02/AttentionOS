import { describe, expect, it } from 'vitest';
import { handleAISuggestionRequest } from './http';

describe('AI suggestion HTTP boundary', () => {
  it('only exposes whitelisted suggestion routes', async () => {
    const response = await handleAISuggestionRequest(
      new Request('http://127.0.0.1:4317/v1/admin/table-dump'),
      {
        applyTaskDecompositionSuggestion: async () => {
          throw new Error('should not call service');
        },
        createTaskDecompositionSuggestion: async () => {
          throw new Error('should not call service');
        },
        listLatestTaskDecompositionSuggestion: async () => {
          throw new Error('should not call service');
        },
      },
    );

    expect(response.status).toBe(404);
    expect(await response.text()).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY|secret|password/i);
  });

  it('dispatches apply requests through the service port', async () => {
    const response = await handleAISuggestionRequest(
      new Request('http://127.0.0.1:4317/v1/ai/task-decomposition/apply', {
        body: JSON.stringify({
          reviewer: 'user',
          suggestionId: '33333333-3333-4333-8333-333333333333',
          targetId: '11111111-1111-4111-8111-111111111111',
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
      {
        applyTaskDecompositionSuggestion: async (input) => ({
          appliedSuggestion: {
            id: input.suggestionId,
            kind: 'task_decomposition',
            status: 'applied',
            targetId: input.targetId,
          },
          auditEntry: { action: 'ai.suggestion.applied' },
          createdTasks: [{ id: 'created-1' }],
        }),
        createTaskDecompositionSuggestion: async () => {
          throw new Error('wrong route');
        },
        listLatestTaskDecompositionSuggestion: async () => {
          throw new Error('wrong route');
        },
      },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({
      appliedSuggestion: {
        id: '33333333-3333-4333-8333-333333333333',
        status: 'applied',
      },
      createdTasks: [{ id: 'created-1' }],
    });
  });
});
