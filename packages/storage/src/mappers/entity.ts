import type {
  EntityStatus,
  EntityType,
  HierarchyLayer,
  V2Entity,
  V2WorkflowStage,
} from '@attentionos/core';

// ── DB row type (snake_case from Supabase) ────────────────────────────────────

interface EntityRow {
  id: string;
  entity_type: string;
  hierarchy_layer: number | null;
  title: string;
  content: string | null;
  status: string;
  properties: Record<string, unknown>;
  workflow_stage: string | null;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

const LAYER_NUM_TO_NAME: Record<number, HierarchyLayer> = {
  1: 'vision',
  2: 'area',
  3: 'goal',
  4: 'project',
  5: 'task',
};

const LAYER_NAME_TO_NUM: Record<HierarchyLayer, number> = {
  vision: 1,
  area: 2,
  goal: 3,
  project: 4,
  task: 5,
};

export function rowToEntity(row: EntityRow): V2Entity {
  return {
    id: row.id,
    entityType: row.entity_type as EntityType,
    hierarchyLayer:
      row.hierarchy_layer != null ? LAYER_NUM_TO_NAME[row.hierarchy_layer] : undefined,
    title: row.title,
    content: row.content ?? undefined,
    status: row.status as EntityStatus,
    properties: row.properties ?? {},
    workflowStage: (row.workflow_stage ?? undefined) as V2WorkflowStage | undefined,
    parentId: row.parent_id ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? undefined,
  };
}

export function entityToRow(entity: Partial<V2Entity>): Partial<EntityRow> {
  const row: Partial<EntityRow> = {};

  if (entity.entityType !== undefined) row.entity_type = entity.entityType;
  if (entity.hierarchyLayer !== undefined)
    row.hierarchy_layer = LAYER_NAME_TO_NUM[entity.hierarchyLayer];
  if (entity.title !== undefined) row.title = entity.title;
  if ('content' in entity) row.content = entity.content ?? null;
  if (entity.status !== undefined) row.status = entity.status;
  if (entity.properties !== undefined) row.properties = entity.properties;
  if ('workflowStage' in entity) row.workflow_stage = entity.workflowStage ?? null;
  if ('parentId' in entity) row.parent_id = entity.parentId ?? null;
  if ('completedAt' in entity) row.completed_at = entity.completedAt ?? null;

  return row;
}
