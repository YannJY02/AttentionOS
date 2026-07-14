# Plans

`docs/plans/` is the single plans directory for AttentionOS.

## Current Files

| File | Status | Role |
|---|---|---|
| `2026-05-23-attentionos-release-candidate-requirements-ledger.md` | Active coverage ledger | Maps the product baseline, workflow baseline, and original user-source requirements to release-candidate implementation and verification status. |
| `2026-05-24-attentionos-release-readiness-report.md` | Release-candidate readiness report | Summarizes the final local macOS RC evidence, verification commands, owner deferral, Developer ID external blocker, and residual risks. |
| `2026-05-24-attentionos-release-candidate-owner-decision-packet.md` | Owner reply recorded | Records D1=A, D2=C, D3=A, and D4=B, then narrows the remaining integration-reminder, native GUI/VoiceOver, and Developer ID validation boundaries. |
| `2026-05-13-attentionos-integration-polish-regression-slice.md` | Implemented / QA-verified | Converts Slice 6 of the experience-alignment blueprint into the completed final integration polish and regression pass after prior slices. |
| `2026-05-13-attentionos-ai-hitl-clarity-slice.md` | Implemented / QA-verified | Converts Slice 5 of the experience-alignment blueprint into the completed AI suggestion placement and HITL clarity slice: Plan-only helper lanes, explicit review status, task-decomposition rejection, and no Phase 4 expansion. |
| `2026-05-13-attentionos-overview-readonly-scan-slice.md` | Implemented / QA-verified | Converts Slice 3 of the experience-alignment blueprint into the completed Overview read-only scan redesign: layer-first context, timeline-first Vision, preserved read-only boundaries, and task-layer Execution bridge. |
| `2026-05-13-attentionos-ritual-semantic-correction-slice.md` | Implemented / QA-verified | Converts Slice 2 of the experience-alignment blueprint into the completed Ritual semantic correction: intention-led copy, local wording overrides, breath labels, and shell copy cleanup. |
| `2026-05-13-attentionos-experience-alignment-implementation-slice.md` | Implemented / QA-verified | Converts accepted D1-D5 and E1-E5 decisions into the completed Execution Plan/Focus and mobile shell implementation slice. |
| `2026-05-10-attentionos-experience-alignment-blueprint.md` | Draft blueprint | Plans the multi-phase experience-alignment workflow and requires exact `/gstack` skill gates for each phase. |
| `2026-05-10-attentionos-experience-alignment-evidence-ledger.md` | Phase 0 evidence ledger | Records the `/gstack-investigate` evidence freeze and root-cause map for experience alignment. |
| `2026-05-10-attentionos-experience-alignment-contract.md` | Phase 1 contract + Phase 2/3 reviews | Translates the product/workflow baselines into stage-specific requirements and records accepted design decisions D1-D5 plus engineering decisions E1-E5. |
| `2026-05-10-attentionos-experience-alignment-review-gate-blocker.md` | Historical blocker | Records the original missing `AskUserQuestion` blocker and the owner-approved chat fallback used to complete Phase 2 and Phase 3 reviews. |
| `2026-05-09-phase-4-intake.md` | Draft intake | Frames the next protocol and extension phase before an implementation contract is accepted. |
| `2026-05-09-phase-3-evolutionary-learning-ledger.md` | Verified | Tracks the completed Phase 3 behavior learning, workflow optimization, adoption, observability, and desktop HITL surface. |
| `2026-05-09-phase-2-completion-ledger.md` | Verified | Tracks the completed Phase 2 AI reasoning closeout surface. |
| `2026-05-09-phase-2-ai-reasoning-contract.md` | Current reference | Records the implemented Phase 2 AI reasoning contract and runtime boundaries. |
| `2026-03-21-attentionos-v2-architecture-design.md` | Draft / 待审批 | Architecture design reference. Use carefully where it conflicts with current baselines. |

## Archived Plans

| File | Status | Role |
|---|---|---|
| `../archive/plans/phase1-deterministic-core.md` | Historical / archived | Phase 1 deterministic-core build blueprint, retained for recovery and provenance. |

## Rules

- New plans go here, not in root-level `plans/`.
- Phase ledgers should identify whether they are current, draft, or historical.
- Archive superseded or historical plans under `docs/archive/plans/` after explicit owner confirmation.
