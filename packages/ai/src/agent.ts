import type {
  AIModelConfig,
  ContextSearchResult,
  TaskDecompositionPayload,
  TaskDecompositionSuggestion,
} from '@attentionos/core';
import type { PrivacyGateway } from './privacy';
import type { Retriever } from './rag';
import type { ModelRouter } from './router';

export interface DecomposeTaskRequest {
  readonly taskId: string;
  readonly title: string;
  readonly content?: string;
}

export interface TaskDecomposerInput {
  readonly taskId: string;
  readonly title: string;
  readonly content?: string;
  readonly sanitizedPrompt: string;
  readonly context: readonly ContextSearchResult[];
  readonly model: AIModelConfig;
}

export interface TaskDecomposerOutput extends TaskDecompositionPayload {
  readonly title: string;
  readonly rationale: string;
}

export interface AttentionAgent {
  decomposeTask(input: DecomposeTaskRequest): Promise<TaskDecompositionSuggestion>;
}

function createSuggestionId(taskId: string): string {
  return `sug_${taskId}_${Date.now()}`;
}

export function createAttentionAgent(deps: {
  readonly privacyGateway: PrivacyGateway;
  readonly modelRouter: ModelRouter;
  readonly retriever: Retriever;
  readonly decomposer: (input: TaskDecomposerInput) => Promise<TaskDecomposerOutput>;
}): AttentionAgent {
  return {
    async decomposeTask(input) {
      const prompt = [input.title, input.content].filter(Boolean).join('\n\n');
      const initialPrivacy = deps.privacyGateway.classifyText(prompt);
      const model = deps.modelRouter.selectModel({
        capability: 'tool-calling',
        privacyLevel: initialPrivacy,
      });

      const sanitized = deps.privacyGateway.sanitizeForModel({
        text: prompt,
        privacyLevel: initialPrivacy,
        target: model.privacyScope,
      });

      const context = await deps.retriever.retrieve(sanitized.text, {
        limit: 5,
        maxPrivacyLevel: sanitized.privacyLevel === 'L0' ? 'L0' : 'L1',
      });

      const decomposition = await deps.decomposer({
        taskId: input.taskId,
        title: input.title,
        content: input.content,
        sanitizedPrompt: sanitized.text,
        context,
        model,
      });

      const now = new Date().toISOString();
      return {
        id: createSuggestionId(input.taskId),
        kind: 'task_decomposition',
        status: 'pending',
        targetId: input.taskId,
        title: decomposition.title,
        rationale: decomposition.rationale,
        payload: { steps: decomposition.steps },
        context,
        createdBy: 'agent:phase2',
        modelId: model.model,
        modelVersion: model.modelVersion,
        approvalRequired: true,
        createdAt: now,
        updatedAt: now,
      };
    },
  };
}
