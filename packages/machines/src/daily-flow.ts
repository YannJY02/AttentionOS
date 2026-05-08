import { assign, setup } from 'xstate';

// ── Context ───────────────────────────────────────────────────────────────────

interface DailyFlowContext {
  /** 最近一次 reflection 内容 — 阶段元数据，不包含任务详情 */
  reflectionText: string;
  /** 当前正在执行的任务 ID（仅 ID，无任务对象，防止循环依赖） */
  activeTaskId: string | null;
  /** 当前阶段开始时间 */
  stageStartedAt: string | null;
}

// ── Events ────────────────────────────────────────────────────────────────────

type DailyFlowEvent =
  | { type: 'MEDITATION_COMPLETE' }
  | { type: 'REFLECTION_SAVED'; text: string }
  | { type: 'RITUAL_COMPLETE' }
  | { type: 'START_EXECUTION'; taskId: string }
  | { type: 'BACK_TO_OVERVIEW' }
  | { type: 'START_NEW_RITUAL' }
  | { type: 'RESTORE_STAGE'; stage: 'ritual' | 'overview' | 'execution' };

// ── Machine ───────────────────────────────────────────────────────────────────

export const dailyFlowMachine = setup({
  types: {
    context: {} as DailyFlowContext,
    events: {} as DailyFlowEvent,
  },
  actions: {
    saveReflection: assign({
      reflectionText: ({ event }) => (event.type === 'REFLECTION_SAVED' ? event.text : ''),
    }),
    setActiveTask: assign({
      activeTaskId: ({ event }) => (event.type === 'START_EXECUTION' ? event.taskId : null),
    }),
    clearActiveTask: assign({ activeTaskId: null }),
    markStageStart: assign({ stageStartedAt: () => new Date().toISOString() }),
  },
}).createMachine({
  id: 'daily-flow',
  initial: 'ritual',
  context: {
    reflectionText: '',
    activeTaskId: null,
    stageStartedAt: null,
  },
  on: {
    RESTORE_STAGE: [
      {
        target: '.ritual',
        guard: ({ event }) => event.stage === 'ritual',
        actions: ['clearActiveTask', 'markStageStart'],
      },
      {
        target: '.overview',
        guard: ({ event }) => event.stage === 'overview',
        actions: ['clearActiveTask', 'markStageStart'],
      },
      {
        target: '.execution',
        guard: ({ event }) => event.stage === 'execution',
        actions: 'markStageStart',
      },
    ],
  },
  states: {
    ritual: {
      initial: 'meditation',
      entry: 'markStageStart',
      states: {
        meditation: {
          on: {
            MEDITATION_COMPLETE: 'reflection',
          },
        },
        reflection: {
          on: {
            REFLECTION_SAVED: {
              target: 'dedication',
              actions: 'saveReflection',
            },
          },
        },
        dedication: {
          on: {
            RITUAL_COMPLETE: '#daily-flow.overview',
          },
        },
      },
    },
    overview: {
      entry: ['clearActiveTask', 'markStageStart'],
      on: {
        START_EXECUTION: {
          target: 'execution',
          actions: 'setActiveTask',
        },
        START_NEW_RITUAL: 'ritual',
      },
    },
    execution: {
      entry: 'markStageStart',
      on: {
        BACK_TO_OVERVIEW: 'overview',
        START_NEW_RITUAL: 'ritual',
      },
    },
  },
});
