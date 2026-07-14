import { taskLifecycleMachine } from '@attentionos/workflow';
import { useMachine } from '@xstate/react';
import { useEffect, useRef } from 'react';
import { logTaskLifecycleTransition } from '../adapters/storage/audit';
import {
  clearPersistedTaskRuntime,
  readPersistedTaskRuntime,
  savePersistedTaskRuntime,
} from '../adapters/storage/taskRuntime';

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
  const restoredTaskIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (restoredTaskIdRef.current === taskId) {
      return;
    }

    restoredTaskIdRef.current = taskId;
    const persisted = readPersistedTaskRuntime(taskId);

    if (!persisted || persisted.state === 'planning') {
      return;
    }

    if (persisted.state === 'done' || persisted.state === 'cancelled') {
      clearPersistedTaskRuntime(taskId);
      return;
    }

    send({ type: 'START_EXECUTION' });

    if (persisted.actualMinutes > 0) {
      send({ type: 'TICK', minutes: persisted.actualMinutes });
    }

    if (persisted.state === 'paused') {
      send({ type: 'PAUSE' });
    }

    if (persisted.state === 'reviewing') {
      send({ type: 'SUBMIT_FOR_REVIEW' });
    }
  }, [send, taskId]);

  function sendLifecycleEvent(event: TaskLifecycleEvent) {
    const nextState = nextStateByEvent[state][event];

    if (!nextState) {
      return;
    }

    send({ type: event });
    logTaskLifecycleTransition({ event, from: state, targetId: taskId, to: nextState });

    if (nextState === 'done' || nextState === 'cancelled') {
      clearPersistedTaskRuntime(taskId);
    } else {
      savePersistedTaskRuntime({
        actualMinutes: snapshot.context.actualMinutes,
        state: nextState,
        taskId,
      });
    }

    if (nextState === 'done') {
      onDone?.();
    }
  }

  function tickFiveMinutes() {
    if (state !== 'executing') {
      return;
    }

    const nextActualMinutes = snapshot.context.actualMinutes + 5;
    send({ type: 'TICK', minutes: 5 });
    savePersistedTaskRuntime({
      actualMinutes: nextActualMinutes,
      state,
      taskId,
    });
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
