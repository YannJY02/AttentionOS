# Attention Workflow Context

## Purpose

Attention Workflow owns the user's durable workflow state and the rules that
change it. It provides deterministic operations and state machines for moving
through AttentionOS without depending on storage, UI, platform APIs, or
guidance policy.

## Glossary

- **Workflow Stage** — one of `ritual`, `overview`, or `execution`.
- **Hierarchy Layer** — one of `vision`, `area`, `goal`, `project`, or `task`.
- **Workflow Facts** — an immutable snapshot of workflow entities and audit
  entries exposed to Attention Guidance.
- **Task Decomposition Proposal** — workflow-owned shape for proposed task
  steps; provider provenance and approval handling stay outside this context.
- **Execution Role** — whether execution is planning the work or focusing on an
  accepted target.

## Ownership

This context owns:

- workflow types, constants, and validation;
- entity hierarchy operations and navigation;
- daily flow, ritual, meditation, task lifecycle, and execution state machines;
- the immutable `WorkflowFacts` seam used by Attention Guidance.

## Invariants

- Only Attention Workflow defines or mutates workflow state.
- The canonical stages are Ritual, Overview, and Execution.
- The canonical hierarchy is Vision, Area, Goal, Project, and Task.
- Workflow Facts are immutable at the Guidance boundary.
- AI provenance, review state, and side effects do not enter workflow machines.

## Public Seam

Consumers import from `@attentionos/workflow`, whose public entrypoint is
`src/index.ts`. Private source subpaths are not a supported integration seam.

## Does Not Own

- persistence, filesystem access, Tauri APIs, notifications, or AI providers;
- attention estimation, behavior interpretation, reminder policy, or guidance
  suggestions;
- UI rendering or platform delivery.

## Decisions

- [ADR 0001: Workflow is the sole state authority](docs/adr/0001-workflow-state-authority.md)
- Related system decision: [Two-context desktop architecture](../../docs/adr/0001-two-context-desktop-architecture.md)
