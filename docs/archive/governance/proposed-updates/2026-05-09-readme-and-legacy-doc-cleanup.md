# Proposed Cleanup: README And Legacy Documentation

Status: proposed

## Trigger

The initial documentation-governance audit found stale or ambiguous documentation surfaces that should not be silently rewritten.

## Proposed Changes

1. Replace `apps/desktop/README.md` template text with a short pointer to canonical docs.
2. Resolve missing links in `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md` to `docs/roadmap-execution/...` by routing them through `docs/roadmap-execution/README.md`.
3. Move `plans/phase1-deterministic-core.md` into the single plans directory and mark it historical.
4. If accepted, add the governance block from `docs/governance/proposed-updates/2026-05-09-agents-doc-governance-block.md` to repo-local `AGENTS.md`.

## Not Applied Automatically

- Broad README authority edits beyond the short pointer.
- Moving or archiving files.
- Creating or editing `AGENTS.md`.
- Marking any decision as accepted.

## Validation Plan

- Re-run `audit_doc_system.py`.
- Run `rg --files -g '*.md'` to confirm the expected doc surface.
- Review `git diff` before commit or push.

## Applied 2026-05-09

Items 1-3 above were applied as documentation dependency cleanup. Archiving remains unapplied.
