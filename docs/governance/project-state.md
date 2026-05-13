# Project State

Updated: 2026-05-13 11:41 CST
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
- Phase 3 was merged and pushed to `origin/main` at commit `ebda370` (`merge: phase 3 evolutionary learning`).
- Phase 4 has a draft intake at `docs/plans/2026-05-09-phase-4-intake.md`; it is not an accepted implementation contract yet.
- Experience alignment now has a draft blueprint at `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`; it requires exact `/gstack` skill gates before implementation and does not authorize code changes by itself.
- Phase 0 `/gstack-investigate` evidence freeze for experience alignment is complete at `docs/plans/2026-05-10-attentionos-experience-alignment-evidence-ledger.md`; it identifies the root cause as a missing product-to-frontend experience contract plus a concrete fixed-shell mobile layout bug.
- Phase 1 `/gstack-design-consultation` experience contract is complete at `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`.
- Phase 2 `/gstack-plan-design-review` is complete under owner-approved normal-chat fallback, with D1-D5 recorded in `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`: mobile bottom stage navigation with top layer context, `/execution/plan` plus `/execution/focus` subroutes, neutral default Ritual language with configurable prayer/dedication, timeline-first Vision, and AI suggestions grouped by workflow stage/current mode.
- Phase 3 `/gstack-plan-eng-review` is complete under owner-approved normal-chat fallback, with E1-E5 recorded in `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`: add `executionModeMachine`, let URL request and machine validate mode, keep task lifecycle separate with a migration path, require the full contract test set, and implement as one complete slice.
- The experience-alignment implementation slice is implemented and QA-verified as of 2026-05-13 08:09 CST. The completed slice covers `executionModeMachine`, `/execution/plan`, `/execution/focus`, mobile bottom stage navigation, Plan/Focus AI boundaries, active task lifecycle preservation across Plan/Focus, and contract tests.
- `/gstack-qa-only` produced `.gstack/qa-reports/qa-report-127-0-0-1-1420-2026-05-13.md` and `.gstack/projects/YannJY02-AttentionOS/yann.jy-main-test-outcome-20260513-0749.md`; no QA defects were found.
- Final verification passed on 2026-05-13 08:09 CST: `pnpm docs:check`, `pnpm check`, `pnpm test:run`, `pnpm lint`, `pnpm build`, `pnpm e2e`, and `git diff --check`.
- Phase 6 `/gstack-context-save` has saved the current experience-alignment handoff at `.gstack/projects/YannJY02-AttentionOS/checkpoints/20260510-220217-attentionos-experience-alignment-gates.md`; `/gstack-context-restore` is only needed in a future resume context.
- Ritual semantic correction Slice 2 has an implementation ledger at `docs/plans/2026-05-13-attentionos-ritual-semantic-correction-slice.md`.
- Ritual semantic correction is implemented and `/gstack-qa-only` verified on branch `codex-experience-ritual-semantics`: Ritual now uses intention-led neutral copy, configurable local intention/dedication wording, user-facing breath labels, and attention-first shell footer copy while preserving the existing Ritual -> Overview flow.
- `/gstack-qa-only` produced `.gstack/qa-reports/qa-report-ritual-semantics-2026-05-13.md`; no QA defects, console errors, or page errors were found in the final Ritual QA pass.
- Final Ritual slice verification passed on 2026-05-13 09:10 CST: `pnpm docs:check`, `pnpm check`, `pnpm test:run` with 200 tests, `pnpm lint`, `pnpm build`, `pnpm e2e` with 3 Chromium tests, and `git diff --check`.
- Overview read-only scan Slice 3 has an implementation ledger at `docs/plans/2026-05-13-attentionos-overview-readonly-scan-slice.md`.
- Overview read-only scan is implemented and `/gstack-qa-only` verified on branch `codex-experience-ritual-semantics`: Overview now leads with layer scan context, renders a timeline-first Vision panel before learning metrics, preserves read-only controls, and keeps the task-layer bridge into Execution.
- `/gstack-qa-only` produced `.gstack/qa-reports/qa-report-overview-readonly-scan-2026-05-13.md`; no QA defects, console errors, or page errors were found in the Overview QA pass.
- Final Overview slice verification passed on 2026-05-13 09:31 CST: `pnpm docs:check`, `pnpm check`, `pnpm test:run` with 200 tests, `pnpm lint`, `pnpm build`, `pnpm e2e` with 3 Chromium tests, and `git diff --check`.
- AI HITL clarity Slice 5 has an implementation ledger at `docs/plans/2026-05-13-attentionos-ai-hitl-clarity-slice.md`.
- AI HITL clarity is implemented and `/gstack-qa-only` verified on branch `codex-experience-ritual-semantics`: Execution Plan now groups suggestions under human review lanes, task decomposition supports explicit rejection without creating tasks, workflow optimization review copy no longer implies automatic mutation, and Focus mode keeps broad AI queues hidden.
- `/gstack-qa-only` produced `.gstack/qa-reports/qa-report-ai-hitl-clarity-2026-05-13.md`; no QA defects, console errors, or page errors were found in the AI HITL QA pass.
- Final AI HITL slice verification passed on 2026-05-13 09:48 CST: `pnpm docs:check`, `pnpm check`, `pnpm test:run` with 206 tests, `pnpm lint`, `pnpm build`, `pnpm e2e` with 3 Chromium tests, and `git diff --check`.
- Integration polish and regression Slice 6 has an implementation ledger at `docs/plans/2026-05-13-attentionos-integration-polish-regression-slice.md`.
- Integration polish and regression is implemented and `/gstack-qa-only` verified on branch `codex-experience-ritual-semantics`: no tracked application-code changes were required, the primary Ritual -> Overview -> Execution flow passed, Overview remained read-only, Focus hid broad review lanes, and no old scaffold copy was found in the primary flow.
- `/gstack-qa-only` produced `.gstack/qa-reports/qa-report-integration-regression-2026-05-13.md`; no QA defects, console errors, or page errors were found in the final integration QA pass.
- Final integration slice verification passed on 2026-05-13 09:57 CST: `pnpm docs:check`, `pnpm check`, `pnpm test:run` with 206 tests, `pnpm lint`, `pnpm build`, `pnpm e2e` with 3 Chromium tests, and `git diff --check`.
- Experience alignment was fast-forward merged into local `main` at `faee10d` on 2026-05-13 11:41 CST. Local `main` is ahead of `origin/main` by the four experience-alignment closeout commits and has not been pushed yet.
- Final `/gstack-context-save` closeout checkpoint was saved at `.gstack/projects/YannJY02-AttentionOS/checkpoints/20260513-113528-final-experience-alignment-branch-closeout.md`.

## Active Work

- Keep all project documentation discoverable through `docs/README.md` and prevent new root-level documentation sprawl.
- Keep `docs/governance/proposed-updates/` as a pending-only queue; archive applied proposals under `docs/archive/governance/proposed-updates/`.
- Keep `docs/work/todo.md` short and route confirmed work into the proper authority surface.
- For large AI-assisted tasks, use `docs/governance/development-document-lifecycle.md` to close out prompt, blueprint, verification, audit, and archive artifacts.
- Run `pnpm docs:check` after any documentation-related AI work; commit-time enforcement is active in this checkout via `.githooks/pre-commit`.
- Keep the experience-alignment blueprint and slice ledgers as closeout evidence for the merged frontend/product-experience work.
- Do not expand this slice into Phase 4 protocol, SDK, MCP, plugin, or offline-sync work without a separate accepted contract.

## Blockers

- Older Sprint E/F/G/H roadmap source files are still not present; `docs/roadmap-execution/README.md` now records this instead of leaving broken direct links.
- Experience-alignment implementation, `/gstack-qa-only`, final workspace verification, and local `main` merge are complete.
- Phase 4 scope and security decisions are not finalized; do not start broad MCP, SDK, plugin, or offline-sync implementation before a Phase 4 contract is accepted or explicitly narrowed by the owner.

## Next Action

Ask the owner whether to push local `main` to `origin/main`, create a PR instead, or keep the merge local for more manual testing. Also resolve the unrelated `.gitignore` working-tree change for repo-local gstack artifacts if the owner wants a clean tree.
