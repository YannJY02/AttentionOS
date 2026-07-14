import type { V2Entity } from '@attentionos/workflow';
import { ArrowRight, ArrowUp, Layers3, RotateCcw } from 'lucide-react';
import { useNavigate } from 'react-router';
import { useDailyFlow } from '../hooks/useDailyFlow';
import { useHierarchyNav } from '../hooks/useHierarchyNav';
import { findHierarchyEntity, setExecutionActionRole } from '../storage/hierarchy';
import { type PersistedTaskRuntime, readCurrentPersistedTaskRuntime } from '../storage/taskRuntime';
import { EntityList } from './overview/EntityList';
import { HierarchyBreadcrumb } from './overview/HierarchyBreadcrumb';
import { LearningSnapshotPanel } from './overview/LearningSnapshotPanel';
import { OverviewSignalsPanel } from './overview/OverviewSignalsPanel';
import { ReleaseMetricsPanel } from './overview/ReleaseMetricsPanel';
import { TaskOverviewModesPanel } from './overview/TaskOverviewModesPanel';
import { VisionOverviewPanel } from './overview/VisionOverviewPanel';

const LAYER_SCAN_COPY = {
  vision: {
    label: 'Vision',
    purpose: 'Judge long-horizon direction before comparing metrics or tasks.',
    bridge: 'Inspect the branch that should organize area and goal decisions.',
  },
  area: {
    label: 'Area',
    purpose: 'Scan the life or work domain that currently needs direction.',
    bridge: 'Drill into the goal that should become actionable next.',
  },
  goal: {
    label: 'Goal',
    purpose: 'Check the outcome and constraints before choosing a project.',
    bridge: 'Open the project that can carry the next concrete step.',
  },
  project: {
    label: 'Project',
    purpose: 'Review the active project path before entering task execution.',
    bridge: 'Open the task that is ready for focused work.',
  },
  task: {
    label: 'Task',
    purpose: 'Confirm the executable unit before starting focused execution.',
    bridge: 'Start Execution only when the task is the right next action.',
  },
} as const;

function OverviewRecoveryBridge({
  onOpen,
  runtime,
  task,
}: {
  readonly onOpen: () => void;
  readonly runtime: PersistedTaskRuntime;
  readonly task: V2Entity;
}) {
  return (
    <section
      aria-label="Interruption recovery cue"
      className="mb-6 rounded-md border border-emerald-200 bg-emerald-50 p-5 text-emerald-950"
    >
      <p className="inline-flex items-center gap-2 font-medium text-sm">
        <RotateCcw aria-hidden="true" size={16} />
        Resume cue
      </p>
      <h2 className="mt-2 font-semibold text-2xl">{task.title}</h2>
      <p className="mt-2 max-w-2xl text-sm">
        {runtime.actualMinutes} saved minute{runtime.actualMinutes === 1 ? '' : 's'} in{' '}
        {runtime.state}. Review the recovery cue in Execution before adding planning context.
      </p>
      <button
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 font-medium text-sm text-white hover:bg-emerald-800"
        onClick={onOpen}
        type="button"
      >
        Review recovery in Execution
        <ArrowRight aria-hidden="true" size={16} />
      </button>
    </section>
  );
}

export function OverviewPage() {
  const dailyFlow = useDailyFlow();
  const hierarchy = useHierarchyNav();
  const navigate = useNavigate();
  const currentLayerCopy = LAYER_SCAN_COPY[hierarchy.currentLayer];
  const primaryVision =
    hierarchy.currentLayer === 'vision' ? (hierarchy.entities[0] ?? null) : null;
  const persistedRuntime = readCurrentPersistedTaskRuntime();
  const persistedRuntimeTask = persistedRuntime
    ? findHierarchyEntity(persistedRuntime.taskId)
    : null;

  function startExecution(entity: V2Entity) {
    setExecutionActionRole(entity.id, 'current');
    dailyFlow.send({ type: 'START_EXECUTION', taskId: entity.id });
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="font-medium text-emerald-700 text-sm">Stage 2</p>
        <h1 className="mt-2 font-semibold text-4xl text-stone-950">Overview</h1>
        <p className="mt-3 max-w-2xl text-base text-stone-600">
          Read-only scan for the current hierarchy layer before switching into execution.
        </p>
      </div>

      <section
        aria-label="Overview scan context"
        className="mb-6 rounded-md border border-stone-200 bg-white p-5"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 font-medium text-sm text-stone-500">
              <Layers3 aria-hidden="true" size={16} />
              Current layer: {currentLayerCopy.label}
            </p>
            <h2 className="mt-3 font-semibold text-2xl text-stone-950">
              {currentLayerCopy.purpose}
            </h2>
            <p className="mt-2 text-sm text-stone-600">{currentLayerCopy.bridge}</p>
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
      </section>

      {persistedRuntime && persistedRuntimeTask ? (
        <OverviewRecoveryBridge
          onOpen={() => navigate('/execution/plan')}
          runtime={persistedRuntime}
          task={persistedRuntimeTask}
        />
      ) : null}

      {hierarchy.currentLayer === 'vision' ? (
        <VisionOverviewPanel entity={primaryVision} onOpen={hierarchy.drillDown} />
      ) : null}

      <OverviewSignalsPanel
        currentLayer={hierarchy.currentLayer}
        visibleEntityCount={hierarchy.entities.length}
      />
      <LearningSnapshotPanel />
      <ReleaseMetricsPanel />
      {hierarchy.currentLayer === 'task' ? <TaskOverviewModesPanel /> : null}

      <EntityList
        currentLayer={hierarchy.currentLayer}
        entities={hierarchy.entities}
        onOpen={hierarchy.drillDown}
        onStartExecution={startExecution}
      />
    </section>
  );
}
