# Phase 2 Completion Ledger

This ledger tracks the remaining Phase 2 AI reasoning surface. Phase 2 is complete
only when each item below is done or explicitly moved out of scope with a reason.

## Phase 2 Scope

- Vercel AI SDK 6 integration and model router.
- `@statelyai/agent` boundary for XState-driven agent behavior.
- Privacy gateway for L0/L1/L2/L3 routing and redaction.
- RAG through versioned embeddings and pgvector retrieval.
- Agent tools for task decomposition, context search, and suggestion approval.
- HITL AI suggestions with deterministic approval and audit.

## Ledger

| Item | Status | Evidence | Remaining work |
| --- | --- | --- | --- |
| AI type contracts | Done | `packages/core/src/ai-types.ts` | Keep in sync as runtime surfaces expand. |
| Model router | Done | `packages/ai/src/router.ts` | Add environment-driven registry before real Gateway use. |
| Privacy gateway | Partial | `packages/ai/src/privacy.ts` | Presidio-compatible adapter and stronger L2/L3 classification policy. |
| RAG interfaces and retrieval runtime | Done | `packages/ai/src/rag.ts`, `apps/server/src/rag-runtime.ts` | Connect RAG runtime to provider-backed task decomposition. |
| pgvector schema/repository | Done | `supabase/migrations/0004_create_ai_reasoning_tables.sql`, `packages/storage/src/repositories/embedding.ts` | Add ingestion and model-version migration workflow. |
| Prompt template schema/repository | Done | `packages/storage/src/repositories/prompt.ts` | Runtime prompt injection into AI adapters. |
| Prompt runtime | Done | `packages/ai/src/prompts.ts`, `apps/server/src/prompt-runtime.ts` | Wire loaded templates into real provider construction. |
| AI task decomposition agent | Done | `packages/ai/src/agent.ts` | Persist storage-backed suggestions for UUID entities. |
| HITL local UI approval | Done | `apps/desktop/src/pages/execution/AiDecompositionPanel.tsx` | Optional sidecar-backed path for real UUID data. |
| Server sidecar suggestion boundary | Done | `apps/server/src/ai-suggestions.ts`, `apps/server/src/http.ts` | Connect desktop to sidecar when real UUID data is active. |
| `@statelyai/agent` integration | Partial | `packages/ai/src/stately-adapter.ts` | Keep behind adapter until peer dependency mismatch is resolved. |
| Vercel AI SDK Gateway runtime | Partial | `packages/ai/src/vercel.ts` | Add env model registry and structured output validation. |
| AI quality eval | Missing | Architecture plan only | Add deterministic offline eval before requiring DeepEval credentials. |
| Observability | Out of Phase 2 | Architecture lists Langfuse under Phase 3 | Do not block Phase 2 on Langfuse. |

## Current Recommended Order

1. Add environment-driven model registry and structured output validation.
2. Wire loaded prompt templates and storage-backed RAG into provider construction.
3. Add a small offline eval harness for task decomposition quality.
4. Final security review and Phase 2 closeout verification.
