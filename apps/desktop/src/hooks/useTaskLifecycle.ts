import { taskLifecycleMachine } from '@attentionos/machines';
import { useMachine } from '@xstate/react';
import { logTaskLifecycleTransition } from '../storage/audit';

type TaskLifecycleState = 'planning' | 'executing' | 'reviewing' | 'paused' | 'done' | 'cancelled';
type TaskLifecycleEvent =
  | 'START_EXECUTION'
  | 'SUBMIT_FOR_REVIEW'
  | 'COMPLETE'
  | 'PAUSE'
  | 'RESUME'
  | 'CANCEL';

interface UseTaskLifecycleOptions {
  readonly estimatedMinutes?: number;
  readonly onDone?: () => void;
  readonly taskId: string;
  readonly title: string;
}

export interface TaskLifecycleApi {
  readonly actualMinutes: number;
  readonly cancel: () => void;
  readonly complete: () => void;
  readonly estimatedMinutes: number;
  readonly pause: () => void;
  readonly resume: () => void;
  readonly start: () => void;
  readonly state: TaskLifecycleState;
  readonly submitForReview: () => void;
  readonly taskId: string;
  readonly tickFiveMinutes: () => void;
  readonly title: string;
}

const nextStateByEvent: Record<
  TaskLifecycleState,
  Partial<Record<TaskLifecycleEvent, TaskLifecycleState>>
> = {
  cancelled: {},
  done: {},
  executing: {
    CANCEL: 'cancelled',
    PAUSE: 'paused',
    SUBMIT_FOR_REVIEW: 'reviewing',
  },
  paused: {
    CANCEL: 'cancelled',
    RESUME: 'executing',
  },
  planning: {
    CANCEL: 'cancelled',
    START_EXECUTION: 'executing',
  },
  reviewing: {
    CANCEL: 'cancelled',
    COMPLETE: 'done',
    PAUSE: 'paused',
  },
};

export function useTaskLifecycle({
  estimatedMinutes = 30,
  onDone,
  taskId,
  title,
}: UseTaskLifecycleOptions): TaskLifecycleApi {
  const [snapshot, send] = useMachine(taskLifecycleMachine, {
    input: { estimatedMinutes, taskId, title },
  });
  const state = snapshot.value as TaskLifecycleState;

  function sendLifecycleEvent(event: TaskLifecycleEvent) {
    const nextState = nextStateByEvent[state][event];

    if (!nextState) {
      return;
    }

    send({ type: event });
    logTaskLifecycleTransition({ event, from: state, targetId: taskId, to: nextState });

    if (nextState === 'done') {
      onDone?.();
    }
  }

  function tickFiveMinutes() {
    if (state !== 'executing') {
      return;
    }

    send({ type: 'TICK', minutes: 5 });
  }

  return {
    actualMinutes: snapshot.context.actualMinutes,
    cancel: () => sendLifecycleEvent('CANCEL'),
    complete: () => sendLifecycleEvent('COMPLETE'),
    estimatedMinutes: snapshot.context.estimatedMinutes,
    pause: () => sendLifecycleEvent('PAUSE'),
    resume: () => sendLifecycleEvent('RESUME'),
    start: () => sendLifecycleEvent('START_EXECUTION'),
    state,
    submitForReview: () => sendLifecycleEvent('SUBMIT_FOR_REVIEW'),
    taskId: snapshot.context.taskId,
    tickFiveMinutes,
    title: snapshot.context.title,
  };
}
