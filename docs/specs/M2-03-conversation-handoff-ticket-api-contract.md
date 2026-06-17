# M2-03 Conversation Handoff Ticket API Contract

## 目标

建立 M2 对话 / 接管 / 工单的最小 API contract 与纯 runtime baseline：按 tenant access context 返回 conversation list/detail shell；从 conversation 生成 handoff ticket contract；提供 claim/lock/note/escalate/close/reopen 状态机；人工接管后将 conversation 标记为待人工/AI suspended，并把在途 AI 消息标记为 `withdrawn` 或 `pending_cancel`，不得发送。

本 PR 只提供 in-memory repository/service 和 Nest API contract shell，供后续 admin shell、真实 DB repository、WS/realtime 和 worker 串接。不实现 admin UI、WebSocket、real Redis/BullMQ、real DB repository、LLM、Telegram Business、outbound sending、生产部署或真实客户流量。

## 项目 owner 确认点与 AI agent 执行/复核责任

Owner：确认 M2-03 只合并 conversation/handoff/ticket API contract baseline，不代表 D-01/D-02/D-03/C-06 完整关闭、后台可用、生产 ready、真实客户流量、customer LLM、GA-0 或 M2 closeout。

AI agent：执行 spec、TDD RED/GREEN、最小 contract/runtime 实现、contracts 文档与 evidence 更新；复核触碰模块、PR Hygiene、无 DB schema 变更、无 admin/worker/engine/channels 触碰、无 raw customer data、无 LLM SLA/报价/订单状态判断、无测试弱化，并在 PR 中暴露未完成项。

## 时间盒

0.5 个工作日。若最小 in-memory contract/service/API shell 无法在预算内通过 focused test 与本地 validation，则关闭本分支或拆小；不得夹带 DB repository、admin UI、WS、worker、LLM 或真实队列继续推进。

## Spec 类型

feature

## 触碰模块/文件

- `docs/specs/M2-03-conversation-handoff-ticket-api-contract.md`
- `docs/evidence/M2/M2-03-conversation-handoff-ticket-api-contract.md`
- `docs/contracts/README.md`
- `apps/api/scripts/runtime-compiler.mjs`
- `apps/api/src/app.module.ts`
- `apps/api/src/conversation-ticket.ts`
- `packages/capabilities/handoff/src/index.ts`
- `scripts/tests/m2-conversation-ticket-api-contract.test.mjs`

说明/备注：

本 PR 只允许上述文件。未列出的模块默认不可改，尤其不得触碰 `packages/db/**`、`apps/admin/**`、`apps/worker/**`、`packages/engine/**`、`packages/channels/**`、`package-lock.json`、configs、generated files、migrations、raw payload/customer sample files。

## 变更预算与路径分类

- source 预算：changed source files <= 4、net source LOC <= 600、new source files <= 1。
- path categories：docs = spec/contracts/evidence；source = `apps/api/scripts/runtime-compiler.mjs`、`apps/api/src/app.module.ts`、`apps/api/src/conversation-ticket.ts`、`packages/capabilities/handoff/src/index.ts`；test = `scripts/tests/m2-conversation-ticket-api-contract.test.mjs`；generated = none；lock = none；config = none。
- 新增 source 文件前的 `rg` 搜索结论和归属理由：已检索 `ConversationTicket`、`conversation-ticket`、`TicketAction`、`handoff`、`ticket`、`conversation`；当前只有 M2-00/M2-01/M2-02 specs/evidence/contracts、DB contract tests、Telegram Bot shell 和 `packages/capabilities/handoff` 占位引用，没有可扩展的 conversation/ticket API runtime。`apps/api/src/conversation-ticket.ts` 是允许路径内的最小 API contract shell 归属；`packages/capabilities/handoff/src/index.ts` 是允许路径内的纯 handoff/ticket 状态机归属。
- 外部 API/SDK/provider/connector/adapter 依据：none，本 PR 不新增外部 API/provider/connector/adapter，不调用 LLM，不声明 Telegram Business feasibility。
- 是否需要例外：none。

## 文档触发检查

updated

## 前置条件

- 当前 `main` 已合并 M2-00 readiness pack、M2-01 DB/contracts foundation 和 M2-02 Bot ingress contract。
- 本分支必须从最新 `origin/main` 创建，且开工前完成 `git fetch --prune origin`、`git status --short --branch`、`git branch --no-merged main`、`gh pr list --state open --json number,title,headRefName,url`。
- M2-01 已提供 conversation/ticket DB contract status values；本 PR 不修改 `packages/db/**`，真实 repository 属后续 work。
- ADR-003 仍阻断真实客户消息进入第三方 LLM；本 PR 不消费真实客户数据、raw Telegram payload、截图、语音转写、订单号、电话、地址或支付信息。
- SPK-01 已在 main 合并；本 PR 仍不新增 Business adapter、feature flag、草稿发送或新的可行性结论。

## 实施步骤

1. 新增 focused failing test `scripts/tests/m2-conversation-ticket-api-contract.test.mjs`，覆盖 conversation list/detail access scope、handoff ticket creation、ticket actions state machine、lock 防线、AI suspended/in-flight cancel 语义、API shell 注册与 contracts 文档入口。
2. 运行 `node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs`，记录 RED failure。
3. 在 `packages/capabilities/handoff/src/index.ts` 实现纯 helper/types：summary/suggested action/SLA contract field、ticket action state machine、lock ownership 检查、handoff request 对 conversation 与 in-flight AI message 的状态转换。
4. 在 `apps/api/src/conversation-ticket.ts` 实现最小 in-memory repository/service/controller contract：conversation list/detail 按 `AccessContext.selectedTenantId` scope 过滤；filters/status values 对齐 M2-01；controller 使用 access-context guard/permission metadata shell；默认 provider 只用于 local contract evidence。
5. 更新 `apps/api/src/app.module.ts` 注册 conversation/ticket controller 和 in-memory provider，不声明真实 DB/WS/queue ready。
6. 更新 `apps/api/scripts/runtime-compiler.mjs`，让既有 Nest boot smoke 能加载新增 API contract shell；不改变生产依赖或真实 repository。
7. 更新 `docs/contracts/README.md` 与 M2 evidence manifest，记录 contract、TDD、validation、未关闭项和 no external API evidence。
8. 运行 focused GREEN 与 full validation，完成 spec compliance review 与 code quality review。

## 通过条件

- RED evidence 已记录：focused test 在实现前失败，失败原因是 M2-03 conversation/ticket API runtime/contracts 缺失。
- GREEN：`node --test scripts/tests/m2-conversation-ticket-api-contract.test.mjs` 通过。
- `npm run format:check`、`npm run typecheck`、`npm run lint`、`npm run depcruise`、`npm run jscpd`、`npm run knip`、`npm run test`、`npm run guard:doc-triggers`、`npm run guard:pr-shape -- --base origin/main --spec docs/specs/M2-03-conversation-handoff-ticket-api-contract.md`、`npm run build` 通过；若 `npm run check` 更合适也可额外运行。
- Conversation list/detail contract 只返回当前 `AccessContext.selectedTenantId` 可见数据；不信任请求体中的 tenant 覆盖。
- Conversation filters/status values 对齐 M2-01 DB contract，覆盖 `open`、`pending_handoff`、`handoff`、`closed` 和 unread/unanswered/SLA risk filters。
- Handoff/ticket create contract 包含 summary、suggested action 与 SLA policy/config placeholder 字段；SLA 不由 LLM 或代码做客户承诺，报价/订单状态不由 LLM 判断。
- Ticket actions contract 覆盖 claim/lock/note/escalate/close/reopen；多人抢答时 lock ownership 冲突必须 fail closed，包括 locked ticket 的 reopen；API 边界必须使用 `AccessContext.userId` 作为 action actor，不能信任 body `actorUserId`；未知或缺失 action `type` 必须 fail closed，不能落到 reopen。
- 人工接管后 conversation 标记 `pending_handoff`/AI suspended；在途 AI message 只能标记 `withdrawn` 或 `pending_cancel`，不得进入发送状态。
- 本 PR 不触碰 DB schema/migrations、admin、worker、engine、channels、lockfile、configs、generated files 或 raw payload/customer samples。

## 失败分支

- 若 conversation/ticket API 必须依赖真实 DB 才能验证 access scope：保留 in-memory contract 与 tests，真实 repository 拆到后续 M2 spec；不得修改 `packages/db/**`。
- 若 ticket action 需要 presence 路由或通知系统：只保留 suggested action / routing placeholder contract，presence/notification 拆后续 spec。
- 若 SLA 需要业务配置结构或正式计时规则：只暴露 policy/config reference 字段，具体 SLA calculation/config version 拆后续配置 spec；不得由 LLM 或硬编码业务承诺补齐。
- 若 in-flight AI cancel 需要 engine/worker 改动：只定义可验证 contract result，engine/worker consumer 拆后续 spec；不得触碰 `packages/engine/**` 或 `apps/worker/**`。
- 若 Business-specific 语义不可避免：停止，拆到基于 SPK-01/ADR-B01 的后续 spec；本 PR 不声明 Business feasibility。

## 不做什么

- 不实现 admin UI、WebSocket/realtime、real Redis/BullMQ、real DB repository、Prisma schema/migration、LLM、prompt、model route、Telegram Business、outbound sending、engine/worker consumer、生产部署、GA-0 或真实客户流量。
- 不修改 `packages/db/**`、`apps/admin/**`、`apps/worker/**`、`packages/engine/**`、`packages/channels/**`、`package-lock.json`、configs 或 generated files。
- 不提交 raw/export/jsonl/csv、客户明文、Telegram payload files、screenshots、voice transcripts、订单号、电话、地址、支付信息或客服个人账号。
- 不让 LLM 做报价、SLA、成本、订单状态判断；不删除测试、不降低断言、不添加 `.skip` / `.only` / `xit` / `xfail`，不扩大 mock 或快照。

## 验收映射

| Item | M2-03 status | Future closure path |
|---|---|---|
| C-06 | contract_partial_evidence | API/handoff contract marks in-flight AI messages withdrawn/pending_cancel; concurrent engine/worker integration remains later |
| D-01 | contract_partial_evidence | Conversation list/detail filters and states exist at API contract level; admin UI/E2E remains M2-04 |
| D-02 | contract_partial_evidence | Handoff creates ticket summary/suggested action/SLA contract placeholder; notification and real repository remain later |
| D-03 | contract_partial_evidence | Ticket claim/lock/note/escalate/close/reopen state machine exists; multi-account E2E/admin workflow remains M2-04 |
| I-04 | not_closed | WS/realtime or degraded polling evidence remains M2-05 |
| J-05 | active | M2-03 evidence records milestone acceptance progress without M6 pile-up |
| K-03 | active | One spec / one PR |
| K-04 | active | Touch list is explicit; DB schema remains untouched and serial for future DB work |

M2-03 does not fully close C-06/D-01/D-02/D-03/I-04 by itself. It only provides contract/runtime baseline for later specs and does not change production readiness.
