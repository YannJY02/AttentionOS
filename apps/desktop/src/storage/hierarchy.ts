import type { HierarchyLayer, TaskDecompositionSuggestion, V2Entity } from '@attentionos/core';

export const HIERARCHY_STORAGE_KEY = 'attentionos.hierarchy.v1';

const CREATED_AT = '2026-03-24T00:00:00.000Z';

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
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function readHierarchyEntities(): V2Entity[] {
  const parsed = parseEntities(localStorage.getItem(HIERARCHY_STORAGE_KEY));

  if (parsed) {
    return parsed;
  }

  const defaults = [...DEFAULT_HIERARCHY_ENTITIES];
  localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify(defaults));
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

export function applyTaskDecompositionSuggestion(
  task: V2Entity,
  suggestion: TaskDecompositionSuggestion,
): V2Entity[] {
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
          estimatedMinutes: step.estimatedMinutes ?? 15,
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

  localStorage.setItem(HIERARCHY_STORAGE_KEY, JSON.stringify([...entities, ...createdTasks]));
  return createdTasks;
}
