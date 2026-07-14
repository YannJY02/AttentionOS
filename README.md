# AttentionOS

AttentionOS is a local-first personal attention and workflow system for keeping
important work visible, reducing context-switching cost, and making AI guidance
explicit, reviewable, and reversible.

## Start Here

- [Context map](CONTEXT-MAP.md) — routes architecture and domain vocabulary.
- [Product baseline](docs/product/MASTER_PRODUCT_PLAN.zh-CN.md) — stable product principles and scope.
- [Workflow baseline](docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md) — canonical three-stage, five-layer workflow semantics.
- [System ADRs](docs/adr/) — durable cross-context decisions.
- [GitHub Issues](https://github.com/YannJY02/AttentionOS/issues) — the only active-work and requirement-gap tracker.

The repository does not maintain a parallel project-state file, plan ledger, or
todo document. Use Git history for historical implementation records and
GitHub Issues/Wayfinder for current work.

## Repository Shape

```text
apps/desktop/       macOS desktop delivery and concrete I/O adapters
packages/workflow/  workflow state, invariants, and state machines
packages/guidance/  pure attention estimates, suggestions, and reminder policy
docs/               durable ADRs, stable baselines, and immutable source evidence
```

## Development

The workspace is a pnpm/Turborepo monorepo and requires Node.js 22 or newer.

```bash
pnpm install
pnpm dev
pnpm test:run
pnpm build
pnpm check
pnpm lint
pnpm e2e
```

Useful focused checks:

```bash
pnpm docs:check
pnpm boundaries:check
```

Repo-local agent instructions live in [AGENTS.md](AGENTS.md).
