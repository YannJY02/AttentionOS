import { assign, setup } from 'xstate';

export type ExecutionMode = 'plan' | 'focus';

interface ExecutionModeContext {
  activeTaskId: string | null;
}

type ExecutionModeEvent =
  | { type: 'REQUEST_PLAN' }
  | { type: 'REQUEST_FOCUS'; taskId?: string | null }
  | { type: 'RESTORE_MODE'; mode: ExecutionMode; taskId?: string | null }
  | { type: 'EXIT_FOCUS' }
  | { type: 'COMPLETE_FOCUS' };

export function hasExecutionFocusTarget(taskId: string | null | undefined): taskId is string {
  return typeof taskId === 'string' && taskId.trim().length > 0;
}

function focusTargetFromEvent(event: ExecutionModeEvent, context: ExecutionModeContext) {
  if (event.type === 'REQUEST_FOCUS' || event.type === 'RESTORE_MODE') {
    return event.taskId ?? context.activeTaskId;
  }

  return context.activeTaskId;
}

export const executionModeMachine = setup({
  types: {
    context: {} as ExecutionModeContext,
    events: {} as ExecutionModeEvent,
  },
  guards: {
    hasFocusTarget: ({ context, event }) =>
      hasExecutionFocusTarget(focusTargetFromEvent(event, context)),
    isRestoringPlan: ({ event }) => event.type === 'RESTORE_MODE' && event.mode === 'plan',
    isRestoringFocus: ({ event }) => event.type === 'RESTORE_MODE' && event.mode === 'focus',
    isRestoringFocusWithTarget: ({ context, event }) =>
      event.type === 'RESTORE_MODE' &&
      event.mode === 'focus' &&
      hasExecutionFocusTarget(focusTargetFromEvent(event, context)),
  },
  actions: {
    setFocusTarget: assign({
      activeTaskId: ({ context, event }) =>
        focusTargetFromEvent(event, context) ?? context.activeTaskId,
    }),
    clearFocusTarget: assign({
      activeTaskId: null,
    }),
  },
}).createMachine({
  id: 'executionMode',
  initial: 'plan',
  context: {
    activeTaskId: null,
  },
  states: {
    plan: {
      on: {
        REQUEST_FOCUS: {
          target: 'focus',
          guard: 'hasFocusTarget',
          actions: 'setFocusTarget',
        },
        RESTORE_MODE: [
          {
            target: 'focus',
            guard: 'isRestoringFocusWithTarget',
            actions: 'setFocusTarget',
          },
          {
            target: 'plan',
            guard: 'isRestoringPlan',
          },
        ],
      },
    },
    focus: {
      on: {
        REQUEST_PLAN: {
          target: 'plan',
        },
        REQUEST_FOCUS: {
          target: 'focus',
          guard: 'hasFocusTarget',
          actions: 'setFocusTarget',
        },
        RESTORE_MODE: [
          {
            target: 'focus',
            guard: 'isRestoringFocusWithTarget',
            actions: 'setFocusTarget',
          },
          {
            target: 'plan',
            guard: 'isRestoringPlan',
          },
        ],
        EXIT_FOCUS: {
          target: 'plan',
        },
        COMPLETE_FOCUS: {
          target: 'plan',
          actions: 'clearFocusTarget',
        },
      },
    },
  },
});
