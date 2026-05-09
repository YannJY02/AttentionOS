import { describe, expect, it } from 'vitest';
import { createAttentionAgent } from './agent';
import { createPrivacyGateway } from './privacy';
import { createModelRouter } from './router';

describe('Attention AI agent orchestration', () => {
  const router = createModelRouter([
    {
      id: 'gateway-fast',
      provider: 'vercel-gateway',
      model: 'openai/gpt-4o-mini',
      privacyScope: 'external',
      capabilities: ['text', 'tool-calling'],
      costTier: 'low',
    },
  ]);

  it('creates a pending HITL task decomposition suggestion', async () => {
    const agent = createAttentionAgent({
      privacyGateway: createPrivacyGateway(),
      modelRouter: router,
      retriever: {
        retrieve: async () => [
          {
            id: 'context-1',
            text: 'The task should fit a single execution block.',
            score: 0.9,
            privacyLevel: 'L0',
          },
        ],
      },
      decomposer: async () => ({
        title: 'Break down Write thesis',
        rationale: 'Split into reviewable execution steps.',
        steps: [
          { title: 'Outline section', estimatedMinutes: 10 },
          { title: 'Draft paragraphs', estimatedMinutes: 25 },
        ],
      }),
    });

    const suggestion = await agent.decomposeTask({
      taskId: 'task-1',
      title: 'Write thesis',
      content: 'Draft the methods section',
    });

    expect(suggestion.status).toBe('pending');
    expect(suggestion.kind).toBe('task_decomposition');
    expect(suggestion.payload.steps).toHaveLength(2);
    expect(suggestion.approvalRequired).toBe(true);
    expect(suggestion.context[0]?.id).toBe('context-1');
  });
});
