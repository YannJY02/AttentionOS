# Project State

Updated: 2026-05-09 19:30 CST
Status: active

## Documentation Governance Mapping

- Current recovery entrypoint: `docs/governance/project-state.md`.
- Durable decisions: `docs/decisions/`. AI may draft `status: proposed` decisions, but must not mark them accepted without explicit user confirmation.
- Raw or source evidence: `docs/sources-or-raw/`. Existing source-like evidence currently includes `docs/sources-or-raw/user-original-long-prompts.zh-CN.md`; do not move or rewrite it without confirmation.
- Documentation entrypoint: `docs/README.md`.
- Active implementation plans and working notes: `docs/plans/`. Do not recreate root-level `plans/`.
- Working notes: `docs/work/`.
- Archive: `docs/archive/`. Moving key files there requires confirmation.
- AI maintenance surfaces: `docs/governance/`. These files are non-authoritative audit, proposal, and maintenance records.
- Repo-local AI instructions: `AGENTS.md`.
- AI-generated documentation workflow: `docs/governance/ai-generated-doc-workflow.md`.
- Developer intake queue: `docs/work/todo.md`.
- Development document lifecycle: `docs/governance/development-document-lifecycle.md`.
- Documentation automation: `docs/governance/documentation-automation.md` and `scripts/check-doc-governance.mjs`.

## Current Truth

- This repo is AttentionOS V2, a personal attention and workflow/context system. Evidence: `CLAUDE.md` and `package.json`.
- The product and vision baseline is `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md`, which declares itself the product/design/development/acceptance baseline.
- The workflow semantic baseline is `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md`, which declares the three-stage/five-layer model as active source of truth.
- Original user prompt evidence is categorized under `docs/sources-or-raw/user-original-long-prompts.zh-CN.md`.
- `docs/plans/2026-03-21-attentionos-v2-architecture-design.md` is an architecture draft with status `待审批`; treat it as a working architecture reference, not as accepted authority where it conflicts with current baselines.
- `docs/plans/` is the only active plans directory; the former root `plans/phase1-deterministic-core.md` has been archived at `docs/archive/plans/phase1-deterministic-core.md`.
- Documentation governance surfaces have been consolidated under `docs/`: `docs/governance/project-state.md`, `docs/governance/changelog.md`, `docs/decisions/`, `docs/sources-or-raw/`, `docs/work/`, `docs/archive/`, and `docs/governance/`.
- Top-level `docs/` now keeps only `docs/README.md`; product, workflow, source, governance, plan, app, work, and archive documents live in subdirectories.
- The documentation authority map is accepted in `docs/decisions/2026-05-09-doc-governance-authority-map.md`.
- Future AI-generated documentation must follow `AGENTS.md` and `docs/governance/ai-generated-doc-workflow.md`: classify first, route under `docs/`, standardize naming, update indexes/state/logs, and archive accepted/applied/superseded generated files.
- The developer todo and AI development document lifecycle are accepted in `docs/decisions/2026-05-09-developer-todo-and-doc-lifecycle.md`.
- `docs/work/todo.md` is the only developer todo/intake queue. It is non-authoritative and must not replace project-state, plans, decisions, changelog, or archive.
- Low-risk documentation governance checks are available through `pnpm docs:check`; `pnpm check` runs them before the normal Turbo check.
- This checkout has `core.hooksPath` set to `.githooks`, so commit-time documentation governance checks are active locally.
- Phase 2 AI reasoning work is represented on `main` by git commit `489b6c6` (`merge: phase 2 ai reasoning`) and by `docs/plans/2026-05-09-phase-2-completion-ledger.md`.
- Phase 3 evolutionary learning now has a verified implementation ledger at `docs/plans/2026-05-09-phase-3-evolutionary-learning-ledger.md`.
- Phase 3 closeout verification passed on 2026-05-09 19:30 CST: `pnpm check`, `pnpm test:run`, `pnpm lint`, `pnpm build`, and `pnpm e2e`.

## Active Work

- Keep all project documentation discoverable through `docs/README.md` and prevent new root-level documentation sprawl.
- Keep `docs/governance/proposed-updates/` as a pending-only queue; archive applied proposals under `docs/archive/governance/proposed-updates/`.
- Keep `docs/work/todo.md` short and route confirmed work into the proper authority surface.
- For large AI-assisted tasks, use `docs/governance/development-document-lifecycle.md` to close out prompt, blueprint, verification, audit, and archive artifacts.
- Run `pnpm docs:check` after any documentation-related AI work; commit-time enforcement is active in this checkout via `.githooks/pre-commit`.
- Phase 3 implementation is active on branch `codex-phase-3-evolutionary-learning`: deterministic behavior analysis, pending workflow optimization suggestions, adoption tracking, observability boundary, server audit-window ingestion, and desktop HITL review are verified.

## Blockers

- Older Sprint E/F/G/H roadmap source files are still not present; `docs/roadmap-execution/README.md` now records this instead of leaving broken direct links.

## Next Action

Review and merge branch `codex-phase-3-evolutionary-learning`; keep `docs/plans/2026-05-09-phase-3-evolutionary-learning-ledger.md` synchronized if deployment or real-signal follow-up changes Phase 3 scope.
