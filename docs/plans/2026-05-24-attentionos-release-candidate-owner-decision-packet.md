---
status: Owner reply recorded
date: 2026-05-24
scope: release-candidate-readiness
owner: YannJY02
---

# AttentionOS Release Candidate Owner Decision Packet

This packet is subordinate to
`docs/plans/2026-05-23-attentionos-release-candidate-requirements-ledger.md`.
It does not accept, reject, or defer any requirement by itself. It exists to
make the remaining owner-controlled release-candidate decisions explicit enough
to unblock the next engineering or release-validation slice.

## Owner Reply Recorded

The owner replied in-session on 2026-05-24:

```text
D1=A, D2=C, D3=A, D4=B
```

Engineering interpretation:

- D1=A: fullscreen/scheduled Ritual launch is explicitly deferred for this
  release candidate.
- D2=C: native reminder work is expanded to broader integration reminders; this
  keeps RC-042 open until a narrowed, product-bound integration-reminder slice
  is implemented and verified.
- D3=A: Computer Use may be used for native GUI, VoiceOver/manual accessibility,
  and manual/native usability evidence after the macOS GUI session is unlocked
  or otherwise exposed.
- D4=B: the Developer ID distribution path is selected. This authorizes local
  prerequisite inspection and signing/notarization validation only within
  owner-provided credentials; it does not authorize upload, submission, public
  release, paid services, or persistent credential creation.

## Current Evidence Boundary

The release-candidate ledger is mostly terminal, but the goal cannot be marked
complete while these rows remain non-terminal:

| Row | Current status | Why owner input is required |
|---|---|---|
| RC-020 | 经 owner 明确同意延期 | D1=A defers fullscreen/scheduled Ritual launch for this release candidate. |
| RC-042 | 已实现并验证 | D2=C is implemented as a local integration-reminder handoff contract with explicit calendar-file, Focus handoff, and app auto-open targets, local permission/audit state, and a 1-6/day cap. |
| RC-051 | 已实现并验证 | D3=A allowed Computer Use to inspect the packaged native app; native AX semantics are now recorded alongside existing keyboard, contrast, and reduced-motion checks. |
| RC-056 | 受外部依赖阻塞 | D4=B selects Developer ID, but distribution signing, signed entitlements, notarization, and legal/privacy confirmation still require owner-provided credentials and explicit release authorization. |
| RC-058 | 已实现并验证 | D3=A allowed Computer Use to run the packaged native onboarding -> Ritual -> Overview -> Execution Plan -> Focus -> completion workflow. |
| RC-059 | 已实现并验证 | D3=A allowed Computer Use to observe the primary native daily workflow; automated browser and native performance checks already cover timing/recovery budgets. |
| RC-060 | Open | The final readiness report should only be produced after the preceding rows are terminal. |

## Decision 1: Ritual Fullscreen / Scheduled Launch

Affected rows: RC-020, RC-057, RC-059, RC-060.

Choose one:

| Choice | Meaning | Engineering effect | Release effect |
|---|---|---|---|
| A. Defer for RC | The release candidate keeps the verified manual Ritual start. Fullscreen/scheduled launch remains a post-RC feature. | No new native behavior. Ledger row RC-020 can move only after owner explicitly approves this deferral. | Lowest implementation risk. The final report must list this as owner-deferred. |
| B. Implement in-app fullscreen Ritual | Add an explicit user-controlled in-app fullscreen or focus-window entry for Ritual, without background scheduling. | Requires Tauri window behavior changes, settings/copy, tests, browser QA, and packaged native QA. | Moderate risk; still needs native GUI verification. |
| C. Implement scheduled Ritual launch | Add OS-level launch/reminder behavior around the morning/evening cadence. | Requires macOS launch/notification design, permissions, failure states, tests, and native QA. | Highest scope and App Store/privacy review risk. |

Recommended if the owner wants the shortest conservative RC path: Choice A.
Recommended if the owner treats fullscreen Ritual as non-negotiable for the
first public candidate: Choice B.

## Decision 2: Native Notification Scheduling

Affected rows: RC-042, RC-046, RC-052, RC-056, RC-059, RC-060.

Choose one:

| Choice | Meaning | Engineering effect | Release effect |
|---|---|---|---|
| A. Defer OS notifications for RC | Settings keeps reminder consent/frequency/quiet-window intent, but no native notification delivery ships in the RC. | No new native permission surface. Ledger row RC-042 can move only after owner explicitly approves this deferral. | Lowest privacy/App Store risk. The final report must list this as owner-deferred. |
| B. Implement local-only native notifications | Ship native macOS notification permission, scheduled local reminders, quiet hours, and priority override behavior. | Requires Tauri notification capability, permission UX, scheduling storage, error states, tests, and native QA. | Medium risk; requires owner approval of permission copy and App Store privacy questionnaire impact. |
| C. Implement broader integration reminders | Add external calendar/focus/app integration around reminders. | Requires new integration scope and likely Phase 4 decisions. | Out of scope for this RC unless owner explicitly expands scope. |

Recommended if the owner wants the shortest conservative RC path: Choice A.
Recommended only if reminder delivery is release-critical: Choice B.

## Decision 3: Native GUI And Accessibility Verification Window

Affected rows: RC-051, RC-058, RC-059, RC-060.

Current blocker: recent Computer Use attempts against `AttentionOS` returned
`cgWindowNotFound`, while prior notes record the macOS session as locked or
otherwise unavailable to GUI automation.

Choose one:

| Choice | Meaning | Required owner action | Verification after unblock |
|---|---|---|---|
| A. Provide unlocked GUI session now | The owner unlocks the local macOS session and keeps AttentionOS available for automation. | Unlock the machine/session and confirm Computer Use may inspect the app window. | Run packaged native cross-flow QA, VoiceOver/manual accessibility checklist, GUI-observed navigation timing, and update RC-051/058/059. |
| B. Defer native GUI/VoiceOver evidence | Owner explicitly accepts that final native GUI and VoiceOver evidence will remain a deferred release item. | Confirm the deferral in writing. | Ledger rows can move only as owner-deferred; final report must carry residual risk. |
| C. Use external human QA instead | Owner manually runs the packaged app and provides screenshots/notes. | Provide screenshots, VoiceOver findings, timing notes, and any issues. | Agent records evidence, but cannot independently verify GUI state. |

Recommended for a true polished RC: Choice A.

## Decision 4: Apple Distribution Credentials And Release Boundary

Affected rows: RC-056, RC-057, RC-060.

Current local evidence:

- Unsigned `.app` and `.dmg` builds pass.
- `pnpm release:check:macos` passes 27 local checks with 0 failures.
- Four blockers remain external: distribution signing identity, strict bundle
  code signature verification, signed App Sandbox entitlements, and
  notarization/App Store upload.

Choose one:

| Choice | Meaning | Required owner action | Verification after unblock |
|---|---|---|---|
| A. Keep as local unsigned RC | No signing/notarization/upload is attempted in this thread. | Confirm that local unsigned package evidence is sufficient for now. | Final report lists Apple distribution as external-blocked or owner-deferred. |
| B. Provide Developer ID path | Owner provides Developer ID certificate/profile and notarization credentials. | Provide credentials through an approved secure channel and authorize signing/notarization. | Run signed build, entitlement inspection, `codesign --verify`, notarization, and updated package audit. |
| C. Provide App Store path | Owner provides Apple Distribution/App Store Connect setup and authorizes packaging/upload checks. | Provide account/team/profile/App Store Connect details and explicit upload boundary. | Run App Store-targeted package checks and stop before any upload unless explicitly authorized. |

Recommended before public distribution: Choice B or C, depending on the chosen
distribution channel.

## Minimal Reply Format

The owner can unblock the next stage by replying with one line:

```text
RC decisions: D1=<A|B|C>, D2=<A|B|C>, D3=<A|B|C>, D4=<A|B|C>
```

Examples:

- Conservative local RC: `D1=A, D2=A, D3=A, D4=A`
- Native behavior implementation path: `D1=B, D2=B, D3=A, D4=A`
- Distribution validation path: `D1=A, D2=A, D3=A, D4=B`

## Next Actions After Owner Reply

- Update RC-020 as owner-deferred for this release candidate.
- RC-042, RC-051, RC-058, and RC-059 now have post-reply implementation or
  native QA evidence in the release-candidate ledger.
- Inspect the Developer ID signing/notarization prerequisites and rerun package
  audit. Stop before upload, submission, public release, paid services, or
  credential creation unless separately authorized.
- Run final release verification, then produce the release-readiness report once
  RC-057 is terminal and RC-056 is accurately listed as an external blocker.
