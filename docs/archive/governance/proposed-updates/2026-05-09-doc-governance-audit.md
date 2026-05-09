# Documentation Governance Audit

Generated: 2026-05-09 16:06 CST

## Current Structure

- Root instruction/reference: `CLAUDE.md`.
- Root package metadata: `package.json`.
- Product docs: `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md`, `docs/sources-or-raw/user-original-long-prompts.zh-CN.md`.
- Workflow semantic docs: `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md`.
- Architecture and implementation plans: `docs/plans/`.
- Desktop package docs: `docs/apps/desktop.md`.
- Governance surfaces added by this audit and then consolidated under `docs/`: `docs/governance/project-state.md`, `docs/governance/changelog.md`, `docs/decisions/`, `docs/sources-or-raw/`, `docs/work/`, `docs/archive/`, `docs/governance/`.

## Authority Map

| Scope | Current file | Status |
|---|---|---|
| Product and vision baseline | `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md` | Declares itself current unified baseline. |
| Workflow semantics | `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md` | Declares active source of truth. |
| Architecture | `docs/plans/2026-03-21-attentionos-v2-architecture-design.md` | Draft / pending approval. |
| Phase 1 historical implementation plan | `docs/plans/phase1-deterministic-core.md` | Historical Phase 1 plan, now consolidated into the single plans directory. |
| Phase 2 implementation state | `docs/plans/2026-05-09-phase-2-completion-ledger.md` | Current Phase 2 ledger. |
| Phase 2 AI contract | `docs/plans/2026-05-09-phase-2-ai-reasoning-contract.md` | Current implementation contract. |
| Current recovery state | `docs/governance/project-state.md` | Created by this audit; owner confirmation recommended. |
| AI maintenance | `docs/governance/*` | Non-authoritative. |

## Tool Findings

`audit_doc_system.py` reported:

| Severity | File | Finding |
|---|---|---|
| high | `project-state.md` | Missing current recovery entrypoint before this audit. |
| low | `sources-or-raw` | Recommended governance directory is missing. |
| low | `work` | Recommended governance directory is missing. |
| low | `archive` | Recommended governance directory is missing. |
| low | `.ai` | Recommended governance directory is missing. |
| low | `decisions` | Recommended governance directory is missing. |

`setup_doc_governance.py --dry-run` proposed the same structure plus `changelog.md`, `.ai/proposed-updates/`, `.ai/evolution-proposals/`, and an AGENTS governance proposal. The project owner later accepted a docs-centered layout, so those surfaces now live under `docs/`.

## Manual Findings

1. `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md` referenced historical `docs/roadmap-execution/...` files that are absent in this checkout.
2. `apps/desktop/README.md` was still the default Tauri + React template README.
3. `plans/phase1-deterministic-core.md` appeared historical but lived in a second root-level plans directory and contained a mix of unchecked tasks and checked exit criteria.
4. `docs/plans/2026-03-21-attentionos-v2-architecture-design.md` says `状态：待审批`, while `CLAUDE.md` says it is required reading before development. This can be compatible, but the relationship should be explicit.

## Repairs Applied

- Created `project-state.md` with evidence-backed current truth and active work.
- Created `changelog.md` for durable project documentation changes.
- Created governance directories and README files for `decisions/`, `sources-or-raw/`, `work/`, and `archive/`.
- Created `.ai/maintenance-log.md` and `.ai/stale-report.md`.
- Created a proposed decision for the authority map.
- Created proposed updates instead of directly editing `AGENTS.md` or README authority claims.
- Consolidated root `plans/phase1-deterministic-core.md` into `docs/plans/phase1-deterministic-core.md`.
- Added `docs/README.md`, `docs/plans/README.md`, `docs/apps/desktop.md`, and `docs/roadmap-execution/README.md`.
- Removed `apps/desktop/README.md` after moving its durable content to `docs/apps/desktop.md`.
- Moved root governance surfaces under `docs/`: `docs/governance/project-state.md`, `docs/governance/changelog.md`, `docs/decisions/`, `docs/sources-or-raw/`, `docs/work/`, `docs/archive/`, and `docs/governance/`.
- Categorized loose top-level docs into `docs/product/`, `docs/workflow/`, `docs/sources-or-raw/`, and `docs/governance/`, leaving only `docs/README.md` at the top of `docs/`.

## Confirmation Needed

1. Accept, revise, or reject `docs/decisions/2026-05-09-doc-governance-authority-map.md`.
2. Decide whether to create repo-local `AGENTS.md` from `docs/governance/proposed-updates/2026-05-09-agents-doc-governance-block.md`.
3. Decide whether missing legacy Sprint files should be restored under `docs/roadmap-execution/`.
4. Decide whether `docs/plans/phase1-deterministic-core.md` should remain historical in-place or move to archive later.
