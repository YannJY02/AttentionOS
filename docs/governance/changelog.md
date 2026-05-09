# Changelog

## 2026-05-09

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
