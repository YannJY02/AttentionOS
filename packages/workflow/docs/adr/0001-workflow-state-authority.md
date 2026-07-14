---
status: accepted
date: 2026-07-14
---

# ADR 0001: Workflow is the sole state authority

## Context

Workflow entities, hierarchy operations, and state transitions previously
appeared across overlapping packages. Supporting logic could therefore drift
from the state model or mutate it through an unclear seam.

## Decision

Attention Workflow is the sole domain owner and mutator of workflow state. It
exposes immutable `WorkflowFacts` for supporting contexts and keeps state
changes inside deterministic operations and state machines. External adapters
perform I/O and invoke the public Workflow API; they do not redefine workflow
rules.

## Consequences

Workflow behavior has one vocabulary and one mutation authority. Attention
Guidance can analyze facts but cannot write back to workflow state. New workflow
invariants belong here and require targeted regression tests.
