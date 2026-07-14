// ── Scalar union types ────────────────────────────────────────────────────────

/** 实体类型：统一 entities 表中的所有个人数据类型 */
export type EntityType = 'task' | 'note' | 'meeting' | 'habit' | 'reflection' | 'contact' | 'event';

/** 实体状态 */
export type EntityStatus = 'active' | 'completed' | 'archived' | 'cancelled';

/**
 * V2 工作流阶段（三舞台模型）
 * 注意：与 V1 的 `WorkflowStage` 不同，V1 类型已标记为 @deprecated
 */
export type V2WorkflowStage = 'ritual' | 'overview' | 'execution';

/**
 * 五层目标体系层级
 * 与 V1 的 `PlanningLevel` 含义一致，可互换使用
 */
export type HierarchyLayer = 'vision' | 'area' | 'goal' | 'project' | 'task';

/** 实体间关系类型 */
export type RelationType = 'parent_of' | 'blocks' | 'relates_to' | 'spawned_from' | 'scheduled_in';

// ── Core entity interfaces ────────────────────────────────────────────────────

/**
 * V2 统一实体（对应 entities 表）
 * 所有个人数据的统一模型，通过 entityType 区分业务对象
 */
export interface V2Entity {
  readonly id: string;
  readonly entityType: EntityType;
  /** 仅任务体系使用：1=vision … 5=task */
  readonly hierarchyLayer?: HierarchyLayer;
  readonly title: string;
  readonly content?: string;
  readonly status: EntityStatus;
  /** 灵活属性：优先级、预估时间、标签等 */
  readonly properties: Readonly<Record<string, unknown>>;
  readonly workflowStage?: V2WorkflowStage;
  /** 层级关系快捷引用（冗余，与 edges 表保持同步） */
  readonly parentId?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly completedAt?: string;
}

/**
 * V2 实体间关系（对应 edges 表）
 */
export interface V2Edge {
  readonly id: string;
  readonly sourceId: string;
  readonly targetId: string;
  readonly relationType: RelationType;
  readonly weight: number;
  readonly metadata: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}

/**
 * V2 审计日志条目（对应 audit_log 表）
 */
export interface V2AuditLogEntry {
  readonly id: string;
  /** 操作者：'user' 或 `agent:${agentName}` */
  readonly actor: string;
  /** 操作类型：'entity.create' | 'workflow.transition' | ... */
  readonly action: string;
  readonly targetId?: string;
  readonly details: Readonly<Record<string, unknown>>;
  readonly createdAt: string;
}

// ── Create/Update input types (omit server-generated fields) ─────────────────

export type CreateEntityInput = Omit<V2Entity, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>;

export type UpdateEntityInput = Partial<
  Omit<V2Entity, 'id' | 'createdAt' | 'updatedAt' | 'entityType'>
>;

export type CreateEdgeInput = Omit<V2Edge, 'id' | 'createdAt'>;

export type CreateAuditLogInput = Omit<V2AuditLogEntry, 'id' | 'createdAt'>;

/** Immutable snapshot exposed to the supporting Guidance context. */
export interface WorkflowFacts {
  readonly auditEntries: readonly V2AuditLogEntry[];
  readonly entities: readonly V2Entity[];
  readonly stage: V2WorkflowStage;
}

export interface ProposedTaskStep {
  readonly title: string;
  readonly rationale?: string;
  readonly estimatedMinutes?: number;
}

/** Workflow-owned shape of a proposed task split, independent of its AI provenance. */
export interface TaskDecompositionProposal {
  readonly id: string;
  readonly targetId?: string;
  readonly payload: {
    readonly steps: readonly ProposedTaskStep[];
  };
}
