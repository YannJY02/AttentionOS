---
status: active
date: 2026-05-09
scope: doc-governance
---

# AI-Generated Documentation Workflow

Use this workflow whenever an AI agent creates, moves, or materially edits any
documentation file in this repo.

Also follow `docs/governance/development-document-lifecycle.md` for daily
developer intake, prompt preservation, blueprints, verification notes, audits,
handoffs, and archive closeout.

## 1. Classify Before Writing

Choose exactly one primary route:

| Route | Path | Use for |
|---|---|---|
| Product baseline | `docs/product/` | Accepted product vision, principles, roadmap, metrics, and product-level baselines. |
| Workflow semantics | `docs/workflow/` | Accepted workflow-language and process-model baselines. |
| Raw sources | `docs/sources-or-raw/` | Immutable user prompts, transcripts, external notes, or other source evidence. |
| Active plans | `docs/plans/` | Current or draft implementation plans, phase ledgers, architecture plans, and contracts. |
| Decisions | `docs/decisions/` | Durable decisions with explicit `status`, `date`, and `scope`. |
| App/package docs | `docs/apps/` | Long-lived package or app documentation that would otherwise sit beside code. |
| Working docs | `docs/work/` | Temporary synthesis, scratch drafts, implementation notes, and the single developer intake queue. |
| Governance | `docs/governance/` | Project state, changelog, stale reports, maintenance logs, and pending proposals. |
| Archive | `docs/archive/` | Applied proposals, superseded plans, historical notes, and retired generated docs. |

If a file fits multiple routes, prefer the highest-authority route it can safely
occupy. Do not place uncertain material into product, workflow, accepted
decision, or current-state surfaces.

## Developer Intake Rule

- The only developer todo file is `docs/work/todo.md`.
- Use it for rough ideas, untriaged requirements, and small reminders.
- Do not store full prompts, blueprints, audits, verification transcripts, or long reasoning there.
- Once an item becomes confirmed work, promote it to `docs/plans/`, `docs/decisions/`, `docs/governance/project-state.md`, or `docs/archive/` as appropriate.
- Do not create root-level `todo.md` or additional todo files.

## 2. Naming Standard

- AI-generated operational docs use `YYYY-MM-DD-lower-kebab-slug.md`.
- Current product/workflow baselines may keep stable descriptive names.
- Chinese stable baselines or raw Chinese source files may use `.zh-CN.md`.
- Avoid ambiguous suffixes such as `final`, `new`, `copy`, `latest`, `v2`, or `temp`.
- Prefer one canonical file plus archive history over several competing current files.

## 3. Required Updates

After creating, moving, archiving, or materially editing a document:

- Update the nearest route README when a new file should be discoverable.
- Update `docs/README.md` when a route, authority mapping, or primary entrypoint changes.
- Update `docs/governance/project-state.md` when current truth, active work, blockers, or next action changes.
- Append `docs/governance/changelog.md` for durable project-facing changes.
- Append `docs/governance/maintenance-log.md` with what changed and what evidence was used.
- Update `docs/governance/stale-report.md` when a stale finding is resolved or a new conflict is found.
- Update references after moves; do not leave active docs pointing at old paths.

## 4. Auto-Archive Rules

Archive AI-generated files when they are accepted, applied, superseded, or no
longer useful as pending work:

- Applied proposals: `docs/archive/governance/proposed-updates/`.
- Superseded plans: `docs/archive/plans/`.
- Historical governance notes: `docs/archive/governance/`.
- Retired working drafts: `docs/archive/work/`.

Do not archive or rewrite these without explicit user confirmation:

- `docs/sources-or-raw/` source evidence.
- Product or workflow baseline files.
- Accepted decisions.
- `docs/governance/project-state.md`.
- `AGENTS.md` or `README.md` authority claims.

## 5. Verification Checklist

Before finishing, run targeted checks appropriate to the change:

- Confirm no long-lived Markdown or text documentation was created outside the allowed root exceptions and `docs/`.
- Confirm `docs/` root contains only `docs/README.md`.
- Confirm there is no root-level `todo.md` and no duplicate todo file outside `docs/work/todo.md`.
- Run `pnpm docs:check`.
- Search for old moved paths and broken references.
- Run `git diff --check`.
- Run the shared doc-governance audit script when the change affects governance structure.

The shared audit script expects root-level governance directories by default.
For AttentionOS, interpret those warnings through the docs-centered mapping in
`docs/governance/README.md`.
