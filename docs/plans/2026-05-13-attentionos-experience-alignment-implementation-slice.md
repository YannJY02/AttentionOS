---
status: implemented and qa-verified
date: 2026-05-13
scope: experience-alignment
owner: YannJY02
skill_gate: /gstack-autoplan
source_plan: docs/plans/2026-05-10-attentionos-experience-alignment-contract.md
---

# AttentionOS Experience Alignment Implementation Slice

## Autoplan Status

Phase 4 `/gstack-autoplan` is complete as a planning artifact. This slice turns
the accepted Phase 2 design decisions and Phase 3 engineering decisions into one
implementation unit.

This document was the implementation contract for the coding phase. The slice is
now implemented and QA-verified as of 2026-05-13.

## Premises

| Premise | Status | Reason |
|---|---|---|
| The three-stage workflow remains `ritual / overview / execution`. | Accepted | Preserved by product and workflow baselines. |
| `dailyFlowMachine` remains the top-level stage authority. | Accepted | Existing tests and route sync already depend on it. |
| `execution(plan)` and `execution(focus)` need stronger state boundaries than one page can express. | Accepted | Phase 2 D2 and Phase 3 E1 both require explicit Plan/Focus separation. |
| Mobile shell must stop rendering the desktop sidebar as a fixed column. | Accepted | Phase 0 screenshots showed an unusable 390px layout. |
| AI suggestions must stay human-reviewed and stage-bound. | Accepted | Phase 2/3 AI/HITL contracts already define this boundary. |
| Phase 4 protocol/SDK/MCP work is out of scope. | Accepted | This slice fixes product experience, not platform extension surfaces. |

No premise requires a user challenge before implementation.

## One-Slice Goal

Ship a coherent Execution experience slice:

1. Add a dedicated `executionModeMachine` for `plan / focus`.
2. Add `/execution/plan` and `/execution/focus` routes.
3. Replace mobile fixed sidebar behavior with bottom stage navigation.
4. Keep AI suggestion review in Execution Plan and out of Focus by default.
5. Preserve current task lifecycle and AI/HITL audit behavior.
6. Add the full contract test set before calling the slice done.

## Existing Code Leverage

| Sub-problem | Existing code | Autoplan decision |
|---|---|---|
| Top-level workflow stage | `packages/machines/src/daily-flow.ts` | Reuse. Do not add Plan/Focus substates here. |
| Task progress | `packages/machines/src/task-lifecycle.ts` and `apps/desktop/src/hooks/useTaskLifecycle.tsx` | Reuse. Keep planning/executing/reviewing/done separate from route mode. |
| Hierarchy context | `packages/machines/src/hierarchy-nav.ts` and desktop hierarchy hooks/storage | Reuse. Surface layer context in mobile headers. |
| App routes | `apps/desktop/src/App.tsx` | Extend with `/execution/plan` and `/execution/focus`. |
| Stage shell | `apps/desktop/src/components/layout/Shell.tsx` | Refactor for responsive desktop/sidebar and mobile bottom nav. |
| Route/stage sync | `apps/desktop/src/hooks/useRouteSync.ts` | Extend or replace carefully to understand nested Execution routes. |
| Execution UI | `apps/desktop/src/pages/ExecutionPage.tsx` and `apps/desktop/src/pages/execution/*` | Split Plan/Focus presentation while reusing child components. |
| AI suggestion HITL | `apps/desktop/src/pages/execution/AiDecompositionPanel.tsx`, `EvolutionSuggestionsPanel.tsx`, storage/audit tests | Keep in Plan by default; preserve approval/rejection audit behavior. |

## Architecture Diagram

```text
Browser URL
  |
  | /ritual, /overview, /execution/plan, /execution/focus
  v
React Router (App.tsx)
  |
  +--> Shell
  |     +--> desktop: sidebar stage nav
  |     +--> mobile: bottom stage nav
  |
  +--> useRouteSync
        |
        +--> dailyFlowMachine
        |     states: ritual | overview | execution
        |
        +--> executionModeMachine
              states: plan | focus
              guard: focus requires active focus target
              rejected focus route -> /execution/plan

Execution Plan
  +--> candidate selection
  +--> AI decomposition review
  +--> workflow optimization review
  +--> enter focus

Execution Focus
  +--> one active action
  +--> task detail/timer/actions
  +--> complete or return
  +--> no full AI suggestion queue by default
```

## Implementation Steps

### Step 1: Add Execution Mode Machine

Files:

- Add `packages/machines/src/execution-mode.ts`.
- Update `packages/machines/src/index.ts`.
- Add `packages/machines/__tests__/execution-mode.test.ts`.

Contract:

- Initial state: `plan`.
- Events should cover requesting Plan, requesting Focus, restoring mode, exiting
  Focus, and completing Focus.
- Focus transition must be guarded by an explicit active focus target or active
  task.
- The machine must not encode task lifecycle states such as executing,
  reviewing, done, paused, or cancelled.

### Step 2: Add Execution Routes And Sync

Files:

- Update `apps/desktop/src/App.tsx`.
- Update `apps/desktop/src/hooks/useRouteSync.ts`.
- Add or update `apps/desktop/src/hooks/useRouteSync.test.tsx`.

Contract:

- `/execution` redirects to `/execution/plan`.
- `/execution/plan` restores `dailyFlowMachine` to `execution` and
  `executionModeMachine` to `plan`.
- `/execution/focus` requests Focus mode.
- Invalid Focus request redirects once to `/execution/plan` and shows user-facing
  guidance.
- Route sync must not loop when URL and machine state disagree.

### Step 3: Split Execution Plan And Focus UI

Files:

- Refactor `apps/desktop/src/pages/ExecutionPage.tsx`.
- Add route-mode components under `apps/desktop/src/pages/execution/` if needed.
- Update `apps/desktop/src/pages/ExecutionPage.test.tsx`.

Contract:

- Execution Plan owns AI decomposition, workflow optimization review, task
  narrowing, and focus candidate selection.
- Execution Focus owns one active action, task detail, timer/actions, completion
  condition, and return paths.
- Focus must not render `AiDecompositionPanel` or `EvolutionSuggestionsPanel` by
  default.
- Current task lifecycle behavior and audit entries must remain intact.

### Step 4: Fix Responsive Shell

Files:

- Update `apps/desktop/src/components/layout/Shell.tsx`.
- Update `apps/desktop/src/App.test.tsx` or add a shell-specific test.
- Add/update Playwright coverage under `e2e/`.

Contract:

- Desktop may keep the sidebar.
- Mobile uses bottom stage navigation with Ritual, Overview, Execution.
- The desktop sidebar must not occupy a fixed 280px column at mobile width.
- Stage content must remain readable at 390px.
- Touch targets must stay at least 44px where practical.

### Step 5: Preserve AI/HITL And Add Full Test Gate

Files:

- Update `apps/desktop/src/pages/ExecutionPage.test.tsx`.
- Update `e2e/smoke.spec.ts`.
- Add a mobile/responsive Playwright test if existing smoke coverage cannot
  assert the 390px shell behavior.
- Keep AI suggestion storage/audit tests passing.

Contract:

- Existing AI suggestion approval/rejection tests remain green.
- Plan mode shows reviewable AI suggestion controls.
- Focus mode hides the full AI suggestion queue by default.
- No implementation terms such as "state machine" should appear as primary
  user-facing copy.

## Test Diagram

```text
CODE PATHS                                      REQUIRED TESTS

packages/machines/src/execution-mode.ts
  create machine
    [NEW] initial plan                         unit: starts in plan
    [NEW] REQUEST_FOCUS with target            unit: enters focus
    [NEW] REQUEST_FOCUS without target         unit: remains/returns plan
    [NEW] RESTORE_MODE focus valid             unit: restores focus
    [NEW] RESTORE_MODE focus invalid           unit: rejects focus
    [NEW] EXIT_FOCUS / COMPLETE_FOCUS          unit: returns plan or done path

apps/desktop/src/App.tsx
  /execution redirect                          RTL: redirects to /execution/plan
  /execution/plan route                        RTL: renders Plan mode
  /execution/focus route                       RTL: renders Focus only when valid

apps/desktop/src/hooks/useRouteSync.ts
  top-level execution restore                  RTL: /execution/plan and /focus set stage
  invalid focus route                          RTL: safe redirect, no loop

apps/desktop/src/pages/ExecutionPage.tsx
  Plan mode                                    RTL: AI review controls visible
  Focus mode                                   RTL: one action, AI queue hidden
  task lifecycle                               RTL: existing planning -> done flow passes

apps/desktop/src/components/layout/Shell.tsx
  desktop nav                                  RTL: canonical links remain
  mobile nav                                   E2E: 390px bottom nav, no squeezed content

USER FLOWS

Overview task -> Execution Plan -> Focus       E2E or RTL integration
Direct /execution/focus without task           RTL or E2E invalid redirect
AI suggestion approve/reject in Plan           existing RTL tests remain and route-aware
Mobile Overview/Execution scan                 Playwright viewport 390px
```

## Required Commands

Run at minimum:

```bash
pnpm docs:check
pnpm test:run -- packages/machines/__tests__/execution-mode.test.ts apps/desktop/src/App.test.tsx apps/desktop/src/hooks/useRouteSync.test.tsx apps/desktop/src/pages/ExecutionPage.test.tsx
pnpm e2e
git diff --check
```

Before merge readiness, run:

```bash
pnpm check
pnpm test:run
pnpm lint
pnpm build
pnpm e2e
```

## Failure Modes Registry

| Failure mode | Required protection | Critical |
|---|---|---|
| Direct `/execution/focus` without a valid target enters Focus anyway. | Machine guard plus invalid-route redirect test. | Yes |
| URL and machine state bounce forever. | One-way redirect rule and route sync test. | Yes |
| Focus renders the full AI suggestion queue. | Focus RTL test that rejects AI queue by default. | Yes |
| Mobile shell keeps fixed sidebar and squeezes content. | 390px Playwright check. | Yes |
| Task lifecycle gets duplicated inside `executionModeMachine`. | Machine shape review and unit tests proving mode-only states. | Medium |
| Existing AI/HITL audit assertions regress. | Existing approval/rejection tests remain required. | Yes |
| `/execution` old links break without redirect. | Route test for `/execution` -> `/execution/plan`. | Medium |

## Decision Audit Trail

| Decision | Type | Autoplan result | Reason |
|---|---|---|---|
| Implement as one complete slice | Auto-decided | Keep | Already accepted in E5; prevents route/UI/test half-step. |
| Add `executionModeMachine` | User-decided before autoplan | Keep | Accepted in E1 for clearer Plan/Focus rules. |
| Keep task lifecycle separate | User-decided before autoplan | Keep | Accepted in E3; avoids giant machine. |
| Mobile bottom stage nav | User-decided before autoplan | Keep | Accepted in D1; fixes known mobile layout failure. |
| Full contract test set | User-decided before autoplan | Keep | Accepted in E4; core workflow needs guard coverage. |
| Phase 4 protocol/SDK/MCP | Auto-decided | Defer | Outside this slice and explicitly out of scope. |
| Separate implementation PRs | Auto-decided | Reject | Would leave inconsistent intermediate product states. |

## Review Scores

| Review | Result |
|---|---|
| CEO / scope | Clean. The slice solves the right immediate problem: product experience alignment, not broad Phase 4 expansion. |
| Design | Clean. Phase 2 score improved from 7/10 to 9/10 after D1-D5. Remaining risk is post-implementation visual polish. |
| Engineering | Clean. Phase 3 accepted E1-E5 with no unresolved critical gaps. |
| DX | Skipped. This slice does not introduce a developer-facing API, SDK, CLI, plugin, or integration surface. |

## Cross-Phase Themes

- Stage authority must stay explicit: `dailyFlowMachine` owns stages,
  `executionModeMachine` owns Plan/Focus, and task lifecycle owns task progress.
- AI must stay helpful but subordinate: Plan can review AI suggestions; Focus
  protects one action by default.
- Mobile cannot be treated as a responsive afterthought because the current
  failure is already confirmed in screenshots.
- Tests are not optional polish; they are the only reliable guard against
  route/machine drift.

## Not In Scope

- Phase 4 protocol, SDK, MCP, plugin, offline sync, or provider work.
- Replacing `dailyFlowMachine`.
- Merging task lifecycle into `executionModeMachine`.
- Creating a root `DESIGN.md`.
- Full design-system tokenization unless duplication appears during
  implementation.

## Next Gate

`/gstack-qa-only` has been run against this document and the autoplan test plan
artifact. The remaining gate is branch closeout: review the diff, decide whether
to commit, and avoid expanding into Phase 4 protocol/SDK/MCP work in this slice.

## Implementation Closeout

Completed: 2026-05-13 07:49 CST

Implemented:

- `executionModeMachine` with guarded `plan / focus` transitions.
- `/execution` redirect, `/execution/plan`, and `/execution/focus` routes.
- Nested execution route sync that keeps `dailyFlowMachine` as top-level stage
  authority.
- Execution Plan and Execution Focus UI split.
- AI decomposition and workflow optimization controls in Plan mode only.
- Invalid Focus route redirect with user-facing guidance.
- Responsive shell with desktop sidebar and mobile bottom stage navigation.
- Active task lifecycle state preserved when switching between Execution Plan
  and Execution Focus.
- Contract tests for machine behavior, route sync, Plan/Focus UI boundaries,
  AI/HITL audit preservation, and 390px mobile shell behavior.

Verification:

- `pnpm --filter @attentionos/machines test -- --run packages/machines/__tests__/execution-mode.test.ts`
  passed with 62 package tests.
- `pnpm --filter @attentionos/desktop test -- --run apps/desktop/src/App.test.tsx apps/desktop/src/hooks/useRouteSync.test.tsx apps/desktop/src/pages/ExecutionPage.test.tsx apps/desktop/src/pages/OverviewPage.test.tsx`
  passed with 29 desktop tests.
- `pnpm e2e` passed with 3 Chromium tests after granting local dev-server
  permission.
- `/gstack-qa-only` report:
  `.gstack/qa-reports/qa-report-127-0-0-1-1420-2026-05-13.md`.
- Final full verification passed on 2026-05-13 08:09 CST:
  `pnpm docs:check`, `pnpm check`, `pnpm test:run`, `pnpm lint`,
  `pnpm build`, `pnpm e2e`, and `git diff --check`.
