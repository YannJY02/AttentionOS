# Domain Docs

AttentionOS does not use a root `CONTEXT.md` as the domain authority. Use the
governed documentation map instead.

## Layout

This is a single product context with multiple governed source surfaces:

1. `docs/README.md` — canonical documentation entrypoint.
2. `docs/governance/project-state.md` — current recovery state, active work,
   blockers, and next action.
3. `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md` — product and vision baseline.
4. `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md` — workflow semantic
   baseline.
5. `docs/decisions/` — accepted decisions.
6. `docs/plans/` — active plans, contracts, ledgers, and draft references.
7. `docs/sources-or-raw/` — read-only source evidence.

## Consumer Rules

- Follow the authority order in `AGENTS.md` when documents disagree.
- Prefer current product/workflow baselines and accepted decisions over old
  roadmap or archive material.
- Treat `docs/plans/2026-03-21-attentionos-v2-architecture-design.md` as a
  draft architecture reference, not an accepted override.
- Do not rewrite raw sources under `docs/sources-or-raw/`.
- Route new long-lived documentation through `docs/` and update indexes,
  project state, changelog, and maintenance log when required by governance.
