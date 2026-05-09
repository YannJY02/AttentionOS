import type { V2Entity } from '@attentionos/core';
import { ArrowLeft } from 'lucide-react';
import { useDailyFlow } from '../hooks/useDailyFlow';
import { useTaskLifecycle } from '../hooks/useTaskLifecycle';
import { findHierarchyEntity } from '../storage/hierarchy';
import { AiDecompositionPanel } from './execution/AiDecompositionPanel';
import { EvolutionSuggestionsPanel } from './execution/EvolutionSuggestionsPanel';
import { TaskActions } from './execution/TaskActions';
import { TaskDetail } from './execution/TaskDetail';
import { TaskTimer } from './execution/TaskTimer';

interface ActiveTaskExecutionProps {
  readonly estimatedMinutes: number;
  readonly onDone: () => void;
  readonly taskEntity: V2Entity;
  readonly taskId: string;
  readonly title: string;
}

function ActiveTaskExecution({
  estimatedMinutes,
  onDone,
  taskEntity,
  taskId,
  title,
}: ActiveTaskExecutionProps) {
  const task = useTaskLifecycle({ estimatedMinutes, onDone, taskId, title });

  return (
    <div className="grid gap-4">
      <TaskDetail task={task} />
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <TaskTimer task={task} />
        <TaskActions task={task} />
      </div>
      <AiDecompositionPanel task={taskEntity} />
      <EvolutionSuggestionsPanel />
    </div>
  );
}

function getEstimatedMinutes(taskId: string): number {
  const task = findHierarchyEntity(taskId);
  const value = task?.properties.estimatedMinutes;
  return typeof value === 'number' ? value : 30;
}

function getTaskTitle(taskId: string): string {
  return findHierarchyEntity(taskId)?.title ?? 'Active task';
}

export function ExecutionPage() {
  const dailyFlow = useDailyFlow();
  const activeTaskId = dailyFlow.activeTaskId;
  const activeTask = activeTaskId ? findHierarchyEntity(activeTaskId) : null;

  function returnToOverview() {
    dailyFlow.send({ type: 'BACK_TO_OVERVIEW' });
  }

  return (
    <section className="mx-auto max-w-5xl">
      <div className="mb-8">
        <p className="font-medium text-sky-700 text-sm">Stage 3</p>
        <h1 className="mt-2 font-semibold text-4xl text-stone-950">Execution</h1>
        <p className="mt-3 max-w-2xl text-base text-stone-600">
          The active work stage for planning, focus, review, and completion. This is where editable
          task and project workflows will connect to the XState machines.
        </p>
      </div>

      {activeTaskId && activeTask ? (
        <ActiveTaskExecution
          estimatedMinutes={getEstimatedMinutes(activeTaskId)}
          key={activeTaskId}
          onDone={returnToOverview}
          taskEntity={activeTask}
          taskId={activeTaskId}
          title={getTaskTitle(activeTaskId)}
        />
      ) : (
        <div className="rounded-md border border-stone-200 bg-white p-6">
          <p className="font-medium text-stone-950">No active task</p>
          <p className="mt-2 max-w-xl text-sm text-stone-600">
            Choose a task from Overview before entering execution focus.
          </p>
          <button
            className="mt-5 inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 font-medium text-sm text-stone-800"
            onClick={returnToOverview}
            type="button"
          >
            <ArrowLeft aria-hidden="true" size={16} />
            Back to overview
          </button>
        </div>
      )}
    </section>
  );
}
