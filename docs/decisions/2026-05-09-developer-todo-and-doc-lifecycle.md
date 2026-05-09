---
status: accepted
date: 2026-05-09
scope: doc-governance
accepted_at: 2026-05-09 16:40 CST
---

# Decision: Developer Todo and Documentation Lifecycle

## Context

The owner wants a single developer todo surface for daily thoughts and early
development guidance. The owner also wants the AI-assisted workflow to preserve
useful context without accumulating prompt, blueprint, audit, and verification
documents into a confusing active document set.

## Accepted Decision

- Use `docs/work/todo.md` as the only developer todo/intake queue.
- Do not create root-level `todo.md`.
- Treat `docs/work/todo.md` as non-authoritative intake, not as current truth,
  an implementation plan, or an accepted decision.
- Use `docs/governance/development-document-lifecycle.md` as the active lifecycle
  rule for AI-generated prompts, explorations, blueprints, plans, verification
  notes, audits, handoffs, and archives.
- Keep generated intermediate artifacts active only while they are useful for
  the current task; summarize durable facts into the correct authority surface
  and archive the rest.

## Rationale

A single intake queue reduces cognitive load, but only if it remains a queue.
Putting the todo file under `docs/work/` preserves the repo rule that long-lived
documentation lives under `docs/`, while the lifecycle document prevents prompts,
blueprints, audits, and verification notes from becoming parallel active truths.

## Boundary

- `docs/work/todo.md`: ideas and early task intake.
- `docs/governance/project-state.md`: current recovery state, blockers, active work, and next action.
- `docs/plans/`: confirmed plans, blueprints, contracts, and ledgers.
- `docs/decisions/`: durable decisions.
- `docs/archive/`: historical and superseded generated artifacts.

## Consequences

- Future AI sessions have one obvious place for untriaged developer tasks.
- `todo.md` cannot silently become a second project state or third plans system.
- Large tasks can preserve handoff context without keeping every intermediate
  generated document active forever.
- Archive can store history without being part of the default startup context.

## Evidence

- Owner request on 2026-05-09 for a unique developer todo and a cleaner
  AI-generated-document lifecycle.
- `AGENTS.md`
- `docs/governance/ai-generated-doc-workflow.md`
- `docs/governance/project-state.md`
