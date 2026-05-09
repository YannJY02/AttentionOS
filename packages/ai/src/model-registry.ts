import type { AIModelConfig } from '@attentionos/core';
import { z } from 'zod';

const ModelConfigSchema = z.object({
  capabilities: z.array(z.enum(['text', 'tool-calling', 'embedding', 'reranking'])).min(1),
  costTier: z.enum(['low', 'medium', 'high']),
  id: z.string().min(1),
  maxInputTokens: z.number().int().positive().optional(),
  model: z.string().min(1),
  modelVersion: z.string().min(1).optional(),
  privacyScope: z.enum(['external', 'local']),
  provider: z.string().min(1),
});

const ModelRegistrySchema = z.array(ModelConfigSchema).min(1);

interface ModelRegistryEnv {
  readonly ATTENTIONOS_MODEL_REGISTRY?: string;
}

export function createModelRegistryFromEnv(env: ModelRegistryEnv): AIModelConfig[] {
  const raw = env.ATTENTIONOS_MODEL_REGISTRY;
  if (!raw) {
    throw new Error('ATTENTIONOS_MODEL_REGISTRY is required for model registry loading');
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    throw new Error('ATTENTIONOS_MODEL_REGISTRY must be valid JSON');
  }

  const result = ModelRegistrySchema.safeParse(parsed);
  if (!result.success) {
    throw new Error(`Invalid ATTENTIONOS model registry: ${result.error.message}`);
  }

  return result.data;
}
