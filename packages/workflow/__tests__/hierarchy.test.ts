import { describe, expect, it } from 'vitest';
import { createExecutionPlanEntityChange, setExecutionActionRoleChange } from '../src/hierarchy';
import type { V2Entity } from '../src/types';

const NOW = '2026-07-14T06:00:00.000Z';
const GOAL: V2Entity = {
  id: 'goal-1',
  entityType: 'task',
  hierarchyLayer: 'goal',
  title: 'Goal',
  status: 'active',
  properties: {},
  createdAt: NOW,
  updatedAt: NOW,
};
const PROJECT: V2Entity = {
  ...GOAL,
  id: 'project-1',
  hierarchyLayer: 'project',
  parentId: GOAL.id,
  title: 'Project',
};
const FIRST_TASK: V2Entity = {
  ...GOAL,
  id: 'task-1',
  hierarchyLayer: 'task',
  parentId: PROJECT.id,
  properties: { estimatedMinutes: 25, executionRole: 'current' },
  title: 'First task',
};

describe('workflow hierarchy changes', () => {
  it('keeps one current action when another task is promoted', () => {
    const secondTask: V2Entity = {
      ...FIRST_TASK,
      id: 'task-2',
      properties: { estimatedMinutes: 25, executionRole: 'backlog' },
      title: 'Second task',
    };

    const change = setExecutionActionRoleChange(
      [GOAL, PROJECT, FIRST_TASK, secondTask],
      secondTask.id,
      'current',
      NOW,
    );

    expect(
      change.entities
        .filter((entity) => entity.properties.executionRole === 'current')
        .map((entity) => entity.id),
    ).toEqual([secondTask.id]);
    expect(
      change.entities.find((entity) => entity.id === FIRST_TASK.id)?.properties.executionRole,
    ).toBe('candidate');
  });

  it('rejects an overlong task before returning changed state', () => {
    expect(() =>
      createExecutionPlanEntityChange(
        [GOAL, PROJECT],
        {
          clarification: 'Start with one concrete check.',
          estimatedMinutes: 180,
          kind: 'task',
          parentId: PROJECT.id,
          title: 'Overlong task',
        },
        'task-new',
        NOW,
      ),
    ).toThrow(/two-hour/i);
  });
});
