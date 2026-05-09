# Proposed AGENTS.md Documentation Governance Block

Status: proposed

Add or adapt this block only if you want future AI sessions in this repo to treat it as project instruction authority.

```markdown
## Documentation Governance

- Documentation entrypoint: `docs/README.md`.
- Recovery entrypoint: `docs/governance/project-state.md`.
- `docs/decisions/` contains durable decisions. AI may draft `status: proposed` decisions but must not mark them accepted, rejected, or superseded without explicit user confirmation.
- `docs/sources-or-raw/` is read-only evidence. AI must not rewrite raw sources.
- `docs/work/` contains drafts and implementation notes.
- `docs/archive/` contains superseded material; moving key files there requires confirmation.
- `docs/governance/` contains non-authoritative AI maintenance logs, proposals, stale reports, and evolution proposals.
- Single plans directory: `docs/plans/`; do not create root-level `plans/`.
- Product and vision baseline: `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md`.
- Workflow semantic baseline: `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md`.
- Draft architecture reference: `docs/plans/2026-03-21-attentionos-v2-architecture-design.md` unless the owner explicitly accepts it.
- Phase implementation state: `docs/plans/2026-05-09-phase-2-completion-ledger.md` and `docs/plans/2026-05-09-phase-2-ai-reasoning-contract.md`.
- Editing this `AGENTS.md` block changes future-agent authority; AI should draft changes in `docs/governance/proposed-updates/` unless the user explicitly asked to update project instructions.
- Automation, Stop hooks, hooks, or CI may run audits and write `docs/governance/*` reports, but must not accept decisions, edit raw sources, archive key files, update `docs/governance/project-state.md`, or modify this `AGENTS.md` block without explicit confirmation.
```

## Confirmation Needed

- Whether to create a repo-local `AGENTS.md` or merge this into an existing project instruction file.
- Whether `docs/governance/project-state.md` should be the accepted recovery entrypoint.
- Whether the authority map should be accepted as written or narrowed.
