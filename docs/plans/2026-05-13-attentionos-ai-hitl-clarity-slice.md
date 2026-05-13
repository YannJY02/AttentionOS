---
status: implemented / qa-verified
date: 2026-05-13
scope: experience-alignment
owner: YannJY02
skill_gate: /gstack-autoplan
source_plan: docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md
---

# AttentionOS AI HITL Clarity Slice

## Closeout Status

Phase 4 `/gstack-autoplan` has been invoked for Slice 5 from the experience
alignment blueprint. This slice keeps AI suggestions subordinate to Execution
Plan and makes the human-review boundary explicit.

Implementation and `/gstack-qa-only` verification are complete as of 2026-05-13.
Final full-workspace verification passed on 2026-05-13 09:48 CST.

## Context

Slices 1, 2, 3, and 4 have aligned the responsive shell, Ritual semantics,
Overview read-only scan, and Execution Plan/Focus separation. AI suggestion
surfaces now appear only in Execution Plan, but the panels still read like
generic AI controls:

- task decomposition shows a bare status and only supports approve/apply;
- workflow optimization shows approval and rejection, but not the reason it is
  safe or what approval does;
- both panels need clearer "generated suggestion, human decides" framing.

The accepted D5 contract says AI suggestions must be subordinate to the current
stage or mode, visible with status, and never appear autonomous.

A read-only explorer review confirmed the same boundary: AI is mechanically
human-led today because generation and review are user-clicked, but the UI still
foregrounds AI capability labels and broad actions more than the current
planning decision.

## One-Slice Goal

Make Execution Plan AI suggestions clearly human-led:

1. Show each AI suggestion as a review lane, not an autonomous command center.
2. Make pending/applied/approved/rejected status visually and textually clear.
3. Add a deliberate reject path for task decomposition suggestions.
4. Preserve explicit approval before persistent mutations.
5. Keep AI queues hidden from Execution Focus.
6. Avoid external provider calls, protocol work, or Phase 4 expansion.

## Existing Code Leverage

| Sub-problem | Existing code | Autoplan decision |
|---|---|---|
| Plan-only placement | `apps/desktop/src/pages/ExecutionPage.tsx` | Reuse current Plan/Focus split; do not move AI into Focus. |
| Task decomposition generation | `apps/desktop/src/pages/execution/AiDecompositionPanel.tsx` | Keep local generator; add review framing, status display, and rejection. |
| Task decomposition persistence | `apps/desktop/src/storage/aiSuggestions.ts` | Add a generic task-decomposition rejected marker with reviewer metadata. |
| Task decomposition audit | `apps/desktop/src/storage/audit.ts` | Log rejection explicitly; keep approval audit unchanged. |
| Workflow optimization review | `apps/desktop/src/pages/execution/EvolutionSuggestionsPanel.tsx` | Improve copy/status framing without changing storage semantics. |
| Tests | `ExecutionPage.test.tsx`, storage tests, E2E | Add rejection and plan/focus boundary coverage. |

## File Scope

Likely implementation files:

- `apps/desktop/src/pages/execution/AiDecompositionPanel.tsx`
- `apps/desktop/src/pages/execution/EvolutionSuggestionsPanel.tsx`
- `apps/desktop/src/storage/aiSuggestions.ts`
- `apps/desktop/src/storage/audit.ts`
- `apps/desktop/src/storage/aiSuggestions.test.ts`
- `apps/desktop/src/ai/taskDecompositionWorkflow.test.ts`
- `apps/desktop/src/pages/ExecutionPage.test.tsx`
- `e2e/evolution-learning.spec.ts`

Likely documentation files:

- `docs/plans/2026-05-13-attentionos-ai-hitl-clarity-slice.md`
- `docs/plans/README.md`
- `docs/README.md`
- `docs/governance/project-state.md`
- `docs/governance/changelog.md`
- `docs/governance/maintenance-log.md`

## Implementation Contract

- AI suggestions must stay in Execution Plan by default.
- Execution Focus must not render task decomposition or workflow optimization
  queues.
- Task decomposition suggestions must support approve/apply and reject.
- Rejecting a task decomposition suggestion must update suggestion status,
  reviewer metadata, and audit log without creating tasks.
- Approving task decomposition must remain the only path that creates tasks.
- Workflow optimization approval/rejection remains human-reviewed and audited.
- UI copy must avoid implying AI already changed the workflow before approval.
- No provider, model, token, RAG, protocol, SDK, MCP, plugin, or offline-sync
  implementation is added.

## Test Plan

Required targeted checks:

```bash
pnpm test:run apps/desktop/src/storage/aiSuggestions.test.ts apps/desktop/src/ai/taskDecompositionWorkflow.test.ts apps/desktop/src/pages/ExecutionPage.test.tsx
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
| AI applies persistent task changes without explicit approval. | Tests assert generated decomposition stays pending until approval and rejection creates no tasks. |
| Rejection lacks auditability. | Storage/workflow tests assert reviewer metadata and audit entries. |
| Focus mode shows full AI queues. | Existing and new Execution tests keep AI panels out of Focus. |
| Overview gains AI mutation controls. | Overview tests and E2E remain read-only. |
| Slice expands into external AI/provider work. | Contract forbids provider/model/protocol changes. |

## Completion Criteria

- A user can tell AI suggestions are proposals awaiting human review.
- Task decomposition supports deliberate approval or rejection.
- Approval/rejection statuses are visible and durable.
- Focus mode remains free of broad AI queues.
- `/gstack-qa-only` and full verification pass.

## Implementation Closeout

Implemented changes:

- Grouped Execution Plan suggestions under human review lanes.
- Reframed task decomposition as a pending draft split that creates no tasks
  until explicit approval.
- Added task-decomposition rejection with reviewer metadata and user audit log.
- Reworded workflow optimization controls so marking a suggestion reviewed does
  not imply automatic workflow mutation.
- Scoped workflow optimization lookup to the `execution` target stage.
- Preserved Focus mode without broad AI review queues.

QA results:

- `/gstack-qa-only` browser click QA passed with 18 checks.
- Report: `.gstack/qa-reports/qa-report-ai-hitl-clarity-2026-05-13.md`.
- Machine report: `.gstack/qa-reports/ai-hitl-clarity-20260513/report.json`.
- Screenshots: `.gstack/qa-reports/ai-hitl-clarity-20260513/screenshots/`.

Targeted verification:

```bash
pnpm test:run apps/desktop/src/storage/aiSuggestions.test.ts apps/desktop/src/ai/taskDecompositionWorkflow.test.ts apps/desktop/src/pages/ExecutionPage.test.tsx
pnpm exec biome check apps/desktop/src/pages/execution/AiDecompositionPanel.tsx apps/desktop/src/pages/execution/EvolutionSuggestionsPanel.tsx apps/desktop/src/pages/ExecutionPage.tsx apps/desktop/src/pages/ExecutionPage.test.tsx apps/desktop/src/storage/aiSuggestions.ts apps/desktop/src/storage/audit.ts apps/desktop/src/storage/aiSuggestions.test.ts apps/desktop/src/ai/taskDecompositionWorkflow.ts apps/desktop/src/ai/taskDecompositionWorkflow.test.ts e2e/evolution-learning.spec.ts
git diff --check -- apps/desktop/src/pages/execution/AiDecompositionPanel.tsx apps/desktop/src/pages/execution/EvolutionSuggestionsPanel.tsx apps/desktop/src/pages/ExecutionPage.tsx apps/desktop/src/pages/ExecutionPage.test.tsx apps/desktop/src/storage/aiSuggestions.ts apps/desktop/src/storage/audit.ts apps/desktop/src/storage/aiSuggestions.test.ts apps/desktop/src/ai/taskDecompositionWorkflow.ts apps/desktop/src/ai/taskDecompositionWorkflow.test.ts e2e/evolution-learning.spec.ts
```

Final verification:

```bash
pnpm docs:check
pnpm check
pnpm test:run
pnpm lint
pnpm build
pnpm e2e
git diff --check
```
