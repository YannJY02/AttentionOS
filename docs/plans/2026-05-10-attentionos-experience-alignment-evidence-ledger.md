---
status: phase-0 evidence ledger
date: 2026-05-10
scope: experience-alignment
owner: YannJY02
skill_gate: /gstack-investigate
---

# AttentionOS Experience Alignment Evidence Ledger

## Investigation Status

Phase 0 `/gstack-investigate` evidence freeze is complete. This ledger records
the root-cause hypothesis, current evidence, preserved invariants, and the gate
for moving into Phase 1 `/gstack-design-consultation`.

No application code was changed during this investigation.

## Current Repo State

- Branch: `main`
- Remote: `origin https://github.com/YannJY02/AttentionOS.git`
- Recent commits:
  - `d6126a5 docs: close phase 3 and frame phase 4`
  - `ebda370 merge: phase 3 evolutionary learning`
  - `8d44234 fix: close phase 3 learning audit gap`
- Pre-existing unrelated working-tree change: `.gitignore`
- Active documentation changes from this workflow:
  - `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`
  - this evidence ledger
  - documentation indexes and governance logs

## UI Capture Evidence

Fresh captures were taken from the local Vite desktop app at
`http://127.0.0.1:1420/`.

| Capture | Path | Finding |
|---|---|---|
| Ritual desktop | `/private/tmp/attentionos-ui-audit/01-ritual.png` | Ritual begins at Meditation and includes implementation-oriented wording about deterministic pause and the state machine. |
| Overview desktop root | `/private/tmp/attentionos-ui-audit/02-overview-root.png` | Overview confirms read-only framing, but the surface is still generic metrics plus entity cards. |
| Overview desktop task layer | `/private/tmp/attentionos-ui-audit/03-overview-task.png` | Task layer bridge to Execution exists, but layer-specific visual meaning is thin. |
| Execution desktop | `/private/tmp/attentionos-ui-audit/04-execution.png` | Execution combines planning state, timer, controls, AI decomposition, and evolution suggestions in one surface. |
| Overview mobile | `/private/tmp/attentionos-ui-audit/05-overview-mobile.png` | Fixed shell layout squeezes main content into an unusably narrow column. |
| Execution mobile | `/private/tmp/attentionos-ui-audit/06-execution-mobile.png` | Execution route has the same fixed-shell failure; text wraps one word per line. |

The first attempt to capture mobile Execution through the full user flow failed
while waiting for `Start execution`, so the route was captured directly at
`/execution`. The failed flow attempt is useful evidence that mobile navigation
and task transition verification must be part of Phase 5 QA.

## Root Cause Hypothesis

Root cause hypothesis: AttentionOS currently has the correct high-level
workflow skeleton and AI/HITL architecture, but the frontend lacks an explicit
experience contract that translates the product baseline into stage-specific
layout, copy, hierarchy semantics, and responsive behavior. Because that
contract is missing, UI components expose implementation scaffolding, demo data,
and generic dashboard patterns instead of a coherent Personal Attention OS.

This is not primarily a backend failure. The deeper issue is a missing
product-to-frontend contract, with one concrete frontend implementation bug:
the desktop shell uses a fixed two-column layout that breaks mobile widths.

## Evidence Ledger

| Area | Evidence | Finding | Root cause classification | Risk |
|---|---|---|---|---|
| Product identity | `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md` defines AttentionOS as a personal attention and workflow OS, not a task list. | Current UI still communicates task/dashboard scaffolding more than attention governance. | Product-to-UX translation gap | High |
| Workflow semantics | `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md` freezes `ritual / overview / execution` and `execution(plan) / execution(focus)`. | Routes exist, but Execution does not make plan/focus separation clear. | State-to-UI contract gap | Medium |
| Ritual | Product/workflow docs require prayer, meditation, reflection, and dedication; `RitualPage.tsx` starts with `MeditationStep`. | Ritual step copy includes "state machine" wording, which is implementation-facing. | Experience-contract gap | High |
| Overview | `OverviewPage.tsx` labels itself read-only and blocks editing in copy. | The view is structurally correct but visually generic; it lacks strong layer-specific scanning, risk, and timeline semantics. | UX/visual semantics gap | High |
| Hierarchy layer | `EntityCard.tsx` shows a simple layer badge and card list. | The five layers are encoded as labels, not as distinct visual/decision modes. | Layer semantic rendering gap | Medium |
| Execution | `ExecutionPage.tsx` renders one page for planning, focus, task controls, AI decomposition, and evolution suggestions. | It does not clearly separate `execution(plan)` from `execution(focus)`. | State-to-UI contract gap | Medium |
| Shell/mobile | `Shell.tsx` uses `grid-cols-[280px_1fr]`. | Mobile screenshots show unusable one-word-per-line main content. | Concrete responsive implementation bug | High |
| AI boundary | Phase 2 and Phase 3 docs require pending, human-reviewed AI suggestions. | Current AI direction is aligned and should be preserved. | Preserved invariant, not root cause | Low |
| Storage/demo data | Desktop uses localStorage demo hierarchy data. | Demo storage is acceptable for the current desktop scaffold, but it reinforces scaffold-like content. | Demo-content issue, not storage architecture failure | Medium |
| Phase 4 | Phase 4 intake is explicitly not accepted implementation scope and defers broad protocol work. | Experience work must not be bundled with MCP/SDK/plugin/offline sync. | Scope-control risk | High |

## Pattern Analysis

This does not match a classic runtime bug pattern such as null propagation,
race condition, stale cache, or service integration failure.

It matches a structural product-engineering pattern:

- Canonical product and workflow documents exist.
- Backend/state/AI implementation has advanced in phases.
- The visible frontend still exposes phase scaffold concepts instead of
  user-facing experience semantics.
- Layout constraints were not validated at mobile widths before the phase was
  considered experientially acceptable.

## Preserved Invariants

- Keep the three-stage model: `ritual / overview / execution`.
- Keep the five-layer model: `vision / area / goal / project / task`.
- Keep Overview read-only.
- Keep Execution as the stage for planning and focus actions.
- Keep XState as deterministic workflow authority.
- Keep AI suggestions pending, explicit, auditable, and human-reviewed.
- Keep Phase 4 protocol work separate until a Phase 4 implementation contract is
  accepted.
- Keep long-lived planning under `docs/plans/`.

## Confirmed Root Causes By Layer

| Layer | Root cause | Evidence | Next skill |
|---|---|---|---|
| Product-to-UX | Missing experience alignment contract. | UI uses product labels but not stage-specific user-state semantics. | `/gstack-design-consultation` |
| Visual/interaction | Generic dashboard/card composition dominates the main stages. | Overview and Execution screenshots show cards and metrics without differentiated layer experience. | `/gstack-design-consultation`, then `/gstack-plan-design-review` |
| Responsive frontend | Fixed desktop shell layout breaks mobile. | `Shell.tsx` fixed grid plus mobile screenshots. | `/gstack-plan-design-review` before implementation |
| State-to-UI | `execution(plan)` and `execution(focus)` are semantically documented but not visibly represented. | Execution page combines planning/focus controls and copy. | `/gstack-plan-eng-review` |
| AI/HITL | No root-cause failure found; boundary is directionally correct. | Phase 2/3 docs require pending human-reviewed suggestions. | Preserve in `/gstack-plan-eng-review` |
| Phase 4 | Scope could drift if experience work is confused with protocol work. | Phase 4 intake says first slice should be narrow and read-only. | Preserve in `/gstack-plan-eng-review` |

## Phase 0 Gate Result

Phase 0 gate is satisfied. The root-cause map distinguishes:

- product intent gap: missing experience contract,
- UX/visual gap: scaffold/dashboard presentation,
- frontend implementation gap: fixed mobile-breaking shell,
- state-machine gap: no visible plan/focus execution mode,
- AI/HITL gap: no root failure; preserve existing boundary,
- Phase 4 scope risk: must remain separate from experience work.

## Next Action

Run Phase 1 with `/gstack-design-consultation`:

```text
/gstack-design-consultation AttentionOS experience alignment contract.
Use the Phase 0 evidence ledger, product baseline, workflow baseline, and fresh
UI captures to define stage-specific contracts for ritual, overview,
execution(plan), and execution(focus). Do not implement code.
```

## Tool Notes

- A memory pass confirmed prior AttentionOS closeout conventions: docs indexes,
  project-state, changelog, and maintenance-log should stay synchronized.
- Two `nl` calls failed because macOS `nl` does not support the attempted
  multi-file invocation style; targeted single-file reads were used afterward.
- The first mobile Execution flow capture failed while waiting for the
  `Start execution` button; a direct `/execution` mobile route capture was used
  instead.
- Local dev server and Playwright required escalated sandbox permissions because
  local port listening and Chromium launch had already failed under sandbox
  constraints in this environment.
