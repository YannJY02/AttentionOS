# Stale Report

Generated: 2026-05-09 16:19 CST

## Findings

| Severity | File | Problem | Proposed action |
|---|---|---|---|
| Low | `docs/roadmap-execution/` | Older Sprint E/F/G/H roadmap source files are still absent from this checkout. | Keep `docs/roadmap-execution/README.md` as the historical placeholder; restore original files only if recovered from evidence. |
| Low | Shared audit script | The shared `audit_doc_system.py` expects root-level governance directories, while AttentionOS now intentionally uses docs-centered equivalents. | Treat root-directory warnings as expected unless the mapping in `docs/governance/README.md` changes. |
| Low | Shared audit script | The shared `audit_doc_system.py` flags active docs that intentionally point to `docs/archive/` for provenance or workflow routing. | Treat archive-reference warnings as expected when the current doc clearly labels the archive reference as historical, provenance, or routing guidance. |

## Conflicts

- No direct semantic contradiction was resolved automatically.
- The documentation authority map is now accepted in `docs/decisions/2026-05-09-doc-governance-authority-map.md`.

## Resolved In This Pass

- Created repo-local `AGENTS.md`.
- Added `docs/governance/ai-generated-doc-workflow.md`.
- Accepted the authority-map decision.
- Archived Phase 1 historical plan to `docs/archive/plans/phase1-deterministic-core.md`.
- Archived applied AI-generated proposals to `docs/archive/governance/proposed-updates/`.
- Kept `docs/governance/proposed-updates/` as a pending-only queue.
