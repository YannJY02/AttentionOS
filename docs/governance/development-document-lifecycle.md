---
status: active
date: 2026-05-09
scope: doc-governance
---

# Development Document Lifecycle

Use this lifecycle to keep AI-assisted development recoverable without turning
every intermediate artifact into active context.

## Control Surfaces

| Surface | Path | Role | Authority |
|---|---|---|---|
| Developer intake | `docs/work/todo.md` | Daily ideas, rough requirements, small reminders | Non-authoritative queue |
| Current recovery | `docs/governance/project-state.md` | Current truth, blockers, active work, next action | Recovery authority |
| Active plans | `docs/plans/` | Confirmed plans, blueprints, phase ledgers, contracts | Depends on file status |
| Decisions | `docs/decisions/` | Durable accepted/proposed decisions | Accepted decisions outrank state |
| Changelog | `docs/governance/changelog.md` | Durable project-facing changes | Historical log |
| Maintenance log | `docs/governance/maintenance-log.md` | Governance maintenance evidence | Non-authoritative evidence |
| Archive | `docs/archive/` | Superseded or historical material | Historical context only |

`docs/work/todo.md` is useful only if it stays small. It should point to the
current work surfaces instead of duplicating their content.

## Lifecycle

1. Intake: capture rough ideas in `docs/work/todo.md`.
2. Exploration: answer inline when possible. If a reusable exploration note is needed, write `docs/work/YYYY-MM-DD-lower-kebab-slug-exploration.md`.
3. Confirmation: once the requirement is clear, keep the canonical prompt inline in the conversation unless it must survive handoff; if it must survive, write `docs/work/YYYY-MM-DD-lower-kebab-slug-prompt.md`.
4. Task sizing: run small tasks directly. For larger tasks, create or update a blueprint or plan under `docs/plans/`.
5. Execution: keep implementation state in the active plan or phase ledger. Do not create per-command log files.
6. Verification and audit: record small-task verification in the final response and maintenance log. For large tasks, add concise results to the active plan or create a temporary work note that is archived after closeout.
7. Closeout: update `project-state`, `changelog`, and the relevant README/index only when the change is durable. Archive temporary prompt, exploration, audit, or handoff files after the durable facts are synced.

## Artifact Rules

| Artifact | Default path | Keep active? | Closeout action |
|---|---|---|---|
| Daily idea or rough requirement | `docs/work/todo.md` | Yes, while untriaged | Promote, close, or delete after routing |
| Exploration note | `docs/work/YYYY-MM-DD-*-exploration.md` | Only during exploration | Summarize into plan/state, then archive or remove |
| Confirmed reusable prompt | `docs/work/YYYY-MM-DD-*-prompt.md` | Only until execution starts | Archive after implementation or fold into plan |
| Blueprint | `docs/plans/YYYY-MM-DD-*-blueprint.md` | Yes, if accepted as execution guide | Keep while current; archive when superseded |
| Implementation plan or phase ledger | `docs/plans/YYYY-MM-DD-*-plan.md` or `docs/plans/YYYY-MM-DD-*-ledger.md` | Yes, while guiding work | Keep as provenance or archive when superseded |
| Verification report | Active plan, final response, or `docs/work/YYYY-MM-DD-*-verification.md` | Only for large tasks | Sync durable facts, then archive |
| Audit report | Active plan, `docs/governance/stale-report.md`, or `docs/work/YYYY-MM-DD-*-audit.md` | Only while actionable | Convert findings to todo/plan/decision, then archive |
| Session handoff | `docs/governance/project-state.md` or active plan | Yes, only as compact summary | Replace previous handoff, do not accumulate transcripts |
| Decision | `docs/decisions/YYYY-MM-DD-*.md` | Yes | Keep; never archive accepted decisions without confirmation |

## Context Hygiene Rules

- One active work package per feature: one todo item, one active plan or blueprint, and one project-state pointer.
- Do not keep a prompt, blueprint, plan, audit, and verification report all active for the same item after closeout.
- Preserve raw evidence in `docs/sources-or-raw/`; summarize generated reasoning instead of preserving every intermediate draft.
- Before a context compact or handoff, write a concise next-action summary to `docs/governance/project-state.md` or the active plan.
- A new AI session should start from `docs/README.md`, then `docs/governance/project-state.md`, then only the active plan or todo item named there.
- Archive is for retrieval, not startup context. Do not scan `docs/archive/` unless a current file explicitly points there.

## Small vs Large Task Rule

Small task:

- No new plan file by default.
- Use `docs/work/todo.md` only if the item needs to survive the session.
- Record durable outcome in `changelog` or `project-state` only when it changes project state.

Large task:

- Create or update a plan/blueprint under `docs/plans/`.
- Keep prompt and exploration artifacts temporary under `docs/work/`.
- At closeout, sync durable facts and archive temporary generated artifacts.
