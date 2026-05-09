# Desktop App

Canonical docs for `apps/desktop`.

## Package

- Package name: `@attentionos/desktop`
- Stack: Tauri 2, React 19, Vite, XState, React Router, Tailwind CSS, lucide-react.
- Source: `apps/desktop/src/`
- Tauri shell: `apps/desktop/src-tauri/`

## Commands

Run from `apps/desktop/`:

```bash
pnpm dev
pnpm build
pnpm test
pnpm tauri
```

Run from the repo root when checking the full workspace:

```bash
pnpm test:run
pnpm check
pnpm lint
pnpm build
```

## Documentation Policy

Do not recreate `apps/desktop/README.md`. Long-lived desktop documentation belongs here so docs stay discoverable from `docs/README.md`.
