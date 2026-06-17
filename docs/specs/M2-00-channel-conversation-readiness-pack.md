# M2-00 Channel Conversation Readiness Pack

## 目标

打开 M2 仅用于 spec-governed 的渠道、对话和工单工作，归档当前 `main` readiness、M2 有序 spec 队列、并行规则与验收映射。本 PR 只建立 M2 docs gate，不实现 Bot、Business、API、admin、WS、DB schema 或生产能力。

M2-00 合并后只表示 `ready_to_start_specs`：允许后续 M2 spec/PR 逐个开工；不表示 production-ready、不接真实客户流量、不允许客户消息进入第三方 LLM、不开放 GA-0、不开放 Telegram Business 自动回复，也不宣称 Telegram Business 可行。

## Owner

Owner：项目 owner 确认是否允许从 M1 accepted 状态进入 M2 spec 队列，并继续负责真实 Telegram Bot/Business 账号、真实客户流量、客户 LLM、GA-0、成本与合规风险决策。

AI agent：复核 AGENTS、v1.1 根文档、现有 SPK-01、M1 signoff、preflight 和 doc gate；记录 M2 队列、并行约束、当前阻断项和验证证据；不替 owner 做生产、真实账号或 Business 可行性结论。

## 时间盒

0.25 个工作日。若当前 `main`、M1 accepted、分支/PR 卫生或 baseline validation 无法证明，则不得把 M2 标记为 `ready_to_start_specs`，改为记录 `blocked_needs_current_state_refresh`。

## Spec 类型

docs

## 触碰模块/文件

- 触碰模块集合（机器可读 glob/path，一行一个；禁止散文；`guard:pr-shape` 唯一读取本列表）：
  - `docs/specs/M2-00-channel-conversation-readiness-pack.md`
  - `docs/evidence/M2/README.md`
  - `docs/evidence/M2/M2-channel-conversation-readiness-pack.md`
- 说明/备注（可选，自由文本；`guard:pr-shape` 不读取）：
  - 本 PR 只允许新增 M2 spec queue/readiness evidence。
  - 未列出的模块默认不可改，尤其不得修改 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated artifacts、raw customer data、Telegram payloads 或 screenshots。

## 变更预算与路径分类

- source 预算：changed source files <= 0、net source LOC <= 0、new source files <= 0。
- test/generated/lock/config/docs 预计变更：新增本 spec、`docs/evidence/M2/README.md` 和 M2 readiness evidence；不修改测试、生成物、lockfile 或配置。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：无新增 source；已检索 `M2`、`SPK-01`、`conversation`、`ticket`、`readiness`、`doc-gates`、`M1-platform`，确认当前缺口是 M2 opening/spec queue evidence，而不是实现归属。
- 外部 API/SDK/provider/connector/adapter 依据：本 PR 不实现外部 adapter。后续 SPK-01 必须依据 Telegram 官方文档、真实账号 evidence 或 ADR-B01 保守关闭分支。
- 是否需要例外：无。

## 文档触发检查

- 结果：updated
- 判断依据：`docs/doc-gates.md`。本 PR 只新增 M2 readiness/spec queue evidence，不引入真实 eval fixtures、contracts、observability、environment、release 能力路径或 runbook 触发项。

## 前置条件

- `docs/evidence/M1/M1-platform-skeleton-signoff.md` 为 `accepted`，且明确 M1 签收不放行 production、M2/M3/M4、GA-0、客户 LLM 或真实客户流量。
- 当前 branch audit 已执行：`git fetch --prune origin`、`git branch --no-merged main`、`gh pr list --state open --json number,title,headRefName,baseRefName,url`。
- 当前 `main` baseline validation 已执行：`npm run check` passed on commit `417f777a1eb7379ff113273aeb42fecfa029655c` before this docs diff.
- ADR-003 仍阻断真实客户消息进入第三方 LLM；M2 只能准备渠道/对话基础，不开放 customer LLM。
- SPK-01 仍需真实 Telegram Business 账号 evidence 或按 conservative unavailable/no-conclusion 分支关闭 ADR-B01 与 feature flag。

## 实施步骤

1. 新增 M2-00 spec，限定本 PR 为 docs-only readiness/spec queue gate。
2. 新增 `docs/evidence/M2/README.md`，声明 M2 evidence 边界和敏感数据禁入规则。
3. 新增 M2 readiness evidence，记录 M1 accepted、coordinator audit、baseline `npm run check`、M2 状态和生产/真实流量/customer LLM/GA-0 阻断项。
4. 在 readiness evidence 中列出 M2 spec queue，不创建后续 M2 implementation spec 文件。
5. 明确 SPK-01 当前状态：Business 可行性未证明，M2 closeout 前必须拿到真实证据或走 ADR-B01 保守关闭分支。
6. 运行 required validation 并完成 spec compliance review 与 docs quality review。

## M2 Spec Queue

| 顺序 | Future spec / PR | 目标 | 主要触碰模块草案 | 并行限制 |
|---:|---|---|---|---|
| 1 | `M2-01-channel-conversation-db-contracts-foundation` | 建立 channel/conversation/message/ticket 最小 schema、RLS、DTO/contracts | `packages/db/**`、`docs/contracts/**`、必要 API contract 路径 | `packages/db` schema 全局串行，必须先于 Bot/API/admin 正式实现 |
| 2 | `M2-02-telegram-bot-ingress-dedupe-queue` | Telegram Bot webhook ingress、update dedupe、queue handoff、unsupported/unreachable 边界 | `packages/channels/**`、`apps/api/**`、`apps/worker/**`、tests/evidence | 依赖 M2-01 稳定 contracts；不得与触碰相同 API/channels 文件的 PR 并行 |
| 3 | `SPK-01-telegram-business` | 真实 Business 账号 spike，输出 ADR-B01 与 feature flag 分支 | `docs/adr/ADR-B01-telegram-business.md`、`docs/evidence/M2/spikes/SPK-01-telegram-business/**`、临时 spike assets | 可与非 Business code 并行，仅限 ADR/evidence/临时 spike；若触碰生产 Business adapter/API/admin，则按触碰模块冲突串行 |
| 4 | `M2-03-conversation-handoff-ticket-apis` | 对话、接管、工单 API 与 handoff/ticket 状态机 | `apps/api/**`、`packages/engine/**`、`packages/capabilities/handoff/**`、contracts/tests | 依赖 M2-01；不得与 Bot/API PR 或 admin contract PR 重叠触碰模块 |
| 5 | `M2-04-admin-conversation-ticket-shell` | 后台对话/工单 shell，筛选、状态、空/错/权限/降级态 | `apps/admin/**`、`packages/ui-tokens/**`、frontend tests/evidence | 等待 M2-03 stable API/contracts；若只做本 spec 内 mock shell，必须明确不代表生产 API 可用 |
| 6 | `M2-05-realtime-ws-evidence-if-needed` | 会话/工单实时 WS 或轮询降级 evidence，关闭 I-04 对 M2 的必要部分 | `apps/api/**`、`apps/admin/**`、tests/evidence | 仅在 M2-03/M2-04 需要实时证据时开；与 API/admin 触碰模块冲突时串行 |
| 7 | `M2-06-channel-conversation-closeout-signoff` | M2 closeout/signoff，归档 Bot、Business 分支、conversation/ticket evidence 和未完成项 | `docs/evidence/M2/**`、必要 closeout spec | 必须在 M2 queue 完成或明确失败分支后执行 |

## 并行规则

- `packages/db` schema first and serial：M2-01 是全局串行点，任何其他 M2 PR 不得同时改 schema/migration/Prisma model/DTO generator。
- SPK-01 可与非 Business code 并行，条件是只触碰 ADR/evidence 和临时 spike assets；若引入生产 Business adapter、API、admin feature flag 或 contracts，则按触碰模块冲突串行。
- Bot/API/admin 不能在触碰模块重叠时并行；每个 PR 的 `触碰模块/文件` 必须是唯一并行治理真源。
- Admin shell 等待稳定 API/contracts；若 M2-04 只在 spec 内使用 mock，则必须把 mock 限定为 UI 验收材料，不得声称 API、WS 或生产数据路径可用。
- `packages/capabilities/*` 之间仍禁止互相 import；需要组合时只能由 `engine` 编排。

## 通过条件

- M2-00 spec 包含必填字段、M2 非范围、queue、parallelism、SPK-01 honest status 和验收映射。
- M2 evidence 记录 current-state facts：M1 accepted、no open PRs/no unmerged branches at audit、baseline `npm run check` passed、M2 status `ready_to_start_specs`、production/real traffic/customer LLM/GA-0 blocked。
- 本 PR 不创建后续 M2 implementation specs，不改 `apps/**`、`packages/**`、`scripts/**`、lockfile、config、generated files、raw customer data、Telegram payloads 或 screenshots。
- `npm run format:check`、`npm run guard:doc-triggers`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-00-channel-conversation-readiness-pack.md`、`git diff --stat origin/main...HEAD` 和 `git status --short` 完成。

## 失败分支

- 若 M1 signoff 不是 `accepted` 或 baseline validation 失败：M2 status 改为 `blocked_needs_m1_or_validation_fix`，不得进入 M2 spec queue。
- 若 coordinator audit 发现 open PR 或 unmerged branch：M2 status 改为 `blocked_needs_branch_pr_hygiene`，先清理或记录 superseded。
- 若 SPK-01 被误写成 Business feasible：改回 `pending_real_account_or_conservative_closure`，不得合并可行性表述。
- 若后续 M2 queue 需要真实客户 traffic、customer LLM、Business auto-reply 或 GA-0：拆出 later-gate decision，不得纳入 M2-00。
- 若 doc-trigger guard 要求新增 docs beyond this scope：停止并拆新的 docs-only spec，避免 placeholder manuals。

## 不做什么

- 不实现 Telegram Bot webhook、Business adapter、conversation engine、handoff/ticket API、admin UI、WebSocket、DB schema、queue worker、LLM/prompt/model route 或 tests。
- 不创建 `M2-01` 到 `M2-06` 的详细 implementation spec 文件；这里只记录有序 queue。
- 不声明 production-ready、真实客户流量、customer LLM、GA-0、distill、knowledge auto-write、Business auto-reply 或 Business feasibility。
- 不提交 raw/export/jsonl/csv、客户明文、Telegram payloads、screenshots、voice transcripts、订单号、电话、地址、支付信息或客服个人账号。
- 不新增 placeholder manuals、runbooks 或未来能力文档。

## 验收映射

- C-01：M2 queue 覆盖 Bot 文本/图片/语音/callback ingress、dedupe 和 queue 方向；M2-00 不关闭该项。
- C-02：M2 queue 要求 Bot 边界行为进入后续 spec；M2-00 不关闭该项。
- C-03 / C-03b / C-04 / C-05 / C-05b：仅由 SPK-01 + ADR-B01 条件式分支决定；M2-00 不宣称 Business 可行。
- C-06：M2-03 后续覆盖接管在途 AI 消息撤下；M2-00 不关闭该项。
- D-01：M2-04 后续覆盖对话筛选与状态；M2-00 不关闭该项。
- D-02 / D-03：M2-03/M2-04 后续覆盖工单生成、认领、锁定、备注、升级、关闭、重开；M2-00 不关闭这些项。
- I-01：M2-04 后续覆盖对话/工单 shell 对桌面核心流程的局部证据；M2-00 不关闭整体 I-01。
- I-04：M2-05 视需要覆盖 WS/实时或降级证据；M2-00 不关闭该项。
- J-05：本 PR 建立 M2 里程碑证据入口，避免 M2 验收集中堆到 M6。
- K-03：本 PR 一 spec 一 PR。
- K-04：本 PR 记录 M2 queue 并行规则，schema 串行和触碰模块冲突规则。
