import { assign, setup } from 'xstate';
import type { HierarchyLayer } from './types';

// ── Context ───────────────────────────────────────────────────────────────────

interface HierarchyNavContext {
  /** 当前选中的实体 ID */
  selectedEntityId: string | null;
  /** 导航面包屑（从根到当前层的 entity ID 数组） */
  breadcrumb: string[];
}

// ── Events ────────────────────────────────────────────────────────────────────

type HierarchyNavEvent =
  | { type: 'DRILL_DOWN'; entityId: string }
  | { type: 'DRILL_UP' }
  | { type: 'NAVIGATE_TO'; layer: HierarchyLayer };

// ── Machine ───────────────────────────────────────────────────────────────────

export const hierarchyNavMachine = setup({
  types: {
    context: {} as HierarchyNavContext,
    events: {} as HierarchyNavEvent,
  },
  actions: {
    pushBreadcrumb: assign({
      selectedEntityId: ({ event }) => (event.type === 'DRILL_DOWN' ? event.entityId : null),
      breadcrumb: ({ context, event }) =>
        event.type === 'DRILL_DOWN' ? [...context.breadcrumb, event.entityId] : context.breadcrumb,
    }),
    popBreadcrumb: assign({
      selectedEntityId: ({ context }) => context.breadcrumb[context.breadcrumb.length - 2] ?? null,
      breadcrumb: ({ context }) => context.breadcrumb.slice(0, -1),
    }),
    resetToRoot: assign({ selectedEntityId: null, breadcrumb: [] }),
  },
}).createMachine({
  id: 'hierarchy-nav',
  initial: 'vision',
  context: {
    selectedEntityId: null,
    breadcrumb: [],
  },
  on: {
    NAVIGATE_TO: [
      { target: '.vision', guard: ({ event }) => event.layer === 'vision', actions: 'resetToRoot' },
      { target: '.area', guard: ({ event }) => event.layer === 'area' },
      { target: '.goal', guard: ({ event }) => event.layer === 'goal' },
      { target: '.project', guard: ({ event }) => event.layer === 'project' },
      { target: '.task', guard: ({ event }) => event.layer === 'task' },
    ],
  },
  states: {
    vision: {
      on: {
        DRILL_DOWN: { target: 'area', actions: 'pushBreadcrumb' },
      },
    },
    area: {
      on: {
        DRILL_DOWN: { target: 'goal', actions: 'pushBreadcrumb' },
        DRILL_UP: { target: 'vision', actions: 'popBreadcrumb' },
      },
    },
    goal: {
      on: {
        DRILL_DOWN: { target: 'project', actions: 'pushBreadcrumb' },
        DRILL_UP: { target: 'area', actions: 'popBreadcrumb' },
      },
    },
    project: {
      on: {
        DRILL_DOWN: { target: 'task', actions: 'pushBreadcrumb' },
        DRILL_UP: { target: 'goal', actions: 'popBreadcrumb' },
      },
    },
    task: {
      on: {
        DRILL_UP: { target: 'project', actions: 'popBreadcrumb' },
      },
    },
  },
});
