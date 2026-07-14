# Maintenance Log

## 2026-07-14 14:33 CST

- Task: execute Wayfinder ticket [Move desktop I/O behind explicit adapters](https://github.com/YannJY02/AttentionOS/issues/18).
- Files moved: the desktop `storage` and local `ai` modules with their tests now live under `apps/desktop/src/adapters`; portable browser import/export I/O moved out of `SettingsPage` into a concrete adapter.
- Seam: `storageRecovery` now owns browser recovery event subscription and dispatch, so UI modules consume an adapter interface without knowing event names.
- Boundary: no generic port, one-implementation interface, or barrel layer was added; pure Workflow and Guidance modules remain outside desktop, and Rust Tauri command implementations remain in `apps/desktop/src-tauri`.

## 2026-07-14 14:25 CST

- Task: execute Wayfinder ticket [Establish the Attention Guidance context package](https://github.com/YannJY02/AttentionOS/issues/17).
- Ownership moved: attention estimation and cadence, immutable guidance suggestion analysis, release metrics, and reminder prompt-budget policy now live behind the public `@attentionos/guidance` API.
- Dependency boundary: Guidance imports only public `@attentionos/workflow` facts; desktop storage supplies those facts and retains persistence/platform side effects.
- Compatibility boundary: `packages/core`, `packages/ai`, and `packages/attention-engine` retain temporary public re-export shims until the scheduled legacy-package deletion.

## 2026-07-14 14:15 CST

- Task: execute Wayfinder ticket #16 by establishing the Attention Workflow context package.
- Ownership moved: canonical workflow types/constants, immutable Workflow Facts, hierarchy validation and pure state changes, and the existing XState machines with their regression tests.
- Desktop boundary: `apps/desktop/src/storage/hierarchy.ts` now performs local persistence and audit side effects while delegating hierarchy changes to the Workflow public API.
- Compatibility boundary: `packages/core` temporarily re-exports Workflow types and `packages/machines` temporarily re-exports Workflow machines; both remain scheduled for deletion in issue #19.

## 2026-07-14 14:03 CST

- Task: execute Wayfinder ticket #15 by removing disconnected infrastructure from the accepted desktop-only runtime.
- Files removed: `apps/server`, `packages/storage`, `packages/sdk`, `packages/mcp`, `packages/sync`, `packages/policy-engine`, and `supabase`.
- Files updated: the root Vitest project list, lockfile, project state, changelog, and this maintenance log.
- Boundary: immutable raw evidence and historical plans/logs remain untouched; their references describe the preserved pre-migration baseline rather than current runtime ownership.

## 2026-07-14 07:55 CST

- Task: add the owner-approved automatic commit-and-push completion rule to `AGENTS.md`.
- Files updated: `AGENTS.md`, project state, changelog, and this maintenance log.
- Rule: tasks and tracked issues with repository changes must finish with a scoped commit and normal push; unrelated working-tree changes must be isolated on a `codex/` branch or separate worktree.
- Boundary: read-only or tracker-only work does not create empty commits; force pushes, skipped hooks, and staging unrelated changes remain forbidden. Unsafe isolation or push failure requires owner intervention before completion.
- Verification: `pnpm docs:check`, targeted rule search, and `git diff --check`.

## 2026-07-14 07:21 CST

- Task: consolidate root AI instructions into `AGENTS.md` and remove `CLAUDE.md`.
- Files updated: `AGENTS.md`, root and documentation indexes, project state, documentation automation/workflow rules, the Phase 4 intake, changelog, and this maintenance log; `CLAUDE.md` was removed.
- Merge rule: retained current project entrypoints, minimal development commands, and Matt skill routing; relied on existing product/workflow/architecture documents instead of copying duplicate technical-stack and roadmap prose.
- Boundary: historical changelog, maintenance, archive, decision-evidence, and draft-architecture references to `CLAUDE.md` remain historical evidence rather than being rewritten.
- Verification: `pnpm docs:check`, targeted active-reference search, and `git diff --check`.

## 2026-07-14 07:18 CST

- Task: rebuild the repository configuration for the owner's global Matt Pocock skills using the current `setup-matt-pocock-skills` templates.
- Files updated: `AGENTS.md`, `CLAUDE.md`, `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, `docs/agents/domain.md`, changelog, and this maintenance log.
- Configuration: GitHub Issues, external PR triage disabled, the five canonical triage labels, and a lazy multi-context domain layout routed through `CONTEXT-MAP.md`.
- Boundary: no empty `CONTEXT-MAP.md`, `CONTEXT.md`, ADR, workflow, or issue-template files were created.
- Verification: `pnpm docs:check`, `git diff --check`, and remote GitHub label verification.

## 2026-07-14 07:05 CST

- Task: remove repository-vendored Matt Pocock skills because the owner now maintains the latest skills globally.
- Files removed: tracked Matt skill directories under `.agents/skills/` and `skills-lock.json`.
- Files updated: `AGENTS.md`, `CLAUDE.md`, `docs/README.md`, `docs/agents/README.md`, project state, changelog, and this maintenance log.
- Verification: `pnpm docs:check` and `git diff --check` passed; the shared governance audit completed with only the repository's known docs-centered mapping and ignored gstack warnings.
- Boundary: ignored project-local gstack artifacts and historical records of the earlier Matt skill installation were preserved.

## 2026-05-24 12:12 CST

- Task: close the local macOS release-candidate ledger with final verification and a readiness report.
- Files added: `docs/plans/2026-05-24-attentionos-release-readiness-report.md`.
- Files updated: `docs/README.md`, `docs/plans/README.md`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Verification: `pnpm docs:check`, `pnpm release:ledger`, `git diff --check`, `pnpm lint`, `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, `pnpm test:run` with 59 files / 295 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 16 Chromium tests, `pnpm --filter @attentionos/desktop tauri build --bundles app,dmg --no-sign --ci`, `pnpm release:check:macos`, `pnpm performance:check:macos`, and `pnpm qa:browser:release` all passed within their expected boundaries.
- Package evidence: rebuilt artifacts are `apps/desktop/src-tauri/target/release/bundle/macos/AttentionOS.app` and `apps/desktop/src-tauri/target/release/bundle/dmg/AttentionOS_0.1.0_aarch64.dmg`.
- Browser QA evidence: `.gstack/qa-reports/release-candidate-browser-workflow-2026-05-24-12-10-06/` contains 11 screenshots and records 0 console/page errors.
- Boundary: `pnpm release:check:macos` still reports 4 external blockers for distribution signing, strict signature verification, signed entitlements, and notarization/upload. This is expected because the current artifact is unsigned/ad hoc and Developer ID credentials were not present or used.

## 2026-05-24 12:07 CST

- Task: implement D2=C's narrowed integration-reminder slice and verify the now-available native GUI path.
- Files updated: `apps/desktop/src/storage/reminderSettings.ts`, `apps/desktop/src/storage/reminderSettings.test.ts`, `apps/desktop/src/storage/releaseMetrics.ts`, `apps/desktop/src/storage/releaseMetrics.test.ts`, `apps/desktop/src/storage/audit.ts`, `apps/desktop/src/pages/SettingsPage.tsx`, `apps/desktop/src/pages/SettingsPage.test.tsx`, the release-candidate ledger, owner decision packet, project state, changelog, and this maintenance log.
- Evidence: Settings now stores local integration reminder handoffs for calendar-file, Focus handoff, and app auto-open targets with explicit permission copy, local audit entries, and a 1-6/day cap. The implementation does not read calendars, monitor apps, change macOS Focus, open external software, request notification permission, or schedule background notifications.
- Native QA: Computer Use reached the packaged `AttentionOS.app` window and verified onboarding consent, Ritual meditation/reflection/dedication, marked Ritual task input, Overview Vision/Area/Goal/Project/Task traversal, Execution Plan bridge, Focus start/progress/review/completion, and return to Overview. The AX tree exposed native WebView roles, labels, values, and control states for the inspected flow.
- Developer ID audit: `security find-identity -v -p codesigning` showed Apple Development identities only, `xcrun notarytool` is available, credential environment-name scan found no Apple/Tauri/CSC/notary entries, codesign inspection showed an ad hoc/linker-signed bundle with no Team ID, and `pnpm release:check:macos` still reports 27 checks, 0 failures, and 4 external blockers.
- Verification: focused tests passed for reminder settings, release metrics, and Settings with 16 tests; `pnpm exec biome check` passed for affected files; `pnpm --filter @attentionos/desktop build` passed.
- Boundary: this closes the current local RC scope for integration reminder handoffs and native GUI evidence. It does not authorize real Calendar/EventKit writes, macOS Focus automation, opener/shell permissions, external-app control, signing, notarization, upload, or App Store submission.

## 2026-05-24 11:54 CST

- Task: record the owner release-candidate decisions and reopen the post-decision RC loop.
- Files updated: `docs/plans/2026-05-23-attentionos-release-candidate-requirements-ledger.md`, `docs/plans/2026-05-24-attentionos-release-candidate-owner-decision-packet.md`, `docs/README.md`, `docs/plans/README.md`, `docs/governance/project-state.md`, `docs/governance/changelog.md`, and this maintenance log.
- Evidence: the owner replied `D1=A, D2=C, D3=A, D4=B`. D1=A closes RC-020 as an owner-approved RC deferral. D2=C keeps RC-042 open and expands it to broader integration reminders, requiring a narrowed implementation slice. D3=A authorizes Computer Use native GUI/VoiceOver/manual usability QA when the macOS GUI session is accessible. D4=B selects Developer ID distribution validation, but certificates/profiles/notary credentials and any upload/submission remain owner-controlled.
- Boundary: this is not a release-completion claim. The goal remains incomplete while RC-042, RC-051, RC-057, RC-058, RC-059, and RC-060 are open and RC-056 still depends on owner-provided Developer ID credentials or final external-blocker reporting.
- Tool note: several parallel read-only context refreshes emitted the recurring session warning that the last tool appeared to have failed, while the individual command outputs returned usable data. They were not retried blindly.

## 2026-05-24 04:11 CST

- Task: perform a blocked audit for the active release-candidate goal.
- Files updated: `docs/governance/project-state.md` and this maintenance log.
- Evidence: `pnpm release:ledger` still reports 60 total rows with 52 implemented rows, 7 open rows, and 1 external blocker. The open rows remain RC-020, RC-042, RC-051, RC-057, RC-058, RC-059, and RC-060; RC-056 remains external-blocked. The repo contains the draft owner decision packet, but no owner reply or accepted deferral is recorded.
- Native GUI probe: after launching `apps/desktop/src-tauri/target/release/bundle/macos/AttentionOS.app`, Computer Use `get_app_state` for `AttentionOS` still returned `Computer Use server error -10005: cgWindowNotFound`.
- Boundary: this is not a completion claim. The remaining work requires owner choices for fullscreen/scheduled Ritual behavior and native notifications, an unlocked/native-verifiable GUI session for final VoiceOver/manual/native QA, and Apple Developer distribution credentials or explicit release-boundary confirmation.
- Tool note: the current `cgWindowNotFound` result matches prior native GUI attempts; no additional blind retries were made.

## 2026-05-24 04:09 CST

- Task: add a machine-checkable release-candidate ledger guard.
- Files added: `scripts/check-release-candidate-ledger.mjs`.
- Files updated: `package.json`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: the owner decision packet clarified the remaining rows, but the repo still lacked a fast command that proves the ledger is structurally valid and prevents accidental goal completion while `Open` rows remain.
- Verification: `pnpm release:ledger` passed and reported 60 total rows, 52 implemented rows, 7 open rows, and 1 external blocker. `pnpm release:ledger:complete` intentionally failed on RC-020, RC-042, RC-051, RC-057, RC-058, RC-059, and RC-060; this is expected while the owner-controlled gates are unresolved.
- Boundary: this does not close any product row. It makes the remaining incompleteness machine-visible so final release-readiness cannot be claimed without terminal ledger statuses.
- Tool note: the completion-mode command returned exit code 1 by design. It was not retried as a failure to debug.

## 2026-05-24 04:06 CST

- Task: convert the remaining release-candidate blockers into an explicit owner decision packet.
- Files added: `docs/plans/2026-05-24-attentionos-release-candidate-owner-decision-packet.md`.
- Files updated: `docs/README.md`, `docs/plans/README.md`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: the active ledger still has non-terminal rows for RC-020, RC-042, RC-051, RC-056, RC-057, RC-058, RC-059, and RC-060. Current implementation and QA evidence has narrowed those to owner-controlled product/permission choices, native GUI/VoiceOver availability, Apple distribution credentials, and final report sequencing.
- Boundary: the new packet is a draft plan artifact and does not mark any decision accepted, deferred, or resolved. It asks the owner to choose explicit paths for fullscreen/scheduled Ritual behavior, native notifications, native GUI/VoiceOver evidence, and Apple distribution credentials.
- Tool note: a parallel current-state refresh produced the recurring session warning that the last tool appeared to have failed, but the memory lookup, skill read, ledger search, and `git status` all returned usable output. No blind retry was made. A targeted `biome check` over Markdown docs returned "No files were processed" because those paths are ignored by the Biome config; the relevant verifier for this docs-only slice is `pnpm docs:check` plus `git diff --check`.

## 2026-05-24 04:00 CST

- Task: add repeatable production-browser screenshot and console evidence for the release-candidate goal.
- Files added: `scripts/qa-browser-release-workflow.mjs`.
- Files updated: `package.json`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-058 still needed stronger screenshot and console evidence for the browser-rendered release workflow. `pnpm qa:browser:release` now builds the desktop production bundle, serves it through Vite preview on `127.0.0.1:1422`, drives onboarding -> Ritual -> Overview -> Execution Plan -> Execution Focus -> completion -> Settings -> mobile navigation in Chromium, writes 11 screenshots, records console/page errors, and fails on console errors or page errors.
- Verification: after an initial dev-server version passed but produced dev-only console messages, the script was tightened to use the production preview bundle. The final `pnpm qa:browser:release` run passed and wrote `.gstack/qa-reports/release-candidate-browser-workflow-2026-05-24-04-00-25/report.md` plus screenshots and `console.json`; the report records 0 console messages, 0 console errors, and 0 page errors.
- Boundary: this improves RC-058 with repeatable browser-surface evidence. It does not close final packaged native GUI inspection, manual/native accessibility, VoiceOver, App Store signing/notarization, fullscreen launch, or native notification approval.
- Tool note: Browser plugin navigation tools were not exposed after two `tool_search` attempts, so Playwright production-preview QA was used as the browser-surface fallback. A current Computer Use check after launching `AttentionOS.app` returned `cgWindowNotFound`, matching the locked/unavailable native GUI blocker. One patch attempt failed because Biome had shifted the expected context; the patch was reapplied against the current file instead of retried blindly.

## 2026-05-24 03:52 CST

- Task: add automated native packaged-app performance timing evidence for the release-candidate goal.
- Files added: `scripts/check-native-performance.mjs`.
- Files updated: `apps/desktop/src-tauri/src/lib.rs`, `apps/desktop/src/storage/persistence.ts`, `apps/desktop/src/App.tsx`, `package.json`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-059 still lacked native packaged launch/recovery timing. The Tauri app now exposes an opt-in `record_qa_ready` command that writes a readiness marker only when `ATTENTIONOS_QA_READY_FILE` is set. The React app invokes it after persistence initialization and first ready render. The native performance script preserves app data, clears AttentionOS-specific WebKit/cache working state between scenarios, seeds valid or corrupt native snapshots, launches the packaged app executable, waits for the readiness marker, and verifies corrupt recovery creates a valid app-state snapshot plus recovery directory.
- Verification: focused `cargo check`, focused desktop build, and focused Biome passed. The packaged `.app` was rebuilt with `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`. `pnpm performance:check:macos` then passed against that rebuilt packaged app. Full affected verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml`, `pnpm test:run` with 294 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 16 Chromium tests, `pnpm --filter @attentionos/desktop tauri build --bundles app,dmg --no-sign --ci`, `pnpm release:check:macos`, and `pnpm performance:check:macos` with `validSnapshotReady: 1533ms / 8000ms` and `corruptSnapshotRecovery: 509ms / 10000ms`.
- Boundary: this improves RC-059 with native automated launch/persistence/error-recovery timing while the GUI session remains locked. It does not close manual/native usability, VoiceOver/native accessibility, GUI-observed navigation timing, or final cross-flow Computer Use QA.
- Tool note: the first `pnpm performance:check:macos` attempt measured valid readiness at 1733 ms but failed the corrupt recovery check because WebKit localStorage from the valid scenario masked native corrupt-state restoration. The script was changed to clear AttentionOS-specific WebKit/cache working data between scenarios instead of rerunning the same failed check blindly.
- Tool note: two later parallel read-only status/context lookups emitted the session workflow warning that the last tool appeared to have failed, but both lookups returned the expected `rg`, `git status`, and numbered-file output. No blind retry was made.

## 2026-05-24 03:38 CST

- Task: close local macOS package-readiness evidence for the release-candidate goal.
- Files added: `apps/desktop/src-tauri/Entitlements.plist`, `apps/desktop/src-tauri/Info.plist`, and `scripts/check-macos-release-readiness.mjs`.
- Files updated: `apps/desktop/src-tauri/tauri.conf.json`, `package.json`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-055 remained open because package readiness lacked explicit App Store category, Info.plist merge, entitlements-file readiness, and repeatable package audit evidence. Tauri now declares category `Productivity`, explicit `hardenedRuntime: true`, a macOS Info.plist merge file with `ITSAppUsesNonExemptEncryption=false`, and an App Sandbox entitlements file. The rebuilt bundle contains `LSApplicationCategoryType=public.app-category.productivity` and the expected AttentionOS identity.
- Verification: focused package verification rebuilt the unsigned `.app` and `.dmg` with `pnpm --filter @attentionos/desktop tauri build --bundles app,dmg --no-sign --ci`, then `pnpm release:check:macos` passed with 27 checks, 0 failures, and 4 external blockers for distribution signing identity, strict bundle code signature verification, signed App Sandbox entitlements, and notarization/App Store upload. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 294 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 16 Chromium tests, unsigned `.app`/`.dmg` packaging, and `pnpm release:check:macos`. Manual package inspection also confirmed the generated Info.plist values and that the current artifact is ad hoc/linker signed with no team identifier.
- Boundary: this closes RC-055 for local package metadata, bundle identity, category, CSP, capability, entitlements-file readiness, and auditability. RC-056 remains external-blocked because Developer ID or Apple Distribution signing, signed entitlements, notarization, App Store `.pkg` creation/upload, certificates/profiles, credentials, final legal/privacy confirmation, and submission authorization require the owner.
- Tool note: Context7 Tauri documentation lookup failed because the monthly quota was exceeded, so official Tauri v2 web docs and official Apple Developer pages were used instead. XcodeBuildMCP `get_app_bundle_id` also failed to read the bundle id even though local `plutil` inspection showed `CFBundleIdentifier=com.yannjy.attentionos`; that tool failure was not retried blindly.

## 2026-05-24 03:25 CST

- Task: close protocol-readiness contract evidence for the release-candidate goal.
- Files added: `packages/sdk/src/index.test.ts`, `packages/sdk/vitest.config.ts`, `packages/mcp/src/index.test.ts`, and `packages/mcp/vitest.config.ts`.
- Files updated: `packages/sdk/src/index.ts`, `packages/sdk/package.json`, `packages/mcp/src/index.ts`, `packages/mcp/package.json`, `pnpm-lock.yaml`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-007 remained open because SDK/MCP were placeholders. `@attentionos/sdk` now exposes a stable `attentionos.read.v1` local read contract for workflow stage, hierarchy/entities, execution state, AI suggestions, attention observations, and audit-log resources. `@attentionos/mcp` maps the same SDK contract into a read-only MCP manifest named `attentionos-local-readonly`, with no tools.
- Verification: focused `pnpm --filter @attentionos/sdk test` passed with 4 tests, `pnpm --filter @attentionos/mcp test` passed with 2 tests, `pnpm --filter @attentionos/sdk check` passed, `pnpm --filter @attentionos/mcp check` passed, and `pnpm lint` passed after applying Biome import organization. Full verification passed afterward with `pnpm docs:check`, `git diff --check`, `cargo check`, full `pnpm test:run` with 294 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 16 Chromium tests, and unsigned `.app` packaging. The tests verify local/user-approved/read-only capability shape, stable SDK/MCP resource alignment, read snapshot shape, and rejection of accidental write-tool exposure.
- Boundary: this closes RC-007 for release-candidate protocol readiness only. It does not implement a runtime MCP server/client, write tools, plugin marketplace/loading, local auth, external app operation, offline sync, or a desktop app refactor around protocol abstractions. The broader Phase 4 intake remains draft.

## 2026-05-24 03:17 CST

- Task: expand accessibility automation for the release-candidate goal.
- Files updated: `apps/desktop/src/App.css`, `e2e/accessibility.spec.ts`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-051 remained open because route-level landmark/name checks did not cover keyboard traversal, contrast, reduced motion, or native/VoiceOver behavior. The app now has a global focus-visible outline and reduced-motion CSS boundary. Playwright now checks visible text contrast, keyboard-only completion of the primary workflow from onboarding through completed Focus, and reduced-motion transition/animation suppression.
- Verification: first focused accessibility run failed because the contrast helper did not parse Tailwind/Chromium `oklch(...)` colors and incorrectly treated button backgrounds as page background; the helper was fixed with OKLCH-to-sRGB conversion rather than lowering the contrast threshold. Focused accessibility then passed with 8 Chromium tests. Full verification passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 288 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 16 Chromium tests, and unsigned `.app` packaging.
- Boundary: this improves but does not close RC-051. Native packaged accessibility/VoiceOver remains open because Computer Use could not obtain a packaged app window (`cgWindowNotFound`) while the macOS session was at the login/lock screen. CoreGraphics/macOS logs showed the spawned AttentionOS windows as occluded despite WebKit page load milestones, so this is recorded as an environment/GUI-session blocker rather than a completed native accessibility pass.
- Tool note: Computer Use was tried against the app path, bundle id, and launched app name; repeated `cgWindowNotFound`/no-window results were not retried blindly after the third equivalent failure. A full-screen capture then showed the login/lock screen. The spawned app processes were cleaned up after inspection.

## 2026-05-24 03:04 CST

- Task: close local-first storage boundary evidence for the release-candidate goal.
- Files updated: the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-004 remained open because the ledger still treated localStorage-first runtime helpers as an unresolved storage-boundary risk. A storage-key audit found 14 primary desktop product keys and all 14 are included in `PERSISTED_STORAGE_KEYS`; non-managed keys are persistence/recovery/quarantine metadata rather than primary workflow context. The Tauri app writes app-state snapshots atomically under app data, supports local backup/export files, and quarantines corrupt native state. `App.tsx` waits for persistence restore before route content reads defaults.
- Verification basis: current source scan plus already-passed storage and native QA evidence. The scan found no active desktop import of `@attentionos/storage`, Supabase, or sync packages, and no desktop `fetch`, WebSocket, EventSource, `sendBeacon`, telemetry sender, or analytics sender in the current app path. Existing verification already covers browser fallback restore before route reads, packaged native app-data restore, corrupt-state quarantine, Settings backup/import, Focus relaunch recovery, and the post-RC-038 full gate of docs, lint, diff check, cargo, 288 tests, build, check, E2E, unsigned `.app` packaging, and package inspection.
- Boundary: this closes RC-004 for current local release scope. Runtime helpers still use localStorage as the WebView working cache, but current release product state is mirrored to app-local native persistence and cloud is not the primary store. Recheck if a database, cloud sync, provider-backed storage, background daemon, or new desktop persistence key is added.
- Tool note: one network scan attempted the nonexistent path `packages/desktop` and exited with `rg` code 2; the scan was rerun once with corrected, narrower desktop/workspace paths instead of retrying the same command blindly.

## 2026-05-24 03:00 CST

- Task: close external integration no-surveillance boundary evidence for the release-candidate goal.
- Files added: `apps/desktop/src/pages/settings/IntegrationBoundaryPanel.tsx`.
- Files updated: `apps/desktop/src/pages/SettingsPage.tsx`, `apps/desktop/src/pages/SettingsPage.test.tsx`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-038 remained open because protocol placeholders existed but the user-facing product surface did not explicitly state the current release boundary for integrations. Settings now states that the current build does not monitor apps, screens, messages, browser activity, or calendar data in the background; current behavior is manual Capture, local snapshots, and human-reviewed AI suggestions; future plugin/API/auto-open capabilities must be scoped, user-approved, and auditable.
- Verification: focused `pnpm test:run apps/desktop/src/pages/SettingsPage.test.tsx apps/desktop/src/App.test.tsx` passed with 18 tests. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 288 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-038 for current local release scope. It does not implement plugin loading, MCP/SDK runtime surfaces, external app operation, passive sensing, or background monitoring. RC-007 remains open because SDK/MCP are still placeholders and Phase 4 intake is still draft.

## 2026-05-24 02:56 CST

- Task: close attention-first design evidence for the release-candidate goal.
- Files updated: the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-003 remained open because the ledger had not reviewed current release-critical screens against the attention-first criterion. The audit mapped Onboarding, Ritual, Overview, Execution Plan, Execution Focus, Capture, Settings, and Shell to reduced switching cost or improved focus stability, using current source plus the final post-RC-040 E2E/performance evidence.
- Verification: this was an evidence-only documentation pass. The supporting verification was already complete in the preceding RC-040 slice: docs, lint, diff check, cargo, 287 tests, build, check, final `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package metadata/ad hoc signing inspection.
- Boundary: this closes RC-003 for current local release scope. Future visual redesign, new routes, provider-backed AI, passive sensing, or native notification behavior must recheck the attention-first boundary.

## 2026-05-24 02:54 CST

- Task: close attention-state calibration evidence for the release-candidate goal.
- Files added: `apps/desktop/src/storage/learning.test.ts` and `apps/desktop/src/pages/settings/AttentionCalibrationPanel.tsx`.
- Files updated: `apps/desktop/package.json`, `apps/desktop/src/storage/learning.ts`, `apps/desktop/src/pages/SettingsPage.tsx`, `apps/desktop/src/pages/SettingsPage.test.tsx`, `packages/core/src/utils.ts`, `pnpm-lock.yaml`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-040 remained open because learning observations had score/confidence/breakdown fields, but the desktop product lacked a verified user-facing calibration and correction path. Settings now records a local attention observation from subjective ratings, manual behavior signals, and probe inputs; users can correct the estimated state, and the correction is stored in local learning observations and included in app-state snapshots.
- Verification: focused calibration tests passed with 21 tests; focused browser-safe ID and calibration tests passed with 25 tests after fixing the bundling issue. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 287 tests, `pnpm build`, `pnpm check`, final `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-040 for current local release scope. It does not add passive monitoring, native background sensing, provider-backed inference, or automatic intervention.
- Tool note: the first focused test attempt failed because `@attentionos/attention-engine` was added to `apps/desktop/package.json` but the workspace symlink had not been refreshed; `pnpm install` fixed the local link. The first full build failed because `packages/core/src/utils.ts` imported `node:crypto` through the browser bundle; `createId` now uses browser-safe `globalThis.crypto` with a non-secret fallback. The first full E2E run after that had one transient performance-budget failure (`ritualToOverview` 4494 ms); a targeted performance rerun passed, and the final full E2E rerun passed.

## 2026-05-24 02:43 CST

- Task: close high-impact AI audit and rollback evidence for the release-candidate goal.
- Files updated: `apps/desktop/src/storage/audit.ts`, `apps/desktop/src/storage/hierarchy.ts`, `apps/desktop/src/ai/taskDecompositionWorkflow.ts`, `apps/desktop/src/ai/taskDecompositionWorkflow.test.ts`, `apps/desktop/src/pages/execution/AiDecompositionPanel.tsx`, `apps/desktop/src/pages/ExecutionPage.test.tsx`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-006 remained open because applied AI task-decomposition suggestions were audited, but the durable task mutations had no user-visible rollback/compensation path. Execution Plan now exposes `Undo AI-created tasks` and `Restore AI-created tasks` for applied decomposition suggestions; rollback archives only active AI-generated tasks from the applied suggestion, stores original task snapshots in audit, clears an archived focus candidate, and restore reactivates tasks from the audit snapshot with its own audit entry.
- Verification: focused `pnpm test:run apps/desktop/src/ai/taskDecompositionWorkflow.test.ts apps/desktop/src/pages/ExecutionPage.test.tsx apps/desktop/src/storage/hierarchy.test.ts apps/desktop/src/storage/aiSuggestions.test.ts` passed with 36 tests. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 284 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-006 for current local AI task-decomposition actions. Current workflow-optimization suggestions remain non-mutating; future provider-backed suggestions that mutate workflow configuration, external tools, calendar data, files, or other durable state need equivalent audit and rollback/compensation proof.
- Tool note: the first focused Biome check failed on formatting only and was fixed with a scoped Biome write. The first `pnpm build` after implementation failed because product code used `Array.prototype.at` against the current desktop TS target; the code was changed to index access and the rerun passed. Session workflow warnings reported recent read/build tools may have failed; the associated commands returned concrete output and were not retried blindly.

## 2026-05-24 02:34 CST

- Task: close personal context bus evidence for the release-candidate goal.
- Files added: `apps/desktop/src/storage/contextCapture.ts`, `apps/desktop/src/storage/contextCapture.test.ts`, `apps/desktop/src/pages/CapturePage.tsx`, and `apps/desktop/src/pages/CapturePage.test.tsx`.
- Files updated: `apps/desktop/src/App.tsx`, `apps/desktop/src/components/layout/Shell.tsx`, `apps/desktop/src/pages/ExecutionPage.tsx`, `apps/desktop/src/pages/ExecutionPage.test.tsx`, `apps/desktop/src/storage/persistence.ts`, `apps/desktop/src/storage/persistence.test.ts`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-037 remained open because the app had a unified entity model but lacked a product surface where one input could be assigned to multiple context channels. Capture now stores one local note across idea/task/project/calendar channels, includes optional calendar context, surfaces recent captures, and lets Execution Plan prefill human-reviewed task/project creation from captured inputs without automatic hierarchy mutation.
- Verification: focused `pnpm test:run apps/desktop/src/storage/contextCapture.test.ts apps/desktop/src/pages/CapturePage.test.tsx apps/desktop/src/pages/ExecutionPage.test.tsx apps/desktop/src/App.test.tsx apps/desktop/src/storage/persistence.test.ts` passed with 37 tests. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 283 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-037 for current local release scope. It does not add passive capture, calendar API integration, provider-backed enrichment, or automatic task/project creation.
- Tool note: session workflow warnings reported recent documentation read tools may have failed; the associated commands returned concrete output and were not retried blindly.

## 2026-05-24 02:27 CST

- Task: close interruption recovery next-step cue evidence for the release-candidate goal.
- Files updated: `apps/desktop/src/storage/taskRuntime.ts`, `apps/desktop/src/storage/taskRuntime.test.ts`, `apps/desktop/src/pages/OverviewPage.tsx`, `apps/desktop/src/pages/OverviewPage.test.tsx`, `apps/desktop/src/pages/ExecutionPage.tsx`, `apps/desktop/src/pages/ExecutionPage.test.tsx`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-041 remained open because Focus runtime recovery was verified after restart, but returning from Overview and explicit exit/resume choices needed visible next-step cues that did not add planning noise to Focus.
- Verification: focused `pnpm test:run apps/desktop/src/storage/taskRuntime.test.ts apps/desktop/src/pages/ExecutionPage.test.tsx apps/desktop/src/pages/OverviewPage.test.tsx` passed with 25 tests; focused Biome passed for the touched runtime, Overview, and Execution files. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 279 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-041 for current local interruption recovery. It does not add native notifications, passive monitoring, or broader OS-level interruption detection.

## 2026-05-24 02:21 CST

- Task: close release metrics and guardrail metrics evidence for the release-candidate goal.
- Files added: `apps/desktop/src/storage/releaseMetrics.ts`, `apps/desktop/src/storage/releaseMetrics.test.ts`, and `apps/desktop/src/pages/overview/ReleaseMetricsPanel.tsx`.
- Files updated: `apps/desktop/src/pages/OverviewPage.tsx`, `apps/desktop/src/pages/OverviewPage.test.tsx`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-043 and RC-044 remained open because existing learning summaries did not expose all required product metrics or guardrail metrics in the release surface. The new panel derives metrics from local attention observations, execution audit entries, hierarchy tasks, AI suggestions, reflection inputs, and reminder settings.
- Verification: focused `pnpm test:run apps/desktop/src/storage/releaseMetrics.test.ts apps/desktop/src/pages/OverviewPage.test.tsx` passed with 8 tests; focused Biome passed for the touched metrics and Overview files. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 278 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-043 and RC-044 for current local release scope without enabling passive sensing, telemetry, native reminder scheduling, provider calls, or external uploads.

## 2026-05-24 02:12 CST

- Task: close visible, actionable, non-destructive error-state evidence for the release-candidate goal.
- Files added: `apps/desktop/src/storage/storageRecovery.test.ts`.
- Files updated: `apps/desktop/src/storage/storageRecovery.ts`, `apps/desktop/src/components/layout/Shell.tsx`, `apps/desktop/src/pages/SettingsPage.tsx`, `apps/desktop/src/storage/privacySettings.test.ts`, `apps/desktop/src/storage/hierarchy.test.ts`, `apps/desktop/src/pages/SettingsPage.test.tsx`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-050 remained open because critical snapshot and reflection recovery were visible, but malformed helper-storage reads still needed a common recovery ledger, UI visibility, clear actions, and non-destructive preservation proof.
- Verification: focused `pnpm test:run apps/desktop/src/storage/storageRecovery.test.ts apps/desktop/src/storage/privacySettings.test.ts apps/desktop/src/storage/hierarchy.test.ts apps/desktop/src/pages/SettingsPage.test.tsx apps/desktop/src/App.test.tsx` passed with 29 tests; focused Biome passed after removing an unnecessary Shell hook dependency. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 276 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-050 for current local parse/import/runtime error states. `browser:browser` was not exposed by tool discovery in this session, so browser-surface evidence used the existing Playwright E2E gate; native signing/notarization/App Store actions remain owner-credential blocked.
- Tool note: one read attempted the stale path `apps/desktop/src/components/Shell.tsx`; the real path is `apps/desktop/src/components/layout/Shell.tsx`, and the failed path was not retried blindly. A focused Biome run failed once on the shell recovery banner dependency and was fixed before rerun.

## 2026-05-24 01:57 CST

- Task: close stage-specific empty-state evidence for the release-candidate goal.
- Files updated: `apps/desktop/src/pages/overview/EntityList.tsx`, `apps/desktop/src/pages/ExecutionPage.tsx`, `apps/desktop/src/pages/OverviewPage.test.tsx`, `apps/desktop/src/pages/ExecutionPage.test.tsx`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-049 remained open because empty states existed but were generic or not explicit for key primary routes.
- Verification: focused `pnpm test:run apps/desktop/src/pages/OverviewPage.test.tsx apps/desktop/src/pages/ExecutionPage.test.tsx` passed with 20 tests; focused Biome passed for the touched Overview/Execution files. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 272 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-049 for current primary routes. Native packaged QA should recheck empty-state layout and keyboard traversal before final release readiness.
- Tool note: two focused test attempts failed because the Execution empty-state test still used the default hierarchy containing one planned task, so the queue empty state was correctly absent. The test fixture now removes the default task to verify the intended empty queue.

## 2026-05-24 01:51 CST

- Task: close five-layer hierarchy behavior, data, navigation, and visual-semantics evidence for the release-candidate goal.
- Files updated: `apps/desktop/src/pages/OverviewPage.test.tsx`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-011 remained open because the app had default-seed five-layer navigation, but lacked regression proof that custom persisted Vision -> Area -> Goal -> Project -> Task data preserved layer-specific behavior and visual semantics beyond examples.
- Verification: focused `pnpm test:run apps/desktop/src/pages/OverviewPage.test.tsx` passed with 5 tests; focused Biome passed for the touched Overview test. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 271 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-011 for current product behavior, data, navigation, and visual semantics. Future direct Vision/Area/Goal editing surfaces must preserve the same hierarchy validation and visual separation.

## 2026-05-24 01:48 CST

- Task: close Task Overview day/week/month, project grouping, and four-quadrant browsing evidence for the release-candidate goal.
- Files added: `apps/desktop/src/pages/overview/TaskOverviewModesPanel.tsx`.
- Files updated: `apps/desktop/src/pages/OverviewPage.tsx`, `apps/desktop/src/pages/OverviewPage.test.tsx`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-035 and RC-036 remained open because the desktop surface did not yet provide the requested task overview modes or four-quadrant browsing in the task layer.
- Verification: focused `pnpm test:run apps/desktop/src/pages/OverviewPage.test.tsx` passed with 4 tests; focused Biome passed for the touched Overview files. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 270 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-035 and RC-036 for the current local Overview task-browsing scope. Native packaged QA should recheck the panel after broader hierarchy editing or calendar integration changes.
- Tool note: focused Biome first rejected `aria-label` on a plain `div`, then rejected `role=group` where a semantic element was available. The date-mode control was changed to a `fieldset` with an `sr-only` legend, and the rerun passed.

## 2026-05-24 01:42 CST

- Task: close Overview risk, trend, and context signal evidence for the release-candidate goal.
- Files added: `apps/desktop/src/pages/overview/OverviewSignalsPanel.tsx`.
- Files updated: `apps/desktop/src/pages/OverviewPage.tsx`, `apps/desktop/src/pages/OverviewPage.test.tsx`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-023 remained open because the Overview surface had a Vision timeline and Learning snapshot but did not clearly present risk, trend, and context signals as a read-only scan before entering execution.
- Verification: focused `pnpm test:run apps/desktop/src/pages/OverviewPage.test.tsx` passed with 3 tests; focused Biome passed for the touched Overview files. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 269 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-023 for the current local Overview surface. Native packaged QA should recheck the signal panel after broader task overview or context-capture changes.
- Tool note: the first `pnpm build` rerun failed because the new test fixture omitted the required `V2Entity.entityType`; the fixture was corrected and focused verification plus the full rerun passed.

## 2026-05-24 01:37 CST

- Task: close Execution Plan sorting and project-specific current-action evidence for the release-candidate goal.
- Files updated: `apps/desktop/src/storage/hierarchy.test.ts`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-028 remained open because one-current/three-candidate validation existed, but the current local model lacked explicit regression proof for current-first ordering, candidate-age ordering, later-list fallback ordering, and project-specific current next-action limits across persisted reads.
- Verification: focused `pnpm test:run apps/desktop/src/storage/hierarchy.test.ts` passed with 7 tests; focused Biome passed for `apps/desktop/src/storage/hierarchy.test.ts`. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 268 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-028 for the current local Execution Plan storage model. Final packaged native QA should still recheck user-created competing actions if the Plan UI changes.

## 2026-05-24 01:29 CST

- Task: close imported/existing hierarchy validation evidence for the release-candidate goal.
- Files updated: `apps/desktop/src/storage/taskValidation.ts`, `apps/desktop/src/storage/hierarchy.ts`, `apps/desktop/src/storage/persistence.ts`, `apps/desktop/src/storage/persistence.test.ts`, `apps/desktop/src/storage/hierarchy.test.ts`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-033 remained open because project/task classification was enforced in human create and AI decomposition approval paths, but imported snapshots and existing hierarchy edits were not yet revalidated before mutation.
- Verification: focused `pnpm test:run apps/desktop/src/storage/persistence.test.ts apps/desktop/src/storage/hierarchy.test.ts apps/desktop/src/ai/taskDecompositionWorkflow.test.ts apps/desktop/src/pages/ExecutionPage.test.tsx` passed with 37 tests; focused Biome passed for the touched validation, hierarchy, and persistence files. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 266 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-033 for imported snapshots and current local hierarchy edits. Future direct hierarchy edit forms must call the same validation before persistence.
- Tool note: the first validation run was too strict for older partial local/test hierarchy ancestry and failed before checking the relevant edit invariant. The validator was split into strict import validation and compatibility validation for existing local edits, then the focused rerun passed.

## 2026-05-24 01:22 CST

- Task: close Reflection recovery/export evidence for the release-candidate goal.
- Files added: `apps/desktop/src/storage/reflections.test.ts`.
- Files updated: `apps/desktop/src/storage/reflections.ts`, `apps/desktop/src/storage/persistence.test.ts`, `apps/desktop/src/pages/ritual/ReflectionStep.tsx`, `apps/desktop/src/pages/RitualPage.test.tsx`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-016 remained open because Reflection persisted text but lacked explicit empty-state, malformed-storage recovery, and reflection-specific export/restore proof.
- Verification: focused `pnpm test:run apps/desktop/src/storage/reflections.test.ts apps/desktop/src/storage/persistence.test.ts apps/desktop/src/pages/RitualPage.test.tsx` passed with 24 tests; focused Biome passed after applying formatting fixes to the touched files. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 263 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-016 for current local release scope. Broader workflow-level error states remain tracked under RC-050, and final packaged QA should recheck Reflection after any storage architecture changes.
- Tool note: the first focused test run failed because a broad `/reflection/i` heading query became ambiguous after the new recovery heading was added; the helper was tightened to the exact Reflection step heading and the rerun passed.

## 2026-05-24 01:13 CST

- Task: close Ritual meditation settings/runtime evidence for the release-candidate goal.
- Files updated: `packages/machines/src/meditation.ts`, `packages/machines/__tests__/meditation.test.ts`, `apps/desktop/src/pages/ritual/MeditationStep.tsx`, `apps/desktop/src/pages/RitualPage.test.tsx`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Files added: `.gstack/qa-reports/release-candidate-native-ritual-timer-2026-05-24/report.md` with native screenshots and copied QA app-support state.
- Evidence: RC-014 and RC-015 remained open because duration, guidance, sound cue, and timer controls had code coverage but lacked current timer-boundary behavior and packaged native workflow evidence.
- Verification: focused `pnpm test:run packages/machines/__tests__/meditation.test.ts apps/desktop/src/pages/RitualPage.test.tsx` passed with 21 tests; focused Biome passed for the touched meditation/Ritual files; unsigned `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci` rebuilt the package before native QA; Computer Use verified the rebuilt package renders the configured 1-minute target, body-scan guidance, opening/closing bell label, start/pause/resume controls, paused elapsed stability, and automatic transition from Meditation to Reflection at the configured duration. Full verification then passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 256 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `.app` packaging, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-014 and RC-015 for current local release scope. The native QA did not capture audio output; tests verify the `AudioContext` cue path and Computer Use verifies the configured sound label. Fullscreen/scheduled launch and native notification delivery remain tracked separately.
- Tool note: the first focused timer test attempt timed out because fake timers advanced outside React update handling; the test was changed to use Testing Library `act`. The first native run used the previous packaged build and did not include the auto-complete implementation; the app was rebuilt, state was reseeded, and the rebuilt native run passed. Original native app state was restored afterward and no `attentionos-desktop` process remained.

## 2026-05-24 01:01 CST

- Task: close the release-candidate backup/export guidance gap for current local scope.
- Files updated: `apps/desktop/src-tauri/src/lib.rs`, `apps/desktop/src/storage/persistence.ts`, `apps/desktop/src/storage/persistence.test.ts`, `apps/desktop/src/pages/SettingsPage.tsx`, `apps/desktop/src/pages/SettingsPage.test.tsx`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-047 remained open because Settings had native backup/import evidence but still used a browser-style export path and lacked clear snapshot/backup/export/restore rotation and location boundaries.
- Verification: focused `pnpm test:run apps/desktop/src/storage/persistence.test.ts apps/desktop/src/pages/SettingsPage.test.tsx` passed with 17 tests; focused Biome passed for the touched Settings/persistence/Tauri files; `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` passed. Broader verification then passed with `cargo check`, full `pnpm test:run` with 253 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `pnpm --filter @attentionos/desktop tauri build --bundles app --no-sign --ci`, and package inspection confirming `com.yannjy.attentionos`, `AttentionOS`, `attentionos-desktop`, `APPL`, and ad hoc/no-team signing.
- Boundary: this closes RC-047 for current local release scope. Native export path behavior should be rechecked in final packaged QA after remaining storage changes; signing, notarization, upload, App Store privacy/legal review, and owner-controlled external release actions remain out of scope for this slice.
- Tool note: session workflow warnings reported recent read or poll tools may have failed; the associated commands returned concrete output and were not blindly retried.

## 2026-05-24 00:01 CST

- Task: add route-level accessibility regression coverage for the release-candidate goal.
- Files added: `e2e/accessibility.spec.ts`.
- Files updated: `apps/desktop/src/pages/SettingsPage.tsx`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-051 remained open because accessibility had not been checked across the main route surfaces; Settings also had a screen-reader-reachable hidden JSON import input without its own accessible name.
- Verification: focused `pnpm exec biome check` passed for the new E2E spec and Settings page; focused `pnpm exec playwright test e2e/accessibility.spec.ts` passed 6 Chromium route-audit tests. Final verification passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 243 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 12 Chromium tests, unsigned `tauri build --bundles app --no-sign --ci`, and package metadata/signing inspection.
- Boundary: this is a basic semantic regression audit only. It does not replace manual keyboard traversal, VoiceOver/native packaged app testing, contrast review, reduced-motion review, or final App Store accessibility readiness.
- Tool note: several session workflow warnings reported that a recent tool may have failed; the associated commands returned successful output or explicit formatter output, and the work proceeded from those concrete results instead of blindly retrying.

## 2026-05-24 00:11 CST

- Task: add browser performance and usability smoke evidence for the release-candidate goal.
- Files added: `e2e/performance.spec.ts`.
- Files updated: the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-059 remained open because there was no current release performance/usability evidence covering launch, navigation, persistence feedback, recovery, and daily workflow responsiveness.
- Verification: focused `pnpm exec biome check` passed for the new E2E spec; focused `pnpm exec playwright test e2e/performance.spec.ts` passed 2 Chromium performance/usability tests. Local focused measurements were `launchRouteReady` 228 ms, `onboardingToRitual` 138 ms, `ritualToOverview` 387 ms, `stageNavigation` 150 ms, `planToFocus` 93 ms, `focusControls` 46 ms, `settingsSnapshot` 162 ms, and `corruptRecoveryWarning` 94 ms. Final verification passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 243 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `tauri build --bundles app --no-sign --ci`, and package metadata/signing inspection.
- Boundary: this is browser-surface evidence with conservative budgets. It does not replace native packaged launch/navigation/recovery timing, memory/CPU profiling, long-session testing, or manual usability review.

## 2026-05-24 00:15 CST

- Task: run packaged native Settings backup/import QA with Computer Use.
- Files added: `.gstack/qa-reports/release-candidate-native-settings-2026-05-24/report.md`, `native-settings-import-proof.json`, copied native backup/state artifacts, and `screenshots/native-imported-ritual.png`.
- Files updated: the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: packaged `AttentionOS.app`, isolated `com.yannjy.attentionos` app-data/WebKit/cache state, Computer Use accessibility tree/screenshots, native app-data file inspection, native backup file inspection, and packaged file-picker import.
- Verification: first-run onboarding completed in the packaged app; Settings saved `Native saved intention proof` to native persistence; `Create backup` produced a native backup path; app-data inspection confirmed native state and backup contained the saved intention; packaged file-picker import accepted `native-settings-import-proof.json`; Ritual then rendered `Native imported intention proof`, `7:00`, `Silent sitting`, `No sound cue`, and manual-only cadence; post-import native state contained imported intention, dedication, and 7-minute settings. Preserved local app state was restored, the temporary Documents import file was removed, and no packaged app process remained running.
- Boundary: this QA did not sign, notarize, upload, or submit the app. It also did not verify cloud backup, backup rotation UX, native export/download beyond current local controls, native Execution Plan/Focus, or native performance.
- Tool note: setting the file upload element value through Computer Use failed because the element was not settable; the test switched to the real Import JSON button and macOS file picker instead.

## 2026-05-24 00:20 CST

- Task: run packaged native Execution Plan/Focus QA with Computer Use.
- Files added: `.gstack/qa-reports/release-candidate-native-execution-2026-05-24/report.md`, copied native state artifact, and native QA screenshots.
- Files updated: the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: packaged `AttentionOS.app`, isolated `com.yannjy.attentionos` app-data/WebKit/cache state, Computer Use accessibility tree/screenshots, native app-data state inspection, and preserved-state restore proof.
- Verification: first-run onboarding completed in the packaged app; Overview navigated the seeded five-layer hierarchy from Vision to Task; the Task-layer bridge opened Execution Plan with `Clarify overview scan` selected as the focus candidate; `Enter focus` opened Focus without planning helper lanes; `Start task` changed state to executing; `Add 5 minutes` changed actual progress to 5 min; `Submit for review` changed state to reviewing; `Complete task` returned to Overview; native state inspection confirmed the app-data snapshot contained `Clarify overview scan` and the focus candidate key. Preserved local app state was restored and no packaged app process remained running.
- Boundary: this QA did not verify user-created native plan items, AI decomposition approval, app restart recovery for Focus mid-session, manual keyboard traversal, native performance profiling, signing, notarization, upload, or App Store submission.

## 2026-05-24 00:36 CST

- Task: implement and verify active Focus runtime recovery for the release-candidate goal.
- Files added: `apps/desktop/src/storage/taskRuntime.ts`, `apps/desktop/src/storage/taskRuntime.test.ts`, and `.gstack/qa-reports/release-candidate-native-focus-recovery-2026-05-24/report.md` with native state artifacts and screenshots.
- Files updated: `apps/desktop/src/hooks/useTaskLifecycle.ts`, `apps/desktop/src/hooks/useTaskLifecycle.test.tsx`, `apps/desktop/src/storage/persistence.ts`, `e2e/smoke.spec.ts`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: the active release-candidate ledger kept Focus recovery open because `useTaskLifecycle` used XState in memory and did not persist active task runtime across app restart.
- Verification: focused runtime tests passed with 27 tests; focused Biome checks passed for touched runtime files; focused Playwright smoke passed the reload recovery assertion. Full code verification passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 247 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, and unsigned `tauri build --bundles app --no-sign --ci`. Computer Use then verified packaged native restart recovery: after `Start task` and `Add 5 minutes`, quitting/relaunching the app and reopening Focus restored `State: executing` and `Actual: 5 min`; native app-data artifacts before and after relaunch contain `attentionos.execution.taskRuntime.v1` with `state: executing`, `actualMinutes: 5`, and `taskId: task-wire-overview`.
- Boundary: this closes active Focus runtime recovery only. Explicit exit-reason UX, native performance timing, manual keyboard traversal, VoiceOver, signing, notarization, upload, and App Store submission remain open.
- Tool notes: two state-isolation setup attempts failed before clearing data because a zsh loop variable named `path` shadowed PATH; the setup was rerun with a non-reserved variable and explicit utility paths. Additional session workflow warnings said recent read tools may have failed, but the associated reads returned successful output and were not blindly retried.

## 2026-05-24 00:41 CST

- Task: make intentional Focus exit explicit for the release-candidate goal.
- Files updated: `apps/desktop/src/pages/execution/TaskActions.tsx`, `apps/desktop/src/pages/ExecutionPage.tsx`, `apps/desktop/src/pages/ExecutionPage.test.tsx`, `e2e/smoke.spec.ts`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-032 still required an intentional exit path beyond relying on a generic return-to-plan button.
- Verification: focused `pnpm test:run` passed for `ExecutionPage`, `useTaskLifecycle`, and `taskRuntime` tests with 20 tests; focused `pnpm exec biome check` passed for touched Focus files and `e2e/smoke.spec.ts`; focused `pnpm exec playwright test e2e/smoke.spec.ts --grep "creates and focuses"` passed 1 Chromium test. The test verifies `Pause and exit focus` returns to Execution Plan as paused, preserves `Actual: 5 min`, persists `attentionos.execution.taskRuntime.v1` with `state: paused`, audits the `PAUSE` transition, and re-enters Focus with paused progress visible. Final workspace verification passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 248 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 14 Chromium tests, unsigned `tauri build --bundles app --no-sign --ci`, and package metadata/signing inspection.
- Boundary: final cross-flow packaged QA should still recheck explicit Focus exit alongside native accessibility and native performance. This slice does not sign, notarize, upload, or submit the app.

## 2026-05-24 00:45 CST

- Task: audit existing workflow surface evidence against early release-candidate ledger rows.
- Files updated: the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: `Shell.tsx`, `OnboardingPage.tsx`, `OverviewPage.tsx`, `OverviewPage.test.tsx`, browser E2E smoke/accessibility/performance specs, and packaged native five-layer Execution QA.
- Verification: current source and tests show the app is framed as a Personal Attention OS rather than a task manager/chat/dashboard/meditation app; workflow navigation is stage-based across desktop/mobile; Overview has no textboxes or mutation buttons; Overview presents current layer and breadcrumb context; and the Task-layer bridge routes the selected action into Execution Plan/Focus. This pass closed RC-001, RC-002, RC-021, RC-022, and RC-024 in the ledger.
- Boundary: this was an evidence classification pass, not a new implementation slice. It does not close richer task overview modes, metrics, native accessibility, native performance, signing, notarization, upload, or App Store submission.

## 2026-05-24 00:48 CST

- Task: add focus-candidate uniqueness regression evidence for the release-candidate goal.
- Files updated: `apps/desktop/src/storage/hierarchy.test.ts`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: RC-030 still required current evidence that competing tasks cannot leave multiple focus candidates or multiple current actions.
- Verification: focused `pnpm test:run apps/desktop/src/storage/hierarchy.test.ts` passed 4 tests, and focused `pnpm exec biome check apps/desktop/src/storage/hierarchy.test.ts` passed. The new test selects two sibling tasks as current in sequence, verifies the focus candidate moves to the second task, verifies exactly one current action remains, verifies the previous current action is demoted to candidate, and verifies moving the selected task to backlog clears the focus candidate.
- Boundary: this closes the storage invariant for single focus-candidate selection. Final packaged cross-flow QA should still recheck user-created competing tasks in the native app. This slice does not close native accessibility, native performance, signing, notarization, upload, or App Store submission.

## 2026-05-24 00:49 CST

- Task: audit current local AI suggestion paths against the human-led release-candidate requirement.
- Files updated: the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: `AiDecompositionPanel`, `taskDecompositionWorkflow.ts`, `taskDecompositionWorkflow.test.ts`, `ExecutionPage.test.tsx`, `aiSuggestions.ts`, and audit storage helpers.
- Verification: current tests verify task decomposition suggestions require human clarification, remain pending until approval, create tasks only on explicit approval, reject invalid/wrong-target/non-pending approval before hierarchy mutation, reject suggestions without creating tasks, and write approval/rejection audit entries. Execution Page tests also verify workflow optimization suggestions are reviewed as useful/not useful without automatic workflow mutation.
- Boundary: this closes RC-005 for current local suggestion surfaces only. RC-006 remains open for rollback/compensation behavior after applied suggestions, and future provider-backed AI or new suggestion kinds must be re-audited.

## 2026-05-24 00:52 CST

- Task: add route regression evidence for execution-mode semantics.
- Files updated: `apps/desktop/src/App.test.tsx`, the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: source search over active app/package code, `App.tsx`, `App.test.tsx`, and `useRouteSync.test.tsx`.
- Verification: focused `pnpm test:run apps/desktop/src/App.test.tsx` passed 7 tests, and focused `pnpm exec biome check apps/desktop/src/App.test.tsx` passed. The new regression verifies `/planning` and `/focus` do not expose standalone legacy `Planning` or `Focus` headings and instead fall back to the normal app surface.
- Boundary: historical docs can still mention `planning/focus` as migration evidence. This closes current active route/UI semantics only and does not add external API page-model endpoints.

## 2026-05-24 00:53 CST

- Task: audit active product copy for non-medical boundary and diagnosis/treatment claims.
- Files updated: the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: bounded `rg` source scan across active app/package/server code, `OnboardingPage.tsx`, `OnboardingPage.test.tsx`, and privacy settings defaults.
- Verification: active UI source uses medical terms only in the onboarding non-medical acknowledgement, which states AttentionOS is not medical advice or clinical diagnosis and does not diagnose or treat ADHD, anxiety, depression, or any health condition. Onboarding tests verify the non-medical acknowledgement is required before entering Ritual, and privacy defaults remain external-AI/telemetry off after onboarding.
- Boundary: this closes current active product-copy medical-claim risk only. It does not replace final legal/privacy review, App Store privacy questionnaire work, or future review after provider-backed AI claims or health-related copy are introduced.

## 2026-05-24 00:55 CST

- Task: audit current privacy, permission, and Settings boundaries for the release-candidate goal.
- Files updated: the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: Settings UI source, onboarding storage/tests, privacy/reminder storage, previous bounded security scan, packaged native Settings QA, Tauri capability file, and Tauri config.
- Verification: Settings covers ritual copy, meditation settings, local-data acknowledgement, future external AI consent, telemetry opt-in, reminder consent/frequency/quiet windows, backup/export/import, and recovery details; onboarding stores local-first defaults with external AI and telemetry off; scans found no active provider keys, telemetry sender, analytics sender, network primitive, or broad native permission; packaged native Settings QA verified save snapshot, native backup creation, native file-picker import, and imported Ritual rendering; Tauri capability remains `["core:default"]`.
- Boundary: this closes RC-039, RC-046, and RC-052 for current local implementation. Native notification delivery remains under RC-042, backup guidance remains under RC-047, and final legal/App Store privacy review remains owner-controlled.

## 2026-05-23 23:47 CST

- Task: implement first-run onboarding for the release-candidate goal.
- Files added: `apps/desktop/src/storage/onboarding.ts`, `apps/desktop/src/storage/onboarding.test.ts`, `apps/desktop/src/pages/OnboardingPage.tsx`, and `apps/desktop/src/pages/OnboardingPage.test.tsx`.
- Files updated: `apps/desktop/src/App.tsx`, `apps/desktop/src/App.test.tsx`, `apps/desktop/src/storage/persistence.ts`, `apps/desktop/src/storage/persistence.test.ts`, `e2e/smoke.spec.ts`, the release-candidate ledger, project state, and changelog.
- Evidence: the active release-candidate ledger kept RC-045 open because there was no first-run onboarding state explaining workflow, local-first data, consent, or the non-medical boundary.
- Verification: focused `pnpm test:run` passed for onboarding, OnboardingPage, App, and persistence tests with 17 tests; focused `pnpm exec biome check` passed for touched desktop TypeScript and E2E files. Final verification passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 239 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 6 Chromium tests, unsigned `tauri build --bundles app --no-sign --ci`, and package metadata/signing inspection.
- Boundary: this slice does not complete accessibility, reminder/notification consent, packaged native onboarding QA, performance evidence, or final App Store privacy/legal review.

## 2026-05-23 23:52 CST

- Task: implement local reminder consent and quiet-window settings for the release-candidate goal.
- Files added: `apps/desktop/src/storage/reminderSettings.ts` and `apps/desktop/src/storage/reminderSettings.test.ts`.
- Files updated: `apps/desktop/src/storage/persistence.ts`, `apps/desktop/src/storage/persistence.test.ts`, `apps/desktop/src/pages/SettingsPage.tsx`, `apps/desktop/src/pages/SettingsPage.test.tsx`, the release-candidate ledger, project state, and changelog.
- Evidence: the active release-candidate ledger kept RC-042 and RC-046 open because Settings lacked reminder frequency, quiet window, and priority override controls.
- Verification: focused `pnpm test:run` passed for reminderSettings, SettingsPage, and persistence tests with 18 tests; focused `pnpm exec biome check` passed for touched desktop TypeScript files. Final verification passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 243 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 6 Chromium tests, unsigned `tauri build --bundles app --no-sign --ci`, and package metadata/signing inspection.
- Boundary: this slice stores local reminder intent only. It does not request macOS notification permission, schedule background notifications, implement native reminder delivery, or close native notification behavior.

## 2026-05-23 23:24 CST

- Task: implement corrupt snapshot quarantine and recovery visibility for the release-candidate goal.
- Files updated: `apps/desktop/src-tauri/src/lib.rs`, `apps/desktop/src/storage/persistence.ts`, `apps/desktop/src/components/layout/Shell.tsx`, `apps/desktop/src/pages/SettingsPage.tsx`, related desktop tests, the release-candidate ledger, project state, and changelog.
- Evidence: the active release-candidate ledger kept RC-047, RC-048, and RC-050 open because import validation, corrupt snapshot handling, and user-visible critical data errors were not product-grade.
- Verification: focused `pnpm test:run` passed for persistence, App, and SettingsPage tests with 17 tests; focused `pnpm exec biome check` passed for touched desktop TypeScript files; `cargo fmt --check` and `cargo check` passed. Final verification passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, full `pnpm test:run` with 230 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 6 Chromium tests, unsigned `tauri build --bundles app --no-sign --ci`, and bundle metadata/signing inspection.
- Boundary: this implementation slice did not by itself prove packaged native restart recovery, broader settings/workflow error states, accessibility, privacy, onboarding, performance, signing, notarization, or App Store readiness.

## 2026-05-23 23:33 CST

- Task: run packaged native persistence/recovery QA with Computer Use.
- Files added: `.gstack/qa-reports/release-candidate-native-recovery-2026-05-23/report.md` plus native QA screenshots and preserved test app-data artifacts under that report directory.
- Files updated: the release-candidate ledger, project state, and changelog.
- Evidence: packaged `AttentionOS.app`, seeded native `attentionos-state.json`, isolated WebKit/cache state, Computer Use accessibility tree and screenshots, app-data recovery file inspection.
- Verification: native restore rendered `Native Restore Proof` in Overview; native corrupt state rendered the shell recovery warning and Data & Settings recovery panel; corrupt payload was moved to app-data `recovery/`; the active state file was replaced with a fresh schema-1 snapshot; original app-data/WebKit/cache state was restored and no packaged app process remained running.
- Boundary: this QA did not sign, notarize, upload, or submit the app, and did not cover packaged Settings backup/import controls, Execution Plan/Focus, accessibility, privacy, onboarding, or performance.

## 2026-05-23 23:37 CST

- Task: implement local-first Privacy & AI settings for the release-candidate goal.
- Files added: `apps/desktop/src/storage/privacySettings.ts` and `apps/desktop/src/storage/privacySettings.test.ts`.
- Files updated: `apps/desktop/src/storage/persistence.ts`, `apps/desktop/src/pages/SettingsPage.tsx`, `apps/desktop/src/pages/SettingsPage.test.tsx`, the release-candidate ledger, project state, and changelog.
- Evidence: the active release-candidate ledger kept RC-046, RC-052, RC-053, and RC-054 open because Settings did not expose privacy/AI/telemetry consent boundaries.
- Verification: focused `pnpm test:run` passed for privacySettings, SettingsPage, and persistence tests with 17 tests; focused `pnpm exec biome check` passed for touched desktop TypeScript files. Final verification passed with `pnpm docs:check`, `pnpm lint`, `git diff --check`, `cargo check`, full `pnpm test:run` with 234 tests, `pnpm build`, `pnpm check`, `pnpm e2e` with 6 Chromium tests, unsigned `tauri build --bundles app --no-sign --ci`, and package metadata/signing inspection.
- Boundary: this slice does not create external AI credentials, send telemetry, implement a privacy policy document, complete a repository secret scan, add notification consent, or close full privacy/security review.

## 2026-05-23 23:41 CST

- Task: run a bounded release-candidate security/privacy scan.
- Files updated: the release-candidate ledger, project state, changelog, and this maintenance log.
- Evidence: repo-local `security-review` checklist; high-confidence key scan over `apps`, `packages`, `supabase`, and `scripts`; environment-variable usage scan; telemetry/vendor scan; network primitive scan; Tauri capability/config inspection.
- Verification: no literal OpenAI/GitHub/Google/Slack/AWS-style keys were found in current source/config; `SUPABASE_SERVICE_ROLE_KEY` appears only as an environment variable name in tests and lazy `requireEnv`; no `fetch`, `XMLHttpRequest`, `WebSocket`, or `EventSource` usage was found under `apps` or `packages`; no telemetry vendor/sender or `sendBeacon` usage was found; Tauri capability remains `["core:default"]`.
- Boundary: the first scan command was too broad and walked generated `.agents` skill fixtures, so it was discarded and replaced with bounded source/config scans. This does not replace a final App Store privacy questionnaire, legal/privacy policy review, credential setup review, or future re-scan after provider integrations.

## 2026-05-23 22:10 CST

- Task: establish the active release-candidate requirements coverage ledger.
- Files added: `docs/plans/2026-05-23-attentionos-release-candidate-requirements-ledger.md`.
- Files updated: `docs/README.md`, `docs/plans/README.md`, `docs/governance/project-state.md`, `docs/governance/changelog.md`, and this maintenance log.
- Evidence: `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md`, `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md`, `docs/sources-or-raw/user-original-long-prompts.zh-CN.md`, `docs/governance/project-state.md`, and sampled desktop implementation files under `apps/desktop/src/`.
- Boundary: the ledger is an active evidence surface, not a release-completion claim. Critical `Open` items remain and must be resolved before the goal can complete.

## 2026-05-23 22:35 CST

- Task: implement the first release-candidate persistence and backup slice.
- Files added: `apps/desktop/src/storage/persistence.ts`, `apps/desktop/src/storage/persistence.test.ts`, `apps/desktop/src/pages/SettingsPage.tsx`, `apps/desktop/src/pages/SettingsPage.test.tsx`, and `apps/desktop/src-tauri/Cargo.lock`.
- Files updated: Tauri command registration, desktop shell/routes, storage write helpers, E2E smoke coverage, Biome generated-file excludes, the release-candidate ledger, project state, and changelog.
- Evidence: current desktop storage helpers, Tauri API type declarations under `node_modules/.pnpm/@tauri-apps+api@2.10.1/`, and Rust compile feedback from `cargo check`.
- Verification: `pnpm test:run` passed with 213 tests; `pnpm build`, `pnpm lint`, `pnpm docs:check`, `git diff --check`, `cargo check`, and `pnpm e2e` with 4 Chromium tests passed. Local browser QA saved screenshots under `.gstack/qa-reports/release-candidate-persistence-2026-05-23/screenshots/` with no console or page errors.
- Tool notes: Context7 quota was exhausted, so Tauri syntax was verified from installed package declarations and compile checks. Initial `cargo check` selected dependencies requiring Rust 1.88 because no lockfile existed; the lockfile now pins a Tauri 2.10.x runtime set that compiles with the current Homebrew Rust 1.86.0.

## 2026-05-23 22:19 CST

- Task: implement the release-candidate ritual settings slice.
- Files updated: `apps/desktop/src/storage/ritualCopy.ts`, `apps/desktop/src/storage/persistence.ts`, `apps/desktop/src/pages/SettingsPage.tsx`, `apps/desktop/src/pages/RitualPage.tsx`, `apps/desktop/src/pages/ritual/MeditationStep.tsx`, related desktop tests, the release-candidate ledger, project state, and changelog.
- Evidence: the active release-candidate ledger identified configurable intention/prayer, meditation settings, and dedication as open Ritual requirements. The existing Ritual path already read local copy but had no product settings UI and hardcoded the meditation duration.
- Verification: focused `pnpm test:run` passed for `RitualPage`, `SettingsPage`, and persistence tests with 13 tests; final verification passed with full `pnpm test:run` (215 tests), `pnpm lint`, `pnpm docs:check`, `git diff --check`, `pnpm build`, `pnpm check`, `cargo check`, and `pnpm e2e` (5 Chromium tests).
- Boundary: this slice does not yet implement ritual schedule behavior, mark-to-task/project behavior, native sound/timer QA, reminder settings, privacy controls, accessibility review, or release packaging.

## 2026-05-23 22:24 CST

- Task: implement Ritual follow-up input marking for the release-candidate goal.
- Files updated: `apps/desktop/src/storage/reflections.ts`, `apps/desktop/src/pages/ritual/ReflectionStep.tsx`, `apps/desktop/src/pages/RitualPage.tsx`, `apps/desktop/src/pages/ExecutionPage.tsx`, related desktop tests, `e2e/smoke.spec.ts`, the release-candidate ledger, project state, and changelog.
- Evidence: the active release-candidate ledger kept RC-018 open because reflections had no visible task/project follow-up marker and Execution Plan could not see Ritual-origin inputs.
- Verification: focused `pnpm test:run` passed for `RitualPage`, `ExecutionPage`, and persistence tests with 20 tests; final verification passed with full `pnpm test:run` (217 tests), `pnpm lint`, `pnpm docs:check`, `git diff --check`, `pnpm build`, `pnpm check`, `cargo check`, and `pnpm e2e` (5 Chromium tests).
- Boundary: this slice only marks and surfaces Ritual inputs. It does not auto-create tasks/projects, does not yet handle dedication text as a separate input, and does not implement the human create/review pipeline required before RC-018 can be marked complete.

## 2026-05-23 22:35 CST

- Task: implement the release-candidate Execution Plan human planning slice.
- Files updated: `apps/desktop/src/storage/hierarchy.ts`, `apps/desktop/src/storage/audit.ts`, `apps/desktop/src/storage/persistence.ts`, `apps/desktop/src/pages/ExecutionPage.tsx`, `apps/desktop/src/pages/OverviewPage.tsx`, related desktop tests, `e2e/smoke.spec.ts`, the release-candidate ledger, project state, and changelog.
- Evidence: the active release-candidate ledger kept RC-025 through RC-030 and RC-033 open because Execution Plan could not create human-authored work, clarify inputs, enforce project/task signals, or persist a single focus candidate.
- Verification: focused `pnpm test:run` passed for `ExecutionPage`, `OverviewPage`, and persistence tests with 19 tests; final verification passed with full `pnpm test:run` (219 tests), `pnpm lint`, `pnpm docs:check`, `git diff --check`, `pnpm build`, `pnpm check`, `cargo check`, and `pnpm e2e` (6 Chromium tests).
- Boundary: this slice does not yet implement existing-entity editing, an AI pre-decomposition clarification gate, full AI decomposition validation, native restart proof for the focus candidate, or release packaging.

## 2026-05-23 22:42 CST

- Task: implement the release-candidate AI decomposition clarification and validation slice.
- Files updated: `apps/desktop/src/ai/taskDecomposition.ts`, `apps/desktop/src/ai/taskDecompositionWorkflow.ts`, `apps/desktop/src/pages/execution/AiDecompositionPanel.tsx`, related desktop tests, `e2e/smoke.spec.ts`, the release-candidate ledger, project state, and changelog.
- Evidence: the active release-candidate ledger kept AI-assisted decomposition open because generated task splits could be drafted without a user clarification and approval did not validate generated step shape.
- Verification: focused `pnpm test:run` passed for `ExecutionPage` and `taskDecompositionWorkflow` with 18 tests; final verification passed with full `pnpm test:run` (220 tests), `pnpm lint`, `pnpm docs:check`, `git diff --check`, `pnpm build`, `pnpm check`, `cargo check`, and `pnpm e2e` (6 Chromium tests) after covering clarification, draft, human-review display, rejection, and Focus entry.
- Boundary: this slice does not yet implement stronger ADHD atomicity/startability validation, imported/existing task validation, provider-backed AI safety, native restart proof, or release packaging.

## 2026-05-23 22:49 CST

- Task: harden Execution Plan task/project validation for the release-candidate goal.
- Files added: `apps/desktop/src/storage/taskValidation.ts` and `apps/desktop/src/storage/hierarchy.test.ts`.
- Files updated: `apps/desktop/src/storage/hierarchy.ts`, `apps/desktop/src/ai/taskDecomposition.ts`, `apps/desktop/src/ai/taskDecompositionWorkflow.ts`, `apps/desktop/src/ai/taskDecompositionWorkflow.test.ts`, `apps/desktop/src/pages/ExecutionPage.tsx`, `apps/desktop/src/pages/ExecutionPage.test.tsx`, the release-candidate ledger, project state, and changelog.
- Evidence: the active release-candidate ledger kept RC-027, RC-033, and RC-034 open because task estimates were silently clamped, task startability was not enforced, AI-created tasks were not revalidated at the storage boundary, and project depth rules were not encoded.
- Verification: focused `pnpm test:run` passed for `hierarchy`, `ExecutionPage`, and `taskDecompositionWorkflow` with 22 tests; final verification passed with full `pnpm test:run` (224 tests), `pnpm lint`, `pnpm docs:check`, `git diff --check`, `pnpm build`, `pnpm check`, `cargo check`, and `pnpm e2e` (6 Chromium tests).
- Boundary: this slice does not yet implement import-snapshot validation, existing-entity editing, richer prioritization/sorting, native restart proof, or release packaging.

## 2026-05-23 22:58 CST

- Task: implement Ritual cadence settings and dedication follow-up behavior for the release-candidate goal.
- Files updated: `apps/desktop/src/storage/ritualCopy.ts`, `apps/desktop/src/storage/reflections.ts`, `apps/desktop/src/storage/persistence.ts`, `apps/desktop/src/pages/SettingsPage.tsx`, `apps/desktop/src/pages/RitualPage.tsx`, `apps/desktop/src/pages/ritual/DedicationStep.tsx`, `apps/desktop/src/pages/ExecutionPage.tsx`, related desktop tests, `e2e/smoke.spec.ts`, the release-candidate ledger, project state, and changelog.
- Evidence: the active release-candidate ledger kept RC-018 and RC-019 open because dedication content could not be marked as later task/project input and Ritual had no user-visible cadence/time/manual-entry settings.
- Verification: focused `pnpm test:run` passed for `RitualPage`, `SettingsPage`, `ExecutionPage`, and persistence tests with 28 tests; final verification passed with full `pnpm test:run` (225 tests), `pnpm lint`, `pnpm docs:check`, `git diff --check`, `pnpm build`, `pnpm check`, `cargo check`, and `pnpm e2e` (6 Chromium tests).
- Boundary: this slice does not implement OS notifications, native launch/fullscreen scheduling, import-snapshot validation, native restart proof, privacy/a11y, or release packaging.

## 2026-05-23 23:12 CST

- Task: harden Tauri macOS release identity and run local unsigned package-readiness checks.
- Files updated: `apps/desktop/src-tauri/tauri.conf.json`, `apps/desktop/src-tauri/capabilities/default.json`, `apps/desktop/src-tauri/Cargo.toml`, `apps/desktop/src-tauri/src/main.rs`, `apps/desktop/src-tauri/src/lib.rs`, `apps/desktop/package.json`, `pnpm-lock.yaml`, the release-candidate ledger, project state, and changelog.
- Evidence: packaging/notarization and signing-entitlements skill guidance; installed Tauri CLI/schema behavior; `tauri info`; generated `AttentionOS.app`; generated `AttentionOS_0.1.0_aarch64.dmg`; mounted-DMG plist/signing inspection; Computer Use native packaged-app smoke path.
- Verification: `pnpm install --lockfile-only`, focused Biome check for native config/package files, `cargo check`, `tauri info`, unsigned `tauri build --bundles app --no-sign --ci`, unsigned `tauri build --bundles dmg --no-sign --ci`, `hdiutil imageinfo`, mounted-DMG `plutil` and `codesign -dvvv`, and Computer Use native smoke all completed. Final workspace verification passed with full `pnpm test:run` (225 tests), `pnpm lint`, `pnpm docs:check`, `git diff --check`, `pnpm build`, `pnpm check`, `cargo check`, and `pnpm e2e` (6 Chromium tests).
- Boundary: this slice intentionally did not sign, notarize, staple, upload, submit to App Store, create certificates, or use Apple Developer credentials. The app and DMG are unsigned/ad hoc local artifacts only.

## 2026-05-19 15:13 CST

- Task: make the previously local Matt Pocock skill setup durable on the current branch and local `main`.
- Files added: `.agents/skills/` Matt Pocock skill directories, `skills-lock.json`, and `docs/agents/`.
- Files updated: `AGENTS.md`, `CLAUDE.md`, `docs/README.md`, `docs/governance/project-state.md`, `docs/governance/changelog.md`, and this maintenance log.
- Evidence: `npx skills@latest add mattpocock/skills --agent codex --skill '*' --yes` installed the project-local skills; `npx skills@latest list --json` listed the installed Matt Pocock skills including `/grill-me`.
- Boundary: `.gstack/` and `.agents/skills/gstack*` remain ignored local tooling artifacts; no application code was changed.
- Tool note: broad home-directory searches were stopped after producing noisy permission and generated-artifact output; the durable setup was reconstructed from the official skills CLI and repo-local configuration surfaces instead.

## 2026-05-13 11:45 CST

- Task: push the experience-alignment closeout to `origin/main`.
- Files updated: `docs/governance/project-state.md`, `docs/governance/changelog.md`, and this maintenance log.
- Evidence: `git push origin main` updated GitHub from `44a846c` to `8ff2d7f`; `git status --short --branch` then reported `main...origin/main` with only the unrelated `.gitignore` working-tree change remaining.
- Boundary: no branch deletion, PR creation, or `.gitignore` cleanup was performed.

## 2026-05-13 11:41 CST

- Task: close out the experience-alignment branch after owner approval.
- Files updated: `docs/governance/project-state.md`, `docs/governance/changelog.md`, and this maintenance log.
- Evidence: local `main` was fast-forward merged from `codex-experience-ritual-semantics` at `faee10d`; `git status --short --branch` reported `main...origin/main [ahead 4]` with only the unrelated `.gitignore` working-tree change remaining.
- Boundary: the merge was local only. No push, PR creation, branch deletion, or `.gitignore` cleanup was performed.
- Tool note: the first `git switch main` attempt failed because sandbox permissions blocked `.git/index.lock`; the command succeeded after approval.

## 2026-05-13 09:52 CST

- Task: run `/gstack-autoplan` for the integration polish and regression slice.
- Files added: `docs/plans/2026-05-13-attentionos-integration-polish-regression-slice.md`.
- Files updated: `docs/README.md`, `docs/plans/README.md`, `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, `docs/governance/project-state.md`, `docs/governance/changelog.md`, and this maintenance log.
- Evidence: Slice 6 in `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md` and local integration search across user-facing desktop UI files.
- Boundary: initial scan found no required application-code change; this slice should stay focused on final QA, verification, and closeout docs unless a defect appears.
- Tool note: spawning an additional read-only explorer failed because the current thread had reached the subagent limit, so the integration scan was performed locally.

## 2026-05-13 09:56 CST

- Task: run final `/gstack-qa-only` integration regression QA.
- Files added: `.gstack/qa-reports/qa-report-integration-regression-2026-05-13.md`.
- Files updated: the integration slice ledger, blueprint, and governance/index documents.
- Evidence: full browser click path from Ritual to Overview to Execution Plan and Focus, desktop screenshots, mobile Overview screenshot, forbidden-copy scan, Overview read-only button scan, and console/page-error check.
- Verification: `/gstack-qa-only` integration regression QA passed with 23 checks and no console or page errors; final `pnpm docs:check`, `pnpm check`, `pnpm test:run` with 206 tests, `pnpm lint`, `pnpm build`, `pnpm e2e` with 3 Chromium tests, and `git diff --check` all passed.
- Tool note: the first integration QA run failed because the script asserted an outdated Ritual text string. The script was corrected to the current user-facing intention copy and rerun successfully. The first final `pnpm e2e` attempt failed because sandbox permissions blocked the local Playwright web server from listening on `127.0.0.1:1420`; the same command passed after local server permission was granted.

## 2026-05-13 09:46 CST

- Task: implement and QA the AI suggestion placement and HITL clarity slice.
- Files added: `.gstack/qa-reports/qa-report-ai-hitl-clarity-2026-05-13.md`.
- Files updated: `apps/desktop/src/pages/ExecutionPage.tsx`, `apps/desktop/src/pages/execution/AiDecompositionPanel.tsx`, `apps/desktop/src/pages/execution/EvolutionSuggestionsPanel.tsx`, `apps/desktop/src/storage/aiSuggestions.ts`, `apps/desktop/src/storage/audit.ts`, `apps/desktop/src/ai/taskDecompositionWorkflow.ts`, related desktop tests, `e2e/evolution-learning.spec.ts`, the AI HITL slice ledger, blueprint, and governance/index documents.
- Evidence: Slice 5 in `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, D5 in `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`, and read-only explorer review of current AI suggestion surfaces.
- Verification: targeted AI storage/workflow/Execution tests passed with 20 tests; targeted Biome check passed; targeted `git diff --check` passed; `/gstack-qa-only` AI HITL click test passed with no console or page errors; final `pnpm docs:check`, `pnpm check`, `pnpm test:run` with 206 tests, `pnpm lint`, `pnpm build`, `pnpm e2e` with 3 Chromium tests, and `git diff --check` all passed.
- Tool notes: the storage/workflow rejection path was implemented by a scoped worker agent, then reviewed and integrated in the main worktree. QA used project-installed Playwright because gstack browse had already failed earlier in the session with no available port. The first full `pnpm e2e` attempt failed because sandbox permissions blocked the local Playwright web server from listening on `127.0.0.1:1420`; the same command passed after local server permission was granted.

## 2026-05-13 09:39 CST

- Task: run `/gstack-autoplan` for the AI suggestion placement and HITL clarity slice.
- Files added: `docs/plans/2026-05-13-attentionos-ai-hitl-clarity-slice.md`.
- Files updated: `docs/README.md`, `docs/plans/README.md`, `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, `docs/governance/project-state.md`, `docs/governance/changelog.md`, and this maintenance log.
- Evidence: Slice 5 in `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, D5 in `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`, and read-only explorer review of current AI suggestion surfaces.
- Boundary: this is an Execution Plan AI/HITL clarity slice only; it does not start Phase 4 protocol, SDK, MCP, plugin, provider, token, RAG, or offline-sync implementation.
- Tool note: a multi-file documentation read produced output despite a session workflow warning and was not retried blindly.

## 2026-05-13 09:28 CST

- Task: implement and QA the Overview read-only scan slice.
- Files added: `apps/desktop/src/pages/overview/VisionOverviewPanel.tsx` and `.gstack/qa-reports/qa-report-overview-readonly-scan-2026-05-13.md`.
- Files updated: `apps/desktop/src/pages/OverviewPage.tsx`, `apps/desktop/src/pages/OverviewPage.test.tsx`, `apps/desktop/src/storage/hierarchy.ts`, `e2e/smoke.spec.ts`, `e2e/evolution-learning.spec.ts`, the Overview slice ledger, blueprint, and governance/index documents.
- Evidence: Slice 3 in `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, D4 in `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`, and read-only explorer review of current Overview implementation.
- Verification: targeted Overview and hierarchy tests passed with 4 tests; targeted Biome check passed; targeted `git diff --check` passed; `/gstack-qa-only` Overview click test passed with no console or page errors; final `pnpm docs:check`, `pnpm check`, `pnpm test:run` with 200 tests, `pnpm lint`, `pnpm build`, `pnpm e2e` with 3 Chromium tests, and `git diff --check` all passed.
- Tool notes: the first Overview QA script run failed because direct `node` execution could not resolve the pnpm-managed Playwright package; the import was corrected to `@playwright/test` before rerunning. A multi-file documentation read produced output despite a session workflow warning and was not retried blindly. The first full `pnpm test:run` found stale test assertions for the previous default hierarchy labels; tests were updated to the new user-facing labels. The first `pnpm e2e` attempt failed because sandbox permissions blocked the local Playwright web server from listening on `127.0.0.1:1420`; the same command passed after local server permission was granted.

## 2026-05-13 09:15 CST

- Task: run `/gstack-autoplan` for the Overview read-only scan slice.
- Files added: `docs/plans/2026-05-13-attentionos-overview-readonly-scan-slice.md`.
- Files updated: `docs/README.md`, `docs/plans/README.md`, `docs/governance/project-state.md`, `docs/governance/changelog.md`, and this maintenance log.
- Evidence: Slice 3 in `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, D4 in `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`, and read-only explorer review of current Overview implementation.
- Boundary: this is an Overview product-experience slice only; it does not start Phase 4 protocol, SDK, MCP, plugin, or offline-sync implementation.

## 2026-05-13 09:06 CST

- Task: implement and QA the experience-alignment Ritual semantic correction slice.
- Files added: `docs/plans/2026-05-13-attentionos-ritual-semantic-correction-slice.md`, `apps/desktop/src/storage/ritualCopy.ts`, and `.gstack/qa-reports/qa-report-ritual-semantics-2026-05-13.md`.
- Files updated: `apps/desktop/src/pages/RitualPage.tsx`, `apps/desktop/src/pages/ritual/MeditationStep.tsx`, `apps/desktop/src/pages/ritual/DedicationStep.tsx`, `apps/desktop/src/pages/RitualPage.test.tsx`, `apps/desktop/src/components/layout/Shell.tsx`, `apps/desktop/src/App.test.tsx`, and governance/index documents.
- Evidence: Slice 2 in `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`; D3 Ritual language decision in `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`; explorer review of existing Ritual copy; Playwright QA screenshots under `.gstack/qa-reports/ritual-semantics-20260513/screenshots/`.
- Verification: targeted `pnpm test:run apps/desktop/src/pages/RitualPage.test.tsx apps/desktop/src/App.test.tsx` passed with 7 tests; `/gstack-qa-only` Ritual click test passed with no console or page errors; final `pnpm docs:check`, `pnpm check`, `pnpm test:run` with 200 tests, `pnpm lint`, `pnpm build`, `pnpm e2e` with 3 Chromium tests, and `git diff --check` all passed.
- Tool notes: `gh repo view` failed because network access to `api.github.com` was unavailable, so the base branch fell back to local `origin/HEAD`; gstack browse failed to start its service because it reported no available port, so QA continued with project-installed Playwright; the first Playwright launch failed under sandbox permissions and passed after escalation; the first QA run found shell footer scaffold copy, which was fixed before the final passing QA run.

## 2026-05-13 07:49 CST

- Task: implement and QA the experience-alignment Execution Plan/Focus slice.
- Files added: `packages/machines/src/execution-mode.ts`, `packages/machines/__tests__/execution-mode.test.ts`, `.gstack/qa-reports/qa-report-127-0-0-1-1420-2026-05-13.md`, `.gstack/qa-reports/baseline.json`, and `.gstack/projects/YannJY02-AttentionOS/yann.jy-main-test-outcome-20260513-0749.md`.
- Files updated: `apps/desktop/src/App.tsx`, `apps/desktop/src/components/layout/Shell.tsx`, `apps/desktop/src/hooks/useRouteSync.ts`, `apps/desktop/src/pages/ExecutionPage.tsx`, related RTL/e2e tests, `biome.json`, and governance/index documents.
- Verification: machines targeted tests passed with 62 tests, desktop targeted tests passed with 29 tests, `pnpm e2e` passed with 3 Chromium tests, and final `pnpm docs:check`, `pnpm check`, `pnpm test:run` with 199 tests, `pnpm lint`, `pnpm build`, `pnpm e2e`, and `git diff --check` all passed.
- Review fix: diff review found that task lifecycle state would reset when moving Focus -> Plan -> Focus. `ActiveTaskSession` now stays mounted across `/execution/*` mode switches, and `apps/desktop/src/pages/ExecutionPage.test.tsx` covers this regression.
- Tool notes: the first machines/desktop targeted run exposed an unsupported XState `and` guard and an infinite RESTORE_MODE render loop; both were fixed before rerun. The first `pnpm e2e` attempt failed because sandbox permissions blocked the local Vite dev server from listening on `127.0.0.1:1420`; the same command passed after local server permission was granted. `/gstack-qa-only` preamble initially attempted to write global `~/.gstack`; subsequent QA artifacts were written under repo-local `.gstack`.

## 2026-05-13 07:11 CST

- Task: complete Phase 2 `/gstack-plan-design-review` for AttentionOS experience alignment using owner-approved normal-chat fallback for `AskUserQuestion`.
- Files updated: `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`, `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, `docs/plans/2026-05-10-attentionos-experience-alignment-review-gate-blocker.md`, `docs/plans/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Decisions accepted: D1 mobile bottom stage navigation with top layer context; D2 `/execution/plan` and `/execution/focus` subroutes; D3 neutral default Ritual language with configurable prayer/dedication; D4 timeline-first Vision; D5 AI suggestions grouped by workflow stage/current mode.
- Boundary: no application code was changed, no visual implementation was accepted, and `/gstack-autoplan` remains blocked until Phase 3 `/gstack-plan-eng-review` completes.

## 2026-05-13 07:33 CST

- Task: complete Phase 3 `/gstack-plan-eng-review` for AttentionOS experience alignment using owner-approved normal-chat fallback for `AskUserQuestion`.
- Files added: `.gstack/projects/YannJY02-AttentionOS/yann.jy-main-eng-review-test-plan-20260513-0733.md`.
- Files updated: `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`, `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, `docs/plans/2026-05-10-attentionos-experience-alignment-review-gate-blocker.md`, `docs/plans/README.md`, `docs/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Decisions accepted: E1 add `executionModeMachine`; E2 URL requests mode and machine validates; E3 keep task lifecycle separate with future migration path; E4 require full contract test scope; E5 implement one complete slice.
- Boundary: no application code was changed; `/gstack-autoplan` is now the next gate before implementation.

## 2026-05-13 07:38 CST

- Task: run Phase 4 `/gstack-autoplan` for AttentionOS experience alignment.
- Files added: `docs/plans/2026-05-13-attentionos-experience-alignment-implementation-slice.md`, `.gstack/projects/YannJY02-AttentionOS/main-autoplan-restore-20260513-073752.md`, and `.gstack/projects/YannJY02-AttentionOS/yann.jy-main-autoplan-test-plan-20260513-0738.md`.
- Files updated: `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`, `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, `docs/plans/README.md`, `docs/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Output: one complete implementation slice covering `executionModeMachine`, `/execution/plan`, `/execution/focus`, mobile bottom stage navigation, Plan/Focus AI boundaries, and full contract tests.
- Boundary: no application code was changed; next coding phase should implement the slice and then run `/gstack-qa-only`.

## 2026-05-10 22:02 CST

- Task: invoke Phase 2 `/gstack-plan-design-review` and Phase 3 `/gstack-plan-eng-review` for AttentionOS experience alignment.
- Files added: `docs/plans/2026-05-10-attentionos-experience-alignment-review-gate-blocker.md` and `.gstack/projects/YannJY02-AttentionOS/checkpoints/20260510-220217-attentionos-experience-alignment-gates.md`.
- Files updated: `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, `docs/plans/README.md`, `docs/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Evidence: both gstack review skills require `AskUserQuestion` for non-trivial review findings; the current Codex Desktop tool context has no callable `AskUserQuestion` variant. `/gstack-context-save` then captured the blocked handoff state.
- Boundary: did not fabricate design or engineering review results, did not edit application code, and did not start `/gstack-autoplan` implementation slicing.
- Tool note: session workflow warnings reported recent reads may have failed; the associated commands returned output and were not blindly retried.

## 2026-05-10 22:01 CST

- Task: execute Phase 1 `/gstack-design-consultation` for AttentionOS experience alignment.
- Files added: `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`.
- Files updated: `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, `docs/plans/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Evidence: Phase 0 evidence ledger, product baseline, workflow semantic baseline, original user long prompt, and current UI capture findings.
- Boundary: wrote a stage-specific experience contract under `docs/plans/`; did not create root `DESIGN.md`, generate final visual assets, or implement code.

## 2026-05-10 22:00 CST

- Task: execute Phase 0 `/gstack-investigate` for AttentionOS experience alignment.
- Files added: `docs/plans/2026-05-10-attentionos-experience-alignment-evidence-ledger.md`.
- Files updated: `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, `docs/plans/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Evidence: refreshed desktop and mobile UI captures under `/private/tmp/attentionos-ui-audit/`; product baseline, workflow baseline, Phase 2/3/4 plan surfaces, desktop UI code, XState machines, and prior project memory.
- Root-cause hypothesis: the architecture direction is mostly intact, but the frontend lacks an explicit experience contract, causing scaffold/demo patterns and a fixed desktop shell to dominate the user experience.
- Tool notes: a mobile Execution flow capture failed waiting for `Start execution`, so `/execution` was captured directly; two multi-file `nl` attempts failed on macOS and were replaced with targeted single-file reads.

## 2026-05-10 18:05 CST

- Task: create a draft AttentionOS experience-alignment blueprint with exact `/gstack` skill gates per phase.
- Files added: `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`.
- Files updated: `docs/plans/README.md`, `docs/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Evidence: prior UI/product diagnosis identified an experience contract gap; product baseline requires workflow-first and attention-first UI; workflow baseline fixes `ritual / overview / execution`; Phase 4 intake remains draft and non-expansive.
- Boundary: no code implementation was started; the blueprint does not authorize Phase 4 protocol work or root-level plan creation.

## 2026-05-09 19:45 CST

- Task: close the post-merge Phase 3 documentation state and prepare Phase 4 intake.
- Files added: `docs/plans/2026-05-09-phase-4-intake.md`.
- Files updated: `docs/governance/project-state.md`, `docs/README.md`, `docs/plans/README.md`, `docs/governance/changelog.md`, and this maintenance log.
- Evidence: `main` is synchronized with `origin/main` at `ebda370` (`merge: phase 3 evolutionary learning`); Phase 3 verification was already recorded in the Phase 3 ledger.
- Scope boundary: Phase 4 is framed as draft intake only. It is not marked as an accepted implementation contract, and broad MCP, SDK, plugin, or offline-sync work remains blocked until the first slice is narrowed.
- Tool note: a session workflow warning reported the previous `tail` read may have failed; the command returned output and was not blindly retried.

## 2026-05-09 19:30 CST

- Task: close Phase 3 merge-readiness gaps after parallel agent review.
- Files updated: `apps/server/src/learning-runtime.ts`, `packages/storage/src/repositories/audit.ts`, server/storage/desktop regression tests, `docs/plans/2026-05-09-phase-3-evolutionary-learning-ledger.md`, `docs/governance/project-state.md`, `docs/governance/changelog.md`, and this maintenance log.
- Fix: server-backed learning analysis now reads audit events for the learning window instead of passing an empty audit list into `analyzeBehaviorPatterns`.
- Coverage added: audit-window ingestion regression, `AuditRepository.findWindow`, workflow optimization storage rejection, and desktop HITL rejection.
- Verification: targeted affected tests passed with 4 files and 14 tests; full `pnpm check`, `pnpm test:run` (42 files, 190 tests), `pnpm lint`, `pnpm build`, and `pnpm e2e` (2 Chromium tests) passed.
- Tool note: a failed read of `packages/core/src/audit-types.ts` showed the file does not exist; the real audit types were then located with `rg` in `packages/core/src/v2-types.ts`.

## 2026-05-09 18:05 CST

- Task: implement Phase 3 evolutionary learning as a deterministic HITL loop.
- Files added: `docs/plans/2026-05-09-phase-3-evolutionary-learning-ledger.md`, `packages/core/src/learning-types.ts`, `packages/ai/src/evolution.ts`, `packages/ai/src/observability.ts`, `packages/storage/src/repositories/attention-observation.ts`, `apps/server/src/learning-runtime.ts`, `apps/desktop/src/storage/learning.ts`, desktop learning panels, `supabase/migrations/0005_phase3_learning.sql`, and `e2e/evolution-learning.spec.ts`.
- Files updated: `packages/core/src/ai-types.ts`, AI/storage/server/desktop exports and tests, `docs/README.md`, `docs/plans/README.md`, `docs/governance/project-state.md`, and `docs/governance/changelog.md`.
- Evidence: Phase 2 contract required AI suggestions to stay human-reviewed; Phase 3 architecture called for behavior pattern analysis, workflow optimization suggestions, adoption tracking, and Langfuse-style observability.
- Verification in progress: targeted AI, storage, server, and desktop tests passed before final workspace verification.
- Tool note: several session workflow warnings claimed a recent tool may have failed; the associated commands returned output and were not blindly retried.

## 2026-05-09 14:53 CST

- Task: initial AttentionOS documentation-governance audit and conservative setup.
- Files read: `CLAUDE.md`, `package.json`, `apps/desktop/README.md`, `plans/phase1-deterministic-core.md`, `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md`, `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md`, `docs/plans/2026-03-21-attentionos-v2-architecture-design.md`, `docs/plans/2026-05-09-phase-2-completion-ledger.md`, `docs/plans/2026-05-09-phase-2-ai-reasoning-contract.md`, and the `doc-governance-maintainer` skill files.
- Commands used as evidence: `git status --short`, `rg --files`, `python3 -B /Users/yann.jy/.agents/skills/doc-governance-maintainer/scripts/audit_doc_system.py /Users/yann.jy/Desktop/AI/AttentionOS`, `python3 -B /Users/yann.jy/.agents/skills/doc-governance-maintainer/scripts/setup_doc_governance.py /Users/yann.jy/Desktop/AI/AttentionOS --dry-run`, `git branch --show-current`, `git log --oneline --decorate -n 20`, and targeted `rg`/`sed` reads.
- Failed or noisy attempts: broad `find . -maxdepth 3 -type d` produced dependency noise and was not repeated; `rg --files docs/roadmap-execution` failed because that referenced directory is absent, which is recorded as a stale-link finding.
- Files changed: `project-state.md`, `changelog.md`, `decisions/`, `sources-or-raw/`, `work/`, `archive/`, and `.ai/`.
- Evidence: structural audit reported missing `project-state.md`, `.ai`, `decisions`, `sources-or-raw`, `work`, and `archive`; setup dry-run proposed the same governance surface plus an AGENTS proposal.
- Proposals created: AGENTS documentation-governance block, README/legacy cleanup proposal, maintenance-trigger evolution proposal, and proposed authority-map decision.
- Risks: `project-state.md` is now a recovery surface, but the authority map remains proposed until accepted by the owner or encoded in repo instructions.

## 2026-05-09 15:30 CST

- Task: consolidate documentation entrypoints and remove duplicate plans directory.
- Files changed: `README.md`, `docs/README.md`, `docs/plans/README.md`, `docs/apps/desktop.md`, `docs/roadmap-execution/README.md`, `docs/plans/phase1-deterministic-core.md`, `apps/desktop/README.md`, `CLAUDE.md`, `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md`, `project-state.md`, `changelog.md`, `decisions/2026-05-09-doc-governance-authority-map.md`, and `.ai/*` governance reports/proposals.
- Evidence: user requested diagnosis and organization of all documentation content, called out two `plans` directories, and requested dependent references be updated.
- Dependency updates: path references now point to `docs/README.md`, `docs/plans/`, `docs/apps/desktop.md`, and `docs/roadmap-execution/README.md`.
- Risks: root governance surfaces still exist by design for recovery and AI maintenance; docs content should be discovered through `docs/README.md`.

## 2026-05-09 15:47 CST

- Task: move all documentation-related governance surfaces under `docs/` to reduce cognitive load.
- Files moved: `project-state.md` -> `docs/governance/project-state.md`; `changelog.md` -> `docs/governance/changelog.md`; `decisions/` -> `docs/decisions/`; `sources-or-raw/` -> `docs/sources-or-raw/`; `work/` -> `docs/work/`; `archive/` -> `docs/archive/`; `.ai/` -> `docs/governance/`.
- Dependency updates: updated README, docs index, project state, proposed AGENTS block, proposed decision, stale report, audit report, and evolution proposal references to the new `docs/` paths.
- Root exceptions: `README.md` remains as a thin platform entrypoint; `CLAUDE.md` remains as a tool-discovery instruction file.
- Code package docs: removed `apps/desktop/README.md`; durable desktop documentation now lives at `docs/apps/desktop.md`.

## 2026-05-09 16:06 CST

- Task: categorize remaining loose top-level files under `docs/`.
- Files moved: `docs/MASTER_PRODUCT_PLAN.zh-CN.md` -> `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md`; `docs/WORKFLOW_CANONICAL_MODEL.zh-CN.md` -> `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md`; `docs/user-original-long-prompts.zh-CN.md` -> `docs/sources-or-raw/user-original-long-prompts.zh-CN.md`; `docs/project-state.md` -> `docs/governance/project-state.md`; `docs/changelog.md` -> `docs/governance/changelog.md`.
- Files added: `docs/product/README.md`, `docs/workflow/README.md`.
- Dependency updates: updated docs index, project state, authority decision, workflow references, roadmap reference, and architecture tree/table references.
- Failed attempt: first workflow-file move failed because `docs/workflow/` was not ready before the parallel `mv`; the file was moved successfully after the directory existed.

## 2026-05-09 16:19 CST

- Task: apply accepted documentation authority map and future AI-generated-document workflow.
- Files added: `AGENTS.md`, `docs/governance/ai-generated-doc-workflow.md`, `docs/archive/plans/README.md`, `docs/archive/governance/proposed-updates/README.md`, and `docs/governance/proposed-updates/README.md`.
- Files moved: `docs/plans/phase1-deterministic-core.md` -> `docs/archive/plans/phase1-deterministic-core.md`; applied proposal files from `docs/governance/proposed-updates/` -> `docs/archive/governance/proposed-updates/`.
- Files updated: `README.md`, `CLAUDE.md`, `docs/README.md`, `docs/archive/README.md`, `docs/plans/README.md`, `docs/governance/README.md`, `docs/governance/project-state.md`, `docs/governance/stale-report.md`, `docs/governance/changelog.md`, and `docs/decisions/2026-05-09-doc-governance-authority-map.md`.
- Evidence: owner accepted the authority map and requested future AI-generated files to be routed, standardized, updated, and archived after implementation.
- Tool note: a session workflow warning reported a recent tool may have failed; the associated `rg`/`find` command returned output and was not retried blindly.
- Verification note: the shared audit script still reports expected docs-centered mapping warnings and archive-reference warnings; these are recorded in `docs/governance/stale-report.md`.

## 2026-05-09 16:40 CST

- Task: implement a single developer todo intake and AI development document lifecycle.
- Files added: `docs/work/todo.md`, `docs/governance/development-document-lifecycle.md`, `docs/decisions/2026-05-09-developer-todo-and-doc-lifecycle.md`, `docs/archive/work/README.md`, and `docs/archive/governance/README.md`.
- Files updated: `AGENTS.md`, `docs/README.md`, `docs/work/README.md`, `docs/governance/ai-generated-doc-workflow.md`, `docs/governance/project-state.md`, `docs/governance/changelog.md`, and `docs/governance/maintenance-log.md`.
- Evidence: owner requested direct implementation of a unique developer todo and a workflow that prevents AI-generated prompts, blueprints, verification notes, audits, and handoffs from accumulating as active context.
- Tool note: session workflow warnings reported recent tools may have failed; the associated parallel reads returned output and were not retried blindly.
- Verification note: initial audit flagged the new decision as missing a Rationale section; the decision was updated before final verification.

## 2026-05-09 16:50 CST

- Task: implement low-risk automatic documentation governance checks.
- Files added: `scripts/check-doc-governance.mjs`, `.githooks/pre-commit`, and `docs/governance/documentation-automation.md`.
- Files updated: `package.json`, `AGENTS.md`, `docs/README.md`, `docs/governance/ai-generated-doc-workflow.md`, `docs/governance/project-state.md`, `docs/governance/changelog.md`, and `docs/governance/maintenance-log.md`.
- Automation added: `pnpm docs:check` checks root/doc boundaries, duplicate todo files, generated-doc names, decision structure, code-adjacent docs, and resolved proposals left pending.
- Hook added: `.githooks/pre-commit` runs `pnpm docs:check` once `pnpm hooks:install` sets `core.hooksPath`.
- Safety boundary: automation reports or blocks low-risk drift only; accepting decisions, editing raw sources, modifying baselines, changing `AGENTS.md`, and archiving key current files still require explicit owner confirmation.
- Tool note: `find scripts ...` failed because `scripts/` did not exist yet; a later broad hook/config scan produced `.turbo` cache noise, so implementation used targeted file reads afterward.
- Adjustment: archive-reference warnings were removed from the custom check because archive references are part of the accepted AttentionOS lifecycle and made default automation too noisy.
- Installation: first `pnpm hooks:install` failed because sandboxed git could not lock `.git/config`; it was rerun with approval and succeeded. `git config --get core.hooksPath` now returns `.githooks`.
- Verification: `pnpm docs:check` passed cleanly after hook installation, `pnpm check` passed with 14 Turbo tasks cached/successful after running docs governance first, and `git diff --check` passed.
- Shared audit note: the external `audit_doc_system.py` still reports expected docs-centered mapping and archive-reference warnings; these remain documented as accepted AttentionOS-specific warnings.
