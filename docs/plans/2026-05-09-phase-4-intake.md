# Phase 4 Protocol and Extension Intake

Status: draft intake
Updated: 2026-05-09 19:45 CST

This intake frames the next engineering phase after the merged Phase 3 work. It
is not an accepted implementation contract yet. Its purpose is to prevent Phase
4 from expanding into MCP, SDK, plugins, and offline sync all at once.

## Evidence

- `docs/plans/2026-03-21-attentionos-v2-architecture-design.md` lists Phase 4
  deliverables as MCP Server, MCP Client, TypeScript SDK, plugin infrastructure,
  and PowerSync offline sync. That architecture document remains draft /
  `待审批`.
- `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md` uses a longer product-roadmap
  phase model where protocolization and ecosystem work are 2027-2028 themes.
  Do not confuse that macro product phase model with the engineering Phase 4
  framing in this intake.

## Recommended First Slice

Start Phase 4 with a small read-only protocol surface:

- Read-only MCP Server for local AttentionOS state.
- TypeScript SDK read API that mirrors the same stable contracts.
- Loopback-first security boundary with explicit authentication before any
  non-local exposure.
- Contract tests for the protocol layer before implementation.

Candidate read-only capabilities:

- Read current workflow stage and active task context.
- Read entities by hierarchy layer.
- Read pending AI suggestions and their review status.
- Read learning or audit summaries without exposing raw private logs by default.

## Defer

These should not be part of the first Phase 4 implementation slice unless the
owner explicitly changes scope:

- Write-capable MCP tools.
- MCP Client tools that operate external apps.
- Plugin marketplace or third-party plugin loading.
- PowerSync offline conflict resolution.
- Public network exposure.
- Broad migration of the desktop app around protocol abstractions.

## Open Decisions

1. Is the first Phase 4 deliverable MCP Server first, SDK first, or a shared
   contract package that both use?
2. Which local auth mechanism should protect loopback protocol calls?
3. Which read models are stable enough to expose without committing to internal
   storage details?
4. Should PowerSync stay deferred until after protocol read APIs are stable?
5. What is the minimum security review required before write-capable tools are
   allowed?

## Acceptance Criteria For The Next Contract

- Phase 4 contract document exists under `docs/plans/`.
- First slice is explicitly limited to read-only or explicitly explains why it
  needs writes.
- MCP and SDK boundaries share the same typed contract.
- Security boundary is documented before code.
- Verification plan includes `pnpm docs:check`, `pnpm check`, `pnpm test:run`,
  `pnpm lint`, `pnpm build`, and protocol-specific tests.

## Next Action

Draft a Phase 4 implementation contract from this intake. Do not start broad
MCP, SDK, plugin, or offline-sync implementation until that contract is accepted
or the owner explicitly narrows the first slice.
