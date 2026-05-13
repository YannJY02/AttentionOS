# AttentionOS Documentation

This is the canonical entry point for AttentionOS documentation.

## Read First

1. `governance/project-state.md` — current recovery state, active work, blockers, and next action.
2. `product/MASTER_PRODUCT_PLAN.zh-CN.md` — product and vision baseline.
3. `workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md` — workflow semantic baseline.
4. `plans/2026-05-10-attentionos-experience-alignment-blueprint.md` — draft blueprint for the experience-alignment workflow and `/gstack` skill gates.
5. `plans/2026-05-13-attentionos-ai-hitl-clarity-slice.md` — implemented and QA-verified AI suggestion placement and HITL clarity slice.
6. `plans/2026-05-13-attentionos-overview-readonly-scan-slice.md` — implemented and QA-verified Overview read-only scan redesign slice.
7. `plans/2026-05-13-attentionos-ritual-semantic-correction-slice.md` — implemented and QA-verified Ritual semantic correction slice.
8. `plans/2026-05-13-attentionos-experience-alignment-implementation-slice.md` — implemented and QA-verified Execution Plan/Focus slice for the accepted experience work.
9. `plans/2026-05-10-attentionos-experience-alignment-review-gate-blocker.md` — historical review-gate blocker and record of the owner-approved chat fallback.
10. `plans/2026-05-09-phase-4-intake.md` — draft Phase 4 intake for protocol and extension scope.
11. `plans/2026-05-09-phase-3-evolutionary-learning-ledger.md` — verified Phase 3 implementation ledger.
12. `plans/2026-05-09-phase-2-completion-ledger.md` — Phase 2 AI reasoning closeout ledger.
13. `governance/ai-generated-doc-workflow.md` — required routing, naming, update, and archive workflow for AI-generated docs.
14. `work/todo.md` — non-authoritative developer intake queue for early ideas and untriaged work.
15. `governance/documentation-automation.md` — low-risk automation and check triggers for documentation governance.

## Documentation Map

| Area | Path | Purpose | Authority |
|---|---|---|---|
| Product baseline | `product/` | Product identity, principles, roadmap, metrics | Current product/design/development baseline |
| Workflow semantics | `workflow/` | Three-stage/five-layer workflow model | Active source of truth for workflow language |
| Original user sources | `sources-or-raw/` | Raw requirement prompts preserved from early design | Source evidence |
| Implementation plans | `plans/` | Architecture, phase plans, phase ledgers, and contracts | Depends on file status |
| App docs | `apps/` | Application/package docs that should not live beside code | Derived from package files and implementation |
| Historical roadmap notes | `roadmap-execution/` | Historical references kept separate from active plans | Historical/source context only |
| Developer intake | `work/todo.md` | Daily ideas, rough requirements, and small reminders | Non-authoritative intake queue |
| Governance state | `governance/`, `decisions/`, `work/`, `archive/` | Recovery, proposed decisions, audits, maintenance logs, and controlled evolution | `governance/project-state.md` is recovery; `governance/` reports are non-authoritative |

## Plans Directory Rule

`docs/plans/` is the only active plans directory. Do not create a root-level `plans/` directory again.

Use status labels in the document body:

- `Active` or `Current`: still guides implementation.
- `Draft` or `待审批`: reference only until accepted.
- `Historical`: retained for evidence and recovery, not the current plan.

## Code-Adjacent Documentation Rule

Do not put long-lived documentation in code package directories. Application and package notes belong under `docs/apps/` or another documented `docs/` subdirectory.

## AI-Generated Documentation Rule

AI-generated documentation must follow `governance/ai-generated-doc-workflow.md`.

In short: classify first, route into `docs/`, use standardized names, update the relevant indexes/state/logs, archive applied or superseded generated proposals, and verify references before finishing.

For day-to-day development, use `work/todo.md` as the only developer intake queue and `governance/development-document-lifecycle.md` as the lifecycle rule for prompts, blueprints, verification notes, audits, handoffs, and archive closeout.

Run `pnpm docs:check` after documentation changes. `pnpm check` includes this
documentation governance check before the normal project check.

## Root Exceptions

The repo root should stay mostly code-facing. Keep only these documentation-like exceptions outside `docs/`:

- `README.md` — thin GitHub/platform entrypoint pointing here.
- `CLAUDE.md` — tool-discovery instruction file.
- `AGENTS.md` — repo-local AI-agent instruction file.

Do not recreate root-level `plans/`, `decisions/`, `sources-or-raw/`, `work/`, `archive/`, `.ai/`, `project-state.md`, or `changelog.md`.

## Governance Rule

Do not resolve documentation conflicts by recency alone. Use this order:

1. Source evidence and command output.
2. Accepted decisions in `decisions/`.
3. `governance/project-state.md`.
4. Active plans and working notes under `docs/plans/`.
5. `governance/` audit reports and proposals.
6. Archive or historical notes.
