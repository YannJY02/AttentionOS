# AttentionOS Delivery & Review Gate

The official `agent-autoloop` delivery plugin reads [delivery.json](delivery.json) and these review points from `main`. Review uses the quota-resilient dual-seat panel (`panel-v1`: primary `gpt-6.2-astra @xhigh` + cross-family `Claude` / `Gemini` seat with automatic local failover to distinct `gpt-6.1-terra @xhigh` when external CLI credentials or quota are unavailable; pass `--policy strict-cross-family` when cross-provider enforcement is mandatory).

## 审查要点

- 严禁破坏 `docs/product/MASTER_PRODUCT_PLAN.zh-CN.md` 的不可妥协原则：新增功能或界面不得增加记录摩擦、不得在用户专注执行流中制造未节流的打扰弹窗、不得把愿景/目标/项目/任务混同在同一杂乱层级。
- 严禁违反 `AGENTS.md` 与 `scripts/check-doc-governance.mjs` 的文档权威边界：不得改写 `docs/sources-or-raw/` 原始证据，不得未经用户明确确认将提案标为 `accepted`，不得在根目录或 `apps/`、`packages/` 下散落未受管 Markdown 文档。
- 检查状态机与异步持久化一致性：仪式流（Ritual -> Reflection -> Dedication）与执行流（Planning -> Executing -> Reviewing -> Completed）切换时不得丢失用户已输入的反思或计时状态。
- 检查验证与 CI 完整性：不得弱化 `.agents/skills/verify/run`、`pnpm docs:check`、类型检查或 Playwright 真实动线断言；仅修改模拟数据或跳过测试不能作为功能通过依据。
