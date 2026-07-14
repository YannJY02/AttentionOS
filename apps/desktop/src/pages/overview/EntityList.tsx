import type { HierarchyLayer, V2Entity } from '@attentionos/workflow';
import { EntityCard } from './EntityCard';

const EMPTY_COPY: Record<HierarchyLayer, { readonly body: string; readonly title: string }> = {
  area: {
    body: 'This vision has no areas yet. Restore or import hierarchy data before using Overview to compare life or work domains.',
    title: 'No areas in this vision',
  },
  goal: {
    body: 'This area has no goals yet. Keep Overview as a scan surface and add goal structure in a planning surface before execution.',
    title: 'No goals in this area',
  },
  project: {
    body: 'This goal has no projects yet. Create or import a project path before expecting next actions here.',
    title: 'No projects in this goal',
  },
  task: {
    body: 'This project has no tasks yet. Use Execution Plan to create a clarified next action before entering Focus.',
    title: 'No tasks in this project',
  },
  vision: {
    body: 'No long-horizon direction is available. Restore or import a hierarchy before Overview can bridge into execution.',
    title: 'No visions to scan',
  },
};

interface EntityListProps {
  readonly currentLayer: HierarchyLayer;
  readonly entities: readonly V2Entity[];
  readonly onOpen: (entity: V2Entity) => void;
  readonly onStartExecution: (entity: V2Entity) => void;
}

export function EntityList({ currentLayer, entities, onOpen, onStartExecution }: EntityListProps) {
  if (entities.length === 0) {
    const copy = EMPTY_COPY[currentLayer];

    return (
      <section
        aria-label={`${currentLayer} empty state`}
        className="rounded-md border border-dashed border-stone-300 bg-white p-6"
      >
        <p className="font-medium text-stone-950">{copy.title}</p>
        <p className="mt-2 max-w-2xl text-sm text-stone-600">{copy.body}</p>
      </section>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {entities.map((entity) => (
        <EntityCard
          currentLayer={currentLayer}
          entity={entity}
          key={entity.id}
          onOpen={onOpen}
          onStartExecution={onStartExecution}
        />
      ))}
    </div>
  );
}
