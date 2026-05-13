# Maintenance Log

## 2026-05-13 09:28 CST

- Task: implement and QA the Overview read-only scan slice.
- Files added: `apps/desktop/src/pages/overview/VisionOverviewPanel.tsx` and `.gstack/qa-reports/qa-report-overview-readonly-scan-2026-05-13.md`.
- Files updated: `apps/desktop/src/pages/OverviewPage.tsx`, `apps/desktop/src/pages/OverviewPage.test.tsx`, `apps/desktop/src/storage/hierarchy.ts`, `e2e/smoke.spec.ts`, `e2e/evolution-learning.spec.ts`, the Overview slice ledger, blueprint, and governance/index documents.
- Evidence: Slice 3 in `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, D4 in `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`, and read-only explorer review of current Overview implementation.
- Verification: targeted Overview and hierarchy tests passed with 4 tests; targeted Biome check passed; targeted `git diff --check` passed; `/gstack-qa-only` Overview click test passed with no console or page errors; final `pnpm docs:check`, `pnpm check`, `pnpm test:run` with 200 tests, `pnpm lint`, `pnpm build`, `pnpm e2e` with 3 Chromium tests, and `git diff --check` all passed.
- Tool notes: the first Overview QA script run failed because direct `node` execution could not resolve the pnpm-managed Playwright package; the import was corrected to `@playwright/test` before rerunning. A multi-file documentation read produced output despite a session workflow warning and was not retried blindly. The first full `pnpm test:run` found stale test assertions for the previous default hierarchy labels; tests were updated to the new user-facing labels. The first `pnpm e2e` attempt failed because sandbox permissions blocked the local Playwright web server from listening on `127.0.0.1:1420`; the same command passed after local server permission was granted.

## 2026-05-13 09:15 CST

- Task: run `/gstack-autoplan` for the Overview read-only scan slice.
- Files added: `docs/plans/2026-05-13-attentionos-overview-readonly-scan-slice.md`.
- Files updated: `docs/README.md`, `docs/plans/README.md`, `docs/governance/project-state.md`, `docs/governance/changelog.md`, and this maintenance log.
- Evidence: Slice 3 in `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, D4 in `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`, and read-only explorer review of current Overview implementation.
- Boundary: this is an Overview product-experience slice only; it does not start Phase 4 protocol, SDK, MCP, plugin, or offline-sync implementation.

## 2026-05-13 09:06 CST

- Task: implement and QA the experience-alignment Ritual semantic correction slice.
- Files added: `docs/plans/2026-05-13-attentionos-ritual-semantic-correction-slice.md`, `apps/desktop/src/storage/ritualCopy.ts`, and `.gstack/qa-reports/qa-report-ritual-semantics-2026-05-13.md`.
- Files updated: `apps/desktop/src/pages/RitualPage.tsx`, `apps/desktop/src/pages/ritual/MeditationStep.tsx`, `apps/desktop/src/pages/ritual/DedicationStep.tsx`, `apps/desktop/src/pages/RitualPage.test.tsx`, `apps/desktop/src/components/layout/Shell.tsx`, `apps/desktop/src/App.test.tsx`, and governance/index documents.
- Evidence: Slice 2 in `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`; D3 Ritual language decision in `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`; explorer review of existing Ritual copy; Playwright QA screenshots under `.gstack/qa-reports/ritual-semantics-20260513/screenshots/`.
- Verification: targeted `pnpm test:run apps/desktop/src/pages/RitualPage.test.tsx apps/desktop/src/App.test.tsx` passed with 7 tests; `/gstack-qa-only` Ritual click test passed with no console or page errors; final `pnpm docs:check`, `pnpm check`, `pnpm test:run` with 200 tests, `pnpm lint`, `pnpm build`, `pnpm e2e` with 3 Chromium tests, and `git diff --check` all passed.
- Tool notes: `gh repo view` failed because network access to `api.github.com` was unavailable, so the base branch fell back to local `origin/HEAD`; gstack browse failed to start its service because it reported no available port, so QA continued with project-installed Playwright; the first Playwright launch failed under sandbox permissions and passed after escalation; the first QA run found shell footer scaffold copy, which was fixed before the final passing QA run.

## 2026-05-13 07:49 CST

- Task: implement and QA the experience-alignment Execution Plan/Focus slice.
- Files added: `packages/machines/src/execution-mode.ts`, `packages/machines/__tests__/execution-mode.test.ts`, `.gstack/qa-reports/qa-report-127-0-0-1-1420-2026-05-13.md`, `.gstack/qa-reports/baseline.json`, and `.gstack/projects/YannJY02-AttentionOS/yann.jy-main-test-outcome-20260513-0749.md`.
- Files updated: `apps/desktop/src/App.tsx`, `apps/desktop/src/components/layout/Shell.tsx`, `apps/desktop/src/hooks/useRouteSync.ts`, `apps/desktop/src/pages/ExecutionPage.tsx`, related RTL/e2e tests, `biome.json`, and governance/index documents.
- Verification: machines targeted tests passed with 62 tests, desktop targeted tests passed with 29 tests, `pnpm e2e` passed with 3 Chromium tests, and final `pnpm docs:check`, `pnpm check`, `pnpm test:run` with 199 tests, `pnpm lint`, `pnpm build`, `pnpm e2e`, and `git diff --check` all passed.
- Review fix: diff review found that task lifecycle state would reset when moving Focus -> Plan -> Focus. `ActiveTaskSession` now stays mounted across `/execution/*` mode switches, and `apps/desktop/src/pages/ExecutionPage.test.tsx` covers this regression.
- Tool notes: the first machines/desktop targeted run exposed an unsupported XState `and` guard and an infinite RESTORE_MODE render loop; both were fixed before rerun. The first `pnpm e2e` attempt failed because sandbox permissions blocked the local Vite dev server from listening on `127.0.0.1:1420`; the same command passed after local server permission was granted. `/gstack-qa-only` preamble initially attempted to write global `~/.gstack`; subsequent QA artifacts were written under repo-local `.gstack`.

## 2026-05-13 07:11 CST

- Task: complete Phase 2 `/gstack-plan-design-review` for AttentionOS experience alignment using owner-approved normal-chat fallback for `AskUserQuestion`.
- Files updated: `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`, `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, `docs/plans/2026-05-10-attentionos-experience-alignment-review-gate-blocker.md`, `docs/plans/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Decisions accepted: D1 mobile bottom stage navigation with top layer context; D2 `/execution/plan` and `/execution/focus` subroutes; D3 neutral default Ritual language with configurable prayer/dedication; D4 timeline-first Vision; D5 AI suggestions grouped by workflow stage/current mode.
- Boundary: no application code was changed, no visual implementation was accepted, and `/gstack-autoplan` remains blocked until Phase 3 `/gstack-plan-eng-review` completes.

## 2026-05-13 07:33 CST

- Task: complete Phase 3 `/gstack-plan-eng-review` for AttentionOS experience alignment using owner-approved normal-chat fallback for `AskUserQuestion`.
- Files added: `.gstack/projects/YannJY02-AttentionOS/yann.jy-main-eng-review-test-plan-20260513-0733.md`.
- Files updated: `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`, `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, `docs/plans/2026-05-10-attentionos-experience-alignment-review-gate-blocker.md`, `docs/plans/README.md`, `docs/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Decisions accepted: E1 add `executionModeMachine`; E2 URL requests mode and machine validates; E3 keep task lifecycle separate with future migration path; E4 require full contract test scope; E5 implement one complete slice.
- Boundary: no application code was changed; `/gstack-autoplan` is now the next gate before implementation.

## 2026-05-13 07:38 CST

- Task: run Phase 4 `/gstack-autoplan` for AttentionOS experience alignment.
- Files added: `docs/plans/2026-05-13-attentionos-experience-alignment-implementation-slice.md`, `.gstack/projects/YannJY02-AttentionOS/main-autoplan-restore-20260513-073752.md`, and `.gstack/projects/YannJY02-AttentionOS/yann.jy-main-autoplan-test-plan-20260513-0738.md`.
- Files updated: `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`, `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, `docs/plans/README.md`, `docs/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Output: one complete implementation slice covering `executionModeMachine`, `/execution/plan`, `/execution/focus`, mobile bottom stage navigation, Plan/Focus AI boundaries, and full contract tests.
- Boundary: no application code was changed; next coding phase should implement the slice and then run `/gstack-qa-only`.

## 2026-05-10 22:02 CST

- Task: invoke Phase 2 `/gstack-plan-design-review` and Phase 3 `/gstack-plan-eng-review` for AttentionOS experience alignment.
- Files added: `docs/plans/2026-05-10-attentionos-experience-alignment-review-gate-blocker.md` and `.gstack/projects/YannJY02-AttentionOS/checkpoints/20260510-220217-attentionos-experience-alignment-gates.md`.
- Files updated: `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, `docs/plans/README.md`, `docs/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Evidence: both gstack review skills require `AskUserQuestion` for non-trivial review findings; the current Codex Desktop tool context has no callable `AskUserQuestion` variant. `/gstack-context-save` then captured the blocked handoff state.
- Boundary: did not fabricate design or engineering review results, did not edit application code, and did not start `/gstack-autoplan` implementation slicing.
- Tool note: session workflow warnings reported recent reads may have failed; the associated commands returned output and were not blindly retried.

## 2026-05-10 22:01 CST

- Task: execute Phase 1 `/gstack-design-consultation` for AttentionOS experience alignment.
- Files added: `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`.
- Files updated: `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, `docs/plans/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Evidence: Phase 0 evidence ledger, product baseline, workflow semantic baseline, original user long prompt, and current UI capture findings.
- Boundary: wrote a stage-specific experience contract under `docs/plans/`; did not create root `DESIGN.md`, generate final visual assets, or implement code.

## 2026-05-10 22:00 CST

- Task: execute Phase 0 `/gstack-investigate` for AttentionOS experience alignment.
- Files added: `docs/plans/2026-05-10-attentionos-experience-alignment-evidence-ledger.md`.
- Files updated: `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, `docs/plans/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Evidence: refreshed desktop and mobile UI captures under `/private/tmp/attentionos-ui-audit/`; product baseline, workflow baseline, Phase 2/3/4 plan surfaces, desktop UI code, XState machines, and prior project memory.
- Root-cause hypothesis: the architecture direction is mostly intact, but the frontend lacks an explicit experience contract, causing scaffold/demo patterns and a fixed desktop shell to dominate the user experience.
- Tool notes: a mobile Execution flow capture failed waiting for `Start execution`, so `/execution` was captured directly; two multi-file `nl` attempts failed on macOS and were replaced with targeted single-file reads.

## 2026-05-10 18:05 CST

- Task: create a draft AttentionOS experience-alignment blueprint with exact `/gstack` skill gates per phase.
- Files added: `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`.
- Files updated: `docs/plans/README.md`, `docs/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Evidence: prior UI/product diagnosis identified an experience contract gap; product baseline requires workflow-first and attention-first UI; workflow baseline fixes `ritual / overview / execution`; Phase 4 intake remains draft and non-expansive.
- Boundary: no code implementation was started; the blueprint does not authorize Phase 4 protocol work or root-level plan creation.

## 2026-05-09 19:45 CST

- Task: close the post-merge Phase 3 documentation state and prepare Phase 4 intake.
- Files added: `docs/plans/2026-05-09-phase-4-intake.md`.
- Files updated: `docs/governance/project-state.md`, `docs/README.md`, `docs/plans/README.md`, `docs/governance/changelog.md`, and this maintenance log.
- Evidence: `main` is synchronized with `origin/main` at `ebda370` (`merge: phase 3 evolutionary learning`); Phase 3 verification was already recorded in the Phase 3 ledger.
- Scope boundary: Phase 4 is framed as draft intake only. It is not marked as an accepted implementation contract, and broad MCP, SDK, plugin, or offline-sync work remains blocked until the first slice is narrowed.
- Tool note: a session workflow warning reported the previous `tail` read may have failed; the command returned output and was not blindly retried.

## 2026-05-09 19:30 CST

- Task: close Phase 3 merge-readiness gaps after parallel agent review.
- Files updated: `apps/server/src/learning-runtime.ts`, `packages/storage/src/repositories/audit.ts`, server/storage/desktop regression tests, `docs/plans/2026-05-09-phase-3-evolutionary-learning-ledger.md`, `docs/governance/project-state.md`, `docs/governance/changelog.md`, and this maintenance log.
- Fix: server-backed learning analysis now reads audit events for the learning window instead of passing an empty audit list into `analyzeBehaviorPatterns`.
- Coverage added: audit-window ingestion regression, `AuditRepository.findWindow`, workflow optimization storage rejection, and desktop HITL rejection.
- Verification: targeted affected tests passed with 4 files and 14 tests; full `pnpm check`, `pnpm test:run` (42 files, 190 tests), `pnpm lint`, `pnpm build`, and `pnpm e2e` (2 Chromium tests) passed.
- Tool note: a failed read of `packages/core/src/audit-types.ts` showed the file does not exist; the real audit types were then located with `rg` in `packages/core/src/v2-types.ts`.

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
