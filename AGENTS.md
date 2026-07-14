# AttentionOS Agent Instructions

This file is the repo-local instruction authority for AI agents working in
AttentionOS.

## Matt Documentation Workflow

- Start with `CONTEXT-MAP.md`, then read the relevant context's `CONTEXT.md` and
  ADRs under its `docs/adr/` directory.
- Read `docs/adr/` for durable system-wide decisions that affect the work.
- GitHub Issues and the Wayfinder map are the only active-work, requirement-gap,
  and task-status authority for `YannJY02/AttentionOS`.
- `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md` is the stable product baseline.
- `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md` is the stable workflow
  semantic baseline.
- `docs/sources-or-raw/` is immutable source evidence. Do not rewrite it.
- Put a durable context-specific decision in the nearest
  `<context>/docs/adr/` directory. Put a cross-context decision in `docs/adr/`.
- Update `CONTEXT-MAP.md` or the relevant `CONTEXT.md` only when routing,
  vocabulary, ownership, invariants, or public seams change.
- Do not create project-state files, plan ledgers, todo documents, changelogs,
  maintenance logs, archive governance, or another issue tracker. Git preserves
  history; GitHub Issues/Wayfinder coordinates current work.
- Run `pnpm docs:check` after documentation changes. Automation may detect
  drift, but it must not silently accept decisions or rewrite stable baselines
  or raw evidence.

## Root Documentation Boundary

The only long-lived documentation-like files allowed at the repository root are:

- `README.md` — GitHub/platform entrypoint.
- `AGENTS.md` — repo-local AI-agent instructions.
- `CONTEXT-MAP.md` — domain-context routing authority.

Do not recreate root-level `plans/`, `decisions/`, `sources-or-raw/`, `work/`,
`archive/`, `.ai/`, `project-state.md`, `changelog.md`, or `todo.md`.

## Architecture Boundaries

- Attention Workflow lives in `packages/workflow` and is the sole owner and
  mutator of workflow state.
- Attention Guidance lives in `packages/guidance`, consumes immutable
  `WorkflowFacts`, and returns estimates, suggestions, metrics, and reminder
  policy without mutating workflow state.
- Concrete persistence, filesystem, Tauri, notification, and AI-provider I/O
  belongs behind explicit adapters in `apps/desktop/src/adapters`.
- Desktop may depend on Workflow and Guidance; Guidance may depend on Workflow;
  Workflow must not depend on Guidance or desktop; packages must not import
  desktop internals.
- Import packages through their public entrypoints. Do not recreate removed
  legacy packages or private-subpath dependencies.

## Project Development

- AttentionOS V2 is a personal attention and workflow/context system. Start
  from `CONTEXT-MAP.md` before changing code.
- Treat the linked product and workflow baselines as authoritative. Use current
  code, tests, command output, and accepted ADRs to resolve implementation facts.
- Search current documentation and implementation before adding code.
- Keep behavior changes small and leave a targeted regression check for
  non-trivial logic.
- The workspace is a pnpm/Turborepo monorepo. The desktop app lives under
  `apps/desktop`; shared domain implementation lives under `packages/`.

Common commands:

```bash
pnpm dev
pnpm test:run
pnpm build
pnpm check
pnpm lint
pnpm docs:check
pnpm boundaries:check
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

This repository uses a multi-context layout, routed through `CONTEXT-MAP.md`
with context-specific `CONTEXT.md` files and ADRs. See
`docs/agents/domain.md`.
