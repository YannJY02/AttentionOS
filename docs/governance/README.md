# Governance

This directory contains non-authoritative documentation governance surfaces.

## Contents

- `maintenance-log.md` — AI maintenance log and evidence record.
- `stale-report.md` — current stale/conflict findings.
- `proposed-updates/` — proposed changes that need owner review.
- `evolution-proposals/` — proposed changes to the governance system itself.
- `ai-generated-doc-workflow.md` — active routing, naming, update, and archive workflow for AI-generated documentation.

## Layout Note

The shared `doc-governance-maintainer` skill defaults to root-level governance paths such as `project-state.md`, `decisions/`, `sources-or-raw/`, `work/`, `archive/`, and `.ai/`.

AttentionOS intentionally uses a docs-centered equivalent to reduce cognitive load:

- `docs/governance/project-state.md`
- `docs/decisions/`
- `docs/sources-or-raw/`
- `docs/work/`
- `docs/archive/`
- `docs/governance/`

Low-severity warnings from the shared audit script about missing root-level governance directories should be interpreted against this mapping, not as a request to recreate those root directories.

The shared audit script may also warn when current documents reference
`docs/archive/`. For AttentionOS this is acceptable when the reference is
clearly historical, provenance-related, or part of the archive workflow.

## Archive Rule

Pending proposals belong in `docs/governance/proposed-updates/`. Accepted,
applied, rejected, or superseded proposals belong under `docs/archive/`, not in
the pending queue.
