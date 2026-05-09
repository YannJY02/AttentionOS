import type { PromptTemplate } from '@attentionos/core';
import { describe, expect, it } from 'vitest';
import { loadTaskDecompositionSystemTemplate } from './prompt-runtime';

function createPromptTemplate(patch: Partial<PromptTemplate> = {}): PromptTemplate {
  return {
    id: 'prompt-1',
    isActive: true,
    key: 'task.decomposition.system',
    maxPrivacyLevel: 'L1',
    template: 'Return strict JSON for {{ title }} with {{ context }}.',
    variables: ['title', 'context'],
    version: '2026-05-09',
    createdAt: '2026-05-09T00:00:00.000Z',
    updatedAt: '2026-05-09T00:00:00.000Z',
    ...patch,
  };
}

describe('prompt runtime loader', () => {
  it('loads the active task decomposition system template from storage', async () => {
    const template = createPromptTemplate();
    const result = await loadTaskDecompositionSystemTemplate({
      findActiveByKey: async (key) => (key === template.key ? template : null),
    });

    expect(result).toEqual({
      key: 'task.decomposition.system',
      template: 'Return strict JSON for {{ title }} with {{ context }}.',
      variables: ['title', 'context'],
    });
  });

  it('returns null when no active template exists so callers can use the local fallback', async () => {
    const result = await loadTaskDecompositionSystemTemplate({
      findActiveByKey: async () => null,
    });

    expect(result).toBeNull();
  });

  it('rejects prompt templates that request unsupported runtime variables', async () => {
    await expect(
      loadTaskDecompositionSystemTemplate({
        findActiveByKey: async () => createPromptTemplate({ variables: ['secret_env'] }),
      }),
    ).rejects.toThrow(/unsupported/i);
  });
});
