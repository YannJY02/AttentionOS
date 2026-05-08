import type { HierarchyLayer, V2Entity } from '@attentionos/core';
import { EntityCard } from './EntityCard';

interface EntityListProps {
  readonly currentLayer: HierarchyLayer;
  readonly entities: readonly V2Entity[];
  readonly onOpen: (entity: V2Entity) => void;
  readonly onStartExecution: (entity: V2Entity) => void;
}

export function EntityList({ currentLayer, entities, onOpen, onStartExecution }: EntityListProps) {
  if (entities.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-stone-300 bg-white p-6 text-sm text-stone-600">
        No entities in this layer.
      </div>
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
