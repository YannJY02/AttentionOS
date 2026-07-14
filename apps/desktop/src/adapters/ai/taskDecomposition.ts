import type { GuidanceContextEvidence, TaskDecompositionSuggestion } from '@attentionos/guidance';
import type { V2Entity } from '@attentionos/workflow';

const NEVER_PROCESS_RE =
  /\b(password vault|private key|seed phrase|raw password|credential dump)\b/i;

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

function cosineSimilarity(left: readonly number[], right: readonly number[]): number {
  const length = Math.min(left.length, right.length);
  if (length === 0) return 0;

  let dot = 0;
  let normLeft = 0;
  let normRight = 0;

  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;
    dot += leftValue * rightValue;
    normLeft += leftValue * leftValue;
    normRight += rightValue * rightValue;
  }

  if (normLeft === 0 || normRight === 0) return 0;
  return dot / (Math.sqrt(normLeft) * Math.sqrt(normRight));
}

function rankLocalContext(
  query: string,
  contextEntities: readonly V2Entity[],
): GuidanceContextEvidence[] {
  const queryEmbedding = textToVector(query);

  return contextEntities
    .map((entity) => {
      const text = [entity.title, entity.content].filter(Boolean).join('\n');
      return {
        entityId: entity.id,
        id: entity.id,
        metadata: {
          entityType: entity.entityType,
          hierarchyLayer: entity.hierarchyLayer,
        },
        privacyLevel: 'L0' as const,
        score: cosineSimilarity(queryEmbedding, textToVector(text)),
        text,
      };
    })
    .sort((left, right) => right.score - left.score)
    .slice(0, 5);
}

export async function createLocalTaskDecompositionSuggestion(
  task: V2Entity,
  contextEntities: readonly V2Entity[],
  clarificationText = '',
): Promise<TaskDecompositionSuggestion> {
  const clarification = clarificationText.trim();
  const content = [task.content, clarification].filter(Boolean).join('\n\nClarification: ');
  const prompt = [task.title, content].filter(Boolean).join('\n\n');

  if (NEVER_PROCESS_RE.test(prompt)) {
    throw new Error('L3 never-process context cannot be sent to any model');
  }

  const now = new Date().toISOString();
  return {
    approvalRequired: true,
    context: rankLocalContext(prompt, contextEntities),
    createdAt: now,
    createdBy: 'agent:phase2',
    id: `sug_${task.id}_${Date.now()}`,
    kind: 'task_decomposition',
    modelId: 'local/task-decomposer',
    modelVersion: '2026-05-09',
    payload: {
      steps: [
        {
          estimatedMinutes: 10,
          rationale: 'Name the observable outcome before adding more work.',
          title: createStepTitle('Clarify outcome', task.title),
        },
        {
          estimatedMinutes: 15,
          rationale: 'Turn the work into concrete checks that can be reviewed.',
          title: createStepTitle('Draft execution checklist', task.title),
        },
        {
          estimatedMinutes: 10,
          rationale: 'Confirm the task has a clear stopping point before Focus.',
          title: createStepTitle('Review completion criteria', task.title),
        },
      ],
    },
    rationale: [
      'Split the active task into reviewable execution steps.',
      clarification ? `Human clarification: ${clarification}` : '',
    ]
      .filter(Boolean)
      .join(' '),
    status: 'pending',
    targetId: task.id,
    title: `Break down ${task.title}`,
    updatedAt: now,
  };
}
