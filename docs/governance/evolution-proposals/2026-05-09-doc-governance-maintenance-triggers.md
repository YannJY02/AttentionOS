---
status: proposed
date: 2026-05-09
scope: doc-governance
---

# Evolution Proposal: Documentation Maintenance Triggers

## Trigger

The project lacked a recovery entrypoint and governance surfaces. The owner asked for systematic documentation management for a personal software project.

## Observed Pattern

- Current truth was spread across product docs, workflow docs, architecture drafts, and phase ledgers.
- Legacy references existed without a present target directory.
- There was no repo-local governance instruction file accepted for future sessions.

## Proposed Change

Use explicit triggers for documentation maintenance:

- On user-invoked session close: update `docs/governance/project-state.md`, append `docs/governance/maintenance-log.md`, and draft decisions/proposals only when needed.
- Weekly or manual stale audit: run the skill-bundled `audit_doc_system.py`, update `docs/governance/stale-report.md`, and create proposals only.
- Before a release/merge: review `git diff`, ensure README claims match code/tests, and verify no authority files were silently changed.

## Affected Files

- `docs/governance/project-state.md`
- `docs/governance/maintenance-log.md`
- `docs/governance/stale-report.md`
- `docs/governance/proposed-updates/`
- `docs/governance/evolution-proposals/`
- Optional future `AGENTS.md`

## Risks

- Too much automation could create noise or turn proposals into pseudo-authority.
- Updating `docs/governance/project-state.md` automatically could launder uncertain session notes into current truth.

## Validation Plan

- Keep automation writes limited to `docs/governance/*` unless the user explicitly asks for session close.
- Re-run the structural audit after each governance change.
- Require user confirmation before editing `AGENTS.md`, accepting decisions, moving files to `docs/archive/`, or changing README authority claims.

## Confirmation Needed

- Whether to install a repo-local audit script.
- Whether to create a Codex automation or hook proposal as an actual automation.
- Whether `docs/governance/project-state.md` should be updated automatically only on session close or also after merges.
