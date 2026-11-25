# Responsive Stage Navigation & Overview Scan

## Sub-features
- Read-only Overview scan layout
- Canonical 3-stage navigation (`Ritual`, `Overview`, `Execution`) usable down to `390x844` mobile width
- Evolutionary learning feedback journey (`e2e/evolution-learning.spec.ts`)

## How to get to it (user POV)
Navigate to `/overview` at desktop or `390x844` viewport width.

## Driving it with Playwright
Driven by `e2e/smoke.spec.ts` and `e2e/evolution-learning.spec.ts`, plus live Chromium screenshot capture to `public/overview-proof.png`.

## Gotchas
- `main` clientWidth must remain `>= 350px` at `390px` viewport width.
