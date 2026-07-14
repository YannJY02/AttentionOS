---
status: active
date: 2026-05-09
scope: doc-governance
---

# Documentation Automation

This repo uses low-risk automation to keep documentation organized without
requiring the owner to mention document management in every prompt.

## What Runs Automatically

`pnpm docs:check` runs `scripts/check-doc-governance.mjs`.

It checks:

- Root documentation stays limited to `README.md` and `AGENTS.md`.
- `docs/` root contains only `docs/README.md`.
- There is exactly one developer todo file: `docs/work/todo.md`.
- Long-lived Markdown or text docs are not placed beside code in `apps/` or `packages/`.
- Generated operational docs in active governance routes use date-prefixed kebab-case names.
- Decision files include `status`, `date`, and a `Rationale` section.
- Resolved proposals are not left in `docs/governance/proposed-updates/`.

## Trigger Points

- `pnpm docs:check`: manual or AI-invoked documentation governance check.
- `pnpm check`: runs `pnpm docs:check` before the existing Turbo check.
- `.githooks/pre-commit`: Git hook that runs `pnpm docs:check` before commits once `core.hooksPath` is set to `.githooks`.

This checkout has `core.hooksPath` set to `.githooks`. For a fresh clone or a
reset Git config, install the Git hook once with:

```bash
pnpm hooks:install
```

## Safety Boundary

The automation is intentionally conservative. It may block or report obvious
documentation drift, but it does not automatically:

- Mark decisions accepted.
- Edit raw sources.
- Rewrite product or workflow baselines.
- Modify `AGENTS.md`.
- Archive accepted decisions or key current-state files.

Those high-authority actions still require explicit owner confirmation.
