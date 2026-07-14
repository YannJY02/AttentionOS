import { assign, setup } from 'xstate';

// ── Context ───────────────────────────────────────────────────────────────────

interface TaskLifecycleContext {
  taskId: string;
  title: string;
  estimatedMinutes: number;
  actualMinutes: number;
  startedAt: string | null;
}

// ── Events ────────────────────────────────────────────────────────────────────

type TaskLifecycleEvent =
  | { type: 'START_EXECUTION' }
  | { type: 'SUBMIT_FOR_REVIEW' }
  | { type: 'COMPLETE' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'CANCEL' }
  | { type: 'TICK'; minutes: number };

// ── Input ─────────────────────────────────────────────────────────────────────

interface TaskLifecycleInput {
  taskId: string;
  title: string;
  estimatedMinutes?: number;
}

// ── Machine ───────────────────────────────────────────────────────────────────

export const taskLifecycleMachine = setup({
  types: {
    context: {} as TaskLifecycleContext,
    events: {} as TaskLifecycleEvent,
    input: {} as TaskLifecycleInput,
  },
  actions: {
    setStartedAt: assign({ startedAt: () => new Date().toISOString() }),
    addMinutes: assign({
      actualMinutes: ({ context, event }) =>
        event.type === 'TICK' ? context.actualMinutes + event.minutes : context.actualMinutes,
    }),
  },
}).createMachine({
  id: 'task-lifecycle',
  initial: 'planning',
  context: ({ input }) => ({
    taskId: input.taskId,
    title: input.title,
    estimatedMinutes: input.estimatedMinutes ?? 30,
    actualMinutes: 0,
    startedAt: null,
  }),
  states: {
    planning: {
      on: {
        START_EXECUTION: 'executing',
        CANCEL: 'cancelled',
      },
    },
    executing: {
      entry: 'setStartedAt',
      on: {
        SUBMIT_FOR_REVIEW: 'reviewing',
        PAUSE: 'paused',
        CANCEL: 'cancelled',
        TICK: { actions: 'addMinutes' },
      },
    },
    reviewing: {
      on: {
        COMPLETE: 'done',
        PAUSE: 'paused',
        CANCEL: 'cancelled',
      },
    },
    paused: {
      on: {
        RESUME: 'executing',
        CANCEL: 'cancelled',
      },
    },
    done: {
      type: 'final',
    },
    cancelled: {
      type: 'final',
    },
  },
});
