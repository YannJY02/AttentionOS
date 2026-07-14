# AttentionOS Agent Instructions

This file is the repo-local instruction authority for AI agents working in
AttentionOS. Use it together with `docs/README.md`.

## Documentation Governance

- Documentation entrypoint: `docs/README.md`.
- Current recovery entrypoint: `docs/governance/project-state.md`.
- Accepted authority map: `docs/decisions/2026-05-09-doc-governance-authority-map.md`.
- Product and vision baseline: `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md`.
- Workflow semantic baseline: `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md`.
- Draft architecture reference: `docs/plans/2026-03-21-attentionos-v2-architecture-design.md` unless the owner explicitly accepts it.
- Current Phase 2 implementation state: `docs/plans/2026-05-09-phase-2-completion-ledger.md` and `docs/plans/2026-05-09-phase-2-ai-reasoning-contract.md`.
- Developer intake queue: `docs/work/todo.md`. This is non-authoritative and must not become a second project state or plans directory.
- Development document lifecycle: `docs/governance/development-document-lifecycle.md`.
- Documentation automation: `docs/governance/documentation-automation.md`.

## Root Documentation Boundary

Keep long-lived documentation under `docs/`.

Allowed root documentation-like files:

- `README.md` for the GitHub/platform entrypoint.
- `AGENTS.md` for repo-local AI-agent instructions.

Do not recreate root-level `plans/`, `decisions/`, `sources-or-raw/`, `work/`,
`archive/`, `.ai/`, `project-state.md`, or `changelog.md`.

## AI-Generated Documentation Workflow

Whenever an AI agent creates, moves, or materially edits documentation, follow
`docs/governance/ai-generated-doc-workflow.md`.

Minimum required actions:

1. Classify the file before writing it.
2. Route it to the correct `docs/` subdirectory.
3. Use the naming standard in the workflow document.
4. Use `docs/work/todo.md` only for early intake and untriaged developer tasks.
5. For large tasks, promote confirmed work into `docs/plans/` instead of expanding `todo.md`.
6. Update the nearest README or index.
7. Update `docs/governance/project-state.md` only when current truth, active work, blockers, or next action changed.
8. Append `docs/governance/changelog.md` for durable user-facing or project-facing changes.
9. Append `docs/governance/maintenance-log.md` for governance maintenance actions.
10. Move accepted, applied, or superseded AI-generated proposals and temporary working docs to `docs/archive/`.
11. Run `pnpm docs:check` and targeted reference checks before finishing.

## Authority Order

When documents disagree, do not choose by recency, length, or formatting polish.
Use this order:

1. Immutable source evidence and fresh command output.
2. Accepted decisions in `docs/decisions/`.
3. `docs/governance/project-state.md`.
4. Active plans and working notes under `docs/plans/` and `docs/work/`.
5. Governance reports, stale reports, and proposals under `docs/governance/`.
6. Archived or historical material under `docs/archive/`.

## Permission Boundaries

- `docs/sources-or-raw/` is read-only evidence. Do not rewrite raw sources.
- `docs/work/todo.md` is the only developer todo file. Keep it short, and route confirmed work to plans, decisions, project-state, changelog, or archive.
- AI may draft decisions with `status: proposed`, but must not mark them accepted, rejected, or superseded without explicit user confirmation.
- AI may archive generated proposals after they are accepted or applied.
- AI must not archive raw sources, accepted baselines, or key current-state documents without explicit user confirmation.
- Editing this `AGENTS.md` changes future-agent authority. Draft changes in `docs/governance/proposed-updates/` unless the user explicitly asks to update repo-local instructions.

## Documentation Automation

- Run `pnpm docs:check` after documentation-related changes.
- `pnpm check` includes `pnpm docs:check` before the normal Turbo check.
- `.githooks/pre-commit` is prepared to run `pnpm docs:check` before commits after `pnpm hooks:install`.
- Automation may report or block obvious documentation drift, but it must not silently accept decisions, rewrite raw sources, modify product/workflow baselines, or change this `AGENTS.md` file.

## Project Development

- AttentionOS V2 is a personal attention and workflow/context system. Start from
  `docs/README.md` and `docs/governance/project-state.md` before changing code.
- Treat the product and workflow baselines linked above as authoritative. The
  architecture plan remains a draft reference unless the owner accepts it.
- Search current documentation and existing implementation before adding code.
- Keep behavior changes small and leave a targeted regression check for
  non-trivial logic.
- The workspace is a pnpm/Turborepo monorepo. The desktop app lives under
  `apps/desktop`; shared implementation lives under `packages/`.

Common commands:

```bash
pnpm dev
pnpm test:run
pnpm build
pnpm check
pnpm lint
pnpm docs:check
```

## Task Completion Git Workflow

- Before marking a task or tracked issue complete, automatically commit only
  that task's scoped repository changes and push the current task branch.
- When the checkout contains unrelated or pre-existing changes, isolate the task
  on a `codex/` branch or separate worktree; never stage unrelated changes.
- Run the relevant checks before committing, allow configured hooks to run, and
  use a normal push. Never force-push or skip hooks unless the owner explicitly
  requests it.
- Read-only or tracker-only work with no repository changes does not create an
  empty commit.
- If a safe isolated commit or normal push cannot be completed, keep the task or
  issue open and request owner intervention instead of claiming completion.

## Agent Skills

### Issue Tracker

Issues and PRDs are tracked in GitHub Issues for `YannJY02/AttentionOS`.
External pull requests are not a triage request surface. See
`docs/agents/issue-tracker.md`.

### Triage Labels

Use the five canonical Matt Pocock triage labels without overrides. See
`docs/agents/triage-labels.md`.

### Domain Docs

This repository uses a multi-context layout, routed through a root
`CONTEXT-MAP.md` with context-specific `CONTEXT.md` files and ADRs. See
`docs/agents/domain.md`.
