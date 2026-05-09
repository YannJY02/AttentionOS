import type { AIModelConfig, ModelCapability, PrivacyLevel } from '@attentionos/core';

export interface ModelSelectionRequest {
  readonly capability: ModelCapability;
  readonly privacyLevel: PrivacyLevel;
  readonly preferLocal?: boolean;
}

export interface ModelRouter {
  selectModel(request: ModelSelectionRequest): AIModelConfig;
  listModels(): readonly AIModelConfig[];
}

function isSafeForPrivacy(model: AIModelConfig, privacyLevel: PrivacyLevel): boolean {
  if (privacyLevel === 'L3') return false;
  if (privacyLevel === 'L2') return model.privacyScope === 'local';
  return true;
}

function sortCandidates(a: AIModelConfig, b: AIModelConfig, preferLocal: boolean): number {
  if (preferLocal && a.privacyScope !== b.privacyScope) {
    return a.privacyScope === 'local' ? -1 : 1;
  }

  const tierRank = { low: 0, medium: 1, high: 2 };
  return tierRank[a.costTier] - tierRank[b.costTier];
}

export function createModelRouter(models: readonly AIModelConfig[]): ModelRouter {
  const registeredModels = [...models];

  return {
    selectModel(request) {
      if (request.privacyLevel === 'L3') {
        throw new Error('L3 never-process context must not be routed to a model');
      }

      const candidates = registeredModels
        .filter((model) => model.capabilities.includes(request.capability))
        .filter((model) => isSafeForPrivacy(model, request.privacyLevel))
        .sort((a, b) => sortCandidates(a, b, request.preferLocal ?? false));

      const selected = candidates[0];
      if (!selected) {
        throw new Error(
          `No safe model supports ${request.capability} for privacy level ${request.privacyLevel}`,
        );
      }

      return selected;
    },

    listModels() {
      return registeredModels;
    },
  };
}
