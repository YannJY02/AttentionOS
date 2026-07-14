import type { TaskDecompositionSuggestion } from '@attentionos/guidance';
import {
  applyTaskDecompositionChange,
  archiveProposalCreatedTasksChange,
  type CreateExecutionPlanEntityInput,
  createExecutionPlanEntityChange,
  DEFAULT_EXECUTION_PROJECT_ID,
  type ExecutionActionRole,
  type ExecutionPlanEntityKind,
  type ExecutionPlanValidationResult,
  findHierarchyEntity as findEntity,
  type HierarchyLayer,
  listHierarchyEntities as listEntities,
  listExecutionPlanTasks as listTasks,
  restoreProposalCreatedTasksChange,
  setExecutionActionRoleChange,
  type V2Entity,
  validateExecutionPlanEntityInput as validateEntityInput,
  validateHierarchyEntities,
} from '@attentionos/workflow';
import { logExecutionPlanEntityCreated, logExecutionPlanRoleChanged } from './audit';
import { queuePersistAppState } from './persistence';
import { recordMalformedStorageEntry } from './storageRecovery';

export type {
  CreateExecutionPlanEntityInput,
  ExecutionActionRole,
  ExecutionPlanEntityKind,
  ExecutionPlanValidationResult,
  ProjectSignal,
} from '@attentionos/workflow';

export const HIERARCHY_STORAGE_KEY = 'attentionos.hierarchy.v1';
export const EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY = 'attentionos.execution.focusCandidate.v1';

const CREATED_AT = '2026-03-24T00:00:00.000Z';

interface AISuggestionTaskMutationInput {
  readonly suggestionId: string;
  readonly taskIds: readonly string[];
}

interface AISuggestionTaskRestoreInput {
  readonly suggestionId: string;
  readonly taskSnapshots: readonly V2Entity[];
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
    properties: { estimatedMinutes: 25 },
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
  } catch (error) {
    recordMalformedStorageEntry({
      error,
      fallback: 'Using default hierarchy after preserving the malformed payload.',
      payload: raw,
      storageKey: HIERARCHY_STORAGE_KEY,
    });
  }

  return null;
}

function createEntityId(kind: ExecutionPlanEntityKind, title: string): string {
  const base = title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 36);

  return `${kind}-${base || 'item'}-${Date.now().toString(36)}`;
}

function saveHierarchyEntities(entities: readonly V2Entity[]): void {
  const errors = validateHierarchyEntities(entities);
  if (errors.length > 0) {
    throw new Error(errors[0]);
  }
  localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify(entities));
  queuePersistAppState();
}

export function validateExecutionPlanEntityInput(
  input: CreateExecutionPlanEntityInput,
  entities = readHierarchyEntities(),
): ExecutionPlanValidationResult {
  return validateEntityInput(input, entities);
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
  return findEntity(readHierarchyEntities(), id);
}

export function listHierarchyEntities(layer: HierarchyLayer, parentId: string | null): V2Entity[] {
  return listEntities(readHierarchyEntities(), layer, parentId);
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
  return listTasks(readHierarchyEntities(), parentId);
}

export function setExecutionActionRole(taskId: string, role: ExecutionActionRole): V2Entity {
  const change = setExecutionActionRoleChange(
    readHierarchyEntities(),
    taskId,
    role,
    new Date().toISOString(),
  );
  saveHierarchyEntities(change.entities);

  if (role === 'current') {
    localStorage.setItem(EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY, taskId);
    queuePersistAppState();
  } else if (readFocusCandidateId() === taskId) {
    localStorage.removeItem(EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY);
    queuePersistAppState();
  }

  logExecutionPlanRoleChanged({ role, targetId: taskId });
  return change.entity;
}

export function createExecutionPlanEntity(input: CreateExecutionPlanEntityInput): V2Entity {
  const now = new Date().toISOString();
  const change = createExecutionPlanEntityChange(
    readHierarchyEntities(),
    input,
    createEntityId(input.kind, input.title),
    now,
  );
  saveHierarchyEntities(change.entities);

  const role = input.kind === 'task' ? (input.role ?? 'backlog') : undefined;
  if (role === 'current') {
    localStorage.setItem(EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY, change.entity.id);
    queuePersistAppState();
  }

  logExecutionPlanEntityCreated({
    entityId: change.entity.id,
    entityType: input.kind,
    parentId: change.entity.parentId ?? '',
    role,
  });
  return change.entity;
}

export function applyTaskDecompositionSuggestion(
  task: V2Entity,
  suggestion: TaskDecompositionSuggestion,
): V2Entity[] {
  const change = applyTaskDecompositionChange(
    readHierarchyEntities(),
    task,
    suggestion,
    new Date().toISOString(),
  );
  saveHierarchyEntities(change.entities);
  return [...change.createdTasks];
}

export function archiveAISuggestionCreatedTasks({
  suggestionId,
  taskIds,
}: AISuggestionTaskMutationInput) {
  const focusCandidateId = readFocusCandidateId();
  const change = archiveProposalCreatedTasksChange(
    readHierarchyEntities(),
    suggestionId,
    taskIds,
    new Date().toISOString(),
  );

  if (change.archivedTasks.length > 0) {
    saveHierarchyEntities(change.entities);
    if (focusCandidateId && change.archivedTasks.some((task) => task.id === focusCandidateId)) {
      localStorage.removeItem(EXECUTION_FOCUS_CANDIDATE_STORAGE_KEY);
      queuePersistAppState();
    }
  }

  return {
    archivedTasks: [...change.archivedTasks],
    skippedTaskIds: [...change.skippedTaskIds],
  };
}

export function restoreArchivedAISuggestionTasks({
  suggestionId,
  taskSnapshots,
}: AISuggestionTaskRestoreInput) {
  const change = restoreProposalCreatedTasksChange(
    readHierarchyEntities(),
    suggestionId,
    taskSnapshots,
    new Date().toISOString(),
  );

  if (change.restoredTasks.length > 0) {
    saveHierarchyEntities(change.entities);
  }

  return {
    restoredTasks: [...change.restoredTasks],
    skippedTaskIds: [...change.skippedTaskIds],
  };
}
