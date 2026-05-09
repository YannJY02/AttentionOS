import { describe, expect, it } from 'vitest';
import { createModelRouter } from './router';

describe('model router', () => {
  const router = createModelRouter([
    {
      id: 'gateway-fast',
      provider: 'vercel-gateway',
      model: 'openai/gpt-4o-mini',
      privacyScope: 'external',
      capabilities: ['text', 'tool-calling'],
      costTier: 'low',
    },
    {
      id: 'local-reasoner',
      provider: 'ollama',
      model: 'ollama/qwen3',
      privacyScope: 'local',
      capabilities: ['text', 'embedding'],
      costTier: 'low',
    },
  ]);

  it('routes L0/L1 text work to external models when available', () => {
    expect(router.selectModel({ capability: 'tool-calling', privacyLevel: 'L1' }).id).toBe(
      'gateway-fast',
    );
  });

  it('routes L2 work only to local models', () => {
    expect(router.selectModel({ capability: 'embedding', privacyLevel: 'L2' }).id).toBe(
      'local-reasoner',
    );
  });

  it('rejects L3 work before model selection', () => {
    expect(() => router.selectModel({ capability: 'text', privacyLevel: 'L3' })).toThrow(
      /never-process/i,
    );
  });

  it('fails closed when no safe model supports the capability', () => {
    expect(() => router.selectModel({ capability: 'tool-calling', privacyLevel: 'L2' })).toThrow(
      /No safe model/i,
    );
  });
});
