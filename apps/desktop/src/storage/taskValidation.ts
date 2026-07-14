import type { TaskDecompositionSuggestion, V2Entity } from '@attentionos/core';

const HIERARCHY_LAYERS = new Set(['vision', 'area', 'goal', 'project', 'task']);
const PROJECT_SIGNALS = new Set(['deliverable', 'multi_block', 'context_switch', 'branching']);
const EXECUTION_ROLES = new Set(['current', 'candidate', 'backlog']);
const MAX_CANDIDATE_ACTIONS = 3;

interface HierarchyValidationOptions {
  readonly strictParents?: boolean;
}

export function validateTaskDecompositionSuggestion(
  suggestion: TaskDecompositionSuggestion,
): string[] {
  const errors: string[] = [];

  if (suggestion.payload.steps.length === 0) {
    errors.push('Suggestion must include at least one step.');
  }

  for (const [index, step] of suggestion.payload.steps.entries()) {
    const stepNumber = index + 1;

    if (!step.title.trim()) {
      errors.push(`Step ${stepNumber} needs a startable title.`);
    }

    if (!step.rationale?.trim()) {
      errors.push(`Step ${stepNumber} needs a clear start note.`);
    }

    if (!Number.isFinite(step.estimatedMinutes)) {
      errors.push(`Step ${stepNumber} needs a time estimate between 5 and 120 minutes.`);
      continue;
    }

    if ((step.estimatedMinutes ?? 0) < 5) {
      errors.push(`Step ${stepNumber} needs at least a 5 minute estimate.`);
    }

    if ((step.estimatedMinutes ?? 0) > 120) {
      errors.push(`Step ${stepNumber} exceeds the two-hour task bound.`);
    }
  }

  return errors;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function projectSignalCount(entity: V2Entity): number {
  const projectSignals = entity.properties.projectSignals;

  if (!Array.isArray(projectSignals)) {
    return 0;
  }

  return [...new Set(projectSignals)].filter((signal) => PROJECT_SIGNALS.has(String(signal)))
    .length;
}

function executionRole(entity: V2Entity): string | null {
  const role = entity.properties.executionRole;
  return typeof role === 'string' ? role : null;
}

function isSubproject(entity: V2Entity, entitiesById: Map<string, V2Entity>): boolean {
  if (entity.hierarchyLayer !== 'project' || !entity.parentId) {
    return false;
  }

  return entitiesById.get(entity.parentId)?.hierarchyLayer === 'project';
}

function validateEntityShape(entity: unknown, index: number): string[] {
  const errors: string[] = [];

  if (!isRecord(entity)) {
    return [`Hierarchy entry ${index + 1} is not an object.`];
  }

  if (typeof entity.id !== 'string' || !entity.id.trim()) {
    errors.push(`Hierarchy entry ${index + 1} needs an id.`);
  }

  if (typeof entity.title !== 'string' || !entity.title.trim()) {
    errors.push(`Hierarchy entry ${index + 1} needs a title.`);
  }

  if (typeof entity.hierarchyLayer !== 'string' || !HIERARCHY_LAYERS.has(entity.hierarchyLayer)) {
    errors.push(`Hierarchy entry ${index + 1} has an unsupported layer.`);
  }

  if (!isRecord(entity.properties)) {
    errors.push(`Hierarchy entry ${index + 1} needs properties.`);
  }

  return errors;
}

export function validateHierarchyEntities(
  entities: readonly V2Entity[],
  options: HierarchyValidationOptions = {},
): string[] {
  const errors: string[] = [];
  const entitiesById = new Map<string, V2Entity>();

  for (const [index, entity] of entities.entries()) {
    errors.push(...validateEntityShape(entity, index));

    if (entitiesById.has(entity.id)) {
      errors.push(`Hierarchy entry ${entity.id} is duplicated.`);
    }
    entitiesById.set(entity.id, entity);
  }

  for (const entity of entities) {
    if (entity.hierarchyLayer === 'vision' && entity.parentId) {
      errors.push(`Vision ${entity.id} must not have a parent.`);
    }

    if (entity.hierarchyLayer !== 'vision') {
      if (!entity.parentId) {
        if (options.strictParents) {
          errors.push(`${entity.hierarchyLayer} ${entity.id} needs a parent.`);
        }
        continue;
      }

      const parent = entitiesById.get(entity.parentId);
      if (!parent) {
        errors.push(`${entity.hierarchyLayer} ${entity.id} references a missing parent.`);
        continue;
      }

      if (entity.hierarchyLayer === 'area' && parent.hierarchyLayer !== 'vision') {
        errors.push(`Area ${entity.id} must live under a vision.`);
      }

      if (entity.hierarchyLayer === 'goal' && parent.hierarchyLayer !== 'area') {
        errors.push(`Goal ${entity.id} must live under an area.`);
      }

      if (
        entity.hierarchyLayer === 'project' &&
        parent.hierarchyLayer !== 'goal' &&
        parent.hierarchyLayer !== 'project'
      ) {
        errors.push(`Project ${entity.id} must live under a goal or one parent project.`);
      }

      if (entity.hierarchyLayer === 'task' && parent.hierarchyLayer !== 'project') {
        errors.push(`Task ${entity.id} must live under a project.`);
      }
    }

    if (entity.hierarchyLayer === 'project' && isSubproject(entity, entitiesById)) {
      const parent = entitiesById.get(entity.parentId ?? '');
      if (parent && isSubproject(parent, entitiesById)) {
        errors.push(`Project ${entity.id} exceeds the one-subproject-layer limit.`);
      }
    }

    if (entity.hierarchyLayer === 'project' && Array.isArray(entity.properties.projectSignals)) {
      const signals = projectSignalCount(entity);
      if (signals < 2) {
        errors.push(`Project ${entity.id} needs at least two project signals.`);
      }
    }

    if (entity.hierarchyLayer === 'task') {
      if (projectSignalCount(entity) >= 2) {
        errors.push(`Task ${entity.id} has project-level signals and must be a project.`);
      }

      const estimatedMinutes = entity.properties.estimatedMinutes;
      if (
        estimatedMinutes !== undefined &&
        (typeof estimatedMinutes !== 'number' ||
          !Number.isFinite(estimatedMinutes) ||
          estimatedMinutes < 5 ||
          estimatedMinutes > 120)
      ) {
        errors.push(`Task ${entity.id} needs a time estimate between 5 and 120 minutes.`);
      }

      const role = executionRole(entity);
      if (role !== null && !EXECUTION_ROLES.has(role)) {
        errors.push(`Task ${entity.id} has an unsupported execution role.`);
      }
    }
  }

  const tasksByParent = new Map<
    string,
    {
      candidateCount: number;
      currentCount: number;
    }
  >();

  for (const entity of entities) {
    if (entity.hierarchyLayer !== 'task' || entity.status !== 'active') {
      continue;
    }

    const parentId = entity.parentId ?? '__root__';
    const counts = tasksByParent.get(parentId) ?? { candidateCount: 0, currentCount: 0 };
    const role = executionRole(entity);

    if (role === 'candidate') {
      counts.candidateCount += 1;
    }
    if (role === 'current') {
      counts.currentCount += 1;
    }

    tasksByParent.set(parentId, counts);
  }

  for (const [parentId, counts] of tasksByParent) {
    if (counts.currentCount > 1) {
      errors.push(`Project ${parentId} has more than one current action.`);
    }
    if (counts.candidateCount > MAX_CANDIDATE_ACTIONS) {
      errors.push(`Project ${parentId} has more than three candidate actions.`);
    }
  }

  return errors;
}

export function validateHierarchySnapshotPayload(payload: string): V2Entity[] {
  const parsed = JSON.parse(payload) as unknown;

  if (!Array.isArray(parsed)) {
    throw new Error('Hierarchy backup entry must be an array.');
  }

  const entities = parsed as V2Entity[];
  const errors = validateHierarchyEntities(entities, { strictParents: true });
  if (errors.length > 0) {
    throw new Error(errors[0]);
  }

  return entities;
}
