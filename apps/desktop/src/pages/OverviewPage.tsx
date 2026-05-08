import type { V2Entity } from '@attentionos/core';
import { ArrowUp, Layers3 } from 'lucide-react';
import { useDailyFlow } from '../hooks/useDailyFlow';
import { useHierarchyNav } from '../hooks/useHierarchyNav';
import { EntityList } from './overview/EntityList';
import { HierarchyBreadcrumb } from './overview/HierarchyBreadcrumb';

export function OverviewPage() {
  const dailyFlow = useDailyFlow();
  const hierarchy = useHierarchyNav();

  function startExecution(entity: V2Entity) {
    dailyFlow.send({ type: 'START_EXECUTION', taskId: entity.id });
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="font-medium text-emerald-700 text-sm">Stage 2</p>
        <h1 className="mt-2 font-semibold text-4xl text-stone-950">Overview</h1>
        <p className="mt-3 max-w-2xl text-base text-stone-600">
          A read-only view for scanning the current workflow layer before switching into execution.
          Editing and decomposition belong in the execution stage.
        </p>
      </div>

      <div className="mb-6 rounded-md border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
              <Layers3 aria-hidden="true" size={16} />
              Current layer: {hierarchy.currentLayer}
            </p>
            <div className="mt-3">
              <HierarchyBreadcrumb entities={hierarchy.breadcrumb} />
            </div>
          </div>

          <button
            className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 font-medium text-sm text-stone-800 disabled:cursor-not-allowed disabled:opacity-40"
            disabled={!hierarchy.canDrillUp}
            onClick={hierarchy.drillUp}
            type="button"
          >
            <ArrowUp aria-hidden="true" size={16} />
            Back to parent
          </button>
        </div>
      </div>

      <EntityList
        currentLayer={hierarchy.currentLayer}
        entities={hierarchy.entities}
        onOpen={hierarchy.drillDown}
        onStartExecution={startExecution}
      />
    </section>
  );
}
