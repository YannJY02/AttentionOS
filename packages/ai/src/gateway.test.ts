import type { LanguageModel } from 'ai';
import { describe, expect, it } from 'vitest';
import { createGatewayLanguageModel } from './gateway';

describe('AI Gateway model factory', () => {
  it('creates a language model from a vercel-gateway registry entry', () => {
    const calls: string[] = [];
    const model = { modelId: 'fake-language-model' } as unknown as LanguageModel;

    const result = createGatewayLanguageModel(
      {
        capabilities: ['text', 'tool-calling'],
        costTier: 'medium',
        id: 'gateway-claude',
        model: 'anthropic/claude-sonnet-4.5',
        privacyScope: 'external',
        provider: 'vercel-gateway',
      },
      (modelId) => {
        calls.push(modelId);
        return model;
      },
    );

    expect(result).toBe(model);
    expect(calls).toEqual(['anthropic/claude-sonnet-4.5']);
  });

  it('rejects non-gateway registry entries', () => {
    expect(() =>
      createGatewayLanguageModel(
        {
          capabilities: ['text'],
          costTier: 'low',
          id: 'local',
          model: 'local/task-decomposer',
          privacyScope: 'local',
          provider: 'attentionos-local',
        },
        () => ({}) as LanguageModel,
      ),
    ).toThrow(/vercel-gateway/i);
  });
});
