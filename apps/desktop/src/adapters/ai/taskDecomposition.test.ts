import type { V2Entity } from '@attentionos/workflow';
import { describe, expect, it } from 'vitest';
import { createLocalTaskDecompositionSuggestion } from './taskDecomposition';

const TASK: V2Entity = {
  createdAt: '2026-05-09T00:00:00.000Z',
  entityType: 'task',
  hierarchyLayer: 'task',
  id: 'task-1',
  parentId: 'project-1',
  properties: {},
  status: 'active',
  title: 'Wire execution',
  updatedAt: '2026-05-09T00:00:00.000Z',
  workflowStage: 'execution',
};

const OVERVIEW: V2Entity = {
  createdAt: '2026-05-09T00:00:00.000Z',
  entityType: 'task',
  hierarchyLayer: 'project',
  id: 'project-1',
  properties: {},
  status: 'active',
  title: 'Overview roadmap',
  updatedAt: '2026-05-09T00:00:00.000Z',
  workflowStage: 'overview',
};

describe('local task decomposition adapter', () => {
  it('preserves deterministic steps and ranks local workflow context', async () => {
    const suggestion = await createLocalTaskDecompositionSuggestion(
      TASK,
      [OVERVIEW, TASK],
      'Keep the split reviewable.',
    );

    expect(suggestion).toMatchObject({
      approvalRequired: true,
      createdBy: 'agent:phase2',
      kind: 'task_decomposition',
      modelId: 'local/task-decomposer',
      status: 'pending',
      targetId: TASK.id,
    });
    expect(suggestion.context[0]).toMatchObject({ entityId: TASK.id, privacyLevel: 'L0' });
    expect(suggestion.payload.steps.map((step) => step.title)).toEqual([
      'Clarify outcome for Wire execution',
      'Draft execution checklist for Wire execution',
      'Review completion criteria for Wire execution',
    ]);
    expect(suggestion.rationale).toContain('Human clarification: Keep the split reviewable.');
  });

  it('retains the local never-process guard', async () => {
    await expect(
      createLocalTaskDecompositionSuggestion(
        { ...TASK, content: 'Move the private key into the workflow.' },
        [TASK],
      ),
    ).rejects.toThrow(/never-process/i);
  });
});
