---
status: implemented and qa-verified
date: 2026-05-13
scope: experience-alignment
owner: YannJY02
skill_gate: /gstack-autoplan
source_plan: docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md
---

# AttentionOS Ritual Semantic Correction Slice

## Autoplan Status

Phase 4 `/gstack-autoplan` has been invoked for Slice 2 from the experience
alignment blueprint. This slice is intentionally narrow: it corrects Ritual
semantics and user-facing language without reopening the broader workflow
architecture or Phase 4 protocol scope.

This slice is now implemented and `/gstack-qa-only` verified as of
2026-05-13.

## Context

The completed Execution Plan/Focus slice already fixed the mobile shell and
Execution mode boundary. The remaining high-risk experience gap in the blueprint
is that Ritual still reads partly like an engineering scaffold. The current
Ritual first screen begins at meditation and includes primary copy about a
deterministic pause and the meditation state machine.

## One-Slice Goal

Make Ritual feel like an intentional entry or reset surface:

1. Start with neutral intention and settling semantics rather than implementation
   language.
2. Preserve meditation, reflection, and dedication as the deterministic Ritual
   path.
3. Keep prayer and dedication language configurable through a simple local
   wording model.
4. Keep Ritual completion landing in Overview.
5. Add regression tests that prevent implementation terms from returning as
   primary Ritual copy.

## Existing Code Leverage

| Sub-problem | Existing code | Autoplan decision |
|---|---|---|
| Ritual stage order | `packages/machines/src/daily-flow.ts` | Reuse unchanged. The current `meditation -> reflection -> dedication -> overview` path remains valid. |
| Meditation timer | `apps/desktop/src/pages/ritual/MeditationStep.tsx` and `meditationMachine` | Reuse timer behavior while changing the surrounding semantics. |
| Reflection persistence | `apps/desktop/src/storage/reflections.ts` | Reuse unchanged. |
| Ritual UI tests | `apps/desktop/src/pages/RitualPage.test.tsx` | Update assertions for intention-first language and no internal implementation copy. |
| E2E ritual path | `e2e/smoke.spec.ts` | Update only if user-facing headings or button labels change. |

## File Scope

Likely implementation files:

- `apps/desktop/src/pages/RitualPage.tsx`
- `apps/desktop/src/components/layout/Shell.tsx`
- `apps/desktop/src/pages/ritual/MeditationStep.tsx`
- `apps/desktop/src/pages/ritual/ReflectionStep.tsx`
- `apps/desktop/src/pages/ritual/DedicationStep.tsx`
- `apps/desktop/src/App.test.tsx`
- `apps/desktop/src/pages/RitualPage.test.tsx`
- `apps/desktop/src/storage/ritualCopy.ts`
- Optional: `e2e/smoke.spec.ts`

Likely documentation files:

- `docs/plans/2026-05-13-attentionos-ritual-semantic-correction-slice.md`
- `docs/plans/README.md`
- `docs/README.md`
- `docs/governance/project-state.md`
- `docs/governance/changelog.md`
- `docs/governance/maintenance-log.md`

## Review Results

| Review | Result | Notes |
|---|---|---|
| CEO / scope | Pass | Keep this as a product-experience slice. Do not expand into a new ritual system, protocol surface, or settings platform. |
| Design | Pass with constraint | Ritual should be quiet, low-density, and intention-led. Avoid productivity dashboard language. |
| Engineering | Pass | No machine-state refactor is required. Keep `dailyFlowMachine` as the stage authority. |
| DX | Not applicable | This slice does not add developer-facing API, SDK, CLI, plugin, or MCP behavior. |

## Implementation Contract

- Default copy uses neutral terms: intention, settle, reflection, dedication, and
  close.
- Prayer/dedication wording remains configurable locally; the first slice may
  use localStorage/default values and does not need server sync.
- No primary user-facing Ritual copy should contain implementation terms such as
  "state machine", "deterministic", "XState", "protocol", or "storage".
- Meditation controls remain usable and test-covered.
- Reflection still persists as a `workflowStage: ritual` entity.
- Completing dedication still transitions to Overview.
- No changes are made to Phase 4 protocol, SDK, MCP, plugin, offline sync, or
  public network exposure.

## Test Plan

Required targeted checks:

```bash
pnpm --filter @attentionos/desktop test -- --run apps/desktop/src/pages/RitualPage.test.tsx
pnpm e2e
```

Before closeout:

```bash
pnpm docs:check
pnpm check
pnpm test:run
pnpm lint
pnpm build
pnpm e2e
git diff --check
```

## Failure Modes

| Failure mode | Protection |
|---|---|
| Ritual still starts as a timer demo. | Test for intention-first heading/copy. |
| Internal implementation language returns to user-facing copy. | Test rejects `state machine`, `deterministic`, and similar terms. |
| Prayer/dedication becomes hardcoded religious wording only. | Keep neutral default plus configurable local wording. |
| Ritual no longer reaches Overview. | Existing transition test remains required. |
| Slice expands into Phase 4 settings/protocol work. | Explicitly out of scope in this plan and project state. |

## Implementation Closeout

Completed:

- Removed primary Ritual copy that described the meditation step as
  deterministic or state-machine controlled.
- Reframed Ritual entry around settling attention, intention, reflection, and
  dedication.
- Added a small localStorage-backed `ritualCopy` read model for configurable
  intention and dedication wording.
- Replaced internal meditation status labels with user-facing breath labels.
- Replaced the desktop shell footer implementation slogan with attention-first,
  human-led suggestion language.
- Preserved the existing `dailyFlowMachine` Ritual path and
  `RITUAL_COMPLETE -> Overview` transition.
- Added regression coverage for Ritual semantics, local wording override,
  reflection persistence, Overview transition, and shell footer copy.

QA:

- `/gstack-qa-only` report:
  `.gstack/qa-reports/qa-report-ritual-semantics-2026-05-13.md`.
- Browser QA passed for desktop Ritual, meditation controls, Reflection,
  Dedication, Ritual -> Overview, and 390px mobile Ritual readability.
- No console or page errors were observed in the final QA run.

Final verification passed on 2026-05-13:

- `pnpm docs:check`
- `pnpm check`
- `pnpm test:run` with 43 files and 200 tests
- `pnpm lint`
- `pnpm build`
- `pnpm e2e` with 3 Chromium tests
- `git diff --check`

## Completion Criteria

- Ritual first screen answers what the user should remember, settle, and intend.
- Meditation, reflection, and dedication still form the Ritual path.
- User-facing copy no longer reads like an implementation demo.
- Targeted and full verification pass.
- Documentation indexes and project state reflect the completed Ritual slice.
