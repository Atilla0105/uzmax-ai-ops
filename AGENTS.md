# UZMAX Agent Constitution

本文件是 UZMAX 智能运营系统所有 AI agent 的根规则。任何实现、评审、重构、文档更新都必须先读本文件，再读对应 spec 与 v1.1 正式文档。

## 1. Source Of Truth

- 产品范围以 `UZMAX智能运营系统-PRD-v1.1.md` 为准。
- 技术边界以 `UZMAX智能运营系统-技术架构-v1.1.md` 为准。
- 后台体验以 `UZMAX智能运营系统-后台设计与前端架构-v1.1.md` 为准。
- 发布阻断以 `UZMAX智能运营系统-1.0验收矩阵-v1.1.md` 为准。
- 新增工作必须先有 `docs/specs/` 下的 spec；一个 PR 只实现一个 spec。

## 2. Governance Roles

- 本项目只有一个真人决策者：项目 owner（用户本人）。
- AI agents 负责执行、复核、产证据、暴露风险和维护治理文件。
- 技术、AI、运营、设计/前端、DevOps 是检查视角和工作类型，不是多人签字卡点。
- AI agents 不得替项目 owner 做最终范围、发布、真实账号、真实客户数据、LLM key、成本和合规风险决策。

## 3. Dependency Rules

本节是 `UZMAX智能运营系统-技术架构-v1.1.md` §2.1 的高频执行镜像；若发生冲突，以技术架构 §2.1 为准，并在 M0-01 校准本节。

- 主链路：`channels -> engine -> capabilities -> db/llm-gateway`。
- `authz` 可被 `apps/api`、`apps/worker` 和后台 API 层调用；`authz` 不得依赖 `capabilities`、`engine`、`channels`。
- `memory` 可依赖 `db`、`llm-gateway`；只允许由 `engine` 或离线任务调用，不得直接调用 `channels`。
- `distill` 可依赖 `db`、`memory`、`llm-gateway`、`evals`；不得进入实时对话同步路径。
- `ops-assets` 可被后台 API 层与 `capabilities/kb` 使用；不得反向依赖 `engine` 或 `channels`。
- `evals` 可依赖 fixtures、`llm-gateway`、测试 DB utilities；不得进入生产请求链路。
- `ui-tokens` 只能向前端 primitives/patterns/pages 输出 token；不得依赖业务包。
- `capabilities/*` 之间禁止互相 import；需要组合时只能由 `engine` 编排。
- `admin` 只调用 API/WS，禁止 import 后端包。
- `engine` 禁止出现业务线词汇；业务语义在租户配置、知识库、能力模块内部。该规则由 forbidden-terms grep 或自定义 ESLint 规则执行，不由 dependency-cruiser 执行。
- DTO 从 schema 或明确契约生成；禁止手写漂移的请求/响应类型。

## 4. Directory Rules

- `apps/api`：NestJS HTTP/WebSocket 服务。
- `apps/admin`：React/Vite 后台，纯 API 客户端。
- `apps/worker`：BullMQ worker entrypoint。
- `apps/cron`：scheduled job entrypoint。
- `packages/db`：Prisma schema、generated client、RLS migrations。
- `packages/authz`：org/tenant/permission guards。
- `packages/channels`：Telegram Bot 与 Telegram Business adapters。
- `packages/engine`：conversation orchestration，不承载业务线语义。
- `packages/capabilities`：kb、vision、pricing、order-read、handoff 等能力。
- `packages/ops-assets`：quick replies、media assets、tags、custom fields。
- `packages/llm-gateway`：providers、routing、accounting、eval hooks。
- `packages/memory`：L1/L2/L3 context and retrieval。
- `packages/distill`：candidate generation and queues。
- `packages/evals`：eval runner、fixtures、redline checks。
- `packages/ui-tokens`：design tokens and linted CSS variables。
- `docs/adr`：重大架构决策。
- `docs/specs`：已批准或待批准的工作 spec。
- `docs/runbooks`：生产故障与发布演练。

## 5. Forbidden Patterns

- 禁止在没有 spec 的情况下新增模块、页面或能力。
- 禁止先写新实现再搜索已有实现；新增前必须 `rg` 检索。
- 禁止跨 capability import。
- 禁止让 LLM 做报价、SLA、成本、订单状态等数值判断。
- 禁止在 `engine` 中写 Laylak、集运、乌兹别克等业务线词汇。
- 禁止组件内字面量样式；前端必须走 tokens/primitives/patterns。
- 禁止前端隐藏权限后后端仍可调用成功。
- 禁止绕过评测 gate 发布 prompt、知识、模型路由或 AI 人设变更。
- 禁止自动写入正式知识库；蒸馏候选必须经确认队列。

## 6. Change Flow

1. 先创建或确认 `docs/specs/REQ-xx.md` / `M*-xx.md`。
2. spec 必须写清目标、项目 owner 确认点、AI agent 执行/复核责任、时间盒、触碰模块、通过条件、失败分支、不做什么。
3. 触碰模块有交集的 spec 禁止并行。
4. `packages/db` schema 变更全局串行。
5. 实现完成后必须先做 spec compliance review，再做 code quality review。
6. 合并前必须通过 CI 和对应验收证据归档。

## 7. Spike Rules

- SPK-01 Telegram Business、SPK-02 订单 API、SPK-03 RLS x Prisma x 连接池、SPK-04 双鉴权链路都必须有 ADR。
- LLM 数据处理策略必须在 M0 形成 `ADR-003-llm-data-processing.md`；未签收前不得让真实客户消息进入第三方 LLM。
- Spike 必须在真实环境或足够贴近真实的基础设施中验证；不接受纯 mock 结论。
- 时间盒到期没有结论时按不可行分支执行。
- 失败分支必须是关闭、降级、顺延、改路径或写 ADR；不得写“继续观察”。

## 8. ADR Numbering

- 技术地基 ADR 使用数字序列：`ADR-001-*`、`ADR-002-*`、`ADR-003-*`。
- 外部业务依赖使用 B 序列：`ADR-B01-*`、`ADR-B02-*`。
- 后续若新增数据/合规专题仍优先使用数字序列，除非它是某个外部平台分支。

## 9. Review Checklist

- 是否引用了正确 spec。
- 是否超出 spec 范围。
- 是否重复造轮子。
- 是否违反依赖边界。
- 是否触碰红线、权限、RLS、评测 gate。
- 是否有测试或验收证据。
- 是否留下 ADR 或 runbook 需要的操作记录。
