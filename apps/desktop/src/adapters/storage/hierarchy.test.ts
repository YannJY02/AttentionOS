import type { TaskDecompositionSuggestion } from '@attentionos/core';
import type { V2Entity } from '@attentionos/workflow';
import { beforeEach, describe, expect, it } from 'vitest';
import {
  applyTaskDecompositionSuggestion,
  createExecutionPlanEntity,
  EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY,
  HIERARCHY_STORAGE_KEY,
  listExecutionPlanTasks,
  readFocusCandidateId,
  readHierarchyEntities,
  setExecutionActionRole,
} from './hierarchy';
import {
  readStorageRecoveryIssues,
  STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY,
} from './storageRecovery';

const GOAL: V2Entity = {
  id: 'goal-1',
  entityType: 'task',
  hierarchyLayer: 'goal',
  title: 'Release candidate',
  status: 'active',
  properties: {},
  workflowStage: 'overview',
  createdAt: '2026-05-23T00:00:00.000Z',
  updatedAt: '2026-05-23T00:00:00.000Z',
};

const PROJECT: V2Entity = {
  id: 'project-1',
  entityType: 'task',
  hierarchyLayer: 'project',
  title: 'Native packaging',
  status: 'active',
  properties: {},
  workflowStage: 'overview',
  parentId: GOAL.id,
  createdAt: '2026-05-23T00:00:00.000Z',
  updatedAt: '2026-05-23T00:00:00.000Z',
};

const SUBPROJECT: V2Entity = {
  id: 'project-2',
  entityType: 'task',
  hierarchyLayer: 'project',
  title: 'Signing readiness',
  status: 'active',
  properties: {},
  workflowStage: 'overview',
  parentId: PROJECT.id,
  createdAt: '2026-05-23T00:00:00.000Z',
  updatedAt: '2026-05-23T00:00:00.000Z',
};

const TASK: V2Entity = {
  id: 'task-1',
  entityType: 'task',
  hierarchyLayer: 'task',
  title: 'Check package metadata',
  status: 'active',
  properties: {
    estimatedMinutes: 25,
  },
  workflowStage: 'execution',
  parentId: PROJECT.id,
  createdAt: '2026-05-23T00:00:00.000Z',
  updatedAt: '2026-05-23T00:00:00.000Z',
};

function suggestion(
  overrides: Partial<TaskDecompositionSuggestion['payload']['steps'][number]> = {},
): TaskDecompositionSuggestion {
  return {
    id: 'suggestion-1',
    kind: 'task_decomposition',
    status: 'pending',
    targetId: TASK.id,
    title: 'Split task',
    rationale: 'Create one startable work block.',
    payload: {
      steps: [
        {
          title: 'Review package metadata',
          rationale: 'Open the Tauri config and verify release identity fields.',
          estimatedMinutes: 20,
          ...overrides,
        },
      ],
    },
    context: [],
    createdBy: 'agent:test',
    modelId: 'local-test',
    modelVersion: '2026-05-23',
    approvalRequired: true,
    createdAt: '2026-05-23T00:00:00.000Z',
    updatedAt: '2026-05-23T00:00:00.000Z',
  };
}

describe('hierarchy execution plan validation', () => {
  beforeEach(() => {
    localStorage.removeItem(EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY);
    localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify([GOAL, PROJECT, SUBPROJECT, TASK]));
  });

  it('requires task clarification and rejects over-two-hour estimates without clamping', () => {
    expect(() =>
      createExecutionPlanEntity({
        estimatedMinutes: 25,
        kind: 'task',
        parentId: PROJECT.id,
        title: 'Ambiguous task',
      }),
    ).toThrow(/clarification/i);

    expect(() =>
      createExecutionPlanEntity({
        clarification: 'Start by checking one concrete package field.',
        estimatedMinutes: 180,
        kind: 'task',
        parentId: PROJECT.id,
        title: 'Overlong task',
      }),
    ).toThrow(/two-hour/i);

    expect(readHierarchyEntities()).toHaveLength(4);
  });

  it('allows one subproject layer but blocks deeper project nesting', () => {
    const created = createExecutionPlanEntity({
      kind: 'project',
      parentId: PROJECT.id,
      projectSignals: ['deliverable', 'multi_block'],
      title: 'Export package checklist',
    });

    expect(created.parentId).toBe(PROJECT.id);
    expect(created.hierarchyLayer).toBe('project');

    expect(() =>
      createExecutionPlanEntity({
        kind: 'project',
        parentId: SUBPROJECT.id,
        projectSignals: ['deliverable', 'multi_block'],
        title: 'Nested signing checklist',
      }),
    ).toThrow(/one subproject layer/i);
  });

  it('validates generated decomposition steps again before creating persistent tasks', () => {
    expect(() =>
      applyTaskDecompositionSuggestion(TASK, suggestion({ rationale: '', estimatedMinutes: 20 })),
    ).toThrow(/clear start note/i);

    expect(() =>
      applyTaskDecompositionSuggestion(TASK, suggestion({ estimatedMinutes: 180 })),
    ).toThrow(/two-hour/i);

    const created = applyTaskDecompositionSuggestion(TASK, suggestion());

    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({
      parentId: PROJECT.id,
      properties: expect.objectContaining({
        clarification: 'Open the Tauri config and verify release identity fields.',
        estimatedMinutes: 20,
        sourceSuggestionId: 'suggestion-1',
      }),
    });
  });

  it('keeps exactly one current task and focus candidate among competing actions', () => {
    const secondTask: V2Entity = {
      ...TASK,
      id: 'task-2',
      title: 'Check notarization readiness',
      createdAt: '2026-05-23T00:01:00.000Z',
      updatedAt: '2026-05-23T00:01:00.000Z',
    };
    localStorage.setItem(
      HIERARCHY_STORAGE_KEY,
      JSON.stringify([GOAL, PROJECT, SUBPROJECT, TASK, secondTask]),
    );

    setExecutionActionRole(TASK.id, 'current');
    expect(readFocusCandidateId()).toBe(TASK.id);

    setExecutionActionRole(secondTask.id, 'current');

    expect(readFocusCandidateId()).toBe(secondTask.id);
    const tasks = readHierarchyEntities().filter((entity) => entity.parentId === PROJECT.id);
    expect(
      tasks
        .filter((entity) => entity.properties.executionRole === 'current')
        .map((entity) => entity.id),
    ).toEqual([secondTask.id]);
    expect(tasks.find((entity) => entity.id === TASK.id)?.properties.executionRole).toBe(
      'candidate',
    );

    setExecutionActionRole(secondTask.id, 'backlog');

    expect(readFocusCandidateId()).toBeNull();
  });

  it('sorts project actions by current, candidates, then later list', () => {
    const currentTask: V2Entity = {
      ...TASK,
      id: 'task-current',
      title: 'Current action',
      properties: { estimatedMinutes: 25, executionRole: 'current' },
      createdAt: '2026-05-23T00:04:00.000Z',
      updatedAt: '2026-05-23T00:04:00.000Z',
    };
    const olderCandidate: V2Entity = {
      ...TASK,
      id: 'task-candidate-older',
      title: 'Older candidate',
      properties: { estimatedMinutes: 25, executionRole: 'candidate' },
      createdAt: '2026-05-23T00:01:00.000Z',
      updatedAt: '2026-05-23T00:01:00.000Z',
    };
    const newerCandidate: V2Entity = {
      ...TASK,
      id: 'task-candidate-newer',
      title: 'Newer candidate',
      properties: { estimatedMinutes: 25, executionRole: 'candidate' },
      createdAt: '2026-05-23T00:03:00.000Z',
      updatedAt: '2026-05-23T00:03:00.000Z',
    };
    const backlogTask: V2Entity = {
      ...TASK,
      id: 'task-backlog',
      title: 'Later action',
      properties: { estimatedMinutes: 25, executionRole: 'backlog' },
      createdAt: '2026-05-23T00:02:00.000Z',
      updatedAt: '2026-05-23T00:02:00.000Z',
    };
    localStorage.setItem(
      HIERARCHY_STORAGE_KEY,
      JSON.stringify([GOAL, PROJECT, currentTask, backlogTask, newerCandidate, olderCandidate]),
    );

    expect(listExecutionPlanTasks(PROJECT.id).map((task) => task.title)).toEqual([
      'Current action',
      'Older candidate',
      'Newer candidate',
      'Later action',
    ]);
  });

  it('keeps current next-action limits project-specific across persisted reads', () => {
    const secondProject: V2Entity = {
      ...PROJECT,
      id: 'project-2',
      title: 'Second workstream',
    };
    const secondProjectTask: V2Entity = {
      ...TASK,
      id: 'task-project-2',
      title: 'Second project current',
      parentId: secondProject.id,
    };
    localStorage.setItem(
      HIERARCHY_STORAGE_KEY,
      JSON.stringify([GOAL, PROJECT, TASK, secondProject, secondProjectTask]),
    );

    setExecutionActionRole(TASK.id, 'current');
    setExecutionActionRole(secondProjectTask.id, 'current');

    const persisted = readHierarchyEntities();
    expect(
      persisted
        .filter((entity) => entity.properties.executionRole === 'current')
        .map((entity) => entity.id)
        .sort(),
    ).toEqual([TASK.id, secondProjectTask.id].sort());
    expect(readFocusCandidateId()).toBe(secondProjectTask.id);
  });

  it('rejects existing invalid hierarchy data before saving role edits', () => {
    const overlongTask: V2Entity = {
      ...TASK,
      properties: {
        estimatedMinutes: 180,
      },
    };
    localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify([GOAL, PROJECT, overlongTask]));

    expect(() => setExecutionActionRole(TASK.id, 'current')).toThrow(/time estimate/i);
    expect(readFocusCandidateId()).toBeNull();
  });

  it('preserves malformed hierarchy payloads before replacing them with defaults', () => {
    localStorage.setItem(HIERARCHY_STORAGE_KEY, '{broken');

    const entities = readHierarchyEntities();

    expect(entities.length).toBeGreaterThan(0);
    expect(localStorage.getItem(HIERARCHY_STORAGE_KEY)).not.toBe('{broken');
    expect(readStorageRecoveryIssues()).toEqual([
      expect.objectContaining({
        fallback: 'Using default hierarchy after preserving the malformed payload.',
        preserved: true,
        storageKey: HIERARCHY_STORAGE_KEY,
      }),
    ]);
    expect(JSON.parse(localStorage.getItem(STORAGE_RECOVERY_PAYLOADS_STORAGE_KEY) ?? '{}')).toEqual(
      {
        [HIERARCHY_STORAGE_KEY]: '{broken',
      },
    );
  });
});
