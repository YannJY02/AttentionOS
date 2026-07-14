import type { TaskDecompositionProposal, V2Entity } from './types';
import { validateHierarchyEntities, validateTaskDecompositionSuggestion } from './validation';

export const DEFAULT_EXECUTION_PROJECT_ID = 'project-desktop-workflow-scaffold';
export const DEFAULT_EXECUTION_GOAL_ID = 'goal-phase-1-deterministic-core';

const MAX_CANDIDATE_ACTIONS = 3;

export type ExecutionPlanEntityKind = 'project' | 'task';
export type ExecutionActionRole = 'current' | 'candidate' | 'backlog';
export type ProjectSignal = 'deliverable' | 'multi_block' | 'context_switch' | 'branching';

export interface CreateExecutionPlanEntityInput {
  readonly clarification?: string;
  readonly content?: string;
  readonly estimatedMinutes?: number;
  readonly kind: ExecutionPlanEntityKind;
  readonly parentId?: string;
  readonly projectSignals?: readonly ProjectSignal[];
  readonly role?: ExecutionActionRole;
  readonly title: string;
}

export interface ExecutionPlanValidationResult {
  readonly errors: string[];
  readonly projectSignalCount: number;
}

export interface HierarchyEntityChange {
  readonly entities: readonly V2Entity[];
  readonly entity: V2Entity;
}

export interface TaskDecompositionChange {
  readonly createdTasks: readonly V2Entity[];
  readonly entities: readonly V2Entity[];
}

export interface ProposalTaskArchiveChange {
  readonly archivedTasks: readonly V2Entity[];
  readonly entities: readonly V2Entity[];
  readonly skippedTaskIds: readonly string[];
}

export interface ProposalTaskRestoreChange {
  readonly entities: readonly V2Entity[];
  readonly restoredTasks: readonly V2Entity[];
  readonly skippedTaskIds: readonly string[];
}

function uniqueProjectSignals(projectSignals: readonly ProjectSignal[] = []): ProjectSignal[] {
  return [...new Set(projectSignals)].filter((signal): signal is ProjectSignal =>
    ['deliverable', 'multi_block', 'context_switch', 'branching'].includes(signal),
  );
}

function executionRole(entity: V2Entity): ExecutionActionRole {
  const role = entity.properties.executionRole;
  return role === 'current' || role === 'candidate' || role === 'backlog' ? role : 'backlog';
}

function withExecutionRole(
  entity: V2Entity,
  role: ExecutionActionRole,
  updatedAt: string,
): V2Entity {
  return {
    ...entity,
    properties: {
      ...entity.properties,
      executionRole: role,
    },
    updatedAt,
  };
}

function candidateCountForParent(
  parentId: string | undefined,
  entities: readonly V2Entity[],
  excludedTaskId?: string,
): number {
  return entities.filter(
    (entity) =>
      entity.id !== excludedTaskId &&
      entity.hierarchyLayer === 'task' &&
      entity.parentId === parentId &&
      entity.status === 'active' &&
      executionRole(entity) === 'candidate',
  ).length;
}

function normalizeTaskRole(
  task: V2Entity,
  role: ExecutionActionRole,
  entities: readonly V2Entity[],
  updatedAt: string,
): V2Entity[] {
  if (role === 'current') {
    const demotedRole =
      candidateCountForParent(task.parentId, entities, task.id) >= MAX_CANDIDATE_ACTIONS
        ? 'backlog'
        : 'candidate';

    return entities.map((entity) => {
      if (entity.id === task.id) {
        return withExecutionRole(entity, 'current', updatedAt);
      }

      if (
        entity.hierarchyLayer === 'task' &&
        entity.parentId === task.parentId &&
        executionRole(entity) === 'current'
      ) {
        return withExecutionRole(entity, demotedRole, updatedAt);
      }

      return entity;
    });
  }

  if (
    role === 'candidate' &&
    candidateCountForParent(task.parentId, entities, task.id) >= MAX_CANDIDATE_ACTIONS
  ) {
    throw new Error('Each project can keep at most three candidate actions.');
  }

  return entities.map((entity) =>
    entity.id === task.id ? withExecutionRole(entity, role, updatedAt) : entity,
  );
}

function parentIdForNewEntity(kind: ExecutionPlanEntityKind, parentId?: string): string {
  if (parentId) {
    return parentId;
  }

  return kind === 'project' ? DEFAULT_EXECUTION_GOAL_ID : DEFAULT_EXECUTION_PROJECT_ID;
}

function normalizeEstimatedMinutes(value: number | undefined): number {
  return value === undefined ? 25 : Math.round(value);
}

function isSubproject(entity: V2Entity, entities: readonly V2Entity[]): boolean {
  if (entity.hierarchyLayer !== 'project' || !entity.parentId) {
    return false;
  }

  return entities.some(
    (candidate) => candidate.id === entity.parentId && candidate.hierarchyLayer === 'project',
  );
}

function validateExecutionParent(
  input: CreateExecutionPlanEntityInput,
  entities: readonly V2Entity[],
  errors: string[],
): void {
  const parentId = parentIdForNewEntity(input.kind, input.parentId);
  const parent = entities.find((entity) => entity.id === parentId);

  if (!parent) {
    errors.push('Execution Plan parent was not found.');
    return;
  }

  if (input.kind === 'task' && parent.hierarchyLayer !== 'project') {
    errors.push('Tasks must live under a project.');
  }

  if (input.kind === 'project') {
    if (parent.hierarchyLayer !== 'goal' && parent.hierarchyLayer !== 'project') {
      errors.push('Projects must live under a goal or one parent project.');
    }

    if (parent.hierarchyLayer === 'project' && isSubproject(parent, entities)) {
      errors.push('Projects can have at most one subproject layer.');
    }
  }
}

export function validateExecutionPlanEntityInput(
  input: CreateExecutionPlanEntityInput,
  entities: readonly V2Entity[],
): ExecutionPlanValidationResult {
  const errors: string[] = [];
  const title = input.title.trim();
  const projectSignalCount = uniqueProjectSignals(input.projectSignals).length;
  const clarificationText = [input.clarification, input.content]
    .filter((value): value is string => Boolean(value?.trim()))
    .join(' ')
    .trim();

  if (!title) {
    errors.push('Title is required.');
  }

  if (input.kind === 'task') {
    const estimatedMinutes = normalizeEstimatedMinutes(input.estimatedMinutes);
    if (!clarificationText) {
      errors.push('Tasks need a clarification or first start note.');
    }
    if (!Number.isFinite(estimatedMinutes)) {
      errors.push('Tasks need a time estimate between 5 and 120 minutes.');
    }
    if (estimatedMinutes < 5) {
      errors.push('Tasks need at least a 5 minute estimate.');
    }
    if (estimatedMinutes > 120) {
      errors.push('Tasks must stay within the two-hour bound.');
    }
    if (projectSignalCount >= 2) {
      errors.push('This has at least two project signals. Create a project instead.');
    }
  }

  if (input.kind === 'project' && projectSignalCount < 2) {
    errors.push('A project needs at least two project signals.');
  }

  validateExecutionParent(input, entities, errors);
  return { errors, projectSignalCount };
}

export function findHierarchyEntity(entities: readonly V2Entity[], id: string): V2Entity | null {
  return entities.find((entity) => entity.id === id) ?? null;
}

export function listHierarchyEntities(
  entities: readonly V2Entity[],
  layer: V2Entity['hierarchyLayer'],
  parentId: string | null,
): V2Entity[] {
  return entities.filter((entity) => {
    if (entity.hierarchyLayer !== layer) {
      return false;
    }
    return layer === 'vision' ? !entity.parentId : entity.parentId === parentId;
  });
}

export function listExecutionPlanTasks(
  entities: readonly V2Entity[],
  parentId = DEFAULT_EXECUTION_PROJECT_ID,
): V2Entity[] {
  const roleRank: Record<ExecutionActionRole, number> = {
    current: 0,
    candidate: 1,
    backlog: 2,
  };

  return entities
    .filter(
      (entity) =>
        entity.hierarchyLayer === 'task' &&
        entity.parentId === parentId &&
        entity.status === 'active',
    )
    .sort((left, right) => {
      const roleDelta = roleRank[executionRole(left)] - roleRank[executionRole(right)];
      return roleDelta !== 0 ? roleDelta : left.createdAt.localeCompare(right.createdAt);
    });
}

export function setExecutionActionRoleChange(
  entities: readonly V2Entity[],
  taskId: string,
  role: ExecutionActionRole,
  updatedAt: string,
): HierarchyEntityChange {
  const task = entities.find((entity) => entity.id === taskId);
  if (!task || task.hierarchyLayer !== 'task') {
    throw new Error('Only task entities can be selected as execution actions.');
  }

  const nextEntities = normalizeTaskRole(task, role, entities, updatedAt);
  const errors = validateHierarchyEntities(nextEntities);
  if (errors.length > 0) {
    throw new Error(errors[0]);
  }

  const updatedTask = nextEntities.find((entity) => entity.id === taskId);
  if (!updatedTask) {
    throw new Error('Unable to update execution action.');
  }

  return { entities: nextEntities, entity: updatedTask };
}

export function createExecutionPlanEntityChange(
  entities: readonly V2Entity[],
  input: CreateExecutionPlanEntityInput,
  id: string,
  now: string,
): HierarchyEntityChange {
  const validation = validateExecutionPlanEntityInput(input, entities);
  if (validation.errors.length > 0) {
    throw new Error(validation.errors[0]);
  }

  const role = input.kind === 'task' ? (input.role ?? 'backlog') : undefined;
  const parentId = parentIdForNewEntity(input.kind, input.parentId);
  const entity: V2Entity = {
    id,
    entityType: 'task',
    hierarchyLayer: input.kind,
    title: input.title.trim(),
    content: input.content?.trim() || input.clarification?.trim() || undefined,
    status: 'active',
    properties: {
      ...(input.clarification?.trim() ? { clarification: input.clarification.trim() } : {}),
      ...(input.kind === 'project'
        ? { projectSignals: uniqueProjectSignals(input.projectSignals) }
        : {
            estimatedMinutes: normalizeEstimatedMinutes(input.estimatedMinutes),
            executionRole: role,
          }),
      source: 'execution.plan',
    },
    workflowStage: 'execution',
    parentId,
    createdAt: now,
    updatedAt: now,
  };

  let nextEntities = [...entities, entity];
  if (entity.hierarchyLayer === 'task' && role) {
    nextEntities = normalizeTaskRole(entity, role, nextEntities, now);
  }

  const errors = validateHierarchyEntities(nextEntities);
  if (errors.length > 0) {
    throw new Error(errors[0]);
  }

  return {
    entities: nextEntities,
    entity: nextEntities.find((candidate) => candidate.id === id) ?? entity,
  };
}

export function applyTaskDecompositionChange(
  entities: readonly V2Entity[],
  task: V2Entity,
  proposal: TaskDecompositionProposal,
  now: string,
): TaskDecompositionChange {
  const validationErrors = validateTaskDecompositionSuggestion(proposal);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }

  const existingIds = new Set(entities.map((entity) => entity.id));
  const parentId = task.parentId ?? task.id;
  const createdTasks = proposal.payload.steps.flatMap((step, index) => {
    const id = `${proposal.id}-step-${index + 1}`;
    if (existingIds.has(id)) {
      return [];
    }

    return [
      {
        id,
        entityType: 'task' as const,
        hierarchyLayer: 'task' as const,
        title: step.title,
        content: step.rationale,
        status: 'active' as const,
        properties: {
          aiGenerated: true,
          clarification: step.rationale,
          estimatedMinutes: step.estimatedMinutes,
          originalTaskId: task.id,
          sourceSuggestionId: proposal.id,
        },
        workflowStage: 'overview' as const,
        parentId,
        createdAt: now,
        updatedAt: now,
      },
    ];
  });
  const nextEntities = [...entities, ...createdTasks];
  const errors = validateHierarchyEntities(nextEntities);
  if (errors.length > 0) {
    throw new Error(errors[0]);
  }
  return { createdTasks, entities: nextEntities };
}

function isProposalCreatedTask(entity: V2Entity, proposalId: string): boolean {
  return (
    entity.hierarchyLayer === 'task' &&
    entity.properties.aiGenerated === true &&
    entity.properties.sourceSuggestionId === proposalId
  );
}

export function archiveProposalCreatedTasksChange(
  entities: readonly V2Entity[],
  proposalId: string,
  taskIds: readonly string[],
  now: string,
): ProposalTaskArchiveChange {
  const targetIds = new Set(taskIds);
  const seenIds = new Set<string>();
  const skippedTaskIds = new Set<string>();
  const archivedTasks: V2Entity[] = [];

  const nextEntities = entities.map((entity) => {
    if (!targetIds.has(entity.id)) {
      return entity;
    }
    seenIds.add(entity.id);
    if (!isProposalCreatedTask(entity, proposalId) || entity.status !== 'active') {
      skippedTaskIds.add(entity.id);
      return entity;
    }
    archivedTasks.push(entity);
    return {
      ...entity,
      status: 'archived' as const,
      properties: {
        ...entity.properties,
        rollbackAt: now,
        rollbackReason: 'ai.suggestion.rollback',
        rollbackSuggestionId: proposalId,
      },
      updatedAt: now,
    };
  });

  for (const taskId of taskIds) {
    if (!seenIds.has(taskId)) {
      skippedTaskIds.add(taskId);
    }
  }

  if (archivedTasks.length > 0) {
    const errors = validateHierarchyEntities(nextEntities);
    if (errors.length > 0) {
      throw new Error(errors[0]);
    }
  }

  return { archivedTasks, entities: nextEntities, skippedTaskIds: [...skippedTaskIds] };
}

export function restoreProposalCreatedTasksChange(
  entities: readonly V2Entity[],
  proposalId: string,
  taskSnapshots: readonly V2Entity[],
  now: string,
): ProposalTaskRestoreChange {
  const snapshotsById = new Map(taskSnapshots.map((task) => [task.id, task]));
  const restoredTasks: V2Entity[] = [];
  const skippedTaskIds = new Set<string>();
  const existingIds = new Set<string>();

  const nextEntities = entities.map((entity) => {
    const snapshot = snapshotsById.get(entity.id);
    if (!snapshot) {
      return entity;
    }
    existingIds.add(entity.id);
    if (!isProposalCreatedTask(entity, proposalId) || entity.status !== 'archived') {
      skippedTaskIds.add(entity.id);
      return entity;
    }
    const restoredTask: V2Entity = {
      ...snapshot,
      properties: { ...snapshot.properties, restoredFromRollbackAt: now },
      updatedAt: now,
    };
    restoredTasks.push(restoredTask);
    return restoredTask;
  });

  for (const snapshot of taskSnapshots) {
    if (existingIds.has(snapshot.id)) {
      continue;
    }
    if (!isProposalCreatedTask(snapshot, proposalId)) {
      skippedTaskIds.add(snapshot.id);
      continue;
    }
    const restoredTask: V2Entity = {
      ...snapshot,
      properties: { ...snapshot.properties, restoredFromRollbackAt: now },
      updatedAt: now,
    };
    restoredTasks.push(restoredTask);
    nextEntities.push(restoredTask);
  }

  if (restoredTasks.length > 0) {
    const errors = validateHierarchyEntities(nextEntities);
    if (errors.length > 0) {
      throw new Error(errors[0]);
    }
  }

  return { entities: nextEntities, restoredTasks, skippedTaskIds: [...skippedTaskIds] };
}
