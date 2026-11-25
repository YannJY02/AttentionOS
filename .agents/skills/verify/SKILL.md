---
name: verify
description: Drive AttentionOS (@attentionos/desktop) on an isolated loopback port to verify documentation governance, typechecks, unit tests, and real Playwright browser journeys (Ritual -> Dedication -> Overview -> Execution Focus) with surviving screenshot and manifest evidence.
---

# Verify AttentionOS

Use `.agents/skills/verify/run` to prove AttentionOS changes end-to-end without colliding with port `1420` or developer sessions.

## Commands

```bash
.agents/skills/verify/run all      --out /tmp/attentionos-verify-01
.agents/skills/verify/run doctor   --out /tmp/attentionos-verify-01
.agents/skills/verify/run launch   --out /tmp/attentionos-verify-01
.agents/skills/verify/run drive    --out /tmp/attentionos-verify-01
.agents/skills/verify/run cleanup  --out /tmp/attentionos-verify-01
.agents/skills/verify/run evidence --out /tmp/attentionos-verify-01
```

## Lifecycle

Start from a clean checkout. `all` runs the full sequence; for individual steps, `doctor` starts a new run. Repeat `launch` before retrying an interrupted browser journey. Evidence requires the same clean commit at each step, matching file digests, and completed cleanup.

- **Doctor:** Confirms Node >=22, `pnpm`, and runs `pnpm verify` (`docs:check` + `turbo check` + `vitest run`) plus `pnpm build`.
- **Launch:** Allocates a free loopback port, starts `@attentionos/desktop` Vite server in its own process group (`--strictPort`), and waits until HTTP 200 ready. Never touches an existing `1420` dev server.
- **Drive:** Runs Playwright (`VERIFY_BASE_URL=http://127.0.0.1:<port>`) across `e2e/smoke.spec.ts` and `e2e/evolution-learning.spec.ts`, then captures a live screenshot of `/overview` to `<out>/public/overview-proof.png`.
- **Evidence:** Writes `<out>/public/manifest.json` with exact commit SHA, step exit codes, coverage boundary (`browser-web-surface`; native Tauri shell requires explicit desktop qualification), and SHA-256 artifact hashes.
- **Cleanup:** Terminates only the owned Vite process group, verifies port release, and leaves `<out>/public/` intact.

## Feature Map

See [features/README.md](features/README.md) for mapped user journeys.
