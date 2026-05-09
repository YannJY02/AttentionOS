# Phase 3 Evolutionary Learning Ledger

Status: verified implementation ledger

This ledger tracks the first Phase 3 surface for evolutionary learning. Phase 3
keeps the deterministic core as authority: behavior analysis may create AI
suggestions, but workflow changes remain human-reviewed.

## Phase 3 Scope

- Behavior pattern analysis from attention observations, task completion, audit
  events, and AI suggestion review history.
- Workflow optimization suggestions as pending HITL suggestions.
- Suggestion adoption tracking through approved, applied, rejected, and pending
  statuses.
- Observability boundary for latency, token usage, metadata, and quality scores.
- Read-only Overview learning snapshot and Execution-stage review controls.

## Ledger

| Item | Status | Evidence | Remaining work |
|---|---|---|---|
| Behavior pattern analysis | Done | `packages/ai/src/evolution.ts`, `packages/ai/src/evolution.test.ts` | Replace demo observation seeds with real observation capture. |
| Workflow optimization suggestion payload | Done | `packages/core/src/learning-types.ts`, `packages/core/src/ai-types.ts` | Add more action types only after workflow semantics are accepted. |
| Adoption tracking | Done | `measureSuggestionAdoption` in `packages/ai/src/evolution.ts` | Add longer-window trend views later. |
| Observability boundary | Done | `packages/ai/src/observability.ts`, `packages/ai/src/observability.test.ts` | Wire a real Langfuse sink when credentials and deployment choice are configured. |
| Storage support | Done | `packages/storage/src/repositories/attention-observation.ts`, `AuditRepository.findWindow`, `SuggestionRepository.findRecent` | Add write repository for attention observations when sensors exist. |
| Database migration | Done | `supabase/migrations/0005_phase3_learning.sql` | Apply against a real Supabase project during deployment. |
| Server runtime | Done | `apps/server/src/learning-runtime.ts`, `apps/server/src/http.ts` | Add auth/rate limiting before non-loopback exposure. |
| Desktop read-only snapshot | Done | `apps/desktop/src/pages/overview/LearningSnapshotPanel.tsx` | Replace demo attention observations with real local signals. |
| Desktop HITL review | Done | `apps/desktop/src/pages/execution/EvolutionSuggestionsPanel.tsx`, `apps/desktop/src/pages/ExecutionPage.test.tsx` | Add reject-focused UX details after user testing. |
| E2E coverage | Done | `e2e/evolution-learning.spec.ts` | Keep alongside smoke flow as the UI grows. |

## Runtime Boundaries

- Phase 3 suggestions use `kind = workflow_optimization` and stay `pending`
  until the user approves or rejects them.
- The renderer uses localStorage for the desktop demo path; Supabase persistence
  remains behind the loopback server sidecar.
- No provider secrets are required or hardcoded.
- The observability boundary is adapter-based; it can buffer locally or later
  flush to Langfuse without changing business logic.
- L2/L3 privacy routing from Phase 2 remains authoritative for provider-backed
  AI calls. This first Phase 3 slice does not call external models.

## Verification Targets

```bash
pnpm --filter @attentionos/ai test
pnpm --filter @attentionos/storage test
pnpm --filter @attentionos/server test
pnpm --filter @attentionos/desktop test
pnpm docs:check
pnpm check
pnpm test:run
pnpm lint
pnpm build
pnpm e2e
```

## Closeout Verification

Verified on 2026-05-09 19:30 CST after the merge-readiness patch:

- `pnpm check` passed, including `pnpm docs:check` and Turbo checks for 11
  packages.
- `pnpm test:run` passed with 42 test files and 190 tests.
- `pnpm lint` passed with Biome checking 172 files.
- `pnpm build` passed with 11 Turbo build tasks.
- `pnpm e2e` passed with 2 Chromium tests.

Closeout patch evidence:

- Server learning runtime now reads audit events for the analyzed learning
  window and passes them into `analyzeBehaviorPatterns`.
- `AuditRepository.findWindow` supports the server-backed learning path.
- Regression tests now assert audit completion transitions are counted and that
  workflow optimization suggestions can be rejected through storage and desktop
  HITL controls.
