# Domain Docs

How the engineering skills should consume this repo's domain documentation when exploring the codebase.

## Before exploring, read these

- **`CONTEXT-MAP.md`** at the repo root — it points to one `CONTEXT.md` per context. Read each one relevant to the topic.
- **`docs/adr/`** — read system-wide ADRs that touch the area you're about to work in.
- **Context-scoped ADRs** — check `src/<context>/docs/adr/` or the equivalent context path identified by `CONTEXT-MAP.md`.

If any of these files don't exist, **proceed silently**. Don't flag their absence or suggest creating them upfront. The `/domain-modeling` skill creates them lazily when terms or decisions actually get resolved.

## File structure

This repository uses a multi-context layout:

```text
/
├── CONTEXT-MAP.md
├── docs/adr/                          ← system-wide decisions
├── apps/
│   └── <context>/
│       ├── CONTEXT.md
│       └── docs/adr/                  ← context-specific decisions
└── packages/
    └── <context>/
        ├── CONTEXT.md
        └── docs/adr/
```

`CONTEXT-MAP.md` is the routing authority. Do not infer that every workspace package deserves a separate context; add contexts only when `/domain-modeling` establishes a real domain boundary.

## Use the glossary's vocabulary

When output names a domain concept—in an issue title, refactor proposal, hypothesis, or test name—use the term defined in the relevant `CONTEXT.md`. Don't drift to synonyms the glossary explicitly avoids.

If a needed concept isn't in the glossary, reconsider whether the language belongs to the project or note the gap for `/domain-modeling`.

## Flag ADR conflicts

If output contradicts an existing ADR, surface it explicitly rather than silently overriding:

> _Contradicts ADR-0007 (event-sourced orders) — but worth reopening because…_
