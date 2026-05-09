# Phase 2 AI Reasoning Contract

This note records the first implementation slice for the Phase 2 AI reasoning layer.
It follows the architecture rule that XState remains the deterministic authority and
AI only proposes tool calls, context links, task decompositions, and workflow events.

## Implemented Surface

- `packages/core/src/ai-types.ts`
  - Shared Phase 2 types for privacy levels, model routing, prompt templates,
    embeddings, RAG results, AI suggestions, and agent tool calls.
- `packages/ai/src/`
  - `router.ts`: fail-closed model routing by capability and privacy level.
  - `privacy.ts`: deterministic privacy classification/redaction boundary.
  - `rag.ts`: embedding client/vector store interfaces plus an in-memory test store.
  - `prompts.ts`: runtime prompt template rendering with explicit variables.
  - `output.ts`: structured task decomposition output validation.
  - `model-registry.ts`: environment-driven model registry loading.
  - `gateway.ts`: Vercel AI Gateway model factory boundary.
  - `tools.ts`: Zod schemas for `task.decompose`, `context.search`, and
    `suggestion.approve`.
  - `agent.ts`: task decomposition orchestration that produces pending HITL
    suggestions.
  - `vercel.ts`: thin Vercel AI SDK adapter for embeddings and text generation.
  - `stately-adapter.ts`: explicit boundary for `@statelyai/agent` while its peer
    dependencies remain behind AI SDK 6.
- `packages/storage/src/repositories/`
  - `embedding.ts`, `prompt.ts`, and `suggestion.ts`.
- `apps/server/src/`
  - `ai-suggestions.ts`: sidecar-only deterministic application of AI suggestions.
  - `http.ts`: narrow loopback HTTP boundary for task decomposition suggestions.
  - `prompt-runtime.ts`: active prompt template loading from storage.
  - `rag-runtime.ts`: storage-backed embedding ingestion and pgvector retrieval.
- `packages/machines/src/agent-bridge.ts`
  - Allows AI to request only legal daily-flow transitions.
- `supabase/migrations/0004_create_ai_reasoning_tables.sql`
  - Adds `prompt_templates`, `embeddings`, `ai_suggestions`, `agent_tool_calls`,
    pgvector setup, and `match_embeddings`.

## Runtime Boundaries

- L3 data is never sent to any model.
- L2 data is local-only and cannot route to external models.
- L1 data is redacted before external model calls.
- AI suggestions default to `pending` and `approvalRequired: true`.
- Desktop keeps a local deterministic fallback for slug-id demo data.
- Supabase-backed Phase 2 writes must go through the loopback server sidecar; the
  renderer must not import `@attentionos/storage` or access service-role credentials.
- Storage-backed suggestion application rejects slug ids before touching Supabase
  repositories because the database schema uses UUID primary/foreign keys.
- Task decomposition quality has a deterministic offline eval gate; DeepEval can
  be added later when external service credentials are configured.

## Environment

No real provider secret is hardcoded. Runtime callers should provide model/provider
configuration through environment variables or deployment configuration.

For Vercel AI SDK Gateway usage, configure provider credentials outside source
control and pass Gateway-compatible model ids through the model router.

## Verification

Focused package tests:

```bash
pnpm --filter @attentionos/ai test
pnpm --filter @attentionos/core test
pnpm --filter @attentionos/storage test
pnpm --filter @attentionos/machines test
```

Workspace verification:

```bash
pnpm test:run
pnpm check
pnpm lint
pnpm build
```
