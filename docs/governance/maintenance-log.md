# Maintenance Log

## 2026-05-09 18:05 CST

- Task: implement Phase 3 evolutionary learning as a deterministic HITL loop.
- Files added: `docs/plans/2026-05-09-phase-3-evolutionary-learning-ledger.md`, `packages/core/src/learning-types.ts`, `packages/ai/src/evolution.ts`, `packages/ai/src/observability.ts`, `packages/storage/src/repositories/attention-observation.ts`, `apps/server/src/learning-runtime.ts`, `apps/desktop/src/storage/learning.ts`, desktop learning panels, `supabase/migrations/0005_phase3_learning.sql`, and `e2e/evolution-learning.spec.ts`.
- Files updated: `packages/core/src/ai-types.ts`, AI/storage/server/desktop exports and tests, `docs/README.md`, `docs/plans/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Evidence: Phase 2 contract required AI suggestions to stay human-reviewed; Phase 3 architecture called for behavior pattern analysis, workflow optimization suggestions, adoption tracking, and Langfuse-style observability.
- Verification in progress: targeted AI, storage, server, and desktop tests passed before final workspace verification.
- Tool note: several session workflow warnings claimed a recent tool may have failed; the associated commands returned output and were not blindly retried.

## 2026-05-09 14:53 CST

- Task: initial AttentionOS documentation-governance audit and conservative setup.
- Files read: `CLAUDE.md`, `package.json`, `apps/desktop/README.md`, `plans/phase1-deterministic-core.md`, `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md`, `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md`, `docs/plans/2026-03-21-attentionos-v2-architecture-design.md`, `docs/plans/2026-05-09-phase-2-completion-ledger.md`, `docs/plans/2026-05-09-phase-2-ai-reasoning-contract.md`, and the `doc-governance-maintainer` skill files.
- Commands used as evidence: `git status --short`, `rg --files`, `python3 -B /Users/yann.jy/.agents/skills/doc-governance-maintainer/scripts/audit_doc_system.py /Users/yann.jy/Desktop/AI/AttentionOS`, `python3 -B /Users/yann.jy/.agents/skills/doc-governance-maintainer/scripts/setup_doc_governance.py /Users/yann.jy/Desktop/AI/AttentionOS --dry-run`, `git branch --show-current`, `git log --oneline --decorate -n 20`, and targeted `rg`/`sed` reads.
- Failed or noisy attempts: broad `find . -maxdepth 3 -type d` produced dependency noise and was not repeated; `rg --files docs/roadmap-execution` failed because that referenced directory is absent, which is recorded as a stale-link finding.
- Files changed: `project-state.md`, `changelog.md`, `decisions/`, `sources-or-raw/`, `work/`, `archive/`, and `.ai/`.
- Evidence: structural audit reported missing `project-state.md`, `.ai`, `decisions`, `sources-or-raw`, `work`, and `archive`; setup dry-run proposed the same governance surface plus an AGENTS proposal.
- Proposals created: AGENTS documentation-governance block, README/legacy cleanup proposal, maintenance-trigger evolution proposal, and proposed authority-map decision.
- Risks: `project-state.md` is now a recovery surface, but the authority map remains proposed until accepted by the owner or encoded in repo instructions.

## 2026-05-09 15:30 CST

- Task: consolidate documentation entrypoints and remove duplicate plans directory.
- Files changed: `README.md`, `docs/README.md`, `docs/plans/README.md`, `docs/apps/desktop.md`, `docs/roadmap-execution/README.md`, `docs/plans/phase1-deterministic-core.md`, `apps/desktop/README.md`, `CLAUDE.md`, `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md`, `project-state.md`, `changelog.md`, `decisions/2026-05-09-doc-governance-authority-map.md`, and `.ai/*` governance reports/proposals.
- Evidence: user requested diagnosis and organization of all documentation content, called out two `plans` directories, and requested dependent references be updated.
- Dependency updates: path references now point to `docs/README.md`, `docs/plans/`, `docs/apps/desktop.md`, and `docs/roadmap-execution/README.md`.
- Risks: root governance surfaces still exist by design for recovery and AI maintenance; docs content should be discovered through `docs/README.md`.

## 2026-05-09 15:47 CST

- Task: move all documentation-related governance surfaces under `docs/` to reduce cognitive load.
- Files moved: `project-state.md` -> `docs/governance/project-state.md`; `changelog.md` -> `docs/governance/changelog.md`; `decisions/` -> `docs/decisions/`; `sources-or-raw/` -> `docs/sources-or-raw/`; `work/` -> `docs/work/`; `archive/` -> `docs/archive/`; `.ai/` -> `docs/governance/`.
- Dependency updates: updated README, docs index, project state, proposed AGENTS block, proposed decision, stale report, audit report, and evolution proposal references to the new `docs/` paths.
- Root exceptions: `README.md` remains as a thin platform entrypoint; `CLAUDE.md` remains as a tool-discovery instruction file.
- Code package docs: removed `apps/desktop/README.md`; durable desktop documentation now lives at `docs/apps/desktop.md`.

## 2026-05-09 16:06 CST

- Task: categorize remaining loose top-level files under `docs/`.
- Files moved: `docs/MASTER_PRODUCT_PLAN.zh-CN.md` -> `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md`; `docs/WORKFLOW_CANONICAL_MODEL.zh-CN.md` -> `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md`; `docs/user-original-long-prompts.zh-CN.md` -> `docs/sources-or-raw/user-original-long-prompts.zh-CN.md`; `docs/project-state.md` -> `docs/governance/project-state.md`; `docs/changelog.md` -> `docs/governance/changelog.md`.
- Files added: `docs/product/README.md`, `docs/workflow/README.md`.
- Dependency updates: updated docs index, project state, authority decision, workflow references, roadmap reference, and architecture tree/table references.
- Failed attempt: first workflow-file move failed because `docs/workflow/` was not ready before the parallel `mv`; the file was moved successfully after the directory existed.

## 2026-05-09 16:19 CST

- Task: apply accepted documentation authority map and future AI-generated-document workflow.
- Files added: `AGENTS.md`, `docs/governance/ai-generated-doc-workflow.md`, `docs/archive/plans/README.md`, `docs/archive/governance/proposed-updates/README.md`, and `docs/governance/proposed-updates/README.md`.
- Files moved: `docs/plans/phase1-deterministic-core.md` -> `docs/archive/plans/phase1-deterministic-core.md`; applied proposal files from `docs/governance/proposed-updates/` -> `docs/archive/governance/proposed-updates/`.
- Files updated: `README.md`, `CLAUDE.md`, `docs/README.md`, `docs/archive/README.md`, `docs/plans/README.md`, `docs/governance/README.md`, `docs/governance/project-state.md`, `docs/governance/stale-report.md`, `docs/governance/changelog.md`, and `docs/decisions/2026-05-09-doc-governance-authority-map.md`.
- Evidence: owner accepted the authority map and requested future AI-generated files to be routed, standardized, updated, and archived after implementation.
- Tool note: a session workflow warning reported a recent tool may have failed; the associated `rg`/`find` command returned output and was not retried blindly.
- Verification note: the shared audit script still reports expected docs-centered mapping warnings and archive-reference warnings; these are recorded in `docs/governance/stale-report.md`.

## 2026-05-09 16:40 CST

- Task: implement a single developer todo intake and AI development document lifecycle.
- Files added: `docs/work/todo.md`, `docs/governance/development-document-lifecycle.md`, `docs/decisions/2026-05-09-developer-todo-and-doc-lifecycle.md`, `docs/archive/work/README.md`, and `docs/archive/governance/README.md`.
- Files updated: `AGENTS.md`, `docs/README.md`, `docs/work/README.md`, `docs/governance/ai-generated-doc-workflow.md`, `docs/governance/project-state.md`, `docs/governance/changelog.md`, and `docs/governance/maintenance-log.md`.
- Evidence: owner requested direct implementation of a unique developer todo and a workflow that prevents AI-generated prompts, blueprints, verification notes, audits, and handoffs from accumulating as active context.
- Tool note: session workflow warnings reported recent tools may have failed; the associated parallel reads returned output and were not retried blindly.
- Verification note: initial audit flagged the new decision as missing a Rationale section; the decision was updated before final verification.

## 2026-05-09 16:50 CST

- Task: implement low-risk automatic documentation governance checks.
- Files added: `scripts/check-doc-governance.mjs`, `.githooks/pre-commit`, and `docs/governance/documentation-automation.md`.
- Files updated: `package.json`, `AGENTS.md`, `docs/README.md`, `docs/governance/ai-generated-doc-workflow.md`, `docs/governance/project-state.md`, `docs/governance/changelog.md`, and `docs/governance/maintenance-log.md`.
- Automation added: `pnpm docs:check` checks root/doc boundaries, duplicate todo files, generated-doc names, decision structure, code-adjacent docs, and resolved proposals left pending.
- Hook added: `.githooks/pre-commit` runs `pnpm docs:check` once `pnpm hooks:install` sets `core.hooksPath`.
- Safety boundary: automation reports or blocks low-risk drift only; accepting decisions, editing raw sources, modifying baselines, changing `AGENTS.md`, and archiving key current files still require explicit owner confirmation.
- Tool note: `find scripts ...` failed because `scripts/` did not exist yet; a later broad hook/config scan produced `.turbo` cache noise, so implementation used targeted file reads afterward.
- Adjustment: archive-reference warnings were removed from the custom check because archive references are part of the accepted AttentionOS lifecycle and made default automation too noisy.
- Installation: first `pnpm hooks:install` failed because sandboxed git could not lock `.git/config`; it was rerun with approval and succeeded. `git config --get core.hooksPath` now returns `.githooks`.
- Verification: `pnpm docs:check` passed cleanly after hook installation, `pnpm check` passed with 14 Turbo tasks cached/successful after running docs governance first, and `git diff --check` passed.
- Shared audit note: the external `audit_doc_system.py` still reports expected docs-centered mapping and archive-reference warnings; these remain documented as accepted AttentionOS-specific warnings.
