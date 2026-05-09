import { gateway } from '@ai-sdk/gateway';
import type { AIModelConfig } from '@attentionos/core';
import type { LanguageModel } from 'ai';

type GatewayProvider = (modelId: string) => LanguageModel;

export function createGatewayLanguageModel(
  config: AIModelConfig,
  provider: GatewayProvider = gateway,
): LanguageModel {
  if (config.provider !== 'vercel-gateway') {
    throw new Error(`Model config ${config.id} must use provider "vercel-gateway"`);
  }

  if (!config.capabilities.includes('text')) {
    throw new Error(`Model config ${config.id} must support text generation`);
  }

  return provider(config.model);
}
