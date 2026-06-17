# M2-01 Channel Conversation DB Contracts Foundation

## 目标

建立 M2 渠道、对话、消息、工单的最小 DB/schema/RLS/contracts 地基：`channel_connection`、`telegram_update_dedupe`、`conversation`、`message`、`ticket`、`ticket_event` 表、Prisma model、受限 runtime 权限和纯 DB contract helper。

本 PR 是 `packages/db` schema/contracts 全局串行点，只为后续 Bot ingress、conversation API、admin shell、WS 和 handoff specs 提供基础。不实现 Bot webhook runtime、Telegram Business 可行性、conversation API、admin UI、worker queue、WS、LLM、prompt、客户资产中心、订单/客户资产、distill 或生产流量。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认 M2-01 只合并 DB/contracts foundation，不代表 Telegram Bot production readiness、Telegram Business 可行、真实客户流量、customer LLM、GA-0、M2 closeout 或 D/C/I 验收项关闭。

AI agent：执行 spec、TDD RED/GREEN、schema/RLS/contracts 实现、contracts 文档与 evidence 更新；复核触碰模块、PR Hygiene、Business/customer asset 边界、无 raw payload/customer data、无测试弱化，并在 PR 中暴露未完成项。

## 时间盒

0.5 个工作日。若最小 schema/RLS/contracts 无法在预算内通过 focused test 与本地 validation，则关闭本分支或拆小；不得夹带 Bot runtime、Business、API/admin 或客户资产工作继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M2-01-channel-conversation-db-contracts-foundation.md`
- `docs/contracts/README.md`
- `docs/evidence/M2/M2-01-channel-conversation-db-contracts-foundation.md`
- `packages/db/prisma/schema.prisma`
- `packages/db/migrations/0003_channel_conversation_ticket_foundation.sql`
- `packages/db/src/index.ts`
- `scripts/tests/m2-channel-conversation-foundation.test.mjs`

说明/备注：

本 PR 只允许上述文件。未列出的模块默认不可改，尤其不得触碰 `apps/**`、`packages/channels/**`、`packages/engine/**`、`packages/capabilities/**`、`apps/admin/**`、`package-lock.json`、configs、generated files、raw customer data、Telegram payloads 或 screenshots。

## 变更预算与路径分类

- source 预算：changed source files <= 2、net source LOC <= 600、new source files <= 0。
- path categories：docs = spec/contracts/evidence；generated = SQL migration；source = `packages/db/prisma/schema.prisma`、`packages/db/src/index.ts`；test = `scripts/tests/m2-channel-conversation-foundation.test.mjs`。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `channel_connection`、`telegram_update_dedupe`、`conversation`、`message`、`ticket`、`ticket_event`、`ChannelConversation`、`Ticket`；当前只有 v1.1 文档、M2-00 queue/evidence 和 M1 tests 引用，没有可扩展的实现。遵守就地优先，本 spec 不新增 source 文件，只更新既有 DB source 和新增 migration/test/spec/evidence 文档。
- Prisma model 命名说明：SQL table 使用 v1.1/任务要求的 `conversation`、`message`、`ticket`、`ticket_event`；Prisma model 使用 `ChannelConversation`、`ChannelMessage`、`SupportTicket`、`SupportTicketEvent`，避免泛型实体名与 M1 pre-M2 测试语义冲突。
- 外部 API/SDK/provider/connector/adapter 依据：none，本 PR 不新增外部 API/provider/connector/adapter，不声明 Telegram Business feasibility。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 `main` 已合并 M2-00 readiness pack，M2 状态为 `ready_to_start_specs`。
- `packages/db` schema 变更为全局串行点；开工前必须确认无 open PR、无未合并本地分支，本分支从最新 `origin/main` 创建。
- SPK-01 Telegram Business 仍未关闭；本 PR 不新增 `business_connection` 或任何 Business-specific schema。
- ADR-003 仍阻断真实客户消息进入第三方 LLM；本 PR 不消费真实客户数据、Telegram payloads、截图、语音或订单样本。

## 实施步骤

1. 新增 focused failing test `scripts/tests/m2-channel-conversation-foundation.test.mjs`，覆盖 Prisma model/table mapping、SQL migration/RLS/grants、DB contract exports 和 contracts 文档入口。
2. 运行 `node --test scripts/tests/m2-channel-conversation-foundation.test.mjs`，记录 RED failure。
3. 在 Prisma schema 中新增最小 channel/conversation/message/ticket models 与 enum/status values；不新增 Business/customer/customer asset/order/distill/LLM schema。
4. 新增 SQL migration `0003_channel_conversation_ticket_foundation.sql`，为所有 tenant-scoped 表增加 `org_id`、`tenant_id`、tenant FK、RLS force、fail-closed select/insert/update policy 和 least necessary runtime grants；不得授予 delete。
5. 在 `packages/db/src/index.ts` 暴露稳定表名、enum/status values、conversation/message/ticket 纯 contract builders/validators，保持文件在 ESLint line budget 内。
6. 更新 `docs/contracts/README.md` 与 M2 evidence manifest，记录边界、验证命令和未关闭项。
7. 运行 focused GREEN 与 full validation，完成 spec compliance review 与 code quality review。

## 通过条件

- RED evidence 已记录：focused test 在实现前失败，失败原因是 M2 schema/contracts/migration 缺失。
- GREEN：`node --test scripts/tests/m2-channel-conversation-foundation.test.mjs` 通过。
- `npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run test`、`npm run guard:doc-triggers`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-01-channel-conversation-db-contracts-foundation.md` 通过。
- `npm exec --workspace @uzmax/db -- prisma validate --schema prisma/schema.prisma` 可用时通过；若因环境失败，记录精确原因与可用 fallback。
- 所有新增 tenant-scoped table 均带 `org_id`、`tenant_id`、tenant FK、force RLS、缺失 `app.org_id` / `app.tenant_id` fail closed。
- runtime role 只有 select/insert/update，无 delete；本 PR 不提交 raw payload/customer data，不触碰未列路径。

## 失败分支

- 若 schema/RLS 设计需要 customer/customer asset tables：M2-01 只保留 conversation participant/external reference，客户资产链接拆到 M4。
- 若 Bot webhook/API/admin/worker/WS 必须同步实现才能验证：停止并保留 schema/contracts foundation，运行时能力拆到后续 M2 specs。
- 若 Business-specific 字段或表不可避免：停止，等待 SPK-01/ADR-B01；本 PR 不声明 Business feasibility。
- 若 `packages/db/src/index.ts` 无法在 line budget 内容纳 contract helper：先收紧本文件既有局部结构；仍无法满足时停止并请 owner 确认是否允许新增 source 文件和更新 spec。
- 若 RLS/grants 无法 fail closed：不得合并，拆更小 DB security PR。

## 不做什么

- 不实现 Telegram Bot webhook runtime、Business feasibility/adapter/schema、conversation/handoff/ticket API、admin UI、worker queues、WS、LLM、prompt、model route、customer asset center、order/customer assets、distill 或 production traffic。
- 不新增 `business_connection`、`customer`、`customer_identity`、custom field/tag/order/quote/knowledge/eval/distill schema。
- 不提交 raw/export/jsonl/csv、客户明文、Telegram payloads、screenshots、voice transcripts、订单号、电话、地址、支付信息或客服个人账号。
- 不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M2-01 status | Future closure path |
|---|---|---|
| C-01 | foundation_queued_not_closed | M2-02 Bot ingress/dedupe/queue uses `channel_connection` and `telegram_update_dedupe` |
| C-02 | foundation_queued_not_closed | M2-02 Bot edge handling records unreachable/unsupported outcomes |
| C-06 | foundation_queued_not_closed | M2-03 handoff/API state machine and in-flight cancel behavior |
| D-01 | foundation_queued_not_closed | M2-04 admin conversation filters/states on top of API/contracts |
| D-02 | foundation_queued_not_closed | M2-03 handoff/ticket creation API and summary/SLA/notification behavior |
| D-03 | foundation_queued_not_closed | M2-03/M2-04 ticket claim/lock/note/escalate/close/reopen workflows |
| I-04 | foundation_queued_not_closed | M2-05 WS/realtime or degraded polling evidence |
| J-05 | foundation_updated | M2-01 evidence records milestone contract foundation; closeout remains later |
| K-03 | active | One spec / one PR |
| K-04 | active | `packages/db` schema remains serial; future overlapping specs must wait |

M2-01 does not close C-01/C-02/C-06/D-01/D-02/D-03/I-04 by itself. It only provides foundation for later specs and does not change production readiness.
