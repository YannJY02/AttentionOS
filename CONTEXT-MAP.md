# AttentionOS Context Map

This file routes domain understanding. It is not a project-status or task
tracker. Current work and requirement gaps live only in
[GitHub Issues](https://github.com/YannJY02/AttentionOS/issues), with repository
exploration coordinated by the [Wayfinder map](https://github.com/YannJY02/AttentionOS/issues/8).

## Domain Contexts

| Context | Context document | Owns | Context ADRs |
|---|---|---|---|
| Attention Workflow | [packages/workflow/CONTEXT.md](packages/workflow/CONTEXT.md) | Workflow state, types, invariants, hierarchy operations, and state machines | [packages/workflow/docs/adr/](packages/workflow/docs/adr/) |
| Attention Guidance | [packages/guidance/CONTEXT.md](packages/guidance/CONTEXT.md) | Pure attention estimates, guidance suggestions, behavior reports, metrics, and reminder policy | [packages/guidance/docs/adr/](packages/guidance/docs/adr/) |

`apps/desktop` is the delivery application, not a third domain context. Its
`src/adapters/` directory owns concrete local-storage, filesystem, Tauri, and AI
provider I/O and translates those effects into calls to the two contexts.

## Dependency Direction

```text
apps/desktop ───────► packages/workflow
       │
       └────────────► packages/guidance ─────► packages/workflow (immutable facts only)

packages/workflow  -X-> packages/guidance
packages/*         -X-> apps/desktop
```

The public package entrypoints are the only supported cross-context seams.

## System Documentation

- [System ADRs](docs/adr/) record accepted decisions spanning contexts.
- [Product baseline](docs/product/MASTER_PRODUCT_PLAN.zh-CN.md) defines stable product principles and scope.
- [Workflow baseline](docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md) defines canonical user-facing workflow semantics.
- [Raw sources](docs/sources-or-raw/) preserve immutable requirement evidence.
- [Agent routing](docs/agents/) defines repository-specific issue, label, and domain-document conventions.

Git history is the historical implementation record. Do not add a parallel
project-state file, plan ledger, todo list, changelog, or archive control plane.
