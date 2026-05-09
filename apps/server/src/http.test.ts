import { describe, expect, it } from 'vitest';
import { handleAISuggestionRequest } from './http';

describe('AI suggestion HTTP boundary', () => {
  it('reports health without touching persistence', async () => {
    const response = await handleAISuggestionRequest(new Request('http://127.0.0.1:4317/health'), {
      applyTaskDecompositionSuggestion: async () => {
        throw new Error('should not call service');
      },
      createTaskDecompositionSuggestion: async () => {
        throw new Error('should not call service');
      },
      analyzeLearningWindow: async () => {
        throw new Error('should not call service');
      },
      listLatestTaskDecompositionSuggestion: async () => {
        throw new Error('should not call service');
      },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ status: 'ok' });
  });

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
        analyzeLearningWindow: async () => {
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
        analyzeLearningWindow: async () => {
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

  it('dispatches create and latest requests through narrow service methods', async () => {
    const targetId = '11111111-1111-4111-8111-111111111111';
    const createResponse = await handleAISuggestionRequest(
      new Request('http://127.0.0.1:4317/v1/ai/task-decomposition', {
        body: JSON.stringify({
          approvalRequired: true,
          context: [],
          createdBy: 'agent:phase2',
          kind: 'task_decomposition',
          payload: { steps: [{ title: 'Clarify outcome' }] },
          rationale: 'Split into reviewable steps',
          status: 'pending',
          targetId,
          title: 'Break down task',
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
      {
        applyTaskDecompositionSuggestion: async () => {
          throw new Error('wrong route');
        },
        createTaskDecompositionSuggestion: async (input) => ({
          id: '33333333-3333-4333-8333-333333333333',
          ...input,
          createdAt: '2026-05-09T00:00:00.000Z',
          updatedAt: '2026-05-09T00:00:00.000Z',
        }),
        analyzeLearningWindow: async () => {
          throw new Error('wrong route');
        },
        listLatestTaskDecompositionSuggestion: async () => {
          throw new Error('wrong route');
        },
      },
    );

    expect(createResponse.status).toBe(201);
    await expect(createResponse.json()).resolves.toMatchObject({
      id: '33333333-3333-4333-8333-333333333333',
      status: 'pending',
      targetId,
    });

    const latestResponse = await handleAISuggestionRequest(
      new Request(`http://127.0.0.1:4317/v1/ai/task-decomposition/latest?targetId=${targetId}`),
      {
        applyTaskDecompositionSuggestion: async () => {
          throw new Error('wrong route');
        },
        createTaskDecompositionSuggestion: async () => {
          throw new Error('wrong route');
        },
        analyzeLearningWindow: async () => {
          throw new Error('wrong route');
        },
        listLatestTaskDecompositionSuggestion: async (input) => ({
          approvalRequired: true,
          context: [],
          createdAt: '2026-05-09T00:00:00.000Z',
          createdBy: 'agent:phase2',
          id: '33333333-3333-4333-8333-333333333333',
          kind: 'task_decomposition',
          payload: { steps: [{ title: 'Clarify outcome' }] },
          rationale: 'Split into reviewable steps',
          status: 'pending',
          targetId: input.targetId,
          title: 'Break down task',
          updatedAt: '2026-05-09T00:00:00.000Z',
        }),
      },
    );

    expect(latestResponse.status).toBe(200);
    await expect(latestResponse.json()).resolves.toMatchObject({ targetId });
  });

  it('returns safe 400 responses for malformed JSON and missing query params', async () => {
    const service = {
      applyTaskDecompositionSuggestion: async () => {
        throw new Error('should not call service');
      },
      createTaskDecompositionSuggestion: async () => {
        throw new Error('should not call service');
      },
      analyzeLearningWindow: async () => {
        throw new Error('should not call service');
      },
      listLatestTaskDecompositionSuggestion: async () => {
        throw new Error('should not call service');
      },
    };

    const malformedResponse = await handleAISuggestionRequest(
      new Request('http://127.0.0.1:4317/v1/ai/task-decomposition/apply', {
        body: '{not-json',
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
      service,
    );
    const missingTargetResponse = await handleAISuggestionRequest(
      new Request('http://127.0.0.1:4317/v1/ai/task-decomposition/latest'),
      service,
    );

    expect(malformedResponse.status).toBe(400);
    expect(missingTargetResponse.status).toBe(400);
    expect(await malformedResponse.text()).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY|secret/i);
    expect(await missingTargetResponse.text()).not.toMatch(/SUPABASE_SERVICE_ROLE_KEY|secret/i);
  });

  it('dispatches learning analysis requests through an optional learning runtime', async () => {
    const response = await handleAISuggestionRequest(
      new Request('http://127.0.0.1:4317/v1/learning/analyze', {
        body: JSON.stringify({
          endedAt: '2026-05-09T12:00:00.000Z',
          startedAt: '2026-05-09T08:00:00.000Z',
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }),
      {
        applyTaskDecompositionSuggestion: async () => {
          throw new Error('wrong route');
        },
        analyzeLearningWindow: async (input) => ({
          createdSuggestions: [
            {
              approvalRequired: true,
              context: [],
              createdAt: input.endedAt,
              createdBy: 'agent:phase3',
              id: 'sug-1',
              kind: 'workflow_optimization',
              payload: {
                actions: [{ label: 'Split oversized tasks', type: 'task.split' }],
                confidence: 0.7,
                evidence: ['oversized task'],
                privacyLevel: 'L1',
              },
              rationale: 'oversized task',
              status: 'pending',
              title: 'Adjust next workflow cycle',
              updatedAt: input.endedAt,
            },
          ],
          report: { window: input },
        }),
        createTaskDecompositionSuggestion: async () => {
          throw new Error('wrong route');
        },
        listLatestTaskDecompositionSuggestion: async () => {
          throw new Error('wrong route');
        },
      },
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toMatchObject({
      createdSuggestions: [{ kind: 'workflow_optimization', status: 'pending' }],
    });
  });
});
