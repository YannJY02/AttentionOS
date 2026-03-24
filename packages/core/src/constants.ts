import type { EntityType, HierarchyLayer, RelationType, V2WorkflowStage } from './v2-types';

// ── Hierarchy ─────────────────────────────────────────────────────────────────

export const HIERARCHY_LAYERS: readonly HierarchyLayer[] = [
  'vision',
  'area',
  'goal',
  'project',
  'task',
] as const;

export const HIERARCHY_LAYER_INDEX: Readonly<Record<HierarchyLayer, number>> = {
  vision: 1,
  area: 2,
  goal: 3,
  project: 4,
  task: 5,
} as const;

// ── Workflow ──────────────────────────────────────────────────────────────────

export const WORKFLOW_STAGES: readonly V2WorkflowStage[] = [
  'ritual',
  'overview',
  'execution',
] as const;

/**
 * 合法的工作流阶段转移映射
 * XState daily-flow 状态机的 guards 应基于此表校验
 */
export const VALID_STAGE_TRANSITIONS: Readonly<
  Record<V2WorkflowStage, readonly V2WorkflowStage[]>
> = {
  ritual: ['overview'],
  overview: ['execution', 'ritual'],
  execution: ['overview', 'ritual'],
} as const;

// ── Entity ────────────────────────────────────────────────────────────────────

export const ENTITY_TYPES: readonly EntityType[] = [
  'task',
  'note',
  'meeting',
  'habit',
  'reflection',
  'contact',
  'event',
] as const;

// ── Relations ─────────────────────────────────────────────────────────────────

export const RELATION_TYPES: readonly RelationType[] = [
  'parent_of',
  'blocks',
  'relates_to',
  'spawned_from',
  'scheduled_in',
] as const;
