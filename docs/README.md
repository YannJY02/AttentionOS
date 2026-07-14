# AttentionOS Documentation

This directory contains durable decisions, stable baselines, immutable source
evidence, and agent-routing conventions. It does not track active work.

Start with the repository [Context Map](../CONTEXT-MAP.md). Use
[GitHub Issues](https://github.com/YannJY02/AttentionOS/issues) and the
[Wayfinder map](https://github.com/YannJY02/AttentionOS/issues/8) for current
tasks, requirement gaps, status, and sequencing.

## Durable Documentation

| Area | Path | Authority |
|---|---|---|
| System decisions | [adr/](adr/) | Accepted cross-context architecture and governance decisions |
| Product baseline | [product/MASTER_PRODUCT_PLAN.zh-CN.md](product/MASTER_PRODUCT_PLAN.zh-CN.md) | Stable product principles and scope |
| Workflow baseline | [workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md](workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md) | Canonical workflow language and semantics |
| Source evidence | [sources-or-raw/](sources-or-raw/) | Immutable original evidence; never rewrite |
| Agent routing | [agents/](agents/) | Repository-specific issue, label, and domain-document conventions |

Context-specific vocabulary and decisions live beside the owning context:

- [Attention Workflow context](../packages/workflow/CONTEXT.md)
- [Attention Guidance context](../packages/guidance/CONTEXT.md)

Historical plans, ledgers, reports, and governance logs remain available in Git
history. They are not duplicated as a current control plane.

Run `pnpm docs:check` after documentation changes.
