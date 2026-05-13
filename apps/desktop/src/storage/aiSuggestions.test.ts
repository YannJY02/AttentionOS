import type {
  TaskDecompositionSuggestion,
  WorkflowOptimizationSuggestion,
} from '@attentionos/core';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  AI_SUGGESTIONS_STORAGE_KEY,
  findTaskDecompositionSuggestion,
  findWorkflowOptimizationSuggestions,
  markTaskDecompositionApplied,
  markTaskDecompositionRejected,
  markWorkflowOptimizationReviewed,
  readAISuggestions,
  saveTaskDecompositionSuggestion,
  saveWorkflowOptimizationSuggestion,
} from './aiSuggestions';

function createSuggestion(
  patch: Partial<TaskDecompositionSuggestion> = {},
): TaskDecompositionSuggestion {
  return {
    id: 'sug-1',
    kind: 'task_decomposition',
    status: 'pending',
    targetId: 'task-1',
    title: 'Break down task',
    rationale: 'Split the task into reviewable execution steps.',
    payload: {
      steps: [{ title: 'Draft checklist', estimatedMinutes: 15 }],
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

function createWorkflowOptimizationSuggestion(): WorkflowOptimizationSuggestion {
  return {
    id: 'sug-workflow-1',
    kind: 'workflow_optimization',
    status: 'pending',
    title: 'Adjust next workflow cycle',
    rationale: 'Attention is overloaded.',
    payload: {
      actions: [{ label: 'Protect a focus block', type: 'schedule.focus_block' }],
      confidence: 0.72,
      evidence: ['attention overload'],
      privacyLevel: 'L1',
      targetStage: 'execution',
    },
    context: [],
    createdBy: 'agent:phase3',
    approvalRequired: true,
    createdAt: '2026-05-09T00:00:00.000Z',
    updatedAt: '2026-05-09T00:00:00.000Z',
  };
}

describe('AI suggestion browser storage', () => {
  beforeEach(() => {
    localStorage.removeItem(AI_SUGGESTIONS_STORAGE_KEY);
  });

  it('finds the newest task decomposition suggestion for a target', () => {
    const older = createSuggestion({
      id: 'sug-old',
      status: 'applied',
      updatedAt: '2026-05-09T00:00:00.000Z',
    });
    const newer = createSuggestion({
      id: 'sug-new',
      status: 'pending',
      updatedAt: '2026-05-09T00:01:00.000Z',
    });

    localStorage.setItem(AI_SUGGESTIONS_STORAGE_KEY, JSON.stringify([older, newer]));

    expect(findTaskDecompositionSuggestion('task-1')?.id).toBe('sug-new');
  });

  it('marks a suggestion applied with reviewer metadata', () => {
    const suggestion = saveTaskDecompositionSuggestion(createSuggestion());

    const applied = markTaskDecompositionApplied(suggestion, 'user');

    expect(applied).toMatchObject({
      status: 'applied',
      reviewedBy: 'user',
    });
    expect(applied.reviewedAt).toEqual(expect.any(String));
    expect(readAISuggestions()).toEqual([applied]);
  });

  it('marks a task decomposition suggestion rejected with reviewer metadata', () => {
    const suggestion = saveTaskDecompositionSuggestion(createSuggestion());

    const rejected = markTaskDecompositionRejected(suggestion, 'user');

    expect(rejected).toMatchObject({
      status: 'rejected',
      reviewedBy: 'user',
    });
    expect(rejected.reviewedAt).toEqual(expect.any(String));
    expect(rejected.updatedAt).not.toBe(suggestion.updatedAt);
    expect(readAISuggestions()).toEqual([rejected]);
  });

  it('approves workflow optimization suggestions without applying workflow changes', () => {
    const suggestion = saveWorkflowOptimizationSuggestion(createWorkflowOptimizationSuggestion());

    const approved = markWorkflowOptimizationReviewed(suggestion, 'approved', 'user');

    expect(approved).toMatchObject({
      kind: 'workflow_optimization',
      status: 'approved',
      reviewedBy: 'user',
    });
    expect(readAISuggestions()).toEqual([approved]);
  });

  it('filters workflow optimization suggestions by target stage', () => {
    saveWorkflowOptimizationSuggestion(createWorkflowOptimizationSuggestion());
    saveWorkflowOptimizationSuggestion({
      ...createWorkflowOptimizationSuggestion(),
      id: 'sug-workflow-ritual',
      payload: {
        ...createWorkflowOptimizationSuggestion().payload,
        targetStage: 'ritual',
      },
      updatedAt: '2026-05-09T00:01:00.000Z',
    });

    expect(findWorkflowOptimizationSuggestions()).toHaveLength(2);
    expect(findWorkflowOptimizationSuggestions('execution')).toEqual([
      expect.objectContaining({ id: 'sug-workflow-1' }),
    ]);
  });

  it('rejects workflow optimization suggestions without applying workflow changes', () => {
    const suggestion = saveWorkflowOptimizationSuggestion(createWorkflowOptimizationSuggestion());

    const rejected = markWorkflowOptimizationReviewed(suggestion, 'rejected', 'user');

    expect(rejected).toMatchObject({
      kind: 'workflow_optimization',
      status: 'rejected',
      reviewedBy: 'user',
    });
    expect(rejected.reviewedAt).toEqual(expect.any(String));
    expect(readAISuggestions()).toEqual([rejected]);
  });
});
