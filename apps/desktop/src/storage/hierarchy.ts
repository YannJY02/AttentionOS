import type { HierarchyLayer, TaskDecompositionSuggestion, V2Entity } from '@attentionos/core';
import { logExecutionPlanEntityCreated, logExecutionPlanRoleChanged } from './audit';
import { queuePersistAppState } from './persistence';
import { recordMalformedStorageEntry } from './storageRecovery';
import { validateHierarchyEntities, validateTaskDecompositionSuggestion } from './taskValidation';

export const HIERARCHY_STORAGE_KEY = 'attentionos.hierarchy.v1';
export const EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY = 'attentionos.execution.focusCandidate.v1';

const CREATED_AT = '2026-03-24T00:00:00.000Z';
const DEFAULT_EXECUTION_PROJECT_ID = 'project-desktop-workflow-scaffold';
const DEFAULT_EXECUTION_GOAL_ID = 'goal-phase-1-deterministic-core';
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

interface AISuggestionTaskMutationInput {
  readonly suggestionId: string;
  readonly taskIds: readonly string[];
}

interface AISuggestionTaskRestoreInput {
  readonly suggestionId: string;
  readonly taskSnapshots: readonly V2Entity[];
}

interface AISuggestionTaskArchiveResult {
  readonly archivedTasks: readonly V2Entity[];
  readonly skippedTaskIds: readonly string[];
}

interface AISuggestionTaskRestoreResult {
  readonly restoredTasks: readonly V2Entity[];
  readonly skippedTaskIds: readonly string[];
}

export const DEFAULT_HIERARCHY_ENTITIES: readonly V2Entity[] = [
  {
    id: 'vision-personal-context-os',
    entityType: 'task',
    hierarchyLayer: 'vision',
    title: 'Personal Context OS',
    content:
      'Long-term direction for protecting attention across work, recovery, and personal context.',
    status: 'active',
    properties: {
      horizon: '2026 operating direction',
      reflectionCadence: 'Weekly direction check',
      nextCheckpoint: 'Validate whether Overview points clearly into Execution.',
      milestones: [
        {
          label: 'Reliable workflow foundation',
          timeframe: 'Now',
          status: 'active',
          description: 'Ritual, Overview, and Execution remain usable before any AI help is added.',
        },
        {
          label: 'Experience alignment',
          timeframe: 'Next',
          status: 'in progress',
          description: 'Each stage expresses its real job in the workflow.',
        },
        {
          label: 'AI as a bounded assistant',
          timeframe: 'Later',
          status: 'planned',
          description: 'Suggestions remain subordinate to the current stage and user intent.',
        },
      ],
    },
    workflowStage: 'overview',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'area-product-development',
    entityType: 'task',
    hierarchyLayer: 'area',
    title: 'Product development',
    content: 'Shape the product around attention-first workflow transitions.',
    status: 'active',
    properties: {},
    workflowStage: 'overview',
    parentId: 'vision-personal-context-os',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'goal-phase-1-deterministic-core',
    entityType: 'task',
    hierarchyLayer: 'goal',
    title: 'Coherent stage experience',
    content: 'Make Ritual, Overview, and Execution feel like one attention workflow.',
    status: 'active',
    properties: {},
    workflowStage: 'overview',
    parentId: 'area-product-development',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'project-desktop-workflow-scaffold',
    entityType: 'task',
    hierarchyLayer: 'project',
    title: 'Overview scan redesign',
    content: 'Make the hierarchy scan readable before the user enters focused work.',
    status: 'active',
    properties: {},
    workflowStage: 'overview',
    parentId: 'goal-phase-1-deterministic-core',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'task-wire-overview',
    entityType: 'task',
    hierarchyLayer: 'task',
    title: 'Clarify overview scan',
    content: 'Show layer context, direction, and the next bridge into execution.',
    status: 'active',
    properties: {
      estimatedMinutes: 25,
    },
    workflowStage: 'overview',
    parentId: 'project-desktop-workflow-scaffold',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
];

function parseEntities(raw: string | null): V2Entity[] | null {
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }

    recordMalformedStorageEntry({
      error: new Error('Hierarchy entries are not an array.'),
      fallback: 'Using default hierarchy after preserving the malformed payload.',
      payload: raw,
      storageKey: HIERARCHY_STORAGE_KEY,
    });
    return null;
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Using default hierarchy after preserving the malformed payload.',
      payload: raw,
      storageKey: HIERARCHY_STORAGE_KEY,
    });
    return null;
  }
}

function createEntityId(kind: ExecutionPlanEntityKind, title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 36);
  const suffix = Date.now().toString(36);

  return `${kind}-${base || 'item'}-${suffix}`;
}

function uniqueProjectSignals(projectSignals: readonly ProjectSignal[] = []): ProjectSignal[] {
  return [...new Set(projectSignals)].filter((signal): signal is ProjectSignal =>
    ['deliverable', 'multi_block', 'context_switch', 'branching'].includes(signal),
  );
}

function saveHierarchyEntities(entities: readonly V2Entity[]): void {
  const validationErrors = validateHierarchyEntities(entities);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }

  localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify(entities));
  queuePersistAppState();
}

function siblingTasks(
  parentId: string | undefined,
  entities = readHierarchyEntities(),
): V2Entity[] {
  return entities.filter(
    (entity) =>
      entity.hierarchyLayer === 'task' &&
      entity.parentId === parentId &&
      entity.status === 'active',
  );
}

function executionRole(entity: V2Entity): ExecutionActionRole {
  const role = entity.properties.executionRole;
  return role === 'current' || role === 'candidate' || role === 'backlog' ? role : 'backlog';
}

function withExecutionRole(entity: V2Entity, role: ExecutionActionRole): V2Entity {
  return {
    ...entity,
    properties: {
      ...entity.properties,
      executionRole: role,
    },
    updatedAt: new Date().toISOString(),
  };
}

function candidateCountForParent(
  parentId: string | undefined,
  entities: readonly V2Entity[],
  excludedTaskId?: string,
) {
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
): V2Entity[] {
  if (role === 'current') {
    const demotedRole =
      candidateCountForParent(task.parentId, entities, task.id) >= MAX_CANDIDATE_ACTIONS
        ? 'backlog'
        : 'candidate';

    return entities.map((entity) => {
      if (entity.id === task.id) {
        return withExecutionRole(entity, 'current');
      }

      if (
        entity.hierarchyLayer === 'task' &&
        entity.parentId === task.parentId &&
        executionRole(entity) === 'current'
      ) {
        return withExecutionRole(entity, demotedRole);
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
    entity.id === task.id ? withExecutionRole(entity, role) : entity,
  );
}

function parentIdForNewEntity(kind: ExecutionPlanEntityKind, parentId?: string): string {
  if (parentId) {
    return parentId;
  }

  return kind === 'project' ? DEFAULT_EXECUTION_GOAL_ID : DEFAULT_EXECUTION_PROJECT_ID;
}

function normalizeEstimatedMinutes(value: number | undefined): number {
  if (value === undefined) {
    return 25;
  }

  return Math.round(value);
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
) {
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
  entities = readHierarchyEntities(),
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

export function readHierarchyEntities(): V2Entity[] {
  const parsed = parseEntities(localStorage.getItem(HIERARCHY_STORAGE_KEY));

  if (parsed) {
    return parsed;
  }

  const defaults = [...DEFAULT_HIERARCHY_ENTITIES];
  localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify(defaults));
  queuePersistAppState();
  return defaults;
}

export function findHierarchyEntity(id: string): V2Entity | null {
  return readHierarchyEntities().find((entity) => entity.id === id) ?? null;
}

export function listHierarchyEntities(layer: HierarchyLayer, parentId: string | null): V2Entity[] {
  return readHierarchyEntities().filter((entity) => {
    if (entity.hierarchyLayer !== layer) {
      return false;
    }

    if (layer === 'vision') {
      return !entity.parentId;
    }

    return entity.parentId === parentId;
  });
}

export function readFocusCandidateId(): string | null {
  const candidateId = localStorage.getItem(EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY);
  if (!candidateId) {
    return null;
  }

  const candidate = findHierarchyEntity(candidateId);
  return candidate?.hierarchyLayer === 'task' && candidate.status === 'active' ? candidateId : null;
}

export function listExecutionPlanTasks(parentId = DEFAULT_EXECUTION_PROJECT_ID): V2Entity[] {
  const roleRank: Record<ExecutionActionRole, number> = {
    current: 0,
    candidate: 1,
    backlog: 2,
  };

  return siblingTasks(parentId).sort((left, right) => {
    const roleDelta = roleRank[executionRole(left)] - roleRank[executionRole(right)];
    if (roleDelta !== 0) {
      return roleDelta;
    }

    return left.createdAt.localeCompare(right.createdAt);
  });
}

export function setExecutionActionRole(taskId: string, role: ExecutionActionRole): V2Entity {
  const entities = readHierarchyEntities();
  const task = entities.find((entity) => entity.id === taskId);

  if (!task || task.hierarchyLayer !== 'task') {
    throw new Error('Only task entities can be selected as execution actions.');
  }

  const nextEntities = normalizeTaskRole(task, role, entities);
  const updatedTask = nextEntities.find((entity) => entity.id === taskId);
  if (!updatedTask) {
    throw new Error('Unable to update execution action.');
  }

  saveHierarchyEntities(nextEntities);

  if (role === 'current') {
    localStorage.setItem(EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY, taskId);
    queuePersistAppState();
  } else if (readFocusCandidateId() === taskId) {
    localStorage.removeItem(EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY);
    queuePersistAppState();
  }

  logExecutionPlanRoleChanged({ role, targetId: taskId });
  return updatedTask;
}

export function createExecutionPlanEntity(input: CreateExecutionPlanEntityInput): V2Entity {
  const entities = readHierarchyEntities();
  const validation = validateExecutionPlanEntityInput(input, entities);
  if (validation.errors.length > 0) {
    throw new Error(validation.errors[0]);
  }

  const now = new Date().toISOString();
  const role = input.kind === 'task' ? (input.role ?? 'backlog') : undefined;
  const parentId = parentIdForNewEntity(input.kind, input.parentId);
  const entity: V2Entity = {
    id: createEntityId(input.kind, input.title),
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
    nextEntities = normalizeTaskRole(entity, role, nextEntities);
  }

  saveHierarchyEntities(nextEntities);

  if (entity.hierarchyLayer === 'task' && role === 'current') {
    localStorage.setItem(EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY, entity.id);
    queuePersistAppState();
  }

  logExecutionPlanEntityCreated({
    entityId: entity.id,
    entityType: input.kind,
    parentId,
    role,
  });

  return entity;
}

export function applyTaskDecompositionSuggestion(
  task: V2Entity,
  suggestion: TaskDecompositionSuggestion,
): V2Entity[] {
  const validationErrors = validateTaskDecompositionSuggestion(suggestion);
  if (validationErrors.length > 0) {
    throw new Error(validationErrors[0]);
  }

  const entities = readHierarchyEntities();
  const existingIds = new Set(entities.map((entity) => entity.id));
  const parentId = task.parentId ?? task.id;
  const now = new Date().toISOString();

  const createdTasks = suggestion.payload.steps.flatMap((step, index) => {
    const id = `${suggestion.id}-step-${index + 1}`;
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
          sourceSuggestionId: suggestion.id,
        },
        workflowStage: 'overview' as const,
        parentId,
        createdAt: now,
        updatedAt: now,
      },
    ];
  });

  saveHierarchyEntities([...entities, ...createdTasks]);
  return createdTasks;
}

function isAISuggestionCreatedTask(entity: V2Entity, suggestionId: string): boolean {
  return (
    entity.hierarchyLayer === 'task' &&
    entity.properties.aiGenerated === true &&
    entity.properties.sourceSuggestionId === suggestionId
  );
}

export function archiveAISuggestionCreatedTasks({
  suggestionId,
  taskIds,
}: AISuggestionTaskMutationInput): AISuggestionTaskArchiveResult {
  const targetIds = new Set(taskIds);
  const seenIds = new Set<string>();
  const skippedTaskIds = new Set<string>();
  const archivedTasks: V2Entity[] = [];
  const now = new Date().toISOString();

  const nextEntities = readHierarchyEntities().map((entity) => {
    if (!targetIds.has(entity.id)) {
      return entity;
    }

    seenIds.add(entity.id);
    if (!isAISuggestionCreatedTask(entity, suggestionId) || entity.status !== 'active') {
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
        rollbackSuggestionId: suggestionId,
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
    saveHierarchyEntities(nextEntities);

    const focusCandidateId = readFocusCandidateId();
    if (focusCandidateId && archivedTasks.some((task) => task.id === focusCandidateId)) {
      localStorage.removeItem(EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY);
      queuePersistAppState();
    }
  }

  return {
    archivedTasks,
    skippedTaskIds: [...skippedTaskIds],
  };
}

export function restoreArchivedAISuggestionTasks({
  suggestionId,
  taskSnapshots,
}: AISuggestionTaskRestoreInput): AISuggestionTaskRestoreResult {
  const snapshotsById = new Map(taskSnapshots.map((task) => [task.id, task]));
  const restoredTasks: V2Entity[] = [];
  const skippedTaskIds = new Set<string>();
  const now = new Date().toISOString();
  const existingIds = new Set<string>();

  const nextEntities = readHierarchyEntities().map((entity) => {
    const snapshot = snapshotsById.get(entity.id);
    if (!snapshot) {
      return entity;
    }

    existingIds.add(entity.id);
    if (!isAISuggestionCreatedTask(entity, suggestionId) || entity.status !== 'archived') {
      skippedTaskIds.add(entity.id);
      return entity;
    }

    const restoredTask: V2Entity = {
      ...snapshot,
      properties: {
        ...snapshot.properties,
        restoredFromRollbackAt: now,
      },
      updatedAt: now,
    };
    restoredTasks.push(restoredTask);
    return restoredTask;
  });

  for (const snapshot of taskSnapshots) {
    if (existingIds.has(snapshot.id)) {
      continue;
    }

    if (!isAISuggestionCreatedTask(snapshot, suggestionId)) {
      skippedTaskIds.add(snapshot.id);
      continue;
    }

    const restoredTask: V2Entity = {
      ...snapshot,
      properties: {
        ...snapshot.properties,
        restoredFromRollbackAt: now,
      },
      updatedAt: now,
    };
    restoredTasks.push(restoredTask);
    nextEntities.push(restoredTask);
  }

  if (restoredTasks.length > 0) {
    saveHierarchyEntities(nextEntities);
  }

  return {
    restoredTasks,
    skippedTaskIds: [...skippedTaskIds],
  };
}
