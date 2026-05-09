import type {
  AISuggestion,
  TaskDecompositionPayload,
  V2AuditLogEntry,
  V2Entity,
} from '@attentionos/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { createAISuggestionService } from './ai-suggestions';

const TARGET_ID = '11111111-1111-4111-8111-111111111111';
const PARENT_ID = '22222222-2222-4222-8222-222222222222';
const SUGGESTION_ID = '33333333-3333-4333-8333-333333333333';

function createTask(): V2Entity {
  return {
    id: TARGET_ID,
    entityType: 'task',
    hierarchyLayer: 'task',
    title: 'Wire execution',
    content: 'Connect execution workflow.',
    status: 'active',
    properties: {},
    workflowStage: 'execution',
    parentId: PARENT_ID,
    createdAt: '2026-05-09T00:00:00.000Z',
    updatedAt: '2026-05-09T00:00:00.000Z',
  };
}

function createSuggestion(
  patch: Partial<AISuggestion<TaskDecompositionPayload>> = {},
): AISuggestion<TaskDecompositionPayload> {
  return {
    id: SUGGESTION_ID,
    kind: 'task_decomposition',
    status: 'pending',
    targetId: TARGET_ID,
    title: 'Break down task',
    rationale: 'Split into reviewable execution steps.',
    payload: {
      steps: [
        { title: 'Clarify outcome', estimatedMinutes: 10 },
        { title: 'Draft checklist', rationale: 'Make the work explicit', estimatedMinutes: 15 },
      ],
    },
    context: [],
    createdBy: 'agent:phase2',
    modelId: 'local-demo-decomposer',
    modelVersion: '2026-05-09',
    approvalRequired: true,
    createdAt: '2026-05-09T00:00:00.000Z',
    updatedAt: '2026-05-09T00:00:00.000Z',
    ...patch,
  };
}

function createEntity(id: string, patch: Partial<V2Entity> = {}): V2Entity {
  return {
    id,
    entityType: 'task',
    hierarchyLayer: 'task',
    title: 'Created step',
    status: 'active',
    properties: {},
    workflowStage: 'overview',
    createdAt: '2026-05-09T00:00:00.000Z',
    updatedAt: '2026-05-09T00:00:00.000Z',
    ...patch,
  };
}

function createAuditEntry(details: Record<string, unknown>): V2AuditLogEntry {
  return {
    id: 'audit-1',
    actor: 'user',
    action: 'ai.suggestion.applied',
    targetId: TARGET_ID,
    details,
    createdAt: '2026-05-09T00:01:00.000Z',
  };
}

describe('AI suggestion service', () => {
  let createdInputs: V2Entity[];
  let auditDetails: Record<string, unknown> | null;

  beforeEach(() => {
    createdInputs = [];
    auditDetails = null;
  });

  it('applies a pending decomposition through deterministic storage operations', async () => {
    const suggestion = createSuggestion();
    const appliedSuggestion = createSuggestion({
      reviewedAt: '2026-05-09T00:02:00.000Z',
      reviewedBy: 'user',
      status: 'applied',
    });

    const service = createAISuggestionService({
      audit: {
        log: async (input) => {
          auditDetails = input.details;
          return createAuditEntry(input.details);
        },
      },
      entities: {
        create: async (input) => {
          const entity = createEntity(`created-${createdInputs.length + 1}`, input);
          createdInputs.push(entity);
          return entity;
        },
        findById: async () => createTask(),
      },
      suggestions: {
        findByTarget: async () => [suggestion],
        markApplied: async () => appliedSuggestion,
      },
    });

    const result = await service.applyTaskDecompositionSuggestion({
      reviewer: 'user',
      suggestionId: SUGGESTION_ID,
      targetId: TARGET_ID,
    });

    expect(result.appliedSuggestion).toMatchObject({ id: SUGGESTION_ID, status: 'applied' });
    expect(result.createdTasks).toHaveLength(2);
    expect(createdInputs).toEqual([
      expect.objectContaining({
        parentId: PARENT_ID,
        properties: expect.objectContaining({
          aiGenerated: true,
          originalTaskId: TARGET_ID,
          sourceSuggestionId: SUGGESTION_ID,
        }),
        title: 'Clarify outcome',
      }),
      expect.objectContaining({
        content: 'Make the work explicit',
        parentId: PARENT_ID,
        title: 'Draft checklist',
      }),
    ]);
    expect(auditDetails).toMatchObject({
      createdTaskIds: ['created-1', 'created-2'],
      kind: 'task_decomposition',
      suggestionId: SUGGESTION_ID,
    });
  });

  it('rejects local demo slug ids before touching Supabase-backed repositories', async () => {
    let touchedRepository = false;
    const service = createAISuggestionService({
      audit: {
        log: async () => {
          touchedRepository = true;
          return createAuditEntry({});
        },
      },
      entities: {
        create: async () => {
          touchedRepository = true;
          return createEntity('created-1');
        },
        findById: async () => {
          touchedRepository = true;
          return createTask();
        },
      },
      suggestions: {
        findByTarget: async () => {
          touchedRepository = true;
          return [createSuggestion()];
        },
        markApplied: async () => {
          touchedRepository = true;
          return createSuggestion({ status: 'applied' });
        },
      },
    });

    await expect(
      service.applyTaskDecompositionSuggestion({
        suggestionId: 'sug-task-wire-overview',
        targetId: 'task-wire-overview',
      }),
    ).rejects.toThrow(/uuid/i);
    expect(touchedRepository).toBe(false);
  });

  it('does not apply suggestions that are already reviewed', async () => {
    const service = createAISuggestionService({
      audit: { log: async () => createAuditEntry({}) },
      entities: {
        create: async () => createEntity('created-1'),
        findById: async () => createTask(),
      },
      suggestions: {
        findByTarget: async () => [createSuggestion({ status: 'rejected' })],
        markApplied: async () => createSuggestion({ status: 'applied' }),
      },
    });

    await expect(
      service.applyTaskDecompositionSuggestion({
        suggestionId: SUGGESTION_ID,
        targetId: TARGET_ID,
      }),
    ).rejects.toThrow(/pending/i);
  });
});
