# Triage Labels

Use the default Matt Pocock triage roles unless the owner creates repo-specific
GitHub labels later.

| Role | Label |
|---|---|
| Needs maintainer evaluation | `needs-triage` |
| Waiting on reporter or owner input | `needs-info` |
| Fully specified and ready for an AFK agent | `ready-for-agent` |
| Ready for human implementation | `ready-for-human` |
| Will not be actioned | `wontfix` |

## Agent Rules

- Do not create duplicate labels with near-synonyms.
- If a GitHub issue already uses a different repo-specific label vocabulary,
  preserve the existing vocabulary and propose an update to this file.
- Treat `ready-for-agent` as a high bar: the issue must include scope,
  acceptance criteria, test/verification expectations, and relevant docs.
