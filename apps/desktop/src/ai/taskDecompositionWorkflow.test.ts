import type { TaskDecompositionSuggestion, V2Entity } from '@attentionos/core';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  AI_SUGGESTIONS_STORAGE_KEY,
  saveTaskDecompositionSuggestion,
} from '../storage/aiSuggestions';
import { EXECUTION_AUDIT_STORAGE_KEY } from '../storage/audit';
import { HIERARCHY_STORAGE_KEY, readHierarchyEntities } from '../storage/hierarchy';
import { approveTaskDecompositionSuggestion } from './taskDecompositionWorkflow';

const TASK: V2Entity = {
  id: 'task-1',
  entityType: 'task',
  hierarchyLayer: 'task',
  title: 'Wire execution',
  content: 'Connect execution workflow.',
  status: 'active',
  properties: {},
  workflowStage: 'execution',
  parentId: 'project-1',
  createdAt: '2026-05-09T00:00:00.000Z',
  updatedAt: '2026-05-09T00:00:00.000Z',
};

const PARENT: V2Entity = {
  id: 'project-1',
  entityType: 'task',
  hierarchyLayer: 'project',
  title: 'Desktop workflow',
  status: 'active',
  properties: {},
  workflowStage: 'overview',
  createdAt: '2026-05-09T00:00:00.000Z',
  updatedAt: '2026-05-09T00:00:00.000Z',
};

function createSuggestion(): TaskDecompositionSuggestion {
  return {
    id: 'sug-1',
    kind: 'task_decomposition',
    status: 'pending',
    targetId: TASK.id,
    title: 'Break down task',
    rationale: 'Split the task into reviewable execution steps.',
    payload: {
      steps: [
        { title: 'Clarify outcome', estimatedMinutes: 10 },
        { title: 'Draft checklist', estimatedMinutes: 15 },
      ],
    },
    context: [],
    createdBy: 'agent:phase2',
    modelId: 'local-demo-decomposer',
    modelVersion: '2026-05-09',
    approvalRequired: true,
    createdAt: '2026-05-09T00:00:00.000Z',
    updatedAt: '2026-05-09T00:00:00.000Z',
  };
}

describe('task decomposition workflow', () => {
  beforeEach(() => {
    localStorage.removeItem(AI_SUGGESTIONS_STORAGE_KEY);
    localStorage.removeItem(EXECUTION_AUDIT_STORAGE_KEY);
    localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify([PARENT, TASK]));
  });

  it('applies generated tasks, marks the suggestion applied, and writes audit details', () => {
    const suggestion = saveTaskDecompositionSuggestion(createSuggestion());

    const result = approveTaskDecompositionSuggestion({ suggestion, task: TASK, reviewer: 'user' });

    expect(result.appliedSuggestion).toMatchObject({
      id: suggestion.id,
      status: 'applied',
      reviewedBy: 'user',
    });
    expect(result.createdTasks).toHaveLength(2);
    expect(result.createdTasks.map((task) => task.parentId)).toEqual(['project-1', 'project-1']);

    expect(readHierarchyEntities()).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: 'sug-1-step-1',
          title: 'Clarify outcome',
          parentId: 'project-1',
        }),
        expect.objectContaining({
          id: 'sug-1-step-2',
          title: 'Draft checklist',
          parentId: 'project-1',
        }),
      ]),
    );

    const auditEntries = JSON.parse(localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY) ?? '[]');
    expect(auditEntries).toEqual([
      expect.objectContaining({
        action: 'ai.suggestion.approved',
        targetId: TASK.id,
        details: expect.objectContaining({
          createdTaskIds: ['sug-1-step-1', 'sug-1-step-2'],
          kind: 'task_decomposition',
          stepCount: 2,
          suggestionId: suggestion.id,
        }),
      }),
    ]);
  });

  it('rejects suggestions for a different task before writing data', () => {
    const suggestion = saveTaskDecompositionSuggestion({
      ...createSuggestion(),
      targetId: 'other-task',
    });

    expect(() =>
      approveTaskDecompositionSuggestion({ suggestion, task: TASK, reviewer: 'user' }),
    ).toThrow(/does not target task/i);
    expect(readHierarchyEntities()).toHaveLength(2);
    expect(JSON.parse(localStorage.getItem(EXECUTION_AUDIT_STORAGE_KEY) ?? '[]')).toEqual([]);
  });
});
