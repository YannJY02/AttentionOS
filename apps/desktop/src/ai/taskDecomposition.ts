import {
  createAttentionAgent,
  createModelRouter,
  createPrivacyGateway,
  createRetriever,
  InMemoryVectorStore,
} from '@attentionos/ai/src/browser';
import type { TaskDecompositionSuggestion, V2Entity } from '@attentionos/core';

function textToVector(input: string): readonly number[] {
  const normalized = input.toLowerCase();
  return [
    normalized.includes('overview') ? 1 : 0,
    normalized.includes('execution') ? 1 : 0,
    normalized.includes('workflow') ? 1 : 0,
    Math.min(normalized.length / 100, 1),
  ];
}

function createStepTitle(prefix: string, taskTitle: string): string {
  return `${prefix} for ${taskTitle}`;
}

export async function createLocalTaskDecompositionSuggestion(
  task: V2Entity,
  contextEntities: readonly V2Entity[],
  clarificationText = '',
): Promise<TaskDecompositionSuggestion> {
  const store = new InMemoryVectorStore();
  await store.upsert(
    contextEntities.map((entity) => ({
      id: entity.id,
      entityId: entity.id,
      text: [entity.title, entity.content].filter(Boolean).join('\n'),
      embedding: textToVector([entity.title, entity.content].filter(Boolean).join('\n')),
      metadata: { entityType: entity.entityType, hierarchyLayer: entity.hierarchyLayer },
      privacyLevel: 'L0',
    })),
  );

  const agent = createAttentionAgent({
    decomposer: async () => ({
      title: `Break down ${task.title}`,
      rationale: [
        'Split the active task into reviewable execution steps.',
        clarificationText.trim() ? `Human clarification: ${clarificationText.trim()}` : '',
      ]
        .filter(Boolean)
        .join(' '),
      steps: [
        {
          title: createStepTitle('Clarify outcome', task.title),
          rationale: 'Name the observable outcome before adding more work.',
          estimatedMinutes: 10,
        },
        {
          title: createStepTitle('Draft execution checklist', task.title),
          rationale: 'Turn the work into concrete checks that can be reviewed.',
          estimatedMinutes: 15,
        },
        {
          title: createStepTitle('Review completion criteria', task.title),
          rationale: 'Confirm the task has a clear stopping point before Focus.',
          estimatedMinutes: 10,
        },
      ],
    }),
    modelRouter: createModelRouter([
      {
        id: 'local-demo-decomposer',
        provider: 'attentionos-local',
        model: 'local/task-decomposer',
        privacyScope: 'local',
        capabilities: ['text', 'tool-calling', 'embedding'],
        costTier: 'low',
        modelVersion: '2026-05-09',
      },
    ]),
    privacyGateway: createPrivacyGateway(),
    retriever: createRetriever({
      embedder: {
        embed: async (input) => textToVector(input),
        embedMany: async (inputs) => inputs.map(textToVector),
      },
      store,
    }),
  });

  return agent.decomposeTask({
    content: [task.content, clarificationText.trim()].filter(Boolean).join('\n\nClarification: '),
    taskId: task.id,
    title: task.title,
  });
}
