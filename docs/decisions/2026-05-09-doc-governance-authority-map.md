---
status: accepted
date: 2026-05-09
scope: app
accepted_at: 2026-05-09 16:19 CST
---

# Decision: AttentionOS Documentation Authority Map

## Context

AttentionOS has strong planning documents, but it did not have a single recovery entrypoint or explicit governance map before this audit. Existing files make different authority claims, including product-level authority in `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md`, workflow semantic authority in `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md`, and architecture guidance in `docs/plans/2026-03-21-attentionos-v2-architecture-design.md`.

## Options

- Keep the current loose structure and rely on agents to infer authority from file names and recency.
- Accept a scoped authority map that separates product, workflow semantics, architecture drafts, implementation ledgers, raw sources, and AI maintenance files.
- Move all documentation into a new rigid structure immediately.

## Accepted Decision

Adopt the scoped authority map recorded in `docs/governance/project-state.md`:

- `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md` is the product and vision baseline.
- `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md` is the workflow semantic baseline.
- `docs/plans/2026-03-21-attentionos-v2-architecture-design.md` is a draft architecture reference unless explicitly approved.
- `docs/plans/` is the single plans directory.
- `docs/archive/plans/phase1-deterministic-core.md` is historical Phase 1 implementation provenance.
- `docs/plans/2026-05-09-phase-2-completion-ledger.md` and `docs/plans/2026-05-09-phase-2-ai-reasoning-contract.md` are Phase 2 implementation-state references.
- `docs/README.md` is the documentation entrypoint.
- `docs/governance/project-state.md` is the current recovery entrypoint.
- `docs/decisions/`, `docs/sources-or-raw/`, `docs/work/`, and `docs/archive/` are the governance directories.
- `docs/governance/` remains non-authoritative and may contain audits, maintenance logs, and proposals.
- `AGENTS.md` and `docs/governance/ai-generated-doc-workflow.md` define the required workflow for future AI-generated documentation: route, standardize naming, update indexes/state/logs, and archive applied generated artifacts.

## Rationale

This preserves the existing documents instead of moving key files prematurely. It also prevents future AI sessions from resolving conflicts by choosing the newest or longest document.

## Consequences

- Future agents have a clear recovery path.
- `AGENTS.md` now encodes the accepted governance rules for future AI sessions.
- Historical plans and applied generated proposals can be archived instead of competing with active plans or pending proposals.

## Evidence

- `CLAUDE.md`
- `package.json`
- `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md`
- `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md`
- `docs/plans/2026-03-21-attentionos-v2-architecture-design.md`
- `docs/archive/plans/phase1-deterministic-core.md`
- `docs/plans/2026-05-09-phase-2-completion-ledger.md`
- `docs/plans/2026-05-09-phase-2-ai-reasoning-contract.md`
- `docs/governance/project-state.md`
- `AGENTS.md`
- `docs/governance/ai-generated-doc-workflow.md`
- `git log --oneline --decorate -n 20`
