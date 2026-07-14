# Attention Guidance Context

## Purpose

Attention Guidance interprets immutable workflow and attention facts to produce
reviewable help. Its calculations are pure and platform-independent so the
desktop app can decide when and how to present or deliver them.

## Glossary

- **Attention Estimate** — scored, confidence-bearing interpretation of an
  attention observation.
- **Guidance Suggestion** — immutable proposed assistance with evidence,
  provenance, review status, and a typed payload.
- **Behavior Pattern Report** — derived behavior summary over historical facts;
  it is not workflow state.
- **Reminder Policy** — pure decision about eligibility, quiet hours,
  frequency, and daily caps; it does not deliver a notification.

## Ownership

This context owns:

- attention estimates and confidence calculations;
- guidance suggestion and task-decomposition suggestion types;
- behavior analysis and release metrics;
- reminder cadence, quiet-hours, and budget policy.

## Invariants

- Guidance consumes immutable `WorkflowFacts`; it never mutates workflow state.
- Guidance does not read local storage, files, environment state, or platform APIs.
- Outputs are estimates or suggestions, not hidden commands.
- Uncertainty, evidence, provenance, and approval requirements remain explicit.

## Public Seam

Consumers import from `@attentionos/guidance`, whose public entrypoint is
`src/index.ts`. Private source subpaths are not a supported integration seam.

## Does Not Own

- workflow entities, hierarchy mutation, or state machines;
- persistence, notification delivery, Tauri APIs, or AI-provider calls;
- UI presentation or operating-system scheduling.

## Decisions

- [ADR 0001: Guidance is pure support over immutable facts](docs/adr/0001-guidance-facts-and-suggestions.md)
- Related system decision: [Two-context desktop architecture](../../docs/adr/0001-two-context-desktop-architecture.md)
