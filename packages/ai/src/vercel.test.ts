import type { LanguageModel } from 'ai';
import { describe, expect, it } from 'vitest';
import { createVercelTaskDecomposer } from './vercel';

const MODEL = { modelId: 'fake-model' } as unknown as LanguageModel;

const TASK_INPUT = {
  content: 'Raw details',
  context: [
    { id: 'ctx-1', score: 0.8, text: 'Storage-backed RAG note', privacyLevel: 'L0' as const },
  ],
  model: {
    capabilities: ['tool-calling' as const],
    costTier: 'medium' as const,
    id: 'gateway-claude',
    model: 'anthropic/claude-sonnet-4.5',
    privacyScope: 'external' as const,
    provider: 'vercel-gateway',
  },
  sanitizedPrompt: 'Sanitized details',
  taskId: 'task-1',
  title: 'Wire provider construction',
};

describe('Vercel task decomposer', () => {
  it('uses injected prompt templates and validates structured output', async () => {
    const calls: unknown[] = [];
    const decomposer = createVercelTaskDecomposer(MODEL, {
      generateText: async (input) => {
        calls.push(input);
        return {
          text: JSON.stringify({
            rationale: 'Use loaded prompt and RAG context.',
            steps: [{ title: 'Connect runtime dependencies' }],
            title: 'Break down provider construction',
          }),
        };
      },
      systemTemplate: {
        key: 'task.decomposition.system',
        template: 'JSON only for {{ title }} with {{ context }}',
        variables: ['title', 'context'],
      },
    });

    const result = await decomposer.decompose(TASK_INPUT);

    expect(result.steps[0]?.title).toBe('Connect runtime dependencies');
    expect(calls[0]).toMatchObject({
      prompt: expect.stringContaining('Sanitized details'),
      system: 'JSON only for Wire provider construction with Storage-backed RAG note',
    });
    expect(JSON.stringify(calls[0])).not.toContain('Raw details');
  });
});
