import type { HierarchyLayer, V2Entity } from '@attentionos/core';
import { ChevronRight, Play } from 'lucide-react';

interface EntityCardProps {
  readonly currentLayer: HierarchyLayer;
  readonly entity: V2Entity;
  readonly onOpen: (entity: V2Entity) => void;
  readonly onStartExecution: (entity: V2Entity) => void;
}

export function EntityCard({ currentLayer, entity, onOpen, onStartExecution }: EntityCardProps) {
  const isTaskLayer = currentLayer === 'task';

  return (
    <article className="rounded-md border border-stone-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-medium text-stone-950">{entity.title}</p>
          {entity.content ? <p className="mt-2 text-sm text-stone-600">{entity.content}</p> : null}
        </div>
        <span className="rounded-sm bg-stone-100 px-2 py-1 font-medium text-stone-600 text-xs capitalize">
          {entity.hierarchyLayer}
        </span>
      </div>

      <div className="mt-5">
        {isTaskLayer ? (
          <button
            className="inline-flex items-center gap-2 rounded-md bg-stone-950 px-4 py-2 font-medium text-sm text-white"
            onClick={() => onStartExecution(entity)}
            type="button"
          >
            <Play aria-hidden="true" size={16} />
            Start execution for {entity.title}
          </button>
        ) : (
          <button
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 font-medium text-sm text-stone-800"
            onClick={() => onOpen(entity)}
            type="button"
          >
            Open {entity.title}
            <ChevronRight aria-hidden="true" size={16} />
          </button>
        )}
      </div>
    </article>
  );
}
