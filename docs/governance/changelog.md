# Changelog

## 2026-07-14

- Added `packages/workflow` as the owner of canonical workflow types, immutable Workflow Facts, hierarchy rules, validation, and state machines; desktop hierarchy storage now delegates domain mutations to that package.
- Removed the disconnected server, Supabase, storage, SDK, MCP, sync, and policy placeholder surfaces from the accepted desktop-only runtime; preserved their prior implementation in the normalization baseline and Git history.
- Required completed tasks and tracked issues with repository changes to end with a scoped automatic commit and normal push, while forbidding unrelated staging, empty tracker-only commits, skipped hooks, and force pushes.
- Consolidated repo-local AI instructions into `AGENTS.md`, removed `CLAUDE.md`, and updated active documentation and checks to use the single instruction authority.
- Rebuilt the global Matt skill routing around GitHub Issues, the five canonical triage labels, and a lazy multi-context `CONTEXT-MAP.md` layout.
- Removed the repository-vendored Matt Pocock skills and `skills-lock.json`; AttentionOS now relies on the owner's global Matt skill configuration while retaining repository-specific routing under `docs/agents/`.

## 2026-05-24

- Added the final local macOS release-candidate readiness report at `docs/plans/2026-05-24-attentionos-release-readiness-report.md`.
- Closed the release-candidate ledger to terminal status with 58 implemented/verified rows, 1 owner-deferred row, 1 external blocker, and 0 open rows.
- Rebuilt the unsigned `.app` and `.dmg`, passed the final verification suite, and recorded the current browser QA evidence path `.gstack/qa-reports/release-candidate-browser-workflow-2026-05-24-12-10-06/`.
- Added local integration reminder handoff settings for calendar-file, Focus handoff, and app auto-open targets, with explicit permission copy, local audit entries, and a configurable 1-6/day fatigue cap.
- Verified the packaged native app with Computer Use after the GUI became accessible: onboarding, Ritual, Overview five-layer traversal, Execution Plan, Execution Focus progress/review/completion, and return to Overview.
- Audited the Developer ID path and found only Apple Development signing identities available locally; Developer ID signing/notarization remains credential-blocked.
- Recorded the owner RC decisions `D1=A, D2=C, D3=A, D4=B`: fullscreen/scheduled Ritual is deferred for this RC, integration reminders remain open for a narrowed slice, Computer Use native GUI/VoiceOver QA is authorized, and the Developer ID path is selected without upload/submission authorization.
- Added `pnpm release:ledger` and `pnpm release:ledger:complete` to audit the release-candidate coverage ledger and block false completion claims while rows remain open.
- Added a draft release-candidate owner decision packet for the remaining fullscreen/scheduled Ritual, native notification, native GUI/VoiceOver, and Apple distribution gates.
- Added `pnpm qa:browser:release` for repeatable production-browser release QA with screenshots and console/page-error evidence.
- Added an opt-in native QA readiness marker and `pnpm performance:check:macos` for packaged-app launch, valid snapshot restore, and corrupt native snapshot recovery timing.
- Added macOS release-readiness metadata and audit tooling: App Store category, Info.plist merge, App Sandbox entitlements file, explicit hardened-runtime intent, and `pnpm release:check:macos`.
- Verified rebuilt unsigned `.app`/`.dmg` package metadata, generated Info.plist category/encryption flags, DMG validity, and Mach-O dependency resolution while keeping signing/notarization/App Store upload as external blockers.
- Added a shared read-only `attentionos.read.v1` SDK protocol contract and MCP manifest adapter for release-candidate protocol readiness, with tests that reject write-capability drift.
- Added global focus-visible and reduced-motion CSS boundaries for the desktop app.
- Added Playwright accessibility coverage for visible text contrast, keyboard-only completion of the primary workflow, and reduced-motion transition/animation suppression.
- Documented the local-first storage boundary audit showing all primary desktop product storage keys are snapshot-managed, mirrored to app-local native persistence, and not backed by cloud/sync as the primary store.
- Added a Settings integration boundary panel stating that current release behavior does not monitor external apps, screens, messages, browser activity, or calendar data.
- Documented that future plugin/API/auto-open integrations must be scoped, user-approved, and auditable before touching external apps.
- Documented the release-critical attention-first screen audit across onboarding, Ritual, Overview, Execution Plan, Execution Focus, Capture, Settings, and Shell.
- Added manual attention calibration in Settings, combining subjective ratings, manual behavior signals, and probe fields into local confidence-scored observations.
- Added user correction for local attention estimates, persisted into learning observations and app-state snapshots.
- Changed `createId` to avoid a browser bundle dependency on `node:crypto`.
- Added a human-triggered rollback and restore path for applied AI task-decomposition suggestions.
- Changed AI suggestion audit evidence to include rollback snapshots and restore entries for AI-created tasks.
- Added regression coverage for archiving and restoring AI-created tasks from audit history.
- Added a Capture route for local multi-channel context capture across idea, task, project, and calendar channels.
- Added Execution Plan draft inputs from captured task/project context without auto-creating hierarchy entities.
- Added context-capture storage recovery and app-state snapshot coverage.
- Added bounded interruption recovery cues in Overview and Execution Plan for saved Focus runtime state.
- Changed task runtime storage to expose the current saved Focus runtime for recovery routing without requiring a prior focus candidate.
- Added regression coverage for Overview recovery bridge behavior and Plan-mode Continue in Focus recovery.
- Added a read-only Overview release metrics panel for attention ratio, switching pressure, recovery cues, focus success, plan fulfillment, reminder load, recording friction, autonomy, and misjudgment signals.
- Added local release metric derivation from attention observations, execution audit entries, hierarchy tasks, AI suggestions, reflection inputs, and reminder settings without enabling passive sensing or telemetry.
- Added regression coverage for release metric calculation and Overview guardrail visibility.
- Added a local storage-recovery ledger for malformed helper-storage reads, preserving original payloads before safe fallbacks.
- Changed Shell and Data & Settings to show visible, clearable recovery warnings for malformed local settings/workflow entries.
- Added regression coverage for storage recovery preservation, malformed privacy settings, malformed hierarchy fallback, Settings recovery visibility, and global shell recovery behavior.
- Added a Playwright route-level accessibility audit for onboarding, Ritual, Overview, Execution Plan, seeded Execution Focus, and Settings.
- Fixed the hidden Settings JSON import input so the screen-reader-reachable file control has an accessible name.
- Added Playwright browser performance/usability smoke coverage for launch, main workflow movement, Plan-to-Focus, Settings snapshot feedback, and corrupt snapshot recovery warning timing.
- Verified packaged native Settings save snapshot, backup creation, file-picker import, and imported Ritual rendering with Computer Use QA artifacts.
- Verified packaged native Overview-to-Execution Plan-to-Focus workflow, Focus timer/progress/review/completion controls, and Overview return with Computer Use QA artifacts.
- Added persisted active Focus runtime recovery for executing/paused/reviewing task state and actual minutes.
- Verified browser reload and packaged native app-relaunch recovery for an executing Focus task with `Actual: 5 min`.
- Added explicit Focus exit controls so executing/reviewing work can pause, audit, persist progress, and return to Execution Plan intentionally.
- Documented the workflow surface evidence audit for Personal Attention OS framing, stage navigation, Overview read-only behavior, hierarchy context, and the Overview-to-Execution bridge.
- Added regression coverage for the single-focus-candidate invariant across competing Execution Plan actions.
- Documented the human-led AI mutation audit showing current local suggestions stay pending until explicit review and do not mutate hierarchy data on rejection or invalid approval.
- Added route regression coverage proving legacy `/planning` and `/focus` are not active standalone product surfaces.
- Documented the active-copy non-medical boundary audit for onboarding and diagnosis/treatment claim avoidance.
- Documented the privacy/settings boundary audit covering local data, external AI consent, telemetry, reminder intent, backup/import/export, passive-sensing absence, and Tauri permissions.
- Added separate native export-file handling, browser fallback export coverage, and Settings guidance for snapshot/backup/export/restore rotation and locations.
- Changed Ritual meditation so the configured duration is an actual completion boundary, with tests for timer completion and bell cues plus packaged native QA for start, pause, resume, and automatic transition to Reflection.
- Added Reflection storage recovery, empty-state copy, and export/import coverage so malformed reflection data is preserved before new notes are accepted.
- Added hierarchy import/write validation for task/project classification, parent progression, subproject depth, task duration, and execution-role limits.
- Added Execution Plan ordering coverage for current action, candidate-age sorting, later-list fallback, and project-specific current next-action limits.
- Added a read-only Overview risk/trend/context signal panel derived from local attention, task, Ritual follow-up, hierarchy, and pending AI optimization evidence.
- Added a read-only Task-layer Overview browsing panel with Day/Week/Month modes, project grouping, and four-quadrant task lanes.
- Added persisted custom five-layer hierarchy regression coverage for Overview layer semantics, breadcrumb navigation, Task Overview browsing, and the execution bridge.
- Added stage-specific empty-state guidance for Overview hierarchy layers, Execution Plan Ritual inputs, and empty plan queues.

## 2026-05-23

- Added `docs/plans/2026-05-23-attentionos-release-candidate-requirements-ledger.md` as the active coverage ledger for the macOS release-candidate goal.
- Updated documentation indexes and project state so release-candidate work starts from the three baseline documents and explicit verification gaps rather than historical closeout claims.
- Added native/browser app-state snapshot persistence, backup/export/import helpers, and a Data & Settings route for local-first recovery controls.
- Added Tauri `Cargo.lock` compatibility for the current Rust 1.86 toolchain and verified the persistence slice with unit tests, build, lint, docs check, `cargo check`, E2E, and local browser QA screenshots.
- Added Settings controls for ritual intention/prayer, dedication/回向, meditation duration, guidance mode, and sound cue preference.
- Changed Ritual meditation to render and use the configured duration, guidance, and sound cue preference while preserving start, pause, resume, and complete controls.
- Added regression coverage for saving ritual settings into the portable app-state snapshot and rendering configured ritual settings in the Ritual flow.
- Added Ritual reflection follow-up markers for task/project input and an Execution Plan lane that surfaces marked ritual context without auto-creating work items.
- Added unit and E2E coverage for carrying marked Ritual input into Execution Plan.
- Added human-created Execution Plan task/project intake with clarification, four project classification signals, one-current/three-candidate planning roles, persisted focus-candidate selection, and audit logging.
- Added unit and E2E coverage for creating a clarified current action and entering Execution Focus from it.
- Added a required human clarification gate before AI-assisted task decomposition drafts in Execution Plan.
- Added approval-time validation for AI decomposition suggestions so empty titles and over-two-hour generated steps cannot be accepted.
- Hardened Execution Plan validation so tasks need a clarification/start note, over-two-hour estimates are rejected instead of clamped, AI-generated steps are revalidated before persistence, and projects cannot be nested deeper than one subproject layer.
- Added Ritual cadence settings with default morning/evening times, editable morning/evening times, manual-entry preference, Ritual schedule display, dedication carry-forward markers, and an Execution Plan draft bridge from marked Ritual inputs.
- Hardened the Tauri macOS shell from template identity to AttentionOS identity, removed the unused opener native permission/plugin, set a non-null CSP, and verified unsigned local `.app` and `.dmg` package generation plus packaged-app native smoke behavior.
- Added corrupt snapshot quarantine and recovery visibility for native/browser persistence, including import validation before mutation and Shell/Data & Settings recovery warnings.
- Verified packaged native persistence recovery with Computer Use: native app-data restore renders in Overview, corrupt native state is quarantined, and recovery details are visible in Data & Settings.
- Added local-first Privacy & AI settings for local-data acknowledgement, future external AI consent, and telemetry opt-in defaults, with those preferences included in portable snapshots.
- Completed a bounded release-candidate security/privacy scan for hardcoded provider keys, network primitives, telemetry senders, and Tauri permissions.
- Added first-run onboarding for workflow orientation, local-first data acknowledgement, non-medical boundary acknowledgement, and persisted consent state.
- Added local reminder consent settings for reminder enablement, frequency, quiet windows, and priority override intent without requesting native notification permission.

## 2026-05-19

- Added: project-local Matt Pocock skills under `.agents/skills/`, including `/grill-me`, with `skills-lock.json` as the lockfile.
- Added: agent skill configuration docs under `docs/agents/` for issue tracker routing, triage labels, and domain context.
- Changed: `AGENTS.md`, `CLAUDE.md`, documentation indexes, and project state now expose the project-local skill setup while keeping gstack generated artifacts ignored.

## 2026-05-13

- Changed: project state now records that the experience-alignment closeout was pushed to `origin/main` and returns the next action to `.gitignore` cleanup plus Phase 4 contract scoping.
- Changed: project state now records the local `main` fast-forward merge of the experience-alignment branch at `faee10d` and identifies push/PR/manual-testing direction as the next owner decision.
- Added: `/gstack-qa-only` final integration regression QA report at `.gstack/qa-reports/qa-report-integration-regression-2026-05-13.md`.
- Added: integration polish and regression implementation plan at `docs/plans/2026-05-13-attentionos-integration-polish-regression-slice.md`.
- Changed: Execution Plan now groups suggestion surfaces under human review lanes and avoids framing AI as the primary control center.
- Added: task-decomposition rejection support with reviewer metadata and user audit logging.
- Changed: workflow optimization review copy now clarifies that marking a suggestion reviewed does not automatically mutate the workflow.
- Added: AI HITL regression coverage for task-decomposition rejection, execution-stage workflow suggestion filtering, Plan-only review lanes, and updated E2E workflow review labels.
- Added: `/gstack-qa-only` AI HITL QA report at `.gstack/qa-reports/qa-report-ai-hitl-clarity-2026-05-13.md`.
- Added: AI HITL clarity implementation plan at `docs/plans/2026-05-13-attentionos-ai-hitl-clarity-slice.md`.
- Added: Overview read-only scan component at `apps/desktop/src/pages/overview/VisionOverviewPanel.tsx`.
- Changed: Overview now leads with current-layer scan context and renders a timeline-first Vision surface before learning metrics.
- Changed: default hierarchy seed content now reads as user-facing workflow direction rather than implementation scaffold copy.
- Added: Overview read-only scan regression coverage and updated E2E path labels for the new default hierarchy content.
- Added: `/gstack-qa-only` Overview QA report at `.gstack/qa-reports/qa-report-overview-readonly-scan-2026-05-13.md`.
- Added: Overview read-only scan implementation plan at `docs/plans/2026-05-13-attentionos-overview-readonly-scan-slice.md`.
- Added: Ritual semantic correction implementation ledger at `docs/plans/2026-05-13-attentionos-ritual-semantic-correction-slice.md`.
- Changed: Ritual now uses intention-led neutral copy with local configurable intention and dedication wording.
- Changed: Meditation now displays user-facing breath labels instead of internal status values.
- Changed: desktop shell footer copy now describes human-led attention and suggestion review instead of the deterministic core.
- Added: Ritual regression coverage for semantic copy, local wording overrides, reflection persistence, Overview transition, and shell footer wording.
- Added: `/gstack-qa-only` Ritual QA report at `.gstack/qa-reports/qa-report-ritual-semantics-2026-05-13.md`.
- Added: `executionModeMachine` with guarded Plan/Focus mode transitions and unit coverage.
- Changed: Execution routing now uses `/execution/plan` and `/execution/focus`; `/execution` redirects to Plan mode.
- Changed: Execution UI now separates Plan-mode AI suggestion review from Focus-mode single-action work.
- Fixed: active task lifecycle state now survives moving from Execution Focus back to Plan and then into Focus again.
- Changed: desktop shell keeps the sidebar on desktop and uses bottom stage navigation on mobile.
- Changed: Biome now excludes repo-local gstack tool/artifact directories from product linting.
- Added: browser and RTL coverage for Plan/Focus routing, invalid Focus redirects, AI/HITL preservation, and 390px mobile shell behavior.
- Added: `/gstack-qa-only` report and project test outcome for the implemented experience-alignment slice.
- Added: Phase 4 `/gstack-autoplan` implementation slice at `docs/plans/2026-05-13-attentionos-experience-alignment-implementation-slice.md`.
- Added: autoplan QA input at `.gstack/projects/YannJY02-AttentionOS/yann.jy-main-autoplan-test-plan-20260513-0738.md`.
- Changed: project state and documentation indexes now identify the implementation slice as the next coding contract and `/gstack-qa-only` as the post-implementation gate.
- Changed: Phase 3 `/gstack-plan-eng-review` is now complete under owner-approved normal-chat fallback, with E1-E5 recorded in the experience-alignment contract.
- Added: accepted engineering decisions for `executionModeMachine`, URL-request/machine-validated mode authority, separated task lifecycle boundary with migration path, full contract test scope, and one complete implementation slice.
- Added: gstack QA test plan artifact at `.gstack/projects/YannJY02-AttentionOS/yann.jy-main-eng-review-test-plan-20260513-0733.md`.
- Changed: project state and plan indexes now identify `/gstack-autoplan` as the next required gate before implementation.
- Changed: Phase 2 `/gstack-plan-design-review` is now complete under owner-approved normal-chat fallback, with D1-D5 recorded in the experience-alignment contract.
- Added: accepted design decisions for mobile bottom stage navigation, `/execution/plan` and `/execution/focus` subroutes, neutral default Ritual language with configurable prayer/dedication, timeline-first Vision, and stage/mode-grouped AI suggestions.
- Changed: project state and plan indexes now identify `/gstack-plan-eng-review` as the next required implementation blocker before `/gstack-autoplan`.

## 2026-05-10

- Added: Phase 2/3 experience-alignment review gate blocker at `docs/plans/2026-05-10-attentionos-experience-alignment-review-gate-blocker.md`, recording that `/gstack-plan-design-review` and `/gstack-plan-eng-review` are blocked until `AskUserQuestion` is available.
- Changed: experience-alignment blueprint, documentation indexes, and project state now mark Phase 2 and Phase 3 as blocked instead of next/complete, preventing implementation from starting on a false review pass.
- Added: `/gstack-context-save` checkpoint for the current experience-alignment handoff under `.gstack/projects/YannJY02-AttentionOS/checkpoints/`.
- Added: Phase 1 experience-alignment contract at `docs/plans/2026-05-10-attentionos-experience-alignment-contract.md`, covering Ritual, Overview, Execution Plan, Execution Focus, five-layer visual semantics, AI placement rules, and mobile/desktop expectations.
- Changed: experience-alignment blueprint and project state now mark Phase 1 complete and identify `/gstack-plan-design-review` plus `/gstack-plan-eng-review` as the next required skill gates.
- Added: Phase 0 experience-alignment evidence ledger at `docs/plans/2026-05-10-attentionos-experience-alignment-evidence-ledger.md`, recording the `/gstack-investigate` evidence freeze, root-cause hypothesis, UI capture paths, and Phase 1 gate.
- Changed: experience-alignment blueprint and project state now mark Phase 0 complete and identify `/gstack-design-consultation` as the next required skill gate.
- Added: draft experience-alignment blueprint at `docs/plans/2026-05-10-attentionos-experience-alignment-blueprint.md`, with mandatory `/gstack` skill gates for investigation, design consultation, design review, engineering review, autoplan slicing, QA-only verification, and context preservation.
- Changed: documentation entrypoints and project state now surface the experience-alignment blueprint as the next planning surface before implementation.

## 2026-05-09

- Added: draft Phase 4 protocol and extension intake at `docs/plans/2026-05-09-phase-4-intake.md`.
- Changed: project recovery state now records Phase 3 as merged and pushed to `origin/main` at `ebda370`.
- Changed: server-backed Phase 3 learning analysis now ingests audit events for the analyzed learning window.
- Added: `AuditRepository.findWindow` and regression coverage for audit-window ingestion.
- Added: workflow optimization rejection coverage for browser storage and desktop HITL controls.
- Added: Phase 3 evolutionary learning implementation ledger, deterministic behavior analysis, workflow optimization suggestion payloads, adoption tracking, observability boundary, storage/server runtime, and desktop HITL review surface.
- Added: Supabase migration `0005_phase3_learning.sql` for `workflow_optimization` AI suggestions and Phase 3 learning indexes.
- Added: Playwright coverage for the Phase 3 workflow optimization review path.
- Added: documentation governance check script `scripts/check-doc-governance.mjs`.
- Added: `pnpm docs:check`, `pnpm hooks:install`, and `pnpm verify`; updated `pnpm check` to run documentation governance before Turbo check.
- Added: prepared `.githooks/pre-commit` hook for commit-time documentation governance checks.
- Changed: installed this checkout's Git hooks path to `.githooks` for local pre-commit documentation checks.
- Added: automation guide `docs/governance/documentation-automation.md`.
- Added: `docs/work/todo.md` as the only non-authoritative developer intake queue.
- Added: accepted decision `docs/decisions/2026-05-09-developer-todo-and-doc-lifecycle.md`.
- Added: active lifecycle rule `docs/governance/development-document-lifecycle.md` for prompts, blueprints, verification notes, audits, handoffs, and archive closeout.
- Added: archive placeholders for retired working notes and governance material under `docs/archive/work/` and `docs/archive/governance/`.
- Added: repo-local `AGENTS.md` with accepted documentation governance rules for future AI sessions.
- Added: active AI-generated documentation workflow at `docs/governance/ai-generated-doc-workflow.md`.
- Changed: accepted `docs/decisions/2026-05-09-doc-governance-authority-map.md` after owner confirmation.
- Changed: archived historical Phase 1 plan to `docs/archive/plans/phase1-deterministic-core.md`.
- Changed: archived applied generated proposals under `docs/archive/governance/proposed-updates/` and kept `docs/governance/proposed-updates/` for pending proposals only.
- Changed: categorized loose top-level docs into `docs/product/`, `docs/workflow/`, `docs/sources-or-raw/`, and `docs/governance/`; `docs/README.md` is now the only top-level Markdown file under `docs/`.
- Changed: moved documentation governance surfaces under `docs/` (`docs/governance/project-state.md`, `docs/governance/changelog.md`, `docs/decisions/`, `docs/sources-or-raw/`, `docs/work/`, `docs/archive/`, and `docs/governance/`).
- Added: canonical documentation entrypoints at `README.md`, `docs/README.md`, and `docs/plans/README.md`.
- Changed: consolidated the former root `plans/phase1-deterministic-core.md` into `docs/plans/` before later archiving it under `docs/archive/plans/`.
- Changed: removed the generated desktop README after moving durable desktop documentation to `docs/apps/desktop.md`.
- Changed: replaced broken old roadmap references in `docs/workflow/WORKFLOW_CANONICAL_MODEL.zh-CN.md` with `docs/roadmap-execution/README.md`.
- Added: documentation governance entrypoints for AttentionOS (`docs/governance/project-state.md`, `docs/decisions/`, `docs/sources-or-raw/`, `docs/work/`, `docs/archive/`, and `docs/governance/`).
- Added: non-authoritative documentation audit, stale report, AGENTS governance proposal, and maintenance-trigger proposal under `docs/governance/`.
- Added: decision for the project documentation authority map.
