# AttentionOS V2 架构设计文档

版本：`v1.0-draft`
日期：`2026-03-21`
状态：`待审批`

## 0. 文档目的

本文件是 AttentionOS V2 的完整架构设计，包含三部分：

1. **系统架构设计** — 七层架构、技术选型、数据模型、分阶段路线
2. **AI 辅助开发工作流** — 如何用 Everything Claude Code (ECC) 的 skills/agents/commands 高效开发
3. **V1 → V2 迁移策略** — 哪些保留、哪些丢弃、如何移植

---

## 1. 产品定位（继承自 V1）

### 1.1 一句话定义

AttentionOS 是一个以个人工作流为核心、以注意力治理为目标、以本地个人上下文为底座的 Personal Context OS。

### 1.2 核心原则（不可妥协）

| 原则 | 含义 |
|------|------|
| Workflow-first | UI 和功能围绕工作流阶段组织，不是功能拼盘 |
| Attention-first | 所有新功能必须证明降低切换成本或提升专注稳定性 |
| Human-led Agentic | AI 建议和执行，人审批和决策，渐进信任 |
| Protocol-ready | MCP/A2A 开放协议，避免平台锁定 |
| Context-as-Asset | 个人上下文是核心资产，数据可迁移、可审计 |
| Reuse-first | 优先使用成熟开源方案，避免从零生成 |

### 1.3 后 AI 时代设计准则

| 准则 | 在 AttentionOS 中的体现 |
|------|------------------------|
| 意图化 | 用户表达目标（"帮我规划这周"），不需要理解模块入口 |
| 上下文化 | 系统基于五层目标体系 + 历史行为 + 当前状态理解请求 |
| 代理化 | AI 可代执行任务拆解、进度汇报、工作流调整 |
| 异步化 | 下达目标后后台执行，遇高风险节点再通知确认 |
| 可审计化 | 每个 AI 建议和执行都有来源、依据、用户决定记录 |
| 可组合化 | MCP server/client 双向集成，可连接外部工具和 agent |
| 个体化 | 进化式学习，软件逐渐长成"你的软件" |
| 稳定优先 | 工作流交互保持稳定，AI 在后台观察并周期性进化建议 |

---

## 2. 七层系统架构

```
┌─────────────────────────────────────────────────────────────┐
│  [L1] 交互层 — 自适应工作流界面                               │
│  React 19 + Vite + XState v5 + shadcn/ui + Tailwind CSS     │
│  Tauri 2.0 Shell（macOS 菜单栏、通知、文件系统）               │
│  工作流状态机驱动 UI 场景切换（ritual → overview → execution） │
│  用户可手动切换，AI 可建议切换                                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│  [L2] 意图路由层 — 确定性路由 + AI 增强                       │
│  Phase 1: 规则路由（工作流阶段 → 可用动作映射）               │
│  Phase 2: 单 Agent 路由（自然语言意图理解 + 工具选择）         │
│  原则: 确定性流程走状态机，模糊意图走 Agent                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│  [L3] 工作流引擎 — THE CORE（Deterministic Core）            │
│  @statelyai/agent + XState v5                                │
│  ├── 日常流程: ritual → overview → execution                 │
│  ├── 任务生命周期: plan → execute → review → done            │
│  ├── 五层导航: vision ↔ area ↔ goal ↔ project ↔ task        │
│  ├── 持久化: getPersistedSnapshot() 支持中断恢复             │
│  └── AI 节点: LLM 决定发出哪个事件，状态机验证合法性          │
│  每个状态限定可用工具集（Agentic Shell 模式）                  │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│  [L4] 工具与动作层 — Agent-callable Actions                  │
│  每个能力同时暴露为: GUI 按钮 / Agent 工具 / MCP 工具 / SDK  │
│  ├── attention.observe / attention.probe / attention.check   │
│  ├── task.create / task.decompose / task.complete / task.list│
│  ├── ritual.start / ritual.reflect / ritual.summarize        │
│  ├── context.search / context.summarize / context.relate     │
│  ├── workflow.suggest / workflow.adjust / workflow.status     │
│  ├── hierarchy.navigate / hierarchy.focus                    │
│  └── analytics.patterns / analytics.report                   │
│  工具定义用 JSON Schema（模型无关）                            │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│  [L5] AI 推理层 — Model Router + Privacy Gateway             │
│                                                              │
│  ┌─────────────┐    ┌──────────────────┐                    │
│  │ 隐私网关     │    │  Model Router    │                    │
│  │ Presidio PII│───→│  Vercel AI SDK 6 │                    │
│  │ 分级脱敏     │    │  ┌────────────┐  │                    │
│  └─────────────┘    │  │ Claude API │  │                    │
│                      │  │ GPT API    │  │                    │
│  分级策略:           │  │ Ollama本地  │  │                    │
│  L0 安全→直接发送    │  │ Gemini     │  │                    │
│  L1 脱敏→假名化      │  └────────────┘  │                    │
│  L2 敏感→仅本地      │  路由策略:        │                    │
│  L3 禁止→排除        │  简单→本地/便宜   │                    │
│                      │  复杂→云端/强模型  │                    │
│  @statelyai/agent    │  用户可覆盖       │                    │
│  整合 XState +       └──────────────────┘                    │
│  Vercel AI SDK +                                             │
│  强化学习式反馈                                               │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│  [L6] 上下文与记忆层 — 长期个人资产                            │
│                                                              │
│  ┌──────────────────┐    ┌──────────────────┐               │
│  │ Supabase         │    │ 本地 SQLite      │               │
│  │ PostgreSQL       │◄──►│ (PowerSync 同步) │               │
│  │ + pgvector       │    │ 离线可用         │               │
│  └──────────────────┘    └──────────────────┘               │
│                                                              │
│  统一数据模型:                                                │
│  ├── entities 表: 所有个人数据的统一实体                      │
│  │   (task, note, meeting, habit, reflection, contact)       │
│  ├── edges 表: 实体间关系（图层）                             │
│  ├── embeddings 表: 向量索引（带模型版本标记）                │
│  ├── ai_suggestions 表: AI 建议 + 用户决定 + 上下文          │
│  └── audit_log 表: 操作日志                                  │
│                                                              │
│  检索能力:                                                   │
│  ├── 全文搜索: PostgreSQL tsvector / FTS                     │
│  ├── 语义搜索: pgvector 余弦相似度                           │
│  └── 图查询: 递归 CTE（个人规模无需图数据库）                 │
│                                                              │
│  嵌入模型: Qwen3-Embedding-8B（本地）或                      │
│           text-embedding-3-small（云端），带版本管理           │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│  [L7] 治理层 — 轻量级（个人软件适配）                         │
│  ├── 操作日志: 谁/什么时候/做了什么/基于什么                  │
│  ├── AI 建议追踪: 建议内容 + 用户决定 + 采纳率               │
│  ├── HITL 审批点: AI 执行高影响动作前需确认                   │
│  ├── 可回滚: 关键操作的 undo（基于事件溯源）                  │
│  ├── Prompt 版本管理: 存数据库，可 A/B 测试                  │
│  └── 可观测: Langfuse（开源自托管）追踪 + 评估               │
└─────────────────────────────────────────────────────────────┘
```

### 2.1 协议层（横切关注点）

```
┌─────────────────────────────────────────────────────────────┐
│  MCP Server（被外部 AI 调用）                                │
│  暴露 AttentionOS 能力为 MCP 工具                            │
│  Claude Code / Cursor / ChatGPT 等可直接操作 AttentionOS     │
├─────────────────────────────────────────────────────────────┤
│  MCP Client（调用外部工具）                                  │
│  AttentionOS Agent 可操作日历、邮件、浏览器、GitHub 等       │
├─────────────────────────────────────────────────────────────┤
│  TypeScript SDK（编程接入）                                  │
│  @attentionos/sdk — 所有工具的类型安全封装                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. 技术栈选型

### 3.1 最终技术栈

| 层级 | 技术 | 版本 | 选择理由 |
|------|------|------|----------|
| 桌面壳 | Tauri 2.0 | 2.10+ | 5MB 体积, 原生 macOS 菜单栏, Rust 安全 |
| 前端框架 | React 19 | 19.x | AI 辅助开发训练数据最丰富 |
| 构建工具 | Vite | 6.x | HMR 即时, 比 Next.js 更适合桌面应用 |
| 状态机 | XState v5 + @statelyai/agent | 5.x / 1.x | 工作流引擎核心, 官方 AI agent 集成 |
| UI 组件 | shadcn/ui + Radix + Tailwind CSS | — | 复制即用, 高度可定制 |
| AI SDK | Vercel AI SDK 6 | 6.x | 统一 20+ 提供商, 原生 MCP 支持, HITL |
| 后端运行时 | Node.js (Tauri sidecar) | 22 LTS | TypeScript 全栈 |
| 数据库 | Supabase (PostgreSQL + pgvector) | — | 托管, RLS, Realtime, 向量搜索 |
| 离线同步 | PowerSync + SQLite | — | 生产级离线能力 |
| 隐私网关 | Microsoft Presidio | — | 开源 PII 检测与脱敏 |
| 本地模型 | Ollama | — | HTTP API, 零集成成本 |
| 嵌入模型 | text-embedding-3-small 或 Qwen3-Embedding | — | 带版本管理的蓝绿部署 |
| MCP | @modelcontextprotocol/sdk | — | 官方 SDK (Linux Foundation 标准) |
| 测试 | Vitest + Playwright + DeepEval | — | 确定性 + E2E + AI 质量 |
| 可观测 | Langfuse | — | 开源可自托管, Vercel AI SDK 集成 |
| 包管理 | pnpm | 9.x | Workspace symlink, 幽灵依赖防护 |
| 构建编排 | Turborepo | — | 增量构建缓存 |
| 代码质量 | Biome | — | 格式化 + lint 一体化 |

### 3.2 明确不使用的技术

| 技术 | 不用原因 |
|------|----------|
| Next.js | SSR 对桌面应用无价值, 增加复杂度 |
| Electron | 内存 200-300MB, 安全模型弱, 体积 100MB+ |
| SwiftUI | 测试困难, AI 辅助开发效率低, 迭代慢 |
| Neo4j | 个人规模 PostgreSQL 递归 CTE 足够 |
| LangChain | 过度抽象, Vercel AI SDK 更轻量直接 |
| 自建 LLM 路由 | Vercel AI SDK 6 Gateway 已原生支持 |

---

## 4. 数据模型

### 4.1 核心表

```sql
-- 统一实体表: 所有个人数据的统一模型
CREATE TABLE entities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL,        -- 'task','note','meeting','habit','reflection','contact','event'
  hierarchy_layer INT,              -- 1=vision, 2=area, 3=goal, 4=project, 5=task (仅任务体系)
  title TEXT NOT NULL,
  content TEXT,                     -- 正文/描述
  status TEXT DEFAULT 'active',     -- 'active','completed','archived','cancelled'
  properties JSONB DEFAULT '{}',    -- 灵活属性 (优先级, 预估时间, 标签等)
  workflow_stage TEXT,              -- 'ritual','overview','execution'
  parent_id UUID REFERENCES entities(id),  -- 层级关系快捷引用
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ
);

-- 关系表: 实体间图关系
CREATE TABLE edges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  target_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  relation_type TEXT NOT NULL,      -- 'parent_of','blocks','relates_to','spawned_from','scheduled_in'
  weight REAL DEFAULT 1.0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 向量索引表: 带模型版本管理
CREATE TABLE embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID REFERENCES entities(id) ON DELETE CASCADE,
  model_id TEXT NOT NULL,           -- 'text-embedding-3-small'
  model_version TEXT NOT NULL,      -- '2024-01-25'
  dimensions INT NOT NULL,          -- 1536
  embedding vector(1536),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(entity_id, model_id)
);

-- AI 建议与学习循环
CREATE TABLE ai_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggestion_type TEXT NOT NULL,    -- 'task_decompose','workflow_adjust','nudge','insight'
  context_summary TEXT,             -- 触发建议时的上下文摘要
  suggestion JSONB NOT NULL,        -- 建议内容 (结构化)
  user_decision TEXT,               -- 'accepted','rejected','modified','ignored'
  user_modification JSONB,          -- 用户修改的内容
  model_id TEXT,                    -- 哪个模型生成的
  token_count INT,                  -- 消耗的 token 数
  latency_ms INT,                   -- 响应延迟
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 注意力状态记录
CREATE TABLE attention_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  state TEXT NOT NULL,              -- 'focused','drifting','overloaded','fatigued'
  score REAL NOT NULL,
  confidence REAL NOT NULL,
  breakdown JSONB NOT NULL,         -- {subjectiveScore, passiveScore, behavioralScore}
  reasons TEXT[],
  observed_at TIMESTAMPTZ DEFAULT now()
);

-- 操作审计日志
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor TEXT NOT NULL,              -- 'user' | 'agent:{agent_name}'
  action TEXT NOT NULL,             -- 'entity.create' | 'workflow.transition' | ...
  target_id UUID,                   -- 操作对象
  details JSONB DEFAULT '{}',       -- 操作详情
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Prompt 版本管理
CREATE TABLE prompt_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,        -- 'task_decompose' | 'daily_review' | ...
  system_prompt TEXT NOT NULL,
  version INT DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',      -- A/B 测试配置等
  created_at TIMESTAMPTZ DEFAULT now()
);
```

### 4.2 索引策略

```sql
-- 实体检索
CREATE INDEX idx_entities_type ON entities(entity_type);
CREATE INDEX idx_entities_hierarchy ON entities(hierarchy_layer) WHERE hierarchy_layer IS NOT NULL;
CREATE INDEX idx_entities_status ON entities(status);
CREATE INDEX idx_entities_parent ON entities(parent_id);
CREATE INDEX idx_entities_workflow ON entities(workflow_stage);

-- 全文搜索
ALTER TABLE entities ADD COLUMN fts tsvector
  GENERATED ALWAYS AS (to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(content,''))) STORED;
CREATE INDEX idx_entities_fts ON entities USING gin(fts);

-- 向量搜索
CREATE INDEX idx_embeddings_vector ON embeddings USING ivfflat (embedding vector_cosine_ops);

-- 关系图查询
CREATE INDEX idx_edges_source ON edges(source_id);
CREATE INDEX idx_edges_target ON edges(target_id);
CREATE INDEX idx_edges_type ON edges(relation_type);

-- 审计日志
CREATE INDEX idx_audit_actor ON audit_log(actor);
CREATE INDEX idx_audit_action ON audit_log(action);
CREATE INDEX idx_audit_time ON audit_log(created_at);
```

---

## 5. Monorepo 结构

```
/Users/yann.jy/Desktop/AI/AttentionOS/
├── apps/
│   ├── desktop/                   # Tauri 2.0 + React 桌面应用
│   │   ├── src/                   # React 前端源码
│   │   │   ├── components/        # UI 组件
│   │   │   ├── machines/          # XState 状态机实例（使用 packages/machines）
│   │   │   ├── hooks/             # React hooks
│   │   │   ├── pages/             # 页面组件（按工作流阶段组织）
│   │   │   │   ├── ritual/        # 冥想/祷词/回向
│   │   │   │   ├── overview/      # 全局纵览
│   │   │   │   └── execution/     # 规划与执行
│   │   │   ├── stores/            # Zustand 客户端状态
│   │   │   └── lib/               # 前端工具函数
│   │   ├── src-tauri/             # Rust 层（系统集成）
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── package.json
│   │
│   └── server/                    # 本地 API 服务（Node.js sidecar）
│       ├── src/
│       │   ├── routes/            # API 路由
│       │   ├── services/          # 业务逻辑服务
│       │   └── index.ts           # Fastify 入口
│       └── package.json
│
├── packages/
│   ├── core/                      # 域类型、常量、工具函数
│   │   ├── src/
│   │   │   ├── types.ts           # 统一类型定义
│   │   │   ├── constants.ts       # 层级名称、状态枚举等
│   │   │   └── utils.ts           # clamp, createId, normalize 等
│   │   └── package.json
│   │
│   ├── machines/                  # XState 状态机定义（确定性核心）
│   │   ├── src/
│   │   │   ├── daily-flow.ts      # ritual → overview → execution
│   │   │   ├── task-lifecycle.ts  # plan → execute → review → done
│   │   │   ├── hierarchy-nav.ts   # 五层导航
│   │   │   └── meditation.ts      # 冥想流程
│   │   └── package.json
│   │
│   ├── attention-engine/          # ← 从 V1 直接移植
│   │   ├── src/
│   │   │   └── index.ts           # estimateAttentionState()
│   │   └── package.json
│   │
│   ├── policy-engine/             # ← 从 V1 直接移植
│   │   ├── src/
│   │   │   └── index.ts           # evaluateNudgePolicy()
│   │   └── package.json
│   │
│   ├── ai/                        # AI 集成层
│   │   ├── src/
│   │   │   ├── router.ts          # Model Router（本地/云端路由策略）
│   │   │   ├── privacy.ts         # Presidio PII 网关
│   │   │   ├── tools.ts           # Agent 工具定义 (JSON Schema)
│   │   │   ├── prompts.ts         # Prompt 模板加载（从数据库读取）
│   │   │   ├── agent.ts           # @statelyai/agent 集成
│   │   │   └── embeddings.ts      # 嵌入管理（生成/版本/迁移）
│   │   └── package.json
│   │
│   ├── storage/                   # 数据访问层 (Repository Pattern)
│   │   ├── src/
│   │   │   ├── repositories/      # 每个实体类型一个 repository
│   │   │   │   ├── entity.ts
│   │   │   │   ├── edge.ts
│   │   │   │   ├── embedding.ts
│   │   │   │   ├── suggestion.ts
│   │   │   │   └── audit.ts
│   │   │   ├── supabase.ts        # Supabase 客户端
│   │   │   └── index.ts           # 统一导出
│   │   └── package.json
│   │
│   ├── sync/                      # 离线同步层
│   │   ├── src/
│   │   │   ├── powersync.ts       # PowerSync 配置
│   │   │   ├── buckets.ts         # Sync bucket 策略
│   │   │   └── conflicts.ts       # 冲突解决规则
│   │   └── package.json
│   │
│   ├── mcp/                       # MCP 协议层
│   │   ├── src/
│   │   │   ├── server.ts          # AttentionOS 作为 MCP Server
│   │   │   └── client.ts          # AttentionOS 作为 MCP Client
│   │   └── package.json
│   │
│   └── sdk/                       # 外部 SDK
│       ├── src/
│       │   └── index.ts           # @attentionos/sdk 公开 API
│       └── package.json
│
├── docs/                          # ← 从 V1 复制所有文档
│   ├── plans/                     # 设计文档（本文件所在）
│   ├── MASTER_PRODUCT_PLAN.zh-CN.md
│   ├── WORKFLOW_CANONICAL_MODEL.zh-CN.md
│   └── user-original-long-prompts.zh-CN.md
│
├── supabase/                      # Supabase 本地开发配置
│   ├── migrations/                # SQL 迁移文件
│   └── config.toml
│
├── .claude/                       # Claude Code 项目配置
│   ├── settings.json
│   └── CLAUDE.md                  # ← 第一天就建立
│
├── CLAUDE.md                      # 项目根级 Claude 指令
├── biome.json                     # 代码格式化 + lint
├── turbo.json                     # 构建编排
├── pnpm-workspace.yaml
├── tsconfig.json                  # 基础 TS 配置
└── package.json                   # 根 package.json
```

---

## 6. 分阶段实施路线

### Phase 1: 确定性核心（无 AI）— 2-3 周

**目标**: 工作流引擎 + 基础 UI + 数据层跑通。证明工作流本身好用。

**交付物**:
- XState 状态机: ritual → overview → execution 流程完整可运行
- React UI: 三个阶段的基础界面（冥想/纵览/执行）
- Supabase: 数据模型建表 + 基础 CRUD
- Tauri: macOS 桌面应用可打开运行
- 测试: 状态机转移 100% 单元测试覆盖

**ECC 工作流**:
```
/blueprint → 生成 Phase 1 分步计划
/tdd → 状态机逻辑先写测试
/feature-dev → 逐个功能开发
/everything-claude-code:plan → 每个功能前先规划
code-reviewer agent → 每个功能后审查
```

### Phase 2: AI 推理层 — 2-3 周

**目标**: 接入单 Agent, 实现任务拆解和上下文检索。

**交付物**:
- Vercel AI SDK 6 集成 + Model Router
- @statelyai/agent 连接 XState + AI
- 隐私网关: Presidio PII 脱敏
- RAG: pgvector 语义搜索 + 上下文组装
- 工具层: task.decompose, context.search 等 Agent 可调用
- AI 建议的 HITL 审批流程

**ECC 工作流**:
```
/docs → 查 Vercel AI SDK 6 和 @statelyai/agent 最新文档
/search-first → 搜索现有集成示例
/tdd → AI 工具先写评估测试
security-reviewer agent → 隐私网关审查
```

### Phase 3: 进化式学习 — 2-3 周

**目标**: AI 从用户行为中学习，周期性给出工作流优化建议。

**交付物**:
- 行为模式分析: 注意力状态趋势、任务完成模式
- 工作流优化建议: 基于数据的周期性建议
- 建议采纳率追踪: 学习循环闭环
- Langfuse 可观测: token 用量、质量指标、延迟

**ECC 工作流**:
```
/everything-claude-code:postgres-patterns → 分析查询优化
/everything-claude-code:tdd → 进化算法的测试
/everything-claude-code:e2e → 端到端测试关键流程
```

### Phase 4: 协议与扩展 — 2-3 周

**目标**: MCP 双向集成 + SDK + 插件系统。

**交付物**:
- MCP Server: 外部 AI 可调用 AttentionOS
- MCP Client: AttentionOS Agent 可操作外部工具
- TypeScript SDK: @attentionos/sdk
- 插件系统基础架构
- PowerSync 离线同步

**ECC 工作流**:
```
/everything-claude-code:mcp-server-patterns → MCP 开发参考
/everything-claude-code:api-design → SDK API 设计
/everything-claude-code:security-scan → 安全扫描
```

---

## 7. AI 辅助开发工作流（ECC 集成指南）

### 7.1 开发循环

每个功能的开发遵循以下循环:

```
1. /brainstorming          → 理解需求，设计方案
2. /everything-claude-code:plan → 生成分步实施计划
3. /docs                   → 查最新官方文档 (Context7)
4. /search-first           → 搜索现有实现
5. /tdd                    → 先写测试
6. 编码实现                 → AI 辅助编写
7. code-reviewer agent     → 自动代码审查
8. /simplify               → 代码简化
9. /commit                 → 提交
```

### 7.2 ECC Skills 使用映射

| 开发场景 | 使用的 ECC Skill/Agent | 说明 |
|----------|----------------------|------|
| 功能规划 | `/brainstorming`, `/everything-claude-code:plan` | 先讨论再动手 |
| 查文档 | `/everything-claude-code:docs` | Context7 查最新 API |
| 搜索参考 | `/everything-claude-code:search-first` | 搜索现有实现 |
| React 组件 | `/everything-claude-code:frontend-patterns` | React 最佳实践 |
| 状态管理 | 直接参考 XState v5 文档 | @statelyai/agent 文档 |
| API 设计 | `/everything-claude-code:api-design` | REST API 设计模式 |
| 数据库 | `/everything-claude-code:postgres-patterns` | PostgreSQL 模式 |
| 数据库迁移 | `/everything-claude-code:database-migrations` | 迁移最佳实践 |
| TDD | `/everything-claude-code:tdd` | 测试驱动开发 |
| E2E 测试 | `/everything-claude-code:e2e` | Playwright E2E |
| 代码审查 | `code-reviewer` agent | 自动审查 |
| 安全审查 | `security-reviewer` agent | 安全扫描 |
| 构建修复 | `build-error-resolver` agent | 构建错误修复 |
| MCP 开发 | `/everything-claude-code:mcp-server-patterns` | MCP 服务器模式 |
| Claude API | `/everything-claude-code:claude-api` | Anthropic SDK |
| 部署 | `/everything-claude-code:deployment-patterns` | 部署模式 |
| 代码简化 | `/simplify` | 重构清理 |
| 死代码清理 | `refactor-cleaner` agent | 清理未使用代码 |
| 文档更新 | `doc-updater` agent | 更新文档 |
| 提交 | `/commit` | Git 提交 |
| PR | `/commit-commands:commit-push-pr` | 提交+推送+PR |
| 多文件重构 | `/everything-claude-code:blueprint` | 多会话规划 |
| 上下文优化 | `/everything-claude-code:context-budget` | 减少 token 开销 |
| 学习积累 | `/everything-claude-code:learn-eval` | 从会话中提取模式 |
| 会话保存 | `/everything-claude-code:save-session` | 保存进度 |
| 会话恢复 | `/everything-claude-code:resume-session` | 恢复工作 |

### 7.3 CLAUDE.md 初始模板

项目根目录的 CLAUDE.md 应从第一天就包含:

```markdown
# AttentionOS V2

## 项目概述
个人注意力与上下文管理系统。七层架构，TypeScript 全栈。

## 技术栈
- 前端: React 19 + Vite + XState v5 + shadcn/ui + Tailwind → Tauri 2.0
- AI: Vercel AI SDK 6 + @statelyai/agent
- 数据: Supabase PostgreSQL + pgvector + PowerSync + SQLite
- 协议: MCP (server + client)
- 测试: Vitest + Playwright + DeepEval
- 构建: pnpm + Turborepo + Biome

## 开发规范
- 每个功能先查文档 (/docs)，再搜索现有实现 (/search-first)
- TDD: 先写测试，再实现
- 代码审查: 每个功能完成后自动触发 code-reviewer agent
- 文件上限: 400 行，超过必须拆分
- 不可变数据: 返回新对象，不修改原对象
- Prompt 存数据库: 不在代码中硬编码 prompt
- 工具定义用 JSON Schema: 模型无关

## 架构规则
- 确定性流程走 XState 状态机，不走 LLM
- LLM 只决定发出哪个事件，状态机验证合法性
- 每个 AI 工具同时暴露为 GUI 按钮 / Agent 工具 / MCP 工具
- 敏感数据分级: L0 直接发送, L1 脱敏, L2 仅本地, L3 永不处理
- 向量表带 model_id + model_version 字段

## 常用命令
- `pnpm dev` — 启动开发
- `pnpm test` — 运行测试
- `pnpm build` — 构建
- `pnpm check` — 类型检查
```

### 7.4 Agents 编排策略

```
开发前: planner agent → 生成分步计划
开发中: tdd-guide agent → 确保测试先行
开发后: code-reviewer + security-reviewer → 并行审查
构建失败: build-error-resolver agent → 修复构建
发布前: e2e-runner agent → 端到端测试
```

多 agent 并行规则: 代码审查 + 安全审查可以并行运行（独立无依赖）。

### 7.5 成本控制策略

| 策略 | 实施方式 | 预期节省 |
|------|----------|----------|
| 不调用 AI | 确定性流程走 XState，不经过 LLM | ~70% 操作零成本 |
| 本地模型 | 嵌入生成、简单分类用 Ollama | ~15% 操作零成本 |
| 模型路由 | 简单 → Haiku/Flash，复杂 → Opus/GPT-5 | 60-80% 成本降低 |
| Prompt 缓存 | Anthropic 1h 缓存窗口，读取降 90% | 显著降低重复调用 |
| 上下文压缩 | 旧对话做摘要，不发原文 | 减少 input token |
| 增量嵌入 | 只对变更内容生成向量 | 减少嵌入 API 调用 |
| 批处理 | 非紧急请求攒到一起发送 | 50% 批处理折扣 |
| 语义缓存 | 相似查询命中缓存 | 60-85% 命中率 |

---

## 8. V1 → V2 迁移策略

### 8.1 保留（直接复制）

| 资产 | 来源路径 | 目标路径 | 说明 |
|------|----------|----------|------|
| 注意力引擎 | `packages/attention-engine/src/index.ts` | `packages/attention-engine/src/index.ts` | 153 行纯函数，原封不动 |
| 策略引擎 | `packages/policy-engine/src/index.ts` | `packages/policy-engine/src/index.ts` | 322 行纯函数，原封不动 |
| 工具函数 | `packages/core/src/utils.ts` | `packages/core/src/utils.ts` | clamp, createId 等 |
| 产品规划 | `docs/MASTER_PRODUCT_PLAN.zh-CN.md` | `docs/MASTER_PRODUCT_PLAN.zh-CN.md` | 产品理念基线 |
| 工作流模型 | `docs/WORKFLOW_CANONICAL_MODEL.zh-CN.md` | `docs/WORKFLOW_CANONICAL_MODEL.zh-CN.md` | 三舞台五层模型 |
| 用户需求 | `docs/user-original-long-prompts.zh-CN.md` | `docs/user-original-long-prompts.zh-CN.md` | 原始需求 |

### 8.2 参考后重新设计

| 资产 | 说明 |
|------|------|
| `packages/core/src/types.ts` (754 行) | 域类型有价值，但需适配 entity/edge 统一模型 |
| `packages/core/src/defaults.ts` (138 行) | 配置常量选择性保留 |
| API 路由设计 | V1 的 endpoint 设计可参考，但实现方式完全不同 |

### 8.3 丢弃

| 资产 | 原因 |
|------|------|
| `packages/storage/src/index.ts` (2110 行) | SQLite 专用，被 Supabase + PowerSync 替代 |
| `apps/daemon/src/index.ts` (6412 行) | 单文件巨石，不可拆分移植 |
| `macos/AttentionOSMac/` | SwiftUI 被 Tauri + React 替代 |
| `packages/plugin-sdk/` | 插件模型重新设计 |
| `packages/integrations/` | Mock 连接器，无实际价值 |
| `apps/cli/` | CLI 如需要会重新设计 |

---

## 9. 测试策略

### 9.1 三层测试模型

| 层级 | 工具 | 频率 | 覆盖目标 |
|------|------|------|----------|
| 确定性单元测试 | Vitest | 每次提交 | 状态机转移、工具路由、数据校验、纯函数 (≥80%) |
| AI 质量评估 | DeepEval | 合并到 main | 任务拆解质量、上下文检索相关性、建议合理性 |
| E2E 测试 | Playwright | 每日/发布前 | 关键用户流程（ritual→execution 全链路） |

### 9.2 测试原则

- **测结果，不测路径**: 不断言 AI 调用了哪些工具，只断言最终输出质量
- **确定性和 AI 测试严格分离**: 状态机测试不依赖任何 LLM
- **AI 测试取多次平均**: LLM 输出非确定性，取 3+ 次平均分
- **质量阈值而非精确匹配**: `expect(score).toBeGreaterThan(0.7)`

---

## 10. 关键参考项目

| 项目 | 参考价值 |
|------|----------|
| [Screenpipe](https://github.com/mediar-ai/screenpipe) | Tauri 2.0 + 本地 AI + MCP 的生产级范例 |
| [@statelyai/agent](https://github.com/statelyai/agent) | XState + Vercel AI SDK 的官方集成 |
| [Vercel AI SDK 6](https://ai-sdk.dev/) | 多模型路由 + MCP + HITL 的参考实现 |
| [PowerSync](https://docs.powersync.com/) | PostgreSQL + SQLite 离线同步 |
| [Microsoft Presidio](https://github.com/microsoft/presidio) | PII 检测与脱敏 |
| [Langfuse](https://langfuse.com/) | AI 可观测平台 |
| [shadcn/ui](https://ui.shadcn.com/) | UI 组件库 |

---

## 附录 A: 开发环境初始化清单

```bash
# 1. 创建项目
mkdir -p /Users/yann.jy/Desktop/AI/AttentionOS
cd /Users/yann.jy/Desktop/AI/AttentionOS
git init

# 2. 初始化 pnpm workspace
pnpm init
# 创建 pnpm-workspace.yaml

# 3. 安装 Tauri
pnpm create tauri-app apps/desktop --template react-ts

# 4. 安装核心依赖
pnpm add -w typescript @types/node
pnpm add -D turbo biome

# 5. 初始化 Supabase
npx supabase init

# 6. 从 V1 复制文档和可移植代码
cp -r ../RSS/docs/ docs/
cp -r ../RSS/packages/attention-engine/ packages/attention-engine/
cp -r ../RSS/packages/policy-engine/ packages/policy-engine/

# 7. 创建 CLAUDE.md
# (从 7.3 节的模板初始化)

# 8. 首次提交
git add .
git commit -m "feat: initialize AttentionOS V2 monorepo"
```
