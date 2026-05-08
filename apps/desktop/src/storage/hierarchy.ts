import type { HierarchyLayer, V2Entity } from '@attentionos/core';

export const HIERARCHY_STORAGE_KEY = 'attentionos.hierarchy.v1';

const CREATED_AT = '2026-03-24T00:00:00.000Z';

export const DEFAULT_HIERARCHY_ENTITIES: readonly V2Entity[] = [
  {
    id: 'vision-personal-context-os',
    entityType: 'task',
    hierarchyLayer: 'vision',
    title: 'Personal Context OS',
    content: 'Long-term product direction for AttentionOS.',
    status: 'active',
    properties: {},
    workflowStage: 'overview',
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  },
  {
    id: 'area-product-development',
    entityType: 'task',
    hierarchyLayer: 'area',
    title: 'Product development',
    content: 'Build the deterministic core before AI expansion.',
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
    title: 'Phase 1 deterministic core',
    content: 'Make ritual, overview, and execution usable without AI.',
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
    title: 'Desktop workflow scaffold',
    content: 'Wire the desktop shell to the workflow state machines.',
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
    title: 'Wire overview',
    content: 'Connect hierarchy navigation to the Overview stage.',
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
