---
status: accepted
date: 2026-07-14
---

# ADR 0002: Matt documentation control plane

## Context

The repository accumulated project-state files, plan ledgers, todo documents,
decision directories, changelogs, maintenance logs, and archives. Although each
artifact had a local purpose, together they formed a parallel work tracker and
made it difficult to know which current-state description was authoritative.

## Decision

- GitHub Issues and the Wayfinder map are the sole active-work,
  requirement-gap, status, and sequencing authority.
- `CONTEXT-MAP.md` routes domain understanding to context-local `CONTEXT.md`
  files and ADRs.
- Cross-context decisions live in `docs/adr/`; context decisions live beside
  the owning context under `docs/adr/`.
- Stable product and workflow baselines remain under `docs/product/` and
  `docs/workflow/`. Immutable original evidence remains under
  `docs/sources-or-raw/`.
- Git history preserves superseded plans, ledgers, reports, logs, and prior
  governance. They do not remain as a second current control plane.

This decision records the owner-accepted documentation target from
[Wayfinder issue 8](https://github.com/YannJY02/AttentionOS/issues/8) and
[migration ticket 20](https://github.com/YannJY02/AttentionOS/issues/20).

## Consequences

Agents and developers no longer update a project-state document, plan ledger,
todo file, changelog, maintenance log, or documentation archive after normal
work. Durable architectural knowledge is smaller and closer to its owner;
current work is visible in one tracker; historical implementation detail stays
recoverable through Git.
