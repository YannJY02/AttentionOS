---
status: Release-candidate readiness report
date: 2026-05-24
scope: macOS release candidate
owner: YannJY02
---

# AttentionOS Release Readiness Report

This report closes the release-candidate evidence package for the current local
macOS build. It is governed by
`docs/plans/2026-05-23-attentionos-release-candidate-requirements-ledger.md`.

## Result

AttentionOS is ready as a local, unsigned macOS release candidate for real
owner testing. The product-critical ledger rows are terminal:

- Implemented and verified: 58 rows.
- Owner-deferred: RC-020 fullscreen/scheduled Ritual launch, per D1=A.
- External blocker: RC-056 Developer ID signing/notarization, per D4=B and
  missing local Developer ID credentials.
- Open rows: 0 after this report and final verification.

This is not an App Store submission or public release authorization.

## Verified Product Scope

- Main path: onboarding -> Ritual -> Overview -> Execution Plan -> Execution
  Focus -> completion -> Overview is verified in browser automation and
  packaged native Computer Use QA.
- Execution Plan and Execution Focus are distinct routes and modes. Focus hides
  planning helper lanes and protects one current action.
- The five-layer model appears in data, route behavior, Overview navigation,
  breadcrumb semantics, and visual layer copy.
- Ritual supports configurable intention/prayer, meditation settings/runtime,
  reflection, dedication, and marked follow-up inputs into Execution Plan.
- Overview remains read-only and presents layer context, timeline/vision,
  risks, trends, context signals, release metrics, and an execution bridge.
- Execution Plan supports human-created work, clarification, decomposition
  review, prioritization roles, AI pending approval/rejection/rollback, and one
  focus candidate.
- Human-led AI boundaries are verified: suggestions remain pending until review,
  important local mutations are audited, and applied AI task suggestions can be
  rolled back/restored.
- Local-first persistence, native app-data snapshots, backup/export/import,
  corruption quarantine, settings, onboarding, empty states, error states,
  privacy boundaries, no-default-telemetry, and no hardcoded provider secrets
  are verified for the current release scope.
- D2=C is implemented as a conservative local integration-reminder handoff:
  calendar-file, Focus handoff, and app auto-open targets are stored locally
  with permission copy, audit entries, and a 1-6/day cap. It does not read
  calendars, monitor apps, change macOS Focus, open external software, request
  notification permission, or schedule background notifications.

## Verification Evidence

- `pnpm docs:check`: passed.
- `pnpm release:ledger`: passed.
- `git diff --check`: passed.
- `pnpm lint`: passed.
- `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`: passed.
- `pnpm test:run`: 59 files, 295 tests passed.
- `pnpm build`: 11 Turbo build tasks passed.
- `pnpm check`: docs check plus 16 Turbo check/build tasks passed.
- `pnpm e2e`: 16 Chromium tests passed.
- `pnpm --filter @attentionos/desktop tauri build --bundles app,dmg --no-sign --ci`: rebuilt unsigned `.app` and `.dmg`.
- `pnpm release:check:macos`: 27 checks passed, 0 failures, 4 external blockers.
- `pnpm performance:check:macos`: valid snapshot ready in 2351 ms / 8000 ms and corrupt snapshot recovery in 514 ms / 10000 ms.
- `pnpm qa:browser:release`: passed with 11 screenshots and 0 console/page errors at `.gstack/qa-reports/release-candidate-browser-workflow-2026-05-24-12-10-06/`.
- Computer Use native QA reached `AttentionOS.app` and verified onboarding
  consent, Ritual, Overview five-layer traversal, Execution Plan, Execution
  Focus progress/review/completion, return to Overview, and native AX tree
  roles/labels/states.

## macOS Package State

- Artifact: `apps/desktop/src-tauri/target/release/bundle/macos/AttentionOS.app`.
- DMG: `apps/desktop/src-tauri/target/release/bundle/dmg/AttentionOS_0.1.0_aarch64.dmg`.
- Bundle id: `com.yannjy.attentionos`.
- Product name/window title: `AttentionOS`.
- Category: `public.app-category.productivity`.
- Hardened runtime intent, Info.plist merge, App Sandbox entitlements file, CSP,
  icon metadata, and reduced Tauri capability surface are present.
- Current artifact is unsigned/ad hoc for local RC testing.

## External Blockers

RC-056 remains external-blocked:

- Local keychain currently shows Apple Development identities only, not a
  Developer ID Application identity.
- No Apple/Tauri/CSC/notary credential environment names are present.
- `xcrun notarytool` is installed, but no notary profile or credentials were
  used.
- Signing, notarization, stapling, App Store Connect upload, paid account
  actions, final legal/privacy confirmation, and public release require explicit
  owner-provided credentials and authorization.

## Residual Risk

- Actual public distribution trust cannot be verified until Developer ID signing
  and notarization are performed.
- Actual App Store review answers and privacy/legal text still require owner
  confirmation before submission.
- RC-020 fullscreen/scheduled Ritual launch is intentionally deferred for this
  candidate.
- The D2=C integration reminder slice is a local handoff contract, not a
  background calendar/Focus/app automation runtime.
