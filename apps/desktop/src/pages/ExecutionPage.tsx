import type { V2Entity } from '@attentionos/core';
import {
  type ExecutionMode,
  executionModeMachine,
  hasExecutionFocusTarget,
} from '@attentionos/machines';
import { useMachine } from '@xstate/react';
import { ArrowLeft, ArrowRight, Save } from 'lucide-react';
import { type FormEvent, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router';
import { useDailyFlow } from '../hooks/useDailyFlow';
import { type TaskLifecycleApi, useTaskLifecycle } from '../hooks/useTaskLifecycle';
import {
  type ContextCaptureChannel,
  type ContextCaptureRecord,
  listContextCapturePlanningInputs,
} from '../storage/contextCapture';
import {
  createExecutionPlanEntity,
  type ExecutionActionRole,
  type ExecutionPlanEntityKind,
  findHierarchyEntity,
  listExecutionPlanTasks,
  type ProjectSignal,
  readFocusCandidateId,
  setExecutionActionRole,
} from '../storage/hierarchy';
import {
  getRitualFollowUpTargets,
  listRitualFollowUpInputs,
  type RitualFollowUpTarget,
} from '../storage/reflections';
import {
  type PersistedTaskRuntime,
  readCurrentPersistedTaskRuntime,
  readPersistedTaskRuntime,
} from '../storage/taskRuntime';
import { AiDecompositionPanel } from './execution/AiDecompositionPanel';
import { EvolutionSuggestionsPanel } from './execution/EvolutionSuggestionsPanel';
import { TaskActions } from './execution/TaskActions';
import { TaskDetail } from './execution/TaskDetail';
import { TaskTimer } from './execution/TaskTimer';

interface ActiveTaskFocusProps {
  readonly onReturnToPlan: () => void;
  readonly task: TaskLifecycleApi;
}

const PROJECT_SIGNAL_OPTIONS: readonly {
  readonly label: string;
  readonly value: ProjectSignal;
}[] = [
  { label: 'Clear deliverable', value: 'deliverable' },
  { label: 'Needs 2+ work blocks', value: 'multi_block' },
  { label: 'Crosses contexts', value: 'context_switch' },
  { label: 'Likely to branch', value: 'branching' },
] as const;

const ACTION_ROLE_LABELS: Record<ExecutionActionRole, string> = {
  backlog: 'Later list',
  candidate: 'Candidate action',
  current: 'Current next action',
};

function getExecutionParentId(activeTask: V2Entity | null): string | undefined {
  if (!activeTask) {
    return undefined;
  }

  if (activeTask.hierarchyLayer === 'project') {
    return activeTask.id;
  }

  if (activeTask.hierarchyLayer === 'task') {
    return activeTask.parentId;
  }

  return undefined;
}

interface ExecutionPlanCreateFormProps {
  readonly draftInput?: ExecutionPlanDraft | null;
  readonly onCreated: (entity: V2Entity) => void;
  readonly parentId?: string;
}

interface ExecutionPlanDraft {
  readonly clarification: string;
  readonly draftId: string;
  readonly kind: ExecutionPlanEntityKind;
  readonly title: string;
}

function ExecutionPlanCreateForm({
  draftInput,
  onCreated,
  parentId,
}: ExecutionPlanCreateFormProps) {
  const [clarification, setClarification] = useState('');
  const [estimatedMinutes, setEstimatedMinutes] = useState('25');
  const [kind, setKind] = useState<ExecutionPlanEntityKind>('task');
  const [projectSignals, setProjectSignals] = useState<readonly ProjectSignal[]>([]);
  const [role, setRole] = useState<ExecutionActionRole>('candidate');
  const [status, setStatus] = useState(
    'Create a clarified work item when the next action is clear.',
  );
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (!draftInput) {
      return;
    }

    setKind(draftInput.kind);
    setTitle(draftInput.title);
    setClarification(draftInput.clarification);
    setStatus(`Review the ${draftInput.kind} draft from Ritual before creating it.`);
  }, [draftInput]);

  function toggleSignal(signal: ProjectSignal) {
    setProjectSignals((current) =>
      current.includes(signal)
        ? current.filter((currentSignal) => currentSignal !== signal)
        : [...current, signal],
    );
  }

  function submitPlanItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const entity = createExecutionPlanEntity({
        clarification,
        estimatedMinutes: Number(estimatedMinutes),
        kind,
        parentId,
        projectSignals,
        role,
        title,
      });
      setStatus(
        `${kind === 'project' ? 'Project' : 'Task'} created${
          kind === 'task' ? ` as ${ACTION_ROLE_LABELS[role].toLowerCase()}` : ''
        }.`,
      );
      setTitle('');
      setClarification('');
      setProjectSignals([]);
      onCreated(entity);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to create work item.');
    }
  }

  return (
    <section className="rounded-md border border-stone-200 bg-white p-5">
      <p className="font-medium text-sky-700 text-sm">Create in Execution Plan</p>
      <h2 className="mt-2 font-semibold text-2xl text-stone-950">Clarify before adding work</h2>
      <form className="mt-5 grid gap-4" noValidate onSubmit={submitPlanItem}>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_14rem]">
          <label className="block font-medium text-sm text-stone-800" htmlFor="plan-item-title">
            Title
            <input
              className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-sky-700"
              id="plan-item-title"
              onChange={(event) => setTitle(event.target.value)}
              value={title}
            />
          </label>

          <label className="block font-medium text-sm text-stone-800" htmlFor="plan-item-kind">
            Type
            <select
              className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-sky-700"
              id="plan-item-kind"
              onChange={(event) => setKind(event.target.value as ExecutionPlanEntityKind)}
              value={kind}
            >
              <option value="task">Task</option>
              <option value="project">Project</option>
            </select>
          </label>
        </div>

        <label className="block font-medium text-sm text-stone-800" htmlFor="plan-item-clarify">
          Clarification
          <textarea
            className="mt-2 min-h-24 w-full resize-y rounded-md border border-stone-300 bg-white p-3 font-normal text-sm text-stone-900 outline-none focus:border-sky-700"
            id="plan-item-clarify"
            onChange={(event) => setClarification(event.target.value)}
            value={clarification}
          />
        </label>

        <fieldset className="grid gap-2">
          <legend className="font-medium text-sm text-stone-800">Project signals</legend>
          <div className="grid gap-2 md:grid-cols-2">
            {PROJECT_SIGNAL_OPTIONS.map((option) => (
              <label className="flex items-center gap-2 text-sm text-stone-700" key={option.value}>
                <input
                  checked={projectSignals.includes(option.value)}
                  className="h-4 w-4 rounded border-stone-300 text-sky-700"
                  onChange={() => toggleSignal(option.value)}
                  type="checkbox"
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>

        {kind === 'task' ? (
          <div className="grid gap-4 md:grid-cols-2">
            <label
              className="block font-medium text-sm text-stone-800"
              htmlFor="plan-estimated-minutes"
            >
              Estimated minutes
              <input
                className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-sky-700"
                id="plan-estimated-minutes"
                max={120}
                min={5}
                onChange={(event) => setEstimatedMinutes(event.target.value)}
                type="number"
                value={estimatedMinutes}
              />
            </label>

            <label className="block font-medium text-sm text-stone-800" htmlFor="plan-action-role">
              Planning role
              <select
                className="mt-2 w-full rounded-md border border-stone-300 bg-white px-3 py-2 font-normal text-sm text-stone-900 outline-none focus:border-sky-700"
                id="plan-action-role"
                onChange={(event) => setRole(event.target.value as ExecutionActionRole)}
                value={role}
              >
                <option value="current">Current next action</option>
                <option value="candidate">Candidate action</option>
                <option value="backlog">Later list</option>
              </select>
            </label>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <button
            className="inline-flex items-center gap-2 rounded-md bg-sky-700 px-4 py-2 font-medium text-sm text-white"
            type="submit"
          >
            <Save aria-hidden="true" size={16} />
            Create work item
          </button>
          <p className="text-sm text-stone-600" role="status">
            {status}
          </p>
        </div>
      </form>
    </section>
  );
}

interface ExecutionPlanQueueProps {
  readonly focusCandidateId: string | null;
  readonly onRoleChanged: (taskId: string | null) => void;
  readonly parentId?: string;
}

function ExecutionPlanQueue({
  focusCandidateId,
  onRoleChanged,
  parentId,
}: ExecutionPlanQueueProps) {
  const tasks = listExecutionPlanTasks(parentId);
  const [status, setStatus] = useState('Choose one current next action before Focus.');

  function updateRole(taskId: string, role: ExecutionActionRole) {
    try {
      const updated = setExecutionActionRole(taskId, role);
      setStatus(`${updated.title} moved to ${ACTION_ROLE_LABELS[role].toLowerCase()}.`);
      onRoleChanged(role === 'current' ? taskId : readFocusCandidateId());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : 'Unable to update action role.');
    }
  }

  return (
    <section className="rounded-md border border-stone-200 bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-medium text-sky-700 text-sm">Plan queue</p>
          <h2 className="mt-2 font-semibold text-2xl text-stone-950">
            One current action, three candidates
          </h2>
        </div>
        <p className="rounded-md bg-stone-50 px-3 py-2 text-sm text-stone-700" role="status">
          {status}
        </p>
      </div>

      <div className="mt-5 grid gap-3">
        {tasks.map((task) => {
          const role = (task.properties.executionRole ?? 'backlog') as ExecutionActionRole;

          return (
            <article className="rounded-md border border-stone-200 p-4" key={task.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-2xl">
                  <p className="font-medium text-stone-950">{task.title}</p>
                  {task.content ? (
                    <p className="mt-1 text-sm text-stone-600">{task.content}</p>
                  ) : null}
                  <p className="mt-2 text-xs text-stone-500">
                    {ACTION_ROLE_LABELS[role] ?? ACTION_ROLE_LABELS.backlog}
                    {focusCandidateId === task.id ? ' · selected for Focus' : ''}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button
                    className="rounded-md bg-stone-950 px-3 py-2 font-medium text-sm text-white"
                    onClick={() => updateRole(task.id, 'current')}
                    type="button"
                  >
                    Set focus candidate
                  </button>
                  <button
                    className="rounded-md border border-stone-300 px-3 py-2 font-medium text-sm text-stone-800"
                    onClick={() => updateRole(task.id, 'candidate')}
                    type="button"
                  >
                    Mark candidate
                  </button>
                  <button
                    className="rounded-md border border-stone-300 px-3 py-2 font-medium text-sm text-stone-800"
                    onClick={() => updateRole(task.id, 'backlog')}
                    type="button"
                  >
                    Move later
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {tasks.length === 0 ? (
          <p className="rounded-md bg-stone-50 p-4 text-sm text-stone-600">
            No planned actions for this project yet. Create a clarified task, draft from Ritual
            input, or return to Overview before choosing one current next action.
          </p>
        ) : null}
      </div>
    </section>
  );
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
        <TaskActions onExitFocus={onReturnToPlan} task={task} />
      </div>
    </div>
  );
}

function getFollowUpLabel(target: string): string {
  return target === 'project' ? 'Project input' : 'Task input';
}

interface RitualFollowUpInputsPanelProps {
  readonly onDraftInput: (draft: ExecutionPlanDraft) => void;
}

function createRitualDraft(reflection: V2Entity, target: RitualFollowUpTarget): ExecutionPlanDraft {
  const normalizedContent = (reflection.content ?? reflection.title).trim();
  const title =
    target === 'project'
      ? `Follow up on ${reflection.title.toLowerCase()}`
      : normalizedContent.slice(0, 64) || `Follow up on ${reflection.title.toLowerCase()}`;

  return {
    clarification: normalizedContent,
    draftId: `${reflection.id}:${target}:${Date.now()}`,
    kind: target,
    title,
  };
}

function hasCaptureChannel(capture: ContextCaptureRecord, channel: ContextCaptureChannel): boolean {
  return capture.channels.includes(channel);
}

function createCaptureDraft(
  capture: ContextCaptureRecord,
  target: 'project' | 'task',
): ExecutionPlanDraft {
  return {
    clarification: capture.content,
    draftId: `${capture.id}:${target}`,
    kind: target,
    title:
      target === 'project'
        ? 'Follow up on captured context'
        : capture.content.slice(0, 64) || 'Follow up on captured context',
  };
}

function CapturedContextInputsPanel({ onDraftInput }: RitualFollowUpInputsPanelProps) {
  const captures = listContextCapturePlanningInputs();

  if (captures.length === 0) {
    return null;
  }

  return (
    <section
      aria-label="Captured context inputs"
      className="mb-4 rounded-md border border-emerald-200 bg-emerald-50 p-5"
    >
      <p className="font-medium text-emerald-800 text-sm">Captured context</p>
      <h2 className="mt-2 font-semibold text-xl text-stone-950">
        Inputs routed from the context bus
      </h2>
      <div className="mt-4 grid gap-3">
        {captures.map((capture) => (
          <article className="rounded-md bg-white p-4" key={capture.id}>
            <p className="font-medium text-stone-950 text-sm">{capture.content}</p>
            <p className="mt-2 text-sm text-stone-600">{capture.channels.join(', ')}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {hasCaptureChannel(capture, 'task') ? (
                <button
                  className="rounded-md border border-emerald-300 px-3 py-2 font-medium text-emerald-900 text-sm"
                  onClick={() => onDraftInput(createCaptureDraft(capture, 'task'))}
                  type="button"
                >
                  Draft task from capture
                </button>
              ) : null}
              {hasCaptureChannel(capture, 'project') ? (
                <button
                  className="rounded-md border border-emerald-300 px-3 py-2 font-medium text-emerald-900 text-sm"
                  onClick={() => onDraftInput(createCaptureDraft(capture, 'project'))}
                  type="button"
                >
                  Draft project from capture
                </button>
              ) : null}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function RitualFollowUpInputsPanel({ onDraftInput }: RitualFollowUpInputsPanelProps) {
  const followUpInputs = listRitualFollowUpInputs();

  if (followUpInputs.length === 0) {
    return (
      <section
        aria-label="Ritual follow-up inputs"
        className="mb-4 rounded-md border border-dashed border-amber-200 bg-amber-50 p-5"
      >
        <p className="font-medium text-amber-800 text-sm">Ritual inputs</p>
        <h2 className="mt-2 font-semibold text-xl text-stone-950">
          No Ritual inputs waiting for planning
        </h2>
        <p className="mt-2 max-w-2xl text-sm text-stone-700">
          Reflection and dedication notes marked for task or project follow-up will appear here as
          drafts. Nothing is created until you review and submit it.
        </p>
      </section>
    );
  }

  return (
    <section
      aria-label="Ritual follow-up inputs"
      className="mb-4 rounded-md border border-amber-200 bg-amber-50 p-5"
    >
      <p className="font-medium text-amber-800 text-sm">Ritual inputs</p>
      <h2 className="mt-2 font-semibold text-xl text-stone-950">
        Marked context for later planning
      </h2>
      <div className="mt-4 grid gap-3">
        {followUpInputs.map((reflection) => {
          const targets = getRitualFollowUpTargets(reflection);

          return (
            <article className="rounded-md bg-white p-4" key={reflection.id}>
              <p className="font-medium text-stone-950 text-sm">{reflection.title}</p>
              <p className="text-sm text-stone-700">{reflection.content}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {targets.map((target) => (
                  <span
                    className="rounded-md bg-amber-100 px-2 py-1 font-medium text-amber-900 text-xs"
                    key={target}
                  >
                    {getFollowUpLabel(target)}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {targets.map((target) => (
                  <button
                    className="rounded-md border border-amber-300 px-3 py-2 font-medium text-amber-900 text-sm"
                    key={target}
                    onClick={() => onDraftInput(createRitualDraft(reflection, target))}
                    type="button"
                  >
                    Draft {target} from Ritual input
                  </button>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

interface ActiveTaskPlanProps {
  readonly onEnterFocus: () => void;
  readonly runtime: PersistedTaskRuntime | null;
  readonly task: TaskLifecycleApi;
  readonly taskEntity: V2Entity;
}

function RecoveryCue({
  onEnterFocus,
  runtime,
  taskTitle,
}: {
  readonly onEnterFocus: () => void;
  readonly runtime: PersistedTaskRuntime;
  readonly taskTitle: string;
}) {
  const cue =
    runtime.state === 'reviewing'
      ? 'Review is ready to finish.'
      : runtime.state === 'paused'
        ? 'Paused focus is ready to resume.'
        : 'Focus state is ready to continue.';

  return (
    <section
      aria-label="Interruption recovery cue"
      className="rounded-md border border-emerald-200 bg-emerald-50 p-4 text-emerald-950"
    >
      <p className="font-medium text-sm">Resume cue</p>
      <h3 className="mt-2 font-semibold text-xl">{cue}</h3>
      <p className="mt-2 text-sm">
        {taskTitle} has {runtime.actualMinutes} saved minute
        {runtime.actualMinutes === 1 ? '' : 's'} in {runtime.state}. Continue in Focus or keep this
        plan view open.
      </p>
      <button
        className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-700 px-4 py-2 font-medium text-sm text-white hover:bg-emerald-800"
        onClick={onEnterFocus}
        type="button"
      >
        Continue in Focus
        <ArrowRight aria-hidden="true" size={16} />
      </button>
    </section>
  );
}

function ActiveTaskPlan({ onEnterFocus, runtime, task, taskEntity }: ActiveTaskPlanProps) {
  return (
    <div className="grid gap-4">
      {runtime ? (
        <RecoveryCue onEnterFocus={onEnterFocus} runtime={runtime} taskTitle={taskEntity.title} />
      ) : null}
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
  const persistedRuntime = readPersistedTaskRuntime(taskId);
  const task = useTaskLifecycle({
    estimatedMinutes: getEstimatedMinutes(taskId),
    onDone,
    taskId,
    title: getTaskTitle(taskId),
  });

  if (mode === 'plan') {
    return (
      <ActiveTaskPlan
        onEnterFocus={onEnterFocus}
        runtime={persistedRuntime}
        task={task}
        taskEntity={taskEntity}
      />
    );
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
  const [focusCandidateId, setFocusCandidateId] = useState(
    () => readFocusCandidateId() ?? readCurrentPersistedTaskRuntime()?.taskId ?? null,
  );
  const [ritualDraftInput, setRitualDraftInput] = useState<ExecutionPlanDraft | null>(null);
  const [planRevision, setPlanRevision] = useState(0);
  const activeTaskId = focusCandidateId ?? dailyFlow.activeTaskId;
  const activeTask = activeTaskId ? findHierarchyEntity(activeTaskId) : null;
  const hasActiveFocusTarget = hasExecutionFocusTarget(activeTaskId) && Boolean(activeTask);
  const executionParentId = getExecutionParentId(activeTask);
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

  function refreshPlan(nextFocusCandidateId = readFocusCandidateId()) {
    setFocusCandidateId(nextFocusCandidateId);
    setPlanRevision((current) => current + 1);
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

      {mode === 'plan' ? (
        <>
          <CapturedContextInputsPanel onDraftInput={setRitualDraftInput} />
          <RitualFollowUpInputsPanel onDraftInput={setRitualDraftInput} />
        </>
      ) : null}

      {mode === 'plan' ? (
        <div className="mb-4 grid gap-4">
          <ExecutionPlanCreateForm
            draftInput={ritualDraftInput}
            onCreated={() => refreshPlan()}
            parentId={executionParentId}
          />
          <ExecutionPlanQueue
            focusCandidateId={focusCandidateId}
            key={planRevision}
            onRoleChanged={refreshPlan}
            parentId={executionParentId}
          />
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
