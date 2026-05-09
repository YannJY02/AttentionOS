import { describe, expect, it } from 'vitest';
import { createModelRegistryFromEnv } from './model-registry';

describe('environment model registry', () => {
  it('loads model configs from ATTENTIONOS_MODEL_REGISTRY', () => {
    const models = createModelRegistryFromEnv({
      ATTENTIONOS_MODEL_REGISTRY: JSON.stringify([
        {
          capabilities: ['text', 'tool-calling'],
          costTier: 'medium',
          id: 'gateway-claude',
          model: 'anthropic/claude-sonnet-4.5',
          modelVersion: '2026-05-09',
          privacyScope: 'external',
          provider: 'vercel-gateway',
        },
      ]),
    });

    expect(models).toEqual([
      expect.objectContaining({
        id: 'gateway-claude',
        privacyScope: 'external',
        provider: 'vercel-gateway',
      }),
    ]);
  });

  it('fails closed when the model registry is missing or invalid', () => {
    expect(() => createModelRegistryFromEnv({})).toThrow(/ATTENTIONOS_MODEL_REGISTRY/i);
    expect(() =>
      createModelRegistryFromEnv({
        ATTENTIONOS_MODEL_REGISTRY: JSON.stringify([{ id: 'missing fields' }]),
      }),
    ).toThrow(/model registry/i);
  });
});
