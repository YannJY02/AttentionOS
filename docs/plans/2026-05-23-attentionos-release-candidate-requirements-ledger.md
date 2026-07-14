---
status: Active coverage ledger
date: 2026-05-23
scope: release-candidate-readiness
---

# AttentionOS Release Candidate Requirements Ledger

This ledger is the active evidence surface for moving AttentionOS toward a
macOS release-candidate product. It maps the product baseline, workflow
baseline, and original user-source requirements into implementation and
verification status.

## Source Baselines

- Product baseline: `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md`
- Workflow baseline: `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md`
- Raw source baseline: `docs/sources-or-raw/user-original-long-prompts.zh-CN.md`
- Current recovery state: `docs/governance/project-state.md`

## Status Vocabulary

Final release-candidate completion allows only these terminal statuses:

- `已实现并验证`: implemented and verified with current evidence.
- `经 owner 明确同意延期`: explicitly deferred by the owner in the current work.
- `受外部依赖阻塞`: blocked by credentials, paid accounts, certificates, App Store access,
  or another owner-controlled external dependency.
- `被更新的已接受项目决策取代`: replaced by a newer accepted project decision.

During execution this ledger may also use `Open` for an uncovered gap or a
requirement that has code evidence but has not yet been verified in the current
release-candidate pass. The goal cannot be marked complete while any critical
`Open` item remains.

## Current Snapshot

- Current app evidence shows a Tauri/Vite desktop surface with routes for
  `ritual`, `overview`, `execution/plan`, and `execution/focus`.
- Current app evidence shows hierarchy, reflections, ritual copy, AI
  suggestions, learning observations, and audit entries still use synchronous
  localStorage helpers at runtime, but they are now mirrored into a portable
  app-state snapshot with Tauri app-data commands and browser fallback backups.
- Corrupted portable snapshots are now quarantined before restore, surfaced in
  the shell and Data & Settings, and validated before import can mutate managed
  storage.
- Settings now includes local-first privacy/AI boundaries: local data
  acknowledgement, external AI call consent default-off, and telemetry opt-in
  default-off. No provider credentials or telemetry sender are created by these
  controls.
- Capture now provides a bounded local context bus: one note can be stored once
  and marked for idea, task, project, and calendar channels. Task/project
  channels surface as draft inputs in Execution Plan without auto-creating
  hierarchy entities.
- Applied AI task-decomposition suggestions now have a user-triggered rollback
  and restore path: AI-created tasks can be archived with audit snapshots and
  later restored from that audit record.
- Attention estimation now has a local manual calibration path in Settings:
  subjective ratings, manual behavior signals, and probe fields produce a
  confidence-scored observation, and the user can correct the estimated state.
- Current tests cover earlier experience-alignment slices, route-level basic
  accessibility, browser performance smoke, and active Focus runtime recovery,
  but this release ledger has not yet completed full manual accessibility,
  final Computer Use, native packaged performance, signing, notarization, or App
  Store readiness verification.
- Release-candidate work is therefore active and incomplete.

## 2026-05-23 Persistence Slice Evidence

- Added Tauri commands for `read_app_state`, `write_app_state`, and
  `export_app_state`, writing `attentionos-state.json` plus backups under the
  app data directory.
- Added frontend snapshot/restore/import/export helpers and a Data & Settings
  screen for save snapshot, create backup, export JSON, and import JSON.
- Added browser fallback persistence so local web QA and tests remain usable
  outside Tauri.
- Added `apps/desktop/src-tauri/Cargo.lock` and locked the Tauri native stack to
  versions that compile under the current Homebrew Rust 1.86.0 toolchain.
- Verification passed: `pnpm test:run` with 213 tests, `pnpm build`,
  `pnpm lint`, `pnpm docs:check`, `git diff --check`, `cargo check`, and
  `pnpm e2e` with 4 Chromium tests.
- Browser QA fallback passed with no console or page errors. Screenshots:
  `.gstack/qa-reports/release-candidate-persistence-2026-05-23/screenshots/settings-data-controls.png`,
  `.gstack/qa-reports/release-candidate-persistence-2026-05-23/screenshots/execution-plan-after-persistence.png`,
  and
  `.gstack/qa-reports/release-candidate-persistence-2026-05-23/screenshots/execution-focus-single-action.png`.

## 2026-05-23 Ritual Settings Slice Evidence

- Added Settings controls for ritual intention/prayer text, dedication/回向
  text, meditation duration, guidance mode, and sound cue preference.
- Added ritual settings storage with sanitized defaults and portable snapshot
  persistence for `attentionos.ritualMeditationSettings.v1`.
- Updated Ritual meditation to use the configured target duration, guidance
  label/prompt, and sound cue preference; the existing start, pause, resume, and
  complete controls remain intact.
- Verification passed for this slice: focused `pnpm test:run` for
  `RitualPage`, `SettingsPage`, and persistence tests, full `pnpm test:run`
  with 215 tests, `pnpm lint`, `pnpm docs:check`, `git diff --check`,
  `pnpm build`, `pnpm check`, `cargo check`, and `pnpm e2e` with 5 Chromium
  tests including ritual settings application.

## 2026-05-23 Ritual Follow-Up Input Slice Evidence

- Added Ritual reflection controls to mark saved reflection content as later
  task input, project input, or both.
- Stored those markers on the reflection entity under
  `properties.ritualFollowUpTargets`, preserving the human-led boundary: no task
  or project is created automatically.
- Added an Execution Plan-only `Ritual follow-up inputs` lane that surfaces
  marked ritual context for later planning while keeping Focus free of planning
  lanes.
- Verification passed for this slice: focused `pnpm test:run` for
  `RitualPage`, `ExecutionPage`, and persistence tests, full `pnpm test:run`
  with 217 tests, `pnpm lint`, `pnpm docs:check`, `git diff --check`,
  `pnpm build`, `pnpm check`, `cargo check`, and `pnpm e2e` with 5 Chromium
  tests.

## 2026-05-23 Execution Plan Human Planning Slice Evidence

- Added an Execution Plan create form for human-created tasks and projects with
  title, clarification, task estimate, planning role, and the four project
  classification signals.
- Added local validation that blocks task creation when at least two project
  signals are selected, requires at least two signals for projects, and clamps
  task estimates to the two-hour bound.
- Added explicit task planning roles: one current next action, up to three
  candidate actions, and a later list. Setting a current action persists a
  single focus candidate under `attentionos.execution.focusCandidate.v1`.
- Added audit entries for user-created Execution Plan entities and planning
  role changes.
- Verification passed for this slice: focused `pnpm test:run` for
  `ExecutionPage`, `OverviewPage`, and persistence tests, full `pnpm test:run`
  with 219 tests, `pnpm lint`, `pnpm docs:check`, `git diff --check`,
  `pnpm build`, `pnpm check`, `cargo check`, and `pnpm e2e` with 6 Chromium
  tests including create-and-focus coverage.

## 2026-05-23 AI Decomposition Clarification Slice Evidence

- Added a required `Clarification for AI split` field before AI task
  decomposition can be drafted.
- Passed the human clarification into the local decomposer rationale so the
  review surface records why the split was requested.
- Added approval-time validation that blocks generated steps with empty titles,
  non-positive estimates, or estimates over the two-hour task bound before any
  tasks are created.
- Verification passed for this slice: focused `pnpm test:run` for
  `ExecutionPage` and `taskDecompositionWorkflow` tests, full `pnpm test:run`
  with 220 tests, `pnpm lint`, `pnpm docs:check`, `git diff --check`,
  `pnpm build`, `pnpm check`, `cargo check`, and `pnpm e2e` with 6 Chromium
  tests covering the browser clarification/rejection path.

## 2026-05-23 Execution Plan Validation Hardening Slice Evidence

- Task creation now requires a clarification or first start note before a task
  can be persisted.
- Task estimates are validated as explicit 5 to 120 minute work blocks instead
  of silently clamping overlarge input.
- AI-generated decomposition steps now require a startable title, clear start
  note, and 5 to 120 minute estimate at both review-time and storage-time
  boundaries.
- Execution Plan project creation now allows one subproject layer and blocks
  deeper project nesting.
- Verification passed for this slice: focused `pnpm test:run` for `hierarchy`,
  `ExecutionPage`, and `taskDecompositionWorkflow` tests with 22 tests, full
  `pnpm test:run` with 224 tests, `pnpm lint`, `pnpm docs:check`,
  `git diff --check`, `pnpm build`, `pnpm check`, `cargo check`, and
  `pnpm e2e` with 6 Chromium tests.

## 2026-05-23 Ritual Cadence And Dedication Follow-Up Slice Evidence

- Added Ritual cadence settings with default morning/evening practice,
  user-editable morning/evening times, and manual-entry preference.
- Ritual now displays the configured cadence/time/manual-entry summary before
  the meditation step.
- Dedication now supports task/project follow-up markers, saved as Ritual
  follow-up input without auto-creating work.
- Execution Plan follow-up cards now expose explicit draft buttons that prefill
  the human create form from marked Ritual inputs while still requiring user
  review and submit before persistence.
- Verification passed for this slice: focused `pnpm test:run` for `RitualPage`,
  `SettingsPage`, `ExecutionPage`, and persistence tests with 28 tests, full
  `pnpm test:run` with 225 tests, `pnpm lint`, `pnpm docs:check`,
  `git diff --check`, `pnpm build`, `pnpm check`, `cargo check`, and
  `pnpm e2e` with 6 Chromium tests.

## 2026-05-23 Tauri Release Identity And Local Packaging Slice Evidence

- Updated Tauri product identity from template `desktop` to `AttentionOS`, with
  bundle identifier `com.yannjy.attentionos`, window title `AttentionOS`, and a
  larger release-oriented main window.
- Replaced `csp: null` with a non-null packaged-webview CSP. The first strict
  CSP attempt produced a blank packaged window; adding Tauri-compatible inline
  script allowance fixed the packaged app while keeping CSP non-null.
- Removed the unused opener native plugin and opener capability permission from
  the current desktop shell.
- Verified local unsigned `.app` generation at
  `apps/desktop/src-tauri/target/release/bundle/macos/AttentionOS.app` and local
  unsigned DMG generation at
  `apps/desktop/src-tauri/target/release/bundle/dmg/AttentionOS_0.1.0_aarch64.dmg`.
- Mounted the DMG and confirmed the contained app reports
  `CFBundleIdentifier=com.yannjy.attentionos`, `CFBundleName=AttentionOS`, and
  executable `attentionos-desktop`.
- `codesign -dvvv` classifies the contained app as ad hoc/linker-signed with no
  TeamIdentifier, which is expected for the explicit `--no-sign` local build and
  blocks notarization/App Store submission until owner credentials are supplied.
- Computer Use verified the packaged app renders under `tauri://localhost/ritual`
  and advances from Meditation to Reflection to Dedication.
- Final workspace verification passed after this slice: full `pnpm test:run`
  with 225 tests, `pnpm lint`, `pnpm docs:check`, `git diff --check`,
  `pnpm build`, `pnpm check`, `cargo check`, and `pnpm e2e` with 6 Chromium
  tests.

## 2026-05-23 Persistence Recovery Slice Evidence

- Added native `quarantine_app_state` support that moves a corrupt
  `attentionos-state.json` into an app-data `recovery/` copy before writing a
  fresh state file.
- Added browser fallback quarantine storage for corrupt snapshots and a
  persistent recovery issue record under
  `attentionos.persistence.recovery.v1`.
- Snapshot import/restore now rejects unknown managed storage keys and
  malformed JSON for known JSON-backed entries before applying any entries.
- Shell and Data & Settings now show a non-destructive recovery warning with
  backend, original byte count, parse reason, and preserved-copy location when
  a corrupt snapshot is detected.
- Verification passed for this slice: focused `pnpm test:run` for
  `persistence`, `App`, and `SettingsPage` tests with 17 tests, focused
  `pnpm exec biome check` on touched desktop TypeScript files,
  `cargo fmt --check`, and `cargo check`.
- Final workspace verification passed after this slice: `pnpm docs:check`,
  `pnpm lint`, `git diff --check`, full `pnpm test:run` with 230 tests,
  `pnpm build`, `pnpm check`, `cargo check`, `pnpm e2e` with 6 Chromium tests,
  and unsigned `tauri build --bundles app --no-sign --ci`.
- Package inspection after the app rebuild confirmed
  `CFBundleIdentifier=com.yannjy.attentionos`, `CFBundleName=AttentionOS`, and
  ad hoc/no-TeamIdentifier signing, which remains owner-credential blocked for
  notarization/App Store submission.

## 2026-05-23 Packaged Native Persistence Recovery QA Evidence

- Computer Use QA targeted the unsigned packaged app at
  `apps/desktop/src-tauri/target/release/bundle/macos/AttentionOS.app`.
- Existing app-data, WebKit, and cache state for `com.yannjy.attentionos` were
  preserved before isolated testing and restored afterward.
- Native snapshot restore proof: after clearing WebKit/cache state and seeding a
  valid native `attentionos-state.json`, the packaged app rendered the seeded
  `Native Restore Proof` Vision entity in Overview.
- Native corruption proof: after seeding `attentionos-state.json` with
  `not valid json`, the packaged app showed the shell recovery warning, Data &
  Settings showed backend `native`, original size `14 bytes`, parse reason, and
  the recovery path, and the original payload was moved under app-data
  `recovery/`.
- Evidence report and screenshots:
  `.gstack/qa-reports/release-candidate-native-recovery-2026-05-23/report.md`,
  `.gstack/qa-reports/release-candidate-native-recovery-2026-05-23/screenshots/native-restore-overview.png`,
  and
  `.gstack/qa-reports/release-candidate-native-recovery-2026-05-23/screenshots/native-corrupt-recovery-settings.png`.

## 2026-05-23 Privacy Boundary Settings Slice Evidence

- Added `attentionos.privacySettings.v1` with default local-only posture:
  external AI calls disabled, telemetry opt-in disabled, and explicit local-data
  acknowledgement unset until the user chooses it.
- Added Data & Settings controls for local-only acknowledgement, future external
  AI call consent after explicit provider setup, and future anonymous telemetry
  opt-in.
- The Settings copy states that this build has no stored provider credentials,
  does not create external AI calls from the switch alone, and has no active
  telemetry sender.
- Privacy settings are included in the portable persistence snapshot and import
  validation as a JSON-backed managed entry.
- Verification passed for this slice: focused `pnpm test:run` for
  `privacySettings`, `SettingsPage`, and `persistence` tests with 17 tests, and
  focused `pnpm exec biome check` on touched desktop TypeScript files.
- Final workspace verification passed after this slice: `pnpm docs:check`,
  `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with
  234 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 6 Chromium tests, and
  unsigned `tauri build --bundles app --no-sign --ci`.
- Package inspection after the rebuild confirmed
  `CFBundleIdentifier=com.yannjy.attentionos` and ad hoc/no-TeamIdentifier
  signing, which remains owner-credential blocked for notarization/App Store
  submission.

## 2026-05-23 Security And Telemetry Scan Evidence

- Used the repo-local `security-review` checklist for a bounded current-source
  scan of secrets, provider calls, telemetry senders, and native permissions.
- High-confidence literal key scan over `apps`, `packages`, `supabase`, and
  `scripts` found no OpenAI-style `sk-*` keys, Google `AIza*` keys, GitHub
  tokens, Slack tokens, or AWS access key ids.
- Environment-variable scan found `SUPABASE_SERVICE_ROLE_KEY` only in tests that
  assert error responses do not leak it and in
  `packages/storage/src/supabase.ts`, where the value is loaded lazily with
  `requireEnv`. No literal value was present.
- Network primitive scan found no `fetch`, `XMLHttpRequest`, `WebSocket`, or
  `EventSource` usage under `apps` or `packages`.
- Telemetry/vendor scan found only the new Settings telemetry preference fields;
  no Sentry, PostHog, Mixpanel, Amplitude, analytics sender, or
  `navigator.sendBeacon` usage was found in the scanned source.
- Current Tauri capability remains `["core:default"]`; no opener, shell,
  filesystem, notification, or broad native permission is enabled in
  `apps/desktop/src-tauri/capabilities/default.json`.

## 2026-05-23 First-Run Onboarding Slice Evidence

- Added `attentionos.onboarding.v1` with completion timestamp, local-data
  acknowledgement, and non-medical-boundary acknowledgement.
- Added a first-run `/onboarding` route and root-route redirect that sends new
  users to onboarding before Ritual; completed users route from root into
  Ritual.
- Onboarding explains the `Ritual -> Overview -> Execution` workflow, the
  local-first data boundary, external AI/telemetry/cloud-sync default-off
  posture, and the non-medical/non-clinical boundary.
- Completing onboarding also saves the local-first privacy acknowledgement while
  keeping external AI calls and telemetry disabled by default.
- Onboarding state is included in portable persistence and import validation as
  a JSON-backed managed entry.
- Verification passed for this slice: focused `pnpm test:run` for
  `onboarding`, `OnboardingPage`, `App`, and `persistence` tests with 17 tests,
  and focused `pnpm exec biome check` on touched desktop TypeScript and E2E
  files.
- Final workspace verification passed after this slice: `pnpm docs:check`,
  `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with
  239 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 6 Chromium tests, and
  unsigned `tauri build --bundles app --no-sign --ci`.
- Package inspection after the rebuild confirmed
  `CFBundleIdentifier=com.yannjy.attentionos` and ad hoc/no-TeamIdentifier
  signing, which remains owner-credential blocked for notarization/App Store
  submission.

## 2026-05-23 Reminder Consent Settings Slice Evidence

- Added `attentionos.reminderSettings.v1` with reminders disabled by default,
  reminder frequency, quiet-hours start/end, priority override intent, and
  update timestamp.
- Added Data & Settings controls for enabling local reminder preferences,
  choosing reminder frequency, setting quiet windows, and saving priority
  override intent for active focus recovery.
- Settings copy explicitly states that this build stores local preferences only
  and does not request macOS notification permission or schedule background
  notifications.
- Reminder settings are included in portable persistence and import validation
  as a JSON-backed managed entry.
- Verification passed for this slice: focused `pnpm test:run` for
  `reminderSettings`, `SettingsPage`, and `persistence` tests with 18 tests, and
  focused `pnpm exec biome check` on touched desktop TypeScript files.
- Final workspace verification passed after this slice: `pnpm docs:check`,
  `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with
  243 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 6 Chromium tests, and
  unsigned `tauri build --bundles app --no-sign --ci`.
- Package inspection after the rebuild confirmed
  `CFBundleIdentifier=com.yannjy.attentionos` and ad hoc/no-TeamIdentifier
  signing, which remains owner-credential blocked for notarization/App Store
  submission.

## 2026-05-24 Route-Level Accessibility Audit Slice Evidence

- Added `e2e/accessibility.spec.ts`, a no-new-dependency Playwright audit for
  the primary release-candidate routes: `/onboarding`, `/ritual`, `/overview`,
  `/execution/plan`, a seeded `/execution/focus`, and `/settings`.
- The audit checks that each route exposes document language, a visible `main`
  landmark, at least one visible non-empty `h1`, no duplicate ids, valid
  `aria-labelledby` and `aria-describedby` references, named visible
  interactive elements, no positive `tabindex`, and declared alt text or
  decorative treatment for visible images.
- Fixed the hidden Settings JSON import input by adding an accessible name,
  keeping the visible `Import JSON` button and screen-reader-reachable file
  control aligned.
- Verification passed for this slice: focused `pnpm exec biome check` on
  `e2e/accessibility.spec.ts` and `apps/desktop/src/pages/SettingsPage.tsx`,
  and focused `pnpm exec playwright test e2e/accessibility.spec.ts` with 6
  Chromium route-audit tests.
- Final workspace verification passed after this slice: `pnpm docs:check`,
  `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with
  243 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 12 Chromium tests,
  and unsigned `tauri build --bundles app --no-sign --ci`.
- Package inspection after the rebuild confirmed
  `CFBundleIdentifier=com.yannjy.attentionos`, `CFBundleName=AttentionOS`, and
  ad hoc/no-TeamIdentifier signing, which remains owner-credential blocked for
  notarization/App Store submission.
- Boundary: this is a route-level semantic regression audit. It does not by
  itself close release-grade accessibility for VoiceOver, full manual keyboard
  traversal, contrast review, reduced-motion behavior, or native packaged app
  accessibility.

## 2026-05-24 Browser Performance And Usability Smoke Evidence

- Added `e2e/performance.spec.ts`, a no-new-dependency Playwright smoke suite
  that covers first route readiness, onboarding to Ritual, Ritual to Overview,
  stage navigation, Execution Plan to Focus, Focus progress controls, Settings
  snapshot feedback, and corrupt browser snapshot recovery visibility.
- The test records local measurements in console output and enforces conservative
  budgets to catch severe regressions without pretending browser timings are a
  full native performance benchmark.
- Focused verification passed with these local measurements:
  `launchRouteReady` 228 ms / 5000 ms, `onboardingToRitual` 138 ms / 1500 ms,
  `ritualToOverview` 387 ms / 2500 ms, `stageNavigation` 150 ms / 1500 ms,
  `planToFocus` 93 ms / 2500 ms, `focusControls` 46 ms / 1500 ms,
  `settingsSnapshot` 162 ms / 2000 ms, and `corruptRecoveryWarning` 94 ms /
  3000 ms.
- Verification passed for this slice: focused `pnpm exec biome check` on
  `e2e/performance.spec.ts` and focused
  `pnpm exec playwright test e2e/performance.spec.ts` with 2 Chromium
  performance/usability tests.
- Final workspace verification passed after this slice: `pnpm docs:check`,
  `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with
  243 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests,
  and unsigned `tauri build --bundles app --no-sign --ci`.
- Package inspection after the rebuild confirmed
  `CFBundleIdentifier=com.yannjy.attentionos`, `CFBundleName=AttentionOS`, and
  ad hoc/no-TeamIdentifier signing, which remains owner-credential blocked for
  notarization/App Store submission.
- Boundary: this is browser-surface performance evidence only. It does not close
  native packaged app launch timing, memory/CPU profiling, long-session
  behavior, or manual usability review.

## 2026-05-24 Packaged Native Settings Backup/Import QA Evidence

- Computer Use QA targeted the unsigned packaged app at
  `apps/desktop/src-tauri/target/release/bundle/macos/AttentionOS.app`.
- Existing local app-data, WebKit, cache, and saved-state paths for
  `com.yannjy.attentionos` were preserved before isolated testing and restored
  afterward; no `attentionos-desktop` process remained running after restore.
- In the packaged app, first-run onboarding completed, Data & Settings opened,
  ritual intention was changed to `Native saved intention proof`, and `Save
  snapshot` showed `Saved 934 bytes to native persistence.`
- `Create backup` showed a native backup path under
  `/Users/yann.jy/Library/Application Support/com.yannjy.attentionos/backups/`;
  filesystem inspection confirmed `attentionos-state.json` and the backup JSON
  contained `Native saved intention proof`.
- Import was verified through the packaged app file picker using
  `native-settings-import-proof.json`; Settings showed
  `Imported AttentionOS backup from 2026-05-24T00:15:00.000Z.`
- Navigating to Ritual after import showed `Native imported intention proof`,
  target `7:00`, guidance `Silent sitting`, sound cue `No sound cue`, and
  manual-only ritual cadence. Filesystem inspection confirmed native state
  contains the imported intention, dedication, and 7-minute meditation settings.
- Evidence report and artifacts:
  `.gstack/qa-reports/release-candidate-native-settings-2026-05-24/report.md`,
  `.gstack/qa-reports/release-candidate-native-settings-2026-05-24/native-settings-import-proof.json`,
  `.gstack/qa-reports/release-candidate-native-settings-2026-05-24/artifacts/native-created-backup.json`,
  `.gstack/qa-reports/release-candidate-native-settings-2026-05-24/artifacts/post-import-attentionos-state.json`,
  and
  `.gstack/qa-reports/release-candidate-native-settings-2026-05-24/screenshots/native-imported-ritual.png`.
- Boundary: this QA verified packaged native Settings save snapshot, native
  backup creation, native import via the file picker, and imported Ritual
  rendering. It did not test App Store signing/notarization, external cloud
  backup, backup rotation UX, or native export/download behavior beyond the
  current local controls.

## 2026-05-24 Packaged Native Execution Plan/Focus QA Evidence

- Computer Use QA targeted the unsigned packaged app at
  `apps/desktop/src-tauri/target/release/bundle/macos/AttentionOS.app`.
- Existing local app-data, WebKit, cache, and saved-state paths for
  `com.yannjy.attentionos` were preserved before isolated testing and restored
  afterward; no `attentionos-desktop` process remained running after restore.
- In the packaged app, first-run onboarding completed, Overview opened from
  Ritual, and the seeded five-layer hierarchy was navigated from Vision to Area
  to Goal to Project to Task.
- At the Task layer, `Start execution for Clarify overview scan` opened
  Execution Plan with `Clarify overview scan` selected as the current next
  action and focus candidate.
- `Enter focus` opened Execution Focus with planning state and no visible
  planning helper lanes.
- Focus controls changed state from planning to executing, `Add 5 minutes`
  updated actual time to `5 min`, `Submit for review` changed state to
  reviewing, and `Complete task` returned the app to Overview.
- Native state inspection after the flow confirmed the packaged app wrote an
  app-data snapshot containing `Clarify overview scan` and the focus candidate
  storage entry.
- Evidence report and artifacts:
  `.gstack/qa-reports/release-candidate-native-execution-2026-05-24/report.md`,
  `.gstack/qa-reports/release-candidate-native-execution-2026-05-24/artifacts/post-execution-attentionos-state.json`,
  `.gstack/qa-reports/release-candidate-native-execution-2026-05-24/screenshots/native-focus-executing.png`,
  and
  `.gstack/qa-reports/release-candidate-native-execution-2026-05-24/screenshots/native-focus-completed-overview.png`.
- Boundary: this QA verified the packaged native path through the seeded
  Overview bridge, Execution Plan focus candidate, Execution Focus state
  transitions, timer increment, review transition, completion, and Overview
  return. It did not test user-created native plan items, AI decomposition
  approval, app restart recovery for Focus mid-session, manual keyboard
  traversal, or App Store signing/notarization.

## 2026-05-24 Focus Runtime Recovery Slice Evidence

- Added `attentionos.execution.taskRuntime.v1`, a single active task runtime
  storage entry for the current Focus task state and actual minutes.
- Added `apps/desktop/src/storage/taskRuntime.ts` and regression coverage for
  read/save/clear behavior. The runtime entry is included in portable
  persistence and import validation.
- Updated `useTaskLifecycle` so active `executing`, `paused`, and `reviewing`
  task state is restored on mount for the matching task, while terminal
  `done`/`cancelled` runtime entries are cleared rather than replayed.
- Updated the Execution Plan/Focus E2E path so a started task with `Actual: 5
  min` survives page reload and returns to Execution Focus as `State:
  executing`.
- Verification passed for this slice: focused `pnpm test:run` for
  `useTaskLifecycle`, `taskRuntime`, `persistence`, and `ExecutionPage` tests
  with 27 tests; focused `pnpm exec biome check` on touched runtime files; and
  focused `pnpm exec playwright test e2e/smoke.spec.ts --grep "creates and
  focuses"` with the reload recovery assertion.
- Final code verification passed after this slice: `pnpm docs:check`,
  `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with
  247 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, and
  unsigned `tauri build --bundles app --no-sign --ci`.
- Package inspection after the rebuild confirmed
  `CFBundleIdentifier=com.yannjy.attentionos`, `CFBundleName=AttentionOS`,
  `CFBundleExecutable=attentionos-desktop`, `CFBundlePackageType=APPL`, and
  ad hoc/no-TeamIdentifier signing, which remains owner-credential blocked for
  notarization/App Store submission.

## 2026-05-24 Packaged Native Focus Restart Recovery QA Evidence

- Computer Use QA targeted the freshly rebuilt unsigned packaged app at
  `apps/desktop/src-tauri/target/release/bundle/macos/AttentionOS.app`.
- In the packaged app, first-run onboarding completed, Overview opened from
  Ritual, the five-layer hierarchy was navigated to the Task layer, and `Start
  execution for Clarify overview scan` opened Execution Plan.
- Execution Plan showed `Clarify overview scan` as the current next action and
  focus candidate. `Enter focus` opened Execution Focus with one active task and
  no planning helper lanes.
- `Start task` changed Focus to `State: executing`; `Add 5 minutes` changed the
  visible progress to `Actual: 5 min`.
- After quitting the app process and relaunching the packaged app, opening
  Execution showed the focus candidate still in `State: executing`; entering
  Focus restored `State: executing` and `Actual: 5 min`.
- Native state artifacts before and after relaunch both contain
  `attentionos.execution.taskRuntime.v1` with `state: executing`,
  `actualMinutes: 5`, and `taskId: task-wire-overview`.
- Evidence report and artifacts:
  `.gstack/qa-reports/release-candidate-native-focus-recovery-2026-05-24/report.md`,
  `.gstack/qa-reports/release-candidate-native-focus-recovery-2026-05-24/artifacts/app-support-before-relaunch/attentionos-state.json`,
  `.gstack/qa-reports/release-candidate-native-focus-recovery-2026-05-24/artifacts/app-support-after-relaunch/attentionos-state.json`,
  `.gstack/qa-reports/release-candidate-native-focus-recovery-2026-05-24/screenshots/native-focus-before-relaunch.png`,
  and
  `.gstack/qa-reports/release-candidate-native-focus-recovery-2026-05-24/screenshots/native-focus-restored-after-relaunch.png`.
- Boundary: this QA verified active packaged Focus recovery after process
  restart. It did not test explicit exit-reason UX, native performance timings,
  manual keyboard traversal, VoiceOver, or App Store signing/notarization.

## 2026-05-24 Focus Intentional Exit Slice Evidence

- Added an explicit Focus exit control in `TaskActions`.
- While a task is `executing` or `reviewing`, the control is labeled `Pause and
  exit focus`: it sends the task lifecycle `PAUSE` event, writes the paused
  runtime state, records the audit transition, and returns to Execution Plan.
- While a task is `planning` or already `paused`, the control is labeled `Exit
  focus` and returns to Execution Plan without mutating task state.
- Added Execution Page regression coverage proving `Pause and exit focus`
  returns to Plan, preserves `Actual: 5 min`, stores
  `attentionos.execution.taskRuntime.v1` with `state: paused`, and audits the
  `PAUSE` transition.
- Extended the browser E2E Focus path so an executing task survives reload, then
  exits intentionally to Plan as paused and re-enters Focus with paused progress
  still visible.
- Verification passed for this slice: focused `pnpm test:run` for
  `ExecutionPage`, `useTaskLifecycle`, and `taskRuntime` tests with 20 tests;
  focused `pnpm exec biome check` on touched Focus files and `e2e/smoke.spec.ts`;
  and focused `pnpm exec playwright test e2e/smoke.spec.ts --grep "creates and
  focuses"` with 1 Chromium test.
- Final workspace verification passed after this slice: `pnpm docs:check`,
  `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with
  248 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, and
  unsigned `tauri build --bundles app --no-sign --ci`.
- Package inspection after the rebuild confirmed
  `CFBundleIdentifier=com.yannjy.attentionos`, `CFBundleName=AttentionOS`,
  `CFBundleExecutable=attentionos-desktop`, `CFBundlePackageType=APPL`, and
  ad hoc/no-TeamIdentifier signing, which remains owner-credential blocked for
  notarization/App Store submission.
- Boundary: this closes the explicit in-app intentional-exit control. Final
  cross-flow QA should still recheck the behavior in the packaged app alongside
  native accessibility and performance.

## 2026-05-24 Workflow Surface Evidence Audit

- Source review confirmed the shell organizes the product around `Ritual`,
  `Overview`, and `Execution`, with `Execution` mapped to `/execution/plan` and
  active for all `/execution/*` routes.
- First-run onboarding describes AttentionOS as a personal attention system and
  explicitly says it should not become a chat inbox, dashboard, or generic task
  list.
- `OverviewPage.test.tsx` verifies Overview is read-only: no textboxes and no
  create/edit/delete/decompose/approve mutation buttons are present in the
  Overview route.
- `OverviewPage.test.tsx` verifies the five-layer Overview scan starts at
  `Vision`, shows the current layer and breadcrumb, drills to `Area`, and routes
  the task-layer `Start execution for Clarify overview scan` bridge through the
  daily-flow Execution path.
- Packaged native Computer Use QA also verified the visible five-layer sequence
  `Vision -> Area -> Goal -> Project -> Task` and the Task-layer bridge into
  Execution Plan with the selected focus candidate.
- Browser E2E smoke verifies the main `Ritual -> Overview -> Execution Plan ->
  Execution Focus` path, and the 390 px test verifies workflow navigation remains
  usable on a narrow viewport.
- Boundary: this is a source/test/native-evidence audit for the existing
  workflow surface. It does not close richer task overview modes, full metrics,
  native accessibility, or native performance.

## 2026-05-24 Focus Candidate Uniqueness Regression Evidence

- Added storage regression coverage for competing Execution Plan actions.
- The test creates two sibling tasks under the same project, marks the first as
  `current`, then marks the second as `current`.
- Verification confirms the focus candidate changes to the second task, exactly
  one sibling task remains `current`, the previous current task is demoted to
  `candidate`, and moving the selected task to `backlog` clears
  `attentionos.execution.focusCandidate.v1`.
- Focused verification passed with `pnpm test:run
  apps/desktop/src/storage/hierarchy.test.ts` and `pnpm exec biome check
  apps/desktop/src/storage/hierarchy.test.ts`.
- Boundary: this verifies the core invariant in storage and complements the
  existing page, browser, and packaged native focus-candidate QA. Final packaged
  cross-flow QA should still recheck user-created competing tasks.

## 2026-05-24 Human-Led AI Mutation Evidence Audit

- `AiDecompositionPanel` requires human clarification before drafting a task
  split and labels generated splits as `Pending your review`.
- The UI copy states that nothing is added to Overview until the user approves
  the suggestion.
- `approveTaskDecompositionSuggestion` rejects suggestions that target another
  task, non-pending suggestions, and suggestions that fail startability/duration
  validation before calling the hierarchy mutation path.
- `rejectTaskDecompositionSuggestion` marks pending suggestions rejected and
  writes audit details without creating tasks.
- `taskDecompositionWorkflow.test.ts` verifies rejected, invalid, and
  wrong-target suggestions do not mutate hierarchy data, and
  `ExecutionPage.test.tsx` verifies browser-visible approve/reject flows with
  audit entries.
- Workflow optimization review remains human-led: Execution Plan copy says
  marking a workflow suggestion reviewed does not change the workflow
  automatically, and tests verify approved/rejected review status plus audit
  entries.
- Boundary: this closes the pending-before-approval behavior for current local AI
  suggestion surfaces. RC-006 remains open for broader rollback/compensation
  design after applied suggestions.

## 2026-05-24 Execution Route Semantics Regression Evidence

- Source review confirmed active app routes use `/execution/plan` and
  `/execution/focus`, with `/execution` redirecting to `/execution/plan`.
- `useRouteSync` tests verify `/execution/focus` restores the daily-flow stage
  as `execution`, and starting execution from Overview navigates to
  `/execution/plan`.
- Added `App.test.tsx` regression coverage for legacy `/planning` and `/focus`
  routes; both render the normal Ritual fallback and do not expose standalone
  `Planning` or `Focus` headings.
- Focused verification passed with `pnpm test:run apps/desktop/src/App.test.tsx`
  and `pnpm exec biome check apps/desktop/src/App.test.tsx`.
- Boundary: historical docs may still mention old `planning/focus` semantics as
  migration evidence, but current product routes and UI do not expose them as
  active stages.

## 2026-05-24 Non-Medical Boundary Copy Audit

- Bounded source search across active app, package, and server code found medical
  terms only in the first-run onboarding non-medical acknowledgement and in
  unrelated test/helper strings.
- Onboarding copy states AttentionOS is not medical advice or clinical
  diagnosis, and that it does not diagnose or treat ADHD, anxiety, depression,
  or any health condition.
- Onboarding cannot continue until the user acknowledges the non-medical
  boundary and local-first boundary.
- `OnboardingPage.test.tsx` verifies the non-medical acknowledgement is required
  before entering Ritual and that privacy settings remain external-AI and
  telemetry default-off after onboarding.
- Boundary: this closes current active product-copy medical-claim risk. It does
  not replace final legal/privacy review, App Store privacy questionnaire work,
  or future review after provider-backed AI claims or health-related copy are
  introduced.

## 2026-05-24 Privacy, Permission, And Settings Boundary Audit

- Settings exposes local-first data acknowledgement, future external AI consent,
  telemetry opt-in, reminder consent, quiet windows, backup/export/import, ritual
  copy, and meditation settings in one Data & Settings route.
- First-run onboarding requires local-first and non-medical acknowledgements and
  stores privacy defaults with external AI calls and telemetry disabled.
- Current source scans found no active provider credentials, telemetry sender,
  analytics sender, `sendBeacon`, or app/package network primitive.
- Tauri capability inspection shows only `["core:default"]`; no opener, shell,
  filesystem, notification, or broad native permission is enabled in
  `apps/desktop/src-tauri/capabilities/default.json`.
- Reminder settings copy states the build stores local preferences only and does
  not request macOS notification permission or schedule background notifications.
- Packaged native Settings QA verified save snapshot, native backup creation,
  native file-picker import, and imported Ritual rendering.
- Boundary: this closes current local privacy/permission boundary and Settings
  feature coverage. Native notification delivery remains a separate
  owner-approved behavior decision under RC-042, and final legal/App Store
  privacy review remains outside local implementation.

## 2026-05-24 Backup Export Product-Grade Slice Evidence

- `apps/desktop/src-tauri/src/lib.rs` now separates app-data backups from
  owner-portable exports: `export_app_state` writes dated backup files under the
  app-data backup directory, while `save_app_state_export` writes dated export
  JSON files under an app-data export directory and returns the concrete path.
- `apps/desktop/src/storage/persistence.ts` now exposes
  `exportAppStateAsPortableFile()`. In Tauri it uses the native export command;
  in browser/dev mode it returns the same validated snapshot payload for the
  existing download fallback without mutating managed state or backup history.
- `apps/desktop/src/pages/SettingsPage.tsx` now reports the native export path
  when available, disables export while a data operation is running, and shows a
  compact rotation/location boundary for snapshot, backup, export, and restore.
- Focused tests passed:
  `pnpm test:run apps/desktop/src/storage/persistence.test.ts apps/desktop/src/pages/SettingsPage.test.tsx`
  with 17 tests, covering portable browser export behavior and Settings
  rotation/location guidance.
- Focused verification passed:
  `pnpm lint --write apps/desktop/src/storage/persistence.ts apps/desktop/src/storage/persistence.test.ts apps/desktop/src/pages/SettingsPage.tsx apps/desktop/src/pages/SettingsPage.test.tsx apps/desktop/src-tauri/src/lib.rs`
  and `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`.
- Broader verification after the Tauri export command passed:
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`,
  full `pnpm test:run` with 253 tests, `pnpm build`, `pnpm check`,
  `pnpm e2e` with 14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-047 for current local release scope. Final native
  export path behavior should still be rechecked during final packaged QA, but
  the product surface no longer relies on a browser-only export path inside the
  macOS app.

## 2026-05-24 Ritual Timer And Native Meditation QA Evidence

- `packages/machines/src/meditation.ts` now treats the configured duration as a
  real timer boundary: `TICK` clamps elapsed time to `durationMs` and transitions
  the meditation machine to `completed` when the target is reached.
- `apps/desktop/src/pages/ritual/MeditationStep.tsx` now advances to Reflection
  from the machine's completed state, so both manual completion and elapsed
  duration completion use the same transition path.
- Focused tests passed:
  `pnpm test:run packages/machines/__tests__/meditation.test.ts apps/desktop/src/pages/RitualPage.test.tsx`
  with 21 tests. New coverage verifies elapsed-time clamping, automatic
  Reflection transition when the configured duration elapses, and opening plus
  closing bell `AudioContext` cue invocation when bell sound is configured.
- Focused Biome passed for the touched meditation machine, Ritual page, and
  meditation step files.
- Rebuilt the unsigned packaged app with
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`
  before native QA.
- Computer Use native QA passed on the rebuilt `AttentionOS.app` with an
  isolated 1-minute Ritual state. The packaged app rendered target `1:00`,
  guidance `Body scan`, sound cue `Opening and closing bell`, manual-only
  cadence, and QA intention copy; Start exposed Pause/Complete and set breath to
  `In rhythm`; elapsed time advanced; Pause exposed Resume and kept elapsed
  stable at `0:21`; Resume returned to `In rhythm`; after the configured
  duration the app advanced to Reflection without clicking Complete.
- Full verification after the Ritual changes passed: `pnpm docs:check`,
  `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 256 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with
  14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Native evidence lives at
  `.gstack/qa-reports/release-candidate-native-ritual-timer-2026-05-24/report.md`
  with screenshots and copied app-support state. Original native app state was
  restored and no `attentionos-desktop` process remained.
- Boundary: Computer Use verifies the sound setting label and source/tests verify
  the bell cue path; this pass did not perform audio capture or subjective
  loudness validation. macOS fullscreen/scheduled launch and notification
  behavior remain tracked separately under RC-020/RC-042.

## 2026-05-24 Reflection Recovery And Export Slice Evidence

- `apps/desktop/src/storage/reflections.ts` now quarantines malformed
  `attentionos.reflections.v1` payloads into
  `attentionos.reflections.corrupt.v1`, records a recovery issue, clears the
  malformed active key, and preserves valid follow-up target normalization.
- `apps/desktop/src/pages/ritual/ReflectionStep.tsx` now checks reflection
  storage when the Reflection step opens, shows a visible recovery alert when a
  malformed payload was preserved, supports clearing that warning without
  deleting the preserved corrupt payload, and exposes a stage-specific empty
  state while Save is disabled.
- `apps/desktop/src/storage/reflections.test.ts` covers valid reflection
  persistence, malformed-payload quarantine, saving after recovery, and warning
  clearing.
- `apps/desktop/src/storage/persistence.test.ts` now verifies valid Ritual
  reflections export and restore through a portable app-state snapshot.
- `apps/desktop/src/pages/RitualPage.test.tsx` covers the empty Reflection state
  and visible malformed-storage recovery before accepting a new note.
- Focused verification passed:
  `pnpm test:run apps/desktop/src/storage/reflections.test.ts apps/desktop/src/storage/persistence.test.ts apps/desktop/src/pages/RitualPage.test.tsx`
  with 24 tests, plus focused Biome for the touched Reflection, persistence,
  and Ritual test files.
- Full verification after the Reflection changes passed: `pnpm docs:check`,
  `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 263 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with
  14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-016 for current local release scope. Broader
  workflow-level error states remain tracked under RC-050, and final packaged
  cross-flow QA should recheck Reflection after any storage architecture changes.

## 2026-05-24 Hierarchy Import Validation Slice Evidence

- `apps/desktop/src/storage/taskValidation.ts` now exposes hierarchy validation
  for imported snapshots and existing local edits. It validates entity shape,
  duplicate ids, strict parent progression for imports, task-under-project and
  project-under-goal/project rules, one-subproject-layer limit, project-signal
  classification, task duration bounds, execution-role vocabulary, one current
  action per project, and the three-candidate cap.
- `apps/desktop/src/storage/persistence.ts` now validates
  `attentionos.hierarchy.v1` snapshot entries before applying an imported
  backup, so invalid project/task hierarchy data fails before mutation.
- `apps/desktop/src/storage/hierarchy.ts` now validates hierarchy writes before
  saving role edits, created entities, or AI-generated decomposition tasks.
- Import validation is strict about full parent progression. Existing local
  hierarchy edits use compatibility validation so older partial data is not
  rejected solely for missing legacy ancestry before the relevant edit invariant
  is checked.
- Focused tests passed:
  `pnpm test:run apps/desktop/src/storage/persistence.test.ts apps/desktop/src/storage/hierarchy.test.ts apps/desktop/src/ai/taskDecompositionWorkflow.test.ts apps/desktop/src/pages/ExecutionPage.test.tsx`
  with 37 tests, plus focused Biome for the touched validation, hierarchy, and
  persistence files.
- Full verification after the hierarchy validation changes passed:
  `pnpm docs:check`, `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 266 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with
  14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-033 for imported snapshots and current local
  hierarchy edits. Broader user-facing hierarchy editing remains limited by the
  current Execution Plan create/select surface; future edit forms must use the
  same validation before persistence.

## 2026-05-24 Execution Plan Sorting And Project Limit Evidence

- `apps/desktop/src/storage/hierarchy.test.ts` now verifies
  `listExecutionPlanTasks()` orders project actions as one current action,
  candidate actions by creation time, then later-list/backlog actions.
- The same focused test file now verifies current next-action limits are
  project-specific across persisted reads: two different projects can each keep
  one current action, while the global focus candidate follows the most recently
  selected current action.
- Existing hierarchy validation also rejects more than one current action or
  more than three candidate actions per project when imported snapshots or
  validated writes are applied.
- Focused verification passed:
  `pnpm test:run apps/desktop/src/storage/hierarchy.test.ts` with 7 tests, plus
  focused Biome for `apps/desktop/src/storage/hierarchy.test.ts`.
- Full verification after the sorting/project-limit coverage passed:
  `pnpm docs:check`, `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 268 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with
  14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-028 for the current local Execution Plan model.
  Final packaged cross-flow QA should still recheck user-created competing
  actions in the native app after any Plan UI changes.

## 2026-05-24 Overview Risk Trend Context Signal Evidence

- `apps/desktop/src/pages/overview/OverviewSignalsPanel.tsx` adds a read-only
  Overview section for risks, trends, and context signals. It derives risk from
  local attention overload/average-score data and oversized active tasks, trend
  from average attention, volatility, sample count, and completion, and context
  from visible hierarchy-layer count, marked Ritual follow-up inputs, and pending
  AI optimizations.
- `apps/desktop/src/pages/OverviewPage.tsx` renders the signal panel between the
  Vision timeline and the existing Learning snapshot, preserving the current
  Overview ordering: direction first, then risk/trend/context orientation, then
  metrics and read-only branch navigation.
- `apps/desktop/src/pages/OverviewPage.test.tsx` verifies the new region is
  present, remains read-only, surfaces elevated risk from local overloaded
  evidence, displays the attention trend and sample count, and shows marked
  Ritual context input without create/edit/delete/decompose/approve controls.
- Focused verification passed:
  `pnpm test:run apps/desktop/src/pages/OverviewPage.test.tsx` with 3 tests,
  plus focused Biome for the touched Overview files. A first `pnpm build` retry
  failed because the new test fixture omitted the required `V2Entity.entityType`;
  the fixture was corrected and the focused test/Biome rerun passed.
- Full verification after the Overview signal changes passed:
  `pnpm docs:check`, `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 269 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with
  14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-023 for the current local Overview surface. Final
  packaged QA should still recheck the Overview signal panel in the native app
  after broader task overview or context-capture changes.

## 2026-05-24 Task Overview Browsing Evidence

- `apps/desktop/src/pages/overview/TaskOverviewModesPanel.tsx` adds a read-only
  Task-layer Overview panel for day/week/month browsing, project grouping, and
  four-quadrant task scanning. It appears only when the hierarchy scan is at the
  task layer, keeping Vision/Area/Goal/Project layers visually distinct.
- The panel derives all active tasks from local hierarchy state, groups them by
  Day, Week, or Month and then by parent project title, and classifies them into
  four lanes: Do next, Schedule, Shrink or delegate, and Later list. It does not
  create, edit, split, approve, or route work by itself.
- `apps/desktop/src/pages/OverviewPage.test.tsx` now seeds multiple projects and
  tasks, drills into the task layer, verifies Day/Week/Month switching, confirms
  project grouping, and verifies all four quadrant labels plus representative
  tasks.
- Focused verification passed:
  `pnpm test:run apps/desktop/src/pages/OverviewPage.test.tsx` with 4 tests,
  plus focused Biome for the touched Overview files. Two Biome retries caught
  an invalid `aria-label` on a plain `div` and then a non-semantic `role=group`;
  the date selector was corrected to `fieldset` plus `legend`.
- Full verification after the Task Overview changes passed:
  `pnpm docs:check`, `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 270 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with
  14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-035 and RC-036 for the current local Overview task
  browsing scope. Final native QA should still recheck the Task Overview panel
  after broader hierarchy editing or calendar integration changes.

## 2026-05-24 Five-Layer Hierarchy Semantics Evidence

- `apps/desktop/src/pages/OverviewPage.test.tsx` now seeds a custom persisted
  `vision -> area -> goal -> project -> task` hierarchy in local storage instead
  of relying only on default examples, then verifies Overview loads that data and
  preserves the five-layer navigation path.
- The test verifies layer-specific visual/behavior semantics at each level:
  Vision renders the timeline panel, Area renders domain-scan copy, Goal renders
  outcome/constraint copy, Project renders project-path copy, and Task renders
  executable-unit copy plus the Task Overview browsing panel and execution
  bridge.
- Existing source evidence covers data and navigation semantics through
  `HierarchyLayer`, `V2Entity.hierarchyLayer`, `hierarchyNavMachine`,
  `useHierarchyNav`, `HierarchyBreadcrumb`, and persisted hierarchy storage.
  Execution Plan separately creates and validates project/task entities under
  the same hierarchy model.
- Focused verification passed:
  `pnpm test:run apps/desktop/src/pages/OverviewPage.test.tsx` with 5 tests,
  plus focused Biome for the touched Overview test.
- Full verification after the five-layer custom hierarchy evidence passed:
  `pnpm docs:check`, `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 271 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with
  14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-011 for current product behavior, data, navigation,
  and visual semantics. If broader direct Vision/Area/Goal edit surfaces are
  added later, they must reuse the same hierarchy validation and visual layer
  separation.

## 2026-05-24 Stage-Specific Empty State Evidence

- `apps/desktop/src/pages/overview/EntityList.tsx` now renders layer-specific
  empty states for Vision, Area, Goal, Project, and Task instead of the generic
  "No entities in this layer." message. The copy keeps Overview read-only and
  points users toward restore/import, planning structure, Execution Plan, or
  Focus as appropriate for the current layer.
- `apps/desktop/src/pages/ExecutionPage.tsx` now renders an empty Ritual
  follow-up input state in Execution Plan and clarifies that marked notes appear
  only as drafts and create nothing until reviewed. The Plan queue empty state
  now names the next actions: create a clarified task, draft from Ritual input,
  or return to Overview before choosing one current action.
- `apps/desktop/src/pages/OverviewPage.test.tsx` verifies an empty persisted
  hierarchy shows a Vision-specific empty state and still surfaces read-only
  Overview context. `apps/desktop/src/pages/ExecutionPage.test.tsx` verifies no
  focus candidate, no Ritual inputs, and the clarified-task queue guidance.
- Focused verification passed:
  `pnpm test:run apps/desktop/src/pages/OverviewPage.test.tsx apps/desktop/src/pages/ExecutionPage.test.tsx`
  with 20 tests, plus focused Biome for the touched Overview/Execution files.
  Two focused test attempts failed because the Execution empty-state fixture
  still included the default planned task; the test fixture was narrowed to a
  project with no task before the rerun passed.
- Full verification after the empty-state changes passed:
  `pnpm docs:check`, `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 272 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with
  14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-049 for the current primary routes. Final native QA
  should still recheck empty-state layout and keyboard traversal in the packaged
  app.

## 2026-05-24 Storage Recovery Error State Evidence

- `apps/desktop/src/storage/storageRecovery.ts` now keeps a dedicated local
  recovery ledger for malformed helper-storage entries. It records the affected
  storage key, error message, fallback behavior, original payload size, and a
  preserved copy of the malformed payload.
- Settings, onboarding, reminder settings, Ritual copy/settings, AI
  suggestions, learning observations, audit log reads, task runtime recovery,
  and hierarchy reads now record malformed local payloads before falling back to
  safe defaults or empty queues. The hierarchy path preserves the malformed
  payload before writing default seed data back into `attentionos.hierarchy.v1`.
- `apps/desktop/src/components/layout/Shell.tsx` now surfaces generic local
  storage recovery warnings globally, and `apps/desktop/src/pages/SettingsPage.tsx`
  shows the detailed recovery entries with a clear action. Clearing storage
  warnings removes only the recovery warning/payload copies and leaves app data
  untouched.
- Focused verification passed:
  `pnpm test:run apps/desktop/src/storage/storageRecovery.test.ts apps/desktop/src/storage/privacySettings.test.ts apps/desktop/src/storage/hierarchy.test.ts apps/desktop/src/pages/SettingsPage.test.tsx apps/desktop/src/App.test.tsx`
  with 29 tests, plus focused Biome for the touched Shell, Settings, and storage
  files. One focused Biome attempt failed on an unnecessary hook dependency in
  the shell recovery banner; the route dependency was removed and the rerun
  passed.
- Full verification after the storage-recovery changes passed:
  `pnpm docs:check`, `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 276 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with
  14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-050 for current local parse/import/runtime error
  states. Final release-readiness still needs manual/native accessibility,
  packaged native performance, and final cross-flow evidence under their own
  rows.

## 2026-05-24 Release Metrics And Guardrail Evidence

- `apps/desktop/src/storage/releaseMetrics.ts` now derives release metrics from
  existing local evidence instead of adding surveillance or external collection:
  attention observations, execution audit entries, hierarchy tasks, AI
  suggestions, reflection inputs, and reminder settings.
- `apps/desktop/src/pages/overview/ReleaseMetricsPanel.tsx` renders a read-only
  Overview panel for attention ratio, switching pressure, recovery cues, focus
  success, plan fulfillment, reminder load, recording friction, autonomy kept,
  and misjudgment signal. The panel exposes status labels but no mutation or AI
  approval controls.
- `apps/desktop/src/storage/releaseMetrics.test.ts` verifies the metric
  calculations from seeded local observations/audit/tasks/settings. The Overview
  regression test verifies the metrics and guardrails are visible in the product
  surface and remain read-only.
- Focused verification passed:
  `pnpm test:run apps/desktop/src/storage/releaseMetrics.test.ts apps/desktop/src/pages/OverviewPage.test.tsx`
  with 8 tests, plus focused Biome for the touched metrics, Overview, and test
  files.
- Full verification after the release-metrics changes passed:
  `pnpm docs:check`, `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 278 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with
  14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-043 and RC-044 for the current local release scope.
  The metrics are derived from local app evidence and do not enable passive
  sensing, telemetry, native notification scheduling, provider calls, or
  external uploads.

## 2026-05-24 Interruption Recovery Cue Evidence

- `apps/desktop/src/storage/taskRuntime.ts` now exposes the current persisted
  Focus runtime without requiring a caller to already know the task id, while
  preserving the existing task-specific read path.
- `apps/desktop/src/pages/OverviewPage.tsx` now shows a bounded interruption
  recovery cue when a paused/executing/reviewing Focus runtime exists. The cue
  names the task, saved minutes, and runtime state, then bridges to Execution
  Plan without creating, editing, approving, or splitting work.
- `apps/desktop/src/pages/ExecutionPage.tsx` now shows a Plan-mode recovery cue
  before the focus candidate detail when a saved runtime exists. The cue gives
  the next step, saved minutes, current state, and an explicit `Continue in
  Focus` action while keeping planning helper lanes out of Focus.
- Focused verification passed:
  `pnpm test:run apps/desktop/src/storage/taskRuntime.test.ts apps/desktop/src/pages/ExecutionPage.test.tsx apps/desktop/src/pages/OverviewPage.test.tsx`
  with 25 tests, plus focused Biome for the touched runtime, Overview, and
  Execution files.
- Full verification after the interruption-recovery changes passed:
  `pnpm docs:check`, `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 279 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with
  14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-041 for current local interruption recovery. It does
  not add native notifications, passive monitoring, or broader OS-level
  interruption detection.

## 2026-05-24 Context Capture Bus Evidence

- `apps/desktop/src/storage/contextCapture.ts` now persists local context
  captures under `attentionos.contextCaptures.v1` with bounded channels for
  idea, task, project, and calendar. Malformed capture storage is preserved in
  the shared recovery ledger before falling back safely.
- `apps/desktop/src/pages/CapturePage.tsx` adds a dedicated Capture surface
  reachable from the desktop sidebar and mobile navigation. A single note can
  be assigned to multiple channels, optionally include a calendar reference,
  and remain visible in the recent-captures list.
- `apps/desktop/src/pages/ExecutionPage.tsx` now reads task/project capture
  channels as planning inputs. Execution Plan can prefill the human create form
  from a captured input, but it does not auto-create tasks or projects and does
  not move any approval control into Overview.
- `apps/desktop/src/storage/persistence.ts` includes context captures in the
  managed app-state snapshot, so backup/export/import validation covers the new
  capture store alongside the existing release-candidate data keys.
- Focused verification passed:
  `pnpm test:run apps/desktop/src/storage/contextCapture.test.ts apps/desktop/src/pages/CapturePage.test.tsx apps/desktop/src/pages/ExecutionPage.test.tsx apps/desktop/src/App.test.tsx apps/desktop/src/storage/persistence.test.ts`
  with 37 tests.
- Full verification after the context-capture changes passed:
  `pnpm docs:check`, `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 283 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with
  14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-037 for the current local release scope. The capture
  bus is deliberately local and human-reviewed; it does not add passive
  monitoring, calendar API integration, provider calls, or automatic hierarchy
  mutation.

## 2026-05-24 AI Suggestion Rollback Evidence

- `apps/desktop/src/storage/hierarchy.ts` now archives only active,
  AI-generated tasks whose `sourceSuggestionId` matches the applied
  task-decomposition suggestion. The rollback preserves original task snapshots
  for audit and clears the focus candidate if that candidate was archived.
- `apps/desktop/src/ai/taskDecompositionWorkflow.ts` now verifies that a
  suggestion is applied, finds the audited created task ids from the original
  approval entry, records `ai.suggestion.rollback`, and can restore archived
  tasks from the rollback audit snapshot with a separate
  `ai.suggestion.rollback.restored` entry.
- `apps/desktop/src/pages/execution/AiDecompositionPanel.tsx` exposes this as a
  human-triggered `Undo AI-created tasks` / `Restore AI-created tasks` path in
  Execution Plan. The action does not auto-run and does not move AI controls
  into Focus or Overview.
- Focused verification passed:
  `pnpm test:run apps/desktop/src/ai/taskDecompositionWorkflow.test.ts apps/desktop/src/pages/ExecutionPage.test.tsx apps/desktop/src/storage/hierarchy.test.ts apps/desktop/src/storage/aiSuggestions.test.ts`
  with 36 tests. The first focused Biome check failed on formatting only; Biome
  formatted the touched files and the rerun passed.
- Full verification after the rollback changes passed:
  `pnpm docs:check`, `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 284 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with
  14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-006 for current local AI task-decomposition actions.
  Workflow-optimization review suggestions remain non-mutating today; if future
  provider-backed suggestions can change durable workflow configuration, they
  must add equivalent audit and rollback/compensation evidence.

## 2026-05-24 Attention Calibration Evidence

- `apps/desktop/src/storage/learning.ts` now records local attention calibration
  observations from subjective clarity/energy/distractibility/stress, manual
  behavior signals such as app-switch and session-fragment counts, and a small
  probe input. The saved `V2AttentionObservationRecord` keeps subjective,
  passive, and behavioral breakdown scores plus confidence.
- `apps/desktop/src/pages/settings/AttentionCalibrationPanel.tsx` exposes this
  as a Settings-only manual calibration surface. The user can accept the local
  estimate or correct it to focused, drifting, overloaded, or fatigued. The
  correction is preserved in the observation reasons and the data remains in
  the local learning observation store included in app-state snapshots.
- `packages/core/src/utils.ts` now uses browser-safe `globalThis.crypto` for
  `createId`, avoiding the previous `node:crypto` browser bundle failure when
  desktop code imports attention estimation logic.
- Focused verification passed:
  `pnpm test:run apps/desktop/src/storage/learning.test.ts apps/desktop/src/pages/SettingsPage.test.tsx apps/desktop/src/storage/releaseMetrics.test.ts apps/desktop/src/pages/OverviewPage.test.tsx`
  with 21 tests, plus
  `pnpm test:run packages/core/__tests__/utils.test.ts apps/desktop/src/storage/learning.test.ts apps/desktop/src/pages/SettingsPage.test.tsx`
  with 25 tests after the browser-safe ID fix. The first focused test attempt
  failed until the desktop workspace dependency link for
  `@attentionos/attention-engine` was refreshed.
- Full verification after the calibration changes passed:
  `pnpm docs:check`, `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 287 tests, `pnpm build`, `pnpm check`, final
  `pnpm e2e` with 14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-040 for current local release scope. The calibration
  path is manual and local; it does not enable passive monitoring, background
  sensing, provider calls, or automatic intervention.

## 2026-05-24 Attention-First Screen Audit Evidence

- Current route evidence covers all release-critical screens:
  `OnboardingPage`, `RitualPage`, `OverviewPage`, `ExecutionPage` Plan/Focus,
  `CapturePage`, `SettingsPage`, and `Shell`.
- Onboarding frames the product as a Personal Attention OS and directs the user
  into Ritual rather than a generic dashboard. Ritual settles attention before
  work and can carry reflection/dedication inputs forward without forcing a
  planning detour.
- Overview remains a read-only scan surface with hierarchy, timeline, risk,
  trend, context, recovery, task-browsing, and metrics panels. Its controls
  bridge into Execution while preserving context rather than creating/editing
  work in place.
- Execution Plan keeps planning, capture inputs, Ritual inputs, and AI review in
  explicit human-review lanes. Execution Focus protects a single current action,
  hides planning/helper lanes, supports progress/recovery/intentional exit, and
  can resume persisted runtime.
- Capture reduces context-switching by letting one input fan out to task,
  project, idea, and calendar channels without auto-creating work. Settings
  keeps recovery, backup/export/import, privacy/reminder intent, and attention
  calibration outside the daily Focus surface.
- Verification evidence for this audit uses the current source scan plus the
  final post-RC-040 checks: `pnpm e2e` with 14 Chromium tests, including the
  performance smoke budgets for launch, onboarding, Ritual -> Overview,
  stage navigation, Plan -> Focus, Focus controls, Settings snapshot feedback,
  and corrupt recovery warning.
- Boundary: this closes RC-003 for current local release scope. Future visual
  redesign, new routes, provider-backed AI, passive sensing, or native
  notification behavior must be rechecked against the same attention-first
  boundary.

## 2026-05-24 Integration Boundary Evidence

- `apps/desktop/src/pages/settings/IntegrationBoundaryPanel.tsx` now makes the
  release integration boundary visible in Settings: the current build does not
  monitor apps, screens, messages, browser activity, or calendar data in the
  background.
- The panel states that current integration behavior is limited to manual
  Capture, local snapshots, and human-reviewed AI suggestions. Future plugins,
  APIs, and auto-open behavior must declare permissions, stay scoped,
  user-approved, and auditable before touching external apps.
- This closes the product-facing no-surveillance boundary without starting
  Phase 4 protocol work. `packages/sdk` and `packages/mcp` remain placeholders,
  and `docs/plans/2026-05-09-phase-4-intake.md` remains a draft intake rather
  than an accepted implementation contract.
- Focused verification passed:
  `pnpm test:run apps/desktop/src/pages/SettingsPage.test.tsx apps/desktop/src/App.test.tsx`
  with 18 tests.
- Full verification after the integration-boundary changes passed:
  `pnpm docs:check`, `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 288 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with
  14 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
  Package inspection confirmed `CFBundleIdentifier=com.yannjy.attentionos`,
  `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`,
  `CFBundlePackageType=APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-038 for current local release scope. It does not
  implement plugin loading, MCP/SDK protocol surfaces, external app operation,
  passive sensing, or background monitoring.

## 2026-05-24 Local-First Storage Boundary Evidence

- The current desktop persistence boundary covers every primary product storage
  key. A storage-key audit found 14 primary product keys and all 14 are managed
  by `PERSISTED_STORAGE_KEYS`: hierarchy, focus candidate, reflections,
  onboarding, ritual copy/settings/schedule, privacy settings, reminder
  settings, task runtime, AI suggestions, learning observations, audit entries,
  and context captures.
- The only storage constants outside that primary managed set are persistence
  metadata and recovery/quarantine metadata such as corrupt payload ledgers.
  These are local diagnostic records rather than user workflow/context state.
- The native app uses Tauri commands to read/write `attentionos-state.json`
  under the app data directory, write it atomically, create backup/export files,
  and quarantine corrupt native state into a local recovery directory.
- `App.tsx` waits for `initializeAppPersistence()` before route content reads
  onboarding or workspace defaults when a native/browser restore may be needed.
  Browser fallback tests verify snapshot restore before route content reads
  defaults; packaged native QA already verified app-data restore, corrupt-state
  quarantine, Settings backup/import, and Focus runtime recovery after relaunch.
- A bounded desktop/network scan found no desktop import of
  `@attentionos/storage`, Supabase, or sync packages, and no active desktop
  `fetch`, WebSocket, EventSource, `sendBeacon`, telemetry sender, or analytics
  sender. Settings and onboarding state that cloud sync, external AI calls, and
  telemetry remain off unless a future owner-approved setup enables them.
- Boundary: this closes RC-004 for current local release scope. Runtime helpers
  still use localStorage as the browser/WebView working cache, but the release
  product state is mirrored to app-local native persistence, exportable as
  user-controlled JSON, and not backed by cloud as the primary store.

## 2026-05-24 Accessibility Automation Slice Evidence

- `apps/desktop/src/App.css` now adds a global `focus-visible` outline for
  links, buttons, inputs, selects, textareas, summaries, and tabindex targets.
  It also adds a `prefers-reduced-motion: reduce` boundary that removes visible
  Tailwind transition/animation durations through normal cascade rules.
- `e2e/accessibility.spec.ts` now checks route-level accessible names and
  landmarks, visible text contrast, a keyboard-only primary workflow from
  onboarding through Ritual, Overview, Execution Plan, Execution Focus, and
  completion, plus reduced-motion transition/animation behavior.
- Focused accessibility verification passed:
  `pnpm exec playwright test e2e/accessibility.spec.ts --project=chromium`
  with 8 Chromium tests.
- Full post-change verification passed: `pnpm docs:check`, `pnpm lint`,
  `git diff --check`, `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`,
  full `pnpm test:run` with 288 tests, `pnpm build`, `pnpm check`,
  `pnpm e2e` with 16 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
- Native packaged accessibility verification is still not complete. Computer
  Use attempts against the rebuilt `AttentionOS.app` could not obtain a
  packaged app window (`cgWindowNotFound`). A full-screen capture showed the
  macOS login/lock screen, and CoreGraphics/macOS logs showed spawned
  AttentionOS windows as occluded despite WebKit page load milestones. This
  keeps VoiceOver/native packaged app accessibility open until the owner can
  provide an unlocked GUI session.

## 2026-05-24 Read-Only Protocol Contract Evidence

- `packages/sdk/src/index.ts` now defines the stable
  `attentionos.read.v1` read contract for local app state: workflow stage,
  hierarchy/entities, execution state, AI suggestions, attention observations,
  and audit log resources.
- `packages/mcp/src/index.ts` now maps the same SDK contract into an MCP
  manifest named `attentionos-local-readonly`. The manifest exposes read-only
  resources and an empty tools list, so it cannot mutate local state, control
  external apps, load plugins, or perform sync.
- SDK and MCP package tests verify that capabilities remain local,
  user-approved, and read-only; that resources stay stable across the SDK/MCP
  boundary; that the SDK snapshot shape does not add tool/write behavior; and
  that accidental write-tool exposure is rejected.
- Focused protocol verification passed:
  `pnpm --filter @attentionos/sdk test` with 4 tests,
  `pnpm --filter @attentionos/mcp test` with 2 tests,
  `pnpm --filter @attentionos/sdk check`,
  `pnpm --filter @attentionos/mcp check`, and `pnpm lint`.
- Full verification after the protocol changes passed: `pnpm docs:check`,
  `git diff --check`, `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`,
  full `pnpm test:run` with 294 tests, `pnpm build`, `pnpm check`,
  `pnpm e2e` with 16 Chromium tests, and
  `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`.
- Boundary: this closes RC-007 for release-candidate protocol readiness only.
  It does not start the broader draft Phase 4 implementation: no MCP server
  runtime, MCP client, write tools, plugin marketplace/loading, local auth
  mechanism, external app operation, offline sync, or desktop refactor around
  protocol abstractions was added.

## 2026-05-24 macOS Package Readiness Evidence

- Tauri release metadata now includes App Store category `Productivity`,
  copyright, short/long descriptions, explicit `hardenedRuntime: true`, a
  macOS `Info.plist` merge file, and a macOS entitlements file.
- `Info.plist` adds `ITSAppUsesNonExemptEncryption=false` for the current
  local/no-network release build and a human-readable copyright string.
  The rebuilt bundle now contains
  `LSApplicationCategoryType=public.app-category.productivity` and
  `ITSAppUsesNonExemptEncryption=false`.
- `Entitlements.plist` declares the App Sandbox entitlement required for a
  signed App Store build. Signed entitlement application still requires a
  real Apple signing identity/profile and is tracked under RC-056.
- `scripts/check-macos-release-readiness.mjs` and
  `pnpm release:check:macos` now provide a repeatable local package audit.
  The check verifies Tauri identity, CSP, window bounds, capability surface,
  macOS metadata files, generated bundle identity/version/category/encryption
  flag/icons, DMG image validity, and Mach-O dependency resolution.
- Focused release-package verification passed after rebuilding with
  `pnpm --filter @attentionos/desktop tauri build --bundles app,dmg --no-sign --ci`.
  `pnpm release:check:macos` then reported 27 checks, 0 failures, and 4
  external blockers: distribution signing identity, strict bundle code
  signature verification, signed App Sandbox entitlements, and
  notarization/App Store upload.
- Full verification after the package-readiness changes passed:
  `pnpm docs:check`, `pnpm lint`, `git diff --check`,
  `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full
  `pnpm test:run` with 294 tests, `pnpm build`, `pnpm check`,
  `pnpm e2e` with 16 Chromium tests,
  `pnpm --filter @attentionos/desktop tauri build --bundles app,dmg --no-sign --ci`,
  and `pnpm release:check:macos` with 27 checks, 0 failures, and 4 external
  blockers.
- Current official-reference basis: Apple states Mac App Store apps must enable
  App Sandbox, Developer ID distribution requires Apple Developer credentials
  and notarization, and App Store Connect upload requires an explicit App ID,
  distribution certificate/profile, and upload credentials. Tauri v2's current
  App Store guide requires category, provisioning profile, encryption export
  Info.plist, App Sandbox entitlements, code signing, a signed `.pkg`, and App
  Store Connect upload credentials.
- Boundary: this closes RC-055 for local package metadata, bundle identity,
  App Store category, CSP, reduced Tauri capability, entitlements-file
  readiness, and repeatable package audit. It does not close RC-056:
  Developer ID or Apple Distribution signing, signed entitlements,
  notarization, App Store `.pkg` creation, TestFlight/App Store upload,
  certificate/profile/account actions, final legal/privacy confirmation, and
  release submission still require owner credentials and explicit
  authorization.

## 2026-05-24 Native Performance Timing Evidence

- The Tauri backend now has an opt-in `record_qa_ready` command. It writes a
  readiness marker only when `ATTENTIONOS_QA_READY_FILE` is present, and is
  inert for normal users. The marker is emitted from the desktop app only after
  native/browser persistence initialization has completed and React has
  rendered the ready app shell.
- `scripts/check-native-performance.mjs` and `pnpm performance:check:macos`
  now measure the rebuilt packaged app executable against clean native
  scenarios while preserving the canonical app-data snapshot. The script clears
  AttentionOS-specific WebKit/cache working data between scenarios so WebView
  localStorage cannot mask native restore or corrupt-state recovery behavior.
- Native timing verification passed against the freshly rebuilt packaged app:
  `validSnapshotReady` completed in 1533 ms against an 8000 ms budget, and
  `corruptSnapshotRecovery` completed in 509 ms against a 10000 ms budget. The
  corrupt scenario also verified that native recovery rewrites a valid
  `attentionos-state.json` snapshot and creates a recovery directory.
- Full affected verification passed afterward with `pnpm docs:check`,
  `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with
  294 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 16 Chromium tests,
  unsigned `.app`/`.dmg` packaging, `pnpm release:check:macos`, and
  `pnpm performance:check:macos`.
- Boundary: this improves RC-059 with automated native launch/persistence/error
  recovery timing evidence while the macOS GUI session is locked. It does not
  replace final manual/native usability review, VoiceOver checks, or
  cross-flow Computer Use QA after the owner provides an unlocked GUI session.

## 2026-05-24 Production Browser Workflow QA Evidence

- `scripts/qa-browser-release-workflow.mjs` and `pnpm qa:browser:release` now
  build the desktop frontend, serve the production bundle through Vite preview
  on `127.0.0.1:1422`, drive the canonical daily workflow in Chromium, capture
  screenshots, and fail if page errors or console errors occur.
- The latest run passed and wrote evidence under
  `.gstack/qa-reports/release-candidate-browser-workflow-2026-05-24-04-00-25/`.
  The report contains 11 screenshots covering onboarding consent, Ritual
  meditation/reflection/dedication follow-up, read-only Overview, the five-layer
  hierarchy, Overview -> Execution Plan bridging, Execution Focus planning and
  reviewing states, completion back to Overview, Settings local snapshot, and
  mobile-width stage navigation.
- Console evidence for that run showed 0 console messages, 0 console errors, and
  0 page errors against the production browser bundle.
- Boundary: this strengthens RC-058 with repeatable browser-surface screenshot
  and console evidence. It does not replace packaged native GUI inspection,
  VoiceOver checks, App Store signing/notarization, or owner decisions for
  fullscreen launch and native notifications.

## 2026-05-24 Owner Decision Packet

- Added
  `docs/plans/2026-05-24-attentionos-release-candidate-owner-decision-packet.md`
  as the explicit owner-unblock surface for the remaining non-terminal release
  rows.
- The packet is a draft plan artifact, not an accepted decision. It asks the
  owner to choose concrete paths for RC-020 fullscreen/scheduled Ritual behavior,
  RC-042 native notification scheduling, RC-051/RC-058/RC-059 native GUI and
  VoiceOver evidence, and RC-056 Apple distribution credentials.
- The goal remains active and incomplete until the relevant owner choices are
  confirmed and this ledger is updated to terminal statuses with current
  evidence.

## 2026-05-24 Owner RC Decisions Recorded

- Owner reply recorded in-session on 2026-05-24:
  `D1=A, D2=C, D3=A, D4=B`.
- D1=A explicitly defers fullscreen/scheduled Ritual launch for this release
  candidate. RC-020 is therefore terminal as an owner-approved RC deferral;
  manual Ritual entry and native packaged Ritual rendering remain the verified
  RC behavior.
- D2=C explicitly expands RC-042 from local reminder intent into broader
  integration reminders. This keeps RC-042 open: the next slice must narrow the
  integration-reminder contract against the product boundary of plugin/API/
  auto-open integrations, minimal permissions, no broad surveillance, explicit
  consent, quiet windows, fatigue limits, auditability, and rollback where
  feasible.
- D3=A authorizes another native GUI, VoiceOver/manual accessibility, and
  usability verification attempt with Computer Use after the owner unlocks or
  exposes the macOS GUI session.
- D4=B selects the Developer ID release path. This authorizes local inspection
  for Developer ID signing/notarization prerequisites, but does not by itself
  provide certificates, notary credentials, or permission to upload/submit any
  build.

## 2026-05-24 Native GUI And Developer ID Evidence

- Computer Use now reaches the packaged `AttentionOS.app` window and no longer
  returns `cgWindowNotFound` in the current GUI session.
- Packaged native QA covered onboarding consent, Ritual meditation start/manual
  completion, Reflection entry with task carry-forward, Dedication, Overview
  read-only Vision/Area/Goal/Project/Task traversal, Task-layer bridge into
  Execution Plan, pending Ritual input visibility, Focus entry, Start task,
  Add 5 minutes, Submit for review, Complete task, and return to Overview.
- The Computer Use accessibility tree exposed the relevant native WebView roles,
  labels, values, and states for headings, links, checkboxes, text fields,
  disabled/enabled buttons, Focus task state, and timer/progress values. This
  supplies native screen-reader semantic evidence alongside the existing
  Playwright keyboard, contrast, and reduced-motion checks.
- Developer ID prerequisite audit found two Apple Development identities and no
  Developer ID Application identity in the current codesigning keychain output.
  `xcrun notarytool` is available, but no `APPLE_*`, `AC_*`, `TAURI_*`,
  `CSC_*`, `CODESIGN_*`, `NOTARY*`, or `MACOS_*` credential environment names
  are present. The current bundle remains ad hoc/linker signed with no Team ID,
  and `pnpm release:check:macos` still reports 27 checks, 0 failures, and 4
  external blockers for distribution signing, strict signature verification,
  signed entitlements, and notarization/upload.

## 2026-05-24 Integration Reminder Handoff Slice

- D2=C was implemented as a conservative local handoff contract rather than
  background OS notifications or surveillance. Settings now stores explicit
  integration reminder channels for calendar-file, Focus handoff, and app
  auto-open targets, plus a user-visible permission statement and a daily cap
  clamped to 1-6 prompts.
- No external app is launched, no calendar is read or written, no macOS Focus
  setting is changed, and no notification permission is requested by this slice.
  The stored handoff intent is a user-approved local contract for future
  plugin/API/auto-open execution.
- Integration reminder setting changes create local audit entries under
  `reminder.integration.settings.changed`; the reminder settings remain part of
  the app-state snapshot/export path.
- Release metrics now apply the configured integration daily cap when computing
  reminder load, so reminder-fatigue guardrails stay bounded even when the base
  cadence would produce more prompts.
- Focused verification passed with `pnpm test:run
  apps/desktop/src/storage/reminderSettings.test.ts
  apps/desktop/src/storage/releaseMetrics.test.ts
  apps/desktop/src/pages/SettingsPage.test.tsx`, `pnpm exec biome check` for
  the affected files, and `pnpm --filter @attentionos/desktop build`.

## 2026-05-24 Ledger Guard Evidence

- Added `scripts/check-release-candidate-ledger.mjs` with two modes:
  `pnpm release:ledger` validates the coverage matrix structure, status
  vocabulary, duplicate RC ids, and owner-decision-packet coverage for the
  remaining owner-controlled rows; `pnpm release:ledger:complete` additionally
  fails while any row remains `Open`.
- Current `pnpm release:ledger` output passes and reports 60 total rows, 58
  `已实现并验证`, 0 `Open`, 1 `受外部依赖阻塞`, 1 owner-deferred, and 0 replaced
  rows after final verification and the release-readiness report. RC-056 is the
  external blocker.
- Current `pnpm release:ledger:complete` passes only after RC-057 and RC-060 are
  terminal. This is the guardrail preventing false release completion claims.

## Coverage Matrix

| ID | Requirement | Source | Current Evidence | Status | Next Verification / Work |
|---|---|---|---|---|---|
| RC-001 | Product remains a Personal Attention OS, not a generic task manager, chat app, dashboard, or meditation app. | product §2, §14; raw prompt 1/3 | App shell and onboarding copy use Personal Attention OS and workflow stages; onboarding explicitly rejects chat inbox/dashboard/generic task-list framing; Browser E2E and packaged native QA verify the primary path remains Ritual -> Overview -> Execution rather than a generic task surface. | 已实现并验证 | Recheck during final release-readiness review. |
| RC-002 | Workflow-first UI: surfaces are organized by current workflow stage. | product §3.1; workflow §1/A1 | `Shell.tsx` exposes Ritual, Overview, and Execution stage navigation on desktop and mobile; `/execution/plan` and `/execution/focus` stay under Execution; E2E verifies the main stage path and 390 px navigation. | 已实现并验证 | Recheck during final accessibility/native QA. |
| RC-003 | Attention-first design: new abilities reduce switching cost or improve focus stability. | product §3.2; raw prompt 1/3 | Release-critical screens now have current attention-first evidence: Onboarding routes into the protected workflow, Ritual settles attention and carries forward inputs, Overview stays read-only and bridges context into Execution, Execution Plan keeps planning/AI/capture lanes human-reviewed, Execution Focus protects one action and hides planning noise, Capture reduces context switching with one multi-channel input, and Settings keeps recovery/privacy/calibration controls outside Focus. Current E2E performance smoke verifies launch, Ritual -> Overview, stage navigation, Plan -> Focus, Focus controls, Settings snapshot, and corrupt recovery timing within local budgets. | 已实现并验证 | Recheck during future visual redesign, new routes, provider-backed AI, passive sensing, or native notification changes. |
| RC-004 | Local-first context is the default; cloud is enhancement, not primary store. | product §3.3, §7.2 | Every primary product storage key is included in the app-state snapshot; Tauri mirrors snapshots to local app-data JSON with atomic write, backup/export, and corrupt-state quarantine commands; App startup waits for restore before route content reads defaults; packaged native QA verified app-data restore, corrupt-state quarantine, Settings backup/import, and Focus relaunch recovery. Desktop scans found no active Supabase/storage import, sync runtime, network primitive, telemetry sender, or analytics sender in the current app path, and onboarding/settings state that cloud sync remains off unless future setup enables it. | 已实现并验证 | Recheck if a database, cloud sync, provider-backed storage, background daemon, or new desktop persistence key is added. |
| RC-005 | Human-led agentic behavior: AI suggestions remain pending until explicit approval. | product §3.4; workflow A3; product §10.2 | AI decomposition requires clarification, keeps drafts pending, and only creates tasks after explicit approval; invalid/wrong-target/non-pending suggestions fail before hierarchy mutation; rejection creates no tasks; workflow suggestions can be marked useful/not useful without automatic workflow mutation; tests verify audit entries. | 已实现并验证 | Recheck if provider-backed AI or new suggestion types are added. |
| RC-006 | High-impact AI or automation actions are auditable and, where feasible, reversible. | product §3.4, §9.4, §10.2, §15 | AI task-decomposition approval logs created task ids, applies only after human review, and now exposes a human-triggered rollback/restore path. Rollback archives only active tasks created by the applied suggestion, preserves original task snapshots in `ai.suggestion.rollback`, clears an archived focus candidate, and restore recreates active tasks from the audit snapshot with `ai.suggestion.rollback.restored`. Workflow-optimization suggestions remain reviewed-only and non-mutating. | 已实现并验证 | Recheck if future provider-backed suggestions mutate workflow configuration, external tools, calendar data, files, or other durable state. |
| RC-007 | Protocol-ready architecture keeps plugin/integration seams replaceable. | product §3.5, §9.2, §13.3 | `@attentionos/sdk` now defines a stable `attentionos.read.v1` contract for local workflow stage, hierarchy/entities, execution state, AI suggestions, attention observations, and audit-log resources. `@attentionos/mcp` maps that same contract into a read-only MCP manifest with no tools. Focused SDK/MCP tests and typechecks verify local, user-approved, read-only capability drift and reject accidental write-tool exposure. | 已实现并验证 | Full Phase 4 runtime work remains out of this release slice: no MCP server/client, write tools, plugin loading, auth, external app operation, offline sync, or desktop protocol refactor has been accepted or implemented. |
| RC-008 | Evidence-governed attention interventions avoid medical claims and bind claims to evidence limits. | product §3.6, §11, §16; raw prompt 2 | Product docs define evidence and non-medical boundary; first-run onboarding explicitly states AttentionOS is not medical advice, diagnosis, or treatment; bounded source copy scan found no active diagnosis/treatment claims outside that boundary copy; onboarding requires acknowledgement before Ritual. | 已实现并验证 | Re-scan if health-related copy, provider-backed AI claims, or App Store privacy/legal text changes. |
| RC-009 | Main path `ritual -> overview -> execution` is complete and recoverable. | workflow §1/A2/A3; product §4 | Routes and daily flow machine implement these states; packaged native QA verified onboarding -> Ritual -> Overview -> Task-layer bridge -> Execution Plan -> Execution Focus -> completion return to Overview; packaged native restart QA verified active Focus recovery after app relaunch. | 已实现并验证 | Recheck during final cross-flow release QA. |
| RC-010 | `execution(plan)` and `execution(focus)` are distinct, stable, and restorable. | workflow §1/B1/B6; goal prompt | `/execution/plan`, `/execution/focus`, and `executionModeMachine` exist; packaged native QA verified Plan and Focus are distinct views, Focus hides planning helper lanes, browser reload restores active Focus, and native relaunch restores executing/5-minute Focus state. | 已实现并验证 | Recheck invalid direct focus redirect during final native/browser release QA. |
| RC-011 | `vision / area / goal / project / task` appears in product behavior, data, navigation, and visual semantics. | product §5; workflow §1/A4 | `HierarchyLayer`, `V2Entity.hierarchyLayer`, hierarchy navigation, breadcrumb context, layer-specific Overview copy, Vision timeline, Task Overview browsing, and Execution bridge are implemented; tests verify a custom persisted five-layer hierarchy loads beyond default seed data and preserves distinct semantics through Vision, Area, Goal, Project, and Task. | 已实现并验证 | Recheck if direct Vision/Area/Goal edit surfaces are added. |
| RC-012 | Historical `planning/focus` semantics are hard-switched to `execution` plus mode; no user-facing old stage remains. | workflow §1/B3-B8 | Active routes use `/execution/plan` and `/execution/focus`; `/execution` redirects to Plan mode; route sync maps Focus under the `execution` stage; source search found old planning/focus only in governance/history docs; App tests verify `/planning` and `/focus` are not active standalone surfaces. | 已实现并验证 | Recheck if route tables or external API page-model endpoints are added. |
| RC-013 | Ritual supports configurable intention/prayer text. | product §4.2; raw prompt 3 | Settings saves intention/prayer text, Ritual renders it, and the snapshot includes it. | 已实现并验证 | Recheck during final Browser/native QA. |
| RC-014 | Ritual supports meditation settings such as duration, guidance, and sound parameters. | product §4.2; raw prompt 3 | Settings saves duration, guidance mode, and sound cue preference; Ritual renders and uses them; tests verify the bell cue path; packaged native QA verified configured 1-minute target, body-scan guidance, opening/closing bell label, and duration-driven transition to Reflection. | 已实现并验证 | Audio capture/loudness validation is out of current local scope; recheck during final packaged QA if sound implementation changes. |
| RC-015 | Ritual supports meditation run state: start, pause, resume, complete. | product §4.2; workflow A2/A3 | `MeditationStep` and `meditationMachine` support start, pause, resume, manual complete, elapsed-time clamping, and automatic completion; focused tests cover timer completion and bell cues; packaged native QA verified start, elapsed progress, pause stability, resume, and automatic transition to Reflection at the configured duration. | 已实现并验证 | Recheck during final Browser/native QA after any Ritual runtime changes. |
| RC-016 | Ritual supports reflection after meditation. | workflow A2/A3; product §4.2 | `ReflectionStep` persists reflection entities, exposes a useful empty state, quarantines malformed reflection storage with a visible recovery warning, preserves corrupt payloads before accepting new notes, and valid reflections export/restore through the portable app-state snapshot. | 已实现并验证 | Recheck during final Browser/native QA after any storage architecture changes. |
| RC-017 | Ritual supports dedication / 回向 as a first-class step. | product §4.2; raw prompt 3 | Settings saves dedication text, Ritual renders it, and dedication completion routes to Overview. | 已实现并验证 | Recheck during final Browser/native QA. |
| RC-018 | Ritual can mark reflection/dedication content for later task/project input. | product §4.2; raw prompt 3 | Reflection and dedication can be marked for task/project follow-up; Execution Plan surfaces marked inputs and can prefill the human create form without auto-creating entities. | 已实现并验证 | Recheck during final Browser/native QA. |
| RC-019 | Ritual defaults to morning/evening cadence, user-customizable times, and manual entry. | product §4.2; raw prompt 3 | Settings now default to morning/evening cadence, save custom morning/evening times, preserve manual-entry preference, and Ritual displays the active cadence. | 已实现并验证 | OS reminders/native launch behavior remain tracked under RC-020/RC-042. |
| RC-020 | Ritual can appear as a focused/full-screen start surface when appropriate. | product §4.2; raw prompt 3 | Packaged Tauri window now opens as AttentionOS and renders Ritual natively; fullscreen/scheduled-launch behavior is not implemented. Owner selected D1=A on 2026-05-24, explicitly deferring fullscreen/scheduled Ritual launch for this release candidate. | 经 owner 明确同意延期 | Post-RC only: reopen if owner later asks for in-app fullscreen Ritual or scheduled Ritual launch. |
| RC-021 | Overview is read-only: no create, edit, split, approve, or AI mutation controls. | workflow A1/A3/A5; goal prompt | Overview route tests assert no textboxes and no create/edit/delete/decompose/approve mutation buttons; source review keeps mutation controls in Execution Plan, not Overview. | 已实现并验证 | Recheck during final cross-flow QA. |
| RC-022 | Overview clearly presents current hierarchy layer and breadcrumb context. | workflow A2/A3/A4 | `OverviewPage` and `HierarchyBreadcrumb` show current layer and breadcrumb; tests verify Vision and Area context, and packaged native QA verified visible navigation across Vision, Area, Goal, Project, and Task. | 已实现并验证 | Recheck with user-created hierarchy data if that surface changes. |
| RC-023 | Overview presents timeline / vision view, risks, trends, and context signals. | product §6.2/§6.3/§7; workflow A3 | Overview renders the Vision timeline before metrics, then a read-only risk/trend/context signal panel derived from local attention observations, task completion/size signals, marked Ritual follow-up inputs, current hierarchy-layer counts, and pending AI optimization count; tests verify elevated-risk/trend/context copy and no mutation controls in the signal region. | 已实现并验证 | Recheck in final packaged native QA after task overview or context-capture changes. |
| RC-024 | Overview bridges clearly to `execution(plan)` while preserving layer/filter context. | workflow A2/B3/B9 | Task layer starts execution through daily flow, marks the selected task as the current action, and routes into Execution Plan; Browser E2E and packaged native QA verify `Clarify overview scan` reaches Plan and Focus as the selected candidate. | 已实现并验证 | Recheck if Overview filtering or multi-context selection is added. |
| RC-025 | Execution Plan supports creating actionable entities. | product §5; workflow A3 | Execution Plan now creates user-authored task and project entities with validation, persistence, and audit entries. | 已实现并验证 | Recheck during final Browser/native QA. |
| RC-026 | Execution Plan supports clarification before decomposition. | goal prompt; product §5.2 | Human-created items include clarification, and AI task decomposition requires a human clarification before draft generation. | 已实现并验证 | Recheck during final Browser/native QA. |
| RC-027 | Execution Plan supports decomposition into ADHD-friendly tasks under two-hour bound. | product §5.2; raw prompt 3 | Human-created tasks now require a start note and 5-120 minute estimate; AI suggestions validate title, start note, and estimate at approval and persistence boundaries. | 已实现并验证 | Import snapshot validation remains tracked under RC-047/RC-050. Recheck during final native QA. |
| RC-028 | Execution Plan supports sorting/prioritization and project current-next-action limits. | product §5.3; raw prompt 3 | Execution Plan supports one current next action, up to three candidate actions, and a later list; task listing sorts current, then candidates by age, then later actions; validation rejects multiple current or more than three candidate actions per project; focused tests verify project-specific current-action limits across persisted reads. | 已实现并验证 | Recheck user-created competing actions in final packaged native QA if Plan UI changes. |
| RC-029 | Execution Plan supports AI-assisted decomposition with human review. | product §5.2; goal prompt | `AiDecompositionPanel` requires clarification, keeps suggestions pending, supports approve/reject, and writes audit entries only after human review. | 已实现并验证 | Recheck during final Browser/native QA. |
| RC-030 | Execution Plan supports selecting exactly one focus candidate. | workflow A2/A3/A5; product §5.3 | Execution Plan persists a single focus candidate and routes it into Focus; Overview starts now also mark the selected task as current; packaged native QA verified the seeded task is selected for Focus, written into the native snapshot, and recovered after app relaunch; storage regression coverage verifies competing sibling tasks leave exactly one current action and clear the focus candidate when the selected task is moved later. | 已实现并验证 | Recheck user-created competing tasks in final packaged cross-flow QA. |
| RC-031 | Execution Focus protects one current action and hides planning noise by default. | workflow A2/A3/A5; goal prompt | Focus view excludes suggestion panels, the seeded `/execution/focus` route passes the basic route accessibility audit, and packaged native QA verified Focus shows one action without planning helper lanes. | 已实现并验证 | Recheck during final cross-flow release QA. |
| RC-032 | Execution Focus supports timer, progress, completion, recovery, and intentional exit. | goal prompt; product §4.3 | Task lifecycle supports start, +5 min, review, complete, recovery, and explicit focus exit; packaged native QA verified planning -> executing -> 5 min actual progress -> reviewing -> complete -> Overview return and executing/5-minute recovery after app relaunch; browser E2E verifies `Pause and exit focus` returns to Plan as paused and preserves progress. | 已实现并验证 | Recheck explicit exit in final packaged cross-flow QA. |
| RC-033 | Project vs task classification follows the four hard rules. | product §5.3; raw prompt 3 | Execution Plan create uses the four project signals, blocks task/project mismatch, AI-created tasks are revalidated before persistence, imported hierarchy snapshots are rejected before mutation when they violate task/project classification or one-subproject-layer limits, and existing role edits validate hierarchy invariants before saving. | 已实现并验证 | Recheck if broader direct hierarchy edit forms are added. |
| RC-034 | Projects support at most one subproject layer. | raw prompt 3; product §5.1 | Execution Plan create now allows one project-under-project layer and rejects deeper project nesting. | 已实现并验证 | Import snapshot validation remains tracked under RC-047/RC-050. Recheck during final native QA. |
| RC-035 | Task overview supports day/week/month and project grouping. | product §6.3; raw prompt 3 | The Task-layer Overview now includes a read-only task browsing panel with Day/Week/Month mode controls and project grouping derived from active hierarchy tasks and parent project titles; tests verify all three modes and multiple project groups. | 已实现并验证 | Recheck in final packaged native QA after hierarchy editing or calendar integration changes. |
| RC-036 | Task overview supports four-quadrant task browsing. | product §6.3; raw prompt 3 | The Task-layer Overview now classifies active tasks into Do next, Schedule, Shrink or delegate, and Later list lanes based on urgency, due dates, importance, priority, and execution role; tests verify all four quadrant labels and representative tasks. | 已实现并验证 | Recheck in final packaged native QA after task metadata or prioritization changes. |
| RC-037 | Personal context bus supports one input into multiple channels. | product §7.1; raw prompt 1 | Capture now stores one local note with idea/task/project/calendar channels, optional calendar context, recent-capture visibility, snapshot backup/export/import coverage, and recovery preservation for malformed capture storage. Execution Plan surfaces task/project capture channels as draft inputs that can prefill the human create form without auto-creating hierarchy entities. | 已实现并验证 | Recheck if native calendar integration, passive capture, provider-backed capture enrichment, or automatic task/project creation is added. |
| RC-038 | External integrations use plugin/API/auto-open strategy, not heavy global surveillance. | product §8; raw prompt 1 | Settings now exposes the integration boundary: current behavior is manual Capture, local snapshots, and human-reviewed AI suggestions only; the app does not monitor apps, screens, messages, browser activity, or calendar data in the background. Future plugin/API/auto-open behavior must declare permissions, stay scoped, user-approved, and auditable before touching external apps. | 已实现并验证 | Recheck if any native integration, plugin loading, MCP/SDK runtime, passive sensing, or external app operation is added. |
| RC-039 | Minimal passive sensing is permission-scoped and user-visible. | product §8/§11 | No passive sensing is active in this release path; Settings exposes consent preferences before any future external AI, telemetry, passive sensing, or native notification behavior; Tauri capability remains `core:default` with no notification/shell/filesystem/opener permission. | 已实现并验证 | Reclassify if a future owner-approved integration adds passive sensing. |
| RC-040 | Attention state estimation combines subjective and behavior signals with confidence. | product §10.1/§12 | Settings now includes manual attention calibration. It combines subjective clarity/energy/distractibility/stress, manual behavior signals, and probe fields into a local `V2AttentionObservationRecord` with score, confidence, subjective/passive/behavioral breakdown, and reasons. Users can correct the estimate to focused, drifting, overloaded, or fatigued; corrections are preserved in local observations and app-state snapshots. | 已实现并验证 | Recheck if passive sensing, provider-backed state inference, automatic nudges, or native background collection is added. |
| RC-041 | Interruption recovery gives next-step cues without information flooding. | product §10.1; raw prompt 1/2 | Focus candidate and task detail exist; packaged native restart QA verified returning to Execution/Focus after relaunch restores the single executing action and its 5-minute progress without planning helper lanes. Overview now shows a bounded interruption recovery cue when saved Focus runtime exists, and Execution Plan shows saved minutes/state plus an explicit Continue in Focus action after intentional exit or return from Overview. Tests verify the Overview bridge remains non-mutating and Plan recovery stays focused. | 已实现并验证 | Recheck if native notification scheduling, passive sensing, or OS-level interruption detection is added. |
| RC-042 | Reminder frequency controls, quiet windows, and priority override exist. | product §10.2/§12.3 | Settings stores reminder consent, frequency, quiet-hours start/end, priority override intent, and the D2=C integration reminder handoff contract. Integration reminders now support explicit local channels for calendar-file, Focus handoff, and app auto-open targets, plus a permission statement, local audit entries, and a 1-6/day fatigue cap. No calendar/app/Focus data is read or written, no external app is launched, and no macOS notification permission is requested by this slice. Focused storage, Settings, release-metrics, Biome, and desktop build verification passed. | 已实现并验证 | Recheck if actual macOS notifications, Calendar/EventKit, Focus-mode automation, opener/shell permissions, plugin runtime execution, or external API write behavior is added. |
| RC-043 | Metrics are quantifiable: attention ratio, switching, recovery, focus success, plan fulfillment. | product §12 | Overview now includes a read-only release metrics panel derived from local attention observations, audit entries, hierarchy tasks, AI suggestions, reflection inputs, and reminder settings. It quantifies attention ratio, switching pressure, recovery cues, focus success, and plan fulfillment; storage and Overview tests verify seeded calculations and UI visibility. | 已实现并验证 | Recheck if new metric sources, passive sensing, provider-backed AI, or native telemetry are added. |
| RC-044 | Guardrail metrics cover reminder fatigue, recording friction, autonomy, and misjudgment. | product §12.3 | The same release metrics panel quantifies reminder load, recording friction, autonomy kept, and misjudgment signal without activating reminders, telemetry, provider calls, or passive sensing; tests verify reminder-load, recording-friction, autonomy, and rejected-suggestion/low-confidence signals. | 已实现并验证 | Recheck if native notification scheduling, telemetry, or automatic AI action execution is added. |
| RC-045 | Onboarding explains workflow, local-first data, non-medical boundary, and consent. | goal prompt; product §11 | First-run onboarding route explains Ritual -> Overview -> Execution, local-first data, external AI/telemetry/cloud-sync default-off posture, and non-medical boundary; completion persists consent state; `/onboarding` passes the basic route accessibility audit. | 已实现并验证 | Recheck during final Browser/native QA. |
| RC-046 | Settings support ritual copy, meditation settings, privacy/AI, backup/export, and reminders. | goal prompt; product §4/§11/§15 | Settings covers ritual copy, meditation settings, Ritual cadence/manual-entry settings, privacy/AI boundaries, telemetry opt-in preference, reminder consent/frequency/quiet windows, and backup/export/import controls; route accessibility audit and packaged native QA verified Settings save snapshot, create backup, file-picker import, and imported Ritual rendering. | 已实现并验证 | Native notification delivery remains separately tracked under RC-042. |
| RC-047 | Import/export/backup are product-grade and user-controlled. | goal prompt; product §3.3/§11 | Data & Settings supports save snapshot, create backup, native export JSON, and import JSON; ritual settings are included; import validation rejects unknown/malformed managed entries before mutation; packaged native QA verified native snapshot save, native backup file creation, native import via file picker, and imported Ritual rendering; Settings now explains snapshot/backup/export/restore rotation and location boundaries. | 已实现并验证 | Recheck native export path during final packaged QA after remaining storage changes. |
| RC-048 | Persistent state survives reload, app restart, and corrupted storage gracefully. | goal prompt; workflow B7 | Browser restore/recovery tests pass; packaged Computer Use QA verified native app-data restore into Overview, native corrupt-state quarantine plus visible recovery details, and active Execution Focus runtime recovery after app relaunch. | 已实现并验证 | Recheck during final release-candidate QA after any storage architecture changes. |
| RC-049 | Empty states are useful and stage-specific. | goal prompt | Overview now has layer-specific empty states for Vision/Area/Goal/Project/Task; Task Overview has no-active-task/no-lane states; Ritual Reflection has a saved-note gate; Execution Plan has no Ritual input and no planned action guidance; Execution Focus/Plan has no focus candidate recovery. Tests cover empty persisted hierarchy, no Ritual follow-up inputs, no planned actions, no focus candidate, and Reflection empty save state. | 已实现并验证 | Recheck native packaged layout, keyboard traversal, and any new route-specific empty states before final release. |
| RC-050 | Error states are visible, actionable, and non-destructive. | goal prompt | Snapshot parse/import failures, reflection corruption, focus runtime recovery, hierarchy corruption, and malformed settings/helper-storage reads now preserve the original payload where available, fall back safely, and surface Shell/Settings recovery warnings with clear actions. Focused tests verify recovery ledger preservation, privacy malformed payload handling, hierarchy payload preservation before defaults, Settings visibility/clearing, and Shell recovery behavior. | 已实现并验证 | Recheck if new storage keys, provider integrations, or native error surfaces are added. |
| RC-051 | Accessibility is release-grade across keyboard, labels, contrast, reduced motion, and screen-reader semantics. | goal prompt; product §15 | Route-level Playwright audit passes for onboarding, Ritual, Overview, Execution Plan, seeded Execution Focus, and Settings; Settings hidden JSON import input has an accessible name; global focus-visible and reduced-motion CSS boundaries exist; Playwright verifies visible text contrast, keyboard-only completion of the primary workflow, and reduced-motion transition/animation suppression. After D3=A, Computer Use reached the packaged native app and exposed AX roles/labels/states for onboarding consent, Ritual, Reflection, Dedication, Overview, Execution Plan, and Execution Focus controls, including disabled/enabled buttons, checkboxes, text fields, headings, task state, and timer/progress values. | 已实现并验证 | Recheck with actual VoiceOver speech output if copy, route structure, native WebView behavior, or macOS accessibility settings change. |
| RC-052 | Privacy boundary covers local data, secrets, permissions, telemetry, AI calls, imports/exports, and consent. | goal prompt; product §11/§15 | Settings and first-run onboarding expose local-data acknowledgement, external AI consent default-off, telemetry opt-in default-off, reminder consent, and backup/export recovery boundaries; scans found no active provider keys, telemetry sender, analytics sender, network primitive, or broad Tauri permission; native Settings QA verified user-controlled backup/import. | 已实现并验证 | Final legal/privacy policy and App Store questionnaire remain owner-controlled release work. |
| RC-053 | Secrets are never hardcoded; AI/provider credentials are optional and secure. | goal prompt; product §11 | High-confidence current-source scan found no literal provider keys; Supabase service role is loaded through `requireEnv`; Settings states no provider credentials are stored and the external AI preference alone does not create calls. | 已实现并验证 | Re-scan before any provider integration, signing setup, or release submission. |
| RC-054 | Telemetry is absent by default or explicit opt-in with clear value and deletion controls. | product §11/§15 | Telemetry preference defaults off; source scan found no telemetry vendor sender, analytics sender, `sendBeacon`, or network primitive in app/package source. | 已实现并验证 | If telemetry is later implemented, add deletion/export controls and reclassify this row. |
| RC-055 | Desktop package has release-grade naming, bundle id, icons, window behavior, CSP, and entitlements. | goal prompt; workflow B6 | Tauri config now uses `AttentionOS`, `com.yannjy.attentionos`, a non-null CSP, explicit main window sizing/title, existing icon bundle, App Store category `Productivity`, `hardenedRuntime: true`, a macOS `Info.plist` merge file, an App Sandbox entitlements file, and a reduced core-only capability. Rebuilt bundle inspection confirms `CFBundleIdentifier=com.yannjy.attentionos`, `CFBundleName=AttentionOS`, `CFBundleExecutable=attentionos-desktop`, `LSApplicationCategoryType=public.app-category.productivity`, `ITSAppUsesNonExemptEncryption=false`, icon metadata, and no unresolved `@rpath` dependencies. `pnpm release:check:macos` passes with 27 checks, 0 failures, and owner-credential blockers separated into RC-056. | 已实现并验证 | Recheck if distribution target, signing identity/profile, entitlements, category, icons, CSP, Tauri capabilities, or packaging target changes. |
| RC-056 | macOS release candidate build, package, signing, notarization, and App Store readiness checks are complete within owner-provided credentials. | goal prompt | Unsigned local `.app` and `.dmg` builds succeed. `pnpm release:check:macos` verifies local package metadata and reports 4 external blockers: distribution signing identity, strict bundle code signature verification, signed App Sandbox entitlements, and notarization/App Store upload. Owner selected D4=B on 2026-05-24, choosing the Developer ID path. Current prerequisite audit found Apple Development identities only, no Developer ID Application identity, no Apple/Tauri/CSC/notary credential environment names, and an ad hoc/linker-signed bundle with no Team ID; `xcrun notarytool` itself is available. Signing/notarization/upload were not attempted. | 受外部依赖阻塞 | Owner must provide Developer ID certificate/profile and notarization credentials through an approved secure channel before signed build, `codesign --verify`, notarization, or stapling can proceed. Do not upload or submit any build without separate explicit owner authorization. |
| RC-057 | Unit, integration, E2E, lint, typecheck, build, docs governance, release/package checks pass. | goal prompt; workflow B9 | Final verification passed on 2026-05-24: `pnpm docs:check`, `pnpm release:ledger`, `git diff --check`, `pnpm lint`, `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, full `pnpm test:run` with 59 files / 295 tests, `pnpm build` with 11 Turbo build tasks, `pnpm check` with docs plus 16 Turbo check/build tasks, `pnpm e2e` with 16 Chromium tests, unsigned Tauri `.app`/`.dmg` package rebuild, `pnpm release:check:macos` with 27 checks, 0 failures, and 4 credential-bound external blockers, `pnpm performance:check:macos` at 2351 ms valid-snapshot readiness and 514 ms corrupt-recovery readiness, and production browser workflow QA via `pnpm qa:browser:release` under `.gstack/qa-reports/release-candidate-browser-workflow-2026-05-24-12-10-06/`. | 已实现并验证 | Re-run if any code, docs, packaging, signing, privacy, accessibility, or release artifact changes. |
| RC-058 | Browser and/or Computer Use QA covers main workflows with screenshots and console evidence. | goal prompt | Production browser workflow QA builds and serves the desktop production bundle, captures 11 screenshots for onboarding -> Ritual -> Overview -> Execution Plan -> Execution Focus -> completion -> Settings -> mobile navigation, and records 0 console errors / 0 page errors under `.gstack/qa-reports/release-candidate-browser-workflow-2026-05-24-04-00-25/`. Browser fallback QA and E2E cover core web workflows including explicit Focus exit. After D3=A, Computer Use reached the packaged app and verified onboarding consent, Ritual meditation/reflection/dedication, marked Ritual input, Overview five-layer traversal, Execution Plan bridge, Focus start/progress/review/completion, and return to Overview with native screenshots/AX-tree output. | 已实现并验证 | Recheck if primary route flow, native app packaging, window behavior, settings, or workflow semantics change. |
| RC-059 | Performance and usability checks cover launch, navigation, persistence, recovery, errors, and daily workflow. | goal prompt; product §12 | Browser Playwright performance smoke covers route readiness, onboarding, Ritual -> Overview, stage navigation, Plan -> Focus, Focus controls, Settings snapshot feedback, and corrupt browser snapshot recovery under conservative local budgets. Native packaged timing verifies post-persistence app readiness from a valid native snapshot in 1533 ms / 8000 ms and corrupt native snapshot recovery in 509 ms / 10000 ms with app-data restoration and WebKit/cache isolation. After D3=A, Computer Use manually verified native daily workflow usability from onboarding through completed Focus return to Overview. | 已实现并验证 | Recheck if startup/persistence code, native packaging, route structure, or primary daily workflow changes. |
| RC-060 | Final release-readiness report distinguishes verified work, external blockers, owner deferrals, and residual risk. | goal prompt | `docs/plans/2026-05-24-attentionos-release-readiness-report.md` summarizes the verified local macOS RC scope, final verification commands, Browser/Computer Use evidence, package state, RC-020 owner deferral, RC-056 Developer ID external blocker, and residual risks. | 已实现并验证 | Update the report if any release artifact, external credential state, owner deferral, verification command, privacy/legal boundary, or App Store path changes. |

## Open Critical Gaps

The current highest-risk gaps before this can be called a polished macOS
release candidate are:

1. Ritual now has configurable intention/dedication, meditation settings,
   cadence settings, reminder preference controls, reflection/dedication
   follow-up markers, timer-boundary behavior, packaged native timer QA, and a
   human draft bridge from marked inputs. Fullscreen/scheduled launch behavior
   is explicitly owner-deferred for this RC under D1=A; D2=C is implemented as a
   local integration-reminder handoff contract rather than background
   notifications or external automation.
2. Execution Plan now has human create, clarification input, AI split
   clarification, startability/duration validation, one-current plus
   three-candidate roles, focus candidate selection, packaged native Plan/Focus
   QA, active Focus restart recovery, and bounded interruption recovery cues,
   but still lacks richer prioritization, competing-candidate native QA, and
   import/edit validation.
3. Settings now has ritual, data, recovery, privacy/AI, telemetry-boundary,
   reminder-consent, and integration-reminder handoff controls; onboarding now
   covers workflow/local-first/non-medical consent, storage/helper parse
   recovery is visible and non-destructive, local release/guardrail metrics are
   visible in Overview, and automated route/contrast/keyboard/reduced-motion
   accessibility now passes. Computer Use reached the packaged native app and
   verified native AX semantics plus the primary manual workflow.
4. Tauri release identity, App Store category, Info.plist merge, App Sandbox
   entitlements-file readiness, local unsigned `.app`/`.dmg` generation, and
   repeatable local package audit are verified. The owner selected the
   Developer ID path under D4=B, but distribution signing, signed entitlements,
   notarization, certificate/profile availability, final legal/privacy
   confirmation, and any upload/submission authorization remain owner-credential
   or external-release blockers.

The ledger has no open rows. RC-020 is owner-deferred for this release
candidate, and RC-056 remains externally blocked by Developer ID credentials and
release authorization. The owner-decision packet records D1=A, D2=C, D3=A, and
D4=B; it must still not be treated as authorization for uploads, paid services,
public release, or credential creation.

## Skill Routing For Current Phase

- Primary skill: `autonomous-blueprint-executor`, because the owner explicitly
  requested controlled autonomous execution against this release goal.
- Deferred until relevant stage: `Build macOS Apps` for native build/package
  and release-candidate validation.
- Deferred until UI QA stage: `browser:browser` for localhost visual workflow
  verification, with Computer Use added only for native macOS behavior.
- Not used in this ledger pass: OpenAI Developers, Vercel, and deep-research,
  because the immediate work is local evidence mapping rather than API,
  deployment, or external policy research.

## Next Narrow Stage

Start with the release-blocking foundation rather than visual polish:

1. Define durable desktop persistence, backup/export/import, and recovery
   behavior.
2. Implement the smallest coherent slice that moves hierarchy, ritual copy,
   reflections, AI suggestions, learning observations, and audit data behind a
   product-grade storage boundary.
3. Verify with unit tests, Browser workflow QA, and native macOS smoke checks.
