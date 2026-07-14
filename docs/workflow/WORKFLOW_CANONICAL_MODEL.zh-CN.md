# 三舞台五层永久工作流模型（Canonical）

版本：`v1.0-canonical`  
更新时间：`2026-03-04`  
状态：`Active / Source of Truth`

## 0. 文档定位

本文件是 AttentionOS 工作流语义的永久基线，用于统一产品、设计、开发、测试与后续回顾。

- 面向普通用户：先读 `Part A 用户版流程手册`。
- 面向工程实现：再读 `Part B 技术附录`。
- 若与旧文档冲突：以本文件为准。

## 1. 语义冻结（本次确认）

1. 三舞台命名固定为：`ritual / overview / execution`。
2. 五层模型保留：`vision / area / goal / project / task`。
3. 旧 `planning` 能力并入 `execution(plan)`；执行态为 `execution(focus)`。
4. 改名策略为硬切换：不保留兼容别名。
5. 历史文档不回写：旧 Sprint 文档中的 `planning/focus` 仅作为历史证据保留。

## 2. 语义来源（回顾入口）

1. 用户原始需求：`docs/sources-or-raw/user-original-long-prompts.zh-CN.md`
2. 当前工作与需求缺口：GitHub Issues 与 Wayfinder map。
3. 历史 Sprint、roadmap、计划和验收记录：Git 历史；不再作为当前控制面保留副本。

---

## Part A 用户版流程手册

### A1. 三舞台一句话理解

1. `ritual`：先把心定下来，再开始一天。
2. `overview`：只看全局，不做编辑。
3. `execution`：真正做事，包含“先规划再执行”两种模式。

### A2. 每天怎么走（晨晚全链路）

1. 进入晨间 `ritual`：先显示祷词。
成功状态：你完成祷词阅读并进入下一步。
常见误区：跳过祷词直接开工，导致一天目标不清晰。

2. 点击“下一步”进入冥想设置，再进入冥想。
成功状态：完成一次完整冥想。
常见误区：把冥想当成可省略选项。

3. 冥想结束后回到回向页，填写/确认回向内容。
成功状态：至少记录一个需要被记住的事件，并可标记是否转入任务。
常见误区：只做感受，不落到可追踪内容。

4. 结束晨间 ritual 后进入 `overview`。
成功状态：先看“当前层级的全局状态”。
常见误区：一上来就试图编辑，忽略了 overview 是只读区。

5. 在 overview 确认当前层级焦点（愿景/领域/目标/项目/任务）。
成功状态：你知道自己此刻在第几层做判断。
常见误区：跨层混看，愿景和任务混在一起做决策。

6. 点击“进入执行”切换到 `execution(plan)`。
成功状态：在同一层级开始创建/拆解/排序。
常见误区：频繁切层导致计划碎片化。

7. 当可执行项明确后，进入 `execution(focus)` 完成当前下一步。
成功状态：有且仅有一个当前执行动作在进行。
常见误区：同时开启多个执行动作，重新回到注意力分散。

8. 晚间再次进入 `ritual`（晚间流程），完成回顾与回向。
成功状态：当天关键进展被回顾并沉淀。
常见误区：只做任务清点，不做意义层面的回顾。

### A3. 三舞台详细说明

#### 1) ritual（仪式）

- 何时进入：起床后、睡前、或用户手动触发。
- 你会看到什么：祷词、冥想设置、回向。
- 你能做什么：进入冥想、记录回向、将回向项转为任务。
- 下一步按钮做什么：把你带到下一步仪式节点，直至进入当天工作流。

#### 2) overview（纵览）

- 何时进入：ritual 结束后，或执行中需要回到全局时。
- 你会看到什么：只读指标、趋势、风险提示、同层级桥接动作。
- 你不能做什么：创建/编辑/拆解任务与项目。
- 下一步按钮做什么：切到 `execution(plan)`，并保留当前层级与过滤条件。

#### 3) execution（执行）

- 何时进入：需要落地动作时。
- 你会看到什么：同层级可执行实体、约束、行动入口。
- 两种模式：
  - `execution(plan)`：做规划动作（创建、拆分、排序）。
  - `execution(focus)`：做执行动作（当前下一步推进）。
- 下一步按钮做什么：在同层级里推进计划或推进当前执行。

### A4. 五层模型（给普通用户的理解）

1. `vision`（愿景）：你想成为什么样的人，长期方向是什么。
2. `area`（领域）：你的人生责任分区（学习/工作/生活/社交/修行）。
3. `goal`（目标）：阶段性结果（季度/年度里程碑）。
4. `project`（项目）：为达成目标而组织的一组行动链。
5. `task`（任务）：能直接开做、可估时、有完成标志的原子动作。

### A5. 用户侧操作红线

1. overview 是观察层，不是编辑层。
2. execution 里先收敛一个“当前下一步”，再做扩展。
3. 五层切换时只聚焦一层，不做跨层混合决策。
4. ritual 不是装饰，而是整套流程的起点和收口。

---

## Part B 技术附录

### B1. 路由与上下文模型

1. `WorkflowRoute = "ritual" | "overview" | "execution"`。
2. `RouteContext` 新增：`executionMode?: "plan" | "focus"`。
3. `executionMode` 仅在 `workflowRoute=execution` 时生效。

### B2. Page Model 语义改名

1. `PlanningPageModel` 对外语义改为 `ExecutionPageModel`。
2. `overview` 保持只读模型；`execution` 提供可执行模型。

### B3. API 改名规范

1. `GET /v1/workflow/page-models/planning` -> `GET /v1/workflow/page-models/execution`
2. `POST /v1/workflow/bridge/overview-to-planning` -> `POST /v1/workflow/bridge/overview-to-execution`
3. overview 写入门禁提示：`Switch to execution(plan) route to edit content.`

### B4. CLI 改名规范

1. `workflow page-model planning` -> `workflow page-model execution`
2. `bridge-overview-to-planning` -> `bridge-overview-to-execution`
3. route 参数只接受：`ritual/overview/execution`
4. 增加 execution mode 参数：`plan/focus`

### B5. Web Shell 规范

1. 路由选项改为：`overview/execution`。
2. 写权限规则：`route===overview` 一律禁写（返回 409）。
3. bridge 动作为：`overview -> execution(plan)`。

### B6. macOS 规范

1. route 枚举改为 `ritual/overview/execution`。
2. surface 映射按 executionMode 区分 plan/focus 展示。
3. route rail 与文案同步使用 execution 语义。

### B7. Storage 与历史载荷归一化

1. 读取历史 route context 时，旧值 `planning/focus` 统一归一到 `execution`。
2. `focus` 旧 route 自动映射为 `executionMode=focus`。
3. 缺省 executionMode 时，默认 `plan`。

### B8. 阶段化执行顺序（防止失控）

1. Phase A：永久文档与索引回链。
2. Phase B：核心类型与 schema（core/daemon/storage）。
3. Phase C：daemon 端点与 bridge 改名。
4. Phase D：CLI + Web Shell 改名与契约更新。
5. Phase E：macOS 服务层与界面语义收口。
6. Phase F：按舞台打磨（`Ritual -> Overview -> Execution`）。

### B9. 测试与验收清单

1. route 枚举：`planning/focus` 输入失败，`execution` 通过。
2. route context：`executionMode` 持久化、恢复、切换正确。
3. bridge：`overview -> execution(plan)` 保留 level/filters。
4. overview 门禁：overview 下写操作返回 409。
5. page model：`/overview` 与 `/execution` 各自契约正确。
6. CLI 契约：新命令通过，旧命令失效。
7. Web 契约：路由选项、治理面板默认隐藏、读写权限正确。
8. macOS：`WorkflowRouteContextServiceTests` 新枚举解码与映射通过。
9. 回归：Sprint E/F/G/H 相关测试集全绿。

### B10. 变更治理规则

1. 后续若改三舞台命名或五层定义，必须先改本文件，再改代码。
2. 历史文档仅追加“版本声明”，不覆盖原记录。
3. 新功能说明优先链接到本文件，避免语义再次漂移。
