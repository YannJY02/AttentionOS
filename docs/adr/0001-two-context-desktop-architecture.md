---
status: accepted
date: 2026-07-14
---

# ADR 0001: Two-context desktop architecture

## Context

The repository previously split behavior across overlapping packages and
runtime surfaces. Ownership and dependency direction were hard to identify,
making changes more expensive and allowing multiple modules to describe or
mutate the same concepts.

Wayfinder established two real domain boundaries: Attention Workflow and
Attention Guidance. Concrete platform effects are delivery concerns rather than
a third domain.

## Decision

- `packages/workflow` is the sole owner and mutator of workflow state.
- `packages/guidance` consumes immutable `WorkflowFacts` and returns pure
  estimates, suggestions, reports, metrics, and reminder policy.
- Concrete storage, filesystem, Tauri, notification, and AI-provider I/O lives
  behind explicit adapters in `apps/desktop/src/adapters`.
- Desktop may depend on Workflow and Guidance. Guidance may depend on Workflow's
  public facts. Workflow must not depend on Guidance or desktop, and packages
  must not import desktop internals.
- Cross-context imports use package public entrypoints.

This decision records the owner-accepted outcome of
[Wayfinder issue 8](https://github.com/YannJY02/AttentionOS/issues/8) and its
architecture migration tickets.

## Consequences

There are exactly two domain `CONTEXT.md` files. The desktop remains one app
with explicit adapters, not a collection of invented ports or additional
contexts. Automated boundary checks reject removed legacy packages, private
subpath imports, and reverse dependencies.
