import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  ENTITY_TYPES,
  HIERARCHY_LAYER_INDEX,
  HIERARCHY_LAYERS,
  RELATION_TYPES,
  VALID_STAGE_TRANSITIONS,
  WORKFLOW_STAGES,
} from '../src/constants';
import type {
  EntityStatus,
  EntityType,
  HierarchyLayer,
  RelationType,
  V2AttentionObservationRecord,
  V2AuditLogEntry,
  V2Edge,
  V2Entity,
  V2WorkflowStage,
} from '../src/v2-types';

// ── Type-level tests ──────────────────────────────────────────────────────────

describe('V2Entity type shape', () => {
  it('has required fields', () => {
    expectTypeOf<V2Entity>().toHaveProperty('id');
    expectTypeOf<V2Entity>().toHaveProperty('entityType');
    expectTypeOf<V2Entity>().toHaveProperty('title');
    expectTypeOf<V2Entity>().toHaveProperty('status');
    expectTypeOf<V2Entity>().toHaveProperty('properties');
    expectTypeOf<V2Entity>().toHaveProperty('createdAt');
    expectTypeOf<V2Entity>().toHaveProperty('updatedAt');
  });

  it('optional fields are optional', () => {
    expectTypeOf<V2Entity['hierarchyLayer']>().toEqualTypeOf<HierarchyLayer | undefined>();
    expectTypeOf<V2Entity['parentId']>().toEqualTypeOf<string | undefined>();
    expectTypeOf<V2Entity['completedAt']>().toEqualTypeOf<string | undefined>();
  });
});

describe('V2Edge type shape', () => {
  it('has source/target/relation fields', () => {
    expectTypeOf<V2Edge>().toHaveProperty('sourceId');
    expectTypeOf<V2Edge>().toHaveProperty('targetId');
    expectTypeOf<V2Edge>().toHaveProperty('relationType');
    expectTypeOf<V2Edge>().toHaveProperty('weight');
  });
});

describe('V2AuditLogEntry type shape', () => {
  it('has actor and action fields', () => {
    expectTypeOf<V2AuditLogEntry>().toHaveProperty('actor');
    expectTypeOf<V2AuditLogEntry>().toHaveProperty('action');
    expectTypeOf<V2AuditLogEntry>().toHaveProperty('details');
  });
});

describe('V2AttentionObservationRecord type shape', () => {
  it('has score and breakdown', () => {
    expectTypeOf<V2AttentionObservationRecord>().toHaveProperty('score');
    expectTypeOf<V2AttentionObservationRecord>().toHaveProperty('breakdown');
  });
});

// ── Runtime constant tests ────────────────────────────────────────────────────

describe('HIERARCHY_LAYERS', () => {
  it('has exactly 5 layers in order', () => {
    expect(HIERARCHY_LAYERS).toHaveLength(5);
    expect(HIERARCHY_LAYERS).toEqual(['vision', 'area', 'goal', 'project', 'task']);
  });
});

describe('HIERARCHY_LAYER_INDEX', () => {
  it('maps vision=1, task=5', () => {
    expect(HIERARCHY_LAYER_INDEX.vision).toBe(1);
    expect(HIERARCHY_LAYER_INDEX.area).toBe(2);
    expect(HIERARCHY_LAYER_INDEX.goal).toBe(3);
    expect(HIERARCHY_LAYER_INDEX.project).toBe(4);
    expect(HIERARCHY_LAYER_INDEX.task).toBe(5);
  });
});

describe('WORKFLOW_STAGES', () => {
  it('has 3 stages', () => {
    expect(WORKFLOW_STAGES).toHaveLength(3);
    expect(WORKFLOW_STAGES).toContain('ritual');
    expect(WORKFLOW_STAGES).toContain('overview');
    expect(WORKFLOW_STAGES).toContain('execution');
  });
});

describe('VALID_STAGE_TRANSITIONS', () => {
  it('ritual → overview only', () => {
    expect(VALID_STAGE_TRANSITIONS.ritual).toEqual(['overview']);
  });

  it('overview → execution and ritual', () => {
    expect(VALID_STAGE_TRANSITIONS.overview).toContain('execution');
    expect(VALID_STAGE_TRANSITIONS.overview).toContain('ritual');
  });

  it('execution → overview and ritual', () => {
    expect(VALID_STAGE_TRANSITIONS.execution).toContain('overview');
    expect(VALID_STAGE_TRANSITIONS.execution).toContain('ritual');
  });

  it('covers all stages', () => {
    const stages: V2WorkflowStage[] = ['ritual', 'overview', 'execution'];
    for (const stage of stages) {
      expect(VALID_STAGE_TRANSITIONS[stage]).toBeDefined();
    }
  });
});

describe('ENTITY_TYPES', () => {
  it('includes core entity types', () => {
    const required: EntityType[] = ['task', 'note', 'reflection'];
    for (const t of required) {
      expect(ENTITY_TYPES).toContain(t);
    }
  });
});

describe('RELATION_TYPES', () => {
  it('includes core relation types', () => {
    const required: RelationType[] = ['parent_of', 'blocks', 'relates_to'];
    for (const t of required) {
      expect(RELATION_TYPES).toContain(t);
    }
  });
});

// ── Integration: EntityStatus exhaustiveness ──────────────────────────────────

describe('EntityStatus', () => {
  it('is a union of known values', () => {
    // This test catches regressions if the type is narrowed unexpectedly
    const statuses: EntityStatus[] = ['active', 'completed', 'archived', 'cancelled'];
    expect(statuses).toHaveLength(4);
  });
});
