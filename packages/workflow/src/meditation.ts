import { assign, setup } from 'xstate';

// ── Context ───────────────────────────────────────────────────────────────────

interface MeditationContext {
  durationMs: number;
  elapsedMs: number;
  startedAt: string | null;
}

// ── Events ────────────────────────────────────────────────────────────────────

type MeditationEvent =
  | { type: 'START' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'COMPLETE' }
  | { type: 'TICK'; deltaMs: number };

// ── Input ─────────────────────────────────────────────────────────────────────

interface MeditationInput {
  durationMs: number;
}

// ── Machine ───────────────────────────────────────────────────────────────────

export const meditationMachine = setup({
  types: {
    context: {} as MeditationContext,
    events: {} as MeditationEvent,
    input: {} as MeditationInput,
  },
  actions: {
    setStartedAt: assign({ startedAt: () => new Date().toISOString() }),
    addElapsed: assign({
      elapsedMs: ({ context, event }) =>
        event.type === 'TICK'
          ? Math.min(context.durationMs, context.elapsedMs + event.deltaMs)
          : context.elapsedMs,
    }),
  },
  guards: {
    reachesDuration: ({ context, event }) =>
      event.type === 'TICK' && context.elapsedMs + event.deltaMs >= context.durationMs,
  },
}).createMachine({
  id: 'meditation',
  initial: 'idle',
  context: ({ input }) => ({
    durationMs: input.durationMs,
    elapsedMs: 0,
    startedAt: null,
  }),
  states: {
    idle: {
      on: { START: 'meditating' },
    },
    meditating: {
      entry: 'setStartedAt',
      on: {
        PAUSE: 'paused',
        COMPLETE: 'completed',
        TICK: [
          {
            actions: 'addElapsed',
            guard: 'reachesDuration',
            target: 'completed',
          },
          {
            actions: 'addElapsed',
          },
        ],
      },
    },
    paused: {
      on: {
        RESUME: 'meditating',
        COMPLETE: 'completed',
        // TICK is intentionally not handled in paused — time does not accumulate
      },
    },
    completed: {
      type: 'final',
    },
  },
});
