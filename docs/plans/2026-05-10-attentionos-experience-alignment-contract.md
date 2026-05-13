<!-- /autoplan restore point: /Users/yann.jy/Desktop/AI/AttentionOS/.gstack/projects/YannJY02-AttentionOS/main-autoplan-restore-20260513-073752.md -->
---
status: phase-1 experience contract
date: 2026-05-10
scope: experience-alignment
owner: YannJY02
skill_gate: /gstack-design-consultation
---

# AttentionOS Experience Alignment Contract

## Contract Status

Phase 1 `/gstack-design-consultation` is complete as a planning artifact. This
contract translates the product and workflow baselines into stage-specific
experience requirements. It does not implement UI, create a root `DESIGN.md`, or
accept a final visual design system.

The next required gates are `/gstack-plan-design-review` and
`/gstack-plan-eng-review`.

Phase 2 `/gstack-plan-design-review` resumed on 2026-05-13 after the owner
accepted normal chat as the interaction gate fallback for `AskUserQuestion`.

## Product Experience Thesis

AttentionOS should feel like a personal attention operating system, not a task
database. The interface should continuously answer three questions:

1. Where is my attention right now?
2. Which layer of life/work am I judging?
3. What is the one appropriate next action for this stage?

The UI should reduce decision load. It should not expose implementation
milestones, internal state-machine language, or AI scaffolding as primary user
experience.

## Stage Contract: Ritual

### User State

The user is entering, closing, or resetting a work period. They may be mentally
scattered, emotionally loaded, or about to transition from life context into
planned work.

### Primary Question

"What do I need to remember, settle, and dedicate before I enter work?"

### Allowed Actions

- Read or acknowledge a user-configured prayer/intention.
- Configure or start meditation.
- Complete meditation or intentionally skip with traceable intent.
- Record reflection or dedication content.
- Mark reflection/dedication items that should become later task/project input.
- Move to Overview only after the ritual path has an intentional close.

### Forbidden Actions

- Editing project/task structures.
- AI decomposition.
- Broad dashboard scanning.
- Showing implementation terms such as "state machine" as user-facing copy.
- Starting the day directly in task controls unless the user explicitly bypasses
  ritual.

### Visual Semantics

- Quiet, low-density, single-focus surface.
- Strong sense of beginning or closing a period.
- Full attention on one ritual step at a time.
- Motion should be slow and minimal if used.
- Use warm accent sparingly for progression, not productivity pressure.

### Data Shown By Default

- Current ritual step.
- Prayer/intention content.
- Meditation state and duration.
- Reflection or dedication prompt.
- Next ritual action.

### Data Hidden By Default

- Project/task lists.
- AI suggestion queues.
- Learning/adoption metrics.
- Protocol, storage, or deterministic-core implementation language.

### AI Boundary

AI may suggest reflection prompts only if explicitly invoked later. It must not
auto-convert ritual content into tasks without approval.

### Acceptance Criteria

- Ritual begins with prayer/intention semantics, not only Meditation.
- The page no longer reads as an XState demo.
- A user can complete the ritual path and land in Overview.
- Mobile Ritual keeps one primary action visible without squeezed text.

## Stage Contract: Overview

### User State

The user has finished ritual or returned from execution and needs a clear,
non-editing scan of current context.

### Primary Question

"Where am I in the hierarchy, what is the current situation, and what should I
enter Execution to handle?"

### Allowed Actions

- Change the viewed hierarchy layer.
- Drill into or out of one hierarchy branch.
- Inspect read-only metrics, trends, risk signals, and current layer context.
- Bridge into `execution(plan)` while preserving current layer and filters.

### Forbidden Actions

- Creating entities.
- Editing entities.
- Decomposing tasks.
- Approving AI suggestions.
- Starting multiple tasks.
- Mixing multiple hierarchy layers into one undifferentiated surface.

### Visual Semantics

- Read-only command center, not a workspace.
- A strong layer identity should be visible before entity cards.
- The scan should make the current layer, trend, risk, and bridge action obvious.
- Information density may be higher than Ritual but must remain scannable.

### Data Shown By Default

- Current stage: Overview.
- Current hierarchy layer.
- Breadcrumb or timeline position.
- Layer-specific summary.
- Attention trend and completion signal if available.
- One bridge action into Execution.

### Data Hidden By Default

- Write forms.
- Long raw logs.
- AI decomposition controls.
- Deep protocol/storage details.

### AI Boundary

AI may appear only as read-only insight or pending suggestion status. Approval,
rejection, and decomposition belong in Execution unless a later accepted design
creates a specific read-only review summary.

### Acceptance Criteria

- Overview has no write path.
- A user can tell which layer they are judging.
- The screen explains "why this layer matters now" without verbose instructions.
- Desktop and mobile layouts keep scan content readable.

## Stage Contract: Execution Plan

### User State

The user is ready to turn a layer-level context into an actionable path but has
not yet committed to one focus action.

### Primary Question

"What is the next actionable unit, and what must be narrowed before I focus?"

### Allowed Actions

- Create, split, reorder, or clarify actions in the current layer.
- Use AI-assisted decomposition with explicit approval.
- Review pending workflow optimization suggestions.
- Select one focus candidate.
- Move into `execution(focus)`.

### Forbidden Actions

- Showing broad cross-layer dashboards as the main surface.
- Allowing AI suggestions to apply without approval.
- Presenting many parallel next actions as equally active.
- Expanding Phase 4 protocol surfaces just to support planning UI.

### Visual Semantics

- Functional and structured.
- Emphasize narrowing, constraints, and one candidate next action.
- AI appears as a helper lane, not as the center of the page.

### Data Shown By Default

- Current layer and selected entity.
- Candidate next action.
- Constraints, estimate, and completion condition.
- Pending AI suggestions with status.
- Controls to enter focus.

### Data Hidden By Default

- Long-term metrics not needed for the current decision.
- Raw audit logs.
- Provider/model implementation details.

### AI Boundary

AI can decompose, search context, or suggest workflow optimizations only as
pending suggestions. Approval remains explicit, auditable, and reversible where
the action has persistent effects.

### Acceptance Criteria

- Plan mode is visibly distinct from focus mode.
- AI controls are labeled by action and status.
- Only one action can be promoted into focus.
- Existing deterministic XState transitions remain authoritative.

## Stage Contract: Execution Focus

### User State

The user has committed to one current action and needs protection from
unnecessary context switching.

### Primary Question

"What one thing am I doing now, and how do I return cleanly when it is done?"

### Allowed Actions

- Start, pause, resume, or complete the current task.
- Record minimal progress.
- View only the context needed for the current task.
- Return to Overview or Execution Plan intentionally.

### Forbidden Actions

- Showing multiple competing project branches.
- Surfacing broad AI suggestion queues.
- Encouraging further decomposition during focus unless explicitly requested.
- Turning the focus timer into a generic productivity widget detached from the
  selected action.

### Visual Semantics

- Highest clarity and lowest density.
- One primary action.
- Timer/progress is supportive, not dominant.
- Interrupt recovery should be easy.

### Data Shown By Default

- Current task title.
- Why this task matters in the hierarchy.
- Estimated and actual time.
- Completion condition.
- One return path.

### Data Hidden By Default

- Other tasks and projects.
- Full AI suggestion queues.
- Configuration and protocol details.
- Unrelated long-term metrics.

### AI Boundary

AI should not interrupt focus by default. It may offer recovery cues or a
single requested helper action, but only after explicit user invocation.

### Acceptance Criteria

- Focus has exactly one active action.
- The user can finish or intentionally exit.
- The UI does not invite broad replanning.
- Mobile focus remains readable and tappable.

## Five-Layer Visual Semantics

| Layer | User question | Visual posture | Primary signal | Avoid |
|---|---|---|---|---|
| `vision` | "What kind of life or person is this serving?" | Reflective, milestone-oriented, spacious | Long horizon, identity, cumulative progress | Task cards as the main visual unit |
| `area` | "Which responsibility domain needs attention?" | Balanced portfolio view | Domain health, imbalance, neglected areas | Mixing area labels with concrete tasks |
| `goal` | "What outcome am I moving toward?" | Motivating but concrete | Progress toward milestone, gap to target | Empty motivational decoration |
| `project` | "What chain of work produces the outcome?" | Operational map | deliverable, current next action, blockers | Infinite branching and over-decomposition |
| `task` | "What can I do now?" | Dense, direct, focus-safe | action, estimate, done condition | More than one active next action |

## AI Suggestion Placement Rules

- AI is a helper lane, not the primary navigation model.
- AI suggestions must visibly carry status: pending, approved, rejected, applied.
- Approval must be deliberate for persistent changes.
- AI can support Overview as read-only insight but should not create or mutate
  from Overview.
- AI decomposition belongs to Execution Plan.
- AI recovery cues may appear in Execution Focus only when requested or when a
  later accepted interruption-recovery design defines strict limits.
- Provider, model, token, RAG, and protocol details stay hidden unless the user
  is in a developer/debug surface.

## Mobile And Desktop Expectations

### Desktop

- Side navigation may remain visible if it does not compete with the stage.
- Main content should have stable readable width.
- Stage identity should be visible without oversized hero treatment.
- Repeated cards should support scanning and comparison.

### Mobile

- The fixed sidebar must collapse or move out of the main content column.
- Mobile uses a bottom three-stage navigation for `Ritual`, `Overview`, and
  `Execution`; the desktop sidebar must not remain as a fixed mobile column.
- Current hierarchy layer, breadcrumb, and selected entity scope live at the top
  of the stage content, not inside a hidden drawer.
- Main text must not wrap one word per line.
- Primary stage action must remain visible without horizontal squeezing.
- Touch targets must remain tappable.
- Overview and Execution must be usable at 390px width.

## Phase 2 Design Review Decisions

### D1: Mobile Navigation Pattern

Status: accepted on 2026-05-13 via `/gstack-plan-design-review` chat fallback.

Decision: use a mobile bottom stage navigation plus a top layer/breadcrumb
control.

Implementation constraints:

- Desktop may keep the existing sidebar pattern if it does not compete with the
  active stage.
- Mobile must not render the sidebar as a fixed left column.
- Mobile bottom navigation contains the three primary stages:
  `Ritual`, `Overview`, and `Execution`.
- Mobile layer context is shown above stage content through a compact
  breadcrumb, layer selector, or current-scope header.
- Primary stage content must stay readable at 390px width before any secondary
  context is shown.

Rationale: AttentionOS is stage-first and layer-aware. Keeping stages visible on
mobile preserves orientation, while moving layer context into the content header
fixes the current narrow-column failure without hiding the user's place in the
workflow.

### D2: Execution Plan / Focus Presentation

Status: accepted on 2026-05-13 via `/gstack-plan-design-review` chat fallback.

Decision: express `execution(plan)` and `execution(focus)` as distinct
subroutes: `/execution/plan` and `/execution/focus`.

Implementation constraints:

- `Execution` remains the canonical stage; `plan` and `focus` are mode-level
  subroutes inside that stage.
- `/execution/plan` owns action creation, splitting, ordering, AI-assisted
  decomposition, workflow optimization review, and focus candidate selection.
- `/execution/focus` owns exactly one active action, progress/timer support,
  completion condition, and intentional exit paths.
- Focus mode must not render the broad planner, competing task list, or full AI
  suggestion queue by default.
- Route state must preserve the current hierarchy layer, selected entity, and
  chosen focus action where applicable.
- E2E coverage must verify direct navigation and refresh behavior for both
  subroutes.

Rationale: planning and focusing are different attention states. Distinct
subroutes make that boundary visible, keep Focus protected from planner noise,
and give implementation/testing a stable contract for recovery and deep links.

### D3: Ritual Default Language

Status: accepted on 2026-05-13 via `/gstack-plan-design-review` chat fallback.

Decision: use neutral intention language by default, with user-configured
prayer, dedication, and ritual wording.

Implementation constraints:

- Default Ritual copy should use neutral language such as intention, settle,
  dedicate, reflection, and close.
- The product must still feel like a ritual surface, not a generic productivity
  setup screen.
- Prayer and dedication wording must be configurable by the user rather than
  hardcoded as the only default language.
- The first implementation may provide a simple local/default wording model, but
  it must not require protocol or Phase 4 extension work.
- Ritual acceptance tests should verify that implementation terms such as
  "state machine" do not appear as primary user-facing copy.

Rationale: this keeps the user's original ritual/prayer/dedication structure
available without making one religious vocabulary the forced default for every
user. It also protects AttentionOS from becoming a generic task dashboard.

### D4: Vision Layer First Visual Model

Status: accepted on 2026-05-13 via `/gstack-plan-design-review` chat fallback.

Decision: use a timeline-first `vision` view in the first implementation slice.

Implementation constraints:

- Vision Overview should emphasize long-horizon timeline, milestones, narrative
  checkpoints, and reflection cadence before numeric summary cards.
- The first visible unit should answer what life/work direction the current
  vision serves, not how many tasks or projects exist underneath it.
- Empty and low-data states must still work: a new user should see a clear
  vision statement prompt, next reflection point, and bridge into `area` or
  `goal`, not an empty KPI shell.
- Statistics may appear as secondary support only when they explain momentum,
  stagnation, or milestone progress.
- Task cards must not be the primary visual unit for the `vision` layer.

Rationale: the `vision` layer is about identity, direction, and long-horizon
meaning. A timeline-first view better preserves that purpose than a metric-card
dashboard while still allowing milestone evidence to appear.

### D5: AI Suggestion Grouping

Status: accepted on 2026-05-13 via `/gstack-plan-design-review` chat fallback.

Decision: group AI suggestions by workflow stage and current mode.

Implementation constraints:

- AI suggestions must be subordinate to the current stage or mode, not presented
  as a global AI control center.
- Overview may show read-only insight or pending suggestion status, but approval,
  rejection, decomposition, and mutation controls remain outside Overview.
- Execution Plan may show planning suggestions, workflow optimization
  suggestions, and recovery-related suggestions only when they support the
  current planning decision.
- Execution Focus must not show the full AI suggestion queue by default. It may
  show only explicitly requested helper actions or tightly bounded recovery cues.
- AI suggestion cards or rows must show status: pending, approved, rejected, or
  applied.
- Suggestion type remains available in metadata for implementation and filtering,
  but it is not the primary visual grouping model.

Rationale: AttentionOS is organized around attention stage and workflow state,
not around AI capabilities. Stage-based grouping keeps AI useful without making
the user manage an AI backlog as a separate job.

## Phase 2 Design Review Result

Phase 2 `/gstack-plan-design-review` is complete as a planning review using the
owner-approved normal-chat interaction fallback for `AskUserQuestion`.

Initial design completeness: 7/10. The Phase 1 contract had the right
stage-level direction, but left several implementation-shaping design decisions
open.

Final design completeness: 9/10. The remaining risk is visual execution quality,
which must be checked after implementation with `/gstack-design-review` or
equivalent visual QA.

| Review pass | Result |
|---|---|
| Information architecture | Improved by D1 mobile stage navigation and D2 Execution subroutes. |
| Interaction states | Still requires implementation-level loading, empty, error, success, and partial-state specs in `/gstack-autoplan` slices. |
| User journey and emotional arc | Improved by D3 Ritual language and D4 timeline-first Vision. |
| AI slop risk | Reduced by D4 avoiding KPI-card Vision and D5 keeping AI subordinate to workflow stage. |
| Design system alignment | No root `DESIGN.md` exists; this contract remains the active design-planning surface. |
| Responsive and accessibility | Improved by D1; implementation must still enforce 390px usability, 44px touch targets, readable text, and keyboard/screen-reader behavior. |
| Unresolved design decisions | The four listed Phase 1 design decisions are resolved. |

### What Already Exists

- Desktop shell, Ritual, Overview, and Execution pages already exist and should
  be reused where they do not conflict with the accepted contract.
- The three-stage and five-layer workflow model already exists and must remain
  the navigation authority.
- Phase 2 and Phase 3 AI/HITL boundaries already exist and should be preserved.

### Not In Scope

- Final visual styling and production polish; verify after implementation.
- Broad Phase 4 protocol, SDK, plugin, MCP, or offline-sync work.
- Root-level `DESIGN.md`; durable planning stays under `docs/plans/` unless the
  owner explicitly accepts a new design-system surface.

### Deferred Design Debt

- Full empty/loading/error/success/partial-state table per component.
- Post-implementation visual QA across desktop and mobile.
- A durable tokenized design system if the implementation starts duplicating
  color, typography, spacing, or component rules.

## Phase 3 Engineering Review Decisions

### E1: Execution Mode State Boundary

Status: accepted on 2026-05-13 via `/gstack-plan-eng-review` chat fallback.

Decision: add a dedicated `executionModeMachine` for `plan / focus` inside the
canonical `execution` stage.

Implementation constraints:

- `dailyFlowMachine` remains the authority for top-level stages:
  `ritual`, `overview`, and `execution`.
- The new `executionModeMachine` owns only Execution-internal mode rules:
  `plan` and `focus`.
- The new machine must not duplicate task lifecycle states such as planning,
  executing, reviewing, and done; those remain in the existing task lifecycle
  surface unless a later accepted engineering review explicitly changes that.
- The new machine must enforce core mode guards, including "cannot enter focus
  without an active focus candidate or active task".
- The implementation must include direct machine tests for allowed transitions,
  blocked transitions, restore behavior, and exit paths.
- Route synchronization must be designed explicitly before implementation so
  URL state, `dailyFlowMachine`, task lifecycle, and `executionModeMachine` do
  not drift.

Rationale: the owner prefers the longer-term structure of an explicit Execution
mode controller. This makes Plan/Focus rules testable and centralized, while
keeping the existing stage machine as the higher-level workflow authority.

### E2: URL And Execution Mode Authority

Status: accepted on 2026-05-13 via `/gstack-plan-eng-review` chat fallback.

Decision: URL expresses the user's requested mode, and `executionModeMachine`
validates whether that mode is allowed. Invalid mode requests redirect to a safe
route.

Implementation constraints:

- `/execution/plan` is always valid while the top-level daily flow stage is
  `execution`.
- `/execution/focus` is valid only when `executionModeMachine` can satisfy the
  focus guard, such as having an active focus candidate or active task.
- A direct visit, refresh, or route restore to `/execution/focus` without a
  valid focus target must redirect to `/execution/plan`.
- The UI should explain the redirect in user terms, for example that the user
  needs to choose one focus action before entering Focus.
- `useRouteSync` or its successor must continue restoring the top-level
  `execution` stage from both `/execution/plan` and `/execution/focus`.
- Route/machine synchronization must avoid loops: URL changes request machine
  transitions, while rejected transitions produce one safe redirect.

Rationale: the URL should support deep links, refreshes, and user intent, but it
must not be trusted as the workflow authority. The machine acts as the gate so
Focus cannot be entered without a valid single action.

### E3: Execution Mode And Task Lifecycle Boundary

Status: accepted on 2026-05-13 via `/gstack-plan-eng-review` chat fallback.

Decision: keep `executionModeMachine` separate from the existing task lifecycle
for the first implementation, while documenting a future migration path if
Execution grows more complex.

Implementation constraints:

- First implementation: `executionModeMachine` owns only Plan/Focus mode
  transitions and guards.
- Existing task lifecycle remains responsible for task progress states such as
  planning, executing, reviewing, and done.
- The two systems may communicate through explicit inputs and events, such as
  "focus candidate selected", "active task available", "task completed", and
  "return to plan".
- Do not merge task lifecycle states into `executionModeMachine` in the first
  implementation slice.
- Document a future migration trigger: if Focus, Review, Recovery, Pause, or
  Interrupt flows become tightly coupled and hard to reason about, a later
  accepted engineering review may unify Execution-internal mode and task
  lifecycle under one machine.
- Tests must prove the current boundary: Plan/Focus mode transitions work
  without duplicating task progress transitions.

Rationale: this keeps the immediate implementation small enough to land safely
while preserving an explicit path to a unified machine if Execution complexity
actually justifies it later.

### E4: Required Implementation Test Scope

Status: accepted on 2026-05-13 via `/gstack-plan-eng-review` chat fallback.

Decision: require the full contract test set for the implementation PR.

Implementation constraints:

- Add direct `executionModeMachine` unit tests for Plan entry, Focus entry,
  blocked Focus entry without an active task or focus candidate, completion,
  exit, and restore behavior.
- Add route sync tests proving `/execution/plan` and `/execution/focus` both
  restore the top-level `execution` stage.
- Add invalid Focus route coverage proving a direct visit or refresh of
  `/execution/focus` without a valid focus target redirects to
  `/execution/plan` and explains the required next step to the user.
- Keep desktop shell navigation tests for the canonical three stages.
- Add mobile or responsive verification at 390px proving the fixed desktop
  sidebar no longer squeezes the main content column.
- Add Execution Plan tests proving AI suggestion review appears in Plan mode.
- Add Execution Focus tests proving the full AI suggestion queue is hidden by
  default in Focus mode.
- Keep existing AI/HITL audit assertions for suggestion approval and rejection.

Rationale: the planned implementation changes core workflow navigation and
state recovery. Smoke tests would miss the actual failure modes: illegal Focus
entry, route/machine drift, mobile shell regression, and AI queue leakage into
Focus.

### E5: Implementation Slice Scope

Status: accepted on 2026-05-13 via `/gstack-plan-eng-review` chat fallback.

Decision: implement the experience-alignment execution work as one complete
implementation slice.

Implementation constraints:

- The implementation slice must include `executionModeMachine`,
  `/execution/plan`, `/execution/focus`, mobile bottom stage navigation,
  Plan/Focus AI suggestion boundary, and the full contract test set.
- Do not land a route-only or UI-only half-step that leaves Execution visually or
  behaviorally inconsistent.
- The slice must stay narrowly scoped to the accepted experience-alignment work;
  do not bundle Phase 4 protocol, SDK, plugin, MCP, or offline-sync work.
- If the slice becomes too large during implementation, pause and re-run
  `/gstack-autoplan` rather than silently splitting or dropping tests.

Rationale: these changes depend on each other. Routes without a mode machine are
weak, mobile layout without route/mode clarity leaves the core experience
confused, and UI without tests repeats the current failure pattern.

## Phase 3 Engineering Review Result

Phase 3 `/gstack-plan-eng-review` is complete as a planning review using the
owner-approved normal-chat interaction fallback for `AskUserQuestion`.

Architecture review: accepted one new focused machine, `executionModeMachine`,
while preserving `dailyFlowMachine` as the top-level stage authority and the
existing task lifecycle as task-progress authority.

Code quality review: accepted an explicit route/machine boundary. URL requests
mode changes, the machine validates them, and invalid Focus requests redirect to
Plan with a user-visible explanation.

Test review: accepted the full contract test scope. The implementation slice
must include machine unit tests, route sync tests, invalid Focus redirect tests,
desktop shell tests, mobile/responsive verification, Plan AI review tests, Focus
AI-hidden-by-default tests, and existing AI/HITL audit assertions.

Performance review: no new backend, network, database, or provider surface is
introduced by the approved implementation slice. Primary performance risk is
frontend state/render complexity from route and machine synchronization.

### Engineering Scope Challenge Result

The reviewed implementation is larger than a one-file fix, but it is still the
minimum complete slice because the accepted design decisions are coupled:

- `executionModeMachine` and subroutes must land together to avoid fake route
  modes.
- Mobile navigation must land with route updates to remove the fixed-sidebar
  regression.
- Plan/Focus AI boundaries must land with subroutes so Focus does not inherit
  the full planner queue.
- Tests must land in the same slice because the failure modes are state drift
  and responsive regression.

### What Already Exists

- `dailyFlowMachine` already models the top-level stages and should remain the
  stage authority.
- `hierarchyNavMachine` already models the five hierarchy layers and should
  remain the hierarchy authority.
- `ExecutionPage` and execution child components already provide task detail,
  timer, task actions, AI decomposition, and evolution suggestion surfaces.
- Existing tests cover root routing, Overview read-only behavior, current
  Execution task flow, AI suggestion approval/rejection, and route sync for
  top-level stages.

### Not In Scope

- Replacing `dailyFlowMachine` with a larger workflow machine.
- Merging task lifecycle into `executionModeMachine` in the first slice.
- Implementing Phase 4 protocol, SDK, plugin, MCP, or offline-sync work.
- Creating a root `DESIGN.md` or final visual design system.
- Rewriting storage architecture beyond what is needed for current route and
  task state.

### Failure Modes To Cover

| Failure mode | Required protection |
|---|---|
| Direct visit to `/execution/focus` without a focus target | Redirect to `/execution/plan` with user-visible guidance. |
| URL says Focus while machine rejects Focus | One safe redirect, no route/machine loop. |
| `dailyFlowMachine` stage and Execution subroute drift | Route sync restores top-level `execution` for both subroutes. |
| Focus shows full AI suggestion queue | Focus tests prove full queue is hidden by default. |
| Mobile shell keeps fixed sidebar | 390px verification proves main content remains readable. |
| Task lifecycle gets duplicated in the new mode machine | Machine tests and implementation review keep mode and task progress separate. |

### Worktree Parallelization Strategy

Sequential implementation is recommended for the first slice. The work spans
shared desktop routing, shell layout, Execution UI, machine contracts, and tests;
parallel worktrees would likely collide in `apps/desktop/src/` and
`packages/machines/src/`.

### Eng Review Test Plan Artifact

Primary QA input for `/gstack-qa-only`:
`.gstack/projects/YannJY02-AttentionOS/yann.jy-main-eng-review-test-plan-20260513-0733.md`

### Phase 3 Completion Summary

| Section | Result |
|---|---|
| Step 0 scope challenge | Scope accepted as one complete implementation slice. |
| Architecture review | 2 issues resolved: new execution mode machine and URL/machine authority. |
| Code quality review | 1 boundary resolved: keep task lifecycle separate with migration path. |
| Test review | Full contract test set required. |
| Performance review | No backend performance risk; frontend state/render complexity is the main watchpoint. |
| Not in scope | Written. |
| What already exists | Written. |
| Failure modes | 6 concrete failure modes listed. |
| Parallelization | Sequential implementation recommended. |

## Open Design Decisions

These require owner review before implementation:

1. Resolved in Phase 2 D3: Ritual uses neutral intention language by default,
   with user-configured prayer and dedication wording.
2. Resolved in Phase 2 D4: the long-horizon `vision` layer uses a
   timeline-first view in the first implementation slice.
3. Resolved in Phase 2 D2: `execution(plan)` and `execution(focus)` use distinct
   subroutes.
4. Resolved in Phase 2 D5: AI suggestions are grouped by workflow stage and
   current mode, with suggestion type kept as metadata.

## Phase 1 Gate Result

Phase 1 gate is satisfied for planning: each stage now has user state, primary
question, allowed actions, forbidden actions, visual semantics, data visibility,
AI boundary, and acceptance criteria.

Implementation remains blocked until the accepted `/gstack-autoplan` slice is
implemented and then verified with `/gstack-qa-only`.

## Next Required Skill Gates

1. Implement `docs/plans/2026-05-13-attentionos-experience-alignment-implementation-slice.md`.
2. Run `/gstack-qa-only` against the implementation slice and gstack test plan
   artifacts.
