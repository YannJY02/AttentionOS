# Ritual to Execution Focus Flow

## Sub-features
- Morning/Evening Ritual (`Meditation` -> `Reflection` -> `Dedication`)
- Five-layer hierarchy drill-down (`Personal Context OS` -> `Product development` -> `Task`)
- Execution Focus state machine (`planning` -> `executing` -> `+5 min` -> `reviewing` -> `Complete task`)

## How to get to it (user POV)
Open `/` -> complete meditation and reflection -> complete ritual to land on `Overview` -> drill down to task -> enter focus.

## Driving it with Playwright
Driven by `e2e/smoke.spec.ts` via `.agents/skills/verify/run drive --out <dir>` using role-based ARIA locators (`getByRole`, `getByLabel`).

## Gotchas
- Port `1420` may be in use by an active developer session; always drive via `VERIFY_BASE_URL` on a leased port.
- Covers the React/Vite renderer surface; Rust/Tauri native shell changes require separate Tauri binary verification.
