import type { HierarchyLayer, V2Entity } from '@attentionos/core';
import { hierarchyNavMachine } from '@attentionos/machines';
import { useMachine } from '@xstate/react';
import { useMemo } from 'react';
import { findHierarchyEntity, listHierarchyEntities } from '../storage/hierarchy';

interface HierarchyStore {
  readonly findById: (id: string) => V2Entity | null;
  readonly listByLayer: (layer: HierarchyLayer, parentId: string | null) => V2Entity[];
}

const hierarchyStore: HierarchyStore = {
  findById: findHierarchyEntity,
  listByLayer: listHierarchyEntities,
};

export interface HierarchyNavApi {
  readonly breadcrumb: V2Entity[];
  readonly canDrillUp: boolean;
  readonly currentLayer: HierarchyLayer;
  readonly drillDown: (entity: V2Entity) => void;
  readonly drillUp: () => void;
  readonly entities: V2Entity[];
  readonly selectedEntityId: string | null;
}

export function useHierarchyNav(store: HierarchyStore = hierarchyStore): HierarchyNavApi {
  const [snapshot, send] = useMachine(hierarchyNavMachine);
  const currentLayer = snapshot.value as HierarchyLayer;
  const selectedEntityId = snapshot.context.selectedEntityId;
  const parentId = currentLayer === 'vision' ? null : selectedEntityId;

  const entities = useMemo(
    () => store.listByLayer(currentLayer, parentId),
    [currentLayer, parentId, store],
  );

  const breadcrumb = useMemo(
    () =>
      snapshot.context.breadcrumb
        .map((entityId) => store.findById(entityId))
        .filter((entity): entity is V2Entity => entity !== null),
    [snapshot.context.breadcrumb, store],
  );

  function drillDown(entity: V2Entity) {
    if (currentLayer === 'task') {
      return;
    }

    send({ type: 'DRILL_DOWN', entityId: entity.id });
  }

  function drillUp() {
    send({ type: 'DRILL_UP' });
  }

  return {
    breadcrumb,
    canDrillUp: currentLayer !== 'vision',
    currentLayer,
    drillDown,
    drillUp,
    entities,
    selectedEntityId,
  };
}
