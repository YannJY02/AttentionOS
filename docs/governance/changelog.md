# Changelog

## 2026-05-13

- Changed: Execution Plan now groups suggestion surfaces under human review lanes and avoids framing AI as the primary control center.
- Added: task-decomposition rejection support with reviewer metadata and user audit logging.
- Changed: workflow optimization review copy now clarifies that marking a suggestion reviewed does not automatically mutate the workflow.
- Added: AI HITL regression coverage for task-decomposition rejection, execution-stage workflow suggestion filtering, Plan-only review lanes, and updated E2E workflow review labels.
- Added: `/gstack-qa-only` AI HITL QA report at `.gstack/qa-reports/qa-report-ai-hitl-clarity-2026-05-13.md`.
- Added: AI HITL clarity implementation plan at `docs/plans/2026-05-13-attentionos-ai-hitl-clarity-slice.md`.
- Added: Overview read-only scan component at `apps/desktop/src/pages/overview/VisionOverviewPanel.tsx`.
- Changed: Overview now leads with current-layer scan context and renders a timeline-first Vision surface before learning metrics.
- Changed: default hierarchy seed content now reads as user-facing workflow direction rather than implementation scaffold copy.
- Added: Overview read-only scan regression coverage and updated E2E path labels for the new default hierarchy content.
- Added: `/gstack-qa-only` Overview QA report at `.gstack/qa-reports/qa-report-overview-readonly-scan-2026-05-13.md`.
- Added: Overview read-only scan implementation plan at `docs/plans/2026-05-13-attentionos-overview-readonly-scan-slice.md`.
- Added: Ritual semantic correction implementation ledger at `docs/plans/2026-05-13-attentionos-ritual-semantic-correction-slice.md`.
- Changed: Ritual now uses intention-led neutral copy with local configurable intention and dedication wording.
- Changed: Meditation now displays user-facing breath labels instead of internal status values.
- Changed: desktop shell footer copy now describes human-led attention and suggestion review instead of the deterministic core.
- Added: Ritual regression coverage for semantic copy, local wording overrides, reflection persistence, Overview transition, and shell footer wording.
- Added: `/gstack-qa-only` Ritual QA report at `.gstack/qa-reports/qa-report-ritual-semantics-2026-05-13.md`.
- Added: `executionModeMachine` with guarded Plan/Focus mode transitions and unit coverage.
- Changed: Execution routing now uses `/execution/plan` and `/execution/focus`; `/execution` redirects to Plan mode.
- Changed: Execution UI now separates Plan-mode AI suggestion review from Focus-mode single-action work.
- Fixed: active task lifecycle state now survives moving from Execution Focus back to Plan and then into Focus again.
- Changed: desktop shell keeps the sidebar on desktop and uses bottom stage navigation on mobile.
- Changed: Biome now excludes repo-local gstack tool/artifact directories from product linting.
- Added: browser and RTL coverage for Plan/Focus routing, invalid Focus redirects, AI/HITL preservation, and 390px mobile shell behavior.
- Added: `/gstack-qa-only` report and project test outcome for the implemented experience-alignment slice.
- Added: Phase 4 `/gstack-autoplan` implementation slice at `docs/plans/2026-05-13-attentionos-experience-alignment-implementation-slice.md`.
- Added: autoplan QA input at `.gstack/projects/YannJY02-AttentionOS/yann.jy-main-autoplan-test-plan-20260513-0738.md`.
- Changed: project state and documentation indexes now identify the implementation slice as the next coding contract and `/gstack-qa-only` as the post-implementation gate.
- Changed: Phase 3 `/gstack-plan-eng-review` is now complete under owner-approved normal-chat fallback, with E1-E5 recorded in the experience-alignment contract.
- Added: accepted engineering decisions for `executionModeMachine`, URL-request/machine-validated mode authority, separated task lifecycle boundary with migration path, full contract test scope, and one complete implementation slice.
- Added: gstack QA test plan artifact at `.gstack/projects/YannJY02-AttentionOS/yann.jy-main-eng-review-test-plan-20260513-0733.md`.
- Changed: project state and plan indexes now identify `/gstack-autoplan` as the next required gate before implementation.
- Changed: Phase 2 `/gstack-plan-design-review` is now complete under owner-approved normal-chat fallback, with D1-D5 recorded in the experience-alignment contract.
- Added: accepted design decisions for mobile bottom stage navigation, `/execution/plan` and `/execution/focus` subroutes, neutral default Ritual language with configurable prayer/dedication, timeline-first Vision, and stage/mode-grouped AI suggestions.
- Changed: project state and plan indexes now identify `/gstack-plan-eng-review` as the next required implementation blocker before `/gstack-autoplan`.

## 2026-05-10

- Added: Phase 2/3 experience-alignment review gate blocker at `docs/plans/2026-05-10-attentionos-experience-alignment-review-gate-blocker.md`, recording that `/gstack-plan-design-review` and `/gstack-plan-eng-review` are blocked until `AskUserQuestion` is available.
- Changed: experience-alignment blueprint, documentation indexes, and project state now mark Phase 2 and Phase 3 as blocked instead of next/complete, preventing implementation from starting on a false review pass.
- Added: `/gstack-context-save` checkpoint for the current experience-alignment handoff under `.gstack/projects/YannJY02-AttentionOS/checkpoints/`.
- Added: Phase 1 experience-alignment contract at `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`, covering Ritual, Overview, Execution Plan, Execution Focus, five-layer visual semantics, AI placement rules, and mobile/desktop expectations.
- Changed: experience-alignment blueprint and project state now mark Phase 1 complete and identify `/gstack-plan-design-review` plus `/gstack-plan-eng-review` as the next required skill gates.
- Added: Phase 0 experience-alignment evidence ledger at `docs/plans/2026-05-10-attentionos-experience-alignment-evidence-ledger.md`, recording the `/gstack-investigate` evidence freeze, root-cause hypothesis, UI capture paths, and Phase 1 gate.
- Changed: experience-alignment blueprint and project state now mark Phase 0 complete and identify `/gstack-design-consultation` as the next required skill gate.
- Added: draft experience-alignment blueprint at `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, with mandatory `/gstack` skill gates for investigation, design consultation, design review, engineering review, autoplan slicing, QA-only verification, and context preservation.
- Changed: documentation entrypoints and project state now surface the experience-alignment blueprint as the next planning surface before implementation.

## 2026-05-09

- Added: draft Phase 4 protocol and extension intake at `docs/plans/2026-05-09-phase-4-intake.md`.
- Changed: project recovery state now records Phase 3 as merged and pushed to `origin/main` at `ebda370`.
- Changed: server-backed Phase 3 learning analysis now ingests audit events for the analyzed learning window.
- Added: `AuditRepository.findWindow` and regression coverage for audit-window ingestion.
- Added: workflow optimization rejection coverage for browser storage and desktop HITL controls.
- Added: Phase 3 evolutionary learning implementation ledger, deterministic behavior analysis, workflow optimization suggestion payloads, adoption tracking, observability boundary, storage/server runtime, and desktop HITL review surface.
- Added: Supabase migration `0005_phase3_learning.sql` for `workflow_optimization` AI suggestions and Phase 3 learning indexes.
- Added: Playwright coverage for the Phase 3 workflow optimization review path.
- Added: documentation governance check script `scripts/check-doc-governance.mjs`.
- Added: `pnpm docs:check`, `pnpm hooks:install`, and `pnpm verify`; updated `pnpm check` to run documentation governance before Turbo check.
- Added: prepared `.githooks/pre-commit` hook for commit-time documentation governance checks.
- Changed: installed this checkout's Git hooks path to `.githooks` for local pre-commit documentation checks.
- Added: automation guide `docs/governance/documentation-automation.md`.
- Added: `docs/work/todo.md` as the only non-authoritative developer intake queue.
- Added: accepted decision `docs/decisions/2026-05-09-developer-todo-and-doc-lifecycle.md`.
- Added: active lifecycle rule `docs/governance/development-document-lifecycle.md` for prompts, blueprints, verification notes, audits, handoffs, and archive closeout.
- Added: archive placeholders for retired working notes and governance material under `docs/archive/work/` and `docs/archive/governance/`.
- Added: repo-local `AGENTS.md` with accepted documentation governance rules for future AI sessions.
- Added: active AI-generated documentation workflow at `docs/governance/ai-generated-doc-workflow.md`.
- Changed: accepted `docs/decisions/2026-05-09-doc-governance-authority-map.md` after owner confirmation.
- Changed: archived historical Phase 1 plan to `docs/archive/plans/phase1-deterministic-core.md`.
- Changed: archived applied generated proposals under `docs/archive/governance/proposed-updates/` and kept `docs/governance/proposed-updates/` for pending proposals only.
- Changed: categorized loose top-level docs into `docs/product/`, `docs/workflow/`, `docs/sources-or-raw/`, and `docs/governance/`; `docs/README.md` is now the only top-level Markdown file under `docs/`.
- Changed: moved documentation governance surfaces under `docs/` (`docs/governance/project-state.md`, `docs/governance/changelog.md`, `docs/decisions/`, `docs/sources-or-raw/`, `docs/work/`, `docs/archive/`, and `docs/governance/`).
- Added: canonical documentation entrypoints at `README.md`, `docs/README.md`, and `docs/plans/README.md`.
- Changed: consolidated the former root `plans/phase1-deterministic-core.md` into `docs/plans/` before later archiving it under `docs/archive/plans/`.
- Changed: removed the generated desktop README after moving durable desktop documentation to `docs/apps/desktop.md`.
- Changed: replaced broken old roadmap references in `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md` with `docs/roadmap-execution/README.md`.
- Added: documentation governance entrypoints for AttentionOS (`docs/governance/project-state.md`, `docs/decisions/`, `docs/sources-or-raw/`, `docs/work/`, `docs/archive/`, and `docs/governance/`).
- Added: non-authoritative documentation audit, stale report, AGENTS governance proposal, and maintenance-trigger proposal under `docs/governance/`.
- Added: decision for the project documentation authority map.
