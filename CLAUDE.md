# AttentionOS V2

## 项目概述

个人注意力与上下文管理系统（Personal Context OS）。从 V1 (RSS 目录) 完全重新设计。

- 设计文档: `docs/plans/2026-03-21-attentionos-v2-architecture-design.md` — **开始任何开发前必读此文件**
- 文档入口: `docs/README.md` — 项目文档索引、权威映射与计划目录规则
- AI 文档治理: `AGENTS.md` + `docs/governance/ai-generated-doc-workflow.md` — 后续 AI 生成文档必须先归类、规范命名、更新索引并归档已应用产物
- V1 仓库: `/Users/yann.jy/Desktop/AI/RSS` — 仅用于参考和文件复制

## 技术栈

- 前端: React 19 + Vite + XState v5 + shadcn/ui + Tailwind CSS → Tauri 2.0 Shell
- AI: Vercel AI SDK 6 + @statelyai/agent（状态机驱动 Agent）
- 模型路由: Vercel AI SDK Gateway（Claude/GPT/Ollama 统一接口）
- 隐私: Microsoft Presidio（PII 脱敏）
- 数据库: Supabase PostgreSQL + pgvector（云端）+ PowerSync + SQLite（本地）
- 协议: MCP Server + MCP Client（@modelcontextprotocol/sdk）
- 测试: Vitest（确定性）+ Playwright（E2E）+ DeepEval（AI 质量）
- 可观测: Langfuse（开源自托管）
- 构建: pnpm workspaces + Turborepo + Biome

## 架构规则

- 七层架构: 交互层 → 意图路由 → 工作流引擎 → 工具层 → AI 推理 → 上下文记忆 → 治理
- **确定性核心 + 代理外壳**: XState 状态机控制所有合法状态转移，AI 只决定发出哪个事件
- 每个工具同时暴露为: GUI 按钮 / Agent 工具 / MCP 工具 / SDK 方法
- 数据模型: 统一 entities + edges 表，关系型 + JSONB，不用图数据库
- 向量表必须带 model_id + model_version（支持模型迁移）
- 敏感数据分级: L0 直接发送, L1 脱敏, L2 仅本地, L3 永不处理
- Prompt 存数据库，不硬编码

## 开发规范

- **复用优先**: 每个功能先查文档 (/docs)，再搜索现有实现 (/search-first)，最后才写代码
- **TDD**: 先写测试（Vitest），再实现
- **代码审查**: 功能完成后触发 code-reviewer agent
- **文件上限**: 400 行常规，800 行绝对上限，超过必须拆分
- **不可变数据**: 返回新对象，不修改原对象
- **测试覆盖**: 状态机逻辑 100%，业务逻辑 ≥80%

## 分阶段路线

- Phase 1: 确定性核心（XState + React + Supabase，无 AI）
- Phase 2: AI 推理层（Vercel AI SDK 6 + @statelyai/agent + RAG）
- Phase 3: 进化式学习（行为分析 + 工作流优化建议）
- Phase 4: 协议与扩展（MCP + SDK + 插件 + PowerSync 离线）

## ECC 开发工作流

每个功能的开发循环:
1. `/brainstorming` → 理解需求
2. `/everything-claude-code:plan` → 分步计划
3. `/everything-claude-code:docs` → 查最新文档 (Context7)
4. `/everything-claude-code:search-first` → 搜索现有实现
5. `/everything-claude-code:tdd` → 先写测试
6. 编码实现
7. `code-reviewer` agent → 代码审查
8. `/simplify` → 简化
9. `/commit` → 提交

## Agent skills

Project-local Matt Pocock skills are installed under `.agents/skills/`; project-local gstack skills are installed under `.agents/skills/gstack*`.

### Issue tracker

Use GitHub Issues for tracked implementation work on `YannJY02/AttentionOS`. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default Matt Pocock triage label vocabulary unless the owner creates repo-specific GitHub labels later. See `docs/agents/triage-labels.md`.

### Domain docs

AttentionOS uses the governed `docs/` authority map instead of a root `CONTEXT.md`. Skills that ask for domain context should start from `docs/README.md`, then follow product, workflow, decision, and plan authority from there. See `docs/agents/domain.md`.

## 从 V1 移植的资产

已复制到 V2 的:
- `packages/attention-engine/` — 153 行纯函数，注意力状态评估算法
- `packages/policy-engine/` — 322 行纯函数，JITAI 策略引擎
- `docs/` — 文档唯一主入口，包含产品规划、工作流模型、用户需求、计划与应用说明

## 关键参考项目

- [Screenpipe](https://github.com/mediar-ai/screenpipe) — Tauri + 本地 AI + MCP 的生产级范例
- [@statelyai/agent](https://github.com/statelyai/agent) — XState + Vercel AI SDK 官方集成
- [Vercel AI SDK 6](https://ai-sdk.dev/) — 多模型路由 + MCP + HITL
- [PowerSync](https://docs.powersync.com/) — PostgreSQL + SQLite 离线同步

## 常用命令

```bash
pnpm dev          # 启动开发
pnpm test         # 运行测试
pnpm build        # 构建
pnpm check        # 类型检查
pnpm lint         # 代码检查
```
