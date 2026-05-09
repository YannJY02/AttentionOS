import type {
  AISuggestion,
  CreateAISuggestionInput,
  CreateAuditLogInput,
  CreateEntityInput,
  TaskDecompositionPayload,
  V2AuditLogEntry,
  V2Entity,
} from '@attentionos/core';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export interface ApplyTaskDecompositionInput {
  readonly reviewer?: string;
  readonly suggestionId: string;
  readonly targetId: string;
}

export interface ApplyTaskDecompositionResult {
  readonly appliedSuggestion: AISuggestion<TaskDecompositionPayload>;
  readonly auditEntry: V2AuditLogEntry;
  readonly createdTasks: readonly V2Entity[];
}

export interface ListLatestTaskDecompositionInput {
  readonly targetId: string;
}

interface SuggestionRepositoryPort {
  readonly create: (
    input: CreateAISuggestionInput<TaskDecompositionPayload>,
  ) => Promise<AISuggestion<TaskDecompositionPayload>>;
  readonly findByTarget: (
    targetId: string,
    filter: { readonly kind: 'task_decomposition'; readonly limit?: number },
  ) => Promise<readonly AISuggestion<TaskDecompositionPayload>[]>;
  readonly markApplied: (
    id: string,
    reviewer: string,
  ) => Promise<AISuggestion<TaskDecompositionPayload> | null>;
}

interface EntityRepositoryPort {
  readonly create: (input: CreateEntityInput) => Promise<V2Entity>;
  readonly findById: (id: string) => Promise<V2Entity | null>;
}

interface AuditRepositoryPort {
  readonly log: (input: CreateAuditLogInput) => Promise<V2AuditLogEntry>;
}

export interface AISuggestionServiceDependencies {
  readonly audit: AuditRepositoryPort;
  readonly entities: EntityRepositoryPort;
  readonly suggestions: SuggestionRepositoryPort;
}

export interface AISuggestionService {
  readonly applyTaskDecompositionSuggestion: (
    input: ApplyTaskDecompositionInput,
  ) => Promise<ApplyTaskDecompositionResult>;
  readonly createTaskDecompositionSuggestion: (
    input: CreateAISuggestionInput<TaskDecompositionPayload>,
  ) => Promise<AISuggestion<TaskDecompositionPayload>>;
  readonly listLatestTaskDecompositionSuggestion: (
    input: ListLatestTaskDecompositionInput,
  ) => Promise<AISuggestion<TaskDecompositionPayload> | null>;
}

function assertUuid(value: string, fieldName: string): void {
  if (!UUID_PATTERN.test(value)) {
    throw new Error(`${fieldName} must be a UUID before using the Supabase persistence boundary`);
  }
}

function assertTaskDecompositionSuggestion(
  suggestion: AISuggestion<TaskDecompositionPayload>,
): void {
  if (suggestion.kind !== 'task_decomposition') {
    throw new Error(`Suggestion ${suggestion.id} is not a task decomposition`);
  }

  if (!Array.isArray(suggestion.payload.steps)) {
    throw new Error(`Suggestion ${suggestion.id} has an invalid task decomposition payload`);
  }
}

export function createAISuggestionService(
  deps: AISuggestionServiceDependencies,
): AISuggestionService {
  async function listLatestTaskDecompositionSuggestion({
    targetId,
  }: ListLatestTaskDecompositionInput): Promise<AISuggestion<TaskDecompositionPayload> | null> {
    assertUuid(targetId, 'targetId');
    const suggestions = await deps.suggestions.findByTarget(targetId, {
      kind: 'task_decomposition',
      limit: 1,
    });

    const suggestion = suggestions[0];
    if (!suggestion) return null;
    assertTaskDecompositionSuggestion(suggestion);
    return suggestion;
  }

  return {
    async applyTaskDecompositionSuggestion({
      reviewer = 'user',
      suggestionId,
      targetId,
    }: ApplyTaskDecompositionInput): Promise<ApplyTaskDecompositionResult> {
      assertUuid(suggestionId, 'suggestionId');
      assertUuid(targetId, 'targetId');

      const target = await deps.entities.findById(targetId);
      if (!target) {
        throw new Error(`Target task ${targetId} was not found`);
      }

      const suggestions = await deps.suggestions.findByTarget(targetId, {
        kind: 'task_decomposition',
      });
      const suggestion = suggestions.find((candidate) => candidate.id === suggestionId);
      if (!suggestion) {
        throw new Error(`Suggestion ${suggestionId} was not found for target ${targetId}`);
      }

      assertTaskDecompositionSuggestion(suggestion);
      if (suggestion.status !== 'pending') {
        throw new Error(`Suggestion ${suggestion.id} must be pending before it can be applied`);
      }

      const parentId = target.parentId ?? target.id;
      const createdTasks: V2Entity[] = [];
      for (const [index, step] of suggestion.payload.steps.entries()) {
        const createdTask = await deps.entities.create({
          content: step.rationale,
          entityType: 'task',
          hierarchyLayer: 'task',
          parentId,
          properties: {
            aiGenerated: true,
            dependsOn: step.dependsOn ?? [],
            estimatedMinutes: step.estimatedMinutes ?? 15,
            originalTaskId: target.id,
            sourceSuggestionId: suggestion.id,
            stepIndex: index + 1,
          },
          status: 'active',
          title: step.title,
          workflowStage: 'overview',
        });
        createdTasks.push(createdTask);
      }

      const appliedSuggestion = await deps.suggestions.markApplied(suggestion.id, reviewer);
      if (!appliedSuggestion) {
        throw new Error(`Suggestion ${suggestion.id} could not be marked applied`);
      }
      assertTaskDecompositionSuggestion(appliedSuggestion);

      const auditEntry = await deps.audit.log({
        actor: reviewer,
        action: 'ai.suggestion.applied',
        targetId: target.id,
        details: {
          createdTaskIds: createdTasks.map((task) => task.id),
          kind: 'task_decomposition',
          stepCount: createdTasks.length,
          suggestionId: suggestion.id,
        },
      });

      return { appliedSuggestion, auditEntry, createdTasks };
    },

    async createTaskDecompositionSuggestion(
      input: CreateAISuggestionInput<TaskDecompositionPayload>,
    ): Promise<AISuggestion<TaskDecompositionPayload>> {
      if (!input.targetId) {
        throw new Error('targetId is required for storage-backed task decomposition suggestions');
      }
      assertUuid(input.targetId, 'targetId');

      if (input.kind !== 'task_decomposition') {
        throw new Error('Only task decomposition suggestions are accepted at this boundary');
      }

      return deps.suggestions.create(input);
    },

    listLatestTaskDecompositionSuggestion,
  };
}
