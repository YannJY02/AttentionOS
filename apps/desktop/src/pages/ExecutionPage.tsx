import type { V2Entity } from '@attentionos/core';
import {
  type ExecutionMode,
  executionModeMachine,
  hasExecutionFocusTarget,
} from '@attentionos/machines';
import { useMachine } from '@xstate/react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useDailyFlow } from '../hooks/useDailyFlow';
import { type TaskLifecycleApi, useTaskLifecycle } from '../hooks/useTaskLifecycle';
import { findHierarchyEntity } from '../storage/hierarchy';
import { AiDecompositionPanel } from './execution/AiDecompositionPanel';
import { EvolutionSuggestionsPanel } from './execution/EvolutionSuggestionsPanel';
import { TaskActions } from './execution/TaskActions';
import { TaskDetail } from './execution/TaskDetail';
import { TaskTimer } from './execution/TaskTimer';

interface ActiveTaskFocusProps {
  readonly onReturnToPlan: () => void;
  readonly task: TaskLifecycleApi;
}

function ActiveTaskFocus({ onReturnToPlan, task }: ActiveTaskFocusProps) {
  return (
    <div className="grid gap-4">
      <div>
        <button
          className="inline-flex items-center gap-2 rounded-md border border-stone-300 px-4 py-2 font-medium text-sm text-stone-800"
          onClick={onReturnToPlan}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={16} />
          Back to execution plan
        </button>
      </div>
      <TaskDetail task={task} />
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <TaskTimer task={task} />
        <TaskActions task={task} />
      </div>
    </div>
  );
}

interface ActiveTaskPlanProps {
  readonly onEnterFocus: () => void;
  readonly task: TaskLifecycleApi;
  readonly taskEntity: V2Entity;
}

function ActiveTaskPlan({ onEnterFocus, task, taskEntity }: ActiveTaskPlanProps) {
  return (
    <div className="grid gap-4">
      <div className="rounded-md border border-stone-200 bg-white p-5">
        <p className="font-medium text-stone-950">Focus candidate</p>
        <h2 className="mt-2 font-semibold text-2xl text-stone-950">{taskEntity.title}</h2>
        <p className="mt-2 text-sm text-stone-600">
          State: {task.state}. Estimate: {task.estimatedMinutes} minutes. Review the plan before
          switching into focused work.
        </p>
        <button
          className="mt-5 inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 font-medium text-sm text-white hover:bg-emerald-800"
          onClick={onEnterFocus}
          type="button"
        >
          Enter focus
          <ArrowRight aria-hidden="true" size={16} />
        </button>
      </div>
      <section aria-label="Execution plan helper lanes" className="grid gap-4">
        <div>
          <p className="font-medium text-sky-700 text-sm">Human review lanes</p>
          <h2 className="mt-2 font-semibold text-2xl text-stone-950">
            Suggestions stay pending until you decide
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-stone-600">
            Use these lanes while planning. Focus mode keeps them out of view so one action remains
            primary.
          </p>
        </div>
        <AiDecompositionPanel task={taskEntity} />
        <EvolutionSuggestionsPanel />
      </section>
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

interface ActiveTaskSessionProps {
  readonly mode: ExecutionMode;
  readonly onDone: () => void;
  readonly onEnterFocus: () => void;
  readonly onReturnToPlan: () => void;
  readonly taskEntity: V2Entity;
  readonly taskId: string;
}

function ActiveTaskSession({
  mode,
  onDone,
  onEnterFocus,
  onReturnToPlan,
  taskEntity,
  taskId,
}: ActiveTaskSessionProps) {
  const task = useTaskLifecycle({
    estimatedMinutes: getEstimatedMinutes(taskId),
    onDone,
    taskId,
    title: getTaskTitle(taskId),
  });

  if (mode === 'plan') {
    return <ActiveTaskPlan onEnterFocus={onEnterFocus} task={task} taskEntity={taskEntity} />;
  }

  return <ActiveTaskFocus onReturnToPlan={onReturnToPlan} task={task} />;
}

function executionModeFromPathname(pathname: string): {
  mode: ExecutionMode;
  valid: boolean;
} {
  const [stage, routeMode] = pathname.split('/').filter(Boolean);

  if (stage !== 'execution') {
    return { mode: 'plan', valid: false };
  }

  if (routeMode === 'plan' || routeMode === 'focus') {
    return { mode: routeMode, valid: true };
  }

  return { mode: 'plan', valid: false };
}

export function ExecutionPage() {
  const dailyFlow = useDailyFlow();
  const location = useLocation();
  const navigate = useNavigate();
  const { mode, valid: validExecutionRoute } = executionModeFromPathname(location.pathname);
  const [executionMode, sendExecutionMode] = useMachine(executionModeMachine);
  const activeTaskId = dailyFlow.activeTaskId;
  const activeTask = activeTaskId ? findHierarchyEntity(activeTaskId) : null;
  const hasActiveFocusTarget = hasExecutionFocusTarget(activeTaskId) && Boolean(activeTask);
  const restoredModeRef = useRef<string | null>(null);
  const redirectReason =
    typeof location.state === 'object' && location.state !== null
      ? (location.state as { executionModeRedirect?: string }).executionModeRedirect
      : null;
  const wasRedirectedFromInvalidFocus = redirectReason === 'missing-focus-target';

  function returnToOverview() {
    dailyFlow.send({ type: 'BACK_TO_OVERVIEW' });
  }

  function returnToPlan() {
    sendExecutionMode({ type: 'REQUEST_PLAN' });
    navigate('/execution/plan');
  }

  function enterFocus() {
    sendExecutionMode({ type: 'REQUEST_FOCUS', taskId: activeTaskId });
    navigate('/execution/focus');
  }

  useEffect(() => {
    if (!validExecutionRoute) {
      navigate('/execution/plan', { replace: true });
      return;
    }

    const restoreKey = `${mode}:${activeTaskId ?? 'none'}`;
    if (restoredModeRef.current !== restoreKey) {
      sendExecutionMode({ type: 'RESTORE_MODE', mode, taskId: activeTaskId });
      restoredModeRef.current = restoreKey;
    }

    if (mode === 'focus') {
      if (!hasActiveFocusTarget) {
        navigate('/execution/plan', {
          replace: true,
          state: { executionModeRedirect: 'missing-focus-target' },
        });
      }

      return;
    }
  }, [activeTaskId, hasActiveFocusTarget, mode, navigate, sendExecutionMode, validExecutionRoute]);

  if (mode === 'focus' && !hasActiveFocusTarget) {
    return null;
  }

  return (
    <section className="mx-auto max-w-5xl" data-execution-mode={executionMode.value}>
      <div className="mb-8">
        <p className="font-medium text-sky-700 text-sm">Stage 3</p>
        <h1 className="mt-2 font-semibold text-4xl text-stone-950">
          {mode === 'plan' ? 'Execution Plan' : 'Execution Focus'}
        </h1>
        <p className="mt-3 max-w-2xl text-base text-stone-600">
          {mode === 'plan'
            ? 'Review the selected action, decide on pending suggestions, and choose when to focus.'
            : 'Work on one chosen action. Planning suggestions stay outside this focus view.'}
        </p>
      </div>

      {wasRedirectedFromInvalidFocus ? (
        <div
          className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-900 text-sm"
          role="status"
        >
          Choose one task from Overview before entering Focus.
        </div>
      ) : null}

      {activeTaskId && activeTask ? (
        <ActiveTaskSession
          key={activeTaskId}
          mode={mode}
          onDone={returnToOverview}
          onEnterFocus={enterFocus}
          onReturnToPlan={returnToPlan}
          taskId={activeTaskId}
          taskEntity={activeTask}
        />
      ) : null}

      {!activeTaskId || !activeTask ? (
        <div className="rounded-md border border-stone-200 bg-white p-6">
          <p className="font-medium text-stone-950">No focus candidate</p>
          <p className="mt-2 max-w-xl text-sm text-stone-600">
            Choose a task from Overview before planning or entering focused work.
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
      ) : null}
    </section>
  );
}
