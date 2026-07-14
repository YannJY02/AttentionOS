---
status: accepted
date: 2026-07-14
---

# ADR 0001: Guidance is pure support over immutable facts

## Context

Attention estimation, behavioral analysis, AI suggestions, metrics, and
reminder cadence support workflow decisions but do not own the workflow itself.
Combining them with storage or mutation would obscure user control and make the
logic difficult to test.

## Decision

Attention Guidance consumes immutable facts and returns immutable estimates,
suggestions, reports, metrics, and reminder-policy decisions. It has no storage
or platform I/O and no authority to mutate workflow state. The desktop adapter
layer owns provider calls and delivery effects.

## Consequences

Guidance logic remains deterministic and directly testable. User review and
rollback boundaries stay visible. Notifications and AI calls can evolve without
changing the domain calculations they deliver.
