---
status: active
date: 2026-05-09
scope: developer-intake
authority: non-authoritative
---

# Developer Todo

This is the only developer intake queue for AttentionOS.

It is for early ideas, rough requirements, and small next-action reminders. It
is not current truth, not an accepted plan, and not a decision record.

## Rules

- Keep entries short enough to scan.
- Do not paste full prompts, transcripts, audit reports, or blueprint bodies here.
- When an item becomes real work, promote it to the correct route and replace the todo entry with a link.
- When an item is rejected or completed, move it out of Open Items.
- Do not create another `todo.md` elsewhere in the repo.

## Routing

| If an item becomes... | Move or summarize it in... |
|---|---|
| Current project state, blocker, or next action | `docs/governance/project-state.md` |
| Confirmed implementation plan or blueprint | `docs/plans/YYYY-MM-DD-lower-kebab-slug.md` |
| Durable decision | `docs/decisions/YYYY-MM-DD-lower-kebab-slug.md` |
| Temporary exploration or reusable prompt | `docs/work/YYYY-MM-DD-lower-kebab-slug.md` |
| Durable project-facing change | `docs/governance/changelog.md` |
| Superseded working material | `docs/archive/work/` |

## Open Items

No open items.

## Recently Routed

| Date | Item | Routed to |
|---|---|---|
| 2026-05-09 | Developer todo and AI-generated document lifecycle governance | `docs/decisions/2026-05-09-developer-todo-and-doc-lifecycle.md`, `docs/governance/development-document-lifecycle.md` |

## Intake Template

```markdown
| YYYY-MM-DD | Short item | untriaged | Next route: todo / work / plans / decisions / project-state / archive |
```
